#!/usr/bin/env node
/**
 * Dizin kuyruğunu GSC API ile denetler ve işaretleri uygular.
 *
 * Ne yapar: gsc-dizin-kuyrugu-194.md içindeki İŞARETSİZ (- [ ]) satırları alır,
 * her birini URL denetiminden geçirir (scripts/gsc-api.mjs), sonuca göre:
 *   DİZİNDE  → `- [x] URL ← GG.AA DİZİNDE (kendiliğinden)`
 *   DIŞARIDA → `- [ ] URL ← GG.AA dizin dışı teyit` (istek sırası korunur)
 * ve DIZINE-EKLENECEKLER.md dosyasını yeniden üretir.
 *
 * Kullanım:
 *   node kuyruk-denetle.mjs                # işaretsizleri API'den denetle + uygula
 *   node kuyruk-denetle.mjs --tsv X.tsv    # hazır TSV'den uygula (yeniden sormaz)
 *   node kuyruk-denetle.mjs --hepsi        # işaretlileri de yeniden denetle (tam tarama)
 *
 * NOT: Dizine ekleme İSTEĞİ göndermez — o iş GSC UI'den elle/Claude'la yürür
 * (gsc-dizin becerisine bak). Bu betik yalnız durum tespiti + defter düzeni.
 */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const KOK = dirname(fileURLToPath(import.meta.url));
const DEPO = join(KOK, "..", "..");
const KUYRUK = join(KOK, "gsc-dizin-kuyrugu-194.md");
const CIKTI = join(KOK, "DIZINE-EKLENECEKLER.md");
const API = join(DEPO, "scripts", "gsc-api.mjs");

const arg = process.argv.slice(2);
const tsvArg = arg.includes("--tsv") ? arg[arg.indexOf("--tsv") + 1] : null;
const hepsi = arg.includes("--hepsi");

const gun = new Date();
const DAMGA = `${String(gun.getDate()).padStart(2, "0")}.${String(gun.getMonth() + 1).padStart(2, "0")}`;

let metin = readFileSync(KUYRUK, "utf8");
const satirlar = metin.split("\n");
const hedefler = [];
for (const s of satirlar) {
  const m = s.match(/^- \[( |x)\] (https:\/\/www\.siringayrimenkul\.com\/\S+)/);
  if (m && (m[1] === " " || hepsi)) hedefler.push(m[2]);
}
if (!hedefler.length) { console.log("Denetlenecek satır yok."); process.exit(0); }

let sonuc = {};
if (tsvArg) {
  for (const l of readFileSync(tsvArg, "utf8").split("\n")) {
    const [u, v] = l.split("\t");
    if (u && v) sonuc[u] = v; // MEVCUT | YOK | HATA
  }
} else {
  const tmp = join(KOK, `.kuyruk-denetim-tmp.txt`);
  writeFileSync(tmp, hedefler.join("\n") + "\n");
  execFileSync("node", [API, "denetle-dosya", tmp, join(KOK, `api-denetim-${DAMGA.replace(".", "-")}.tsv`)], { stdio: "inherit" });
  for (const l of readFileSync(join(KOK, `api-denetim-${DAMGA.replace(".", "-")}.tsv`), "utf8").split("\n")) {
    const [u, v] = l.split("\t");
    if (u && v) sonuc[u] = v;
  }
}

let dizinde = 0, teyit = 0, atlanan = 0;
metin = satirlar.map((s) => {
  const m = s.match(/^- \[( |x)\] (https:\/\/www\.siringayrimenkul\.com\/\S+)(.*)$/);
  if (!m) return s;
  const [, isaret, url] = m;
  const v = sonuc[url];
  if (!v || v === "HATA") { if (m[1] === " ") atlanan++; return s; }
  if (v === "MEVCUT") {
    if (isaret === " ") { dizinde++; return `- [x] ${url} ← ${DAMGA} DİZİNDE (kendiliğinden)`; }
    // işaretli satırın notunu (ör. "istek gönderildi") SİLME — sonuna ekle
    if (!s.includes("DİZİNDE")) { dizinde++; return `${s} → ${DAMGA} DİZİNDE`; }
    return s;
  }
  // YOK: istek gönderilmiş satırın işaretine dokunma (istek defteri bozulmasın)
  if (isaret === "x") return s;
  teyit++;
  return `- [ ] ${url} ← ${DAMGA} dizin dışı teyit`;
}).join("\n");
writeFileSync(KUYRUK, metin);

// DIZINE-EKLENECEKLER.md'yi yeniden üret (talep sırası = kuyruk sırası)
const bekleyen = [];
for (const s of metin.split("\n")) {
  const m = s.match(/^- \[ \] (https:\/\/www\.siringayrimenkul\.com\/\S+)/);
  if (m) bekleyen.push(m[1]);
}
const out = [
  `# Dizine eklenecekler — ${DAMGA} API denetimi sonrası`, "",
  `Kuyruktaki bekleyen ${bekleyen.length} sayfanın tamamı dizin dışı TEYİTLİ (GSC API).`,
  `Kota açıldıkça bu sırayla istek gönderilir. Akış ve tuzaklar: gsc-dizin becerisi.`, "",
  ...bekleyen.map((u) => `- [ ] ${u}`), "",
];
writeFileSync(CIKTI, out.join("\n"));
console.log(`Bitti: ${dizinde} yeni DİZİNDE, ${teyit} dizin dışı teyit, ${atlanan} sonuçsuz. Bekleyen istek: ${bekleyen.length}.`);
console.log("Commit etmeyi unutma: git add scratchpad-karne/pws0/gsc-dizin-kuyrugu-194.md scratchpad-karne/pws0/DIZINE-EKLENECEKLER.md");
