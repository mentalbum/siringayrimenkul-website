"use client";

import { useRouter } from "next/navigation";
import { APIProvider, Map, Marker, Polygon } from "@vis.gl/react-google-maps";
import { siteConfig } from "@/lib/site-config";
import { geoJsonPolygonToPaths } from "@/lib/geo";
import type { Koordinat, Site } from "@/lib/types";

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
        {siteler
          .filter((site): site is Site & { koordinat: Koordinat } => Boolean(site.koordinat))
          .map((site) => (
            <Marker
              key={site.slug}
              position={site.koordinat}
              title={site.isim}
              icon="/icons/pin-gold.svg"
              onClick={() => router.push(`/mahalleler/${site.mahalleSlug}/${site.slug}`)}
            />
          ))}
      </Map>
    </APIProvider>
  );
}
