"use client";

import { sendGAEvent } from "@next/third-parties/google";
import { WhatsAppIcon } from "@/components/ui/icons";
import { siteConfig } from "@/lib/site-config";

export function FloatingWhatsAppButton() {
  return (
    <a
      href={siteConfig.whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => sendGAEvent("event", "whatsapp_click")}
      aria-label="WhatsApp ile yazın"
      className="fixed bottom-5 right-5 z-40 flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366]"
    >
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  );
}
