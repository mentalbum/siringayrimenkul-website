#!/usr/bin/env node
/**
 * İçerik yer tutucusu ({{siteSayisi:<mahalle-slug>}}) denetimi. `prebuild`
 * kancasından çalışır; hata bulursa çıkış kodu 1 ile derlemeyi kırar.
 *
 * Üç şeyi birden korur:
 *   1) Her yer tutucu tanınır ve çözülür (yazım hatası sessizce geçmez).
 *   2) Yer tutucu YALNIZ genişletmeden geçen alanlarda durur. Bir yazar
 *      örneğin `kisaAciklama`ya yer tutucu koyarsa sayfada ham `{{...}}`
 *      görünürdü — burada yakalanır.
 *   3) O alanları okuyan dosya listesi donduruldu. Yeni bir tüketici eklenip
 *      genişletme çağrılmazsa denetim düşer; kapsam sessizce delinmez.
 *
 * Not: 1 ve 2 için lib/icerik-token.ts'in çözücü tanımı tekrar edilmez, node
 * ile doğrudan içerik okunup aynı sayım kuralı uygulanır (klasördeki .json
 * kayıtları — lib/content.ts'teki getSitelerByMahalle ile aynı tanım).
 */
import fs from "node:fs";
import path from "node:path";

const KOK = path.resolve(import.meta.dirname, "..");
const TOKEN_DESENI = /\{\{([^{}]*)\}\}/g;
const hatalar = [];

const mahalleSluglari = new Set(
  fs
    .readdirSync(path.join(KOK, "content/mahalleler"))
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(/\.json$/, ""))
);

function siteSayisi(slug) {
  const dir = path.join(KOK, "content/siteler", slug);
  if (!fs.existsSync(dir)) return 0;
  return fs.readdirSync(dir).filter((f) => f.endsWith(".json")).length;
}

/** Tek bir yer tutucuyu doğrular; sorun varsa açıklama döner, yoksa null. */
function tokenSorunu(ham) {
  const icerik = ham.slice(2, -2);
  const ayrac = icerik.indexOf(":");
  const ad = (ayrac === -1 ? icerik : icerik.slice(0, ayrac)).trim();
  const arg = ayrac === -1 ? "" : icerik.slice(ayrac + 1).trim();
  if (ad !== "siteSayisi") return `tanınmayan yer tutucu adı "${ad}" (tanınan: siteSayisi)`;
  if (!arg) return "siteSayisi bir mahalle slug'ı ister: {{siteSayisi:goksu-mahallesi}}";
  if (!mahalleSluglari.has(arg)) return `bilinmeyen mahalle slug'ı "${arg}"`;
  return null;
}

function tokenlar(metin) {
  return [...String(metin ?? "").matchAll(TOKEN_DESENI)].map((m) => m[0]);
}

function denetleMetin(metin, yer) {
  for (const ham of tokenlar(metin)) {
    const sorun = tokenSorunu(ham);
    if (sorun) hatalar.push(`${yer}: ${ham} → ${sorun}`);
  }
}

// ---------------------------------------------------------------- 1 + 2
// Blog: yer tutucu frontmatter `ozet` ve gövdede serbest, başka yerde değil.
const blogDir = path.join(KOK, "content/blog");
for (const dosya of fs.readdirSync(blogDir).filter((f) => f.endsWith(".mdx"))) {
  const ham = fs.readFileSync(path.join(blogDir, dosya), "utf8");
  const eslesme = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(ham);
  const onSoz = eslesme ? eslesme[1] : "";
  const govde = eslesme ? ham.slice(eslesme[0].length) : ham;
  denetleMetin(govde, `content/blog/${dosya} → gövde`);

  // Frontmatter satır satır taranır: `ozet:` dışındaki bir alanda yer tutucu
  // varsa (baslik, faq/cevap…) genişletme oraya uğramıyor demektir.
  let ozetSatirinda = false;
  for (const satir of onSoz.split(/\r?\n/)) {
    if (/^\S/.test(satir)) ozetSatirinda = /^ozet\s*:/.test(satir);
    if (!tokenlar(satir).length) continue;
    if (ozetSatirinda) denetleMetin(satir, `content/blog/${dosya} → ozet`);
    else
      hatalar.push(
        `content/blog/${dosya} → frontmatter: ${tokenlar(satir)[0]} kapsam dışı bir alanda. ` +
          `Yer tutucu yalnız 'ozet' alanında ve gövdede genişletilir.`
      );
  }
}

// Mahalle JSON: yalnız uzunAciklama[] genişletiliyor.
const mahalleDir = path.join(KOK, "content/mahalleler");
for (const dosya of fs.readdirSync(mahalleDir).filter((f) => f.endsWith(".json"))) {
  const kayit = JSON.parse(fs.readFileSync(path.join(mahalleDir, dosya), "utf8"));
  for (const [alan, deger] of Object.entries(kayit)) {
    const metinler =
      typeof deger === "string"
        ? [deger]
        : Array.isArray(deger)
          ? deger.filter((d) => typeof d === "string")
          : [];
    for (const metin of metinler) {
      if (!tokenlar(metin).length) continue;
      if (alan === "uzunAciklama") denetleMetin(metin, `content/mahalleler/${dosya} → uzunAciklama`);
      else
        hatalar.push(
          `content/mahalleler/${dosya} → ${alan}: ${tokenlar(metin)[0]} kapsam dışı bir alanda. ` +
            `Yer tutucu yalnız 'uzunAciklama' içinde genişletilir` +
            (alan === "kisaAciklama"
              ? " — kisaAciklama'yı app/mahalleler/[mahalle]/[site]/page.tsx ve lib/faq.ts de okuyor, oralarda genişletme yok."
              : ".")
        );
    }
  }
}

