"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { APIProvider, Map, Polygon } from "@vis.gl/react-google-maps";
import { siteConfig } from "@/lib/site-config";
import { geoJsonPolygonToPaths, polygonCentroid, ringWidthMeters } from "@/lib/geo";
import { brandMapStyle } from "@/lib/map-style";
import type { Koordinat } from "@/lib/types";
import { MapLabels } from "@/components/maps/map-labels";

export interface EtapMapItem {
  no: string;
  /** Etap sayfasının yolu — poligona tıklayınca gidilir. */
  href: string;
  /** Etabın adalarının kadastro poligonları (MultiPolygon). */
  boundary: GeoJSON.Feature;
}

interface EtapMapProps {
  items: EtapMapItem[];
}

/* Etaplar birbirinden RENKLE ayrışıyor. Mahalle haritasındaki "yayında =
 * altın" kodlaması burada işe yaramaz: beş etabın hepsi yayında, ayırt
 * edilmesi gereken şey hangi adanın hangi etaba ait olduğu. Marka altını
 * 1. Etap'ta kalıyor, kalanlar aynı sıcaklıkta ama ayrık tonlar. */
const ETAP_RENKLERI: Record<string, string> = {
  "1": "#FBCA12",
  "2": "#5FB3A1",
  "3": "#E8845A",
  "4": "#8FA3BF",
  "5": "#C77BB0",
};
const VARSAYILAN_RENK = "#b3ad9f";

/** Etabın bütün halkalarını kapsayan en geniş halka — etiket çapası olarak
 * kullanılır. Adaların ortalaması bir caddenin ortasına düşebiliyor; en büyük
 * adanın merkezi etiketi her zaman gerçek bir yapı adasının üstünde tutuyor. */
function enGenisHalka(paths: Koordinat[][]): Koordinat[] {
  return paths.reduce((enIyi, ring) =>
    ringWidthMeters(ring) > ringWidthMeters(enIyi) ? ring : enIyi
  );
}

export function EtapMap({ items }: EtapMapProps) {
  const router = useRouter();
  const [hoveredNo, setHoveredNo] = useState<string | null>(null);

  if (!siteConfig.googleMapsApiKey) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-2xl bg-surface-muted p-6 text-center text-sm text-muted">
        Harita yapılandırması eksik (Google Maps API anahtarı tanımlı değil).
      </div>
    );
  }

  const sekiller = items.map((item) => ({
    ...item,
    paths: geoJsonPolygonToPaths(item.boundary),
  }));

  const allPoints = sekiller.flatMap((sekil) => sekil.paths.flat());
  if (allPoints.length === 0) return null;
  const lats = allPoints.map((point) => point.lat);
  const lngs = allPoints.map((point) => point.lng);

  return (
    <APIProvider apiKey={siteConfig.googleMapsApiKey}>
      <Map
        defaultBounds={{
          north: Math.max(...lats),
          south: Math.min(...lats),
          east: Math.max(...lngs),
          west: Math.min(...lngs),
          padding: 16,
        }}
        gestureHandling="greedy"
        clickableIcons={false}
        styles={brandMapStyle}
        style={{ width: "100%", height: "100%" }}
      >
        {sekiller.map((sekil) => {
          const renk = ETAP_RENKLERI[sekil.no] ?? VARSAYILAN_RENK;
          const isHovered = hoveredNo === sekil.no;
          return (
            // Bir etabın bütün adaları TEK Polygon olarak çiziliyor; böylece
            // hover ve tıklama etabın tamamında birlikte çalışıyor.
            <Polygon
              key={sekil.no}
              paths={sekil.paths}
              strokeColor={renk}
              strokeOpacity={0.9}
              strokeWeight={isHovered ? 2.5 : 1.8}
              fillColor={renk}
              fillOpacity={isHovered ? 0.38 : 0.22}
              onClick={() => router.push(sekil.href)}
              onMouseOver={() => setHoveredNo(sekil.no)}
              onMouseOut={() => setHoveredNo((current) => (current === sekil.no ? null : current))}
            />
          );
        })}
        <MapLabels
          labels={sekiller.map((sekil) => {
            const ring = enGenisHalka(sekil.paths);
            return {
              key: sekil.no,
              position: polygonCentroid(ring),
              text: `${sekil.no}. Etap`,
              widthMeters: ringWidthMeters(ring),
            };
          })}
        />
      </Map>
    </APIProvider>
  );
}
