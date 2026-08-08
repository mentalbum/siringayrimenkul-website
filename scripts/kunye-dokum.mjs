// Künye çıkarımının denetim dökümü: tüm site kayıtlarını lib/kunye.ts'teki
// GERÇEK parser'dan geçirir (kopya regex yok — tek doğruluk kaynağı) ve
// kapsama istatistiği + tam JSON dökümü üretir.
// Çalıştırma: node scripts/kunye-dokum.mjs > <dosya>
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { cikarKunye, kunyeCumlesi } from "../lib/kunye.ts";

const KOK = new URL("../content/siteler", import.meta.url).pathname;
const satirlar = [];
const kapsama = {};
const say = (k) => (kapsama[k] = (kapsama[k] ?? 0) + 1);

for (const mahalle of readdirSync(KOK)) {
  for (const dosya of readdirSync(join(KOK, mahalle))) {
    if (!dosya.endsWith(".json")) continue;
    const site = JSON.parse(readFileSync(join(KOK, mahalle, dosya), "utf8"));
    site.mahalleSlug ??= mahalle;
    const k = cikarKunye(site);
    const cumle = kunyeCumlesi(site, k, "MAHALLE", false);
    if (k.parselAlaniM2 !== undefined) say("alan");
    if (k.tapuNiteligi) say("tapu");
    if (k.blokSayisi !== undefined) say("blok");
    if (k.katMax !== undefined) say("kat");
    if (k.konutSayisi !== undefined) say("konut");
    if (k.odaTipleri.length > 0) {
      say("odaTipi");
      // Tip başına kayıt sayısı: /eryaman-site-dokusu'ndaki görünür sayılar
      // buradan doğrulanır, elle yazılmaz.
      for (const t of k.odaTipleri) say(`odaTipi:${t}`);
    }
    if (cumle) say("cumle");
    say("toplam");
    satirlar.push({ mahalle, slug: site.slug, ...k, cumle });
  }
}

console.error("KAPSAMA:", JSON.stringify(kapsama));
console.log(JSON.stringify(satirlar, null, 1));
