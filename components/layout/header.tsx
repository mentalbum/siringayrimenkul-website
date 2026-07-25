"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { sendGAEvent } from "@next/third-parties/google";
import { hizmetNav, mainNav, siteConfig } from "@/lib/site-config";
import { CtaButton } from "@/components/ui/button";
import { CloseIcon, MenuIcon, PhoneIcon } from "@/components/ui/icons";


export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Sayfa kaydıkça header, ortada yüzen glassy (koyu, yarı saydam) bir "pill"e
  // dönüşür — tam ekranı kaplamaz, oval kenarlı orta boy bir menü olur.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-transparent"
          : "border-b border-border bg-surface/95 backdrop-blur-sm"
      }`}
    >
      <div
        className={`mx-auto flex max-w-6xl items-center justify-between gap-4 transition-all duration-300 ${
          scrolled
            ? "mx-3 mt-3 rounded-full border border-white/10 bg-navy/85 px-4 py-2 shadow-xl shadow-black/30 backdrop-blur-md sm:mx-auto sm:px-6"
            : "px-4 py-2.5 sm:px-6"
        }`}
      >
        <Link
          href="/"
          className="shrink-0"
          aria-label={`${siteConfig.name} anasayfa`}
          onClick={(event) => {
            // Logo hangi sayfada olursa olsun navigasyon yapmaz; bulunulan
            // sayfayı en üste kaydırır (Özgün'ün tercihi). href="/" SEO ve
            // orta-tık/yeni-sekme için duruyor.
            event.preventDefault();
            setOpen(false);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          <Image
            src={scrolled ? "/brand/sirin-logo-on-dark.png" : "/brand/sirin-logo-on-light.png"}
            alt={siteConfig.name}
            width={480}
            height={233}
            className="h-10 w-auto sm:h-11"
            preload
          />
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Ana menü">
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-medium transition-colors ${
                scrolled ? "text-white/85 hover:text-gold" : "text-navy hover:text-gold-dark"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-5 lg:flex">
          <a
            href={`tel:${siteConfig.phoneTel}`}
            onClick={() => sendGAEvent("event", "phone_click")}
            className={`flex items-center gap-1.5 text-sm font-semibold transition-colors ${
              scrolled ? "text-white hover:text-gold" : "text-navy hover:text-gold-dark"
            }`}
          >
            <PhoneIcon className="h-4 w-4" />
            {siteConfig.phoneDisplay}
          </a>
          <CtaButton href={siteConfig.sahibindenUrl} external variant="primary">
            İlanlarımız
          </CtaButton>
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
          className={`inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full transition-colors lg:hidden ${
            scrolled ? "text-white" : "text-navy"
          }`}
        >
          {open ? <CloseIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div
          className={`animate-fade-up mx-3 mt-2 max-w-6xl overflow-hidden rounded-2xl border px-2 py-2 lg:hidden [animation-duration:0.25s] sm:mx-auto ${
            scrolled
              ? "border-white/10 bg-navy/90 shadow-xl shadow-black/30 backdrop-blur-md"
              : "border-border bg-surface shadow-lg shadow-navy/10"
          }`}
        >
          <nav className="flex flex-col gap-1" aria-label="Mobil menü">
            {hizmetNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`rounded-xl px-3 py-3 text-base font-semibold transition-colors ${
                  scrolled
                    ? "text-gold hover:bg-white/10"
                    : "text-gold-dark hover:bg-surface-muted"
                }`}
              >
                {item.label}
              </Link>
            ))}
            {mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`rounded-xl px-3 py-3 text-base font-medium transition-colors ${
                  scrolled
                    ? "text-white/90 hover:bg-white/10"
                    : "text-navy hover:bg-surface-muted"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div
            className={`mt-2 flex flex-col gap-3 border-t pt-4 ${
              scrolled ? "border-white/10" : "border-border"
            }`}
          >
            <a
              href={`tel:${siteConfig.phoneTel}`}
              onClick={() => sendGAEvent("event", "phone_click")}
              className={`flex items-center gap-2 px-3 text-base font-semibold ${
                scrolled ? "text-white" : "text-navy"
              }`}
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
              İlanlarımız
            </CtaButton>
          </div>
        </div>
      )}
    </header>
  );
}
