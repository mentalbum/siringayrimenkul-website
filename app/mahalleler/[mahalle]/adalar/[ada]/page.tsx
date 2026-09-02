import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import {
  adaDisplayLabel,
  adaRouteKey,
  getAdaEntriesByRouteKey,
  getAllAdalar,
  getAllMahalleler,
  getMahalleBySlug,
  mahalleKisaIsim,
  getSiteBoundary,
} from "@/lib/content";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { CtaButton } from "@/components/ui/button";
import { TrackedCtaLink } from "@/components/ui/tracked-cta-link";
import { CtaBanner } from "@/components/ui/cta-banner";
import { FaqSection } from "@/components/ui/faq-section";
import { getAdaFaq } from "@/lib/faq";
import { MahalleMapLoader } from "@/components/maps/mahalle-map-loader";
import { ResourceHints } from "@/components/seo/resource-hints";
import { ArrowRightIcon } from "@/components/ui/icons";
import { siteConfig } from "@/lib/site-config";
import { blokOzellikleri, tapuCumlesi } from "@/lib/ada-bilgi";
import { adaOnayliEtap } from "@/lib/etap-onayli";
import { ustBolgeEtiketi } from "@/lib/bolge";
import { bulunmaHaliKi, tamlayanEk } from "@/lib/turkce";

type Props = {
  params: Promise<{ mahalle: string; ada: string }>;
};

