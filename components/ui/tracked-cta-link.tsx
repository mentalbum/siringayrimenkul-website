"use client";

import { sendGAEvent } from "@next/third-parties/google";
import type { ReactNode } from "react";
import { getCtaButtonClasses, type ButtonVariant } from "@/components/ui/button";

interface TrackedCtaLinkProps {
  href: string;
  children: ReactNode;
  gaEvent: string;
  variant?: ButtonVariant;
  className?: string;
  openInNewTab?: boolean;
}

export function TrackedCtaLink({
  href,
  children,
  gaEvent,
  variant = "primary",
  className = "",
  openInNewTab = false,
}: TrackedCtaLinkProps) {
  return (
    <a
      href={href}
      {...(openInNewTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={getCtaButtonClasses(variant, className)}
      onClick={() => sendGAEvent("event", gaEvent)}
    >
      {children}
    </a>
  );
}
