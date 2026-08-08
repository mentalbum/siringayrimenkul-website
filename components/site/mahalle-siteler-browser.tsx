"use client";

import { useDeferredValue, useMemo, useState } from "react";
import Link from "next/link";
import { SiteCard } from "@/components/site/site-card";
import type { SiteOzet } from "@/components/site/siteler-browser";
import { SearchIcon } from "@/components/ui/icons";

/** Tek mahallenin site listesini gezilebilir kılar: /siteler'deki
 * SitelerBrowser ile aynı arama dili (aynı kutu, aynı sonuç cümleleri), ama
 * mahalle içi olduğu için gruplama yerine baş harf süzgeci kullanır.
 *
 * Liste HTML'de tam hâliyle durur: bileşen istemci bileşeni olsa da sunucuda
 * ön-render edilir ve ilk çıktıda hiçbir süzgeç seçili değildir — süzme yalnız
 * hidrasyondan sonra devreye girer. */

/** Altında arama kutusu gösterilmeyen liste uzunluğu — kısa listede kutu
 * gürültüden ibaret (en küçük mahalle 16 kayıt). */
const ARAMA_ESIGI = 12;
/** Baş harf şeritinin açıldığı uzunluk: bu boydan sonra kart duvarını gözle
 * taramak zorlaşıyor. */
const HARF_ESIGI = 30;

/** Türkçe klavyesiz yazım da eşleşsin ("cinar" → "Çınar", "sirin" → "Şirin"):
 * küçült, birleşen işaretleri (ç, ş, ğ, ü, ö) ayrıştırıp at, noktasız ı'yı i'ye
 * indir. Kendi sitesini arayan ev sahibi çoğu zaman düz harfle yazıyor. */
const normalize = (s: string) =>
  s
    .toLocaleLowerCase("tr")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replaceAll("ı", "i");
// Bitişik yazımlar da eşleşsin ("eryamanevleri" → "Eryaman Evleri").
const duz = (s: string) => normalize(s).replace(/\s+/g, "");

/** Rakamla açılan adlar ("75. Yıl Sitesi", "10. Botanik Evleri") tek "#"
 * kovasında toplanır; harf de rakam da değilse karakterin kendisi kova olur —
 * "#" böylece yalnız "rakamla başlayan" anlamına gelir. */
function basHarf(isim: string): string {
  const ilk = isim.trim().charAt(0);
  if (/\d/.test(ilk)) return "#";
  return ilk.toLocaleUpperCase("tr");
}

interface MahalleSitelerBrowserProps {
  siteler: SiteOzet[];
  /** Mahallede eşleşme çıkmazsa aynı sorguyu taşıyacağımız bölge arşivi.
   * Yenimahalle mahalleleri Eryaman listesine gönderilmez (bkz. lib/bolge.ts). */
  arsiv: { etiket: string; href: string };
}

export function MahalleSitelerBrowser({ siteler, arsiv }: MahalleSitelerBrowserProps) {
  const [sorgu, setSorgu] = useState("");
  const [harf, setHarf] = useState<string | null>(null);

  const ertelenmisSorgu = useDeferredValue(sorgu);
  const sorguNormalized = normalize(ertelenmisSorgu.trim());
  const sorguDuz = duz(ertelenmisSorgu.trim());

  const harfler = useMemo(() => {
    const sayilar = new Map<string, number>();
    for (const site of siteler) {
      const h = basHarf(site.isim);
      sayilar.set(h, (sayilar.get(h) ?? 0) + 1);
    }
    return [...sayilar.entries()].sort(([a], [b]) => a.localeCompare(b, "tr"));
  }, [siteler]);

  const filtreli = useMemo(() => {
    if (sorguNormalized) {
      return siteler.filter(
        (site) =>
          normalize(site.isim).includes(sorguNormalized) ||
          duz(site.isim).includes(sorguDuz) ||
          (site.alternatifAdlar ?? []).some(
            (ad) => normalize(ad).includes(sorguNormalized) || duz(ad).includes(sorguDuz)
          )
      );
    }
    if (harf) return siteler.filter((site) => basHarf(site.isim) === harf);
    return siteler;
  }, [siteler, sorguNormalized, sorguDuz, harf]);

  const aramaVar = siteler.length >= ARAMA_ESIGI;
  const harfSeridiVar = siteler.length >= HARF_ESIGI;

  return (
    <div>
      {aramaVar && (
        /* Gerçek GET formu: JS çalışmadan da kutu bölge arşivinde arama yapar
           (aynı desen components/home/hero-search.tsx'te). JS varken Enter
           sayfadan atmasın diye submit engellenir — liste zaten süzülmüştür. */
        <form
          action={arsiv.href}
          method="get"
          role="search"
          onSubmit={(event) => event.preventDefault()}
          className="relative max-w-md"
        >
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            name="ara"
            type="search"
            value={sorgu}
            onChange={(event) => {
              setSorgu(event.target.value);
              setHarf(null);
            }}
            placeholder="Sitenizin adını yazın…"
            aria-label="Bu mahalledeki siteler içinde ada göre arayın"
            className="w-full rounded-xl border border-border bg-surface px-4 py-3 pl-11 text-sm text-navy outline-none focus:border-gold focus:ring-2 focus:ring-gold/30"
          />
        </form>
      )}

      {harfSeridiVar && !sorgu.trim() && (
        <div
          className="mt-4 flex flex-wrap gap-2"
          role="group"
          aria-label="Site adının baş harfine göre süzün"
        >
          <button
            type="button"
            onClick={() => setHarf(null)}
            aria-pressed={harf === null}
            className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              harf === null
                ? "border-gold bg-gold/10 text-gold-dark"
                : "border-border bg-surface text-body hover:border-gold hover:text-gold-dark"
            }`}
          >
            Tümü ({siteler.length})
          </button>
          {harfler.map(([h, adet]) => (
            <button
              key={h}
              type="button"
              onClick={() => setHarf(harf === h ? null : h)}
              aria-pressed={harf === h}
              className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                harf === h
                  ? "border-gold bg-gold/10 text-gold-dark"
                  : "border-border bg-surface text-body hover:border-gold hover:text-gold-dark"
              }`}
            >
              {h} ({adet})
            </button>
          ))}
        </div>
      )}

      <p className="mt-3 text-sm text-muted" aria-live="polite">
        {sorgu.trim() ? (
          filtreli.length > 0 ? (
            `${filtreli.length} sonuç bulundu.`
          ) : (
            <>
              Bu mahallede eşleşme yok.{" "}
              <Link
                href={`${arsiv.href}?ara=${encodeURIComponent(sorgu.trim())}`}
                className="font-semibold text-gold-dark hover:underline"
              >
                {arsiv.etiket} listesinin tamamında arayın
              </Link>{" "}
              veya{" "}
              <Link href="/iletisim" className="font-semibold text-gold-dark hover:underline">
                bize doğrudan sorun.
              </Link>
            </>
          )
        ) : harf ? (
          harf === "#" ? (
            `Rakamla başlayan ${filtreli.length} site/rezidans.`
          ) : (
            `“${harf}” ile başlayan ${filtreli.length} site/rezidans.`
          )
        ) : (
          `${siteler.length} site/rezidans listelendi.`
        )}
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtreli.map((site) => (
          <SiteCard key={site.slug} site={site} />
        ))}
      </div>
    </div>
  );
}
