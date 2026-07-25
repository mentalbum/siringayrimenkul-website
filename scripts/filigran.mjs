#!/usr/bin/env node
/**
 * Site fotoğrafı hazırlama — tek standart, tek komut.
 *
 * Temiz ORİJİNAL asla public/ içine konmaz (konursa filigranın anlamı kalmaz).
 * Bu script orijinali alır, 1440x1080'e ölçekler, sağ alt köşeye
 * "siringayrimenkul.com" künyesini basar, telif meta verisini gömer ve
 * public/images/siteler/<slug>-eryaman.jpg olarak yazar.
 *
 * Kullanım:
 *   node scripts/filigran.mjs --in ~/Desktop/okyanus.jpg --slug okyanus-plaza \
 *        --baslik "Okyanus Plaza, Tunahan Mahallesi, Eryaman"
 *
 * Seçenekler:
 *   --pos br|bl   künye köşesi (varsayılan br = sağ alt)
 *   --size 0.028  metin yüksekliği / görsel yüksekliği (varsayılan %2,8)
 *   --op 0.72     metin opaklığı
 *   --temiz       filigransız üret (sahibinden.com vitrin fotoğrafı için)
 */
import sharp from "sharp";
import path from "node:path";
import fs from "node:fs";

const argv = process.argv.slice(2);
const arg = (k, d) => {
  const i = argv.indexOf(`--${k}`);
  return i === -1 ? d : argv[i + 1];
};
const flag = (k) => argv.includes(`--${k}`);

const IN = arg("in");
const SLUG = arg("slug");
const BASLIK = arg("baslik", "");
if (!IN || !SLUG) {
  console.error("Kullanım: node scripts/filigran.mjs --in <dosya> --slug <site-slug> [--baslik \"...\"]");
  process.exit(1);
}

const KUNYE = "siringayrimenkul.com";
const YIL = new Date().getFullYear();
const POS = arg("pos", "br");
const SIZE = Number(arg("size", "0.028"));
// Emlak fotoğraflarında alt kenar çoğu zaman açık renktir (yol, kaldırım, beyaz
// araba). 0,72 opaklık + zayıf gölgeyle künye o zeminde siliniyordu; 0,92 + güçlü
// gölge her iki zeminde de okunuyor ve hâlâ fotoğrafın önüne geçmiyor.
const OP = Number(arg("op", "0.92"));
const TEMIZ = flag("temiz");

// Filigranlı kopya siteye girer. Filigransız kopya public/ DIŞINA yazılır:
// sahibinden.com ilan kurallarına göre ilan görsellerinde firma logosu, telefon
// ve web adresi bulunamaz (vitrin fotoğrafı doğrudan reddedilir), o yüzden
// portala giden dosya ayrı üretilir — ve siteye sızarsa filigranın anlamı kalmaz.
const OUT_DIR = TEMIZ
  ? path.join(process.cwd(), "portal-fotograflari")
  : path.join(process.cwd(), "public", "images", "siteler");
const OUT = path.join(OUT_DIR, `${SLUG}-eryaman${TEMIZ ? "-temiz" : ""}.jpg`);
fs.mkdirSync(OUT_DIR, { recursive: true });

const base = sharp(IN).rotate().resize(1440, 1080, { fit: "cover", withoutEnlargement: true });
const { width: W, height: H } = await base.clone().toBuffer({ resolveWithObject: true }).then((r) => r.info);

const fontSize = Math.round(H * SIZE);
const pad = Math.round(H * 0.022);
const anchor = POS === "bl" ? `x="${pad}" text-anchor="start"` : `x="${W - pad}" text-anchor="end"`;

const kunyeSvg = Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="g" x="-60%" y="-60%" width="220%" height="220%">
      <feDropShadow dx="0" dy="${Math.max(1, Math.round(fontSize * 0.06))}"
        stdDeviation="${Math.max(2, Math.round(fontSize * 0.167))}" flood-color="#000" flood-opacity="0.85"/>
    </filter>
  </defs>
  <text ${anchor} y="${H - pad}" font-family="Helvetica, Arial, sans-serif" font-size="${fontSize}"
        font-weight="600" letter-spacing="${(fontSize * 0.02).toFixed(2)}"
        fill="#ffffff" fill-opacity="${OP}" filter="url(#g)">${KUNYE}</text>
</svg>`);

const telif = `(c) ${YIL} Sirin Gayrimenkul - ${KUNYE}`;
const xmp = `<?xpacket begin="﻿" id="W5M0MpCehiHzreSzNTczkc9d"?><x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:Description rdf:about="" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:xmpRights="http://ns.adobe.com/xap/1.0/rights/" xmlns:plus="http://ns.useplus.org/ldf/xmp/1.0/"><dc:creator><rdf:Seq><rdf:li>Sirin Gayrimenkul</rdf:li></rdf:Seq></dc:creator><dc:rights><rdf:Alt><rdf:li xml:lang="x-default">${telif}</rdf:li></rdf:Alt></dc:rights><xmpRights:Marked>True</xmpRights:Marked><xmpRights:WebStatement>https://www.siringayrimenkul.com/</xmpRights:WebStatement><plus:Licensor><rdf:Seq><rdf:li rdf:parseType="Resource"><plus:LicensorName>Sirin Gayrimenkul</plus:LicensorName><plus:LicensorURL>https://www.siringayrimenkul.com/iletisim</plus:LicensorURL></rdf:li></rdf:Seq></plus:Licensor></rdf:Description></rdf:RDF></x:xmpmeta><?xpacket end="r"?>`;

let pipe = base;
if (!TEMIZ) pipe = pipe.composite([{ input: kunyeSvg, top: 0, left: 0 }]);

await pipe
  .withExif({
    IFD0: {
      Copyright: telif,
      Artist: "Sirin Gayrimenkul",
      ...(BASLIK ? { ImageDescription: BASLIK } : {}),
    },
  })
  .withXmp(xmp)
  .jpeg({ quality: 82, mozjpeg: true, chromaSubsampling: "4:4:4" })
  .toFile(OUT);

const kb = Math.round(fs.statSync(OUT).size / 1024);
console.log(`${OUT}  ${W}x${H}  ${kb} KB  ${TEMIZ ? "(filigransız)" : `künye: ${fontSize}px / ${POS}`}`);
if (TEMIZ) {
  console.log("Bu dosya siteye GİRMEZ — sahibinden.com ilanı için ayrıldı.");
} else {
  console.log(`JSON kaydına:  "gorsel": "/images/siteler/${path.basename(OUT)}"`);
}
