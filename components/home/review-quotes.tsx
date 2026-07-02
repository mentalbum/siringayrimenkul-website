import { getGoogleReviews } from "@/lib/google-reviews";
import { siteConfig } from "@/lib/site-config";
import { StarIcon } from "@/components/ui/icons";

/** Real Google reviews, fetched from the Places API and shown verbatim.
 * Display-only: intentionally not marked up as Review/AggregateRating schema
 * (self-serving review markup is against Google's guidelines). Renders
 * nothing if the API key is absent or no text reviews come back. */
export async function ReviewQuotes() {
  const reviews = await getGoogleReviews();
  if (reviews.length === 0) return null;

  return (
    <section className="bg-surface-muted py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-gold-dark">
              Google Yorumları
            </p>
            <h2 className="mt-2 text-2xl sm:text-3xl">Müşterilerimiz Ne Diyor?</h2>
          </div>
          <a
            href={siteConfig.officeMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer text-sm font-semibold text-gold-dark hover:underline"
          >
            Tüm yorumları Google&apos;da okuyun →
          </a>
        </div>

        <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => (
            <figure
              key={`${review.author}-${review.relativeTime}`}
              className="flex flex-col rounded-2xl border border-border bg-surface p-6"
            >
              <span className="flex items-center gap-0.5 text-gold" aria-label={`${review.rating} yıldız`}>
                {Array.from({ length: review.rating }).map((_, i) => (
                  <StarIcon key={i} className="h-4 w-4" />
                ))}
              </span>
              <blockquote className="mt-4 flex-1">
                <p className="line-clamp-5 text-sm leading-relaxed text-body">
                  &quot;{review.text}&quot;
                </p>
              </blockquote>
              <figcaption className="mt-4 flex items-baseline justify-between gap-2">
                <span className="text-sm font-semibold text-navy">{review.author}</span>
                <span className="text-xs text-muted">{review.relativeTime}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
