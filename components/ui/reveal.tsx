"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  /** Kademeli giriş için gecikme (ms). Grid'lerde `index * 60` gibi kullanın. */
  delay?: number;
  className?: string;
}

/** Scroll-reveal sarmalayıcısı: içerik görünüme ~40px kala yumuşak fade-up ile
 * girer (bir kez). Saf CSS geçişi kullanır (bkz. globals.css `.reveal`);
 * prefers-reduced-motion CSS tarafında zaten kapatır, no-JS durumunu
 * layout'taki <noscript> stili kurtarır. IO desteklenmiyorsa anında görünür. */
export function Reveal({ children, delay = 0, className = "" }: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      // IO desteklenmiyorsa bir sonraki karede göster (senkron setState'ten
      // kaçınır — react-hooks/set-state-in-effect).
      const id = window.setTimeout(() => setVisible(true), 0);
      return () => window.clearTimeout(id);
    }
    const observer = new IntersectionObserver(
      (entries) => {
        // Görünüme girince VEYA hızlı kaydırmayla üstünden geçilmişse
        // (anchor/geri navigasyonu) göster — içerik "delikli" kalmasın.
        if (
          entries.some(
            (entry) => entry.isIntersecting || entry.boundingClientRect.top < 0
          )
        ) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -40px 0px", threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Gecikmeyi sınırla — geç kalan kartlar sayfayı "bekletiyor" hissi vermesin.
  const style =
    delay > 0
      ? ({ "--reveal-delay": `${Math.min(delay, 360)}ms` } as CSSProperties)
      : undefined;

  return (
    <div
      ref={ref}
      style={style}
      className={`reveal ${visible ? "reveal-visible" : ""} ${className}`.trim()}
    >
      {children}
    </div>
  );
}
