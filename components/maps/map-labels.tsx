"use client";

import { useEffect } from "react";
import { useMap } from "@vis.gl/react-google-maps";
import type { Koordinat } from "@/lib/types";

export interface MapLabelDef {
  key: string;
  position: Koordinat;
  text: string;
}

/** Text-only labels (no pin) placed directly on the map — used to name each
 * shaded mahalle polygon on the region overview map. */
export function MapLabels({ labels }: { labels: MapLabelDef[] }) {
  const map = useMap();

  useEffect(() => {
    if (!map || labels.length === 0) return;

    const markers = labels.map(
      (label) =>
        new google.maps.Marker({
          map,
          position: label.position,
          label: {
            text: label.text,
            color: "#FBCA12",
            fontSize: "13px",
            className: "map-mahalle-label",
          },
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 0,
          },
          clickable: false,
          zIndex: 10,
        })
    );

    return () => markers.forEach((marker) => marker.setMap(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, labels]);

  return null;
}
