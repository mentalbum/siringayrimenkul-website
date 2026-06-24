"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { sendGAEvent } from "@next/third-parties/google";
import { mainNav, siteConfig } from "@/lib/site-config";
import { CtaButton } from "@/components/ui/button";
import { CloseIcon, MenuIcon, PhoneIcon } from "@/components/ui/icons";

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2.5 sm:px-6">
        <Link
          href="/"
          className="shrink-0"
          aria-label={`${siteConfig.name} anasayfa`}
          onClick={() => setOpen(false)}
        >
          <Image
            src="/brand/sirin-logo-on-light.png"
            alt={siteConfig.name}
            width={480}
            height={233}
            className="h-10 w-auto sm:h-11"
            priority
          />
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Ana menü">
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-navy transition-colors hover:text-gold-dark"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-5 lg:flex">
          <a
            href={`tel:${siteConfig.phoneTel}`}
            onClick={() => sendGAEvent("event", "phone_click")}
            className="flex items-center gap-1.5 text-sm font-semibold text-navy hover:text-gold-dark"
          >
            <PhoneIcon className="h-4 w-4" />
            {siteConfig.phoneDisplay}
          </a>
          <CtaButton href={siteConfig.sahibindenUrl} external variant="primary">
            İlanlarım
          </CtaButton>
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
          className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-navy lg:hidden"
        >
          {open ? <CloseIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-surface px-4 py-4 lg:hidden">
          <nav className="flex flex-col gap-1" aria-label="Mobil menü">
            {mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-base font-medium text-navy hover:bg-surface-muted"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-3 flex flex-col gap-3 border-t border-border pt-4">
            <a
              href={`tel:${siteConfig.phoneTel}`}
              onClick={() => sendGAEvent("event", "phone_click")}
              className="flex items-center gap-2 px-3 text-base font-semibold text-navy"
            >
              <PhoneIcon className="h-5 w-5" />
              {siteConfig.phoneDisplay}
            </a>
            <CtaButton
              href={siteConfig.sahibindenUrl}
              external
              variant="primary"
              className="w-full"
            >
              İlanlarım
            </CtaButton>
          </div>
        </div>
      )}
    </header>
  );
}