// Site kayıtları hiç genişletilmiyor: oraya yer tutucu yazılmışsa ham çıkar.
const sitelerDir = path.join(KOK, "content/siteler");
for (const mahalle of fs.readdirSync(sitelerDir)) {
  const dir = path.join(sitelerDir, mahalle);
  if (!fs.statSync(dir).isDirectory()) continue;
  for (const dosya of fs.readdirSync(dir).filter((f) => f.endsWith(".json"))) {
    const metin = fs.readFileSync(path.join(dir, dosya), "utf8");
    if (tokenlar(metin).length)
      hatalar.push(
        `content/siteler/${mahalle}/${dosya}: ${tokenlar(metin)[0]} — site kayıtlarında yer tutucu genişletilmiyor.`
      );
  }
}

// ------------------------------------------------------------------- 3
// Genişletmeyi ÇAĞIRMASI zorunlu dosyalar. Kimi dosya `.ozet` yazmadan
// (BlogCard'a nesne geçirerek) yer tutuculu metni sayfaya taşıdığı için bu
// liste elle tutulur.
const GENISLETMESI_ZORUNLU = [
  "app/blog/[slug]/page.tsx",
  "app/blog/page.tsx",
  "app/page.tsx",
  "app/mahalleler/[mahalle]/page.tsx",
];

// Yer tutucu taşıyan alanları okuyan, ama kendisi genişletmeyen dosyalar —
// her biri gerekçesiyle. Listede olmayan yeni bir okuyucu denetimi düşürür.
const KAPSAM_DISI_OKUYUCULAR = {
  "components/blog/blog-card.tsx":
    "istemci ağacında çalışır; veriyi genişleten sunucu sayfalarından alır",
  "lib/icerik-token.ts": "genişletmenin kendisi",
  "lib/types.ts": "tip tanımı",
  "lib/faq.ts":
    "uzunAciklama[0]'ı çağıranın verdiği mahalle kaydından okur; mahalle sayfası kaydı genişletilmiş geçiriyor",
};

const ALAN_DESENI = /\.(ozet|uzunAciklama)\b/;

function* kodDosyalari(dir) {
  for (const giris of fs.readdirSync(dir, { withFileTypes: true })) {
    if (giris.name === "node_modules" || giris.name.startsWith(".")) continue;
    const tam = path.join(dir, giris.name);
    if (giris.isDirectory()) yield* kodDosyalari(tam);
    else if (/\.(ts|tsx)$/.test(giris.name)) yield tam;
  }
}

for (const kok of ["app", "components", "lib"]) {
  for (const tam of kodDosyalari(path.join(KOK, kok))) {
    const goreli = path.relative(KOK, tam);
    const kod = fs.readFileSync(tam, "utf8");
    if (!ALAN_DESENI.test(kod)) continue;
    if (kod.includes("icerik-token")) continue;
    if (KAPSAM_DISI_OKUYUCULAR[goreli]) continue;
    hatalar.push(
      `${goreli}: yer tutucu taşıyabilen bir alanı (.ozet / .uzunAciklama) okuyor ama ` +
        `lib/icerik-token.ts'i çağırmıyor. Ya genişletmeyi ekle ya da ` +
        `scripts/icerik-token-denetle.mjs içindeki KAPSAM_DISI_OKUYUCULAR listesine gerekçesiyle yaz.`
    );
  }
}

for (const goreli of GENISLETMESI_ZORUNLU) {
  const tam = path.join(KOK, goreli);
  if (!fs.existsSync(tam)) {
    hatalar.push(`${goreli}: dosya yok — GENISLETMESI_ZORUNLU listesi güncellenmeli.`);
    continue;
  }
  if (!fs.readFileSync(tam, "utf8").includes("icerik-token"))
    hatalar.push(`${goreli}: yer tutuculu içeriği sayfaya taşıyor ama lib/icerik-token.ts'i çağırmıyor.`);
}

// ---------------------------------------------------------------- rapor
if (hatalar.length) {
  console.error("İçerik yer tutucusu denetimi BAŞARISIZ:\n");
  for (const h of hatalar) console.error("  ✗ " + h);
  console.error("");
  process.exit(1);
}

const kullanilan = new Map();
for (const dosya of fs.readdirSync(blogDir).filter((f) => f.endsWith(".mdx"))) {
  for (const ham of tokenlar(fs.readFileSync(path.join(blogDir, dosya), "utf8")))
    kullanilan.set(ham, (kullanilan.get(ham) ?? 0) + 1);
}
for (const dosya of fs.readdirSync(mahalleDir).filter((f) => f.endsWith(".json"))) {
  for (const ham of tokenlar(fs.readFileSync(path.join(mahalleDir, dosya), "utf8")))
    kullanilan.set(ham, (kullanilan.get(ham) ?? 0) + 1);
}
const toplam = [...kullanilan.values()].reduce((a, b) => a + b, 0);
console.log(`İçerik yer tutucusu denetimi tamam — ${toplam} kullanım, ${kullanilan.size} ayrı yer tutucu.`);
for (const [ham] of [...kullanilan].sort())
  console.log(`  ${ham} → ${siteSayisi(ham.slice(2, -2).split(":")[1].trim())}`);
