import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site-config";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          background: "#373643",
          padding: 80,
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 220,
            height: 220,
            borderRadius: 32,
            background: "#FBCA12",
            color: "#373643",
            fontSize: 130,
            fontWeight: 700,
            marginRight: 56,
          }}
        >
          Ş
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 64, fontWeight: 700, color: "#FFFFFF" }}>
            {siteConfig.name}
          </div>
          <div style={{ marginTop: 16, fontSize: 32, color: "#FBCA12", fontWeight: 600 }}>
            Eryaman Emlak Rehberi
          </div>
          <div style={{ marginTop: 24, fontSize: 24, color: "rgba(255,255,255,0.75)" }}>
            {siteConfig.serviceArea}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
