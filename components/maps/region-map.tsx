"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { APIProvider, Map, Polygon } from "@vis.gl/react-google-maps";
import { siteConfig } from "@/lib/site-config";
import { geoJsonPolygonToPaths } from "@/lib/geo";
import type { Mahalle } from "@/lib/types";
import { ClusteredMarkers } from "@/components/maps/clustered-markers";

interface RegionMapItem {
  mahalle: Mahalle;
  boundary?: GeoJSON.Feature;
}

interface RegionMapProps {
  items: RegionMapItem[];
}

export function RegionMap({ items }: RegionMapProps) {
  const router = useRouter();
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);

  if (!siteConfig.googleMapsApiKey) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-2xl bg-surface-muted p-6 text-center text-sm text-muted">
        Harita yapılandırması eksik (Google Maps API anahtarı tanımlı değil).
      </div>
    );
  }

  const withBoundary = items.filter((item) => item.boundary);
  const withoutBoundary = items.filter((item) => !item.boundary);

  const boundaryPoints = withBoundary.flatMap((item) =>
    geoJsonPolygonToPaths(item.boundary!).flat()
  );
  const fallbackPoints = withoutBoundary.map((item) => item.mahalle.merkezKoordinat);
  const allPoints = [...boundaryPoints, ...fallbackPoints];
  const lats = allPoints.map((point) => point.lat);
  const lngs = allPoints.map((point) => point.lng);

  return (
    <APIProvider apiKey={siteConfig.googleMapsApiKey}>
      <Map
        defaultBounds={{
          north: Math.max(...lats),
          south: Math.min(...lats),
          east: Math.max(...lngs),
          west: Math.min(...lngs),
          padding: 32,
        }}
        gestureHandling="greedy"
        style={{ width: "100%", height: "100%" }}
      >
        {withBoundary.map(({ mahalle, boundary }) => {
          const isYayinda = mahalle.durum === "yayinda";
          const isHovered = hoveredSlug === mahalle.slug;
          return (
            <Polygon
              key={mahalle.slug}
              paths={geoJsonPolygonToPaths(boundary!)}
              strokeColor="#373643"
              strokeOpacity={isYayinda ? 0.9 : 0.5}
              strokeWeight={isYayinda ? 2 : 1.5}
              fillColor={isYayinda ? "#FBCA12" : "#373643"}
              fillOpacity={isYayinda ? (isHovered ? 0.32 : 0.22) : isHovered ? 0.16 : 0.06}
              onClick={() => router.push(`/mahalleler/${mahalle.slug}`)}
              onMouseOver={() => setHoveredSlug(mahalle.slug)}
              onMouseOut={() => setHoveredSlug((current) => (current === mahalle.slug ? null : current))}
            />
          );
        })}
        {withoutBoundary.length > 0 && (
          <ClusteredMarkers
            markers={withoutBoundary.map(({ mahalle }) => ({
              key: mahalle.slug,
              position: mahalle.merkezKoordinat,
              title: mahalle.isim,
              icon: mahalle.durum === "yayinda" ? "/icons/pin-gold.svg" : "/icons/pin-muted.svg",
              onClick: () => router.push(`/mahalleler/${mahalle.slug}`),
            }))}
          />
        )}
      </Map>
    </APIProvider>
  );
}
