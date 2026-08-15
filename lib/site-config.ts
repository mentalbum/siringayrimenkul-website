export const siteConfig = {
  name: "Şirin Gayrimenkul",
  // 15.08: 229 karakterdi ve Google kullanmıyordu — gövdedeki bir SSS pasajını
  // seçip basıyordu; yani açıklama sorgu niyetini karşılamıyordu. Yeni sürüm
  // 155 sınırının altında, tek cümlede ne yaptığımızı söylüyor ve numara
  // görünür kalıyor (hedef tıklama değil, telefonun çalması).
  // "700'den fazla site" övünmesi Özgün kararıyla ÇIKARILDI (15.08): ispatı
  // istenebilecek üstünlük iddiaları açıklamalarda kullanılmaz.
  // Açılış "Eryaman" — baş sorgunun yalın biçimi (kişiselleştirmesiz ölçüm).
  description:
    "Eryaman'da evinizi satarken ya da kiraya verirken karşınıza doğru alıcıyı, doğru kiracıyı biz çıkarırız: 0532 363 96 60",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.siringayrimenkul.com",
  // Taşınmaz Ticareti Yetki Belgesi — meta description güven öğesi ve görünür
  // künyelerde tek kaynak (footer/yazar kartındaki eski hardcode'larla aynı no).
  yetkiBelgeNo: "0603771",
  phoneDisplay: process.env.NEXT_PUBLIC_PHONE_DISPLAY ?? "0532 363 96 60",
  phoneTel: process.env.NEXT_PUBLIC_PHONE_TEL ?? "+905323639660",
  whatsappUrl: process.env.NEXT_PUBLIC_WHATSAPP_URL ?? "https://wa.me/905323639660",
  // MAĞAZA KÖKÜ, alt sekme değil (2026-08-08). Emsal ölçümünde ("batıkent
  // emlakçı", "sincan emlakçı") organik 1. sıraya çıkan sayfa mağazanın kökü;
  // /one-cikanlar alt sekmesi arama sonuçlarında görünmüyor. Sitedeki ~1000
  // sayfadan çıkan mağaza linkinin tamamı buradan besleniyor.
  // ALT ALAN ADI DEĞİŞTİRİLMEYECEK: eryamanemlakcisiringayrimenkul zaten buraya
  // yönleniyor ve Google'da 0 indeksli sayfası var; adres değişimi "eryaman
  // 3./4./5. etap emlakçı" sorgularındaki üç organik 1. sırayı riske atar.
  //
  // ENV OKUMASI KALDIRILDI (2026-08-08): bu değer NEXT_PUBLIC_SAHIBINDEN_URL
  // ile ezilebiliyordu ve Vercel'deki değişken bayat kalmıştı — kod varsayılanı
  // mağaza köküne çevrildikten sonra yayın yapıldı, canlıda link YİNE
  // /one-cikanlar çıktı (doğrulandı). Ortama göre değişmesi gereken bir değer
  // değil; tek kaynak burası. Vercel'deki değişken artık işlevsiz, silinebilir.
  sahibindenUrl: "https://eryamansiringayrimenkul.sahibinden.com/",
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
  // Slug'sız (yalnız oid) biçim bilerek kullanılıyor: Yandex, işletme adı
  // değişince slug'ı da yeniden üretiyor (ad "Eryaman Emlakçı Şirin Gayrimenkul"
  // olunca slug "eryaman_emlakci_sirin_gayrimenkul" olacak). oid sabit kaldığı
  // için bu adres ad değişikliklerinden etkilenmez — 08.08'de canlı doğrulandı.
  yandexMapsUrl: "https://yandex.com.tr/maps/org/40827902036/",
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
