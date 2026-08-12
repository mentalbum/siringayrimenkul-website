import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  adaDisplayLabel,
  adaRouteKey,
  getAllMahalleler,
  getMahalleBySlug,
  getSiteBoundary,
  getSiteBySlug,
  getSitelerByMahalle,
  isimBirdenCokMahallede,
  mahalleKisaIsim,
} from "@/lib/content";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { CtaButton } from "@/components/ui/button";
import { CtaBanner } from "@/components/ui/cta-banner";
import { TrackedCtaLink } from "@/components/ui/tracked-cta-link";
import { FaqSection } from "@/components/ui/faq-section";
import { MahalleMapLoader } from "@/components/maps/mahalle-map-loader";
import { ResourceHints } from "@/components/seo/resource-hints";
import { SiteCard } from "@/components/site/site-card";
import { Reveal } from "@/components/ui/reveal";
import { ArrowRightIcon } from "@/components/ui/icons";
import { getSiteFaq } from "@/lib/faq";
import { getBlogPostBySlug } from "@/lib/content";
import { truncateForMeta } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";
import { OZGUN_ID } from "@/lib/structured-data";
import { eryamandaMi, yerEtiketi } from "@/lib/bolge";
import { cikarKunye, kunyeCumlesi } from "@/lib/kunye";
import { inferSiteTipi } from "@/lib/site-tipi";
import { onayliEtap } from "@/lib/etap-onayli";
import { taramaOncelikliSlugs } from "@/lib/tarama-oncelikli";
import siteOlgulari from "@/lib/site-olgulari.json";
import benzerAdlar from "@/lib/benzer-adlar.json";
import { bulunmaHali, bulunmaHaliKi, tamlayanHali } from "@/lib/turkce";

// Komşu sayfalara ÇEŞİTLENMİŞ anchor kalıpları: hedef sayfa her yerden aynı
// "site adı" metniyle değil, farklı arama kalıplarıyla bağ alsın (Zyppy 23M iç
// bağlantı çalışması — anchor çeşitliliği trafikle korele; 1. sıra araştırması
// A2, defter 2026-07-31). Kalıp seçimi sayfa slug'ına göre kayar ki aynı komşu
// her sayfadan aynı kalıbı almasın.
// Kalıplar EV SAHİBİ niyetinde (2026-08-07): eski "satılık daire" / "kiralık
// daire" bağ metinleri ALICI dilindeydi ve Google başlık türetirken bunları da
// kullanıyor — kişiselleştirmesiz SERP'te site sayfalarının başlığı "X Satılık
// Daire ve Kiralık Daire" biçiminde yeniden yazılmış görünüyordu; telefon eden
// müşteriler de "sitede satılık var mı" diye soruyordu. Gelen bağ metni artık
// hedef kitlenin (evini satacak/kiraya verecek sahip) diliyle örtüşüyor.
const ANCHOR_KALIPLARI: ((ad: string) => string)[] = [
  (ad) => `${bulunmaHali(ad)} ev satmak`,
  (ad) => `${bulunmaHali(ad)} evinizi kiraya vermek`,
  (ad) => `${ad} emlakçısı`,
  (ad) => `${bulunmaHali(ad)} emlak danışmanlığı`,
  (ad) => `${bulunmaHali(ad)} daire değerleme`,
  (ad) => `${tamlayanHali(ad)} güncel piyasası`,
];

type Props = {
  params: Promise<{ mahalle: string; site: string }>;
};

