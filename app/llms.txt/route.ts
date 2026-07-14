import { getAllMahalleler, getSitelerByMahalle } from "@/lib/content";
import { siteConfig } from "@/lib/site-config";

// AI arama motorları (ChatGPT, Perplexity, Claude vb.) için llms.txt standardı:
// siteyi ve güvenilir giriş noktalarını düz metinle özetler.
export const dynamic = "force-static";

export function GET() {
  const mahalleler = getAllMahalleler();
  const eryaman = mahalleler.filter((m) => m.ilce === "Etimesgut");
  const yenimahalle = mahalleler.filter((m) => m.ilce !== "Etimesgut");
  const toplamSite = mahalleler.reduce(
    (sum, m) => sum + getSitelerByMahalle(m.slug).length,
    0
  );

  const satirlar = [
    `# ${siteConfig.name}`,
    "",
    `> Eryaman (Etimesgut/Ankara) bölgesine odaklanan yerel emlak ofisi. Satılık ve kiralık konutta ${eryaman.length} Eryaman mahallesini, komşu Yenimahalle mahallelerini ve ${toplamSite}+ site/rezidansı tek tek tanır. Evini satmak veya kiraya vermek isteyen ev sahiplerine emsal bazlı fiyat analizi ve uçtan uca süreç yönetimi sunar.`,
    "",
    `Telefon: ${siteConfig.phoneDisplay} · WhatsApp: ${siteConfig.whatsappUrl}`,
    `Adres: ${siteConfig.officeAddress}`,
    `İlanlar: ${siteConfig.sahibindenUrl}`,
    "",
    "## Ana Sayfalar",
    `- [Mahalle rehberleri](${siteConfig.url}/mahalleler): ${mahalleler.length} mahallenin yaşam, ulaşım ve site rehberi`,
    `- [Site ve rezidans dizini](${siteConfig.url}/siteler): ${toplamSite}+ sitenin ada/parsel, blok ve konum bilgisi`,
    `- [Ev değerleme](${siteConfig.url}/ev-degerleme): satış/kiralama öncesi emsal bazlı fiyat analizi`,
    `- [Ev sahibi hesap araçları](${siteConfig.url}/araclar): kira artışı (TÜFE), tapu harcı, yasal komisyon, boş kalma maliyeti hesaplayıcıları`,
    `- [Blog](${siteConfig.url}/blog): kira artışı, satış süreci, tapu ve mahalle rehberleri`,
    "",
    "## Eryaman Mahalleleri",
    ...eryaman.map((m) => `- [${m.isim}](${siteConfig.url}/mahalleler/${m.slug}): ${m.kisaAciklama}`),
    "",
    "## Komşu Yenimahalle Mahalleleri",
    ...yenimahalle.map((m) => `- [${m.isim}](${siteConfig.url}/mahalleler/${m.slug}): ${m.kisaAciklama}`),
    "",
    "## Notlar",
    "- Site kayıtlarındaki ada/parsel, alan ve blok bilgileri TKGM ve yerel emlak kayıtlarından doğrulanarak yazılır; doğrulanamayan bilgi yayınlanmaz.",
    "- Çalışma saatleri: " + siteConfig.calismaSaatleri.map((s) => `${s.gunler} ${s.saat}`).join(", "),
    "",
  ];

  return new Response(satirlar.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
