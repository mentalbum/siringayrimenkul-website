import type { Metadata } from "next";
import { getAllBlogPosts } from "@/lib/content";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { BlogCard } from "@/components/blog/blog-card";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Eryaman bölgesinde mahalle rehberleri, site/rezidans tanıtımları ve emlak tavsiyeleri. Şirin Gayrimenkul'dan yerel emlak blogu.",
  alternates: { canonical: "/blog" },
};

export default function BlogPage() {
  const posts = getAllBlogPosts();

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
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      ) : (
        <p className="mt-10 text-sm text-muted">Yakında burada olacak.</p>
      )}
    </div>
  );
}
