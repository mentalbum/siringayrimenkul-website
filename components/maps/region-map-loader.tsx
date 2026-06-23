"use client";

import dynamic from "next/dynamic";
import type { Mahalle } from "@/lib/types";
import { MapSkeleton } from "@/components/maps/map-skeleton";

const RegionMap = dynamic(
  () => import("@/components/maps/region-map").then((mod) => mod.RegionMap),
  { ssr: false, loading: () => <MapSkeleton /> }
);

export function RegionMapLoader({ mahalleler }: { mahalleler: Mahalle[] }) {
  return <RegionMap mahalleler={mahalleler} />;
}
