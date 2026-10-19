"use client";

import { useSyncExternalStore } from "react";
import { getCtaButtonClasses } from "@/components/ui/button";
import { rizaAboneOl, rizaDurumu, rizaSifirla, rizaSunucuDurumu } from "@/lib/cerez-rizasi";

/** /gizlilik'teki "tercihimi değiştir" kutusu — rızayı geri almak vermek kadar
 * kolay olsun (KVKK rehberi). Sıfırlayınca GA çerezleri silinir ve bant yeniden
 * açılır (lib/cerez-rizasi.ts). Durum useSyncExternalStore ile okunur; sunucuda
 * nötr metin, hidrasyondan sonra gerçek tercih. */
const ETIKET = {
  kabul: "Şu anki tercihiniz: analitik çerezler kabul edildi.",
  red: "Şu anki tercihiniz: analitik çerezler reddedildi.",
  yok: "Henüz bir tercih kaydedilmedi; seçim yapılmadığı sürece Google Analytics yüklenmez.",
  ssr: "Tercihiniz okunuyor…",
} as const;

export function CerezTercihi() {
  const durum = useSyncExternalStore(rizaAboneOl, rizaDurumu, rizaSunucuDurumu);

  return (
    <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-surface-muted p-4 text-sm">
      <p className="flex-1 text-body" aria-live="polite">{ETIKET[durum]}</p>
      <button
        type="button"
        onClick={() => rizaSifirla()}
        className={getCtaButtonClasses("outline", "min-h-10 px-4 py-2")}
      >
        Çerez tercihimi değiştir
      </button>
    </div>
  );
}
