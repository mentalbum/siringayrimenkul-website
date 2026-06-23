export const siteConfig = {
  name: "Şirin Gayrimenkul",
  description:
    "Eryaman (Etimesgut ve Yenimahalle) bölgesinde mahalle mahalle, site site hazırlanmış yerel emlak rehberi. Şirin Gayrimenkul ile bölgenizi tanıyın, ilanlarımıza sahibinden.com üzerinden ulaşın.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.siringayrimenkul.com",
  phoneDisplay: process.env.NEXT_PUBLIC_PHONE_DISPLAY ?? "0532 363 96 60",
  phoneTel: process.env.NEXT_PUBLIC_PHONE_TEL ?? "+905323639660",
  whatsappUrl: process.env.NEXT_PUBLIC_WHATSAPP_URL ?? "https://wa.me/905323639660",
  sahibindenUrl:
    process.env.NEXT_PUBLIC_SAHIBINDEN_URL ??
    "https://eryamansiringayrimenkul.sahibinden.com/one-cikanlar",
  serviceArea: "Eryaman, Etimesgut ve Yenimahalle / Ankara",
  googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
} as const;

export const mainNav = [
  { label: "Anasayfa", href: "/" },
  { label: "Mahalleler", href: "/mahalleler" },
  { label: "Blog", href: "/blog" },
  { label: "Hakkımızda", href: "/hakkimizda" },
  { label: "İletişim", href: "/iletisim" },
] as const;
