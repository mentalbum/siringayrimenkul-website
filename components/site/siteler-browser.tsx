"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Mahalle, Site } from "@/lib/types";
import { SiteCard } from "@/components/site/site-card";
import { SearchIcon } from "@/components/ui/icons";

interface SitelerBrowserProps {
  gruplar: { mahalle: Mahalle; siteler: Site[] }[];
}

export function SitelerBrowser({ gruplar }: SitelerBrowserProps) {
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

  const filtreliGruplar = useMemo(() => {
    const normalize = (s: string) => s.toLocaleLowerCase("tr");
    const sorguNormalized = normalize(sorgu.trim());
    if (!sorguNormalized) return gruplar;

    return gruplar
      .map(({ mahalle, siteler }) => ({
        mahalle,
        siteler: siteler.filter(
          (site) =>
            normalize(site.isim).includes(sorguNormalized) ||
            (site.alternatifAdlar ?? []).some((ad) => normalize(ad).includes(sorguNormalized))
        ),
      }))
      .filter((grup) => grup.siteler.length > 0);
  }, [gruplar, sorgu]);

  const toplamEslesme = filtreliGruplar.reduce((sum, grup) => sum + grup.siteler.length, 0);

  return (
    <div>
      <div className="relative max-w-md">
        <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          type="search"
          value={sorgu}
          onChange={(event) => setSorgu(event.target.value)}
          placeholder="Site veya rezidans adı ile arayın…"
          aria-label="Site veya rezidans adı ile arayın"
          className="w-full rounded-xl border border-border bg-surface px-4 py-3 pl-11 text-sm text-navy outline-none focus:border-gold focus:ring-2 focus:ring-gold/30"
        />
      </div>

      {sorgu.trim() && (
        <p className="mt-3 text-sm text-muted">
          {toplamEslesme > 0
            ? `${toplamEslesme} sonuç bulundu.`
            : "Sonuç bulunamadı. Farklı bir isim deneyin veya "}
          {toplamEslesme === 0 && (
            <Link href="/iletisim" className="font-semibold text-gold-dark hover:underline">
              bize doğrudan sorun.
            </Link>
          )}
        </p>
      )}

      <div className="mt-8 space-y-14">
        {filtreliGruplar.map(({ mahalle, siteler }) => (
          <section key={mahalle.slug}>
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
