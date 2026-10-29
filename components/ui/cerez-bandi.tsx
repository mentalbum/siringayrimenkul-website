"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { getCtaButtonClasses } from "@/components/ui/button";
import {
  rizaAboneOl,
  rizaDurumu,
  rizaSunucuDurumu,
  rizaYaz,
  type RizaSecimi,
} from "@/lib/cerez-rizasi";

/**
 * Çerez rıza bandı (2026-10-07) — bkz. lib/cerez-rizasi.ts.
 *
 * KVKK rehberi gereği: reddetmek kabul etmek kadar kolay (iki eşit düğme, tek
 * dokunuş), "çerez duvarı" yok (sayfa kullanılabilir kalır, bant kaydırmayı
 * kilitlemez), seçim sonradan /gizlilik'ten değiştirilebilir.
 *
 * Durum useSyncExternalStore ile okunur: sunucuda ve hidrasyonda "ssr" (bant
 * çizilmez), ardından tarayıcıdaki kayıt — hidrasyon farkı olmaz, effect içinde
 * setState yok (react-hooks/set-state-in-effect). Tercih yazılınca olay
 * tetiklenir, anlık görüntü değişir, bant kendiliğinden kapanır.
 *
 * Konum: mobilde sabit telefon/WhatsApp çubuğunun ÜSTÜNDE (body'nin alt
 * boşluğu kadar yukarıda — components/ui/floating-whatsapp-button.tsx),
 * masaüstünde sol altta; sağ alttaki yüzen WhatsApp dairesini kapatmaz.
 */
export function CerezBandi() {
  const durum = useSyncExternalStore(rizaAboneOl, rizaDurumu, rizaSunucuDurumu);
  if (durum !== "yok") return null;

  const sec = (secim: RizaSecimi) => rizaYaz(secim);

  return (
    <section
      role="region"
      aria-label="Çerez tercihi"
      className="animate-fade-up fixed inset-x-3 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-50 mx-auto max-w-xl rounded-2xl border border-border bg-surface p-4 shadow-xl shadow-navy/15 [animation-duration:0.3s] lg:inset-x-auto lg:bottom-5 lg:left-5 lg:max-w-md"
    >
      <p className="text-sm leading-relaxed text-body">
        Ziyaret istatistikleri için Google Analytics çerezi kullanıyoruz.{" "}
        <strong className="text-navy">Kabul etmezseniz hiçbir çerez yerleştirilmez</strong>, site
        aynı şekilde çalışır.{" "}
        <Link href="/gizlilik" className="font-semibold text-gold-dark underline-offset-2 hover:underline">
          Ayrıntılar
        </Link>
      </p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => sec("red")}
          className={getCtaButtonClasses("outline", "min-h-10 flex-1 px-4 py-2")}
        >
          Reddet
        </button>
        <button
          type="button"
          onClick={() => sec("kabul")}
          className={getCtaButtonClasses("primary", "min-h-10 flex-1 px-4 py-2")}
        >
          Kabul et
        </button>
      </div>
    </section>
  );
}
