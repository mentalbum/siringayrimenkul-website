"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { katGosterimi, type KunyeSatiri } from "@/lib/kunye";
import { sendGAEvent } from "@/lib/ga";
import { bulunmaHali } from "@/lib/turkce";

/** Site Karşılaştırma Aracı — fiyat/aidat bilinçli olarak YOK (güncel piyasa
 * rakamı sitede yayınlanmaz kuralı + enflasyonda bayatlama). Karşılaştırılan
 * her alan kayıt metinlerinden çıkarılan tapu tabanlı veridir; kayıtta
 * belirtilmeyen alan "—" gösterilir, asla tahmin edilmez. */

const M2 = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 });

/** Deterministik, yalnız mevcut alanlardan kurulan karşılaştırma özeti. */
function ozetCumleleri(secili: KunyeSatiri[]): string[] {
  const cumleler: string[] = [];
  const alanlilar = secili.filter((s) => s.alanM2 !== undefined);
  if (alanlilar.length >= 2) {
    const enGenis = alanlilar.reduce((a, b) => (b.alanM2! > a.alanM2! ? b : a));
    cumleler.push(
      `Seçtikleriniz arasında en geniş parsel ${bulunmaHali(enGenis.isim)} (yaklaşık ${M2.format(enGenis.alanM2!)} m², TKGM).`
    );
  }
  const mulkiyetliler = secili.filter((s) => s.tapu === "kat mülkiyeti");
  if (mulkiyetliler.length > 0 && mulkiyetliler.length < secili.length) {
    cumleler.push(
      `Kayıtlarımıza göre kat mülkiyetli parselde yer alan: ${mulkiyetliler.map((s) => s.isim).join(", ")}.`
    );
  }
  const katlilar = secili.filter((s) => s.katMax !== undefined);
  if (katlilar.length >= 2) {
    const enYuksek = katlilar.reduce((a, b) => (b.katMax! > a.katMax! ? b : a));
    const enAz = katlilar.reduce((a, b) => (b.katMax! < a.katMax! ? b : a));
    if (enYuksek.slug !== enAz.slug && enYuksek.katMax !== enAz.katMax) {
      cumleler.push(
        `${enYuksek.isim} ${enYuksek.katMax} kata ulaşan yapısıyla en yüksek, ${enAz.isim} ise ${enAz.katMax} katla en alçak ölçekli seçenek.`
      );
    }
  }
  return cumleler;
}

