import fs from "fs";
import path from "path";
import type { BlogPost, Mahalle } from "@/lib/types";

/**
 * İçerik metinlerinde geçen sayı yer tutucularını ({{siteSayisi:goksu-mahallesi}})
 * gerçek kayıt sayısıyla değiştirir.
 *
 * Neden bileşen değil de metin düzeyinde genişletme: sayı yalnız MDX gövdesinde
 * değil, frontmatter `ozet` ve mahalle JSON'larındaki `uzunAciklama` içinde de
 * geçiyor. Bunlar meta açıklamaya ve JSON-LD'ye düz string olarak gidiyor —
 * orada React bileşeni çalışmaz.
 *
 * KISIT — yer tutucu YALNIZ şu alanlarda kullanılabilir:
 *   content/blog/*.mdx        → frontmatter `ozet` + gövde
 *   content/mahalleler/*.json → `uzunAciklama[]`
 * Bu alanların bütün tüketicileri genişletmeden geçiyor. `kisaAciklama` listede
 * YOK: onu app/mahalleler/[mahalle]/[site]/page.tsx ve lib/faq.ts'teki
 * getSiteFaq de okuyor, oralarda genişletme çağrılmıyor; oraya yazılacak bir
 * yer tutucu site sayfasında ham görünürdü. Kapsam listesi ve denetimi
 * scripts/icerik-token-denetle.mjs içinde; derlemeyi kırar.
 */

const CONTENT_DIR = path.join(process.cwd(), "content");
const MAHALLELER_DIR = path.join(CONTENT_DIR, "mahalleler");
const SITELER_DIR = path.join(CONTENT_DIR, "siteler");

const TOKEN_DESENI = /\{\{([^{}]*)\}\}/g;

/**
 * Mahallenin site/rezidans sayısı. Sayım lib/content.ts'teki
 * getSitelerByMahalle ile BİREBİR aynı tanımı kullanır (klasördeki .json
 * kayıtları, filtresiz) — aksi hâlde metindeki sayı ile mahalle sayfasının
 * listelediği sayı birbirini tutmaz. `.geojson` sınır dosyaları ".json" ile
 * bitmediği için zaten dışarıda kalır.
 */
function siteSayisi(mahalleSlug: string): number {
  const dir = path.join(SITELER_DIR, mahalleSlug);
  if (!fs.existsSync(dir)) return 0;
  return fs.readdirSync(dir).filter((file) => file.endsWith(".json")).length;
}

function mahalleVarMi(mahalleSlug: string): boolean {
  return fs.existsSync(path.join(MAHALLELER_DIR, `${mahalleSlug}.json`));
}

const COZUCULER: Record<string, (arg: string) => string> = {
  siteSayisi: (arg) => {
    if (!arg) throw new Error("siteSayisi bir mahalle slug'ı ister: {{siteSayisi:goksu-mahallesi}}");
    // Bilinmeyen slug'da 0 dönmek yer tutucuyu sessizce yanlış yapardı
    // ("0 site ve rezidansıyla"); yazım hatası derlemede patlamalı.
    if (!mahalleVarMi(arg)) throw new Error(`bilinmeyen mahalle: "${arg}"`);
    return String(siteSayisi(arg));
  },
};

export const TANINAN_TOKENLAR = Object.keys(COZUCULER);

/**
 * `kaynak` yalnız hata mesajı için: "content/blog/x.mdx → ozet" gibi, yazan
 * kişinin dosyayı doğrudan bulabileceği bir etiket.
 */
export function tokenlariAc(metin: string, kaynak: string): string {
  return metin.replace(TOKEN_DESENI, (ham, icerik: string) => {
    const ayrac = icerik.indexOf(":");
    const ad = (ayrac === -1 ? icerik : icerik.slice(0, ayrac)).trim();
    const arg = ayrac === -1 ? "" : icerik.slice(ayrac + 1).trim();
    const cozucu = COZUCULER[ad];
    if (!cozucu) {
      throw new Error(
        `Tanınmayan içerik yer tutucusu ${ham} — kaynak: ${kaynak}. ` +
          `Tanınanlar: ${TANINAN_TOKENLAR.join(", ")}.`
      );
    }
    try {
      return cozucu(arg);
    } catch (hata) {
      throw new Error(
        `İçerik yer tutucusu çözülemedi ${ham} — kaynak: ${kaynak}. ` +
          `${hata instanceof Error ? hata.message : String(hata)}`
      );
    }
  });
}

/** Mahalle kaydının yer tutucu taşıyabilen alanlarını açar. */
export function mahalleTokenlariniAc(mahalle: Mahalle): Mahalle {
  if (!mahalle.uzunAciklama) return mahalle;
  const kaynak = `content/mahalleler/${mahalle.slug}.json`;
  return {
    ...mahalle,
    uzunAciklama: mahalle.uzunAciklama.map((paragraf, i) =>
      tokenlariAc(paragraf, `${kaynak} → uzunAciklama[${i}]`)
    ),
  };
}

/** Blog yazısının yer tutucu taşıyabilen alanlarını açar (özet + gövde). */
export function yaziTokenlariniAc(post: BlogPost): BlogPost {
  const kaynak = `content/blog/${post.slug}.mdx`;
  return {
    ...post,
    ozet: tokenlariAc(post.ozet, `${kaynak} → ozet`),
    content: tokenlariAc(post.content, `${kaynak} → gövde`),
  };
}
