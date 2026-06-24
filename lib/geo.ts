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
