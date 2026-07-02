const PLACE_ID = "ChIJCwE25j4x0xQRhNzudaO2cSg";

export interface GoogleReviewSummary {
  rating: number;
  userRatingCount: number;
}

export interface GoogleReview {
  author: string;
  rating: number;
  text: string;
  relativeTime: string;
}

interface PlacesReview {
  rating?: number;
  text?: { text?: string };
  authorAttribution?: { displayName?: string };
  relativePublishTimeDescription?: string;
}

/** Up to 3 real, text-bearing Google reviews (the Places API returns the 5 it
 * deems most relevant). Display-only — never marked up as Review schema, per
 * Google's self-serving review guidelines. */
export async function getGoogleReviews(): Promise<GoogleReview[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) return [];

  try {
    const res = await fetch(
      `https://places.googleapis.com/v1/places/${PLACE_ID}?languageCode=tr`,
      {
        headers: {
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": "reviews",
        },
        next: { revalidate: 86400 },
      }
    );
    if (!res.ok) return [];

    const data = await res.json();
    const reviews: PlacesReview[] = Array.isArray(data.reviews) ? data.reviews : [];
    return reviews
      .filter((review) => (review.rating ?? 0) >= 4 && review.text?.text?.trim())
      .slice(0, 3)
      .map((review) => ({
        author: review.authorAttribution?.displayName ?? "Google kullanıcısı",
        rating: review.rating ?? 5,
        text: review.text!.text!.trim(),
        relativeTime: review.relativePublishTimeDescription ?? "",
      }));
  } catch {
    return [];
  }
}

export async function getGoogleReviewSummary(): Promise<GoogleReviewSummary | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch(`https://places.googleapis.com/v1/places/${PLACE_ID}`, {
      headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "rating,userRatingCount",
      },
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;

    const data = await res.json();
    if (typeof data.rating !== "number" || typeof data.userRatingCount !== "number") {
      return null;
    }
    return { rating: data.rating, userRatingCount: data.userRatingCount };
  } catch {
    return null;
  }
}
