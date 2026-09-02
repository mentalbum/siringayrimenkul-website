"use client";

import { sendGAEvent } from "@/lib/ga";
import type { ReactNode } from "react";
import { getCtaButtonClasses, type ButtonVariant } from "@/components/ui/button";

interface TrackedCtaLinkProps {
  href: string;
  children: ReactNode;
  gaEvent: string;
  /** GA4 olay parametreleri (ör. { konum: "hero" }). Kayıtsız parametre
   *  raporda görünmez: GA4 Yönetici → Özel tanımlar'da olay kapsamlı boyut
   *  olarak açılmalı. */
  gaParams?: Record<string, string | number>;
  variant?: ButtonVariant;
  className?: string;
  openInNewTab?: boolean;
}

export function TrackedCtaLink({
  href,
  children,
  gaEvent,
  gaParams,
  variant = "primary",
  className = "",
  openInNewTab = false,
}: TrackedCtaLinkProps) {
  return (
    <a
      href={href}
      {...(openInNewTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={getCtaButtonClasses(variant, className)}
      onClick={() => (gaParams ? sendGAEvent("event", gaEvent, gaParams) : sendGAEvent("event", gaEvent))}
    >
      {children}
    </a>
  );
}
