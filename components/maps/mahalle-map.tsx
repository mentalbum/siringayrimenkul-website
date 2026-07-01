"use client";

import { useRouter } from "next/navigation";
import { APIProvider, Map, Polygon } from "@vis.gl/react-google-maps";
import { siteConfig } from "@/lib/site-config";
import { geoJsonPolygonToPaths, polygonCentroid } from "@/lib/geo";
import { brandMapStyle } from "@/lib/map-style";
import type { Koordinat, Site } from "@/lib/types";
import { MapLabels } from "@/components/maps/map-labels";

export interface SiteMapEntry {
  site: Site;
  boundary?: GeoJSON.Feature;
}

interface MahalleMapProps {
  center: Koordinat;
  /** Optional neighbourhood-level outline shown as muted context (no fill,
   * no label) behind the individual site parcels. */
  mahalleBoundary?: GeoJSON.Feature;
  siteler: SiteMapEntry[];
}

interface SiteShape {
  key: string;
  paths: Koordinat[];
  labelPosition: Koordinat;
  labelText: string;
  href: string;
}

/** One shape per parcel ring — a multi-ada site (e.g. 7 separate adalar) is
 * several disjoint parcels, not one shape with holes, so each ring needs its
 * own <Polygon> (Google Maps treats extra paths on a single Polygon as
 * cutout holes, not separate shapes). Each ring is labeled "{site adı} {ada
 * no} Ada" when its ada number is known (so sites with several parcels can
 * be told apart from their very first one), falling back to the site name
 * alone for older boundary files that don't record a per-ring ada number. */
function siteShapes(site: Site, boundary: GeoJSON.Feature): SiteShape[] {
  const rings = geoJsonPolygonToPaths(boundary);
  const adalar = (boundary.properties?.adalar as string[] | undefined) ?? [];

  return rings.map((ring, index) => {
    const adaNo = adalar[index]?.split("/")[0];
    return {
      key: `${site.slug}-${index}`,
      paths: ring,
      labelPosition: polygonCentroid(ring),
      labelText: adaNo ? `${site.isim} ${adaNo} Ada` : site.isim,
      href: `/mahalleler/${site.mahalleSlug}/${site.slug}`,
    };
  });
}

export function MahalleMap({ center, mahalleBoundary, siteler }: MahalleMapProps) {
  const router = useRouter();

  if (!siteConfig.googleMapsApiKey) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-2xl bg-surface-muted p-6 text-center text-sm text-muted">
        Harita yapılandırması eksik (Google Maps API anahtarı tanımlı değil).
      </div>
    );
  }

  const mahallePaths = mahalleBoundary ? geoJsonPolygonToPaths(mahalleBoundary) : [];

  // Only sites with a real TKGM-derived parcel boundary are shown on the map —
  // no pins as a placeholder. A site simply doesn't appear here until its own
  // boundary has been added.
  const shapes = siteler
    .filter((entry): entry is SiteMapEntry & { boundary: GeoJSON.Feature } => Boolean(entry.boundary))
    .flatMap(({ site, boundary }) => siteShapes(site, boundary));

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
        {mahallePaths.length > 0 && (
          <Polygon
            paths={mahallePaths}
            strokeColor="#FBCA12"
            strokeOpacity={0.5}
            strokeWeight={1.5}
            fillOpacity={0}
          />
        )}
        {shapes.map((shape) => (
          <Polygon
            key={shape.key}
            paths={shape.paths}
            strokeColor="#FBCA12"
            strokeOpacity={0.95}
            strokeWeight={2}
            fillColor="#FBCA12"
            fillOpacity={0.14}
            onClick={() => router.push(shape.href)}
          />
        ))}
        <MapLabels
          labels={shapes.map((shape) => ({
            key: shape.key,
            position: shape.labelPosition,
            text: shape.labelText,
          }))}
        />
      </Map>
    </APIProvider>
  );
}
