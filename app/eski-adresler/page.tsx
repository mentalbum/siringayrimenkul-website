import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { getAdaEntriesByRouteKey, getSiteBySlug } from "@/lib/content";
import { ESKI_ADRES_DENEYI_TEDAVI } from "@/lib/eski-adres-deneyi-1410";

/* DENEY SAYFASI — geçici. Tasarım, okuma tarihi (28.10) ve kaldırma koşulu
 * lib/eski-adres-deneyi-1410.ts başındaki açıklamada. Buradaki bağlar
 * BİLEREK eski şemaya (308 veren adrese) gider ve düz <a>'dır: amaç
 * Googlebot'un taranan bir sayfadan eski adresi izleyip 308'i görmesi.
 * next/link KULLANMA (prefetch/istemci geçişi deneyin konusu değil) ve
 * bağlara rel/nofollow EKLEME. Sayfa noindex,follow; site haritasına girmez.
 * Bağ METNİ varisin okunur adıdır; eski yol yanında ada-parsel numarası
 * gizlenerek gösterilir (kural: görünür metinde çıplak ada/parsel no yok; bu
 * sayfa ada sayfası değil). Googlebot href'i izler, metni değil — tasarım
 * (50 bağ, sıra, rel yok) etkilenmez. */
export const metadata: Metadata = {
  title: { absolute: "Taşınan adresler | Şirin Gayrimenkul" },
  description:
    "26 Temmuz 2026'da yenilenen mahalle sayfası adreslerinin eski biçimleri ve kalıcı olarak yönlendirildikleri yeni sayfalar.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/eski-adresler" },
};

const ADA_YOLU = /^\/mahalleler\/([^/]+)\/adalar\/([^/]+)$/;
const SITE_YOLU = /^\/mahalleler\/([^/]+)\/([^/]+)$/;

/** Yolun GÖRÜNÜR biçimi: ada yolunda son parça (ada-parsel numarası) "…" ile
 * gizlenir; site yolu olduğu gibi. href'e dokunmaz — izlenen adres tam eski yoldur. */
function yolGoster(yol: string): string {
  return yol.replace(ADA_YOLU, "/mahalleler/$1/adalar/…");
}

/** Varisin okunur adı: site sayfası → site adı; ada sayfası → parselin sahibi
 * site(ler)in adı + "ada sayfası" (ada numarası görünür metne basılmaz; sahip
 * bulunamazsa da yol numarası gizlenerek basılır). */
function varisAdi(varis: string): string {
  const ada = varis.match(ADA_YOLU);
  if (ada) {
    const sahipler = [...new Set(getAdaEntriesByRouteKey(ada[1], ada[2]).map((e) => e.site.isim))];
    return sahipler.length > 0 ? `${sahipler.join(" / ")} (ada sayfası)` : yolGoster(varis);
  }
  const site = varis.match(SITE_YOLU);
  if (site) return getSiteBySlug(site[1], site[2])?.isim ?? varis;
  return varis;
}

export default function EskiAdreslerPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Breadcrumbs
        items={[
          { label: "Anasayfa", href: "/" },
          { label: "Taşınan adresler", href: "/eski-adresler" },
        ]}
      />

      <header className="mt-4">
        <h1 className="text-3xl sm:text-4xl">Taşınan adresler</h1>
        <p className="mt-4 text-base leading-relaxed text-body">
          26 Temmuz 2026&apos;da mahalle sayfalarının adresleri &ldquo;-mahallesi&rdquo; ekiyle
          yenilendi. Aşağıdaki eski adresler yeni sayfalarına kalıcı olarak yönlendirilir;
          yer imlerinizi güncelleyebilirsiniz.
        </p>
      </header>

      <ul className="mt-8 divide-y divide-border text-sm leading-relaxed text-body">
        {ESKI_ADRES_DENEYI_TEDAVI.map(({ eski, varis }) => (
          <li key={eski} className="flex flex-col gap-0.5 py-2.5 sm:flex-row sm:items-baseline sm:gap-3">
            <span className="break-all font-mono text-muted">{yolGoster(eski)}</span>
            <span>
              <span aria-hidden="true" className="text-muted">→ </span>
              <a href={eski} className="font-semibold text-gold-dark hover:underline">
                {varisAdi(varis)}
              </a>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
