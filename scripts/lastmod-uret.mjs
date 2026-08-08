#!/usr/bin/env node
/* content/ altındaki her dosyanın GERÇEK son değişim tarihini git geçmişinden
 * çıkarıp content/lastmod.json'a yazar. Sitemap'in lastModified değerleri
 * buradan okunur (lib/content.ts).
 *
 * NEDEN GEREKLİ — fs.statSync().mtime yayında çalışmıyor:
 * Vercel her yayında repoyu sıfırdan çekiyor, dolayısıyla bütün dosyaların
 * mtime'ı build anına eşitleniyor. Sonuç: sitemap'teki 1500+ adresin tamamı
 * aynı damgayı taşıyor ve her yayında hep birlikte "bugün değişti" diyor.
 * Google böyle bir lastmod'u güvenilmez sayıp tümden yok sayıyor — ölçülen
 * sonuç: 31.07'de değiştirilen künyeler 08.08'de hâlâ SERP'te eski hâliyle
 * duruyordu (canlı doğrulama: arya-evleri sayfası 31.07 öncesi açıklamayı
 * gösteriyordu).
 *
 * KULLANIM — içerik dosyalarını değiştirdikten sonra, COMMIT'TEN ÖNCE:
 *   npm run lastmod
 * Üretilen content/lastmod.json'u aynı commit'e ekle. Çalışma ağacında değişik
 * ya da takipsiz dosyalar bugünün tarihini alır (henüz commit'lenmedikleri için
 * git geçmişinde doğru tarihleri yok).
 *
 *   npm run lastmod -- --yalniz-gecmis
 * Çalışma ağacını YOK SAYAR, yalnız commit'lenmiş geçmişe bakar. Paralel bir
 * oturumun yarım işi ağaçta dururken bunu kullan: yoksa manifest, bu commit'e
 * girmeyecek dosyalara "bugün değişti" damgası basar ve tam da onarmaya
 * çalıştığımız yalanı geri getirir.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const KOK = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CIKTI = path.join(KOK, "content", "lastmod.json");
// Manifestin kendisi manifeste girmez — yoksa her üretim kendini tazeler.
const HARIC = new Set(["content/lastmod.json"]);

const git = (...args) =>
  execFileSync("git", args, { cwd: KOK, encoding: "utf-8", maxBuffer: 64 * 1024 * 1024 });

const gunu = (iso) => iso.slice(0, 10);
const bugun = gunu(new Date().toISOString());

/* Tek geçişte tüm geçmiş: "T <iso>" satırları tarihi, diğer satırlar o
 * commit'te değişen yolları verir. git log yeniden-eskiye sıralı olduğu için
 * bir yolu İLK gördüğümüz tarih, o dosyanın son değişim tarihidir.
 * --no-renames: yeniden adlandırma sil+ekle sayılır; yeni yol, adının
 * değiştiği (yani URL'sinin değiştiği) tarihi alır — istediğimiz de bu. */
const tarihler = new Map();
let simdikiTarih = null;
for (const satir of git(
  "log",
  "--no-renames",
  "--pretty=format:T %cI",
  "--name-only",
  "--",
  "content"
).split("\n")) {
  if (satir.startsWith("T ")) {
    simdikiTarih = gunu(satir.slice(2));
  } else if (satir && simdikiTarih && !tarihler.has(satir)) {
    tarihler.set(satir, simdikiTarih);
  }
}

/* Çalışma ağacındaki değişik/takipsiz dosyalar bugüne çekilir: git geçmişi
 * onları henüz görmedi, ama sayfaları bugün değişti. --yalniz-gecmis bunu
 * kapatır (bkz. başlıktaki not). */
const yalnizGecmis = process.argv.includes("--yalniz-gecmis");
const kirli = yalnizGecmis
  ? []
  : git("status", "--porcelain", "--", "content")
      .split("\n")
      .filter(Boolean)
      .map((satir) => satir.slice(3).trim().replace(/^"|"$/g, ""));

const dosyalar = {};
const yurdu = (dizin) => {
  for (const girdi of fs.readdirSync(dizin, { withFileTypes: true })) {
    const tam = path.join(dizin, girdi.name);
    if (girdi.isDirectory()) {
      yurdu(tam);
      continue;
    }
    const gitYolu = path.relative(KOK, tam).split(path.sep).join("/");
    if (HARIC.has(gitYolu)) continue;
    const anahtar = path.relative(path.join(KOK, "content"), tam).split(path.sep).join("/");
    dosyalar[anahtar] = kirli.includes(gitYolu) ? bugun : (tarihler.get(gitYolu) ?? bugun);
  }
};
yurdu(path.join(KOK, "content"));

const sirali = Object.fromEntries(Object.keys(dosyalar).sort().map((k) => [k, dosyalar[k]]));
fs.writeFileSync(
  CIKTI,
  `${JSON.stringify({ uretildi: bugun, dosyalar: sirali }, null, 0)}\n`
);

const dagilim = new Map();
for (const tarih of Object.values(sirali)) dagilim.set(tarih, (dagilim.get(tarih) ?? 0) + 1);
const enYeni = [...dagilim].sort((a, b) => b[0].localeCompare(a[0])).slice(0, 5);
console.log(`${Object.keys(sirali).length} dosya → content/lastmod.json`);
console.log(`Farklı tarih sayısı: ${dagilim.size} (mtime ile 1 olurdu)`);
console.log("En yeni 5 tarih:");
for (const [tarih, adet] of enYeni) console.log(`  ${tarih}  ${adet} dosya`);
