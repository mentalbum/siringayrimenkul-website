"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { sendGAEvent } from "@/lib/ga";
import { hizmetNav, mainNav, siteConfig } from "@/lib/site-config";
import { TrackedCtaLink } from "@/components/ui/tracked-cta-link";
import { CloseIcon, MenuIcon, PhoneIcon } from "@/components/ui/icons";


export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  function aktifBolum(href: string) {
    return pathname === href || (href !== "/" && pathname?.startsWith(`${href}/`));
  }

  // Menü bir diyalog değil: Tab ile çıkılabilir, odak içeride kilitlenmez.
  useEffect(() => {
    if (!open) return;
    const kapat = () => setOpen(false);
    const disarida = (event: Event) => {
      if (event.target instanceof Node && !headerRef.current?.contains(event.target)) kapat();
    };
    const tus = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      kapat();
      menuButtonRef.current?.focus();
    };
    const masaustu = window.matchMedia("(min-width: 1024px)");
    const boyutDegisti = () => { if (masaustu.matches) kapat(); };
    document.addEventListener("keydown", tus);
    document.addEventListener("pointerdown", disarida);
    document.addEventListener("focusin", disarida);
    window.addEventListener("popstate", kapat);
    masaustu.addEventListener("change", boyutDegisti);
    return () => {
      document.removeEventListener("keydown", tus);
      document.removeEventListener("pointerdown", disarida);
      document.removeEventListener("focusin", disarida);
      window.removeEventListener("popstate", kapat);
      masaustu.removeEventListener("change", boyutDegisti);
    };
  }, [open]);

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
      ref={headerRef}
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
          aria-label={`${siteConfig.name} — sayfanın başına dön`}
          onClick={(event) => {
            // Logo hangi sayfada olursa olsun navigasyon yapmaz; bulunulan
            // sayfayı en üste kaydırır (Özgün'ün tercihi). href="/" SEO ve
            // orta-tık/yeni-sekme için duruyor.
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            event.preventDefault();
            setOpen(false);
            window.scrollTo({
              top: 0,
              behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
            });
          }}
        >
          {/* preload DEĞİL fetchPriority: src scroll durumuna göre değiştiği
              için preload <head>'e link basıp LCP kaynaklarıyla yarışıyordu
              (Next Image dokümanının kendi tavsiyesi). sizes ile srcset,
              gerçek ~91px genişliğe iner — 480px varyant indirilmez. */}
          <Image
            src={scrolled ? "/brand/sirin-logo-on-dark.png" : "/brand/sirin-logo-on-light.png"}
            alt={siteConfig.name}
            width={480}
            height={233}
            sizes="91px"
            className="h-10 w-auto sm:h-11"
            fetchPriority="high"
          />
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Ana menü">
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={pathname === item.href ? "page" : aktifBolum(item.href) ? "location" : undefined}
              className={`text-sm font-medium transition-colors ${
                scrolled ? "text-white/85 hover:text-gold" : "text-navy hover:text-gold-dark"
              } ${aktifBolum(item.href) ? "underline decoration-gold decoration-2 underline-offset-8" : ""}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-5 lg:flex">
          <a
            href={`tel:${siteConfig.phoneTel}`}
            onClick={() => sendGAEvent("event", "phone_click", { konum: "header" })}
            className={`flex items-center gap-1.5 text-sm font-semibold transition-colors ${
              scrolled ? "text-white hover:text-gold" : "text-navy hover:text-gold-dark"
            }`}
          >
            <PhoneIcon className="h-4 w-4" />
            {siteConfig.phoneDisplay}
          </a>
          <TrackedCtaLink href={siteConfig.sahibindenUrl} gaEvent="sahibinden_click" gaParams={{ konum: "header" }} openInNewTab variant="primary">
            İlanlarımız
          </TrackedCtaLink>
        </div>

        <button
          ref={menuButtonRef}
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="mobil-menu"
          aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
          className={`inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full transition-colors lg:hidden ${
            scrolled ? "text-white" : "text-navy"
          }`}
        >
          {open ? <CloseIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
        </button>
      </div>

      <div
        id="mobil-menu"
        hidden={!open}
        className={`animate-fade-up mx-3 mt-2 max-h-[calc(100dvh-10rem-env(safe-area-inset-bottom))] max-w-6xl overflow-y-auto overscroll-contain rounded-2xl border px-2 py-2 lg:hidden [animation-duration:0.25s] sm:mx-auto ${
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
              aria-current={pathname === item.href ? "page" : undefined}
              className={`rounded-xl px-3 py-3 text-base font-semibold transition-colors ${
                scrolled
                  ? "text-gold hover:bg-white/10"
                  : "text-gold-dark hover:bg-surface-muted"
              } ${aktifBolum(item.href) ? "bg-gold/10 underline decoration-gold decoration-2 underline-offset-4" : ""}`}
            >
              {item.label}
            </Link>
          ))}
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              aria-current={pathname === item.href ? "page" : aktifBolum(item.href) ? "location" : undefined}
              className={`rounded-xl px-3 py-3 text-base font-medium transition-colors ${
                scrolled
                  ? "text-white/90 hover:bg-white/10"
                  : "text-navy hover:bg-surface-muted"
              } ${aktifBolum(item.href) ? "bg-gold/10 underline decoration-gold decoration-2 underline-offset-4" : ""}`}
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
            onClick={() => sendGAEvent("event", "phone_click", { konum: "header_mobil_menu" })}
            className={`flex items-center gap-2 px-3 text-base font-semibold ${
              scrolled ? "text-white" : "text-navy"
            }`}
          >
            <PhoneIcon className="h-5 w-5" />
            {siteConfig.phoneDisplay}
          </a>
          <TrackedCtaLink
            href={siteConfig.sahibindenUrl}
            gaEvent="sahibinden_click" gaParams={{ konum: "header_mobil_menu" }}
            openInNewTab
            variant="primary"
            className="w-full"
          >
            İlanlarımız
          </TrackedCtaLink>
        </div>
      </div>
    </header>
  );
}
