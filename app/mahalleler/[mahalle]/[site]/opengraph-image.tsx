import { ImageResponse } from "next/og";
import { getAllMahalleler, getMahalleBySlug, getSiteBySlug, getSitelerByMahalle } from "@/lib/content";
import { siteConfig } from "@/lib/site-config";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return getAllMahalleler().flatMap((mahalle) =>
    getSitelerByMahalle(mahalle.slug).map((site) => ({
      mahalle: mahalle.slug,
      site: site.slug,
    }))
  );
}

export default async function Image({
  params,
}: {
  params: Promise<{ mahalle: string; site: string }>;
}) {
  const { mahalle: mahalleSlug, site: siteSlug } = await params;
  const mahalle = getMahalleBySlug(mahalleSlug);
  const site = getSiteBySlug(mahalleSlug, siteSlug);
  const isim = site?.isim ?? siteConfig.name;
  const ustBilgi = mahalle ? `${mahalle.isim} · ${siteConfig.name}` : siteConfig.name;

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
          {isim}
        </div>
        <div style={{ marginTop: 24, fontSize: 28, color: "rgba(255,255,255,0.75)" }}>
          Eryaman Emlak Rehberi
        </div>
      </div>
    ),
    { ...size }
  );
}
