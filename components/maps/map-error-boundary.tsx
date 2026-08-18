"use client";

import { unstable_catchError, type ErrorInfo } from "next/error";

/* NEDEN AYRI BİR HATA SINIRI: harita ağacı bizim kontrolümüzde olmayan bir
 * servise (Google Maps JS API) bağlı. Anahtarın kısıtı değişirse, fatura/kota
 * sorunu çıkarsa ya da Google yetkilendirmeyi geçici olarak reddederse
 * (RefererNotAllowedMapError) kütüphane çalışma anında hata fırlatıyor; React
 * de bu hatayı en yakın hata sınırına kadar taşıyor. Sınır yokken en yakın
 * nokta sayfanın köküydü: 18.08'de yerelde ölçüldü — yetkisiz anahtarla site
 * sayfasının TAMAMI "This page couldn't load" ekranına düştü, metin, künye ve
 * iletişim çağrıları dahil. Site arama motoru ve müşteri iletişimi için var;
 * harita bozulduğunda kaybedilmesi gereken tek şey harita kutusu.
 *
 * next/error'ın unstable_catchError'ı (Next 16.2+) bileşen düzeyinde sınır
 * kurmanın çerçevenin desteklediği yolu: redirect()/notFound() gibi çerçeve
 * hatalarını yanlışlıkla yutmuyor ve istemci tarafı gezinmede hata durumunu
 * kendiliğinden temizliyor. */
function HaritaHatasi(_props: object, { unstable_retry }: ErrorInfo) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 rounded-2xl bg-surface-muted p-6 text-center text-sm text-muted">
      <p>Harita şu anda görüntülenemiyor.</p>
      <button
        type="button"
        onClick={() => unstable_retry()}
        className="cursor-pointer rounded-full border border-border bg-surface px-4 py-1.5 text-sm text-navy transition-colors hover:border-gold hover:text-gold-dark"
      >
        Yeniden dene
      </button>
    </div>
  );
}

/** Harita ağacını saran hata sınırı — içeride ne patlarsa patlasın sayfanın
 * geri kalanı ayakta kalır, yerine sade bir kutu gelir. */
export const MapErrorBoundary = unstable_catchError(HaritaHatasi);
