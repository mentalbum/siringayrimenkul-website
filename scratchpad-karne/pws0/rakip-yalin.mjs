// Yalın ad taramasının RAKİP analizi.
// Girdi: sonuclar-yalin.jsonl (alanlar: s, q, sira, u, on[ilk 5 alan adı], n)
// Kullanım: node rakip-yalin.mjs [--tam]
//
// Neden ayrı araç: karne.mjs "<site adı> emlakçı" kuyruğu için yazıldı ve
// mahalle/slug eşlemesine dayanıyor. Yalın ad kuyruğunda mahalle yok, buna
// karşılık `on` alanı 2 değil 5 alan adı taşıyor — bu taramanın ürünü sıra
// değil RAKİP SETİ (gerekçe: 2026-08-08 GSC karnesi, yalın ad = hacmin %64'ü).
import { readFileSync, existsSync } from "node:fs";

const DIR = new URL(".", import.meta.url).pathname;
const DOSYA = DIR + "sonuclar-yalin.jsonl";
if (!existsSync(DOSYA)) {
  console.log("sonuclar-yalin.jsonl yok — tarama henüz koşmadı.");
  process.exit(0);
}

const satirlar = readFileSync(DOSYA, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
// Aynı sorgu birden çok ölçüldüyse SONUNCUSU geçerli.
const son = new Map();
for (const r of satirlar) son.set(r.s, r);
const kayitlar = [...son.values()];

// Portal/sosyal = sorgu sınıfının doğası, tek tek geçilmez.
// Gerçek yerel rakip = bunların dışındakiler; asıl hedef listesi odur.
const PORTAL = new Set([
  "sahibinden.com", "hepsiemlak.com", "emlakjet.com", "remax.com.tr", "zingat.com",
  "endeksa.com", "emlakgo.net", "trovit.com.tr", "daire.trovit.com.tr", "evdegerlendir.com",
  "instagram.com", "facebook.com", "youtube.com", "tr.foursquare.com", "foursquare.com",
  "yandex.com.tr", "wikimapia.org", "moovitapp.com", "mahalleportal.com", "cb.com.tr",
]);
const portalMi = (d) => PORTAL.has(d) || d.endsWith(".sahibinden.com");

const kat = (r) =>
  r.sira === 1 ? "1" : r.sira === 2 ? "2" : r.sira === 3 ? "3"
  : r.sira >= 4 && r.sira <= 10 ? "4-10" : r.sira > 10 ? "11+" : "yok";

const dagilim = {};
for (const r of kayitlar) dagilim[kat(r)] = (dagilim[kat(r)] || 0) + 1;

console.log(`ÖLÇÜLEN: ${kayitlar.length}/147 (yalın ad kuyruğu)`);
console.log("SIRA DAĞILIMI:", JSON.stringify(dagilim));
const ilk3 = kayitlar.filter((r) => r.sira >= 1 && r.sira <= 3).length;
console.log(`İlk 3'te: ${ilk3} (%${((100 * ilk3) / kayitlar.length).toFixed(0)})`);

// --- Rakip sayımı: her sorguda önümüzdeki alan adları ---
const sayac = new Map();
let duvar = 0;
for (const r of kayitlar) {
  if (!r.on?.length) continue;
  if (r.on.every(portalMi)) duvar++;
  for (const d of new Set(r.on)) sayac.set(d, (sayac.get(d) || 0) + 1);
}
console.log(`\nPortal duvarı (önümüzde SADECE portal/sosyal): ${duvar}/${kayitlar.length}`);

const sirali = [...sayac].sort((a, b) => b[1] - a[1]);
console.log("\n▶ GERÇEK YEREL RAKİPLER (portal olmayan, önümüzde çıkma sayısı):");
for (const [d, n] of sirali.filter(([d]) => !portalMi(d)).slice(0, 20)) {
  console.log(`  ${n.toString().padStart(3)} × ${d}`);
}
console.log("\n  [portal/sosyal — bilgi için]");
for (const [d, n] of sirali.filter(([d]) => portalMi(d)).slice(0, 8)) {
  console.log(`  ${n.toString().padStart(3)} × ${d}`);
}

if (process.argv.includes("--tam")) {
  console.log("\nSORGU BAZINDA:");
  for (const r of kayitlar.sort((a, b) => (a.sira || 99) - (b.sira || 99))) {
    console.log(`  [${r.sira || "-"}] ${r.q} → ${r.u || "ÇIKMIYOR"} | önde: ${r.on?.join(", ") || "-"}`);
  }
}
