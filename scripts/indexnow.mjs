// IndexNow ping: güncellenen sayfaları Bing/Yandex'e (ve diğer IndexNow
// motorlarına) anında bildirir. Google IndexNow KULLANMAZ — bu araç Google
// dizinini ETKİLEMEZ; Bing/Yandex tarafı içindir.
//
// Kullanım:
//   node scripts/indexnow.mjs /mahalleler/tunahan-mahallesi/dema-park [...yol]
//   node scripts/indexnow.mjs --son-commit          (son commit'te değişen site sayfaları)
//   node scripts/indexnow.mjs --son-commit=3        (son 3 commit)
//
// Anahtar: public/<key>.txt (deploy edilmiş olmalı — motorlar anahtarı
// https://<host>/<key>.txt adresinden doğrular).
import { execSync } from "node:child_process";
import { readdirSync } from "node:fs";

const HOST = "www.siringayrimenkul.com";
const keyDosya = readdirSync(new URL("../public", import.meta.url)).find((f) =>
  /^[0-9a-f]{32}\.txt$/.test(f)
);
if (!keyDosya) {
  console.error("public/ altında 32-hex .txt anahtar dosyası yok.");
  process.exit(1);
}
const KEY = keyDosya.replace(".txt", "");

let yollar = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const sonCommit = process.argv.find((a) => a.startsWith("--son-commit"));
if (sonCommit) {
  const n = Number(sonCommit.split("=")[1] || 1);
  const dosyalar = execSync(`git diff --name-only HEAD~${n} HEAD`, {
    cwd: new URL("..", import.meta.url).pathname,
    encoding: "utf8",
  }).split("\n");
  for (const d of dosyalar) {
    const m = d.match(/^content\/siteler\/([^/]+)\/([^/]+)\.json$/);
    if (m) yollar.push(`/mahalleler/${m[1]}/${m[2]}`);
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
