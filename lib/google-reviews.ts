const PLACE_ID = "ChIJCwE25j4x0xQRhNzudaO2cSg";

export interface GoogleReviewSummary {
  rating: number;
  userRatingCount: number;
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
