// IndexNow ping: güncellenen sayfaları Bing/Yandex'e (ve diğer IndexNow
// motorlarına) anında bildirir. Google IndexNow KULLANMAZ — bu araç Google
// dizinini ETKİLEMEZ; Bing/Yandex tarafı içindir.
//
// Kullanım:
//   node scripts/indexnow.mjs /mahalleler/tunahan-mahallesi/dema-park [...yol]
//   node scripts/indexnow.mjs --son-commit          (son commit'te değişen içerik sayfaları)
//   node scripts/indexnow.mjs --son-commit=3        (son 3 commit)
//
// --son-commit eşlemesi (content/ dosyası → sayfa yolu):
//   content/siteler/<mahalle>/<site>.json  → /mahalleler/<mahalle>/<site>
//   content/mahalleler/<mahalle>.json      → /mahalleler/<mahalle>
//   content/blog/<slug>.mdx                → /blog/<slug>
//   Sınır .geojson, lastmod.json ve şablon (JSX) değişiklikleri eşlenmez —
//   o sayfaların yolunu elle ver.
//
// Anahtar: public/<KEY>.txt SABİT (14.10). Eskiden public/ altındaki ilk
// 32-hex .txt dosyası readdirSync sırasına göre seçiliyordu; iki anahtar
// dosyası varken hangisinin gideceği dosya sistemi sırasına kalıyordu. İkinci
// dosya (07db06e6…) silindi. Motorlar anahtarı https://<host>/<KEY>.txt
// adresinden doğrular — dosya deploy edilmiş olmalı.
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";

const HOST = "www.siringayrimenkul.com";
const KEY = "4f66b60d9d5d45368c5f4e5f538adf2a";
if (!existsSync(new URL(`../public/${KEY}.txt`, import.meta.url))) {
  console.error(`public/${KEY}.txt yok — anahtar dosyası silinmiş ya da taşınmış.`);
  process.exit(1);
}

let yollar = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const sonCommit = process.argv.find((a) => a.startsWith("--son-commit"));
if (sonCommit) {
  const n = Number(sonCommit.split("=")[1] || 1);
  const dosyalar = execSync(`git diff --name-only HEAD~${n} HEAD`, {
    cwd: new URL("..", import.meta.url).pathname,
    encoding: "utf8",
  }).split("\n");
  for (const d of dosyalar) {
    const site = d.match(/^content\/siteler\/([^/]+)\/([^/]+)\.json$/);
    if (site) { yollar.push(`/mahalleler/${site[1]}/${site[2]}`); continue; }
    const mahalle = d.match(/^content\/mahalleler\/([^/]+)\.json$/);
    if (mahalle) { yollar.push(`/mahalleler/${mahalle[1]}`); continue; }
    // content/blog: 19 yazının tamamı .mdx (14.10'da sayıldı; lib/content.ts de .mdx okur).
    const blog = d.match(/^content\/blog\/([^/]+)\.mdx$/);
    if (blog) yollar.push(`/blog/${blog[1]}`);
  }
}
yollar = [...new Set(yollar)];
if (!yollar.length) {
  console.error("Bildirilecek yol yok (argüman ver ya da --son-commit kullan).");
  process.exit(1);
}

const govde = {
  host: HOST,
  key: KEY,
  keyLocation: `https://${HOST}/${KEY}.txt`,
  urlList: yollar.map((y) => `https://${HOST}${y}`),
};
const r = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify(govde),
});
console.log(`IndexNow: ${r.status} ${r.statusText} — ${yollar.length} URL bildirildi`);
if (r.status >= 400) {
  console.log(await r.text());
  process.exit(1);
}
for (const u of govde.urlList) console.log("  " + u);
