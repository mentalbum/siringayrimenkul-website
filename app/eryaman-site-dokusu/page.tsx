import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { CtaBanner } from "@/components/ui/cta-banner";
import { TrackedCtaLink } from "@/components/ui/tracked-cta-link";
import { ustBolgeEtiketi } from "@/lib/bolge";
import { getAllMahalleler, getSitelerByMahalle } from "@/lib/content";
import { cikarKunye } from "@/lib/kunye";
import { siteConfig } from "@/lib/site-config";
import { OZGUN_ID, organizationRef } from "@/lib/structured-data";

/** Eryaman Site Dokusu — TKGM tabanlı, FİYATSIZ yapı raporu. Amaç: yerel
 * basının ve diğer sitelerin "Kaynak: Şirin Gayrimenkul" diyeceği, bayatlamayan
 * bir referans sayfa (linkable asset). Fiyat/kira rakamı bilinçli olarak yok;
 * rakamlar tapu ve kayıt verisinden türetildiği için enflasyonla eskimez.
 * Veri kesiti damgası elle güncellenir (yapay tazelik yok). */

const VERI_KESITI = "Temmuz 2026";

export const metadata: Metadata = {
  // absolute: marka eki kaldırıldı, başlık 60 karakterin altında (bkz.
  // app/siteler/page.tsx'teki gerekçe — 2026-08-08 başlık uzunluğu turu).
  title: { absolute: "Eryaman Site Dokusu Raporu — Tapu Verisiyle Analiz" },
  description:
    "Eryaman ve çevresindeki 700'den fazla konut sitesinin tapu tabanlı yapı analizi: kat mülkiyeti oranı, kat yükseklikleri, parsel büyüklükleri ve mahalle dağılımı. TKGM kayıtlarına dayalı, fiyatsız referans rapor.",
  alternates: { canonical: "/eryaman-site-dokusu" },
};

const S = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 });

