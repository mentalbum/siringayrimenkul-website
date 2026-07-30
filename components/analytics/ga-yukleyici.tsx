"use client";

import { useEffect } from "react";

/** gtag.js'i sayfa yüküne bindirmeden, boşta (idle) enjekte eder.
 * NOT (2026-07-30): Çerez rıza bandı Özgün'ün açık talimatıyla KALDIRILDI —
 * GA artık tüm ziyaretçilerde çalışır (KVKK riski kendisine anlatıldı, kararı
 * bilerek verdi; /gizlilik metni bu duruma göre günceldir). Performans deseni
 * korunuyor: next/script veya @next/third-parties hidrasyonla yükleyip mobil
 * LCP'ye ~1,6 sn bindiriyordu (ölçüldü); requestIdleCallback aynı skoru korur.
 * dataLayer bootstrap'i layout'ta satır içi — erken olaylar kuyruklanır. */
export function GaYukleyici({ gaId }: { gaId: string }) {
  useEffect(() => {
    if (document.querySelector('script[src*="googletagmanager.com/gtag"]')) return;
    const yukle = () => {
      const el = document.createElement("script");
      el.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
      el.async = true;
      document.body.appendChild(el);
    };
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(yukle, { timeout: 3000 });
      return () => window.cancelIdleCallback(id);
    }
    const id = window.setTimeout(yukle, 1200);
    return () => window.clearTimeout(id);
  }, [gaId]);

  return null;
}
