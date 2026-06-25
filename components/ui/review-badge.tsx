import { getGoogleReviewSummary } from "@/lib/google-reviews";
import { siteConfig } from "@/lib/site-config";
import { StarIcon } from "@/components/ui/icons";

export async function ReviewBadge({ className = "" }: { className?: string }) {
  const summary = await getGoogleReviewSummary();
  if (!summary) return null;

  return (
    <a
      href={siteConfig.officeMapsUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex cursor-pointer items-center gap-2 ${className}`}
    >
      <span className="flex items-center gap-0.5 text-gold">
        {Array.from({ length: 5 }).map((_, i) => (
          <StarIcon key={i} className="h-4 w-4" />
        ))}
      </span>
      <span className="text-sm font-semibold text-navy">
        {summary.rating.toFixed(1)} · {summary.userRatingCount} Google Yorumu
      </span>
    </a>
  );
}
