"use client";

import { useEffect } from "react";
import { siteConfig } from "@/lib/site-config";
import { CtaButton, getCtaButtonClasses } from "@/components/ui/button";
import { TrackedCtaLink } from "@/components/ui/tracked-cta-link";

/* ÇALIŞMA ZAMANI HATA SAYFASI (2026-10-06).
 *
 * Sitenin 404 sayfası vardı (not-found.tsx) ama hata sınırı yoktu: bir sayfa
 * render sırasında patlarsa Next, başlıksız ve markasız varsayılan
 * "Application error" ekranını basıyordu — ne telefon, ne site rehberine
 * dönüş. Bu dosya 404 ile aynı dil ve düzende bir çıkış yolu verir.
 *
 * Hata sınırı istemci bileşeni olmak zorunda; bu yüzden metadata ve sunucu
 * tarafı içerik okuma (lib/content) burada kullanılamaz. unstable_retry,
 * segmenti yeniden çekip çizer (Next 16 error.js sözleşmesi). */
export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center sm:px-6">
      <div
        aria-hidden="true"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-muted font-heading text-2xl font-semibold text-gold-dark"
      >
        !
      </div>
      <p className="mt-6 text-sm font-semibold uppercase tracking-wide text-gold-dark">Hata</p>
      <h1 className="mt-2 text-3xl sm:text-4xl">Bir Şeyler Ters Gitti</h1>
      <p className="mt-4 text-base leading-relaxed text-body">
        Sayfa yüklenirken beklenmedik bir sorun oluştu. Yeniden deneyebilir, site rehberimize
        dönebilir ya da doğrudan bizi arayabilirsiniz.
      </p>
      {error.digest && (
        <p className="mt-2 text-xs text-muted">Hata kodu: {error.digest}</p>
      )}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => unstable_retry()}
          className={getCtaButtonClasses("primary")}
        >
          Tekrar Dene
        </button>
        <CtaButton href="/siteler" variant="outline">
          Eryaman Siteleri
        </CtaButton>
        <CtaButton href="/" variant="outline">
          Anasayfa
        </CtaButton>
        <TrackedCtaLink
          href={`tel:${siteConfig.phoneTel}`}
          gaEvent="phone_click"
          gaParams={{ konum: "hata" }}
          variant="outline"
        >
          Bizi Arayın
        </TrackedCtaLink>
      </div>
    </div>
  );
}
