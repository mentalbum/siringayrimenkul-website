import { ImageResponse } from "next/og";
import { getAllEtaplar, getAllMahalleler, getMahalleBySlug } from "@/lib/content";
import { siteConfig } from "@/lib/site-config";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return getAllMahalleler().flatMap((mahalle) =>
    getAllEtaplar(mahalle.slug).map((etap) => ({
      mahalle: mahalle.slug,
      etap: etap.no,
    }))
  );
}

export default async function Image({
  params,
}: {
  params: Promise<{ mahalle: string; etap: string }>;
}) {
  const { mahalle: mahalleSlug, etap: etapNo } = await params;
  const mahalle = getMahalleBySlug(mahalleSlug);
  const ustBilgi = mahalle ? `${mahalle.isim} · ${siteConfig.name}` : siteConfig.name;
  const baslik = `Eryaman ${etapNo}. Etap`;

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
          Eryaman Emlak Rehberi
        </div>
      </div>
    ),
    { ...size }
  );
}