export function SiteKarsilastirma({ veri }: { veri: KunyeSatiri[] }) {
  const [arama, setArama] = useState("");
  const [secili, setSecili] = useState<KunyeSatiri[]>([]);

  const adaylar = useMemo(() => {
    const q = arama.toLocaleLowerCase("tr-TR").trim();
    if (q.length < 2) return [];
    return veri
      .filter(
        (s) =>
          s.isim.toLocaleLowerCase("tr-TR").includes(q) ||
          s.mahalleIsim.toLocaleLowerCase("tr-TR").includes(q)
      )
      .filter((s) => !secili.some((x) => x.slug === s.slug && x.mahalleSlug === s.mahalleSlug))
      .slice(0, 8);
  }, [arama, veri, secili]);

  const ekle = (s: KunyeSatiri) => {
    if (secili.length >= 3) return;
    const yeni = [...secili, s];
    setSecili(yeni);
    setArama("");
    sendGAEvent("event", "site_karsilastirma_ekle", { site: s.slug, adet: yeni.length });
  };
  const cikar = (s: KunyeSatiri) =>
    setSecili(secili.filter((x) => !(x.slug === s.slug && x.mahalleSlug === s.mahalleSlug)));

  const satirlar: Array<[string, (s: KunyeSatiri) => React.ReactNode]> = [
    ["Mahalle", (s) => s.mahalleIsim],
    ["Tapu niteliği (TKGM)", (s) => s.tapu ?? "—"],
    ["Parsel alanı", (s) => (s.alanM2 !== undefined ? `≈ ${M2.format(s.alanM2)} m²` : "—")],
    ["Blok sayısı", (s) => s.blok ?? "—"],
    ["Kat yapısı", (s) => katGosterimi(s.katMin, s.katMax, s.katFiltreli) ?? "—"],
    // "Bağımsız bölüm" DENMEZ: karma sitelerde dükkânlar da bağımsız bölümdür;
    // kayıtlı sayı daire sayısıdır.
    ["Daire sayısı (kayıtlı)", (s) => s.konut ?? "—"],
    // Etiket "Daire tipleri" DEĞİL "kayıtta yazılı": boş hücre o tipin
    // yokluğunu değil, kayıtta not düşülmediğini gösterir (aracın SSS'inde
    // ilan edilmiş "yokluğu kanıt saymayız" kuralı).
    [
      "Daire tipleri (kayıtta yazılı)",
      (s) => (s.odaTipleri.length ? s.odaTipleri.join(", ") : "—"),
    ],
    ["Yapı tipi", (s) => s.tip],
    [
      "Kayıtta geçen donatılar",
      (s) => (s.donatilar.length ? s.donatilar.join(", ") : "—"),
    ],
    [
      "Site rehberi",
      (s) => (
        <Link
          href={`/mahalleler/${s.mahalleSlug}/${s.slug}`}
          className="font-semibold text-gold-dark underline-offset-2 hover:underline"
        >
          Sayfayı aç →
        </Link>
      ),
    ],
  ];

  return (
    <div>
      <div className="rounded-2xl border border-border bg-surface p-6">
        <label htmlFor="site-arama" className="text-sm font-semibold text-navy">
          Site ekleyin (en fazla 3)
        </label>
        <input
          id="site-arama"
          type="text"
          value={arama}
          onChange={(e) => setArama(e.target.value)}
          placeholder="Site adı yazın — örn. Metrokent, Panorama, Alkon…"
          disabled={secili.length >= 3}
          className="mt-1.5 w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-navy outline-none focus:border-gold focus:ring-2 focus:ring-gold/30 disabled:opacity-50"
        />
        {adaylar.length > 0 && (
          <ul className="mt-2 divide-y divide-border overflow-hidden rounded-xl border border-border">
            {adaylar.map((s) => (
              <li key={`${s.mahalleSlug}/${s.slug}`}>
                <button
                  type="button"
                  onClick={() => ekle(s)}
                  className="flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-2.5 text-left text-sm hover:bg-surface-muted"
                >
                  <span className="font-semibold text-navy">{s.isim}</span>
                  <span className="shrink-0 text-xs text-muted">{s.mahalleIsim}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
        {secili.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {secili.map((s) => (
              <button
                key={`${s.mahalleSlug}/${s.slug}`}
                type="button"
                onClick={() => cikar(s)}
                className="cursor-pointer rounded-full border border-gold/50 bg-gold/10 px-3 py-1.5 text-sm font-semibold text-navy hover:border-gold"
                title="Listeden çıkar"
              >
                {s.isim} ✕
              </button>
            ))}
          </div>
        )}
      </div>

      {secili.length >= 2 ? (
        <>
          <div className="mt-6 overflow-x-auto rounded-2xl border border-border">
            <table className="w-full min-w-[560px] border-collapse bg-surface text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-muted text-left">
                  <th className="px-4 py-3 font-semibold text-muted">Özellik</th>
                  {secili.map((s) => (
                    <th key={s.slug} className="px-4 py-3 font-semibold text-navy">
                      {s.isim}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {satirlar.map(([etiket, deger]) => (
                  <tr key={etiket} className="border-b border-border last:border-b-0">
                    <td className="px-4 py-3 font-semibold text-muted">{etiket}</td>
                    {secili.map((s) => (
                      <td key={s.slug} className="px-4 py-3 text-body">
                        {deger(s)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {ozetCumleleri(secili).length > 0 && (
            <div className="mt-5 rounded-2xl border border-gold/40 bg-gold/5 p-5">
              <p className="text-sm font-semibold uppercase tracking-wide text-gold-dark">
                Karşılaştırma Özeti
              </p>
              <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-body">
                {ozetCumleleri(secili).map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>
          )}
          <p className="mt-4 text-xs leading-relaxed text-muted">
            &quot;—&quot; işareti: bu alan sitenin kayıt metninde belirtilmemiş demektir; tahmin
            yazmayız. Donatı satırı yalnızca kayıtta adı geçenleri listeler — boş olması sitede
            olmadığı anlamına gelmez.
          </p>
        </>
      ) : (
        <p className="mt-6 text-sm leading-relaxed text-body">
          Karşılaştırma için en az iki site ekleyin. Tablo; tapu niteliği, parsel alanı, blok ve
          kat yapısını TKGM tabanlı kayıtlarımızdan yan yana getirir — fiyat değil, kalıcı
          yapısal veriler.
        </p>
      )}
    </div>
  );
}
