"use client";

import dynamic from "next/dynamic";
import type { Mahalle } from "@/lib/types";
import { MapSkeleton } from "@/components/maps/map-skeleton";
import { InViewport } from "@/components/maps/in-viewport";

const RegionMap = dynamic(
  () => import("@/components/maps/region-map").then((mod) => mod.RegionMap),
  { ssr: false, loading: () => <MapSkeleton /> }
);

interface RegionMapLoaderProps {
  items: { mahalle: Mahalle; boundary?: GeoJSON.Feature }[];
}

export function RegionMapLoader({ items }: RegionMapLoaderProps) {
  return (
    <InViewport>
      <RegionMap items={items} />
    </InViewport>
  );
}
