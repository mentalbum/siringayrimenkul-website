export const siteConfig = {
  name: "Şirin Gayrimenkul",
  // İlk ~160 karakter SERP snippet'i: ayırt edici iddia öne (720 site + tapu
  // sınırlı tek rehber + 5,0 profil), eylem çağrısı sona. Rakip snippet'ler
  // jenerik ("N yıllık tecrübe") — ölçülen TO %2,2'yi yukarı çekmek için USP
  // görünür olmalı. Yorum SAYISI bilerek yok (rakip sabotajı kuralı), puan var.
  description:
    "Eryaman emlakçısı Şirin Gayrimenkul — 700'den fazla site ve rezidansı tapu sınırlarıyla haritalayan tek yerel rehber. 5,0 puanlı Google profili. Evinizi satarken ya da kiraya verirken fiyatı birlikte belirleyelim.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.siringayrimenkul.com",
  phoneDisplay: process.env.NEXT_PUBLIC_PHONE_DISPLAY ?? "0532 363 96 60",
  phoneTel: process.env.NEXT_PUBLIC_PHONE_TEL ?? "+905323639660",
  whatsappUrl: process.env.NEXT_PUBLIC_WHATSAPP_URL ?? "https://wa.me/905323639660",
  sahibindenUrl:
    process.env.NEXT_PUBLIC_SAHIBINDEN_URL ??
    "https://eryamansiringayrimenkul.sahibinden.com/one-cikanlar",
  serviceArea: "Eryaman, Etimesgut / Ankara",
  officeAddress: "Tunahan Mah. 208. Sokak No:4/59, 4. Etap Çarşı, 06824 Etimesgut/Ankara",
  officeAddressParts: {
    streetAddress: "Tunahan Mah. 208. Sokak No:4/59, 4. Etap Çarşı",
    addressLocality: "Etimesgut",
    addressRegion: "Ankara",
    postalCode: "06824",
    addressCountry: "TR",
  },
  officeKoordinat: { lat: 39.9892632, lng: 32.6238687 },
  officeMapsUrl: "https://maps.app.goo.gl/Buv7sKF7P3ujwVpt7",
  calismaSaatleri: [
    { gunler: "Pazartesi - Cumartesi", saat: "09:00 - 19:00" },
    { gunler: "Pazar", saat: "09:00 - 17:00" },
  ],
  googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
  gaMeasurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "",
  yandexMapsUrl: "https://yandex.com.tr/maps/org/eryaman_sirin_gayrimenkul/40827902036/",
  tiktokUrl: "https://www.tiktok.com/@siringayrimenkul",
  instagramUrl: "https://www.instagram.com/eryamansiringayrimenkul/",
  facebookUrl: "https://www.facebook.com/profile.php?id=61585267540417",
} as const;

export const mainNav = [
  { label: "Anasayfa", href: "/" },
  { label: "Mahalleler", href: "/mahalleler" },
  { label: "Siteler", href: "/siteler" },
  { label: "Değerleme", href: "/ev-degerleme" },
  { label: "Araçlar", href: "/araclar" },
  { label: "Blog", href: "/blog" },
  { label: "Hakkımızda", href: "/hakkimizda" },
  { label: "İletişim", href: "/iletisim" },
] as const;

/** Ev sahibi hizmet sayfaları — mobil menüde ve footer'da öne çıkar
 * (masaüstü menüsüne sığmadığı için ayrı liste). */
export const hizmetNav = [
  { label: "Evinizi Satmak", href: "/eryamanda-ev-satmak" },
  { label: "Evinizi Kiraya Vermek", href: "/eryamanda-ev-kiraya-vermek" },
] as const;
