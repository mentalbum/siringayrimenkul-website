"use client";

import { useState } from "react";
import type { BlogPost } from "@/lib/types";
import { getBlogKonu, KONU_ETIKETLERI, type BlogKonu } from "@/lib/blog-konular";
import { BlogCard } from "@/components/blog/blog-card";

const KONU_SIRASI: BlogKonu[] = ["satis", "kira", "mahalle"];

/** Blog dizini için konu çipleri + filtrelenmiş kart ızgarası. Tüm yazılar
 * sunucudan gelir; filtre tarayıcıda çalışır, sayfa statik kalır. */
export function BlogFiltre({ posts }: { posts: BlogPost[] }) {
  const [konu, setKonu] = useState<BlogKonu | "hepsi">("hepsi");

  const gorunenler =
    konu === "hepsi" ? posts : posts.filter((post) => getBlogKonu(post.slug) === konu);

  const cipSinif = (aktif: boolean) =>
    `cursor-pointer rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
      aktif
        ? "border-gold bg-gold text-navy"
        : "border-border bg-surface text-body hover:border-gold hover:text-gold-dark"
    }`;

  return (
    <>
      <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label="Konuya göre filtrele">
        <button type="button" onClick={() => setKonu("hepsi")} className={cipSinif(konu === "hepsi")}>
          Tümü ({posts.length})
        </button>
        {KONU_SIRASI.map((k) => {
          const sayi = posts.filter((post) => getBlogKonu(post.slug) === k).length;
          return (
            <button key={k} type="button" onClick={() => setKonu(k)} className={cipSinif(konu === k)}>
              {KONU_ETIKETLERI[k]} ({sayi})
            </button>
          );
        })}
      </div>

      {gorunenler.length > 0 ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {gorunenler.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      ) : (
        <p className="mt-10 text-sm text-muted">Bu konuda yazı bulunamadı.</p>
      )}
    </>
  );
}
