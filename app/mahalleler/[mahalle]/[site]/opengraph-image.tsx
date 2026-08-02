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
  // Uzun site adları tek karta sığsın diye kademeli punto.
  const puntoBoyu = isim.length > 30 ? 52 : isim.length > 20 ? 62 : 74;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#373643",
          padding: 72,
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Marka imzası: sağ üstte topografik halkalar (CTA bandı ve hero ile aynı motif) */}
        <svg
          width="560"
          height="560"
          viewBox="0 0 560 560"
          style={{ position: "absolute", top: -140, right: -120 }}
        >
          {[70, 120, 170, 220, 270].map((r, i) => (
            <ellipse
              key={r}
              cx="280"
              cy="280"
              rx={r}
              ry={r * 0.82}
              fill="none"
              stroke="#FBCA12"
              strokeWidth="2"
              strokeOpacity={0.28 - i * 0.045}
            />
          ))}
          <circle cx="280" cy="280" r="7" fill="#FBCA12" fillOpacity="0.6" />
        </svg>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 26,
              fontWeight: 600,
              color: "#FBCA12",
              letterSpacing: 3,
            }}
          >
            {`ERYAMAN · ${(mahalle?.isim ?? "Etimesgut").toLocaleUpperCase("tr-TR")}`}
          </div>
          <div
            style={{
              marginTop: 18,
              fontSize: puntoBoyu,
              fontWeight: 700,
              color: "#FFFFFF",
              lineHeight: 1.1,
              maxWidth: 900,
            }}
          >
            {isim}
          </div>
          <div style={{ marginTop: 22, fontSize: 32, color: "rgba(255,255,255,0.8)" }}>
            Evinizi Satalım, Kiraya Verelim
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "2px solid rgba(255,255,255,0.15)",
            paddingTop: 28,
          }}
        >
          <div style={{ fontSize: 30, fontWeight: 700, color: "#FBCA12" }}>
            {siteConfig.name}
          </div>
          <div style={{ fontSize: 30, fontWeight: 600, color: "#FFFFFF" }}>
            {siteConfig.phoneDisplay}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
