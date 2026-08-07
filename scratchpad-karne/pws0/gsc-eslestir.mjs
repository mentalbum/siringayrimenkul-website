// GSC 28 günlük sorgu tablosunu (1000 satır) 720 site kaydıyla eşleştirir.
// Çıktı: gsc-karne.json + konsol özeti
import { readFileSync, writeFileSync } from "node:fs";
const D = new URL(".", import.meta.url).pathname;

const tr = (s) => s.toLocaleLowerCase("tr-TR").replace(/\s+/g, " ").trim();

// 1) İki parçayı ayrıştır
const kayitlar = [];
const bas = readFileSync(D + "gsc-bas.txt", "utf8");
for (const m of bas.matchAll(/(.+?)\s(\d+)\s(\d+)\s(\d+,\d+)(?=\s|$)/g))
  kayitlar.push({ q: tr(m[1]), t: +m[2], g: +m[3], p: +m[4].replace(",", ".") });
const kuyruk = readFileSync(D + "gsc-kuyruk.txt", "utf8");
for (const m of kuyruk.matchAll(/([^~]+?)~(\d+)~(\d+)~(\d+,\d+)(?=\s|$)/g))
  kayitlar.push({ q: tr(m[1]), t: +m[2], g: +m[3], p: +m[4].replace(",", ".") });

const gsc = [...new Map(kayitlar.map((k) => [k.q, k])).values()];
console.log("ayrıştırılan GSC satırı:", kayitlar.length, "| benzersiz:", gsc.length);

// 2) Site adlarından eşleştirme anahtarları
const sorgular = JSON.parse(readFileSync(D + "sorgular.json", "utf8"));
const GENEL = new Set(["sitesi", "siteleri", "blokları", "evleri", "konutları", "rezidans", "residence", "apartmanı", "apartmanları"]);
const siteler = sorgular
  .filter((x) => x.m !== "__mahalle__")
  .map((x) => {
    const core = tr(x.q.replace(/ emlakçı$/i, ""));
    const kelimeler = core.split(" ");
    const varyantlar = new Set([core]);
    // Kısaltılmış varyant en az 2 kelime olmalı: "eryaman evleri"→"eryaman"
    // gibi tek kelimelik kısaltmalar alakasız her sorguyu yutuyor.
    if (kelimeler.length >= 3 && GENEL.has(kelimeler[kelimeler.length - 1])) {
      varyantlar.add(kelimeler.slice(0, -1).join(" "));
    }
    return { ...x, core, varyantlar: [...varyantlar] };
  });

// 3) Eşleştir (kelime sınırlı içerme)
const icerir = (hay, needle) => (" " + hay + " ").includes(" " + needle + " ");
const karne = {};
for (const s of siteler) karne[s.s] = { q: s.q, m: s.m, satir: [], gosterim: 0, tiklama: 0 };
const eslesmeyenGsc = [];
for (const g of gsc) {
  let eslesti = false;
  for (const s of siteler) {
    if (s.varyantlar.some((v) => icerir(g.q, v))) {
      karne[s.s].satir.push(g);
      karne[s.s].gosterim += g.g;
      karne[s.s].tiklama += g.t;
      eslesti = true;
    }
  }
  if (!eslesti) eslesmeyenGsc.push(g);
}

// 4) Özet metrikler
let varOlan = 0, top1 = 0, top3 = 0, ilkSayfa = 0, arka = 0;
const izsiz = [];
for (const [slug, k] of Object.entries(karne)) {
  if (!k.satir.length) { izsiz.push(slug); continue; }
  varOlan++;
  const agirlikli = k.satir.reduce((a, r) => a + r.p * r.g, 0) / Math.max(1, k.gosterim);
  const enIyi = Math.min(...k.satir.map((r) => r.p));
  k.ortPoz = +agirlikli.toFixed(1);
  k.enIyiPoz = enIyi;
  if (agirlikli <= 1.5) top1++;
  else if (agirlikli <= 3.5) top3++;
  else if (agirlikli <= 10.5) ilkSayfa++;
  else arka++;
}
console.log(`GSC izi olan site: ${varOlan}/720 | izi olmayan: ${izsiz.length}`);
console.log(`ağırlıklı ort. konum ≤1,5: ${top1} | 1,5-3,5: ${top3} | ilk sayfa (≤10,5): ${ilkSayfa} | arka: ${arka}`);

// En çok gösterim alan 25 site (öncelik listesi)
const sirali = Object.entries(karne).filter(([, k]) => k.satir.length)
  .sort((a, b) => b[1].gosterim - a[1].gosterim);
console.log("\nEN ÇOK ARANAN 25 SİTE (28 gün, gösterim | tıklama | ort.poz):");
for (const [slug, k] of sirali.slice(0, 25))
  console.log(`  ${slug}: ${k.gosterim} | ${k.tiklama} | ${k.ortPoz}`);

// GSC'de izi olup pozisyonu kötü olanlar (gösterim ≥ 30, ort poz ≥ 8) — zenginleştirme hedefi
console.log("\nÇOK ARANIP GERİDE OLANLAR (gösterim≥30, ort.poz≥8):");
for (const [slug, k] of sirali.filter(([, k]) => k.gosterim >= 30 && k.ortPoz >= 8))
  console.log(`  ${slug}: ${k.gosterim} gösterim, ort ${k.ortPoz}, en iyi ${k.enIyiPoz}`);

writeFileSync(D + "gsc-karne.json", JSON.stringify({ gsc, karne, izsiz, eslesmeyenGsc }, null, 1));
console.log("\nizsiz ilk 40:", izsiz.slice(0, 40).join(", "));
console.log("\ngsc-karne.json yazıldı");
