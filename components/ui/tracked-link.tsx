"use client";

import { sendGAEvent } from "@next/third-parties/google";
import type { ReactNode } from "react";

interface TrackedLinkProps {
  href: string;
  children: ReactNode;
  gaEvent: string;
  className?: string;
  openInNewTab?: boolean;
}

export function TrackedLink({
  href,
  children,
  gaEvent,
  className = "",
  openInNewTab = false,
}: TrackedLinkProps) {
  return (
    <a
      href={href}
      {...(openInNewTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={className}
      onClick={() => sendGAEvent("event", gaEvent)}
    >
      {children}
    </a>
  );
}
