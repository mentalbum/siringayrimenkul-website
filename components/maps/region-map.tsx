"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { APIProvider, Map, Polygon } from "@vis.gl/react-google-maps";
import { siteConfig } from "@/lib/site-config";
import { geoJsonPolygonToPaths } from "@/lib/geo";
import { brandMapStyle } from "@/lib/map-style";
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

  // Frame the map on the live Eryaman core (the Etimesgut mahalleler). The
  // three Yenimahalle "yakında" mahalleler sit well to the north and would
  // otherwise stretch the default view out across all of Ankara.
  const framedItems = items.filter((item) => item.mahalle.durum === "yayinda");
  const boundsItems = framedItems.length > 0 ? framedItems : items;
  const boundsPoints = boundsItems.flatMap((item) =>
    item.boundary
      ? geoJsonPolygonToPaths(item.boundary).flat()
      : [item.mahalle.merkezKoordinat]
  );
  const lats = boundsPoints.map((point) => point.lat);
  const lngs = boundsPoints.map((point) => point.lng);

  return (
    <APIProvider apiKey={siteConfig.googleMapsApiKey}>
      <Map
        defaultBounds={{
          north: Math.max(...lats),
          south: Math.min(...lats),
          east: Math.max(...lngs),
          west: Math.min(...lngs),
          padding: 12,
        }}
        gestureHandling="greedy"
        clickableIcons={false}
        styles={brandMapStyle}
        style={{ width: "100%", height: "100%" }}
      >
        {withBoundary.map(({ mahalle, boundary }) => {
          const isYayinda = mahalle.durum === "yayinda";
          const isHovered = hoveredSlug === mahalle.slug;
          return (
            <Polygon
              key={mahalle.slug}
              paths={geoJsonPolygonToPaths(boundary!)}
              strokeColor={isYayinda ? "#FBCA12" : "#b3ad9f"}
              strokeOpacity={isYayinda ? 0.9 : 0.5}
              strokeWeight={isYayinda ? 2 : 1.5}
              fillColor={isYayinda ? "#FBCA12" : "#b3ad9f"}
              fillOpacity={isYayinda ? (isHovered ? 0.34 : 0.2) : isHovered ? 0.14 : 0.05}
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
