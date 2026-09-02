"use client";

import { sendGAEvent } from "@/lib/ga";
import type { ReactNode } from "react";

interface TrackedLinkProps {
  href: string;
  children: ReactNode;
  gaEvent: string;
  /** GA4 olay parametreleri (ör. { konum: "hero" }). Kayıtsız parametre
   *  raporda görünmez: GA4 Yönetici → Özel tanımlar'da olay kapsamlı boyut
   *  olarak açılmalı. */
  gaParams?: Record<string, string | number>;
  className?: string;
  openInNewTab?: boolean;
}

export function TrackedLink({
  href,
  children,
  gaEvent,
  gaParams,
  className = "",
  openInNewTab = false,
}: TrackedLinkProps) {
  return (
    <a
      href={href}
      {...(openInNewTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={className}
      onClick={() => (gaParams ? sendGAEvent("event", gaEvent, gaParams) : sendGAEvent("event", gaEvent))}
    >
      {children}
    </a>
  );
}
