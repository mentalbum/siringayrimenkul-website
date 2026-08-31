#!/usr/bin/env node
/**
 * GSC API istemcisi (sıfır bağımlılık) — servis hesabı anahtarıyla çalışır.
 *
 * Kurulum (bir kere): .claude/skills/gsc-dizin/references/api-kurulum.md
 * Anahtar yolu: ~/.config/gsc-servis-anahtari.json (veya GSC_KEY ortam değişkeni)
 *
 * Kullanım:
 *   node scripts/gsc-api.mjs denetle <url> [url...]      # URL denetimi (günde 2000)
 *   node scripts/gsc-api.mjs denetle-dosya <dosya> [çıktı.tsv]
 *   node scripts/gsc-api.mjs sorgular [gün=28]           # performans: en çok gösterim alan sorgular
 *   node scripts/gsc-api.mjs sayfalar [gün=90]           # performans: sayfa başına gösterim/tık/pozisyon
 *   node scripts/gsc-api.mjs sitemap-gonder [yol...]     # sitemap yeniden gönder (varsayılan sitemap.xml)
 *
 * NOT: Dizine ekleme İSTEĞİ bu API'den gönderilemez (Indexing API sadece iş
 * ilanları içindir, başka kullanım kural ihlali). İstekler her zaman GSC UI'den.
 */
import { createSign } from "node:crypto";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const MULK = "https://www.siringayrimenkul.com/";
const ANAHTAR_YOLU = process.env.GSC_KEY || join(homedir(), ".config", "gsc-servis-anahtari.json");

function anahtar() {
  if (!existsSync(ANAHTAR_YOLU)) {
    console.error(
      `Servis hesabı anahtarı yok: ${ANAHTAR_YOLU}\n` +
      `Kurulum adımları: .claude/skills/gsc-dizin/references/api-kurulum.md\n` +
      `(Google Cloud'da servis hesabı açıp JSON anahtarı bu yola koymak ve\n` +
      ` hesabın e-postasını GSC mülküne kullanıcı olarak eklemek gerekiyor.)`
    );
    process.exit(2);
  }
  return JSON.parse(readFileSync(ANAHTAR_YOLU, "utf8"));
}

const b64u = (s) => Buffer.from(s).toString("base64url");