export function generateStaticParams() {
  // Bir parseli birden fazla site paylaşabilir — rota anahtarlarını tekilleştir.
  return getAllMahalleler().flatMap((mahalle) =>
    Array.from(new Set(getAllAdalar(mahalle.slug).map((ada) => adaRouteKey(ada)))).map((key) => ({
      mahalle: mahalle.slug,
      ada: key,
    }))
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { mahalle: mahalleSlug, ada: adaKey } = await params;
  const mahalle = getMahalleBySlug(mahalleSlug);
  const entries = getAdaEntriesByRouteKey(mahalleSlug, adaKey);
  if (!mahalle || entries.length === 0) return {};
  const ada = entries[0];

  const label = adaDisplayLabel(ada);
  return {
    // BAŞLIĞIN GEÇMİŞİ (üç tur, her biri ölçümle):
    //   01.08 — Başlık site adıyla açacak şekilde çevrildi ("46512/9 Ada — Su
    //           Damlası Sitesi" -> "Su Damlası Sitesi 46512/9 Ada"): sayfa
    //           hangi yerleşimden söz ettiğini ancak satırın sonunda
    //           söylüyordu, ilk bakışta tanınsın istendi.
    //   09.08 — Ticari kalıp ("… Ada Emlakçı | Evinizi Satalım, Kiraya…")
    //           söküldü: ada ve site sayfası AYNI kalıbı taşıyordu ve pws=0
    //           ölçümünde 32 vakada Google ada sayfasını seçiyordu. Başlık
    //           sayfanın gerçek işlevini söyler oldu (tapu + blok künyesi).
    //   16.08 — SİTE ADI da çıkarıldı (aşağıdaki not).
    //
    // SİTE ADI BAŞLIKTAN ÇIKARILDI (2026-08-16, Özgün kararı) — ada sayfası site
    // sayfasını yiyordu ve canonical bu işi çözemiyor.
    //
    // 09.08'de başlıktan ticari kalıp ("… Ada Emlakçı | Evinizi Satalım…")
    // sökülmüştü ama site adı kalmıştı; "STFA Blokları 17673/1 Ada" başlığı
    // "stfa blokları emlakçı" sorgusuyla hâlâ eşleşiyordu. 16.08 pws=0
    // ölçümünde Tunahan'ın 25 sitesinin 7'sinde ada sayfası site sayfasının
    // ÖNÜNDE çıktı; 5'inde site sayfası ilk 10'da hiç yoktu.
    //
    // Neden canonical yetmedi: 200 ada sayfalık GSC denetiminde, yeni etiketi
    // görmüş 34 sayfanın 32'sinde Google canonical'ı REDDETTİ (kabul %6).
    // Canonical yalnız birbirinin KOPYASI sayfalar arasında dinlenir; bu sayfa
    // site sayfasının kopyası değil. Ayrıntı: ada-canonical-olcumu-2026-08-16.md.
    //
    // Tanınırlık NEREDE KALIYOR: site adı H1'de, giriş cümlesinde (site
    // sayfasına bağla) ve JSON-LD'de duruyor — 01.08'de "sayfa ilk bakışta
    // tanınsın" diye alınan karar sayfa içinde korunuyor. Değişen yalnız arama
    // sonucundaki satır: orada artık mahalle adı var, çünkü site adı orada
    // dururken Google iki sayfamızı aynı sorguda yarıştırıyor.
    //
    // Ada numarası başlıkta kalır: "17666 ada satılık daire" tipi aramalar da
    // karşılansın. ABSOLUTE: kök şablonun "| Şirin Gayrimenkul" eki eklenmez
    // (başlık 96 karaktere çıkıyordu, Google ~60'ta kesiyor).
    //
    // UZUNLUK: mahalle adı "Mahallesi" ekiyle yazılınca ve "Bilgileri"
    // kullanılınca en uzun mahallede 73 karaktere çıkıyordu — 10.08'de mahalle
    // başlıklarında düzeltilen hatanın aynısı. Kısa ad + "Künyesi" ile bant
    // 51-60'a indi, hepsi Google'ın kesme sınırının içinde.
    title: {
      absolute: `${mahalleKisaIsim(mahalle)} ${label} Ada — Tapu ve Blok Künyesi | ${ustBolgeEtiketi(mahalle)}`,
    },
    description: `${mahalle.isim} ${label} Ada'nın tapu niteliği, blok künyesi ve konum bilgileri. Bu adada daireniz varsa değerini konuşalım: ${siteConfig.phoneDisplay}.`,
    // ASIL SAYFA = SİTE SAYFASI (2026-08-02).
    //
    // Ölçüm: 298 sitelik canlı SERP taramasında 51 sitede Google, site adı
    // arandığında site sayfası yerine BU ada sayfasını gösteriyordu (Şeyh
    // Şamil'de oran %45). Yani zenginleştirdiğimiz site sayfaları aramada
    // görünmüyor, yerlerine kimsenin "17312 ada" diye aramadığı sayfalar
    // çıkıyordu.
    //
    // Önce yönlendirme denendi (cda17a7), Özgün'ün kararıyla geri alındı:
    // sayfalar ziyaretçi için değerli (tapu niteliği, blok künyesi, komşu
    // adalar, harita) ve başlıkları site adıyla açılacak şekilde düzeltildi.
    // Bu çözüm sayfayı YERİNDE BIRAKIR ama arama motoruna asıl sürümün site
    // sayfası olduğunu söyler: canonical site sayfasına işaret eder ve
    // topladığı sinyal oraya akar.
    //
    // noindex KALDIRILDI çünkü ikisi bir arada çelişkili sinyaldir — noindex
    // gören Google canonical'ı hiç değerlendirmez, sayfayı olduğu gibi bırakır
    // (nitekim bugüne kadar öyle oldu: noindex'e rağmen 51 vakada sayfa SERP'te
    // duruyordu, çünkü Google onu yeniden tarayıp etiketi görmemişti).
    //
    // 16.08 ÖLÇÜMÜ — BU CANONICAL ÇALIŞMIYOR, GÜVENME:
    // 200 tek siteli ada sayfası GSC URL Inspection ile denetlendi. 03.08
    // sonrası taranmış 34 sayfanın hepsinde bizim canonical'ımız doğru okunmuş,
    // ama Google 32'sinde REDDETMİŞ (kendi adresini kanonik seçmiş, "Submitted
    // and indexed"); kabul oranı %6. Sebep: canonical yalnız birbirinin KOPYASI
    // sayfalar arasında dinlenir, bu sayfa site sayfasının kopyası değil.
    // Etiket kalıyor (maliyeti yok, 2 sayfada işe yarıyor) ama kanibalizasyon
    // çözümü olarak SAYILMAZ. Ayrıntı: ada-canonical-olcumu-2026-08-16.md.
    //
    // Paylaşımlı parselde (bir adada birden çok site) tek bir doğru hedef
    // olmadığı için sayfa kendi kanonik sürümü olarak kalır ve noindex sürer.
    alternates: {
      canonical:
        entries.length === 1
          ? `/mahalleler/${mahalle.slug}/${ada.site.slug}`
          : `/mahalleler/${mahalle.slug}/adalar/${adaKey}`,
    },
    ...(entries.length > 1 && { robots: { index: false, follow: true } }),
  };
}

export default async function AdaPage({ params }: Props) {
  const { mahalle: mahalleSlug, ada: adaKey } = await params;
  const mahalle = getMahalleBySlug(mahalleSlug);
  const entries = getAdaEntriesByRouteKey(mahalleSlug, adaKey);
  if (!mahalle) notFound();
  if (entries.length === 0) {
    // PARSELSİZ ESKİ ADRES KURTARMA (2026-08-08).
    // Rota anahtarı 01.07'de "<ada>" iken "<ada>-<parsel>" oldu; öncesinde
    // yayınlanmış ~658 adres o günden beri 404 veriyor ve GSC her turda yeni
    // bir "Bulunamadı" partisi raporluyordu. Bugüne dek yalnız 3'ü elle
    // yamanmıştı (next.config.ts) — bu hızla açık hiç kapanmaz.
    // Kural: aynı mahallede o ada numarasına TEK site karşılık geliyorsa o
    // sitenin sayfasına, birden çok site varsa mahalle sayfasına kalıcı
    // yönlendir. Hedef ada sayfası DEĞİL site sayfası: ada sayfasının
    // kanonik'i zaten site sayfasını gösteriyor, araya bir hop koymanın
    // anlamı yok.
    const ayniNumarali = getAllAdalar(mahalleSlug).filter((item) => item.no === adaKey);
    if (ayniNumarali.length > 0) {
      const siteSluglari = new Set(ayniNumarali.map((item) => item.site.slug));
      permanentRedirect(
        siteSluglari.size === 1
          ? `/mahalleler/${mahalleSlug}/${ayniNumarali[0].site.slug}`
          : `/mahalleler/${mahalleSlug}`
      );
    }
    notFound();
  }
  const ada = entries[0];

  const label = adaDisplayLabel(ada);
  // Sayfa boyunca tek bir ad: "Su Damlası Sitesi 46512/9 Ada". Paylaşımlı
  // parselde tek bir site adı olmadığı için sade ada etiketi kullanılır.
  const adaEtiketi = entries.length > 1 ? `${label} Ada` : `${ada.site.isim} ${label} Ada`;
  const dogrulanmisEtap = adaOnayliEtap(ada.no);
  const tumAdalar = getAllAdalar(mahalleSlug);
  const ayniEtapMap = new Map(
    tumAdalar
      .filter((item) => item.etap === ada.etap && adaRouteKey(item) !== adaKey)
      .map((item) => [adaRouteKey(item), item] as const)
  );
  const buNo = Number.parseInt(ada.no, 10);
  // 4 komşu yeter (bağ sayısı 12'den 4'e indirilmişti: kenar ağırlığının %22'si,
  // PR kütlesinin %15,6'sı burada park ediyordu — grafta ölçüldü).
  //
  // 2026-08-08: bu bağların HEDEFİ de değişti. Eskiden komşu ADA sayfasına
  // gidiyorlardı; 812 ada × 4 = 3.248 bağ, iç bağ kütlesinin %73'ü, kanonik'i
  // BAŞKA sayfayı gösteren bir kümenin içinde dönüyordu — ada kümesinden
  // dizine giren sayfalara çıkan bağ oranı 4'te 0'dı. Artık komşunun SİTE
  // sayfasına gidiyorlar: aynı komşuluk bilgisi, ama değer dizindeki sayfalara
  // akıyor.
  //
  // 16.08 ÖLÇÜMÜ bu kararı güçlendirdi: eski yorumların dayandığı "bu sayfalar
  // noindex" varsayımı iki kez bayatlamıştı (noindex 03.08'de kalktı) ve
  // yerine gelen canonical de çalışmıyor (200 sayfalık GSC denetiminde kabul
  // %6). Gerçek durum: 200 ada sayfasının 115'i KENDİ BAŞINA DİZİNDE ve site
  // sayfasıyla yarışıyor — ada→ada bağı doğrudan o rakibi besliyordu.
  //
  // Aynı siteye ait birden çok ada komşu çıkabildiği için site slug'ına göre
  // tekilleştiriliyor, sayfanın kendi sitesi de listeden düşüyor — yoksa
  // "diğer siteler" listesinde kendini gösteren kart oluşuyordu.
  const gorulenSite = new Set<string>([ada.site.slug]);
  const ayniEtaptakiler = Array.from(ayniEtapMap.values())
    .sort(
      (a, b) =>
        Math.abs(Number.parseInt(a.no, 10) - buNo) - Math.abs(Number.parseInt(b.no, 10) - buNo)
    )
    .filter((item) => {
      if (gorulenSite.has(item.site.slug)) return false;
      gorulenSite.add(item.site.slug);
      return true;
    })
    .slice(0, 4);

  const adaJsonLd = {
    "@context": "https://schema.org",
    "@type": "Place",
    // Site adı çıkarıldı (16.08) — bkz. H1 notundaki gerekçe. Sayfadaki hangi
    // site(ler)in bu parselde olduğu bilgisi kaybolmuyor: aşağıdaki description
    // alanında ve görünür giriş cümlesinde site adı geçiyor ve site sayfasına
    // bağ veriyor.
    name: `${label} Ada — ${mahalle.isim}`,
    description: `${label} Ada, ${mahalle.isim} içinde yer alır (${entries
      .map((entry) => entry.site.isim)
      .join(", ")}).`,
    url: `${siteConfig.url}/mahalleler/${mahalle.slug}/adalar/${adaKey}`,
    ...(ada.site.koordinat && {
      geo: {
        "@type": "GeoCoordinates",
        latitude: ada.site.koordinat.lat,
        longitude: ada.site.koordinat.lng,
      },
    }),
    containedInPlace: {
      "@type": "Place",
      name: mahalle.isim,
      url: `${siteConfig.url}/mahalleler/${mahalle.slug}`,
    },
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <Breadcrumbs
        items={[
          { label: "Anasayfa", href: "/" },
          { label: "Mahalleler", href: "/mahalleler" },
          { label: mahalle.isim, href: `/mahalleler/${mahalle.slug}` },
          { label: `${label} Ada`, href: `/mahalleler/${mahalle.slug}/adalar/${adaKey}` },
        ]}
      />

      <header className="mt-4 max-w-3xl">
        {/* Etap etiketi yalnız resmî ada listesiyle doğrulanmış etaplarda çıkar
            (lib/etap-onayli.ts) — kayıttaki ada.etap alanı tek başına yetmez. */}
        <p className="text-sm font-semibold uppercase tracking-wide text-gold-dark">
          {mahalle.isim}
          {dogrulanmisEtap && (
            <>
              {" · "}
              <Link
                href={`/mahalleler/${mahalle.slug}/etaplar/${dogrulanmisEtap}`}
                className="cursor-pointer hover:underline"
              >
                Eryaman {dogrulanmisEtap}. Etap
              </Link>
            </>
          )}
        </p>
        {/* H1'DEN SİTE ADI ÇIKARILDI (2026-08-16, Özgün kararı: "isim
            aratmalarında ada sayfaları görünmesin; ada aratmasında görünebilir").
            H1 sayfadaki en güçlü tek sinyaldi ve "STFA Blokları 17673/1 Ada"
            biçimi site adı sorgusuyla tam eşleşiyordu.

            NEDEN KAYIPSIZ: 90 günlük GSC sorgu dökümünde (1000 sorgu) ada
            numarasıyla yapılmış ARAMA YOK — "1ada" (2 gösterim, poz. 24) dışında
            hiçbiri; "ada" geçen sorguların tamamı site adının içindeki hece
            ("meydan ada sitesi", "ada loft", "cabadağ blokları"). Yani site adı
            burada dururken hiçbir arama kazandırmıyordu, sadece site sayfasıyla
            yarışıyordu.

            ZİYARETÇİ NE GÖRÜYOR: hemen üstteki mahalle/etap satırı ve hemen
            alttaki giriş cümlesi ("… Ada, X Mahallesi içinde yer alan Y
            Sitesi'nin bir parçasıdır") site adını söylüyor ve site sayfasına
            bağ veriyor — o bağ artık bu sayfanın topladığı değeri site
            sayfasına akıtan asıl kanal. */}
        <h1 className="mt-2 text-3xl sm:text-4xl">{label} Ada</h1>
      </header>

      <div className={`mt-8 grid gap-8 ${ada.site.koordinat ? "lg:grid-cols-[1.1fr_1fr]" : ""}`}>
        <div className="space-y-4">
          {entries.length === 1 ? (
            <p className="text-base leading-relaxed text-body">
              {label} Ada, {mahalle.isim} içinde yer alan{" "}
              <Link
                href={`/mahalleler/${mahalle.slug}/${ada.site.slug}`}
                className="font-semibold text-navy hover:text-gold-dark"
              >
                {ada.site.isim}
              </Link>
              {tamlayanEk(ada.site.isim)} bir parçasıdır
              {ada.blok ? ` (${ada.blok} Blok)` : ""}.
            </p>
          ) : (
            <>
              <p className="text-base leading-relaxed text-body">
                {`${label} Ada, ${mahalle.isim} içinde yer alır ve bu parselde ${entries.length} ayrı site bulunur:`}
              </p>
              <div className="grid gap-2">
                {entries.map((entry) => (
                  <Link
                    key={entry.site.slug}
                    href={`/mahalleler/${mahalle.slug}/${entry.site.slug}`}
                    className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-sm font-semibold text-navy transition-colors hover:border-gold hover:text-gold-dark"
                  >
                    {entry.site.isim}
                    <ArrowRightIcon className="h-3.5 w-3.5 shrink-0" />
                  </Link>
                ))}
              </div>
            </>
          )}
          {/* Bu parselin tapu kimliği — ziyaretçi kendi adasını arayıp geldiğinde
              aradığı bilgi ilk ekranda olsun. Paylaşımlı adalarda aynı tapu
              cümlesi her site için tekrar etmesin: tek kez gösterilir, bloklar
              site adıyla ayrı listelenir. */}
          {(() => {
            const tapuMetinleri = Array.from(
              new Set(entries.map((entry) => tapuCumlesi(entry.site)).filter(Boolean))
            ) as string[];
            const blokSatirlari = entries
              .map((entry) => ({ isim: entry.site.isim, bloklar: blokOzellikleri(entry.site) }))
              .filter((satir) => satir.bloklar.length > 0);
            if (tapuMetinleri.length === 0 && blokSatirlari.length === 0) return null;
            return (
              <div className="rounded-2xl border border-border bg-surface-muted p-5">
                {tapuMetinleri.map((metin) => (
                  <p key={metin} className="text-sm leading-relaxed text-body [&+p]:mt-2">
                    {metin}
                  </p>
                ))}
                {blokSatirlari.map((satir) => (
                  <div key={satir.isim} className="mt-3">
                    {entries.length > 1 && (
                      <p className="text-xs font-semibold text-navy">{satir.isim}</p>
                    )}
                    <ul className="mt-1.5 flex flex-wrap gap-2">
                      {satir.bloklar.map((blok) => (
                        <li
                          key={blok}
                          className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-body"
                        >
                          {blok}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            );
          })()}
          {!ada.site.koordinat && (
            <CtaButton href={`/mahalleler/${mahalle.slug}`} variant="outline">
              {mahalle.isim} Haritasını Görüntüle
            </CtaButton>
          )}
        </div>
        {ada.site.koordinat && (
          <div className="h-[320px] overflow-hidden rounded-2xl border border-border lg:h-full">
            <ResourceHints />
            <MahalleMapLoader
              center={ada.site.koordinat}
              siteler={entries.map((entry) => ({
                site: entry.site,
                boundary: getSiteBoundary(entry.site),
              }))}
              parseleOdakla
            />
          </div>
        )}
      </div>

      {/* ADANIN İÇİNDEN SAHA FOTOĞRAFLARI (2026-08-17, Özgün kararı:
          "fotoğrafların hepsini 46499 adanın içine yükleyelim, 46499'u açınca
          uyumlu olsun").

          Fotoğraf ADA düzeyinde tutuluyor (adalar[].gorseller), site düzeyinde
          değil: bir site birden çok adaya yayılabiliyor (Aktürk Sitesi =
          46499/2 + 46501/2) ve 46499'un bahçesini 46501 sayfasında göstermek
          yanlış olur. Paylaşımlı parselde (entries.length > 1) galeri BASILMAZ:
          orada hangi sitenin fotoğrafı olduğu belirsiz kalır.

          İlk görsel öncelikli yüklenir (sayfanın en büyük görsel öğesi), geri
          kalanı tembel. Filigran ve telif akışı: scripts/filigran.mjs. */}
      {entries.length === 1 && (ada.gorseller?.length ?? 0) > 0 && (
        <section className="mt-12">
          <h2 className="text-xl">{`${label} Ada'nın İçinden`}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
            {`${ada.site.isim} ${label} adasında kendi çektiğimiz fotoğraflar.`}
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ada.gorseller!.map((yol, i) => (
              <div
                key={yol}
                className="overflow-hidden rounded-2xl border border-border bg-surface-muted"
              >
                <Image
                  src={yol}
                  alt={`${ada.site.isim} ${label} ada — saha fotoğrafı ${i + 1}`}
                  width={1440}
                  height={1080}
                  sizes="(min-width: 1024px) 380px, (min-width: 640px) 45vw, 100vw"
                  priority={i === 0}
                  loading={i === 0 ? undefined : "lazy"}
                  className="h-auto w-full object-cover"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      <CtaBanner
        className="mt-12"
        /* Site adı BU başlıktan çıkarıldı (16.08): sayfadaki en güçlü ikinci
           eşleşme buydu — site adı + ticari niyet ("satmak/kiraya vermek") aynı
           başlıkta buluşunca "<site adı> emlakçı" sorgusuna site sayfası kadar
           iyi cevap veriyordu. Ada numarası yeterli bağlam: hemen üstteki H1
           zaten site adını söylüyor. */
        baslik={`${label} Ada'da Satmak veya Kiraya Vermek İstediğiniz Bir Eviniz mi Var?`}
        aciklama="Fiyatı ve satış yol haritasını birlikte netleştirelim; doğrudan bizimle çalışın, aynı gün dönüş alın."
      >
        <CtaButton
          href={`/ev-degerleme?mahalle=${mahalle.slug}&site=${ada.site.slug}`}
          variant="primary"
        >
          Evinizi Değerlendirelim
        </CtaButton>
        {/* Site sayfasındaki gibi üç kapı: form herkese göre değil, kimi arar
            kimi yazar. Mobilde başlıkta telefon görünmediği için burada
            tıklanabilir olması şart. */}
        <TrackedCtaLink
          href={`${siteConfig.whatsappUrl}?text=${encodeURIComponent(
            `Merhaba! ${adaEtiketi} (${mahalle.isim}) — buradaki dairem için satış/kiralama değerlendirmesi almak istiyorum.`
          )}`}
          gaEvent="whatsapp_click" gaParams={{ konum: "ada" }}
          variant="outline-light"
          openInNewTab
        >
          WhatsApp&apos;tan Yazın
        </TrackedCtaLink>
        <TrackedCtaLink
          href={`tel:${siteConfig.phoneTel}`}
          gaEvent="phone_click" gaParams={{ konum: "ada" }}
          variant="outline-light"
        >
          {siteConfig.phoneDisplay}
        </TrackedCtaLink>
      </CtaBanner>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(adaJsonLd) }}
      />

      {ayniEtaptakiler.length > 0 && (
        <section className="mt-14">
          <h2 className="text-xl">
            {ada.etap ? (
              <>
                <Link
                  href={`/mahalleler/${mahalle.slug}/etaplar/${ada.etap}`}
                  className="cursor-pointer hover:text-gold-dark hover:underline"
                >
                  Eryaman {ada.etap}. Etap
                </Link>
                &apos;taki Komşu Siteler
              </>
            ) : (
              `${bulunmaHaliKi(mahalle.isim)} Komşu Siteler`
            )}
          </h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ayniEtaptakiler.map((item) => (
              <Link
                key={adaRouteKey(item)}
                href={`/mahalleler/${mahalle.slug}/${item.site.slug}`}
                className="group flex cursor-pointer items-center justify-between gap-2 rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-gold"
              >
                {/* Site adı ÖNDE, ada numarası altta: kart artık site sayfasına
                    gidiyor, başlık da gidilen yeri söylemeli (bağ hedefi
                    değişirken etiket eskisi gibi kalırsa ziyaretçi "ada
                    sayfası" bekleyip site sayfasına düşer). */}
                <div>
                  <p className="text-sm font-semibold text-navy">{item.site.isim}</p>
                  <p className="text-xs text-muted">{adaDisplayLabel(item)} Ada</p>
                </div>
                <ArrowRightIcon className="h-4 w-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-gold-dark" />
              </Link>
            ))}
          </div>
        </section>
      )}

      <FaqSection
        /* Site adı çıkarıldı (16.08) — bkz. CTA başlığındaki not. Sorular zaten
           ada numarasıyla kuruluyor (lib/faq.ts getAdaFaq). */
        title={`${label} Ada Hakkında Sık Sorulan Sorular`}
        items={getAdaFaq(label, entries, mahalle)}
      />
    </div>
  );
}
