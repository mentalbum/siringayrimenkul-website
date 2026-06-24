"use client";

import dynamic from "next/dynamic";
import type { Koordinat, Site } from "@/lib/types";
import { MapSkeleton } from "@/components/maps/map-skeleton";

const MahalleMap = dynamic(
  () => import("@/components/maps/mahalle-map").then((mod) => mod.MahalleMap),
  { ssr: false, loading: () => <MapSkeleton /> }
);

interface SiteBoundaryEntry {
  site: Site;
  boundary: GeoJSON.Feature;
}

interface MahalleMapLoaderProps {
  center: Koordinat;
  boundary?: GeoJSON.Feature;
  siteler: Site[];
  siteBoundaries?: SiteBoundaryEntry[];
}

export function MahalleMapLoader({
  center,
  boundary,
  siteler,
  siteBoundaries,
}: MahalleMapLoaderProps) {
  return (
    <MahalleMap
      center={center}
      boundary={boundary}
      siteler={siteler}
      siteBoundaries={siteBoundaries}
    />
  );
}
