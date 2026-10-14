import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { getAdaEntriesByRouteKey, getSiteBySlug } from "@/lib/content";
import { ESKI_ADRES_DENEYI_TEDAVI } from "@/lib/eski-adres-deneyi-1410";

/* DENEY SAYFASI — geçici. Tasarım, okuma tarihi (28.10) ve kaldırma koşulu
 * lib/eski-adres-deneyi-1410.ts başındaki açıklamada. Buradaki bağlar
 * BİLEREK eski şemaya (308 veren adrese) gider ve düz <a>'dır: amaç
 * Googlebot'un taranan bir sayfadan eski adresi izleyip 308'i görmesi.
 * next/link KULLANMA (prefetch/istemci geçişi deneyin konusu değil) ve
 * bağlara rel/nofollow EKLEME. Sayfa noindex,follow; site haritasına girmez. */
export const metadata: Metadata = {
  title: { absolute: "Taşınan adresler | Şirin Gayrimenkul" },
  description:
    "26 Temmuz 2026'da yenilenen mahalle sayfası adreslerinin eski biçimleri ve kalıcı olarak yönlendirildikleri yeni sayfalar.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/eski-adresler" },
};

const ADA_YOLU = /^\/mahalleler\/([^/]+)\/adalar\/([^/]+)$/;
const SITE_YOLU = /^\/mahalleler\/([^/]+)\/([^/]+)$/;

/** Varisin okunur adı: site sayfası → site adı; ada sayfası → parselin sahibi
 * site(ler)in adı + "ada sayfası" (ada numarası görünür metne basılmaz). */
function varisAdi(varis: string): string {
  const ada = varis.match(ADA_YOLU);
  if (ada) {
    const sahipler = [...new Set(getAdaEntriesByRouteKey(ada[1], ada[2]).map((e) => e.site.isim))];
    return sahipler.length > 0 ? `${sahipler.join(" / ")} (ada sayfası)` : varis;
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
            <a href={eski} className="break-all font-mono text-gold-dark hover:underline">
              {eski}
            </a>
            <span className="text-muted">
              <span aria-hidden="true">→ </span>
              {varisAdi(varis)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
