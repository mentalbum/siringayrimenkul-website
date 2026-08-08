import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  adaDisplayLabel,
  adaRouteKey,
  getAllAdalar,
  getAllMahalleler,
  getBlogPostsByMahalle,
  getMahalleBoundary,
  getMahalleBySlug,
  getNearbyMahalleler,
  getSiteBoundary,
  getSitelerByMahalle,
  mahalleKisaIsim,
} from "@/lib/content";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { CtaButton } from "@/components/ui/button";
import { CtaBanner } from "@/components/ui/cta-banner";
import { TrackedCtaLink } from "@/components/ui/tracked-cta-link";
import { FaqSection } from "@/components/ui/faq-section";
import { MahalleMapLoader } from "@/components/maps/mahalle-map-loader";
import { ResourceHints } from "@/components/seo/resource-hints";
import { MahalleSitelerBrowser } from "@/components/site/mahalle-siteler-browser";
import { inceltSiteler } from "@/lib/siteler-liste";
import { getMahalleFaq } from "@/lib/faq";
import { truncateForMeta } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";
import { organizationRef } from "@/lib/structured-data";
import { bulunmaHali } from "@/lib/turkce";
import { eryamandaMi } from "@/lib/bolge";
import { etapSayfasiVarMi } from "@/lib/etap-onayli";

type Props = {
  params: Promise<{ mahalle: string }>;
};

