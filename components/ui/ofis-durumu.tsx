"use client";

import { useEffect, useState } from "react";

/** Ofisin şu anda açık olup olmadığını Türkiye saatine göre söyler.
 *
 * Ziyaretçinin cihaz saatine değil Europe/Istanbul'a bakar — yurt dışındaki
 * ev sahibi de doğru bilgiyi görsün. Karar anındaki en somut soruya cevap
 * verir: "şimdi arasam açar mı, yoksa yarını mı beklesem?" */

const ACILIS = 9;
const KAPANIS_HAFTA = 19; // Pazartesi - Cumartesi
const KAPANIS_PAZAR = 17;

type Durum = { acik: boolean; metin: string };

function trSaati(): { gun: number; saat: number; dakika: number } {
  const parcalar = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Istanbul",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const al = (tip: string) => parcalar.find((p) => p.type === tip)?.value ?? "";
  const gunler = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return {
    gun: gunler.indexOf(al("weekday")),
    saat: Number.parseInt(al("hour"), 10),
    dakika: Number.parseInt(al("minute"), 10),
  };
}

function durumHesapla(): Durum {
  const { gun, saat, dakika } = trSaati();
  const kapanis = gun === 0 ? KAPANIS_PAZAR : KAPANIS_HAFTA;
  const acik = saat >= ACILIS && (saat < kapanis || (saat === kapanis && dakika === 0));

  if (acik) {
    const kalan = kapanis - saat;
    return {
      acik: true,
      metin:
        kalan <= 1
          ? `Şu an açığız — ${kapanis}:00'a kadar buradayız`
          : `Şu an açığız — bugün ${kapanis}:00'a kadar`,
    };
  }
  if (saat < ACILIS) {
    return { acik: false, metin: `Şu an kapalıyız — bugün ${ACILIS}:00'da açılıyoruz` };
  }
  return { acik: false, metin: `Şu an kapalıyız — yarın ${ACILIS}:00'da açılıyoruz` };
}

export function OfisDurumu({ className = "" }: { className?: string }) {
  // Sunucuda render edilmez: cihazın gerçek zamanı ile HTML uyuşmazlığı olmasın.
  const [durum, setDurum] = useState<Durum | null>(null);

  useEffect(() => {
    // İlk hesap bir sonraki tick'e bırakılır (setState-in-effect kuralı);
    // sonrasında kapanış/açılış saatini yakalamak için dakikada bir tazelenir.
    const ilk = window.setTimeout(() => setDurum(durumHesapla()), 0);
    const id = window.setInterval(() => setDurum(durumHesapla()), 60_000);
    return () => {
      window.clearTimeout(ilk);
      window.clearInterval(id);
    };
  }, []);

  if (!durum) return null;

  return (
    <p className={`flex items-center gap-2 text-sm text-body ${className}`}>
      <span
        aria-hidden
        className={`h-2 w-2 shrink-0 rounded-full ${
          durum.acik ? "bg-emerald-500" : "bg-amber-500"
        }`}
      />
      <span>
        {durum.metin}
        <span className="text-muted"> · mesajınıza kapalıyken de dönüş yapılır</span>
      </span>
    </p>
  );
}
