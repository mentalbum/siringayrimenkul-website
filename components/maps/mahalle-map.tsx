"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { APIProvider, Map, Polygon } from "@vis.gl/react-google-maps";
import { siteConfig } from "@/lib/site-config";
import { geoJsonPolygonToPaths } from "@/lib/geo";
import type { Koordinat, Site } from "@/lib/types";
import { ClusteredMarkers } from "@/components/maps/clustered-markers";

interface SiteBoundaryEntry {
  site: Site;
  boundary: GeoJSON.Feature;
}

interface MahalleMapProps {
  center: Koordinat;
  boundary?: GeoJSON.Feature;
  siteler: Site[];
  siteBoundaries?: SiteBoundaryEntry[];
}

export function MahalleMap({ center, boundary, siteler, siteBoundaries = [] }: MahalleMapProps) {
  const router = useRouter();
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);

  if (!siteConfig.googleMapsApiKey) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-2xl bg-surface-muted p-6 text-center text-sm text-muted">
        Harita yapılandırması eksik (Google Maps API anahtarı tanımlı değil).
      </div>
    );
  }

  const paths = boundary ? geoJsonPolygonToPaths(boundary) : [];
  const sitesWithBoundarySlugs = new Set(siteBoundaries.map((entry) => entry.site.slug));
  const sitelerWithKoordinat = siteler.filter(
    (site): site is Site & { koordinat: Koordinat } =>
      Boolean(site.koordinat) && !sitesWithBoundarySlugs.has(site.slug)
  );

  return (
    <APIProvider apiKey={siteConfig.googleMapsApiKey}>
      <Map
        defaultCenter={center}
        defaultZoom={15}
        gestureHandling="greedy"
        style={{ width: "100%", height: "100%" }}
      >
        {paths.length > 0 && (
          <Polygon
            paths={paths}
            strokeColor="#373643"
            strokeOpacity={0.9}
            strokeWeight={2}
            fillColor="#FBCA12"
            fillOpacity={0.18}
          />
        )}
        {siteBoundaries.map(({ site, boundary: siteBoundary }) => {
          const isHovered = hoveredSlug === site.slug;
          return (
            <Polygon
              key={site.slug}
              paths={geoJsonPolygonToPaths(siteBoundary)}
              strokeColor="#373643"
              strokeOpacity={0.9}
              strokeWeight={2}
              fillColor="#FBCA12"
              fillOpacity={isHovered ? 0.5 : 0.32}
              onClick={() => router.push(`/mahalleler/${site.mahalleSlug}/${site.slug}`)}
              onMouseOver={() => setHoveredSlug(site.slug)}
              onMouseOut={() => setHoveredSlug((current) => (current === site.slug ? null : current))}
            />
          );
        })}
        <ClusteredMarkers
          markers={sitelerWithKoordinat.map((site) => ({
            key: site.slug,
            position: site.koordinat,
            title: site.isim,
            icon: "/icons/pin-gold.svg",
            onClick: () => router.push(`/mahalleler/${site.mahalleSlug}/${site.slug}`),
          }))}
        />
      </Map>
    </APIProvider>
  );
}
