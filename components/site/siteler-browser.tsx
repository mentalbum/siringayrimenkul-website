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
  /** Kayıt metninde YAZILI daire tipleri (lib/kunye.ts'ten türetilir).
   * Tanımsız/boş = kayıtta daire tipi yazmıyor; o tipin YOKLUĞU değil. */
  odaTipleri?: string[];
}

interface SitelerBrowserProps {
  gruplar: { mahalle: { slug: string; isim: string }; siteler: SiteOzet[] }[];
}

const normalize = (s: string) => s.toLocaleLowerCase("tr");
/** "2,5+1" → 2.5 — süzgeç şeridini küçükten büyüğe dizmek için. */
const odaTipiSira = (tip: string) => {
  const [oda, salon] = tip.split("+");
  return Number.parseFloat(oda.replace(",", ".")) * 10 + Number.parseInt(salon, 10);
};
// Bitişik yazımlar da eşleşsin ("eryamanevleri" → "Eryaman Evleri").
const duz = (s: string) => normalize(s).replace(/\s+/g, "");

export function SitelerBrowser({ gruplar }: SitelerBrowserProps) {
  const [sorgu, setSorgu] = useState("");
  const [odaTipi, setOdaTipi] = useState<string | null>(null);

  // Prefill from a ?ara= query (e.g. the homepage hero search) without opting
  // the statically-rendered page into useSearchParams / Suspense.
  //
  // Daire tipi HASH'te taşınır (#oda=2+1), sorgu parametresinde değil: sorgu
  // dizesinde "+" boşluğa çözülür ("?oda=2+1" → "2 1") ve süzgeç hiç eşleşmez.
  // Hash ayrıca sunucuya gitmez — sayfa statik kalır, Google aynı adresi sayar,
  // canonical'a dokunulmaz ve 520 taranabilir iç bağ prerender HTML'inde durur.
  useEffect(() => {
    const hashOku = () => {
      const hash = window.location.hash.match(/^#oda=(.+)$/);
      setOdaTipi(hash ? decodeURIComponent(hash[1]) : null);
    };
    const id = window.setTimeout(() => {
      const ara = new URLSearchParams(window.location.search).get("ara");
      if (ara) setSorgu(ara);
      hashOku();
    }, 0);
    // Adres çubuğunda hash değiştirmek sayfayı yeniden mount etmez; süzgeç
    // paylaşılan linkte olduğu gibi burada da uyanık kalsın. (odaTipiSec
    // replaceState kullanıyor, o olay üretmiyor — geri besleme döngüsü yok.)
    window.addEventListener("hashchange", hashOku);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener("hashchange", hashOku);
    };
  }, []);

  const odaTipiSec = (tip: string | null) => {
    setOdaTipi(tip);
    // Adres çubuğu paylaşılabilir kalsın ama geçmiş kirlenmesin.
    const temiz = window.location.pathname + window.location.search;
    window.history.replaceState(null, "", tip ? `${temiz}#oda=${encodeURIComponent(tip)}` : temiz);
  };

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
  }, [gruplar, sorguNormalized, sorguDuz]);

  const toplamEslesme = filtreliGruplar.reduce((sum, grup) => sum + grup.siteler.length, 0);

  /* DAİRE TİPİ SÜZGECİ — üç kova, hiçbir kayıt silinmez.
   *
   * Klasik faset davranışı (eşleşmeyeni listeden düşürmek) burada YANLIŞ bilgi
   * üretir: listedeki kayıtların çoğunda daire tipi notu hiç yok, onları sessizce
   * silmek "bu sitede 2+1 yok" demek olur. Oysa boş liste yalnızca kayıtta
   * yazmadığını gösterir (lib/kunye.ts: "yokluk kanıt değildir").
   *
   * Kova 1: seçili tip kayıtta yazılı → normal listede.
   * Kova 2: yazılı ama başka tip / hiç not yok → açılır blokta, erişilebilir.
   * Kova 3 (yapılmadı): kayıtta "dairelerin tamamı X" yazan siteleri gerçekten
   *   hariç tutmak. Otomatiğe bırakılamaz — ölçüldü: altay/betontas-bloklari
   *   "bu bloklarda dairelerin tamamı 3+1" diyor ama aynı kayıtta 1+1 de var
   *   (cümle blok kapsamlı, site kapsamlı değil). Elle onay gerekir.
   *
   * Süzgeç ARAMA filtresinden SONRA uygulanır; böylece mahalle adı yazıldığında
   * grubu süzmeden döndüren kısa devre dalını da kapsar. */
  const odaSuzulmus = useMemo(() => {
    if (!odaTipi) {
      return { gruplar: filtreliGruplar, baskaTipli: [] as SiteOzet[], notsuzAdet: 0 };
    }
    // Eşleşmeyenler iki farklı güven düzeyinde: kaydında BAŞKA tip yazılı olanlar
    // (bilgi verici, adları listelenir) ve daire tipi notu hiç olmayanlar
    // (yalnız sayı — 362 site adını basmak bloğu okunmaz hâle getirir, kayıtların
    // hepsi "Tümü" görünümünde zaten duruyor).
    const baskaTipli: SiteOzet[] = [];
    let notsuzAdet = 0;
    const kalan = filtreliGruplar
      .map(({ mahalle, siteler }) => {
        const esleser: SiteOzet[] = [];
        for (const site of siteler) {
          if (site.odaTipleri?.includes(odaTipi)) esleser.push(site);
          else if (site.odaTipleri?.length) baskaTipli.push(site);
          else notsuzAdet += 1;
        }
        return { mahalle, siteler: esleser };
      })
      .filter((grup) => grup.siteler.length > 0);
    return { gruplar: kalan, baskaTipli, notsuzAdet };
  }, [filtreliGruplar, odaTipi]);

  const gosterilenGruplar = odaSuzulmus.gruplar;
  const odaEslesme = gosterilenGruplar.reduce((sum, grup) => sum + grup.siteler.length, 0);

  /* Buton şeridi sayaçları. Sayılar KODDA hesaplanır, elle yazılmaz: elle
   * yazılan kapsama sayısı içerik büyüdükçe sessizce yanlışa döner. */
  const tipSayaclari = useMemo(() => {
    const say = new Map<string, number>();
    let notluSite = 0;
    let toplamSite = 0;
    for (const { siteler } of gruplar) {
      for (const site of siteler) {
        toplamSite += 1;
        if (!site.odaTipleri?.length) continue;
        notluSite += 1;
        for (const tip of site.odaTipleri) say.set(tip, (say.get(tip) ?? 0) + 1);
      }
    }
    // Yalnız kayda değer tipler şeride girer; "7+1 (1)" gibi tek kayıtlık
    // kuyruk şeridi şişirip asıl tipleri gölgeliyor.
    const siralanmis = [...say.entries()]
      .filter(([, adet]) => adet >= 5)
      .sort((a, b) => odaTipiSira(a[0]) - odaTipiSira(b[0]));
    return { tipler: siralanmis, notluSite, toplamSite };
  }, [gruplar]);

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

      {tipSayaclari.tipler.length > 0 && (
        <>
          <div
            className="-mx-4 mt-4 flex snap-x gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0"
            role="group"
            aria-label="Kayıtta yazılı daire tipine göre süzün"
          >
            <span className="shrink-0 self-center pr-1 text-xs font-semibold uppercase tracking-wide text-muted">
              Kayıtta yazılı daire tipi
            </span>
            <button
              type="button"
              onClick={() => odaTipiSec(null)}
              aria-pressed={odaTipi === null}
              className={`shrink-0 snap-start cursor-pointer rounded-full border px-3 py-2 text-xs font-medium transition-colors sm:py-1.5 ${
                odaTipi === null
                  ? "border-gold bg-gold/10 text-gold-dark"
                  : "border-border bg-surface text-body hover:border-gold hover:text-gold-dark"
              }`}
            >
              Tümü ({tipSayaclari.toplamSite})
            </button>
            {tipSayaclari.tipler.map(([tip, adet]) => (
              <button
                key={tip}
                type="button"
                onClick={() => odaTipiSec(odaTipi === tip ? null : tip)}
                aria-pressed={odaTipi === tip}
                className={`shrink-0 snap-start cursor-pointer rounded-full border px-3 py-2 text-xs font-medium transition-colors sm:py-1.5 ${
                  odaTipi === tip
                    ? "border-gold bg-gold/10 text-gold-dark"
                    : "border-border bg-surface text-body hover:border-gold hover:text-gold-dark"
                }`}
              >
                {tip} ({adet})
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs leading-relaxed text-muted">
            Rozetler ve bu süzgeç, kayıt metnimizde geçen daire tiplerini gösterir; bir sitenin
            tüm daire tipleri bunlar olmak zorunda değil. {tipSayaclari.toplamSite} kaydın{" "}
            {tipSayaclari.notluSite}&apos;inde daire tipi notu var, kalanında bu bilgi hiç yazılı
            değil.
          </p>
        </>
      )}

      {odaTipi && (
        <p className="mt-3 text-sm leading-relaxed text-body" aria-live="polite">
          Kayıtlarımızda <strong>{odaTipi}</strong> notu düşülmüş {odaEslesme}
          {" site. Bu, Eryaman'daki "}
          {odaTipi} dairelerin tam listesi değil — yalnızca arşivimizde bu tipin yazılı olduğu
          kayıtlar.{" "}
          <Link href="/iletisim" className="font-semibold text-gold-dark hover:underline">
            Sitenizin daire tipini biliyorsanız kaydı birlikte tamamlayalım.
          </Link>
        </p>
      )}

      {!sorguNormalized && !odaTipi && (
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
        {gosterilenGruplar.map(({ mahalle, siteler }) => (
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

      {odaTipi && (odaSuzulmus.baskaTipli.length > 0 || odaSuzulmus.notsuzAdet > 0) && (
        <details className="mt-12 rounded-2xl border border-border bg-surface-muted p-5">
          <summary className="cursor-pointer text-sm font-semibold text-navy">
            {`Kayıtta ${odaTipi} notu bulunmayan siteler — burada da ${odaTipi} olabilir`}
          </summary>
          <p className="mt-3 text-sm leading-relaxed text-body">
            {`Aşağıdaki kayıtlarda ${odaTipi} yazılı değil. Bu, o sitede ${odaTipi} daire olmadığı anlamına gelmez; yalnızca arşivimizde böyle bir not düşülmediğini gösterir. Bu yüzden hiçbirini listeden çıkarmıyoruz.`}
          </p>

          {odaSuzulmus.notsuzAdet > 0 && (
            <p className="mt-4 text-sm leading-relaxed text-body">
              <strong>{odaSuzulmus.notsuzAdet}</strong>
              {" sitenin kaydında daire tipi hiç yazılı değil. Bu kayıtlar “Tümü” görünümünde duruyor."}
            </p>
          )}

          {odaSuzulmus.baskaTipli.length > 0 && (
            <>
              <p className="mt-4 text-sm leading-relaxed text-body">
                <strong>{odaSuzulmus.baskaTipli.length}</strong>
                {" sitenin kaydında başka daire tipi yazılı — o kayıtlar bu tipi anmıyor:"}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {odaSuzulmus.baskaTipli.map((site) => (
                  <Link
                    key={`${site.mahalleSlug}-${site.slug}`}
                    href={`/mahalleler/${site.mahalleSlug}/${site.slug}`}
                    className="cursor-pointer rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-navy transition-colors hover:border-gold hover:text-gold-dark"
                  >
                    {site.isim}
                    <span className="text-muted">{` · kayıtta ${site.odaTipleri!.join(", ")}`}</span>
                  </Link>
                ))}
              </div>
            </>
          )}
        </details>
      )}
    </div>
  );
}
