"use client";

import dynamic from "next/dynamic";
import type { Koordinat } from "@/lib/types";
import type { SiteMapEntry } from "@/components/maps/mahalle-map";
import { MapSkeleton } from "@/components/maps/map-skeleton";
import { InViewport } from "@/components/maps/in-viewport";

const MahalleMap = dynamic(
  () => import("@/components/maps/mahalle-map").then((mod) => mod.MahalleMap),
  { ssr: false, loading: () => <MapSkeleton /> }
);

interface MahalleMapLoaderProps {
  center: Koordinat;
  mahalleBoundary?: GeoJSON.Feature;
  siteler: SiteMapEntry[];
}

export function MahalleMapLoader({ center, mahalleBoundary, siteler }: MahalleMapLoaderProps) {
  return (
    <InViewport>
      <MahalleMap center={center} mahalleBoundary={mahalleBoundary} siteler={siteler} />
    </InViewport>
  );
}
