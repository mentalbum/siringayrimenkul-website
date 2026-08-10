import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  adaDisplayLabel,
  adaRouteKey,
  getAdaEntriesByRouteKey,
  getAllAdalar,
  getAllMahalleler,
  getMahalleBySlug,
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
  // Başlıkta ÖNCE site adı, sonra ada numarası (Özgün kararı, 2026-08-01):
  // "46512/9 Ada — Su Damlası Sitesi" biçiminde arama sonucunda çıkan sayfa,
  // hangi yerleşimden söz ettiğini ancak satırın sonunda söylüyordu. Ada
  // numarasını kimse ezbere bilmez, site adını herkes bilir — sıralama
  // tersine çevrildi, sayfa ilk bakışta tanınsın. Ada numarası başlıkta
  // kalır: "17666 ada satılık daire" tipi aramalar da karşılansın.
  return {
    // TİCARİ KALIP KALDIRILDI (2026-08-09) — ada sayfası site sayfasını yiyordu.
    //
    // Ölçüm (pws=0, 187 site): 32 vakada Google, "<site adı> emlakçı"
    // aramasında site sayfasının yerine BU ada sayfasını gösterdi. Sebep
    // başlıkta çıplak gözle görülüyordu — iki sayfa aynı kalıbı taşıyordu:
    //   ada  : "STFA Blokları 17673/1 Ada Emlakçı | Evinizi Satalım, Kiraya…"
    //   site : "STFA Blokları Emlakçı | Eryaman | Evinizi Satalım, Kiraya…"
    // Aranan dizi ("STFA Blokları … emlakçı") ikisinde de tam eşleşiyor,
    // Google da zaman zaman ada sayfasını seçiyordu. Ziyaretçi site sayfası
    // yerine ada listesine düşüyor.
    //
    // Artık başlık sayfanın GERÇEK işlevini söylüyor (tapu niteliği + blok
    // künyesi — sayfanın içeriği zaten bu). Site adı korunuyor: kimse
    // "17673 ada" diye aramaz, tanınırlık site adından gelir. Ada numarası da
    // duruyor, "17666 ada satılık daire" tipi aramalar karşılansın.
    // Bu, canonical'a EK bir katman: canonical Google'ın sayfayı yeniden
    // taramasını bekler, başlık ise tarandığı an ayrımı netleştirir.
    //
    // ABSOLUTE: kök şablonun "| Şirin Gayrimenkul" eki burada da eklenmez —
    // site sayfalarında 2026-08-07'de kaldırılmıştı, ada sayfaları atlanmış ve
    // başlık 96 karaktere çıkıyordu (Google ~60'ta kesiyor).
    title: {
      absolute:
        entries.length > 1
          ? `${mahalle.isim} ${label} Ada — Tapu ve Blok Bilgileri | ${ustBolgeEtiketi(mahalle)}`
          : `${ada.site.isim} ${label} Ada — Tapu ve Blok Bilgileri | ${ustBolgeEtiketi(mahalle)}`,
    },
    description:
      entries.length > 1
        ? `${label} Ada'nın tapu niteliği, üzerindeki yapılar ve konum bilgileri. Bu adada daireniz varsa değerini konuşalım: ${siteConfig.phoneDisplay}.`
        : `${ada.site.isim} ${label} Ada'nın tapu niteliği, blok künyesi ve konum bilgileri. Bu adada daireniz varsa değerini konuşalım: ${siteConfig.phoneDisplay}.`,
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
  if (!mahalle || entries.length === 0) notFound();
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
  // 4 komşu ada yeter: bu sayfalar noindex, ada→ada bağları PageRank'i noindex
  // kümesinin içinde döndürüyordu (12 bağla kenar ağırlığının %22'si, PR
  // kütlesinin %15,6'sı burada park ediyordu — grafta ölçüldü). Bağ sayısı
  // düşünce sayfanın çıkış ağırlığı site/mahalle bağlarına kayar, değer
  // dizindeki sayfalara geri akar. Ziyaretçi yine en yakın numaralı 4 adayı
  // görür; kayıp yok.
  const ayniEtaptakiler = Array.from(ayniEtapMap.values())
    .sort(
      (a, b) =>
        Math.abs(Number.parseInt(a.no, 10) - buNo) - Math.abs(Number.parseInt(b.no, 10) - buNo)
    )
    .slice(0, 4);

  const adaJsonLd = {
    "@context": "https://schema.org",
    "@type": "Place",
    name:
      entries.length > 1
        ? `${label} Ada — ${mahalle.isim}`
        : `${label} Ada — ${ada.site.isim}`,
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
        {/* Sayfa başlığı da site adıyla açılır — ziyaretçi hangi yerleşime
            baktığını ilk satırda görsün (bkz. generateMetadata notu). */}
        <h1 className="mt-2 text-3xl sm:text-4xl">{adaEtiketi}</h1>
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

      <CtaBanner
        className="mt-12"
        baslik={`${adaEtiketi}'da Satmak veya Kiraya Vermek İstediğiniz Bir Eviniz mi Var?`}
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
          gaEvent="ada_whatsapp_cta"
          variant="outline-light"
          openInNewTab
        >
          WhatsApp&apos;tan Yazın
        </TrackedCtaLink>
        <TrackedCtaLink
          href={`tel:${siteConfig.phoneTel}`}
          gaEvent="phone_click"
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
                &apos;taki Diğer Adalar
              </>
            ) : (
              `${bulunmaHaliKi(mahalle.isim)} Diğer Adalar`
            )}
          </h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ayniEtaptakiler.map((item) => (
              <Link
                key={adaRouteKey(item)}
                href={`/mahalleler/${mahalle.slug}/adalar/${adaRouteKey(item)}`}
                className="group flex cursor-pointer items-center justify-between gap-2 rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-gold"
              >
                <div>
                  <p className="text-sm font-semibold text-navy">{adaDisplayLabel(item)} Ada</p>
                  <p className="text-xs text-muted">{item.site.isim}</p>
                </div>
                <ArrowRightIcon className="h-4 w-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-gold-dark" />
              </Link>
            ))}
          </div>
        </section>
      )}

      <FaqSection
        title={`${adaEtiketi} Hakkında Sık Sorulan Sorular`}
        items={getAdaFaq(label, entries, mahalle)}
      />
    </div>
  );
}
