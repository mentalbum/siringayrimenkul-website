// pws=0 karne analizi: sonuclar.jsonl + sorgular.json → mahalle bazlı rapor
// Kullanım: node karne.mjs [--ozet] [--sorun] [--fark] [--rakip]
import { readFileSync } from "node:fs";

const DIR = new URL(".", import.meta.url).pathname;
const sorgular = JSON.parse(readFileSync(DIR + "sorgular.json", "utf8"));
const satirlar = readFileSync(DIR + "sonuclar.jsonl", "utf8")
  .split("\n").filter(Boolean).map((l) => JSON.parse(l));

// slug → sorgu meta
const meta = new Map(sorgular.map((x) => [x.s, x]));
// aynı slug birden çok ölçüldüyse SONUNCUSU geçerli
const son = new Map();
for (const r of satirlar) son.set(r.s, r);

const kategoriler = {
  birinci: [],        // sira 1, doğru sayfa
  birinciYanlis: [],  // sira 1 ama beklenen site sayfası değil (ada/anasayfa/mahalle)
  ilkUc: [],          // 2-3
  ilkSayfa: [],       // 4-10
  ikinciSayfa: [],    // 11-20
  yok: [],            // ilk 20'de yok
};

function beklenenYol(s) {
  const m = meta.get(s.s);
  if (!m) return null;
  if (m.m === "__mahalle__") return `/mahalleler/${s.s}`;
  return `/mahalleler/${m.m}/${s.s}`;
}

for (const r of son.values()) {
  const m = meta.get(r.s) || {};
  const kayit = { ...r, q: m.q, mah: m.m };
  if (r.sira === 1) {
    const b = beklenenYol(r);
    const dogru = r.u === b || (r.u && b && r.u.replace(/\/$/, "") === b);
    (dogru ? kategoriler.birinci : kategoriler.birinciYanlis).push(kayit);
  } else if (r.sira >= 2 && r.sira <= 3) kategoriler.ilkUc.push(kayit);
  else if (r.sira >= 4 && r.sira <= 10) kategoriler.ilkSayfa.push(kayit);
  else if (r.sira >= 11) kategoriler.ikinciSayfa.push(kayit);
  else kategoriler.yok.push(kayit);
}

const toplam = son.size;
const b1 = kategoriler.birinci.length + kategoriler.birinciYanlis.length;
console.log(`ÖLÇÜLEN: ${toplam}/${sorgular.length}`);
console.log(`1. sıra: ${b1} (%${((100 * b1) / toplam).toFixed(1)}) — doğru sayfa ${kategoriler.birinci.length}, yanlış sayfa ${kategoriler.birinciYanlis.length}`);
console.log(`2-3: ${kategoriler.ilkUc.length} | 4-10: ${kategoriler.ilkSayfa.length} | 11-20: ${kategoriler.ikinciSayfa.length} | yok: ${kategoriler.yok.length}`);

// mahalle bazlı özet
const perMah = new Map();
for (const r of son.values()) {
  const m = meta.get(r.s) || {};
  const key = m.m === "__mahalle__" ? "(mahalle sorguları)" : m.m || "?";
  if (!perMah.has(key)) perMah.set(key, { n: 0, b1: 0 });
  const p = perMah.get(key);
  p.n++;
  if (r.sira === 1) p.b1++;
}
console.log("\nMAHALLE BAZLI (1./ölçülen):");
for (const [k, v] of [...perMah].sort((a, b) => b[1].n - a[1].n))
  console.log(`  ${k}: ${v.b1}/${v.n}`);

if (!process.argv.includes("--ozet")) {
  const yaz = (ad, dizi, alan) => {
    if (!dizi.length) return;
    console.log(`\n${ad}:`);
    for (const r of dizi.sort((a, b) => (a.sira || 99) - (b.sira || 99)))
      console.log(`  [${r.sira || "-"}] ${r.q} → ${r.u || "ÇIKMIYOR"}${alan && r.on?.length ? " | önde: " + r.on.join(",") : ""}`);
  };
  yaz("1. AMA YANLIŞ SAYFA", kategoriler.birinciYanlis, false);
  yaz("2-3. SIRA", kategoriler.ilkUc, true);
  yaz("4-10. SIRA", kategoriler.ilkSayfa, true);
  yaz("11-20. SIRA", kategoriler.ikinciSayfa, true);
  yaz("İLK 20'DE YOK", kategoriler.yok, false);
}

