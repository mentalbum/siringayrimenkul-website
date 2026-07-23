"use client";

import { usePathname } from "next/navigation";
import { sendGAEvent } from "@next/third-parties/google";
import { WhatsAppIcon } from "@/components/ui/icons";
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

export function FloatingWhatsAppButton() {
  const pathname = usePathname() ?? "/";
  const href = `${siteConfig.whatsappUrl}?text=${encodeURIComponent(baglamMesaji(pathname))}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => sendGAEvent("event", "whatsapp_click", { page_path: pathname })}
      aria-label="WhatsApp ile yazın"
      className="fixed bottom-5 right-5 z-40 flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366]"
    >
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  );
}
