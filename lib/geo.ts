import type { Koordinat } from "@/lib/types";

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
