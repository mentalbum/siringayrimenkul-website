"use client";

import dynamic from "next/dynamic";
import type { Koordinat } from "@/lib/types";
import type { SiteMapEntry } from "@/components/maps/mahalle-map";
import { MapSkeleton } from "@/components/maps/map-skeleton";
import { InViewport } from "@/components/maps/in-viewport";
import { MapErrorBoundary } from "@/components/maps/map-error-boundary";

const MahalleMap = dynamic(
  () => import("@/components/maps/mahalle-map").then((mod) => mod.MahalleMap),
  { ssr: false, loading: () => <MapSkeleton /> }
);

interface MahalleMapLoaderProps {
  center: Koordinat;
  mahalleBoundary?: GeoJSON.Feature;
  siteler: SiteMapEntry[];
  parseleOdakla?: boolean;
}

export function MahalleMapLoader({
  center,
  mahalleBoundary,
  siteler,
  parseleOdakla,
}: MahalleMapLoaderProps) {
  return (
    // Sınır en dışta: modülün geç yüklenmesi de, haritanın kendisi de aynı
    // kutunun içinde kalsın (gerekçe: map-error-boundary.tsx).
    <MapErrorBoundary>
      <InViewport>
        <MahalleMap
          center={center}
          mahalleBoundary={mahalleBoundary}
          siteler={siteler}
          parseleOdakla={parseleOdakla}
        />
      </InViewport>
    </MapErrorBoundary>
  );
}