export function generateStaticParams() {
  return getAllMahalleler().map((mahalle) => ({ mahalle: mahalle.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { mahalle: slug } = await params;
  const mahalle = getMahalleBySlug(slug);
  if (!mahalle) return {};

  const alias = mahalle.alternatifAdlar?.[0];
  // Başlıkta TAM ad kullanılıyor ("Tunahan Mahallesi"), kısaltılmışı değil.
  // Sebebi: mahalle adlarının çoğu tek başına belirsiz — "Tunahan" başka
  // illerde de var ve autocomplete'te o illerin ofislerini getiriyor. Gerçek
  // sorgu da "tunahan mahallesi satılık daire" biçiminde geliyor. Sayfanın
  // H1'i, breadcrumb'ı ve gövdesi zaten tam adı kullanıyordu; eksik olan
  // tek yer başlıktı.
  const baslikIsim = alias ? `${mahalle.isim} (${alias})` : mahalle.isim;
  const siteSayisi = getSitelerByMahalle(mahalle.slug).length;

  return {
    // "Fiyatları" kelimesi bilerek yok: sayfada fiyat rakamı vermiyoruz (proje
    // kuralı), o yüzden başlıkta fiyat vaat etmek tıklayanı hayal kırıklığına
    // uğratıyor ve çıkma oranını yükseltiyordu. Sorgunun kendisi zaten
    // "<mahalle> satılık daire" biçiminde geliyor.
    // absolute: kök şablondaki " | Şirin Gayrimenkul" eki burada eklenmiyor.
    // Tam mahalle adıyla birlikte başlık 90+ karaktere çıkıyordu ve Google
    // ~60 karakterde kestiği için asıl anahtar kelime "Emlakçısı" görünmez
    // oluyordu. Marka zaten alan adında ve sonuç kartının üstünde görünüyor.
    // Sonek MAHALLEYE ÖZEL ("Göksu Emlakçısı"): SERP ölçümü (2026-07-29)
    // "mahalle + emlakçı" sorgu sınıfının kazanılabilir tek sınıf olduğunu
    // gösterdi (satılık/kiralık sorguları portal duvarı). Cumhuriyet'te sonek
    // "Yeni Batı Emlakçısı" — o sorguyu bu sayfa hedefliyor (bkz. memory).
    // BÖLGE SON EKİ ("| Eryaman" / "| Yenimahalle Ankara"): canlı SERP taraması
    // (2026-07-31) 7 mahallenin ilk sayfada ÇIKMADIĞINI gösterdi ve hepsi ya
    // Türkiye'de yaygın adlar (Göksu, Yeşilova, Şeyh Şamil, Şehit Osman Avcı)
    // ya da Yenimahalle grubuydu — Google başlıkta coğrafi nitelik olmadan
    // hangi ilin mahallesi olduğunu ayıramıyor. Görünümde kesilse bile
    // sıralama sinyali başlıkta durur.
    // "EMLAKÇI" YALIN HÂLDE VE BAŞTA (Özgün'ün hedef biçimi, 2026-07-31):
    // insanlar "göksu mahallesi emlakçı" diye arıyor — tam dizi başlığın
    // başında birebir geçer; iyelikli "Emlakçısı" biçimi gövdede zaten var.
    // Ticari mesaj ev sahibine seslenir — gerekçe site sayfası şablonunda
    // (app/mahalleler/[mahalle]/[site]/page.tsx generateMetadata).
    // LOKASYON İKİNCİ BÖLÜMDE (2026-08-08) — gerekçe site sayfası şablonunda
    // (app/mahalleler/[mahalle]/[site]/page.tsx generateMetadata): üçüncü
    // bölümdeyken coğrafi nitelik Google'ın ~60 karakterlik kesme sınırının
    // ötesinde kalıyordu. Yukarıdaki "görünümde kesilse bile sıralama sinyali
    // başlıkta durur" notu geçerliliğini koruyor; bu değişiklik sinyali
    // korurken niteliği GÖRÜNÜR de kılıyor.
    title: {
      absolute: `${baslikIsim} Emlakçı | ${
        eryamandaMi(mahalle) ? "Eryaman" : "Yenimahalle Ankara"
      } | Evinizi Satalım, Kiraya Verelim`,
    },
    // 155 KARAKTERE SIĞACAK BİÇİMDE KISALTILDI (2026-08-08). Eski metin 14
    // mahallenin 14'ünde de 236–272 karakterdi ve Google'ın kestiği kuyruk her
    // seferinde AYNI yerdi: ev sahibine seslenen eylem cümlesi. Yani kazanılabilir
    // olduğu ölçülen tek sorgu sınıfında (mahalle + emlakçı) snippet çağrısız
    // kalıyordu. Uzun ad + alias birleşiminde yine de taşarsa truncateForMeta
    // ağı tutuyor; kesilecek kısım artık kuyruk değil, tanıtım cümlesi.
    description: truncateForMeta(
      `${baslikIsim} emlakçı: ${siteSayisi > 0 ? `${siteSayisi} site ve rezidansı` : "buradaki siteleri"} tanıyoruz. Satış ve kiralamada fiyatı birlikte belirleyelim. Aynı gün dönüş: ${siteConfig.phoneDisplay}.`
    ),
    alternates: { canonical: `/mahalleler/${mahalle.slug}` },
    robots:
      mahalle.durum === "yakinda" ? { index: false, follow: true } : { index: true, follow: true },
  };
}

export default async function MahallePage({ params }: Props) {
  const { mahalle: slug } = await params;
  const mahalle = getMahalleBySlug(slug);
  if (!mahalle) notFound();

  if (mahalle.durum === "yakinda") {
    const yakindakiler = getNearbyMahalleler(mahalle, 4);
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-gold-dark">
          {mahalle.ilce}
        </p>
        <h1 className="mt-2 text-3xl">{mahalle.isim}</h1>
        <p className="mt-4 text-base text-body">{mahalle.kisaAciklama}</p>
        <p className="mt-6 text-sm text-muted">
          Bu mahalle için detaylı rehberimizi hazırlıyoruz. O zamana kadar Tunahan Mahallesi
          rehberimize göz atabilir veya doğrudan bizi arayabilirsiniz.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <CtaButton href="/mahalleler" variant="outline">
            Tüm Mahalleler
          </CtaButton>
          <TrackedCtaLink href={`tel:${siteConfig.phoneTel}`} gaEvent="phone_click" variant="primary">
            Bizi Arayın
          </TrackedCtaLink>
        </div>

        {yakindakiler.length > 0 && (
          <div className="mt-14 text-left">
            <h2 className="text-center text-base font-semibold text-navy">
              Yakındaki Mahalleler
            </h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {yakindakiler.map(({ mahalle: yakin, uzaklikKm }) => (
                <Link
                  key={yakin.slug}
                  href={`/mahalleler/${yakin.slug}`}
                  className="flex flex-col gap-1 rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-gold"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-navy">{yakin.isim}</span>
                    {yakin.durum === "yakinda" && (
                      <span className="shrink-0 rounded-full bg-surface-muted px-2 py-0.5 text-[11px] font-semibold text-muted">
                        Yakında
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted">~{uzaklikKm.toFixed(1)} km</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  const kisaIsim = mahalleKisaIsim(mahalle);
  const siteler = getSitelerByMahalle(mahalle.slug);
  const boundary = getMahalleBoundary(mahalle);
  const siteMapEntries = siteler.map((site) => ({ site, boundary: getSiteBoundary(site) }));
  const hasSiteParcel = siteMapEntries.some((entry) => entry.boundary);
  const haritaliSayisi = siteMapEntries.filter((entry) => entry.boundary).length;
  const adalar = getAllAdalar(mahalle.slug);
  const yakindakiler = getNearbyMahalleler(mahalle, 4);
  const ilgiliYazilar = getBlogPostsByMahalle(mahalle.slug);
  // SADECE sayfası olan etaplar listelenir. Kayıtlardaki adalar[].etap alanı
  // doğrulanmamış etapları da taşıyor; filtre olmadan mahalle sayfası olmayan
  // sayfaya link basıyordu (canlı ölçümde yakalandı: Şehit Osman Avcı →
  // /etaplar/2 → 404). Bkz. lib/etap-onayli.ts.
  const etaplar = (
    Array.from(new Set(adalar.map((ada) => ada.etap).filter(Boolean))) as string[]
  )
    .filter((no) => etapSayfasiVarMi(no))
    .sort((a, b) => Number(a) - Number(b));
  // "4. ve 5." — etap numaraları kimliktir; adet göstermek "2. Etap" sanılıyor
  const etapEtiketi =
    etaplar.length > 1
      ? `${etaplar
          .slice(0, -1)
          .map((no) => `${no}.`)
          .join(", ")} ve ${etaplar[etaplar.length - 1]}.`
      : etaplar.length === 1
        ? `${etaplar[0]}.`
        : "";

  // Sayfada görünen site kartlarının makine-okur karşılığı: Google mahalledeki
  // tüm site/rezidans envanterini tek listede okur (görünen içerikle birebir).
  const siteListJsonLd =
    siteler.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: `${mahalle.isim} Siteleri ve Rezidansları`,
          numberOfItems: siteler.length,
          itemListElement: siteler.map((s, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: s.isim,
            url: `${siteConfig.url}/mahalleler/${mahalle.slug}/${s.slug}`,
          })),
        }
      : null;

  // "Bu mahalleye hizmet veren emlakçı" ilişkisinin makine-okunur hâli —
  // yaygın adlı mahallelerde (Göksu, Yeşilova...) coğrafi ayrıştırmayı
  // güçlendirir (2026-07-31 SERP taraması bulgusu).
  const hizmetJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Emlak danışmanlığı — satış ve kiralama",
    name: `${mahalle.isim} Emlakçı — ${siteConfig.name}`,
    provider: organizationRef,
    url: `${siteConfig.url}/mahalleler/${mahalle.slug}`,
    areaServed: {
      "@type": "Place",
      name: `${mahalle.isim}, ${mahalle.ilce}, Ankara`,
      geo: {
        "@type": "GeoCoordinates",
        latitude: mahalle.merkezKoordinat.lat,
        longitude: mahalle.merkezKoordinat.lng,
      },
    },
  };

  const mahalleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Place",
    name: mahalle.isim,
    description: mahalle.kisaAciklama,
    url: `${siteConfig.url}/mahalleler/${mahalle.slug}`,
    geo: {
      "@type": "GeoCoordinates",
      latitude: mahalle.merkezKoordinat.lat,
      longitude: mahalle.merkezKoordinat.lng,
    },
    containedInPlace: {
      "@type": "AdministrativeArea",
      name: `${mahalle.ilce}, Ankara`,
    },
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <ResourceHints />
      <Breadcrumbs
        items={[
          { label: "Anasayfa", href: "/" },
          { label: "Mahalleler", href: "/mahalleler" },
          { label: mahalle.isim, href: `/mahalleler/${mahalle.slug}` },
        ]}
      />

      <header className="mt-4 max-w-3xl">
        {/* Bölge etiketi coğrafi ayrıştırma sinyali: "Göksu" Türkiye'de çok
            yerde var; Eryaman/Yenimahalle bağlamı hero'da açıkça durmalı. */}
        <p className="text-sm font-semibold uppercase tracking-wide text-gold-dark">
          {eryamandaMi(mahalle) ? "Eryaman · Etimesgut · Ankara" : "Yenimahalle · Ankara"}
        </p>
        <h1 className="mt-2 text-3xl sm:text-4xl">{mahalle.isim}</h1>
        <p className="mt-3 text-base leading-relaxed text-body">
          <strong className="font-semibold text-navy">{kisaIsim} emlakçısı</strong> Şirin
          Gayrimenkul, {mahalle.isim}&apos;ndeki site ve rezidansları tek tek tanıyor; satılık ve
          kiralık daire piyasasını günlük takip ediyoruz. Evinizi satmak veya kiraya vermek
          istiyorsanız{" "}
          <Link
            href={`/ev-degerleme?mahalle=${mahalle.slug}`}
            className="font-semibold text-gold-dark hover:underline"
          >
            doğru fiyatı birlikte belirleyelim
          </Link>
          .
          {mahalle.alternatifAdlar?.[0] && (
            <>
              {" "}
              Bölge halk arasında{" "}
              <strong className="font-semibold text-navy">
                {mahalle.alternatifAdlar[0]}
              </strong>{" "}
              olarak da biliniyor; {mahalle.alternatifAdlar[0]} emlakçısı arıyorsanız da doğru
              yerdesiniz.
            </>
          )}
          {mahalle.ilce === "Yenimahalle" && (
            <>
              {" "}
              {kisaIsim} dahil Yenimahalle tarafındaki tüm siteleri{" "}
              <Link
                href="/siteler/yenimahalle"
                className="font-semibold text-gold-dark hover:underline"
              >
                Yenimahalle siteleri listemizde
              </Link>{" "}
              bulabilirsiniz.
            </>
          )}
        </p>
      </header>

      <dl className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-surface p-4 transition-shadow duration-300 hover:shadow-md hover:shadow-navy/5">
          <dd className="text-2xl font-semibold tabular-nums text-navy">{siteler.length}</dd>
          <dt className="mt-1 text-xs font-medium text-muted">Site &amp; Rezidans</dt>
        </div>
        {adalar.length > 0 && (
          <div className="rounded-2xl border border-border bg-surface p-4 transition-shadow duration-300 hover:shadow-md hover:shadow-navy/5">
            <dd className="text-2xl font-semibold tabular-nums text-navy">{adalar.length}</dd>
            <dt className="mt-1 text-xs font-medium text-muted">Kayıtlı Ada / Parsel</dt>
          </div>
        )}
        {etaplar.length > 0 && (
          <div className="rounded-2xl border border-border bg-surface p-4 transition-shadow duration-300 hover:shadow-md hover:shadow-navy/5">
            <dd className="text-2xl font-semibold tabular-nums text-navy">{etapEtiketi}</dd>
            <dt className="mt-1 text-xs font-medium text-muted">Etap</dt>
          </div>
        )}
        {siteler.length > 0 && haritaliSayisi === siteler.length && (
          <div className="rounded-2xl border border-gold bg-surface p-4 transition-shadow duration-300 hover:shadow-md hover:shadow-gold/15">
            <dd className="text-2xl font-semibold tabular-nums text-navy">
              {haritaliSayisi}/{siteler.length}
            </dd>
            <dt className="mt-1 text-xs font-medium text-gold-dark">
              Tapu Sınırlarıyla Haritalı Site
            </dt>
          </div>
        )}
      </dl>
      {siteler.length > 0 && haritaliSayisi === siteler.length && (
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-body">
          {mahalle.isim}&apos;ndeki sitelerin <strong>tamamını</strong> gerçek tapu (TKGM) ada/parsel
          sınırlarıyla haritaladık. Evinizin değerini mahalle ortalamasından değil, sitenizin
          gerçeğinden yola çıkarak konuşuyoruz.
        </p>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_1fr]">
        <div className="space-y-4">
          {mahalle.uzunAciklama?.map((paragraph) => (
            <p key={paragraph.slice(0, 24)} className="text-base leading-relaxed text-body">
              {paragraph}
            </p>
          ))}
        </div>
        <div className="flex flex-col gap-2">
          <div className="h-[360px] overflow-hidden rounded-2xl border border-border lg:h-full">
            <MahalleMapLoader
              center={mahalle.merkezKoordinat}
              mahalleBoundary={boundary}
              siteler={siteMapEntries}
            />
          </div>
          {(boundary || hasSiteParcel) && (
            <p className="text-right text-xs text-muted">
              {boundary && "Mahalle sınırı verisi: © OpenStreetMap katkıda bulunanları"}
              {boundary && hasSiteParcel && " · "}
              {hasSiteParcel &&
                "Site sınırları: TKGM parsel sorgu verisine dayalıdır; bilgilendirme amaçlıdır, resmi kadastro belgesi yerine geçmez."}
            </p>
          )}
        </div>
      </div>

      <section className="mt-14">
        {/* Başlıklar da gövde metniyle aynı kitleye seslensin: altındaki iki
            paragraf zaten "Evinizi satmayı düşünüyorsanız" / "Boş dairenizi
            kiraya mı vereceksiniz" diyor, başlıklar ise ilan arayana
            sesleniyordu (Özgün kararı, 2026-08-01). */}
        <h2 className="text-xl">{`${mahalle.isim}'nde Evinizi Satmak veya Kiraya Vermek`}</h2>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-surface p-6">
            <h3 className="text-base font-semibold text-navy">
              {`${mahalle.isim}'nde Evinizi Satmak`}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-body">
              {siteler.length > 0
                ? `Evinizi satmayı düşünüyorsanız fiyatı mahalle ortalamasından değil, sitenizin gerçeğinden yola çıkarak birlikte belirleyelim — mahalledeki ${siteler.length} site ve rezidansın her birini tanıyoruz. `
                : "Evinizi satmayı düşünüyorsanız fiyatı mahalle ortalamasından değil, sitenizin gerçeğinden yola çıkarak birlikte belirleyelim. "}
              Fiyatlar bu dönemde hızla değiştiği için ilanlarda görülen eski rakamlar yanıltabilir; güncel değeri emsallerden okuyoruz. Hazırlıktan alıcı elemeye, pazarlıktan tapuya kadar adımları{" "}
              {/* Mahalle katmanından hizmet sayfalarına gövde bağı yoktu — bu iki
                  kart tam da o iki hizmeti anlatıyor ama yalnız footer'dan bağ
                  gidiyordu (2026-08-08 iç link denetimi). Yenimahalle kolunda
                  çapada "Eryaman" geçmez (lib/bolge.ts). */}
              <Link
                href="/eryamanda-ev-satmak"
                className="font-semibold text-gold-dark hover:underline"
              >
                {eryamandaMi(mahalle) ? "Eryaman'da ev satmak" : "ev satış hizmetimiz"}
              </Link>
              {" sayfamızda anlattık. Satış kararının ilk adımı doğru fiyat: "}
              <Link
                href={`/ev-degerleme?mahalle=${mahalle.slug}`}
                className="font-semibold text-gold-dark hover:underline"
              >
                ev değerleme talebi
              </Link>
              {" bırakın, aynı gün dönüş yapalım."}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-6">
            <h3 className="text-base font-semibold text-navy">
              {`${mahalle.isim}'nde Evinizi Kiraya Vermek`}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-body">
              Boş dairenizi kiraya mı vereceksiniz? Doğru kira bedeli, sağlam sözleşme ve
              doğrulanmış kiracıyla süreci sizin adınıza yönetiyoruz. Kira tespitinden kiracı
              elemeye kadar nasıl çalıştığımızı{" "}
              <Link
                href="/eryamanda-ev-kiraya-vermek"
                className="font-semibold text-gold-dark hover:underline"
              >
                {eryamandaMi(mahalle)
                  ? "Eryaman'da evinizi kiraya vermek"
                  : "kiralama hizmetimiz"}
              </Link>
              {" sayfamızda anlattık. Kira artışı ve boş kalma maliyeti için "}
              <Link href="/araclar" className="font-semibold text-gold-dark hover:underline">
                ev sahibi hesap araçlarımız
              </Link>{" "}
              elinizin altında. Kiralık daire arayanlar için güncel ilanlarımız sahibinden.com
              mağazamızda; aradığınız daire listede yoksa bize ulaşın, portföye eklenen
              daireleri ilk siz öğrenin.
            </p>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <TrackedCtaLink
            href={`${siteConfig.whatsappUrl}?text=${encodeURIComponent(
              `Merhaba! ${mahalle.isim} — bu mahalledeki dairem için satış/kiralama değerlendirmesi almak istiyorum.`
            )}`}
            gaEvent="mahalle_whatsapp_cta"
            variant="primary"
            openInNewTab
          >
            WhatsApp&apos;tan Yazın
          </TrackedCtaLink>
          <CtaButton href={siteConfig.sahibindenUrl} external variant="outline">
            sahibinden.com&apos;daki İlanlarımız
          </CtaButton>
        </div>
        {/* Rakamsız fiyat modülü (SERP ölçümü: portalların üstünlük bloğu fiyat
            istatistiği; bizim kuralımız rakam yazmamak — cevap "fiyatı ne
            belirler" çerçevesi + değerleme köprüsü. Niyet: ölçülen en derin
            ev sahibi acısı fiyat belirsizliği.) */}
        <div className="mt-5 rounded-2xl border border-gold/40 bg-gold/10 p-6">
          <h3 className="text-base font-semibold text-navy">
            {`${mahalle.isim}'nde Daire Fiyatını Ne Belirler?`}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-body">
            Portal ortalamaları siteler arasındaki farkı gizler: aynı mahallede iki dairenin
            değeri site, blok, kat, cephe ve tapu durumuna (kat mülkiyeti/kat irtifakı) göre
            ciddi biçimde ayrışır. İlanda görülen istenen fiyatlar çoğu zaman gerçekleşen
            rakamların gerisinden ya da ilerisinden gelir. Dairenizin gerçek değerini mahalle
            ortalamasından değil, {haritaliSayisi > 0 ? "tapu sınırlarıyla haritaladığımız " : ""}
            sitenizin emsallerinden okuyoruz —{" "}
            <Link
              href={`/ev-degerleme?mahalle=${mahalle.slug}`}
              className="font-semibold text-gold-dark hover:underline"
            >
              değerleme görüşmesi
            </Link>{" "}
            ile başlayalım.
          </p>
        </div>
      </section>
      <section className="mt-14">
        <h2 className="text-xl">{mahalle.isim}&apos;ndeki Siteler ve Rezidanslar</h2>
        {siteler.length > 0 ? (
          /* Kartlara TAM açıklama değil kısaltılmış özet gider (kartta zaten üç
             satır görünüyor): 87 kayıtlık mahallede tam metin sayfayı gereksiz
             ağırlaştırıyordu — /siteler aynı inceltmeyi kullanıyor. */
          <div className="mt-4">
            <MahalleSitelerBrowser
              siteler={inceltSiteler(siteler)}
              arsiv={
                eryamandaMi(mahalle)
                  ? { etiket: "Eryaman", href: "/siteler" }
                  : {
                      etiket: "Yenimahalle (Ata, Susuz, Cumhuriyet)",
                      href: "/siteler/yenimahalle",
                    }
              }
            />
          </div>
        ) : (
          <p className="mt-2 text-sm text-muted">Bu mahalledeki siteler yakında eklenecek.</p>
        )}
      </section>


      {/* "X mahallesi emlakçı" sorgusunun gövdedeki karşılığı: kim, nerede,
          hangi yetkiyle. Bölge bağlamı (Eryaman/Yenimahalle · Ankara) yaygın
          adlı mahallelerde ayrıştırma sinyalidir (2026-07-31 SERP bulgusu).
          Rakam kuralları: yorum sayısı yok (puan serbest), fiyat yok. */}
      <section className="mt-14 max-w-3xl">
        {/* Başlıkta yalın "Emlakçı" bilinçli: hedef sorgu dizisi birebir
            ("göksu mahallesi emlakçı") — "Arayanlara" ile Türkçesi doğal. */}
        <h2 className="text-xl">{mahalle.isim} Emlakçı Arayanlara: Şirin Gayrimenkul</h2>
        <p className="mt-3 text-base leading-relaxed text-body">
          {/* "/"ye bağlamsal çapa (2026-08-08): iç link denetimi ana sayfaya
              giden tek çapanın "Anasayfa" olduğunu gösterdi; mahalle sayfaları
              en yüksek tematik akrabalıklı orta katman. Yenimahalle kolunda
              çapa "komşudaki Eryaman'da" — "Eryaman X" yasağına takılmaz. */}
          {eryamandaMi(mahalle) ? (
            <>
              Ofisimiz Eryaman&apos;da;{" "}
              <Link href="/" className="font-semibold text-gold-dark hover:underline">
                Eryaman emlakçısı olarak
              </Link>{" "}
              {bulunmaHali(mahalle.isim)} — Etimesgut, Ankara — satılık ve kiralık daire
              süreçlerini yerinde yürütüyoruz.
            </>
          ) : (
            <>
              Ofisimiz hemen{" "}
              <Link href="/" className="font-semibold text-gold-dark hover:underline">
                komşudaki Eryaman&apos;da
              </Link>
              ; {bulunmaHali(mahalle.isim)} — Yenimahalle, Ankara — satılık ve kiralık
              daire süreçlerini yerinde yürütüyoruz.
            </>
          )}{" "}
          {/* "emlakçılar" ÇOĞUL biçimi bilinçli ve birebir: "<mahalle> emlakçılar /
              emlakçılar listesi" sorgu ailesi GSC'de görünüyor ama kelime sitede
              hiç geçmiyordu (2026-08-07 tespiti). Doğal cümle içinde tutulmalı. */}
          Bölgedeki emlakçılar arasında bizi ayıran şey kayıt tutma biçimimiz: mahalledeki{" "}
          {siteler.length > 0 ? `${siteler.length} site ve rezidansın` : "sitelerin"} tapu
          yapısını, bloklarını ve emsallerini tek tek arşivliyor; değerlemeyi ilan
          fiyatlarından değil gerçekleşen satış ve kiralamalardan okuyoruz. Google&apos;da 5,0
          puanlı işletme profilimiz ve 0603771 no&apos;lu Taşınmaz Ticareti Yetki Belgemizle
          çalışıyoruz. {bulunmaHali(kisaIsim)} eviniz varsa{" "}
          <Link
            href={`/ev-degerleme?mahalle=${mahalle.slug}`}
            className="font-semibold text-gold-dark hover:underline"
          >
            değerleme görüşmesiyle
          </Link>{" "}
          başlayalım.
        </p>
      </section>

      <FaqSection
        title={`${mahalle.isim} Hakkında Sık Sorulan Sorular`}
        items={getMahalleFaq(mahalle, siteler.length)}
      />

      <CtaBanner
        className="mt-14"
        baslik={`${mahalle.isim}'nde Satmak veya Kiraya Vermek İstediğiniz Bir Eviniz mi Var?`}
        aciklama="Fiyatı ve satış yol haritasını birlikte netleştirelim; doğrudan bizimle çalışın, aynı gün dönüş alın."
      >
        <CtaButton href={`/ev-degerleme?mahalle=${mahalle.slug}`} variant="primary">
          Evinizi Değerlendirelim
        </CtaButton>
      </CtaBanner>
      {etaplar.length > 0 && (
        <section className="mt-14">
          <h2 className="text-xl">{mahalle.isim}&apos;ndeki Etaplar ve Adalar</h2>
          <p className="mt-2 text-sm text-muted">
            Eryaman bölgesindeki yapılaşma etap ve ada numaralarına göre düzenlenmiştir.
          </p>
          <div className="mt-5 space-y-6">
            {etaplar.map((etap) => (
              <div key={etap}>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-gold-dark">
                  <Link
                    href={`/mahalleler/${mahalle.slug}/etaplar/${etap}`}
                    className="cursor-pointer hover:underline"
                  >
                    {etap}. Etap
                  </Link>
                </h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {adalar
                    .filter((ada) => ada.etap === etap)
                    .map((ada) => (
                      <Link
                        key={adaRouteKey(ada)}
                        href={`/mahalleler/${mahalle.slug}/adalar/${adaRouteKey(ada)}`}
                        title={ada.site.isim}
                        className="cursor-pointer rounded-full border border-border bg-surface px-3 py-1.5 text-sm text-navy transition-colors hover:border-gold hover:text-gold-dark"
                      >
                        {adaDisplayLabel(ada)}
                      </Link>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {ilgiliYazilar.length > 0 && (
        <section className="mt-14">
          <h2 className="text-xl">{mahalle.isim} ile İlgili Blog Yazıları</h2>
          <div className="mt-5 space-y-4">
            {ilgiliYazilar.map((yazi) => (
              <Link
                key={yazi.slug}
                href={`/blog/${yazi.slug}`}
                className="block rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-gold"
              >
                <p className="text-sm font-semibold text-navy hover:text-gold-dark">{yazi.baslik}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted">{yazi.ozet}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {yakindakiler.length > 0 && (
        <section className="mt-14">
          <h2 className="text-xl">Yakındaki Mahalleler</h2>
          <p className="mt-2 text-sm text-muted">
            {mahalle.isim}&apos;ne en yakın mahalleler.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {yakindakiler.map(({ mahalle: yakin, uzaklikKm }) => (
              <Link
                key={yakin.slug}
                href={`/mahalleler/${yakin.slug}`}
                className="flex flex-col gap-1 rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-gold"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-navy">{yakin.isim}</span>
                  {yakin.durum === "yakinda" && (
                    <span className="shrink-0 rounded-full bg-surface-muted px-2 py-0.5 text-[11px] font-semibold text-muted">
                      Yakında
                    </span>
                  )}
                </div>
                <span className="text-xs text-muted">~{uzaklikKm.toFixed(1)} km</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(mahalleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(hizmetJsonLd) }}
      />
      {siteListJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteListJsonLd) }}
        />
      )}
    </div>
  );
}
