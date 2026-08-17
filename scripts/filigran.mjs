#!/usr/bin/env node
/**
 * Site fotoğrafı hazırlama — tek standart, tek komut.
 *
 * Orijinali alır, 1440x1080'e ölçekler, iki işaret basar:
 *   - MERKEZE "siringayrimenkul.com" künyesi. Köşede değil, çünkü köşe filigranı
 *     tek kırpmayla gider; merkezdeki künye kırpılamaz — fotoğrafı kim kullanırsa
 *     adresi de birlikte taşımak zorunda kalır.
 *   - SOL ALTA logo. İkisinde de gölge var: emlak fotoğraflarında alt kenar ve
 *     gökyüzü açık renk olduğu için gölgesiz beyaz metin siliniyor.
 * Ardından telif meta verisini (EXIF + XMP) gömer ve dosyayı yazar.
 *
 * Kullanım:
 *   node scripts/filigran.mjs --in ~/Desktop/okyanus.jpg --slug okyanus-plaza \
 *        --baslik "Okyanus Plaza, Tunahan Mahallesi, Eryaman"
 *
 * Seçenekler:
 *   --size 0.034  künye yüksekliği / görsel yüksekliği (varsayılan %3,4)
 *   --op 0.85     künye opaklığı
 *   --y 0.50      künyenin dikey konumu (0 = üst, 1 = alt; varsayılan tam orta)
 *   --logosuz     logoyu basma, yalnız künye
 *   --temiz       hiçbir işaret basma — sahibinden.com ilan görseli için
 *                 (ilan kurallarına göre ilan fotoğrafında logo/web adresi yasak;
 *                 vitrin fotoğrafı doğrudan reddediliyor)
 *   --sira 2      aynı yerleşimin ÇOK FOTOĞRAFLI galerisi için sıra numarası;
 *                 dosya adı "<slug>-eryaman-2.jpg" olur. Numarasız çağrı
 *                 "<slug>-eryaman.jpg" üretmeye devam eder (sayfa kartlarında
 *                 ve og:image'de kullanılan ANA görsel odur — mevcut kayıtların
 *                 yolu bozulmasın diye numarasız biçim korunuyor).
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
const SIZE = Number(arg("size", "0.034"));
const OP = Number(arg("op", "0.85"));
const CY = Number(arg("y", "0.50"));
const LOGOSUZ = flag("logosuz");
const TEMIZ = flag("temiz");
const LOGO_YOLU = path.join(process.cwd(), "public", "brand", "sirin-logo-on-dark.png");

// Filigranlı kopya siteye girer. Filigransız kopya public/ DIŞINA yazılır —
// oraya sızarsa filigranın anlamı kalmaz.
const OUT_DIR = TEMIZ
  ? path.join(process.cwd(), "portal-fotograflari")
  : path.join(process.cwd(), "public", "images", "siteler");
const SIRA = arg("sira");
const SIRA_EKI = SIRA ? `-${String(SIRA).replace(/[^0-9]/g, "")}` : "";
const OUT = path.join(OUT_DIR, `${SLUG}-eryaman${SIRA_EKI}${TEMIZ ? "-temiz" : ""}.jpg`);
fs.mkdirSync(OUT_DIR, { recursive: true });

const base = sharp(IN).rotate().resize(1440, 1080, { fit: "cover", withoutEnlargement: true });
const { width: W, height: H } = await base.clone().toBuffer({ resolveWithObject: true }).then((r) => r.info);

async function isaretKatmani() {
  const fontSize = Math.round(H * SIZE);
  const logoVar = !LOGOSUZ && fs.existsSync(LOGO_YOLU);

  let logoParcasi = "";
  if (logoVar) {
    const b64 = fs.readFileSync(LOGO_YOLU).toString("base64");
    const meta = await sharp(LOGO_YOLU).metadata();
    const lh = Math.round(H * 0.058);
    const lw = Math.round((meta.width * lh) / meta.height);
    const lx = Math.round(W * 0.025);
    const ly = H - lh - Math.round(H * 0.03);
    logoParcasi = `<image xlink:href="data:image/png;base64,${b64}" x="${lx}" y="${ly}" width="${lw}" height="${lh}" opacity="0.92" filter="url(#l)"/>`;
  }

  return Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <filter id="t" x="-60%" y="-60%" width="220%" height="220%">
      <feDropShadow dx="0" dy="${Math.max(1, Math.round(fontSize * 0.05))}"
        stdDeviation="${Math.max(2, Math.round(fontSize * 0.14))}" flood-color="#000" flood-opacity="0.7"/>
    </filter>
    <filter id="l" x="-40%" y="-40%" width="180%" height="180%">
      <feDropShadow dx="0" dy="2" stdDeviation="${Math.max(2, Math.round(H * 0.0058))}" flood-color="#000" flood-opacity="0.75"/>
    </filter>
  </defs>
  <text x="${Math.round(W / 2)}" y="${Math.round(H * CY)}" text-anchor="middle"
        font-family="Helvetica, Arial, sans-serif" font-size="${fontSize}" font-weight="600"
        letter-spacing="${(fontSize * 0.03).toFixed(2)}" fill="#ffffff" fill-opacity="${OP}"
        filter="url(#t)">${KUNYE}</text>
  ${logoParcasi}
</svg>`);
}

const telif = `(c) ${YIL} Sirin Gayrimenkul - ${KUNYE}`;
const xmp = `<?xpacket begin="﻿" id="W5M0MpCehiHzreSzNTczkc9d"?><x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:Description rdf:about="" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:xmpRights="http://ns.adobe.com/xap/1.0/rights/" xmlns:plus="http://ns.useplus.org/ldf/xmp/1.0/"><dc:creator><rdf:Seq><rdf:li>Sirin Gayrimenkul</rdf:li></rdf:Seq></dc:creator><dc:rights><rdf:Alt><rdf:li xml:lang="x-default">${telif}</rdf:li></rdf:Alt></dc:rights><xmpRights:Marked>True</xmpRights:Marked><xmpRights:WebStatement>https://www.siringayrimenkul.com/</xmpRights:WebStatement><plus:Licensor><rdf:Seq><rdf:li rdf:parseType="Resource"><plus:LicensorName>Sirin Gayrimenkul</plus:LicensorName><plus:LicensorURL>https://www.siringayrimenkul.com/iletisim</plus:LicensorURL></rdf:li></rdf:Seq></plus:Licensor></rdf:Description></rdf:RDF></x:xmpmeta><?xpacket end="r"?>`;

let pipe = base;
if (!TEMIZ) pipe = pipe.composite([{ input: await isaretKatmani(), top: 0, left: 0 }]);

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
console.log(`${OUT}  ${W}x${H}  ${kb} KB  ${TEMIZ ? "(işaretsiz)" : `künye: merkez${LOGOSUZ ? "" : " + sol alt logo"}`}`);
if (TEMIZ) {
  console.log("Bu dosya siteye GİRMEZ — sahibinden.com ilanı için ayrıldı.");
} else {
  console.log(`JSON kaydına:  "gorsel": "/images/siteler/${path.basename(OUT)}"`);
}
