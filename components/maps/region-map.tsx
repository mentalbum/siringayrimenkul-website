"use client";

import { useRouter } from "next/navigation";
import { APIProvider, Map } from "@vis.gl/react-google-maps";
import { siteConfig } from "@/lib/site-config";
import type { Mahalle } from "@/lib/types";
import { ClusteredMarkers } from "@/components/maps/clustered-markers";

interface RegionMapProps {
  mahalleler: Mahalle[];
}

export function RegionMap({ mahalleler }: RegionMapProps) {
  const router = useRouter();

  if (!siteConfig.googleMapsApiKey) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-2xl bg-surface-muted p-6 text-center text-sm text-muted">
        Harita yapılandırması eksik (Google Maps API anahtarı tanımlı değil).
      </div>
    );
  }

  const lats = mahalleler.map((mahalle) => mahalle.merkezKoordinat.lat);
  const lngs = mahalleler.map((mahalle) => mahalle.merkezKoordinat.lng);

  return (
    <APIProvider apiKey={siteConfig.googleMapsApiKey}>
      <Map
        defaultBounds={{
          north: Math.max(...lats),
          south: Math.min(...lats),
          east: Math.max(...lngs),
          west: Math.min(...lngs),
          padding: 56,
        }}
        gestureHandling="greedy"
        style={{ width: "100%", height: "100%" }}
      >
        <ClusteredMarkers
          markers={mahalleler.map((mahalle) => ({
            key: mahalle.slug,
            position: mahalle.merkezKoordinat,
            title: mahalle.isim,
            icon: mahalle.durum === "yayinda" ? "/icons/pin-gold.svg" : "/icons/pin-muted.svg",
            onClick: () => router.push(`/mahalleler/${mahalle.slug}`),
          }))}
        />
      </Map>
    </APIProvider>
  );
}
