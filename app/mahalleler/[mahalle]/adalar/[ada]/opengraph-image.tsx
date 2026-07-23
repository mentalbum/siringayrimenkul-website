import { ImageResponse } from "next/og";
import {
  adaDisplayLabel,
  adaRouteKey,
  getAdaEntriesByRouteKey,
  getAllAdalar,
  getAllMahalleler,
  getMahalleBySlug,
} from "@/lib/content";
import { siteConfig } from "@/lib/site-config";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return getAllMahalleler().flatMap((mahalle) =>
    Array.from(new Set(getAllAdalar(mahalle.slug).map((ada) => adaRouteKey(ada)))).map((key) => ({
      mahalle: mahalle.slug,
      ada: key,
    }))
  );
}

export default async function Image({
  params,
}: {
  params: Promise<{ mahalle: string; ada: string }>;
}) {
  const { mahalle: mahalleSlug, ada: adaKey } = await params;
  const mahalle = getMahalleBySlug(mahalleSlug);
  const entries = getAdaEntriesByRouteKey(mahalleSlug, adaKey);
  const ustBilgi = mahalle ? `${mahalle.isim} · ${siteConfig.name}` : siteConfig.name;
  const baslik = entries.length > 0 ? `${adaDisplayLabel(entries[0])} Ada` : "Eryaman";
  const altBilgi =
    entries.length === 1 ? entries[0].site.isim : "Eryaman Emlak Rehberi";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "#373643",
          padding: 80,
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 28,
            fontWeight: 600,
            color: "#FBCA12",
            textTransform: "uppercase",
            letterSpacing: 2,
          }}
        >
          {ustBilgi}
        </div>
        <div style={{ marginTop: 20, fontSize: 72, fontWeight: 700, color: "#FFFFFF" }}>
          {baslik}
        </div>
        <div style={{ marginTop: 24, fontSize: 28, color: "rgba(255,255,255,0.75)" }}>
          {altBilgi}
        </div>
      </div>
    ),
    { ...size }
  );
}
