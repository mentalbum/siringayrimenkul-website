"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

/** Çerez rızası kapısı (KVKK Kurulu Çerez Rehberi: analitik çerez açık rıza
 * ister). gtag.js YALNIZ "Kabul" sonrası yüklenir; ret hâlinde hiçbir çerez
 * bırakılmaz. dataLayer bootstrap'i layout'ta her zaman kurulu — olaylar
 * kuyruklanır, kullanıcı sonradan kabul ederse gtag geldiğinde sırayla işlenir
 * (veri kaybı yalnız reddedenlerde; o da bilinçli bedel).
 *
 * Bant, ilk boyamayı etkilemesin diye mount SONRASI görünür (SSR'da yok —
 * CLS'e girmez, LCP ile yarışmaz). Tercih localStorage'da tutulur. */
const ANAHTAR = "cerez-tercihi";

export function CerezOnayi({ gaId }: { gaId: string }) {
  const [tercih, setTercih] = useState<"kabul" | "ret" | "yok" | null>(null);

  useEffect(() => {
    const kayitli = window.localStorage.getItem(ANAHTAR);
    setTercih(kayitli === "kabul" || kayitli === "ret" ? kayitli : "yok");
  }, []);

  const sec = (deger: "kabul" | "ret") => {
    window.localStorage.setItem(ANAHTAR, deger);
    setTercih(deger);
  };

  // gtag.js'i next/script yerine elle enjekte ediyoruz: lazyOnload, sayfanın
  // "load" olayına bağlı — kullanıcı Kabul'e sayfa yüklendikten SONRA bastığında
  // (her zaman öyle olur) script hiç yüklenmiyordu (önizlemede ölçüldü).
  // requestIdleCallback ile boşta enjeksiyon aynı performans profilini korur.
  useEffect(() => {
    if (tercih !== "kabul") return;
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
  }, [tercih, gaId]);

  return (
    <>
      {tercih === "yok" && (
        <div
          role="dialog"
          aria-label="Çerez bildirimi"
          className="fixed inset-x-4 bottom-24 z-50 rounded-2xl border border-gold/50 bg-surface p-4 shadow-xl lg:bottom-6 lg:left-6 lg:right-auto lg:max-w-sm"
        >
          {/* Metin davetkâr ama dürüst; Reddet eşit erişilebilir kalır (KVKK).
              "Kimliğinizi bilmeyiz" iddiası doğru: GA4 yapılandırmamız ad/e-posta
              görmez, biz de reklam/satış yapmayız. */}
          <p className="text-sm font-semibold text-navy">Ziyaretinizi sayabilir miyiz?</p>
          <p className="mt-1 text-sm leading-relaxed text-body">
            Hangi rehberlerin işe yaradığını görmek için Google Analytics çerezine izin verir
            misiniz? Kimliğinizi bilmeyiz, veriyi kimseyle paylaşmayız.{" "}
            <Link href="/gizlilik" className="font-semibold text-gold-dark hover:underline">
              Ayrıntılar
            </Link>
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => sec("kabul")}
              className="cursor-pointer rounded-full bg-navy px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-gold-dark"
            >
              Kabul
            </button>
            <button
              type="button"
              onClick={() => sec("ret")}
              className="cursor-pointer rounded-full border border-border px-4 py-1.5 text-sm font-semibold text-navy transition-colors hover:border-gold-dark hover:text-gold-dark"
            >
              Reddet
            </button>
          </div>
        </div>
      )}
    </>
  );
}
