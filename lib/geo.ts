import type { Koordinat } from "@/lib/types";

const EARTH_RADIUS_KM = 6371;

export function haversineDistanceKm(a: Koordinat, b: Koordinat): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const h =
    sinDLat * sinDLat + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinDLng * sinDLng;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export function geoJsonPolygonToPaths(feature: GeoJSON.Feature): Koordinat[][] {
  const geometry = feature.geometry;

  if (geometry.type === "Polygon") {
    return geometry.coordinates.map((ring) => ring.map(([lng, lat]) => ({ lat, lng })));
  }

  if (geometry.type === "MultiPolygon") {
    return geometry.coordinates.flatMap((polygon) =>
      polygon.map((ring) => ring.map(([lng, lat]) => ({ lat, lng })))
    );
  }

  return [];
}

/** Area-weighted centroid of a simple polygon ring — a better label anchor
 * than averaging vertices, which skews toward whichever edge has more points. */
export function polygonCentroid(ring: Koordinat[]): Koordinat {
  let area = 0;
  let cx = 0;
  let cy = 0;

  for (let i = 0; i < ring.length; i++) {
    const p0 = ring[i];
    const p1 = ring[(i + 1) % ring.length];
    const cross = p0.lng * p1.lat - p1.lng * p0.lat;
    area += cross;
    cx += (p0.lng + p1.lng) * cross;
    cy += (p0.lat + p1.lat) * cross;
  }
  area /= 2;

  if (Math.abs(area) < 1e-12) {
    const avg = ring.reduce((acc, p) => ({ lat: acc.lat + p.lat, lng: acc.lng + p.lng }), {
      lat: 0,
      lng: 0,
    });
    return { lat: avg.lat / ring.length, lng: avg.lng / ring.length };
  }

  return { lat: cy / (6 * area), lng: cx / (6 * area) };
}
