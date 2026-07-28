"use client";

import { usePathname } from "next/navigation";
import { sendGAEvent } from "@/lib/ga";
import { PhoneIcon, WhatsAppIcon } from "@/components/ui/icons";
import { siteConfig } from "@/lib/site-config";

/** Sayfa bağlamına göre hazır WhatsApp mesajı: müşteri tek dokunuşla derdini
 * yazmış olur, biz de hangi sayfadan geldiğini görürüz. Slug'dan okunabilir ad
 * üretirken Türkçe karakter kaybını kabul ediyoruz — mesajı gönderen zaten
 * düzeltebilir, önemli olan bağlamın taşınması. */
function baglamMesaji(pathname: string): string {
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
    return "Merhaba, bu adadaki dairem hakkında görüşmek istiyorum.";
  }
  if (parca[0] === "mahalleler" && parca[2]) {
    return `Merhaba, ${adlastir(parca[2])} ile ilgili yazıyorum — bu sitede bir dairem var.`;
  }
  if (parca[0] === "mahalleler" && parca[1]) {
    return `Merhaba, ${adlastir(parca[1])} Mahallesi'nde bir dairem var, değerlendirmek istiyorum.`;
  }
  if (parca[0] === "eryamanda-ev-kiraya-vermek") {
    return "Merhaba, Eryaman'daki evimi kiraya vermek istiyorum.";
  }
  if (parca[0] === "eryamanda-ev-satmak" || parca[0] === "ev-degerleme") {
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
export function FloatingWhatsAppButton() {
  const pathname = usePathname() ?? "/";
  const href = `${siteConfig.whatsappUrl}?text=${encodeURIComponent(baglamMesaji(pathname))}`;

  return (
    <>
      {/* Mobil: etiketli çift kapı */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t border-border bg-surface/95 px-3 pt-2 backdrop-blur-sm pb-[max(0.5rem,env(safe-area-inset-bottom))] lg:hidden">
        <a
          href={`tel:${siteConfig.phoneTel}`}
          onClick={() => sendGAEvent("event", "phone_click", { page_path: pathname, konum: "mobil_cubuk" })}
          className="flex min-h-12 flex-1 cursor-pointer items-center justify-center gap-2 rounded-full bg-gold text-sm font-semibold text-navy transition-colors active:bg-gold-dark"
        >
          <PhoneIcon className="h-4 w-4" />
          {siteConfig.phoneDisplay}
        </a>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => sendGAEvent("event", "whatsapp_click", { page_path: pathname, konum: "mobil_cubuk" })}
          className="flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 text-sm font-semibold text-white transition-transform active:scale-95"
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
        onClick={() => sendGAEvent("event", "whatsapp_click", { page_path: pathname, konum: "yuzen" })}
        aria-label="WhatsApp ile yazın"
        className="fixed bottom-5 right-5 z-40 hidden h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366] lg:flex"
      >
        <WhatsAppIcon className="h-7 w-7" />
      </a>
    </>
  );
}
