"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { MapSkeleton } from "@/components/maps/map-skeleton";

export function InViewport({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ref.current || visible) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [visible]);

  return (
    <div ref={ref} className="h-full w-full">
      {visible ? children : <MapSkeleton />}
    </div>
  );
}