export function generateStaticParams() {
  return getAllMahalleler().flatMap((mahalle) =>
    getSitelerByMahalle(mahalle.slug).map((site) => ({
      mahalle: mahalle.slug,
      site: site.slug,
    }))
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { mahalle: mahalleSlug, site: siteSlug } = await params;
  const mahalle = getMahalleBySlug(mahalleSlug);
  const site = getSiteBySlug(mahalleSlug, siteSlug);
  if (!mahalle || !site) return {};

  // The money query is "{site adı} eryaman emlakçı" — make sure all three
  // terms live in the title (without doubling "Eryaman" for site names that
  // already contain it, e.g. "Bahçen Eryaman Konutları").
  // Asıl hedef kitle bu sitede EVİ OLANLAR: "{site} satılık daire",
  // "{site} daire fiyatları", "evimi satmak/kiraya vermek" niyetli aramalar.
  const isimdeEryamanVar = /eryaman/i.test(site.isim);
  // Kaydın kendi metinlerinden çıkarılmış description olgu cümlesi (varsa).
  const siteOlgu = (siteOlgulari as Record<string, string>)[`${mahalle.slug}/${site.slug}`];
  // Ata/Susuz/Cumhuriyet Yenimahalle'dedir — Eryaman'da DEĞİL. O mahallelerdeki
  // sitelere "Eryaman <site adı>" demek yanlış konum iddiasıdır (lib/bolge.ts).
  const eryamanda = eryamandaMi(mahalle);
  // Ev sahibinin gerçek arama kalıpları ("X satılık daire", "X kiralık daire",
  // "X daire fiyatları", "X emlakçı") başlıkta birebir karşılansın; açıklama
  // fiyat/değer vaadi + hız taahhüdüyle tıklamaya davet etsin.
  return {
    // Hedef sorgu biçimi Özgün'ün kararıyla (2026-07-31) YALIN ve BAŞTA:
    // insanlar "aktürk sitesi emlakçı" diye arıyor — tam dizi başlığın ilk
    // kelimeleri. Bölge soneki coğrafi ayrıştırma için (mahalle şablonuyla
    // aynı desen); adında Eryaman geçen sitelerde tekrarlanmaz.
    // Aynı ad birden çok mahallede varsa (Kardelen 4 mahallede!) özdeş başlık
    // Google'ın sayfaları tek sonuca katlamasına yol açıyordu — sonek mahalleyle
    // açılır: "… | Göksu Eryaman" (lib/content.ts isimBirdenCokMahallede).
    // Başlıktaki ticari mesaj EV SAHİBİNE seslenir (Özgün kararı, 2026-08-01).
    // Ölçülen gerçek: siteye gelip telefon eden son 10 kişinin hepsi "sizde
    // satılık/kiralık var mı" diye sordu — yani başlıktaki "Satılık ve Kiralık
    // Daire" ifadesi ALICI çekiyordu, oysa hedef kitle evini emlakçı
    // aracılığıyla satmak/kiraya vermek isteyen ev sahibi.
    // Kaybedilen bir şey yok: "X Sitesi satılık daire" sorgularında zaten 4-6.
    // sıradayız (portalların arkasında), ev sahibi sorgularında ("evimi satmak
    // istiyorum eryaman emlakçı", "eryaman emlakçı") zaten 1. sıradayız.
    // Rakiplerin hiçbiri ev sahibine seslenmiyor — bu başlık tek başına
    // farklılaştırıyor. Yeni başlık eskisinden de kısa (80 → 68 karakter).
    // ABSOLUTE: kök şablonun "| Şirin Gayrimenkul" eki site sayfalarında
    // eklenmez (2026-08-07). Ekle birlikte başlık 85-95 karaktere çıkıyordu ve
    // Google uzun başlıkları YENİDEN YAZIYOR — kişiselleştirmesiz SERP'te site
    // sayfaları "Eryaman X Sitesi Satılık Daire ve Kiralık Daire — Emlakçısı"
    // gibi ALICI dilinde uydurma başlıklarla görünüyordu (Özgün'ün müşteri
    // gözlemiyle birebir: arayanlar "sitede satılık var mı" diye soruyor).
    // Marka görünümde kaybolmuyor: WebSite şeması sayesinde Google, site adını
    // başlığın üstünde ayrıca gösteriyor.
    // LOKASYON İKİNCİ BÖLÜMDE (2026-08-08). Önceki sıralamada lokasyon
    // ÜÇÜNCÜ bölümdeydi ve tam da kesilen yere düşüyordu: ölçülen başlıklar
    // "Panorama Garden Emlakçı | Evinizi Satalım, Kiraya Verelim | Ata
    // Mahallesi" = 73, "Admira Göksu Konutları … | Eryaman" = 74 karakter,
    // Google ise ~60 karakterde kesiyor. Yani coğrafi nitelik hiçbir SERP'te
    // görünmüyordu. Rakip eryaman.bilgiemlak'ın başlığı 44 karakter ve
    // "Eryaman" HER sonuçta görünüyor — sayfa düzeyinde tespit edilen tek
    // üstünlüğü buydu (2026-08-08 rakip analizi; onlarda meta description,
    // canonical, og etiketi, schema, sitemap yok).
    // Aynı gerekçe ana sayfada 08.08'de zaten uygulanmıştı (69→48 karakter).
    // Ticari mesaj korunuyor, yalnızca sıra değişiyor: uzun adlarda kesilen
    // kısım artık lokasyon değil boilerplate oluyor.
    // Bölge ayrımı AYNEN duruyor: Ata/Susuz/Cumhuriyet'te "Eryaman" değil
    // mahalle adı basılır (lib/bolge.ts, Yenimahalle kolu).
    title: {
      absolute: isimdeEryamanVar
        ? `${site.isim} Emlakçı | Evinizi Satalım, Kiraya Verelim`
        : eryamanda
          ? isimBirdenCokMahallede(site.isim)
            ? // Eryaman Mahallesi'nin kısa adı zaten "Eryaman" — sonek "Eryaman
              // Eryaman" olmasın (canlı denetimde yakalandı: Bahar, Cumhuriyet,
              // Çiğdem sitelerinin Eryaman Mahallesi kayıtları).
              `${site.isim} Emlakçı | ${
                mahalleKisaIsim(mahalle) === "Eryaman"
                  ? "Eryaman Mahallesi"
                  : `${mahalleKisaIsim(mahalle)} Eryaman`
              } | Evinizi Satalım, Kiraya Verelim`
            : `${site.isim} Emlakçı | Eryaman | Evinizi Satalım, Kiraya Verelim`
          : `${site.isim} Emlakçı | ${mahalle.isim} | Evinizi Satalım, Kiraya Verelim`,
    },
    // Güven öğesi (yetki belge no) snippet'te: SERP'te 1. sıradaki portal
    // listelerinden farklılaşma — arayan "emlakçı" arıyor, ilan listesi değil
    // (1. sıra araştırması A1, defter 2026-07-31).
    // SİTE-ÖZEL OLGU CÜMLESİ (2026-08-12): jenerik kalıbın önüne, kaydın kendi
    // metinlerinden çıkarılmış tek olgu cümlesi girer (lib/site-olgulari.json;
    // çıkarma+denetim iki aşamalı ajan turuyla yapıldı, uydurma yok). Amaç
    // 12.08 analizindeki TO açığı: sıfır-tık yüksek-gösterim kayıtların ortak
    // kökü jenerik snippet'ti. Satış VE kiralama niyeti birlikte anılır
    // (Özgün 12.08: kiraya verecek ev sahibi de hedef). Olgu yoksa eski kalıp.
    // Telefon TTBS'den ÖNCE: 155 karakterlik kesme kuyruğu düşürürse önce
    // rozet gitsin, ulaşım kanalı (Özgün'ün 12.08 hedefi) hep görünür kalsın.
    description: truncateForMeta(
      siteOlgu
        ? `${siteOlgu} ${isimBirdenCokMahallede(site.isim) ? `${mahalleKisaIsim(mahalle)} ` : ""}${bulunmaHali(site.isim)} eviniz mi var? Satışı ve kiralaması için: ${siteConfig.phoneDisplay} (TTBS No ${siteConfig.yetkiBelgeNo}).`
        : `${isimBirdenCokMahallede(site.isim) ? `${mahalleKisaIsim(mahalle)} ` : ""}${bulunmaHali(site.isim)} eviniz mi var? Satışını da kiralamasını da siteyi blok blok tanıyan yetki belgeli emlakçınız yürütsün: ${siteConfig.phoneDisplay} (TTBS No ${siteConfig.yetkiBelgeNo}).`
    ),
    alternates: { canonical: `/mahalleler/${mahalle.slug}/${site.slug}` },
    ...(site.alternatifAdlar?.length && {
      keywords: [
        site.isim,
        ...site.alternatifAdlar,
        `${mahalle.isim} emlakçı`,
        eryamanda ? "Eryaman emlakçı" : `${mahalle.ilce} emlakçı`,
      ],
    }),
    // Paylaşım kartı bilinçli olarak site fotoğrafına DEĞİL, opengraph-image.tsx'in
    // ürettiği markalı 1200x630 karta bırakıldı. Bina fotoğrafları 4:3; OG'nin
    // beklediği 1.91:1'e kırpılınca yapının üstü ya da altı gidiyor ve
    // og:image:width/height/type etiketleri de düşüyor. Fotoğraf sayfa içinde ve
    // JSON-LD'de kullanılır — orada tam boy görünür.
  };
}

export default async function SitePage({ params }: Props) {
  const { mahalle: mahalleSlug, site: siteSlug } = await params;
  const mahalle = getMahalleBySlug(mahalleSlug);
  const site = getSiteBySlug(mahalleSlug, siteSlug);
  if (!mahalle || !site) notFound();

  const mahalleSiteleri = getSitelerByMahalle(mahalleSlug);
  // Komşu siteler: 6 kartın 2'si "atlama" (mahalle sıralamasında altın-oran
  // adımı), 4'ü coğrafi en yakın. Salt en-yakın seçim merkezî siteleri
  // kayırıyordu — kenardaki sitelere gelen bağ 3'e düşüyor, merkezde 20'ye
  // çıkıyordu (grafta ölçüldü). Atlama bağları her siteye tam 2 garanti gelen
  // bağ verir (i−adım ve i−2·adım'daki sayfalardan), grafın çapını küçültür ve
  // PageRank'i tabana yayar (expander graf). Ziyaretçi yine aynı mahalleden
  // 6 site kartı görür; kartlarda mesafe yazmadığı için karışım görünmez.
  const digerSiteSayisi = Math.min(6, mahalleSiteleri.length - 1);
  const siteIndex = mahalleSiteleri.findIndex((item) => item.slug === site.slug);
  const halkaSiteler =
    siteIndex === -1
      ? mahalleSiteleri.filter((item) => item.slug !== site.slug).slice(0, digerSiteSayisi)
      : Array.from(
          { length: digerSiteSayisi },
          (_, i) => mahalleSiteleri[(siteIndex + 1 + i) % mahalleSiteleri.length]
        );
  const adim = Math.max(1, Math.round(mahalleSiteleri.length * 0.382));
  const atlamaSiteler =
    siteIndex === -1
      ? []
      : [...new Set([1, 2].map((k) => (siteIndex + k * adim) % mahalleSiteleri.length))]
          .filter((i) => i !== siteIndex)
          .map((i) => mahalleSiteleri[i]);
  const merkez = site.koordinat;
  // Kartlardan biri, bu mahallede Google dizinine HENÜZ GİRMEMİŞ bir sayfaya
  // ayrılır (lib/tarama-oncelikli.ts). Ölçülen teşhis: o sayfaların sorunu
  // keşif değil tarama bütçesi — sitemap'te ve graftalar ama Google sırayı
  // onlara getirmiyor. Search Console'un elle indeksleme isteği bu darboğazı
  // 24 saatte açıyordu; mülke erişim şu an yok, kotasız kaldıraç iç bağ
  // yoğunluğu. Mahalledeki her site sayfası dizinsiz komşusuna bağ verince
  // o sayfanın aldığı iç bağ sayısı katlanıyor (Cumhuriyet'te 70 sayfa tek
  // bir dizinsiz sayfaya, Şehit Osman Avcı'da 68 sayfa altı sayfaya).
  // Sayfa dizine girdiğinde listeden çıkarılmalı.
  const oncelikliSlugs = taramaOncelikliSlugs(mahalleSlug);
  const oncelikliKomsu = (() => {
    const adaylar = mahalleSiteleri.filter(
      (item) => item.slug !== site.slug && oncelikliSlugs.includes(item.slug)
    );
    if (!adaylar.length) return undefined;
    // Aynı sayfa her komşudan aynı adayı almasın: slug'a göre dönüşümlü seç,
    // böylece birden çok dizinsiz sayfa varsa bağ bütçesi aralarında paylaşılır.
    const kaydirma = site.slug.split("").reduce((t, c) => t + c.charCodeAt(0), 0);
    return adaylar[kaydirma % adaylar.length];
  })();
  const digerSiteler = (() => {
    const secim = oncelikliKomsu ? [oncelikliKomsu, ...atlamaSiteler] : [...atlamaSiteler];
    const ekle = (aday: (typeof mahalleSiteleri)[number]) => {
      if (secim.length < digerSiteSayisi && !secim.some((item) => item.slug === aday.slug))
        secim.push(aday);
    };
    if (merkez) {
      const uzaklikKare = (k: { lat: number; lng: number }) => {
        const dLat = k.lat - merkez.lat;
        const dLng = (k.lng - merkez.lng) * Math.cos((merkez.lat * Math.PI) / 180);
        return dLat * dLat + dLng * dLng;
      };
      for (const aday of mahalleSiteleri
        .filter((item) => item.slug !== site.slug && item.koordinat)
        .sort((a, b) => uzaklikKare(a.koordinat!) - uzaklikKare(b.koordinat!)))
        ekle(aday);
    }
    // Koordinatsız sitede (veya koordinatlı komşu azsa) halkadan tamamla.
    for (const aday of halkaSiteler) ekle(aday);
    return secim;
  })();
  const sinir = getSiteBoundary(site);
  const tipi = inferSiteTipi(site.isim);
  const kunye = cikarKunye(site);
  const dogrulanmisEtap = onayliEtap(site.adalar);
  // Ata/Susuz/Cumhuriyet Yenimahalle'dedir; o mahallelerdeki sitelere "Eryaman"
  // demek yanlış konum iddiası olur (lib/bolge.ts).
  const eryamanda = eryamandaMi(mahalle);

  // Benzer adlı FARKLI yerleşimler (lib/benzer-adlar.json — elle doğrulanmış
  // 10 grup). Bu sayfayla aynı gruptaki diğer kayıtlar başlık altında bağlanır.
  const benzerGrup = (benzerAdlar.gruplar as { m: string; s: string }[][]).find((g) =>
    g.some((x) => x.m === mahalle.slug && x.s === site.slug)
  );
  const benzerler = (benzerGrup ?? [])
    .filter((x) => !(x.m === mahalle.slug && x.s === site.slug))
    .flatMap((x) => {
      const bMahalle = getMahalleBySlug(x.m);
      const bSite = getSiteBySlug(x.m, x.s);
      return bMahalle && bSite
        ? [{ mahalleSlug: x.m, slug: x.s, isim: bSite.isim, mahalleIsim: bMahalle.isim }]
        : [];
    });

  // 720 sayfada birebir aynı kalıp "ölçeklendirilmiş içerik" görünümü veriyordu
  // (E-E-A-T denetimi, 2026-07-29). Varyant seçimi DETERMİNİSTİK (slug'dan) —
  // her build'de aynı sayfa aynı metni alır, yapay tazelenme olmaz.
  const varyant = Array.from(site.slug).reduce((t, ch) => t + ch.charCodeAt(0), 0);
  // Dört varyantın DÖRDÜNDE de "emlakçı" kelimesi geçer: "X sitesi emlakçı"
  // sorgusunda 720 sayfanın tamamında kelime eşleşmesi garanti (2026-07-31
  // SERP taraması: bu sınıfta örneklem 12/12 ilk sayfadaydı; garanti kalıcı
  // olsun diye v2/v3'e de doğal biçimde eklendi).
  const girisVaadi = [
    `Bu sitede eviniz mi var? Satmak veya kiraya vermek istiyorsanız, ${site.isim} emlakçısı olarak size yardımcı oluyoruz.`,
    `Buradaki dairenizi satmayı ya da kiraya vermeyi düşünüyorsanız, siteyi yakından tanıyan emlakçınız olarak yanınızdayız.`,
    `Bu sitede daireniz varsa — satış da kiralama da olsa — süreci site emlakçınız olarak sizin adınıza biz yürütüyoruz.`,
    `${site.isim} içindeki daireniz için satış veya kiralama düşünüyorsanız, emlakçınız olarak ilk görüşmeden tapuya kadar yanınızdayız.`,
  ][varyant % 4];

  // İç bağ ölçümü (2026-07-29): 720 site sayfasından rehberlere 0 link vardı.
  // Havuzdan slug'a göre DETERMİNİSTİK seçim — her build aynı sonucu üretir.
  // 2026-08-07: genel konulu rehberler siteden kaldırıldı (blog sadece Eryaman);
  // havuzlar kalan Eryaman yazılarıyla dolduruldu. Havuz asla boş bırakılmamalı
  // (boş havuzda `% 0` NaN üretir).
  const SATIS_HAVUZU = [
    "eryamanda-ev-satis-sureci",
    "eryamanda-ev-fiyatlarini-ne-belirler",
    "eryaman-disinda-yasayanlar-icin-ev-satisi-kiralama",
  ];
  const KIRA_HAVUZU = [
    "eryamanda-kira-tespiti-dogru-kira-belirleme",
  ];
  const rehberler = [
    getBlogPostBySlug(SATIS_HAVUZU[varyant % SATIS_HAVUZU.length]),
    getBlogPostBySlug(KIRA_HAVUZU[(varyant + 2) % KIRA_HAVUZU.length]),
  ].filter((r): r is NonNullable<typeof r> => Boolean(r));
  // Hizmet sayfalarının İKİSİ de bağ alır (2026-08-08): önceki kurguda slug'a
  // göre yalnız biri listeleniyordu, yani her site sayfası iki hizmet
  // sayfasından birini dışarıda bırakıyordu — oysa bu sitede evi olan kişinin
  // hangi niyette olduğunu bilmiyoruz. Sıra ve çapa metni slug'a göre kayar:
  // 720 sayfada birebir aynı iki satır "ölçeklendirilmiş içerik" ayak izi
  // bırakır (aynı gerekçe: ANCHOR_KALIPLARI, lib/faq.ts semaDisi).
  // Yenimahalle kolunda (Ata/Susuz/Cumhuriyet) çapada "Eryaman" geçmez —
  // sitenin Eryaman'da olduğu izlenimi veren bir konum iddiası doğurur
  // (lib/bolge.ts).
  // Sıra ile çapa seçimi AYRI bitlerden okunur; ikisi de `varyant % 2` olsaydı
  // dört kombinasyon yerine iki kombinasyon üretilirdi.
  const hizmetCapa = Math.floor(varyant / 2) % 2;
  const satisBagi = {
    href: "/eryamanda-ev-satmak",
    etiket: eryamanda
      ? ["Eryaman'da ev satmak: süreç ve hizmetimiz", "Eryaman'da evinizi nasıl satıyoruz?"][
          hizmetCapa
        ]
      : ["Ev satış sürecimiz nasıl işliyor?", "Evinizi satarken neleri üstleniyoruz?"][hizmetCapa],
  };
  const kiraBagi = {
    href: "/eryamanda-ev-kiraya-vermek",
    etiket: eryamanda
      ? ["Eryaman'da evinizi kiraya vermek", "Eryaman'da kiraya verme sürecimiz"][hizmetCapa]
      : ["Evinizi kiraya verme sürecimiz", "Kiracı bulma ve eleme sürecimiz"][hizmetCapa],
  };
  const hizmetBaglari = varyant % 2 === 0 ? [satisBagi, kiraBagi] : [kiraBagi, satisBagi];
  // Mahalle sayfasına gövdeden bağ yoktu: breadcrumb dışındaki tek bağ,
  // koordinatsız sitelerde çıkan "haritayı görüntüle" düğmesiydi. Çapa üç
  // varyantta döner; ilki "<mahalle> emlakçı" sorgu ailesiyle örtüşür.
  const mahalleBagi = [
    `${mahalle.isim} emlakçı rehberimiz`,
    `${tamlayanHali(mahalle.isim)} diğer siteleri`,
    `${bulunmaHaliKi(mahalle.isim)} site ve rezidanslar`,
  ][varyant % 3];

  // "2026-07-28" -> "Temmuz 2026". Gecersiz/eksik tarihte hic gosterilmez.
  const dogrulamaTarihi = (() => {
    if (!site.zenginlestirildi) return null;
    const t = new Date(site.zenginlestirildi);
    if (Number.isNaN(t.getTime())) return null;
    return t.toLocaleDateString("tr-TR", { month: "long", year: "numeric" });
  })();

  // AI cevap motorlari ve Google icin tazelik sinyali: sayfanin kendisi bir
  // WebPage dugumu olarak dateModified tasir (ApartmentComplex'te bu alan yok).
  const webPageJsonLd = site.zenginlestirildi
    ? {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "@id": `${siteConfig.url}/mahalleler/${mahalle.slug}/${site.slug}`,
        url: `${siteConfig.url}/mahalleler/${mahalle.slug}/${site.slug}`,
        name: `${site.isim} — ${mahalle.isim}`,
        dateModified: site.zenginlestirildi,
        inLanguage: "tr-TR",
        // İçerikten sorumlu gerçek kişi — QRG 2.5.2 "kim sorumlu" sorusunun
        // yapılandırılmış cevabı. OZGUN_ID, hakkımızdaki Person düğümüne bağlanır.
        author: { "@id": OZGUN_ID },
        reviewedBy: { "@id": OZGUN_ID },
        // Sayfanın ASIL konusu aşağıdaki ApartmentComplex düğümü; bağ
        // kurulmadığında dateModified/author'ın neyi nitelediği belirsizdi.
        mainEntity: { "@id": `${siteConfig.url}/mahalleler/${mahalle.slug}/${site.slug}#site` },
      }
    : null;

  const siteJsonLd = {
    "@context": "https://schema.org",
    "@type": "ApartmentComplex",
    // @id: aşağıdaki WebPage düğümü mainEntity ile buraya bağlanır. İkisi
    // bağlanmadığında sayfanın tazelik (dateModified) ve yazar sinyalinin
    // HANGİ varlığa ait olduğu makine tarafında belirsiz kalıyordu; sitenin
    // geri kalanındaki @id disiplininin (ORG_ID/WEBSITE_ID/OZGUN_ID) bu
    // sayfada yarım kalmış hâliydi. Zengin sonuç kazancı yok — ApartmentComplex
    // Google'ın zengin sonuç galerisinde değil; kazanç varlık anlama ve yapay
    // zekâ asistanlarının doğru alıntılaması tarafında (2026-08-08).
    "@id": `${siteConfig.url}/mahalleler/${mahalle.slug}/${site.slug}#site`,
    name: site.isim,
    ...(site.alternatifAdlar?.length && { alternateName: site.alternatifAdlar }),
    description: site.aciklama,
    url: `${siteConfig.url}/mahalleler/${mahalle.slug}/${site.slug}`,
    // Görsel telif künyesi: Google, sahiplik bilgisini ya dosyaya gömülü
    // IPTC/XMP'den ya da buradaki ImageObject'ten okur. next/image sunum
    // sırasında gömülü meta veriyi sildiği için tek güvenilir kanal burası.
    // (license/acquireLicensePage bilerek yok — fotoğraf lisanslamıyoruz,
    // "licensable" rozeti istemiyoruz.)
    ...(site.gorsel && {
      image: {
        "@type": "ImageObject",
        url: `${siteConfig.url}${site.gorsel}`,
        contentUrl: `${siteConfig.url}${site.gorsel}`,
        caption: `${site.isim} — ${yerEtiketi(mahalle)}${eryamanda ? ` ${mahalle.isim}` : ""}`,
        creator: { "@type": "Organization", name: siteConfig.name },
        creditText: siteConfig.name,
        copyrightNotice: `© ${siteConfig.name}`,
      },
    }),
    ...(site.adres && {
      address: {
        "@type": "PostalAddress",
        streetAddress: site.adres,
        addressLocality: mahalle.ilce,
        addressRegion: "Ankara",
        addressCountry: "TR",
      },
    }),
    ...(site.koordinat && {
      geo: {
        "@type": "GeoCoordinates",
        latitude: site.koordinat.lat,
        longitude: site.koordinat.lng,
      },
    }),
    containedInPlace: {
      "@type": "Place",
      name: mahalle.isim,
      url: `${siteConfig.url}/mahalleler/${mahalle.slug}`,
      containedInPlace: {
        "@type": "Place",
        name: eryamanda
          ? `Eryaman, ${mahalle.ilce}, Ankara`
          : `${mahalle.ilce}, Ankara`,
      },
    },
    // Künyeden gelen iki alan (2026-08-08). Yeni veri toplanmadı: ikisi de
    // cikarKunye()'nin kayıt metninden deterministik olarak çıkardığı,
    // sayfada zaten görünen bilgiler. Metinde geçmiyorsa undefined kalır ve
    // alan hiç basılmaz — uydurma yok (bkz. lib/kunye.ts başlığı).
    // FİYAT/offers alanı BİLEREK YOK: sitede güncel piyasa fiyatı yazılmıyor.
    ...(kunye.konutSayisi && { numberOfAccommodationUnits: kunye.konutSayisi }),
    ...(kunye.donatilar.length && {
      amenityFeature: kunye.donatilar.map((d) => ({
        "@type": "LocationFeatureSpecification",
        name: d,
        value: true,
      })),
    }),
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <Breadcrumbs
        items={[
          { label: "Anasayfa", href: "/" },
          { label: "Mahalleler", href: "/mahalleler" },
          { label: mahalle.isim, href: `/mahalleler/${mahalle.slug}` },
          { label: site.isim, href: `/mahalleler/${mahalle.slug}/${site.slug}` },
        ]}
      />

      <header className="mt-4 max-w-3xl">
        {/* Etap etiketi yalnız RESMÎ ada listesiyle doğrulanmış etaplarda çıkar
            (lib/etap-onayli.ts). Kayıttaki adalar[].etap alanı iç gruplama
            verisidir ve tek başına iddia olarak yazılmaz. */}
        <p className="text-sm font-semibold uppercase tracking-wide text-gold-dark">
          {eryamanda ? "Eryaman · " : ""}
          {mahalle.isim} · {mahalle.ilce}
          {dogrulanmisEtap && (
            <>
              {" · "}
              <Link
                href={`/mahalleler/${mahalle.slug}/etaplar/${dogrulanmisEtap}`}
                className="cursor-pointer hover:underline"
              >
                {dogrulanmisEtap}. Etap
              </Link>
            </>
          )}
        </p>
        <h1 className="mt-2 text-3xl sm:text-4xl">{site.isim}</h1>
        {tipi && (
          <span className="mt-2 inline-flex items-center rounded-full bg-gold/15 px-2.5 py-1 text-xs font-semibold text-gold-dark">
            {tipi}
          </span>
        )}
        {site.adres && <p className="mt-2 text-sm text-muted">{site.adres}</p>}
        {/* BENZER ADLI YERLEŞİM çapraz bağı (2026-08-12): SERP ölçümlerinde bu
            adlar birbirinin yerine sıralanıyor (ör. "Doktorlar Sitesi" sorgusu
            Altay yerine Yavuz Selim kaydını getiriyordu). Yanlış kayda düşen
            ziyaretçi tek tıkla doğrusuna geçsin; Google'a da iki varlığın ayrı
            olduğu sinyali gitsin. Gruplar lib/benzer-adlar.json'da elle
            doğrulanmış; ad benzerliği zayıfsa eklenmez. */}
        {benzerler.length > 0 && (
          <p className="mt-3 text-sm text-muted">
            Benzer adlı yerleşim{benzerler.length > 1 ? "ler" : ""}:{" "}
            {benzerler.map((b, i) => (
              <span key={`${b.mahalleSlug}/${b.slug}`}>
                {i > 0 && ", "}
                <Link
                  href={`/mahalleler/${b.mahalleSlug}/${b.slug}`}
                  className="font-medium text-gold-dark underline-offset-2 hover:underline"
                >
                  {b.isim} — {b.mahalleIsim}
                </Link>
              </span>
            ))}
          </p>
        )}
      </header>

      <div className={`mt-6 grid gap-8 sm:mt-8 ${site.koordinat ? "lg:grid-cols-[1.1fr_1fr]" : ""}`}>
        <div className="space-y-4">
          {site.gorsel && (
            <figure className="overflow-hidden rounded-2xl border border-border">
              <Image
                src={site.gorsel}
                alt={`${site.isim} dış cephesi — ${yerEtiketi(mahalle)}${eryamanda ? ` ${mahalle.isim}` : ""}`}
                width={1440}
                height={1080}
                preload
                className="h-auto w-full object-cover"
                sizes="(min-width: 1024px) 590px, 100vw"
              />
              <figcaption className="border-t border-border bg-surface-muted px-4 py-2 text-xs text-muted">
                {`${site.isim} — ${mahalle.isim}${eryamanda ? ", Eryaman" : ""}${
                  dogrulanmisEtap ? ` ${dogrulanmisEtap}. Etap` : ""
                }`}
              </figcaption>
            </figure>
          )}
          {/* AEO "önce cevap" kalıbı (Özgün onayı, 2026-07-29): ilk cümle
              müşteriye telefonda verilecek cevap gibi — blok/kat/tapu önde.
              Uzmanlık kanıtı ev sahibine güven verir; yapay zekâ asistanları da
              "X sitesi nasıl?" cevabında ilk cümleyi alıntılar. Künye metinden
              çıkarılamadıysa eski genel kalıp aynen kalır. */}
          <p className="text-base font-medium text-navy">
            {`${
              kunyeCumlesi(site, kunye, mahalle.isim, eryamanda) ??
              `${site.isim}, ${eryamanda ? "Eryaman'da " : ""}${mahalle.isim} sınırları içinde yer alan ${
                tipi ? `${tipi} ` : ""
              }bir yerleşimdir.`
            } ${girisVaadi}`}
          </p>
          {/* Sayfadaki İLK tıklanabilir öğe ev sahibinin kapısı olsun. Daha önce
              burada sahibinden.com kutusu vardı ve ziyaretçiyi 0,4. ekranda
              siteden dışarı çıkarıyordu; ev sahibi CTA'sı ise 3. ekrandaydı.
              İlan arayan için bağlantı duruyor, sadece açıklamanın altına indi. */}
          <div className="flex flex-wrap items-center gap-3">
            <CtaButton
              href={`/ev-degerleme?mahalle=${mahalle.slug}&site=${site.slug}`}
              variant="primary"
            >
              Evinizi Değerlendirelim
            </CtaButton>
            <CtaButton href={`tel:${siteConfig.phoneTel}`} variant="outline">
              {siteConfig.phoneDisplay}
            </CtaButton>
          </div>
          {/* Niyet ayrımı (2026-07-29 denetimi): "satılık daire" sorgusuyla gelen
              İKİ niyet taşır — ev sahibi (birincil, CTA yukarıda ve DOM'da önce)
              ve daire arayan. Daire arayanın dürüst yolu artık ilk ekranda;
              Temmuz kararı (ilk tıklanabilir = ev sahibi CTA'sı) korunuyor. */}
          <p className="flex max-w-3xl flex-wrap items-center gap-x-2 gap-y-1 rounded-xl border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-body">
            <span>
              Daire mi arıyorsunuz? {site.isim} ve çevresindeki{" "}
              <strong className="text-navy">güncel ilanlarımız</strong>:
            </span>
            <TrackedCtaLink
              href={siteConfig.sahibindenUrl}
              gaEvent="site_ust_sahibinden"
              variant="ghost"
              className="px-0 font-semibold text-gold-dark"
            >
              sahibinden.com mağazamız →
            </TrackedCtaLink>
          </p>
          <p className="text-base leading-relaxed text-body">{site.aciklama}</p>
          {site.aciklama.includes("sözlüğümüzdeki kat irtifakı maddesinde") && (
            <p className="text-sm leading-relaxed text-muted">
              İlgili terim:{" "}
              <Link href="/sozluk#kat-irtifaki" className="font-semibold text-gold-dark hover:underline">
                kat irtifakı nedir?
              </Link>
            </p>
          )}
          {site.aciklama.includes("sözlüğümüzdeki rezidans tapusu maddesinde") && (
            <p className="text-sm leading-relaxed text-muted">
              İlgili terim:{" "}
              <Link href="/sozluk#rezidans-tapu" className="font-semibold text-gold-dark hover:underline">
                rezidans tapusu nedir?
              </Link>
            </p>
          )}
          <p className="text-sm leading-relaxed text-muted">{mahalle.kisaAciklama}</p>
          {site.ozellikler && site.ozellikler.length > 0 && (
            <ul className="grid grid-cols-2 gap-2 text-sm text-body">
              {site.ozellikler.map((ozellik) => (
                <li key={ozellik} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                  {ozellik}
                </li>
              ))}
            </ul>
          )}
          {site.adalar && site.adalar.length > 0 && (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {site.adalar.map((ada) => (
                <Link
                  key={adaRouteKey(ada)}
                  href={`/mahalleler/${mahalle.slug}/adalar/${adaRouteKey(ada)}`}
                  className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-sm text-navy transition-colors hover:border-gold hover:text-gold-dark"
                >
                  {adaDisplayLabel(ada)} Ada
                  {ada.blok ? ` (${ada.blok})` : ""}
                  <ArrowRightIcon className="h-3.5 w-3.5 shrink-0" />
                </Link>
              ))}
            </div>
          )}
          {dogrulamaTarihi && (
            // Veri kaynağı künyesi (ChatGPT istişaresi, 2026-08-07): "biz
            // biliyoruz" demek yerine kanıt göster — sayfadaki bilginin HANGİ
            // kaynaktan geldiğini açıkça söyleyen kutu hem ziyaretçide hem AI
            // sistemlerinde "birincil kaynak" güveni üretir. Yalnızca gerçekten
            // kullandığımız kaynaklar sayılır (TKGM + yerel kayıt/saha) —
            // kullanmadığımız bir merci eklenmez.
            <p className="text-xs leading-relaxed text-muted">
              Veri kaynağı: tapu bilgileri TKGM parsel sorgusuna, blok künyeleri
              yerel kayıtlara ve saha bilgisine dayanır. Son doğrulama:{" "}
              {dogrulamaTarihi} · Derleyen:{" "}
              <Link
                href="/hakkimizda#ozgun-sirin"
                className="font-medium text-gold-dark hover:underline"
              >
                Özgün Şirin
              </Link>{" "}
              (Yetki Belge No {siteConfig.yetkiBelgeNo})
            </p>
          )}
          {!site.koordinat && (
            <CtaButton href={`/mahalleler/${mahalle.slug}`} variant="outline">
              {mahalle.isim} Haritasını Görüntüle
            </CtaButton>
          )}
        </div>
        {site.koordinat && (
          <div className="flex flex-col gap-2">
            <ResourceHints />
            <div className="h-[320px] overflow-hidden rounded-2xl border border-border lg:h-full">
              <MahalleMapLoader
                center={site.koordinat}
                siteler={[{ site, boundary: sinir }]}
                parseleOdakla
              />
            </div>
            {sinir && (
              <p className="text-right text-xs text-muted">
                Sınır verisi: TKGM parsel sorgu verisine dayalıdır; bilgilendirme amaçlıdır,
                resmi kadastro belgesi yerine geçmez.
              </p>
            )}
          </div>
        )}
      </div>

      <section className="mt-12">
        {/* Başlık ev sahibine seslenir; alıcıyı sahibinden mağazasına yönlendiren
            cümle paragrafta duruyor — o bilinçli bir filtre, telefonu meşgul
            etmeden doğru yere gönderiyor. */}
        <h2 className="text-xl">{`${bulunmaHali(site.isim)} Evinizi Satmak veya Kiraya Vermek`}</h2>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-body">
          {`Bu sitede eviniz mi var? Satmadan ya da kiraya vermeden önce `}
          <Link
            href={`/ev-degerleme?mahalle=${mahalle.slug}&site=${site.slug}`}
            className="font-semibold text-gold-dark hover:underline"
          >
            satış öncesi değerleme
          </Link>
          {` alın; kira artışı, tapu harcı ve komisyon rakamları için `}
          <Link href="/araclar" className="font-semibold text-gold-dark hover:underline">
            ev sahibi hesap araçlarımız
          </Link>
          {/* "emlakçılar" çoğulu bilinçli ve birebir ("<site> emlakçılar" sorgu
              ailesi; kelime sitede hiç geçmiyordu — 2026-08-07). */}
          {` elinizin altında. `}
          {/* Eryaman kolunda "/"ye bağlamsal çapa (2026-08-08 iç link denetimi:
              ana sayfaya giden tek çapa "Anasayfa" idi). Çapa slug'a göre üç
              varyantta döner ve üçte biri bilinçli LİNKSİZ kalır: 520 Eryaman
              sayfasına birebir aynı çapayı basmak ölçekli-içerik ayak izi olurdu
              (diff incelemesi bulgusu — semaDisi kararıyla aynı gerekçe,
              lib/faq.ts). "emlak ofisleri" varyantı "eryaman emlak ofisleri"
              sorgu ailesini de kapsar. Yenimahalle kolunda konum iddiası
              doğmasın diye her zaman düz metin (lib/bolge.ts kuralı). */}
          {eryamanda && varyant % 3 === 0 ? (
            <Link href="/" className="font-semibold text-gold-dark hover:underline">
              Eryaman&apos;daki emlakçılar
            </Link>
          ) : eryamanda && varyant % 3 === 2 ? (
            <Link href="/" className="font-semibold text-gold-dark hover:underline">
              Eryaman&apos;daki emlak ofisleri
            </Link>
          ) : (
            "Bölgedeki emlakçılar"
          )}
          {` içinde bu sayfayı ayıran şey ilan değil arşiv olması: sitenin tapu kimliği, konumu ve fiyatı etkileyen özellikleri burada. ${bulunmaHali(site.isim)} satılık veya kiralık daire mi arıyorsunuz? Güncel ilanlarımız sahibinden.com mağazamızda. Karar aşamasında bize ulaşın, bu sitede portföyümüze eklenen daireleri ilk öğrenen siz olun.`}
        </p>
        <CtaButton
          href={siteConfig.sahibindenUrl}
          external
          variant="outline"
          className="mt-4"
        >
          sahibinden.com&apos;daki İlanlarımız
        </CtaButton>
      </section>

      <CtaBanner
        className="mt-12"
        baslik={[
          "Bu Sitede Satmak veya Kiraya Vermek İstediğiniz Bir Eviniz mi Var?",
          `${site.isim} İçindeki Daireniz İçin Doğru Fiyatı Birlikte Bulalım`,
          "Dairenizin Bu Sitedeki Gerçek Değerini Konuşalım",
        ][varyant % 3]}
        aciklama="Fiyatı ve satış yol haritasını birlikte netleştirelim; doğrudan bizimle çalışın, aynı gün dönüş alın."
      >
        <CtaButton
          href={`/ev-degerleme?mahalle=${mahalle.slug}&site=${site.slug}`}
          variant="primary"
        >
          Evinizi Değerlendirelim
        </CtaButton>
        <TrackedCtaLink
          href={`${siteConfig.whatsappUrl}?text=${encodeURIComponent(
            `Merhaba! ${site.isim} (${mahalle.isim}) — bu sitedeki dairem için satış/kiralama değerlendirmesi almak istiyorum.`
          )}`}
          gaEvent="site_whatsapp_cta"
          variant="outline-light"
          openInNewTab
        >
          WhatsApp&apos;tan Yazın
        </TrackedCtaLink>
        {/* Üçüncü kapı: telefon. Mobilde başlıkta telefon görünmüyor ve bu
            banner sayfadaki en görünür temas noktası — burada tıklanabilir bir
            numara olmazsa "arayayım" diyen kişi numarayı elle kopyalamak
            zorunda kalıyor. */}
        <TrackedCtaLink
          href={`tel:${siteConfig.phoneTel}`}
          gaEvent="phone_click"
          variant="outline-light"
        >
          {siteConfig.phoneDisplay}
        </TrackedCtaLink>
      </CtaBanner>

      <FaqSection title={`${site.isim} Hakkında Sık Sorulan Sorular`} items={getSiteFaq(site, mahalle)} />

      {/* İç bağ katmanı: siteden ev-sahibi rehberlerine köprü. Ölçüm (2026-07-29):
          720 site sayfasından rehber/hizmet sayfalarına 0 link vardı — Google
          rehberlerin önemini site katmanından okuyamıyordu. Seçim deterministik,
          bkz. yukarıdaki havuzlar. 2026-08-08: blok "ilgili sayfalar" hâline
          getirildi — mahalle sayfası ve iki hizmet sayfası da buraya alındı,
          gerekçeleri yukarıdaki mahalleBagi/hizmetBaglari tanımlarında. */}
      <section className="mt-12 rounded-2xl border border-border bg-surface-muted px-6 py-6">
        <h2 className="text-base font-semibold text-navy">Ev Sahipleri İçin İlgili Sayfalar</h2>
        <ul className="mt-3 grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
          <li>
            <Link
              href={`/mahalleler/${mahalle.slug}`}
              className="font-semibold text-gold-dark hover:underline"
            >
              {mahalleBagi}
            </Link>
          </li>
          {hizmetBaglari.map((bag) => (
            <li key={bag.href}>
              <Link href={bag.href} className="font-semibold text-gold-dark hover:underline">
                {bag.etiket}
              </Link>
            </li>
          ))}
          {rehberler.map((rehber) => (
            <li key={rehber.slug}>
              <Link
                href={`/blog/${rehber.slug}`}
                className="font-semibold text-gold-dark hover:underline"
              >
                {rehber.baslik}
              </Link>
            </li>
          ))}
        </ul>
      </section>
      {digerSiteler.length > 0 && (
        <section className="mt-14">
          <h2 className="text-xl">
            {site.koordinat
              ? `Komşu Siteler — ${mahalle.isim}`
              : `${mahalle.isim}'ndeki Diğer Siteler`}
          </h2>
          {/* Kartlardan ÖNCE gelir: Google sayfadaki İLK anchor'ı esas alır,
              varyantlı metin kart başlığının yalın adına baskın çıksın. */}
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted">
            Çevredeki sitelerde de aynı yerel uzmanlıkla çalışıyoruz:{" "}
            {digerSiteler.map((item, i) => (
              <span key={item.slug}>
                {i > 0 && (i === digerSiteler.length - 1 ? " ve " : ", ")}
                <Link
                  href={`/mahalleler/${item.mahalleSlug}/${item.slug}`}
                  className="text-gold-dark hover:underline"
                >
                  {ANCHOR_KALIPLARI[(i + site.slug.length) % ANCHOR_KALIPLARI.length](item.isim)}
                </Link>
              </span>
            ))}
            .
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {digerSiteler.map((item, i) => (
              <Reveal key={item.slug} delay={(i % 3) * 60} className="h-full">
                <SiteCard site={item} />
              </Reveal>
            ))}
          </div>
        </section>
      )}


      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
      />
      {webPageJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
        />
      )}
    </div>
  );
}
