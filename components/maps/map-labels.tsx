"use client";

import { useEffect } from "react";
import { useMap } from "@vis.gl/react-google-maps";
import type { Koordinat } from "@/lib/types";

export interface MapLabelDef {
  key: string;
  position: Koordinat;
  text: string;
  /** East-west extent of the labeled shape in meters. When set, the label is
   * shrunk to fit inside the shape and hidden entirely once even the minimum
   * font size would spill outside it — so zooming out never leaves label text
   * hanging over neighbouring parcels. */
  widthMeters?: number;
}

// Marker labels are fixed CSS pixels and don't scale with zoom the way the
// polygon underneath them does. Two rules keep them inside their shape:
// 1. zoom-proportional sizing (2x per zoom level, like the map tiles),
//    anchored on zoom 15 where 13px looks right;
// 2. when the shape's width is known, cap the font so the text never renders
//    wider than the shape — and hide the label if it can't fit at MIN size.
const BASE_FONT_PX = 13;
const REFERENCE_ZOOM = 15;
const MIN_FONT_PX = 8;
const MAX_FONT_PX = 15;
const AVG_GLYPH_EM = 0.6; // approx average glyph width for Poppins 600
const FILL_RATIO = 0.92; // keep a small margin inside the shape

function labelFontPx(def: MapLabelDef, zoom: number): number | null {
  // Zoom-proportional size is clamped (never hides on its own) — hiding is
  // reserved for the fit rule below, so e.g. the region map's mahalle names
  // stay visible at its wide default zoom.
  const zoomSize = Math.max(
    MIN_FONT_PX,
    Math.min(MAX_FONT_PX, BASE_FONT_PX * Math.pow(2, zoom - REFERENCE_ZOOM))
  );
  if (!def.widthMeters) return zoomSize;

  const metersPerPx =
    (156543.03392 * Math.cos((def.position.lat * Math.PI) / 180)) / Math.pow(2, zoom);
  const shapePx = def.widthMeters / metersPerPx;
  const fitPx = (shapePx * FILL_RATIO) / (def.text.length * AVG_GLYPH_EM);
  if (fitPx < MIN_FONT_PX) return null; // can't fit inside the shape → hide
  return Math.min(zoomSize, fitPx, MAX_FONT_PX);
}

function labelFor(text: string, fontPx: number): google.maps.MarkerLabel {
  return {
    text,
    color: "#FBCA12",
    fontSize: `${fontPx.toFixed(1)}px`,
    className: "map-mahalle-label",
  };
}

/** Text-only labels (no pin) placed directly on the map — used to name each
 * shaded mahalle/site polygon instead of relying on a separate pin marker. */
export function MapLabels({ labels }: { labels: MapLabelDef[] }) {
  const map = useMap();

  useEffect(() => {
    if (!map || labels.length === 0) return;

    const entries = labels.map((def) => ({
      def,
      marker: new google.maps.Marker({
        map,
        position: def.position,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 0,
        },
        clickable: false,
        zIndex: 10,
      }),
    }));

    const applyZoom = () => {
      const zoom = map.getZoom();
      if (zoom == null) return;
      for (const { def, marker } of entries) {
        const fontPx = labelFontPx(def, zoom);
        if (fontPx == null) {
          marker.setVisible(false);
        } else {
          marker.setVisible(true);
          marker.setLabel(labelFor(def.text, fontPx));
        }
      }
    };

    applyZoom();
    const listener = map.addListener("zoom_changed", applyZoom);

    return () => {
      listener.remove();
      entries.forEach(({ marker }) => marker.setMap(null));
    };
  }, [map, labels]);

  return null;
}
