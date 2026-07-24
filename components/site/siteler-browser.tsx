"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { SiteCard } from "@/components/site/site-card";
import { SearchIcon } from "@/components/ui/icons";

/** Liste görünümü için inceltilmiş site verisi — kartta yalnız ilk üç satır
 * göründüğünden tam açıklama yerine kısa özet taşınır (sayfa ağırlığını
 * ciddi düşürür; tam metin site detay sayfasında). */
export interface SiteOzet {
  isim: string;
  slug: string;
  mahalleSlug: string;
  aciklama: string;
  alternatifAdlar?: string[];
}

interface SitelerBrowserProps {
  gruplar: { mahalle: { slug: string; isim: string }; siteler: SiteOzet[] }[];
  /** Diğer sekmede (Eryaman ↔ Yenimahalle) arama eşleşmesi önermek için:
   * yalnız ad listesi taşınır — iki bölge listede karışmaz (Özgün'ün kuralı),
   * ama kaybolan arama diğer sekmeye yönlendirilir. */
  digerSekme?: { etiket: string; href: string; adlar: string[] };
}

export function SitelerBrowser({ gruplar, digerSekme }: SitelerBrowserProps) {
  const [sorgu, setSorgu] = useState("");

  // Prefill from a ?ara= query (e.g. the homepage hero search) without opting
  // the statically-rendered page into useSearchParams / Suspense.
  useEffect(() => {
    const id = window.setTimeout(() => {
      const ara = new URLSearchParams(window.location.search).get("ara");
      if (ara) setSorgu(ara);
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  // Bitişik yazımlar da eşleşsin ("eryamanevleri" → "Eryaman Evleri").
  const normalize = (s: string) => s.toLocaleLowerCase("tr");
  const duz = (s: string) => normalize(s).replace(/\s+/g, "");
  const ertelenmisSorgu = useDeferredValue(sorgu);
  const sorguNormalized = normalize(ertelenmisSorgu.trim());
  const sorguDuz = duz(ertelenmisSorgu.trim());

  const filtreliGruplar = useMemo(() => {
    if (!sorguNormalized) return gruplar;

    return gruplar
      .map(({ mahalle, siteler }) => {
        // Mahalle adı yazıldıysa o mahallenin tüm siteleri listelenir.
        if (normalize(mahalle.isim).includes(sorguNormalized)) return { mahalle, siteler };
        return {
          mahalle,
          siteler: siteler.filter(
            (site) =>
              normalize(site.isim).includes(sorguNormalized) ||
              duz(site.isim).includes(sorguDuz) ||
              (site.alternatifAdlar ?? []).some(
                (ad) => normalize(ad).includes(sorguNormalized) || duz(ad).includes(sorguDuz)
              )
          ),
        };
      })
      .filter((grup) => grup.siteler.length > 0);
  }, [gruplar, sorguNormalized]);

  const toplamEslesme = filtreliGruplar.reduce((sum, grup) => sum + grup.siteler.length, 0);

  const digerSekmeEslesme = useMemo(() => {
    if (!digerSekme || !sorguNormalized || toplamEslesme > 0) return 0;
    return digerSekme.adlar.filter((ad) => normalize(ad).includes(sorguNormalized) || duz(ad).includes(sorguDuz)).length;
  }, [digerSekme, sorguNormalized, toplamEslesme]);

  return (
    <div>
      <div className="relative max-w-md">
        <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          type="search"
          value={sorgu}
          onChange={(event) => setSorgu(event.target.value)}
          placeholder="Site, rezidans veya mahalle adı ile arayın…"
          aria-label="Site, rezidans veya mahalle adı ile arayın"
          className="w-full rounded-xl border border-border bg-surface px-4 py-3 pl-11 text-sm text-navy outline-none focus:border-gold focus:ring-2 focus:ring-gold/30"
        />
      </div>

      {!sorguNormalized && (
        <nav className="mt-4 flex flex-wrap gap-2" aria-label="Mahalleye atla">
          {gruplar.map(({ mahalle, siteler }) => (
            <a
              key={mahalle.slug}
              href={`#m-${mahalle.slug}`}
              className="cursor-pointer rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-body transition-colors hover:border-gold hover:text-gold-dark"
            >
              {mahalle.isim.replace(/\s*Mahallesi$/, "")} ({siteler.length})
            </a>
          ))}
        </nav>
      )}

      {sorgu.trim() && (
        <p className="mt-3 text-sm text-muted">
          {toplamEslesme > 0 ? (
            `${toplamEslesme} sonuç bulundu.`
          ) : digerSekmeEslesme > 0 && digerSekme ? (
            <>
              Bu listede sonuç yok; ancak {digerSekme.etiket} tarafında {digerSekmeEslesme}{" "}
              eşleşme var:{" "}
              <Link
                href={`${digerSekme.href}?ara=${encodeURIComponent(sorgu.trim())}`}
                className="font-semibold text-gold-dark hover:underline"
              >
                {digerSekme.etiket} listesine geçin →
              </Link>
            </>
          ) : (
            <>
              Sonuç bulunamadı. Farklı bir isim deneyin veya{" "}
              <Link href="/iletisim" className="font-semibold text-gold-dark hover:underline">
                bize doğrudan sorun.
              </Link>
            </>
          )}
        </p>
      )}

      <div className="mt-8 space-y-14">
        {filtreliGruplar.map(({ mahalle, siteler }) => (
          <section key={mahalle.slug} id={`m-${mahalle.slug}`} className="scroll-mt-24">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-xl">
                <Link
                  href={`/mahalleler/${mahalle.slug}`}
                  className="cursor-pointer hover:text-gold-dark hover:underline"
                >
                  {mahalle.isim}
                </Link>
              </h2>
              <span className="text-sm text-muted">{siteler.length} site/rezidans</span>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {siteler.map((site) => (
                <SiteCard key={site.slug} site={site} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