export default function SiteDokusuPage() {
  const mahalleler = getAllMahalleler();
  const kayitlar = mahalleler.flatMap((mahalle) =>
    getSitelerByMahalle(mahalle.slug).map((site) => ({
      site,
      mahalle,
      kunye: cikarKunye(site),
    }))
  );

  const toplam = kayitlar.length;
  const tapulu = kayitlar.filter((k) => k.kunye.tapuNiteligi);
  const mulkiyet = tapulu.filter((k) => k.kunye.tapuNiteligi === "kat mülkiyeti").length;
  const irtifak = tapulu.filter((k) => k.kunye.tapuNiteligi === "kat irtifakı").length;
  const karmaTapu = tapulu.length - mulkiyet - irtifak;

  const katli = kayitlar.filter((k) => k.kunye.katMax !== undefined);
  const katKovalari: Array<[string, (n: number) => boolean]> = [
    ["1-4 kat (villa/az katlı)", (n) => n <= 4],
    ["5-8 kat", (n) => n >= 5 && n <= 8],
    ["9-12 kat", (n) => n >= 9 && n <= 12],
    ["13 kat ve üzeri", (n) => n >= 13],
  ];

  const villa = kayitlar.filter((k) => k.kunye.yapiTipi === "villa/dubleks").length;

  const alanli = kayitlar
    .filter((k) => k.kunye.parselAlaniM2 !== undefined)
    .sort((a, b) => b.kunye.parselAlaniM2! - a.kunye.parselAlaniM2!);
  const enGenis = alanli.slice(0, 10);
  const enYuksek = [...katli]
    .sort((a, b) => b.kunye.katMax! - a.kunye.katMax!)
    .slice(0, 10);

  const mahalleSatirlari = mahalleler
    .map((mahalle) => ({
      mahalle,
      adet: kayitlar.filter((k) => k.mahalle.slug === mahalle.slug).length,
    }))
    .filter((m) => m.adet > 0)
    .sort((a, b) => b.adet - a.adet);

  const datasetJsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "Eryaman ve Çevresi Site Dokusu Verisi",
    description:
      "Eryaman (Etimesgut) ve komşu Yenimahalle mahallelerindeki 700'den fazla konut sitesinin tapu tabanlı yapı verisi: tapu niteliği, kat yapısı, parsel alanı, mahalle dağılımı.",
    url: `${siteConfig.url}/eryaman-site-dokusu`,
    creator: organizationRef,
    maintainer: { "@id": OZGUN_ID },
    spatialCoverage: { "@type": "Place", name: "Eryaman, Etimesgut ve çevresi, Ankara" },
    license: `${siteConfig.url}/eryaman-site-dokusu#kaynak-gosterme`,
    isAccessibleForFree: true,
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetJsonLd) }}
      />
      <Breadcrumbs
        items={[
          { label: "Anasayfa", href: "/" },
          { label: "Eryaman Site Dokusu", href: "/eryaman-site-dokusu" },
        ]}
      />

      <header className="mt-4 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-gold-dark">
          Rapor · Veri kesiti: {VERI_KESITI}
        </p>
        <h1 className="mt-2 text-3xl sm:text-4xl">Eryaman Site Dokusu Raporu</h1>
        <p className="mt-4 text-base leading-relaxed text-body">
          Eryaman ve çevresindeki {S.format(toplam)} konut sitesini tek tek dolaşıp TKGM tapu
          kayıtlarıyla eşleştirdik. Bu rapor o çalışmanın toplu fotoğrafıdır: bölge kaç katlı
          yaşıyor, tapular hangi aşamada, parseller ne büyüklükte. Bilinçli olarak fiyat
          içermez — buradaki veriler enflasyonla bayatlamaz.
        </p>
      </header>

      <section className="mt-10">
        <h2 className="text-xl">Tapu niteliği: bölge kat mülkiyetine geçmiş durumda</h2>
        {/* Sayılara apostroflu ek BAĞLANMAZ ("30'si" faciası): veriler değişince
            ek uyumsuz kalır. Cümleler "N site" kalıbıyla kurulur. */}
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-body">
          Kayıt metinlerinde tapu niteliği belirtilen {S.format(tapulu.length)} site şöyle
          dağılıyor: kat mülkiyetli parselde <strong>{S.format(mulkiyet)} site</strong>, kat
          irtifaklı parselde <strong>{S.format(irtifak)} site</strong>
          {karmaTapu > 0 ? `; ${S.format(karmaTapu)} kayıtta iki nitelik bir arada görülüyor` : ""}
          . Oran, bölge yapı stokunun büyük bölümünün iskân sürecini tamamlamış olgun siteler
          olduğunu gösteriyor — satış dosyası açısından önemli bir yapısal özellik.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl">Kat yapısı dağılımı</h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-body">
          Kat bilgisi kayıtlı {S.format(katli.length)} site içinde dağılım şöyle
          ({S.format(villa)} site villa/dubleks dokulu):
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {katKovalari.map(([etiket, kosul]) => {
            const adet = katli.filter((k) => kosul(k.kunye.katMax!)).length;
            return (
              <div key={etiket} className="rounded-2xl border border-border bg-surface p-5">
                <p className="text-2xl font-semibold text-navy">{S.format(adet)}</p>
                <p className="mt-1 text-sm text-body">{etiket}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl">Mahalle dağılımı</h2>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-border">
          <table className="w-full min-w-[420px] border-collapse bg-surface text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-muted text-left">
                <th className="px-4 py-3 font-semibold text-muted">Mahalle</th>
                <th className="px-4 py-3 font-semibold text-muted">Bölge</th>
                <th className="px-4 py-3 text-right font-semibold text-muted">Kayıtlı site</th>
              </tr>
            </thead>
            <tbody>
              {mahalleSatirlari.map(({ mahalle, adet }) => (
                <tr key={mahalle.slug} className="border-b border-border last:border-b-0">
                  <td className="px-4 py-2.5">
                    <Link
                      href={`/mahalleler/${mahalle.slug}`}
                      className="font-semibold text-navy underline-offset-2 hover:text-gold-dark hover:underline"
                    >
                      {mahalle.isim}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 text-body">{ustBolgeEtiketi(mahalle)}</td>
                  <td className="px-4 py-2.5 text-right text-body">{S.format(adet)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="text-xl">En geniş parseller (TKGM)</h2>
          <ol className="mt-4 space-y-2 text-sm">
            {enGenis.map(({ site, mahalle, kunye }, i) => (
              <li key={site.slug} className="flex items-baseline justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-2.5">
                <span>
                  <span className="mr-2 font-semibold text-gold-dark">{i + 1}.</span>
                  <Link
                    href={`/mahalleler/${mahalle.slug}/${site.slug}`}
                    className="font-semibold text-navy underline-offset-2 hover:text-gold-dark hover:underline"
                  >
                    {site.isim}
                  </Link>
                </span>
                <span className="shrink-0 text-body">≈ {S.format(kunye.parselAlaniM2!)} m²</span>
              </li>
            ))}
          </ol>
        </div>
        <div>
          <h2 className="text-xl">En yüksek katlı siteler</h2>
          <ol className="mt-4 space-y-2 text-sm">
            {enYuksek.map(({ site, mahalle, kunye }, i) => (
              <li key={site.slug} className="flex items-baseline justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-2.5">
                <span>
                  <span className="mr-2 font-semibold text-gold-dark">{i + 1}.</span>
                  <Link
                    href={`/mahalleler/${mahalle.slug}/${site.slug}`}
                    className="font-semibold text-navy underline-offset-2 hover:text-gold-dark hover:underline"
                  >
                    {site.isim}
                  </Link>
                </span>
                <span className="shrink-0 text-body">{kunye.katMax} kat</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mt-12 max-w-3xl" id="yontem">
        <h2 className="text-xl">Yöntem</h2>
        <p className="mt-3 text-sm leading-relaxed text-body">
          Rapordaki her satır, sitemizdeki tekil site kayıtlarından türetilmiştir; kayıtlar TKGM
          (Tapu ve Kadastro Genel Müdürlüğü) parsel sorgu verileri, tapu kayıtlarındaki yapı
          tanımları ve saha bilgisiyle derlenir. Kayıt metninde belirtilmeyen alan hesaba
          katılmaz — tahmin ya da tamamlama yapılmaz; bu yüzden bazı toplamlar{" "}
          {S.format(toplam)} sitelik bütünün altında kalır. Derleme yöntemimizin tamamı{" "}
          <Link href="/hakkimizda#yontem" className="font-semibold text-gold-dark underline-offset-2 hover:underline">
            Hakkımızda
          </Link>{" "}
          sayfasında; site bazlı ayrıntılar{" "}
          <Link href="/araclar/site-karsilastirma" className="font-semibold text-gold-dark underline-offset-2 hover:underline">
            Site Karşılaştırma Aracı
          </Link>
          nda ve tekil site sayfalarındadır.
        </p>
      </section>

      <section className="mt-8 max-w-3xl rounded-2xl border border-gold/40 bg-gold/5 p-5" id="kaynak-gosterme">
        <h2 className="text-lg">Basın ve yayıncılar için</h2>
        <p className="mt-2 text-sm leading-relaxed text-body">
          Bu rapordaki veriler, kaynak gösterilerek serbestçe kullanılabilir:{" "}
          <strong>&quot;Kaynak: Şirin Gayrimenkul — siringayrimenkul.com/eryaman-site-dokusu&quot;</strong>.
          Mahalle veya site bazında ayrıntı isteyen yayıncılar {siteConfig.phoneDisplay}{" "}
          numarasından Özgün Şirin&apos;e ulaşabilir.
        </p>
      </section>

      <CtaBanner
        size="large"
        className="mt-14"
        baslik="Bu dokunun içinde sizin de bir daireniz var"
        aciklama="Raporu derleyen ekip, sitenizi ada-parsel düzeyinde tanıyor. Satış ya da kiralama düşünüyorsanız değerleme görüşmesiyle başlayalım."
      >
        <TrackedCtaLink href="/ev-degerleme" gaEvent="doku_degerleme_cta" variant="primary">
          Evinizi Değerlendirelim
        </TrackedCtaLink>
        <TrackedCtaLink
          href={`tel:${siteConfig.phoneTel}`}
          gaEvent="doku_tel_cta"
          variant="outline-light"
        >
          {siteConfig.phoneDisplay}
        </TrackedCtaLink>
      </CtaBanner>
    </div>
  );
}
