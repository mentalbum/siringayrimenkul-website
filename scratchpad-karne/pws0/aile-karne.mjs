#!/usr/bin/env node
/**
 * Sorgu ailesi karnesi — "100 arayandan kaçı bizi buluyor?" sorusunun ölçümü.
 *
 * GSC API'den son N günün sorgu verisini çeker, aileler hâlinde toplar,
 * tabloyu basar ve tarihli anlık görüntüyü aile-karne-gecmis.jsonl'a ekler.
 * Böylece her çalıştırışta önceki ölçümle kıyas görürsün (trend).
 *
 * Aileler:
 *   eryaman-emlakci : "eryaman" + emlak/gayrimenkul geçen sorgular (tavana yakınız)
 *   mahalle-emlakci : mahalle/ilçe adı + emlak (asıl büyüme alanı 1)
 *   yalin-emlakci   : sadece "emlakçı/emlak" (harita kutusu savaşı — GBP işi)
 *   marka           : şirin gayrimenkul vb.
 *   etap            : "... etap" sorguları
 *   site-adi-diger  : dev havuz; site adları (asıl büyüme alanı 2)
 *
 * Kullanım: node aile-karne.mjs [gün=28]
 */
import { execFileSync } from "node:child_process";
import { appendFileSync, existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const KOK = dirname(fileURLToPath(import.meta.url));
const API = join(KOK, "..", "..", "scripts", "gsc-api.mjs");
const GECMIS = join(KOK, "aile-karne-gecmis.jsonl");
const GUN = parseInt(process.argv[2] || "28", 10);

const lo = (s) => s.toLowerCase().replace(/ı/g, "i").replace(/İ/g, "i").replace(/ş/g, "s").replace(/ç/g, "c").replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ö/g, "o");
const MAH = ["tunahan", "guzelkent", "devlet", "goksu", "seyh samil", "yavuz selim", "altay", "seker", "yesilova", "osman avci", "ata mah", "susuz", "cumhuriyet", "yeni bati", "etimesgut", "elvankent", "baglica", "sincan", "ankara", "fatih mah"];

function aile(qRaw) {
  const q = lo(qRaw);
  const emlakli = q.includes("emlak") || q.includes("gayrimenkul");
  if (q.includes("sirin") && (emlakli || q.includes("sirin gayrimenkul"))) return "marka";
  if (emlakli && q.includes("eryaman")) return "eryaman-emlakci";
  if (emlakli && ["emlakci", "emlak", "gayrimenkul", "emlakcilar"].includes(q.trim())) return "yalin-emlakci";
  if (emlakli && MAH.some((m) => q.includes(m))) return "mahalle-emlakci";
  if (emlakli) return "mahalle-emlakci"; // emlak temalı ama adressiz → aynı büyüme ailesi
  if (/\betap\b/.test(q)) return "etap";
  return "site-adi-diger";
}

const ham = execFileSync("node", [API, "sorgular", String(GUN)], { encoding: "utf8" });
const A = {};
let toplamG = 0, toplamT = 0;
for (const satir of ham.trim().split("\n")) {
  const [g, t, p, ...qq] = satir.split("\t");
  if (!qq.length) continue;
  const q = qq.join("\t");
  const k = aile(q);
  A[k] ??= { sorgu: 0, tik: 0, gost: 0, pozAgirlik: 0 };
  A[k].sorgu++; A[k].tik += +t; A[k].gost += +g; A[k].pozAgirlik += +p * +g;
  toplamG += +g; toplamT += +t;
}

const SIRA = ["eryaman-emlakci", "mahalle-emlakci", "yalin-emlakci", "marka", "etap", "site-adi-diger"];
const bugun = new Date().toISOString().slice(0, 10);
console.log(`\nSorgu ailesi karnesi — son ${GUN} gün (${bugun})\n`);
console.log("aile".padEnd(18) + "sorgu".padStart(7) + "tık".padStart(7) + "göst".padStart(9) + "TO%".padStart(7) + "poz".padStart(7));
const anlik = { tarih: bugun, gun: GUN, aileler: {} };
for (const k of SIRA) {
  const v = A[k]; if (!v) continue;
  const to = (100 * v.tik) / Math.max(v.gost, 1);
  const poz = v.pozAgirlik / Math.max(v.gost, 1);
  anlik.aileler[k] = { sorgu: v.sorgu, tik: v.tik, gost: v.gost, to: +to.toFixed(2), poz: +poz.toFixed(1) };
  console.log(k.padEnd(18) + String(v.sorgu).padStart(7) + String(v.tik).padStart(7) + String(v.gost).padStart(9) + to.toFixed(1).padStart(7) + poz.toFixed(1).padStart(7));
}
console.log("-".repeat(55));
console.log("TOPLAM".padEnd(18) + "".padStart(7) + String(toplamT).padStart(7) + String(toplamG).padStart(9) + ((100 * toplamT) / Math.max(toplamG, 1)).toFixed(1).padStart(7));

// önceki ölçümle kıyas
if (existsSync(GECMIS)) {
  const onceki = readFileSync(GECMIS, "utf8").trim().split("\n").map((x) => JSON.parse(x)).filter((x) => x.gun === GUN).at(-1);
  if (onceki) {
    console.log(`\nKıyas (${onceki.tarih} → ${bugun}):`);
    for (const k of SIRA) {
      const a = onceki.aileler[k], b = anlik.aileler[k];
      if (!a || !b) continue;
      console.log(`  ${k.padEnd(18)} tık ${a.tik}→${b.tik}  göst ${a.gost}→${b.gost}  poz ${a.poz}→${b.poz}`);
    }
  }
}
appendFileSync(GECMIS, JSON.stringify(anlik) + "\n");
console.log(`\nAnlık görüntü kaydedildi: aile-karne-gecmis.jsonl (trend için düzenli çalıştır).`);