async function erisimJetonu() {
  const k = anahtar();
  const simdi = Math.floor(Date.now() / 1000);
  const govde =
    b64u(JSON.stringify({ alg: "RS256", typ: "JWT" })) + "." +
    b64u(JSON.stringify({
      iss: k.client_email,
      scope: "https://www.googleapis.com/auth/webmasters",
      aud: "https://oauth2.googleapis.com/token",
      iat: simdi,
      exp: simdi + 3600,
    }));
  const imza = createSign("RSA-SHA256").update(govde).sign(k.private_key, "base64url");
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${govde}.${imza}`,
    }),
  });
  const j = await r.json();
  if (!j.access_token) {
    console.error("Jeton alınamadı:", JSON.stringify(j));
    console.error("Sık sebep: servis hesabı e-postası GSC mülküne kullanıcı olarak eklenmemiş (kurulum adım 6).");
    process.exit(3);
  }
  return j.access_token;
}

async function api(jeton, url, govde, metod = "POST") {
  const r = await fetch(url, {
    method: metod,
    headers: { authorization: `Bearer ${jeton}`, "content-type": "application/json" },
    body: govde ? JSON.stringify(govde) : undefined,
  });
  if (r.status === 204) return {};
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`${r.status}: ${JSON.stringify(j).slice(0, 300)}`);
  return j;
}

async function denetle(jeton, url) {
  const j = await api(jeton, "https://searchconsole.googleapis.com/v1/urlInspection/index:inspect", {
    inspectionUrl: url,
    siteUrl: MULK,
  });
  const s = j.inspectionResult?.indexStatusResult || {};
  return {
    url,
    hukum: s.verdict || "?",              // PASS = dizinde
    kapsam: s.coverageState || "?",       // ör. "Keşfedildi - şu anda dizine eklenmiş değil"
    sonTarama: s.lastCrawlTime || "-",
    canonical: s.googleCanonical || "-",
  };
}

const [, , komut, ...arg] = process.argv;

if (komut === "denetle") {
  if (!arg.length) { console.error("URL ver."); process.exit(1); }
  const jeton = await erisimJetonu();
  for (const u of arg) {
    const s = await denetle(jeton, u);
    console.log(`${s.hukum === "PASS" ? "DİZİNDE" : "DIŞARIDA"}\t${s.kapsam}\t${s.url}\tson tarama: ${s.sonTarama}`);
  }
} else if (komut === "denetle-dosya") {
  const [dosya, cikti] = arg;
  const urller = readFileSync(dosya, "utf8").split("\n").map(x => x.trim()).filter(x => x.startsWith("http"));
  const jeton = await erisimJetonu();
  const satirlar = [];
  for (let i = 0; i < urller.length; i++) {
    try {
      const s = await denetle(jeton, urller[i]);
      // sonTarama sütunu 24.08'de eklendi: "dizinde ama BAYAT" ile "dizinde ve
      // taze" ayrımı ilk-3 teşhisinin belkemiği; tek-URL komutunda vardı, burada yoktu.
      satirlar.push(`${s.url}\t${s.hukum === "PASS" ? "MEVCUT" : "YOK"}\t${s.kapsam}\t${s.sonTarama}`);
      console.error(`${i + 1}/${urller.length} ${s.hukum} ${s.url}`);
    } catch (e) {
      satirlar.push(`${urller[i]}\tHATA\t${e.message}`);
      console.error(`${i + 1}/${urller.length} HATA ${e.message}`);
      if (String(e).includes("429")) { console.error("Kota/hız sınırı — duruldu."); break; }
    }
    await new Promise(r => setTimeout(r, 300)); // dakikalık hız sınırına takılma
  }
  const hedef = cikti || "denetim-api.tsv";
  writeFileSync(hedef, satirlar.join("\n") + "\n");
  console.log(`yazıldı: ${hedef} (${satirlar.length} satır)`);
} else if (komut === "sorgular") {
  const gun = parseInt(arg[0] || "28", 10);
  const bitis = new Date(); bitis.setDate(bitis.getDate() - 2); // GSC ~2 gün geriden gelir
  const baslangic = new Date(bitis); baslangic.setDate(baslangic.getDate() - gun);
  const f = (d) => d.toISOString().slice(0, 10);
  const jeton = await erisimJetonu();
  const j = await api(jeton, `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(MULK)}/searchAnalytics/query`, {
    startDate: f(baslangic), endDate: f(bitis), dimensions: ["query"], rowLimit: 1000,
  });
  for (const r of j.rows || []) {
    console.log(`${r.impressions}\t${r.clicks}\t${r.position.toFixed(1)}\t${r.keys[0]}`);
  }
  console.error(`(${(j.rows || []).length} sorgu; sütunlar: gösterim, tık, pozisyon, sorgu)`);
} else if (komut === "sayfalar") {
  // Sayfa boyutunda talep dökümü. Kullanımı: hangi sayfa gerçekten ARANIYOR?
  // 2026-08-20 otopsisi: dizine girmenin tek gerçek ayırıcısı sorgu talebiydi
  // (dizindekilerin medyan gösterimi 79, dizin dışıların 3). Dizin isteği kotası
  // günde ~10 ile sınırlı olduğundan sıra TALEBE göre kurulur — bu komut o
  // sıralamayı üretir (24.08).
  const gun = parseInt(arg[0] || "90", 10);
  const bitis = new Date(); bitis.setDate(bitis.getDate() - 2); // GSC ~2 gün geriden gelir
  const baslangic = new Date(bitis); baslangic.setDate(baslangic.getDate() - gun);
  const f = (d) => d.toISOString().slice(0, 10);
  const jeton = await erisimJetonu();
  const satirlar = [];
  // API sayfa başına 25.000 satır sınırı koyar; 1000'lik dilimlerle tara.
  for (let bas = 0; ; bas += 1000) {
    const j = await api(jeton, `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(MULK)}/searchAnalytics/query`, {
      startDate: f(baslangic), endDate: f(bitis), dimensions: ["page"], rowLimit: 1000, startRow: bas,
    });
    const r = j.rows || [];
    satirlar.push(...r);
    if (r.length < 1000) break;
  }
  for (const r of satirlar) {
    console.log(`${r.impressions}\t${r.clicks}\t${r.position.toFixed(1)}\t${r.keys[0]}`);
  }
  console.error(`(${satirlar.length} sayfa, son ${gun} gün; sütunlar: gösterim, tık, pozisyon, url)`);
} else if (komut === "ozet") {
  /* SONUÇ ÖLÇÜMÜ (31.08 eklendi). Karne bugüne dek yalnız SIRA ölçüyordu; bu
   * komut GERÇEK sonucu getirir: tık, gösterim, TO, ortalama pozisyon — hem
   * dönem toplamı hem haftalık seri hem de bir önceki eş dönemle kıyas.
   * Neden gerekli: 31.08 teşhisinde gösterim ikiye katlanırken TIKLAMANIN
   * gerilediği görüldü; sıra karnesi bu ayrışmayı göremiyor.
   * Kullanım: node scripts/gsc-api.mjs ozet [gün]   (varsayılan 28) */
  const gun = parseInt(arg[0] || "28", 10);
  const bitis = new Date(); bitis.setDate(bitis.getDate() - 2); // GSC ~2 gün geriden gelir
  const baslangic = new Date(bitis); baslangic.setDate(baslangic.getDate() - gun);
  const oncekiBitis = new Date(baslangic); oncekiBitis.setDate(oncekiBitis.getDate() - 1);
  const oncekiBas = new Date(oncekiBitis); oncekiBas.setDate(oncekiBitis.getDate() - gun);
  const f = (d) => d.toISOString().slice(0, 10);
  const jeton = await erisimJetonu();
  const cek = async (b, s2) => {
    const j = await api(jeton, `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(MULK)}/searchAnalytics/query`, {
      startDate: f(b), endDate: f(s2), dimensions: ["date"], rowLimit: 500,
    });
    return j.rows || [];
  };
  const simdi = await cek(baslangic, bitis);
  const onceki = await cek(oncekiBas, oncekiBitis);
  const topla = (rows) => rows.reduce((a, r) => ({
    tik: a.tik + r.clicks, gos: a.gos + r.impressions,
    poz: a.poz + r.position * r.impressions,
  }), { tik: 0, gos: 0, poz: 0 });
  const t1 = topla(simdi), t0 = topla(onceki);
  // Haftalık seri: günleri 7'şerli kovala (en yeni hafta sonda).
  const haftalar = [];
  for (let i = simdi.length; i > 0; i -= 7) {
    const dilim = simdi.slice(Math.max(0, i - 7), i);
    if (!dilim.length) continue;
    const t = topla(dilim);
    haftalar.unshift({ bas: dilim[0].keys[0], tik: t.tik, gos: t.gos,
      poz: t.gos ? +(t.poz / t.gos).toFixed(1) : null });
  }
  const cikti = {
    donem: { bas: f(baslangic), bit: f(bitis), gun },
    simdi: { tik: t1.tik, gos: t1.gos, to: t1.gos ? +(100 * t1.tik / t1.gos).toFixed(2) : 0,
             poz: t1.gos ? +(t1.poz / t1.gos).toFixed(1) : null },
    onceki: { tik: t0.tik, gos: t0.gos, to: t0.gos ? +(100 * t0.tik / t0.gos).toFixed(2) : 0,
              poz: t0.gos ? +(t0.poz / t0.gos).toFixed(1) : null },
    haftalar,
  };
  cikti.degisim = {
    tik: t0.tik ? +(100 * (t1.tik - t0.tik) / t0.tik).toFixed(1) : null,
    gos: t0.gos ? +(100 * (t1.gos - t0.gos) / t0.gos).toFixed(1) : null,
  };
  console.log(JSON.stringify(cikti, null, 1));
} else if (komut === "sitemap-gonder") {
  // Argüman verilmezse ana sitemap; verilirse o yol (ör. sitemap-eski-adresler.xml).
  const jeton = await erisimJetonu();
  const yollar = arg.length ? arg : ["sitemap.xml"];
  for (const y of yollar) {
    const sm = `${MULK}${y.replace(/^\//, "")}`;
    await api(jeton, `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(MULK)}/sitemaps/${encodeURIComponent(sm)}`, null, "PUT");
    console.log(`gönderildi: ${sm}`);
  }
} else {
  console.error("Komutlar: denetle | denetle-dosya | sorgular | sayfalar | sitemap-gonder (üstteki yorum bloğuna bak)");
  process.exit(1);
}
