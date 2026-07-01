/**
 * Branded Google Maps style — a dark navy "night survey" map in the Şirin
 * Gayrimenkul palette. Deep navy land (the brand ink), cream labels, muted-gold
 * arteries, so the gold site pins and gold neighbourhood boundaries drawn on top
 * read as the brightest, most alive things on the map. This is the site's
 * signature: the territory of Eryaman rendered in the brand's own colours.
 *
 * Legacy JSON styling (applies to the raster map; no mapId is set).
 */
export const brandMapStyle: google.maps.MapTypeStyle[] = [
  // Base — navy ink land, cream labels with a dark legibility halo
  { elementType: "geometry", stylers: [{ color: "#33323e" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#d8d2c4" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#26252f" }, { weight: 2 }] },

  // Administrative boundaries + neighbourhood labels
  { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#4d4b59" }] },
  { featureType: "administrative.land_parcel", elementType: "labels", stylers: [{ visibility: "off" }] },
  {
    featureType: "administrative.neighborhood",
    elementType: "labels.text.fill",
    stylers: [{ color: "#a49db0" }],
  },

  // Points of interest — hide commercial clutter, keep parks as a dark green
  { featureType: "poi.business", stylers: [{ visibility: "off" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#2f3a30" }] },
  { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#7d8a72" }] },

  // Roads — calm navy local grid, dim-gold arterials, muted-gold highways
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#403f4c" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#b3ad9f" }] },
  { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#574f38" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#c9a636" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#a8862a" }] },

  // Transit — keep stations legible (metro matters for real estate)
  { featureType: "transit.line", elementType: "geometry", stylers: [{ color: "#45434f" }] },
  { featureType: "transit.station", elementType: "labels.text.fill", stylers: [{ color: "#a49db0" }] },

  // Water — deep slate so it recedes behind the land
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#262d38" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#6f7784" }] },
];
