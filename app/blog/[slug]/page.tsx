import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllBlogPosts, getBlogPostBySlug, getMahalleBySlug } from "@/lib/content";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { CtaButton } from "@/components/ui/button";
import { truncateForMeta } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getAllBlogPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) return {};

  return {
    title: post.baslik,
    description: truncateForMeta(post.ozet),
    openGraph: {
      type: "article",
      title: post.baslik,
      description: truncateForMeta(post.ozet),
      publishedTime: post.tarih,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) notFound();

  const ilgiliMahalle = post.ilgiliMahalle ? getMahalleBySlug(post.ilgiliMahalle) : undefined;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.baslik,
    description: post.ozet,
    datePublished: post.tarih,
    author: { "@type": "Organization", name: siteConfig.name },
    publisher: { "@type": "Organization", name: siteConfig.name },
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Breadcrumbs
        items={[
          { label: "Anasayfa", href: "/" },
          { label: "Blog", href: "/blog" },
          { label: post.baslik, href: `/blog/${post.slug}` },
        ]}
      />

      <header className="mt-4">
        <time dateTime={post.tarih} className="text-xs font-medium text-muted">
          {new Date(post.tarih).toLocaleDateString("tr-TR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </time>
        <h1 className="mt-2 text-3xl sm:text-4xl">{post.baslik}</h1>
      </header>

      <div className="prose prose-slate mt-8 max-w-none prose-headings:font-heading prose-headings:text-navy prose-a:text-gold-dark prose-a:no-underline hover:prose-a:underline">
        <MDXRemote source={post.content} />
      </div>

      {ilgiliMahalle && (
        <div className="mt-12 rounded-2xl border border-border bg-surface-muted px-6 py-6">
          <p className="text-sm text-body">
            Bu yazı <strong>{ilgiliMahalle.isim}</strong> ile ilgili. Mahalle rehberinin tamamını
            inceleyebilirsiniz.
          </p>
          <CtaButton href={`/mahalleler/${ilgiliMahalle.slug}`} variant="outline" className="mt-4">
            {ilgiliMahalle.isim} Rehberi
          </CtaButton>
        </div>
      )}

      <div className="mt-8 rounded-2xl bg-navy px-6 py-8 text-center text-white">
        <h2 className="text-xl text-white">Eryaman&apos;da Ev mi Arıyorsunuz?</h2>
        <p className="mt-2 text-sm text-white/75">
          Güncel ilanlarımıza sahibinden.com üzerinden ulaşabilirsiniz.
        </p>
        <CtaButton href={siteConfig.sahibindenUrl} external variant="primary" className="mt-5">
          İlanlarımı Gör
        </CtaButton>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  );
}
