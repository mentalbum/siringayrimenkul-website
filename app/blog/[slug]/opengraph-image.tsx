import { ImageResponse } from "next/og";
import { getAllBlogPosts, getBlogPostBySlug } from "@/lib/content";
import { siteConfig } from "@/lib/site-config";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return getAllBlogPosts().map((post) => ({ slug: post.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  const baslik = post?.baslik ?? siteConfig.name;
  const ustBilgi = `Blog · ${siteConfig.name}`;

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
        <div style={{ marginTop: 20, fontSize: 56, fontWeight: 700, color: "#FFFFFF", lineHeight: 1.2 }}>
          {baslik}
        </div>
      </div>
    ),
    { ...size }
  );
}
