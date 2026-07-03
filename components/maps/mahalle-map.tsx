"use client";

import { useRouter } from "next/navigation";
import { APIProvider, Map, Polygon } from "@vis.gl/react-google-maps";
import { siteConfig } from "@/lib/site-config";
import { geoJsonPolygonToPaths, polygonCentroid, ringWidthMeters } from "@/lib/geo";
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
  labelWidthMeters: number;
  href: string;
}

/** One shape per parcel ring — a multi-ada site (e.g. 7 separate adalar) is
 * several disjoint parcels, not one shape with holes, so each ring needs its
 * own <Polygon> (Google Maps treats extra paths on a single Polygon as
 * cutout holes, not separate shapes). A single cadastral parcel can also be
 * shared by several distinct sites (Devlet's cooperative parcels), so rings
 * are deduped by ada/parsel: the shape renders once, its label carries all
 * site names, and its click goes to the shared ada page instead of one
 * arbitrary site. */
function buildShapes(
  entries: { site: Site; boundary: GeoJSON.Feature }[]
): SiteShape[] {
  interface Group {
    ring: Koordinat[];
    adaNo?: string;
    routeKey?: string;
    mahalleSlug: string;
    siteler: Site[];
  }
  const groups: Record<string, Group> = {};

  for (const { site, boundary } of entries) {
    const rings = geoJsonPolygonToPaths(boundary);
    const adalar = (boundary.properties?.adalar as string[] | undefined) ?? [];
    rings.forEach((ring, index) => {
      const adaParsel = adalar[index]; // "46518/1" biçiminde
      const key = adaParsel
        ? `${site.mahalleSlug}:${adaParsel}`
        : `${site.slug}:${index}`;
      const group = groups[key];
      if (group) {
        group.siteler.push(site);
      } else {
        groups[key] = {
          ring,
          adaNo: adaParsel?.split("/")[0],
          routeKey: adaParsel?.replace("/", "-"),
          mahalleSlug: site.mahalleSlug,
          siteler: [site],
        };
      }
    });
  }

  const groupList = Object.values(groups);
  return Object.entries(groups).map(([key, g]) => {
    const paylasimli = g.siteler.length > 1;
    const isimler = g.siteler.map((s) => s.isim);
    const cokParselli =
      !paylasimli && groupList.filter((o) => o.siteler[0] === g.siteler[0]).length > 1;
    return {
      key,
      paths: g.ring,
      labelPosition: polygonCentroid(g.ring),
      labelText: paylasimli
        ? isimler.join(" · ")
        : cokParselli && g.adaNo
          ? `${isimler[0]} ${g.adaNo} Ada`
          : isimler[0],
      labelWidthMeters: ringWidthMeters(g.ring),
      href:
        paylasimli && g.routeKey
          ? `/mahalleler/${g.mahalleSlug}/adalar/${g.routeKey}`
          : `/mahalleler/${g.siteler[0].mahalleSlug}/${g.siteler[0].slug}`,
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
  const shapes = buildShapes(
    siteler.filter(
      (entry): entry is SiteMapEntry & { boundary: GeoJSON.Feature } => Boolean(entry.boundary)
    )
  );

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
            widthMeters: shape.labelWidthMeters,
          }))}
        />
      </Map>
    </APIProvider>
  );
}
