"use client";

import dynamic from "next/dynamic";
import { MapSkeleton } from "@/components/maps/map-skeleton";
import { InViewport } from "@/components/maps/in-viewport";
import type { EtapMapItem } from "@/components/maps/etap-map";

const EtapMap = dynamic(
  () => import("@/components/maps/etap-map").then((mod) => mod.EtapMap),
  { ssr: false, loading: () => <MapSkeleton /> }
);

interface EtapMapLoaderProps {
  items: EtapMapItem[];
}

export function EtapMapLoader({ items }: EtapMapLoaderProps) {
  return (
    <InViewport>
      <EtapMap items={items} />
    </InViewport>
  );
}
