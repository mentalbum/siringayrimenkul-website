"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { sendGAEvent } from "@/lib/ga";
import { PhoneIcon, WhatsAppIcon } from "@/components/ui/icons";
import { siteConfig } from "@/lib/site-config";
import { bulunmaHali } from "@/lib/turkce";

type MahalleOzet = { slug: string; isim: string };

/** Mahalle adları içerik kaydından gelir; site sayfalarında gerçek adlı meta
 * mesajı önceliklidir. Ada bağlantısı, görüşülen sayfanın bağlamını taşır. */
function baglamMesaji(pathname: string, mahalleler: MahalleOzet[]): string {
  const parca = pathname.split("/").filter(Boolean);
  const adlastir = (slug: string) =>
    slug
      .split("-")
      .map((k) => (k ? k[0].toUpperCase() + k.slice(1) : k))
      .join(" ");

  if (parca[0] === "mahalleler" && parca[1] && parca[2] === "etaplar" && parca[3]) {
    return `Merhaba, Eryaman ${parca[3]}. Etap'ta bir dairem var, değerlendirmek istiyorum.`;
  }
  if (parca[0] === "mahalleler" && parca[1] && parca[2] === "adalar") {
    return `Merhaba, bu adadaki dairem hakkında görüşmek istiyorum.\nİncelediğim sayfa: ${siteConfig.url}${pathname}`;
  }
  if (parca[0] === "mahalleler" && parca[2]) {
    return `Merhaba, ${adlastir(parca[2])} ile ilgili yazıyorum — bu sitede bir dairem var.`;
  }
  if (parca[0] === "mahalleler" && parca[1]) {
    const mahalle = mahalleler.find(({ slug }) => slug === parca[1]);
    if (mahalle) return `Merhaba, ${bulunmaHali(mahalle.isim)} bir dairem var, değerlendirmek istiyorum.`;
  }
  if (parca[0] === "eryamanda-ev-kiraya-vermek") {
    return "Merhaba, Eryaman'daki evimi kiraya vermek istiyorum.";
  }
  if (parca[0] === "ev-degerleme") {
    return "Merhaba, Eryaman'daki evimin satış veya kira değerini öğrenmek istiyorum.";
  }
  if (parca[0] === "eryamanda-ev-satmak") {
    return "Merhaba, Eryaman'daki evimi satmayı düşünüyorum, değerleme istiyorum.";
  }
  if (parca[0] === "araclar" || parca[0] === "blog" || parca[0] === "sozluk") {
    return "Merhaba, Eryaman'daki evimle ilgili bir sorum var.";
  }
  return "Merhaba, Eryaman'daki evimle ilgili görüşmek istiyorum.";
}

/**
 * Kalıcı iletişim erişimi.
 *
 * MOBİL: ekranın altında iki butonlu ETİKETLİ çubuk. Sebebi ölçüm: mobil
 * başlıkta telefon linki `hidden lg:flex` olduğu için görünmüyordu — anasayfa
 * dışındaki her sayfada "ara" eylemi hamburgerin arkasında iki dokunuş
 * uzaktaydı. Etiketsiz yüzen daire ise hem ne olduğunu söylemiyor hem de
 * altındaki gövde metnini kapatıyordu.
 *
 * MASAÜSTÜ: başlıkta telefon zaten görünür olduğu için yüzen WhatsApp dairesi
 * yeterli; alt çubuk gereksiz yer kaplar.
 */
export function FloatingWhatsAppButton({ mahalleler }: { mahalleler: MahalleOzet[] }) {
  const pathname = usePathname() ?? "/";
  /* Site sayfası kendi gerçek adıyla hazır mesajı <meta name="wa-mesaj"> olarak
     basar (07.10, ChatGPT istişaresi): slug'dan türetilen ad Türkçe karakterleri
     düşürüyordu ("Relax Goksu Konutlari"). Sunucu tarafında yol tabanlı mesaj
     basılır, montajdan sonra meta varsa o kazanır — hidrasyon farkı olmaz. */
  const [metaMesaj, setMetaMesaj] = useState<{ pathname: string; mesaj: string | null } | null>(null);
  useEffect(() => {
    const id = window.setTimeout(() => {
      const m = document.querySelector<HTMLMetaElement>('meta[name="wa-mesaj"]');
      setMetaMesaj({ pathname, mesaj: m?.content || null });
    }, 0);
    return () => window.clearTimeout(id);
  }, [pathname]);
  const sayfaMesaji = metaMesaj?.pathname === pathname ? metaMesaj.mesaj : null;
  const href = `${siteConfig.whatsappUrl}?text=${encodeURIComponent(sayfaMesaji ?? baglamMesaji(pathname, mahalleler))}`;

  return (
    <>
      {/* Mobil: etiketli çift kapı */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t border-border bg-surface/95 px-3 pt-2 backdrop-blur-sm pb-[max(0.5rem,env(safe-area-inset-bottom))] lg:hidden">
        <a
          href={`tel:${siteConfig.phoneTel}`}
          onClick={() => sendGAEvent("event", "phone_click", { konum: "mobil_cubuk" })}
          className="flex min-h-12 flex-1 cursor-pointer items-center justify-center gap-2 rounded-full bg-gold text-sm font-semibold text-navy transition-colors active:bg-gold-dark"
        >
          <PhoneIcon className="h-4 w-4" />
          {siteConfig.phoneDisplay}
        </a>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => sendGAEvent("event", "whatsapp_click", { konum: "mobil_cubuk" })}
          /* Lighthouse erişilebilirlik (04.10): beyaz metin #25D366 üstünde
             kontrast 1,98; #128C7E ile 4,13 — 14px metin için AA eşiği 4,5.
             WhatsApp'ın koyu teal'i #075E54 ile 7,1 (canlıda ölçüldü). */
          className="flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-full bg-[#075E54] px-5 text-sm font-semibold text-white transition-transform active:scale-95"
        >
          <WhatsAppIcon className="h-5 w-5" />
          WhatsApp
        </a>
      </div>

      {/* Masaüstü: yüzen daire */}
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => sendGAEvent("event", "whatsapp_click", { konum: "yuzen" })}
        aria-label="WhatsApp ile yazın"
        className="fixed bottom-5 right-5 z-40 hidden h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366] lg:flex"
      >
        <WhatsAppIcon className="h-7 w-7" />
      </a>
    </>
  );
}
