"use client";

import { useEffect } from "react";
import { useMap } from "@vis.gl/react-google-maps";
import type { Koordinat } from "@/lib/types";

export interface MapLabelDef {
  key: string;
  position: Koordinat;
  text: string;
}

// Marker labels are fixed CSS pixels and don't scale with zoom the way the
// polygon underneath them does — without this, zooming out shrinks the shape
// but not the text, so it spills outside its parcel. Scale font size by the
// same 2x-per-zoom-level rule the map tiles themselves use, anchored on the
// zoom level (15, the site/ada map's default) where 13px looks right.
const BASE_FONT_PX = 13;
const REFERENCE_ZOOM = 15;
const MIN_FONT_PX = 8;
const MAX_FONT_PX = 15;

function fontSizeForZoom(zoom: number): string {
  const scaled = BASE_FONT_PX * Math.pow(2, zoom - REFERENCE_ZOOM);
  return `${Math.max(MIN_FONT_PX, Math.min(MAX_FONT_PX, scaled)).toFixed(1)}px`;
}

function labelFor(text: string, fontSize: string): google.maps.MarkerLabel {
  return { text, color: "#FBCA12", fontSize, className: "map-mahalle-label" };
}

/** Text-only labels (no pin) placed directly on the map — used to name each
 * shaded mahalle/site polygon instead of relying on a separate pin marker. */
export function MapLabels({ labels }: { labels: MapLabelDef[] }) {
  const map = useMap();

  useEffect(() => {
    if (!map || labels.length === 0) return;

    const initialFontSize = fontSizeForZoom(map.getZoom() ?? REFERENCE_ZOOM);
    const markers = labels.map((label) => ({
      text: label.text,
      marker: new google.maps.Marker({
        map,
        position: label.position,
        label: labelFor(label.text, initialFontSize),
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 0,
        },
        clickable: false,
        zIndex: 10,
      }),
    }));

    const listener = map.addListener("zoom_changed", () => {
      const zoom = map.getZoom();
      if (zoom == null) return;
      const fontSize = fontSizeForZoom(zoom);
      for (const { marker, text } of markers) {
        marker.setLabel(labelFor(text, fontSize));
      }
    });

    return () => {
      listener.remove();
      markers.forEach(({ marker }) => marker.setMap(null));
    };
  }, [map, labels]);

  return null;
}
