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
import { inferSiteTipi } from "@/lib/site-tipi";
import { onayliEtap } from "@/lib/etap-onayli";
import { bulunmaHali } from "@/lib/turkce";

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
  // Ata/Susuz/Cumhuriyet Yenimahalle'dedir — Eryaman'da DEĞİL. O mahallelerdeki
  // sitelere "Eryaman <site adı>" demek yanlış konum iddiasıdır (lib/bolge.ts).
  const eryamanda = eryamandaMi(mahalle);
  // Ev sahibinin gerçek arama kalıpları ("X satılık daire", "X kiralık daire",
  // "X daire fiyatları", "X emlakçı") başlıkta birebir karşılansın; açıklama
  // fiyat/değer vaadi + hız taahhüdüyle tıklamaya davet etsin.
  return {
    // Autocomplete kalıbı "eryaman <site adı> satılık daire" biçiminde geliyor;
    // başlık da o sırayı izlesin (adında Eryaman geçenlerde tekrar etmeden).
    title: isimdeEryamanVar
      ? `${site.isim} Satılık Daire ve Kiralık Daire — Yerel Emlakçısı`
      : eryamanda
        ? `Eryaman ${site.isim} Satılık Daire ve Kiralık Daire — Emlakçısı`
        : `${site.isim} Satılık Daire ve Kiralık Daire — ${mahalle.isim} Emlakçısı`,
    description: truncateForMeta(
      `${bulunmaHali(site.isim)} eviniz mi var? Satış ve kira değerini siteyi blok blok tanıyan yerel emlakçınızla netleştirin. Aynı gün dönüş: ${siteConfig.phoneDisplay}.`
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
  // Komşu siteler: koordinatı olan sitelerde coğrafi olarak en yakın 6 komşu
  // (ziyaretçiye gerçek komşuluk, tarayıcıya zengin iç bağlantı ağı). Koordinatı
  // olmayanlarda eski sıralı-pencere mantığı devrede kalır.
  const digerSiteSayisi = Math.min(6, mahalleSiteleri.length - 1);
  const siteIndex = mahalleSiteleri.findIndex((item) => item.slug === site.slug);
  const halkaSiteler =
    siteIndex === -1
      ? mahalleSiteleri.filter((item) => item.slug !== site.slug).slice(0, digerSiteSayisi)
      : Array.from(
          { length: digerSiteSayisi },
          (_, i) => mahalleSiteleri[(siteIndex + 1 + i) % mahalleSiteleri.length]
        );
  const merkez = site.koordinat;
  const digerSiteler = merkez
    ? (() => {
        const uzaklikKare = (k: { lat: number; lng: number }) => {
          const dLat = k.lat - merkez.lat;
          const dLng = (k.lng - merkez.lng) * Math.cos((merkez.lat * Math.PI) / 180);
          return dLat * dLat + dLng * dLng;
        };
        const yakinlar = mahalleSiteleri
          .filter((item) => item.slug !== site.slug && item.koordinat)
          .sort((a, b) => uzaklikKare(a.koordinat!) - uzaklikKare(b.koordinat!))
          .slice(0, digerSiteSayisi);
        // Koordinatlı komşu azsa halkadan tamamla (tekrarsız).
        for (const aday of halkaSiteler) {
          if (yakinlar.length >= digerSiteSayisi) break;
          if (!yakinlar.some((item) => item.slug === aday.slug)) yakinlar.push(aday);
        }
        return yakinlar;
      })()
    : halkaSiteler;
  const sinir = getSiteBoundary(site);
  const tipi = inferSiteTipi(site.isim);
  const dogrulanmisEtap = onayliEtap(site.adalar);
  // Ata/Susuz/Cumhuriyet Yenimahalle'dedir; o mahallelerdeki sitelere "Eryaman"
  // demek yanlış konum iddiası olur (lib/bolge.ts).
  const eryamanda = eryamandaMi(mahalle);

  // 720 sayfada birebir aynı kalıp "ölçeklendirilmiş içerik" görünümü veriyordu
  // (E-E-A-T denetimi, 2026-07-29). Varyant seçimi DETERMİNİSTİK (slug'dan) —
  // her build'de aynı sayfa aynı metni alır, yapay tazelenme olmaz.
  const varyant = Array.from(site.slug).reduce((t, ch) => t + ch.charCodeAt(0), 0);
  const girisVaadi = [
    `Bu sitede eviniz mi var? Satmak veya kiraya vermek istiyorsanız, ${site.isim} emlakçısı olarak size yardımcı oluyoruz.`,
    `Buradaki dairenizi satmayı ya da kiraya vermeyi düşünüyorsanız, siteyi yakından tanıyan emlakçınız olarak yanınızdayız.`,
    `Bu sitede daireniz varsa — satış da kiralama da olsa — süreci sizin adınıza biz yürütüyoruz.`,
    `${site.isim} içindeki daireniz için satış veya kiralama düşünüyorsanız, ilk görüşmeden tapuya kadar yanınızdayız.`,
  ][varyant % 4];

  // İç bağ ölçümü (2026-07-29): 720 site sayfasından rehberlere 0 link vardı.
  // Havuzdan slug'a göre DETERMİNİSTİK seçim — her rehber ~150-250 sayfadan
  // doğal dağılımla link alır, her build aynı sonucu üretir.
  const SATIS_HAVUZU = [
    "eryamanda-ev-satis-sureci",
    "emlakcisiz-ev-satilir-mi",
    "ev-satarken-odenecek-vergiler",
    "kiracili-ev-satilir-mi",
    "evinizi-satisa-hazirlamak",
    "evinizin-degerini-nasil-ogrenebilirsiniz",
  ];
  const KIRA_HAVUZU = [
    "kiraci-tahliye-sureci",
    "kira-artisi-nasil-hesaplanir",
    "dairenizi-kiraya-verirken-dikkat-edilmesi-gerekenler",
    "kira-sozlesmesinde-dikkat-edilmesi-gerekenler",
    "evinizi-kiraya-verdikten-sonra",
  ];
  const rehberler = [
    getBlogPostBySlug(SATIS_HAVUZU[varyant % SATIS_HAVUZU.length]),
    getBlogPostBySlug(KIRA_HAVUZU[(varyant + 2) % KIRA_HAVUZU.length]),
  ].filter((r): r is NonNullable<typeof r> => Boolean(r));
  const hizmetLinki =
    varyant % 2 === 0
      ? { href: "/eryamanda-ev-satmak", etiket: "Eryaman'da Ev Satmak — Hizmet Sayfamız" }
      : { href: "/eryamanda-ev-kiraya-vermek", etiket: "Eryaman'da Ev Kiraya Vermek — Hizmet Sayfamız" };

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
      }
    : null;

  const siteJsonLd = {
    "@context": "https://schema.org",
    "@type": "ApartmentComplex",
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
          <p className="text-base font-medium text-navy">
            {`${site.isim}, ${eryamanda ? "Eryaman'da " : ""}${mahalle.isim} sınırları içinde yer alan ${
              tipi ? `${tipi} ` : ""
            }bir yerleşimdir. ${girisVaadi}`}
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
          <p className="flex max-w-3xl flex-wrap items-center gap-x-2 gap-y-1 rounded-xl border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-body">
            <span>
              {site.isim} ve çevresindeki <strong className="text-navy">güncel satılık ve kiralık ilanlarımız</strong> için:
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
            {dogrulamaTarihi && (
              // Tazelik sinyali (ziyaretçi + AI cevap motorları): fiyat değil,
              // VERİ doğrulama tarihi — fiyat-rakamı kuralına takılmaz.
              <p className="text-right text-xs text-muted">
                Site bilgileri son doğrulama: {dogrulamaTarihi} · Derleyen:{" "}
                <Link
                  href="/hakkimizda#ozgun-sirin"
                  className="font-medium text-gold-dark hover:underline"
                >
                  Özgün Şirin
                </Link>
              </p>
            )}
          </div>
        )}
      </div>

      <section className="mt-12">
        <h2 className="text-xl">{`${site.isim} Satılık Daire ve Kiralık Daire`}</h2>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-body">
          {`Bu sitede eviniz mi var? Satılık ya da kiralık vermeden önce `}
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
          {` elinizin altında. ${bulunmaHali(site.isim)} satılık veya kiralık daire mi arıyorsunuz? Bu sayfada ilan yayınlamıyoruz — güncel ilanlarımız sahibinden.com mağazamızda. Bu sayfanın işi başka: sitenin tapu kimliği, konumu ve fiyatı etkileyen özellikleri burada; karar aşamasında bize ulaşın, bu sitede portföyümüze eklenen daireleri ilk öğrenen siz olun.`}
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

      {digerSiteler.length > 0 && (
        <section className="mt-14">
          <h2 className="text-xl">
            {site.koordinat
              ? `Komşu Siteler — ${mahalle.isim}`
              : `${mahalle.isim}'ndeki Diğer Siteler`}
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {digerSiteler.map((item, i) => (
              <Reveal key={item.slug} delay={(i % 3) * 60} className="h-full">
                <SiteCard site={item} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      <FaqSection title={`${site.isim} Hakkında Sık Sorulan Sorular`} items={getSiteFaq(site, mahalle)} />

      {/* İç bağ katmanı: siteden ev-sahibi rehberlerine köprü. Ölçüm (2026-07-29):
          720 site sayfasından rehber/hizmet sayfalarına 0 link vardı — Google
          rehberlerin önemini site katmanından okuyamıyordu. Seçim deterministik,
          bkz. yukarıdaki havuzlar. */}
      {rehberler.length > 0 && (
        <section className="mt-12 rounded-2xl border border-border bg-surface-muted px-6 py-6">
          <h2 className="text-base font-semibold text-navy">Ev Sahipleri İçin Rehberler</h2>
          <ul className="mt-3 space-y-2 text-sm">
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
            <li>
              <Link href={hizmetLinki.href} className="font-semibold text-gold-dark hover:underline">
                {hizmetLinki.etiket}
              </Link>
            </li>
          </ul>
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
