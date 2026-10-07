"use client";

import { useEffect } from "react";
import { RIZA_DEGISTI, rizaOku, rizaUygula, type RizaSecimi } from "@/lib/cerez-rizasi";

/** gtag.js'i YALNIZ rıza varsa ve sayfa yüküne bindirmeden, boşta (idle)
 * enjekte eder.
 *
 * 2026-10-07: rıza bandı geri geldi (lib/cerez-rizasi.ts). Kayıtlı tercih
 * "kabul" değilse gtag.js hiç yüklenmez — Google'a izinsiz tek istek gitmez.
 * Aynı oturumda "Kabul et"e basılırsa RIZA_DEGISTI olayıyla anında yüklenir.
 * Kayıtlı "kabul"de önce gtag'e consent update (granted) kuyruklanır; layout'taki
 * satır içi bootstrap varsayılanı denied kurar, sıra böyle doğru işler.
 *
 * Performans deseni korunuyor: next/script veya @next/third-parties hidrasyonla
 * yükleyip mobil LCP'ye ~1,6 sn bindiriyordu (ölçüldü); requestIdleCallback aynı
 * skoru korur. dataLayer bootstrap'i layout'ta satır içi — erken olaylar
 * kuyruklanır, gtag.js gelince sırayla işlenir. */
export function GaYukleyici({ gaId }: { gaId: string }) {
  useEffect(() => {
    const yukle = () => {
      if (document.querySelector('script[src*="googletagmanager.com/gtag"]')) return;
      const el = document.createElement("script");
      el.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
      el.async = true;
      document.body.appendChild(el);
    };

    let iptal: (() => void) | undefined;
    const bostaYukle = () => {
      if (typeof window.requestIdleCallback === "function") {
        const id = window.requestIdleCallback(yukle, { timeout: 3000 });
        iptal = () => window.cancelIdleCallback(id);
      } else {
        const id = window.setTimeout(yukle, 1200);
        iptal = () => window.clearTimeout(id);
      }
    };

    if (rizaOku() === "kabul") {
      rizaUygula("kabul");
      bostaYukle();
    }

    const dinle = (e: Event) => {
      if ((e as CustomEvent<RizaSecimi>).detail === "kabul") yukle();
    };
    window.addEventListener(RIZA_DEGISTI, dinle);
    return () => {
      iptal?.();
      window.removeEventListener(RIZA_DEGISTI, dinle);
    };
  }, [gaId]);

  return null;
}
