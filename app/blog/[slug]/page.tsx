import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import {
  getAllBlogPosts,
  getBlogPostBySlug,
  getMahalleBySlug,
  getSitelerByMahalle,
} from "@/lib/content";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { FaqSection } from "@/components/ui/faq-section";
import { YazarKarti } from "@/components/blog/yazar-karti";
import { getBlogKonu } from "@/lib/blog-konular";
import { CtaButton } from "@/components/ui/button";
import { CtaBanner } from "@/components/ui/cta-banner";
import { truncateForMeta } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";
import { organizationRef, OZGUN_ID, WEBSITE_ID } from "@/lib/structured-data";

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
    // Nested metadata objects replace the root layout's openGraph wholesale,
    // so locale/siteName/images must be restated here.
    openGraph: {
      type: "article",
      locale: "tr_TR",
      siteName: siteConfig.name,
      title: post.baslik,
      description: truncateForMeta(post.ozet),
      publishedTime: post.tarih,
      images: [{ url: "/images/ofis-ic-mekan.jpg", width: 1284, height: 936 }],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) notFound();

  const ilgiliMahalle = post.ilgiliMahalle ? getMahalleBySlug(post.ilgiliMahalle) : undefined;

  const tumYazilar = getAllBlogPosts().filter((p) => p.slug !== post.slug);
  // Önce aynı mahalle, sonra aynı konu (satış/kira/miras-tapu/mahalle),
  // en son geri kalanlar — okur kendi derdinin devamını görsün.
  const buKonu = getBlogKonu(post.slug);
  const ilgiliYazilar = [
    ...tumYazilar.filter((p) => p.ilgiliMahalle && p.ilgiliMahalle === post.ilgiliMahalle),
    ...tumYazilar.filter(
      (p) =>
        getBlogKonu(p.slug) === buKonu &&
        !(p.ilgiliMahalle && p.ilgiliMahalle === post.ilgiliMahalle)
    ),
    ...tumYazilar.filter(
      (p) =>
        getBlogKonu(p.slug) !== buKonu &&
        !(p.ilgiliMahalle && p.ilgiliMahalle === post.ilgiliMahalle)
    ),
  ].slice(0, 3);

  const postUrl = `${siteConfig.url}/blog/${post.slug}`;
  // mtime KULLANILMIYOR: Vercel taze checkout'ta tüm mtime'lar build gününe
  // eşitlenir → her deploy tüm yazıları "bugün güncellendi" gösterirdi (yapay
  // tazelik — Google'ın tarih kılavuzuna aykırı). Kaynak: elle beyan edilen
  // frontmatter `guncelleme`; yoksa yayın tarihi.
  const dateModified = post.guncelleme && post.guncelleme > post.tarih ? post.guncelleme : post.tarih;
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
    author: {
      "@type": "Person",
      "@id": OZGUN_ID,
      name: "Özgün Şirin",
      url: `${siteConfig.url}/hakkimizda`,
    },
    publisher: organizationRef,
  };

  // Posts that already carry a hand-written, richly-linked FAQ section in the
  // body only get the JSON-LD; the rest get a visible FaqSection (which emits
  // its own FAQPage JSON-LD).
  const govdedeSss = post.content.includes("## Sık Sorulan Sorular");
  const faqJsonLd = govdedeSss && post.faq && post.faq.length > 0
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
        <p className="flex flex-wrap items-center gap-x-2 text-xs font-medium text-muted">
          <Link
            href="/hakkimizda#ozgun-sirin"
            className="font-semibold text-gold-dark hover:underline"
          >
            Özgün Şirin
          </Link>
          <span aria-hidden="true">·</span>
          <span>Emlak Danışmanı, {siteConfig.name}</span>
          <span aria-hidden="true">·</span>
          <time dateTime={post.tarih}>
            {new Date(post.tarih).toLocaleDateString("tr-TR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </time>
          {post.guncelleme && post.guncelleme > post.tarih && (
            <>
              <span aria-hidden="true">·</span>
              <span>
                Güncellendi:{" "}
                <time dateTime={post.guncelleme}>
                  {new Date(post.guncelleme).toLocaleDateString("tr-TR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </time>
              </span>
            </>
          )}
        </p>
        <h1 className="mt-2 text-3xl sm:text-4xl">{post.baslik}</h1>
      </header>

      <div className="prose prose-slate mt-8 max-w-none prose-headings:font-heading prose-headings:text-navy prose-a:text-gold-dark prose-a:no-underline hover:prose-a:underline">
        <MDXRemote source={post.content} options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }} />
      </div>

      <YazarKarti />

      {!govdedeSss && post.faq && post.faq.length > 0 && (
        <FaqSection title="Sık Sorulan Sorular" items={post.faq} className="mt-12" />
      )}

      {ilgiliMahalle && (
        <div className="mt-12 rounded-2xl border border-border bg-surface-muted px-6 py-6">
          <p className="text-sm text-body">
            Bu yazı <strong>{ilgiliMahalle.isim}</strong> ile ilgili. Mahalle rehberinin tamamını
            inceleyebilirsiniz.
          </p>
          {/* İç bağ ölçümü (2026-07-29): 44 yazının 35'inde tek site linki yoktu.
              Mahalleli yazılar mahallenin öne çıkan (TKGM sınırı doğrulanmış)
              sitelerine köprü kurar — seçim deterministik, veri değişmedikçe sabit. */}
          {(() => {
            const oneCikanlar = getSitelerByMahalle(ilgiliMahalle.slug)
              .filter((site) => site.sinirGeoJSON)
              .slice(0, 4);
            if (oneCikanlar.length === 0) return null;
            return (
              <p className="mt-3 text-sm text-body">
                Mahalleden site rehberleri:{" "}
                {oneCikanlar.map((site, i) => (
                  <span key={site.slug}>
                    {i > 0 && " · "}
                    <Link
                      href={`/mahalleler/${ilgiliMahalle.slug}/${site.slug}`}
                      className="font-semibold text-gold-dark hover:underline"
                    >
                      {site.isim}
                    </Link>
                  </span>
                ))}
              </p>
            );
          })()}
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

      {/* Niyet-uyumlu kapanış (2026-07-29): 44 yazının tamamı tek tip genel
          CTA taşıyordu. Yazının konusu okuyucunun niyetini söylüyor — kapanış
          o niyetin bir sonraki gerçek adımını sunmalı (satış yazısı → değerleme,
          kira yazısı → kiraya verme hizmeti, mahalle yazısı → mahalle rehberi). */}
      {(() => {
        const konu = getBlogKonu(post.slug);
        const kapanis = {
          satis: {
            baslik: "Evinizi Satmayı mı Düşünüyorsunuz?",
            aciklama:
              "İlk adım doğru fiyat: dairenizi sitenizin gerçeğinden yola çıkarak birlikte değerleyelim, satış yol haritanız aynı gün elinizde olsun.",
            birincil: { href: "/ev-degerleme", etiket: "Evinizi Değerlendirelim" },
            ikincil: { href: "/eryamanda-ev-satmak", etiket: "Satış Sürecimiz" },
          },
          kira: {
            baslik: "Evinizi Kiraya mı Vereceksiniz?",
            aciklama:
              "Doğru kira bedeli, doğrulanmış kiracı ve sağlam sözleşme — süreci sizin adınıza biz yönetelim.",
            birincil: { href: "/eryamanda-ev-kiraya-vermek", etiket: "Kiraya Verme Sürecimiz" },
            ikincil: { href: "/araclar/kira-artisi-hesaplama", etiket: "Kira Artışı Hesaplayın" },
          },
          "miras-tapu": {
            baslik: "Tapu ve Miras İşlerinde Yol Arkadaşınız Olalım",
            aciklama:
              "Kat mülkiyeti, hisse ve miras satışı teknik işlerdir — durumunuzu dinleyelim, gerçekçi bir yol haritası çıkaralım.",
            birincil: { href: "/iletisim", etiket: "Bize Ulaşın" },
            ikincil: { href: "/araclar/tapu-harci-hesaplama", etiket: "Tapu Harcı Hesaplayın" },
          },
          mahalle: {
            baslik: "Eryaman'da Bir Sonraki Adımınızı Birlikte Atalım",
            aciklama:
              "Mahalleleri ve siteleri tek tek tanıyoruz; evinizi değerlendirmek isterseniz doğrudan bize ulaşın.",
            birincil: { href: "/ev-degerleme", etiket: "Değerleme İsteyin" },
            ikincil: { href: "/mahalleler", etiket: "Mahalle Rehberleri" },
          },
        }[konu];
        return (
          <CtaBanner className="mt-8" baslik={kapanis.baslik} aciklama={kapanis.aciklama}>
            <CtaButton href={kapanis.birincil.href} variant="primary">
              {kapanis.birincil.etiket}
            </CtaButton>
            <CtaButton href={kapanis.ikincil.href} variant="outline-light">
              {kapanis.ikincil.etiket}
            </CtaButton>
      </CtaBanner>
        );
      })()}

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
