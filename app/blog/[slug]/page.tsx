import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import {
  getAllBlogPosts,
  getBlogPostBySlug,
  getBlogPostLastModified,
  getMahalleBySlug,
} from "@/lib/content";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { CtaButton } from "@/components/ui/button";
import { CtaBanner } from "@/components/ui/cta-banner";
import { truncateForMeta } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";
import { organizationRef, WEBSITE_ID } from "@/lib/structured-data";

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
    alternates: { canonical: `/blog/${post.slug}` },
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

  const tumYazilar = getAllBlogPosts().filter((p) => p.slug !== post.slug);
  const ilgiliYazilar = [
    ...tumYazilar.filter((p) => p.ilgiliMahalle && p.ilgiliMahalle === post.ilgiliMahalle),
    ...tumYazilar.filter((p) => !post.ilgiliMahalle || p.ilgiliMahalle !== post.ilgiliMahalle),
  ].slice(0, 3);

  const postUrl = `${siteConfig.url}/blog/${post.slug}`;
  const dateModified = (() => {
    const mtime = getBlogPostLastModified(post.slug);
    // dateModified must never predate publication.
    return mtime > new Date(post.tarih) ? mtime.toISOString() : post.tarih;
  })();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    mainEntityOfPage: { "@type": "WebPage", "@id": postUrl },
    headline: post.baslik,
    description: post.ozet,
    image: `${siteConfig.url}/images/ofis-ic-mekan.jpg`,
    datePublished: post.tarih,
    dateModified,
    inLanguage: "tr-TR",
    url: postUrl,
    isPartOf: { "@id": WEBSITE_ID },
    author: organizationRef,
    publisher: organizationRef,
  };

  const faqJsonLd = post.faq && post.faq.length > 0
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: post.faq.map(({ soru, cevap }) => ({
          "@type": "Question",
          name: soru,
          acceptedAnswer: { "@type": "Answer", text: cevap },
        })),
      }
    : null;

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
        <MDXRemote source={post.content} options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }} />
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

      {ilgiliYazilar.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl">İlgili Yazılar</h2>
          <div className="mt-5 space-y-4">
            {ilgiliYazilar.map((yazi) => (
              <Link
                key={yazi.slug}
                href={`/blog/${yazi.slug}`}
                className="block rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-gold"
              >
                <p className="text-sm font-semibold text-navy hover:text-gold-dark">{yazi.baslik}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted">{yazi.ozet}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <CtaBanner
        className="mt-8"
        baslik="Eryaman'da Bir Sonraki Adımınızı Birlikte Atalım"
        aciklama="Ev arıyor olun ya da evinizi değerlendirmek isteyin, doğrudan bize ulaşın."
      >
        <CtaButton href="/iletisim" variant="primary">
          Bize Ulaşın
        </CtaButton>
        <CtaButton href={siteConfig.sahibindenUrl} external variant="outline-light">
          İlanlarımı Gör
        </CtaButton>
      </CtaBanner>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
    </div>
  );
}
