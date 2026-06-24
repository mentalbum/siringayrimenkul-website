export const siteConfig = {
  name: "Şirin Gayrimenkul",
  description:
    "Eryaman (Etimesgut ve Yenimahalle) bölgesinde mahalle mahalle, site site hazırlanmış yerel emlak rehberi. İlanlarımıza sahibinden.com üzerinden ulaşın.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.siringayrimenkul.com",
  phoneDisplay: process.env.NEXT_PUBLIC_PHONE_DISPLAY ?? "0532 363 96 60",
  phoneTel: process.env.NEXT_PUBLIC_PHONE_TEL ?? "+905323639660",
  whatsappUrl: process.env.NEXT_PUBLIC_WHATSAPP_URL ?? "https://wa.me/905323639660",
  sahibindenUrl:
    process.env.NEXT_PUBLIC_SAHIBINDEN_URL ??
    "https://eryamansiringayrimenkul.sahibinden.com/one-cikanlar",
  serviceArea: "Eryaman, Etimesgut ve Yenimahalle / Ankara",
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
} as const;

export const mainNav = [
  { label: "Anasayfa", href: "/" },
  { label: "Mahalleler", href: "/mahalleler" },
  { label: "Siteler", href: "/siteler" },
  { label: "Blog", href: "/blog" },
  { label: "Hakkımızda", href: "/hakkimizda" },
  { label: "İletişim", href: "/iletisim" },
] as const;
