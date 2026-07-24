import type { Metadata } from "next";
import { getAllBlogPosts } from "@/lib/content";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { BlogFiltre } from "@/components/blog/blog-filtre";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Eryaman Emlak Rehberi",
  description:
    "Eryaman mahalle rehberleri, site/rezidans tanıtımları ve ev satış-kiralama tavsiyeleri. Şirin Gayrimenkul'dan Eryaman bölgesi için güncel içerikler.",
  alternates: { canonical: "/blog" },
};

export default function BlogPage() {
  const posts = getAllBlogPosts();

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Eryaman Emlak Rehberi",
    description: "Eryaman mahalle rehberleri, site/rezidans tanıtımları ve ev satış-kiralama tavsiyeleri.",
    url: `${siteConfig.url}/blog`,
    publisher: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
    hasPart: posts.map((post) => ({
      "@type": "Article",
      headline: post.baslik,
      url: `${siteConfig.url}/blog/${post.slug}`,
      datePublished: post.tarih,
    })),
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <Breadcrumbs items={[{ label: "Anasayfa", href: "/" }, { label: "Blog", href: "/blog" }]} />

      <header className="mt-4 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-gold-dark">Blog</p>
        <h1 className="mt-2 text-3xl sm:text-4xl">Eryaman Emlak Rehberi</h1>
        <p className="mt-4 text-base leading-relaxed text-body">
          Mahalle tanıtımlarından site/rezidans rehberlerine, ev alırken dikkat edilmesi
          gerekenlere kadar Eryaman bölgesiyle ilgili her şey burada.
        </p>
      </header>

      {posts.length > 0 ? (
        <BlogFiltre posts={posts} />
      ) : (
        <p className="mt-10 text-sm text-muted">Yakında burada olacak.</p>
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
    </div>
  );
}
