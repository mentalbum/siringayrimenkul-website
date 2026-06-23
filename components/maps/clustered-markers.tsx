"use client";

import { useEffect } from "react";
import { useMap } from "@vis.gl/react-google-maps";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import type { Koordinat } from "@/lib/types";

export interface MarkerDef {
  key: string;
  position: Koordinat;
  title: string;
  icon: string;
  onClick: () => void;
}

export function ClusteredMarkers({ markers: markerDefs }: { markers: MarkerDef[] }) {
  const map = useMap();

  useEffect(() => {
    if (!map || markerDefs.length === 0) return;

    const markers = markerDefs.map((def) => {
      const marker = new google.maps.Marker({
        position: def.position,
        title: def.title,
        icon: def.icon,
      });
      marker.addListener("click", def.onClick);
      return marker;
    });

    const clusterer = new MarkerClusterer({
      map,
      markers,
      renderer: {
        render: ({ count, position }) =>
          new google.maps.Marker({
            position,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 22,
              fillColor: "#FBCA12",
              fillOpacity: 1,
              strokeColor: "#373643",
              strokeWeight: 2,
            },
            label: {
              text: String(count),
              color: "#373643",
              fontSize: "14px",
              fontWeight: "700",
            },
            zIndex: 1000 + count,
          }),
      },
    });

    // markerDefs is rebuilt every render but is effectively static per page mount;
    // re-keying the effect on the map instance alone avoids tearing down clusters on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  return null;
}