// ---- SORUN TİPİ ANALİZİ (revizyon fazı için) ----
if (process.argv.includes("--sorun")) {
  const tipler = { ESKI_URL: [], ADA_GOLGE: [], ANASAYFA_GOLGE: [], MAHALLE_GOLGE: [], BASKA_SITE: [], YOK: [], TEMIZ_AMA_GERIDE: [] };
  for (const r of son.values()) {
    const m = meta.get(r.s);
    if (!m || m.m === "__mahalle__") continue;
    const b = `/mahalleler/${m.m}/${r.s}`;
    const kayit = { s: r.s, q: m.q, sira: r.sira, u: r.u, on: r.on };
    if (!r.sira) { tipler.YOK.push(kayit); continue; }
    if (r.u === b) { if (r.sira > 1) tipler.TEMIZ_AMA_GERIDE.push(kayit); continue; }
    if (r.u === "/") tipler.ANASAYFA_GOLGE.push(kayit);
    else if (r.u && r.u.includes("/adalar/")) tipler.ADA_GOLGE.push(kayit);
    else if (r.u === `/mahalleler/${m.m}`) tipler.MAHALLE_GOLGE.push(kayit);
    else if (r.u && !r.u.includes("-mahallesi/")) tipler.ESKI_URL.push(kayit);
    else tipler.BASKA_SITE.push(kayit);
  }
  console.log("\nSORUN TİPLERİ (site sorguları):");
  for (const [t, arr] of Object.entries(tipler)) {
    console.log(`\n${t}: ${arr.length}`);
    for (const k of arr.slice(0, 8)) console.log(`  [${k.sira || "-"}] ${k.q} → ${k.u || "-"}`);
    if (arr.length > 8) console.log(`  ... +${arr.length - 8}`);
  }
  const toplam2 = Object.values(tipler).reduce((a, x) => a + x.length, 0);
  console.log(`\nAÇIKLAMA: ESKI_URL/ADA/ANASAYFA/MAHALLE gölgelemeleri Google yeniden tarayınca büyük ölçüde kendiliğinden düzelir (kanonik/yönlendirme hazır). YOK + TEMIZ_AMA_GERIDE içerik/otorite işidir. Toplam sorunlu: ${toplam2}`);
}

// ---- FARK: 1 Ağustos baseline'ına göre geçiş matrisi ----
// baseline-map.json: slug → "1"|"2"|"3"|"4-10"|"yok"|null (sira-karnesi.md 1 Ağu bölümünden)
if (process.argv.includes("--fark")) {
  const baseline = JSON.parse(readFileSync(DIR + "baseline-map.json", "utf8"));
  const kat = (r) => r.sira === 1 ? "1" : r.sira === 2 ? "2" : r.sira === 3 ? "3"
    : r.sira >= 4 && r.sira <= 10 ? "4-10" : r.sira >= 11 ? "11-20" : "yok";
  const SIRA = { "1": 0, "2": 1, "3": 2, "4-10": 3, "11-20": 4, "yok": 5 };
  const matris = new Map();
  const dusen = [], cikan = [];
  for (const r of son.values()) {
    const m = meta.get(r.s);
    if (!m || m.m === "__mahalle__") continue;
    const b = baseline[r.s] ?? "?";
    const y = kat(r);
    const k = `${b} -> ${y}`;
    matris.set(k, (matris.get(k) || 0) + 1);
    if (b !== "?" && b !== null && SIRA[y] > SIRA[b]) dusen.push({ s: r.s, q: m.q, b, y });
    if (b !== "?" && b !== null && SIRA[y] < SIRA[b]) cikan.push({ s: r.s, q: m.q, b, y });
  }
  console.log("\nFARK MATRİSİ (1 Ağu → şimdi, site sorguları):");
  for (const [k, n] of [...matris].sort((a, b2) => b2[1] - a[1])) console.log(`  ${k}: ${n}`);
  console.log(`\nYÜKSELEN (${cikan.length}):`);
  for (const x of cikan) console.log(`  ${x.q}: ${x.b} → ${x.y}`);
  console.log(`\nGERİLEYEN (${dusen.length}):`);
  for (const x of dusen) console.log(`  ${x.q}: ${x.b} → ${x.y}`);
  console.log("\nNOT: 1 Ağu ölçümü ilk 20'ye bakıyordu, bugünkü tarama ilk ~10'u görüyor (num paramı ölü) — 'yok'a düşüşlerin bir kısmı payda farkı.");
}

// ---- RAKİP PANELİ: 'on' alanından önümüzdeki alan adları ----
if (process.argv.includes("--rakip")) {
  const PORTALLAR = new Set(["sahibinden.com", "hepsiemlak.com", "emlakjet.com", "remax.com.tr", "endeksa.com", "zingat.com", "instagram.com", "facebook.com", "youtube.com"]);
  const sayac = new Map();
  let portalDuvari = 0, olculen = 0;
  for (const r of son.values()) {
    if (!r.on?.length) continue;
    olculen++;
    let hepsiPortal = true;
    for (const d of r.on) {
      sayac.set(d, (sayac.get(d) || 0) + 1);
      if (!PORTALLAR.has(d)) hepsiPortal = false;
    }
    if (hepsiPortal) portalDuvari++;
  }
  console.log(`\nRAKİP PANELİ (önümüzde çıkan ilk 2 alan adı; ${olculen} sorguda veri var):`);
  console.log(`Portal duvarı (önümüzde SADECE portal/sosyal): ${portalDuvari}/${olculen}`);
  console.log("\nAlan adı bazında (portal olmayanlar GERÇEK yerel rakip):");
  for (const [d, n] of [...sayac].sort((a, b) => b[1] - a[1]).slice(0, 25))
    console.log(`  ${PORTALLAR.has(d) ? "  [portal]" : "▶ RAKİP  "} ${d}: ${n}`);
}
