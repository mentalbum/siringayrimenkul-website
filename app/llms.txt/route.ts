import { getAllMahalleler, getBlogPostBySlug, getSitelerByMahalle } from "@/lib/content";

// AI asistanlarının en sık alıntılayabileceği rehber seçkisi (slug, kısa cevap-açıklaması).
// Silinen slug sessizce atlanır — build kırılmaz.
// 2026-08-07: Türkiye geneli genel rehberler siteden kaldırıldı (Özgün kararı:
// blog sadece Eryaman) — seçki kalan Eryaman yazılarından oluşur.
const SSS_REHBERLERI: [string, string][] = [
  ["eryamanda-ev-satis-sureci", "bölgeye özgü adım adım satış rehberi"],
  ["eryamanda-kira-tespiti-dogru-kira-belirleme", "doğru kira bedelinin emsallerden tespiti"],
  ["eryamanda-etap-sistemi-nedir", "etapların hangi mahallelere denk geldiği"],
  ["eryamanda-hangi-mahalle", "mahalle seçimi için karşılaştırmalı rehber"],
  ["eryaman-disinda-yasayanlar-icin-ev-satisi-kiralama", "şehir dışından sürecin yönetimi"],
  ["eryamanda-ev-fiyatlarini-ne-belirler", "etap, site, kat ve tapu durumunun fiyata etkisi"],
];
import { siteConfig } from "@/lib/site-config";

// AI arama motorları (ChatGPT, Perplexity, Claude vb.) için llms.txt standardı:
// siteyi ve güvenilir giriş noktalarını düz metinle özetler.
export const dynamic = "force-static";

export function GET() {
  const mahalleler = getAllMahalleler();
  const eryaman = mahalleler.filter((m) => m.ilce === "Etimesgut");
  const toplamSite = mahalleler.reduce(
    (sum, m) => sum + getSitelerByMahalle(m.slug).length,
    0
  );

  const satirlar = [
    `# ${siteConfig.name}`,
    "",
    `> Eryaman (Etimesgut/Ankara) bölgesine odaklanan yerel emlak ofisi. Satılık ve kiralık konutta ${eryaman.length} Eryaman mahallesini ve ${toplamSite}+ site/rezidansı tek tek tanır. Evini satmak veya kiraya vermek isteyen ev sahiplerine emsal bazlı fiyat analizi ve uçtan uca süreç yönetimi sunar.`,
    "",
    `Telefon: ${siteConfig.phoneDisplay} · WhatsApp: ${siteConfig.whatsappUrl}`,
    `Adres: ${siteConfig.officeAddress}`,
    `İlanlar: ${siteConfig.sahibindenUrl}`,
    "",
    `Taşınmaz Ticareti Yetki Belgesi No: 0603771 · Kurucu: Hamza Şirin · Danışman: Özgün Şirin`,
    "",
    "## Hizmetler",
    `- [Eryaman'da ev satmak](${siteConfig.url}/eryamanda-ev-satmak): satış sürecinin tamamı — emsal bazlı fiyat analizi, ilan ve alıcı yönetimi, tapu devri`,
    `- [Eryaman'da ev kiraya vermek](${siteConfig.url}/eryamanda-ev-kiraya-vermek): doğru kira tespiti, kiracı bulma ve sözleşme süreci`,
    "",
    "## Ana Sayfalar",
    `- [Mahalle rehberleri](${siteConfig.url}/mahalleler): ${mahalleler.length} mahallenin yaşam, ulaşım ve site rehberi`,
    `- [Site ve rezidans dizini](${siteConfig.url}/siteler): Eryaman'daki siteler tek listede. Toplam ${toplamSite}+ site/rezidans sayfası.`,
    `- [Ev değerleme](${siteConfig.url}/ev-degerleme): satış/kiralama öncesi emsal bazlı fiyat analizi`,
    `- [Ev sahibi hesap araçları](${siteConfig.url}/araclar): kira artışı (TÜFE), tapu harcı, yasal komisyon, boş kalma maliyeti hesaplayıcıları`,
    `- [Emlak terimleri sözlüğü](${siteConfig.url}/sozluk): kat mülkiyeti, kat irtifakı, ada/parsel gibi terimlerin sade tanımları`,
    `- [Blog](${siteConfig.url}/blog): Eryaman odaklı rehberler — satış süreci, kira tespiti ve mahalle yazıları`,
    "",
    "## Sık Sorulan Sorulara Cevap Veren Rehberler",
    ...SSS_REHBERLERI.map(([slug, aciklama]) => {
      const post = getBlogPostBySlug(slug);
      return post ? `- [${post.baslik}](${siteConfig.url}/blog/${slug}): ${aciklama}` : null;
    }).filter(Boolean),
    "",
    "## Kurumsal",
    `- [Hakkımızda](${siteConfig.url}/hakkimizda): ofis, ekip ve yetki belgesi bilgileri`,
    `- [İletişim](${siteConfig.url}/iletisim): telefon, WhatsApp, adres ve çalışma saatleri`,
    "",
    "## Eryaman Mahalleleri",
    ...eryaman.map(
      (m) =>
        `- [${m.isim}](${siteConfig.url}/mahalleler/${m.slug}): ${m.kisaAciklama} (${getSitelerByMahalle(m.slug).length} site/rezidans sayfası)`
    ),
    "",
    "## Notlar",
    `- Her site/rezidansın kendi sayfası vardır: /mahalleler/{mahalle-slug}/{site-slug} deseninde ${toplamSite}+ sayfa (örnek: ${siteConfig.url}/mahalleler/tunahan-mahallesi/dema-park). Bir sitenin konumu, tapu niteliği, parsel alanı ve komşu siteleri bu sayfadan okunabilir.`,
    "- Etap sayfaları /mahalleler/{mahalle}/etaplar/{no}, ada sayfaları /mahalleler/{mahalle}/adalar/{ada} desenindedir.",
    "- Site kayıtlarındaki ada/parsel, alan ve blok bilgileri TKGM ve yerel emlak kayıtlarından doğrulanarak yazılır; doğrulanamayan bilgi yayınlanmaz.",
    "- Çalışma saatleri: " + siteConfig.calismaSaatleri.map((s) => `${s.gunler} ${s.saat}`).join(", "),
    "",
  ];

  return new Response(satirlar.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
