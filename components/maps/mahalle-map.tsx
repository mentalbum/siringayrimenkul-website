"use client";

import { useRouter } from "next/navigation";
import { APIProvider, Map, Polygon } from "@vis.gl/react-google-maps";
import { siteConfig } from "@/lib/site-config";
import { geoJsonPolygonToPaths, polygonCentroid } from "@/lib/geo";
import { brandMapStyle } from "@/lib/map-style";
import type { Koordinat, Site } from "@/lib/types";
import { ClusteredMarkers } from "@/components/maps/clustered-markers";
import { MapLabels } from "@/components/maps/map-labels";

interface MahalleMapProps {
  center: Koordinat;
  boundary?: GeoJSON.Feature;
  siteler: Site[];
}

export function MahalleMap({ center, boundary, siteler }: MahalleMapProps) {
  const router = useRouter();

  if (!siteConfig.googleMapsApiKey) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-2xl bg-surface-muted p-6 text-center text-sm text-muted">
        Harita yapılandırması eksik (Google Maps API anahtarı tanımlı değil).
      </div>
    );
  }

  const paths = boundary ? geoJsonPolygonToPaths(boundary) : [];
  // When a boundary is drawn, its owning site (always siteler[0] in current
  // usage) gets a text label on the shape instead of a separate pin — showing
  // both is redundant now that we can label the shape directly.
  const boundarySite = paths.length > 0 ? siteler[0] : undefined;
  const sitelerWithKoordinat = siteler
    .filter((site) => site !== boundarySite)
    .filter((site): site is Site & { koordinat: Koordinat } => Boolean(site.koordinat));

  return (
    <APIProvider apiKey={siteConfig.googleMapsApiKey}>
      <Map
        defaultCenter={center}
        defaultZoom={15}
        gestureHandling="greedy"
        clickableIcons={false}
        styles={brandMapStyle}
        style={{ width: "100%", height: "100%" }}
      >
        {paths.length > 0 && (
          <Polygon
            paths={paths}
            strokeColor="#FBCA12"
            strokeOpacity={0.95}
            strokeWeight={2}
            fillColor="#FBCA12"
            fillOpacity={0.14}
          />
        )}
        <ClusteredMarkers
          markers={sitelerWithKoordinat.map((site) => ({
            key: site.slug,
            position: site.koordinat,
            title: site.isim,
            icon: "/icons/pin-gold.svg",
            onClick: () => router.push(`/mahalleler/${site.mahalleSlug}/${site.slug}`),
          }))}
        />
        {boundarySite && (
          <MapLabels
            labels={[{ key: boundarySite.slug, position: polygonCentroid(paths[0]), text: boundarySite.isim }]}
          />
        )}
      </Map>
    </APIProvider>
  );
}
