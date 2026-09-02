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
 *   node scripts/gsc-api.mjs ozet [gün=28]               # performans: tık/gösterim/TO/konum + haftalık seri
 *   node scripts/gsc-api.mjs pencere [gün=28]            # GSC'nin son veri günü ve N veri günlük pencere (JSON)
 *
 * PENCERE KURALI (02.09 denetimi; sorgular / sayfalar / ozet / pencere aynı kuralı kullanır):
 *   son veri günü = GSC'nin date boyutunda satır döndürdüğü EN SON gün (bugün−2 ya da −3
 *                   diye varsayılmaz, sorulur);
 *   pencere       = son veri günü dahil geriye N VERİ günü (satırı olan gün sayılır).
 *   sorgular/sayfalar TSV'nin İLK satırına "# pencere<TAB>bas<TAB>bit<TAB>gün" yazar,
 *   ozet JSON'a pencere/onceki_pencere/son_veri_gunu koyar — üreticiler pencereyi buradan okur.
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

const SA = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(MULK)}/searchAnalytics/query`;

/* PENCERE KURALI — neden değişti (02.09 denetimi):
 * Eski kod bitişi "bugün−2" varsayıp başlangıcı "bitiş−gün" alıyordu. İki hata:
 *  1) 28 istenince 29 TAKVİM günü isteniyordu; GSC'nin son günü çoğu zaman bugün−3
 *     olduğundan veri günü sayısı rastgele 28 ya da 29 çıkıyordu (02.09 01:12 çekimi
 *     02.08–30.08 = 29 veri günü; karne "28 gün" yazıyordu).
 *  2) toISOString() UTC'dir: Türkiye'de 00:00–03:00 arası "bugün" bir gün geri
 *     kayıyordu — gecelik görev (02:34) tam bu banda düşüyor.
 * Şimdi: date boyutu sorulur, satırı olan günlerin SONUNCUSU son veri günüdür,
 * pencere oradan geriye N veri günüdür. Takvim değil VERİ günü sayılır. */
const yerelTarih = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

async function veriGunleri(jeton, kacGun) {
  // Son kacGun takvim gününün date boyutu: yalnız veri olan günler döner, artan sırada.
  const bugun = new Date();
  const bas = new Date(bugun); bas.setDate(bas.getDate() - kacGun);
  const j = await api(jeton, SA, {
    startDate: yerelTarih(bas), endDate: yerelTarih(bugun), dimensions: ["date"], rowLimit: 500,
  });
  return (j.rows || []).sort((a, b) => (a.keys[0] < b.keys[0] ? -1 : 1));
}

function pencere(gunler, gun, geri = 0) {
  // Sondan `geri` veri günü atlayıp `gun` veri günü al (geri>0: önceki dönem).
  // Yeterli gün yoksa eldeki kadar — gun alanı GERÇEK sayıyı taşır, istenen değil.
  const son = gunler.length - geri;
  const dilim = gunler.slice(Math.max(0, son - gun), Math.max(0, son));
  if (!dilim.length) return null;
  return { bas: dilim[0].keys[0], bit: dilim[dilim.length - 1].keys[0], gun: dilim.length, satirlar: dilim };
}

// Pencere için geriye ne kadar bakılır: N veri günü + GSC gecikmesi (2-3 gün) + pay.
const PAY = 14;

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
      // canonical sütunu 31.08'de eklendi: denetle() bu alanı hep çekiyordu ama
      // hiçbir çıktı basmıyordu. Ada sayfası kararının dayanağı tam da bu —
      // Google'ın SEÇTİĞİ canonical site sayfası mı, yoksa ada sayfasının
      // kendisi mi (yani 03.08 canonical'ı yutuldu mu)?
      satirlar.push(`${s.url}\t${s.hukum === "PASS" ? "MEVCUT" : "YOK"}\t${s.kapsam}\t${s.sonTarama}\t${s.canonical}`);
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
  const jeton = await erisimJetonu();
  const p = pencere(await veriGunleri(jeton, gun + PAY), gun);
  if (!p) { console.error("GSC hiç veri günü döndürmedi; pencere kurulamadı"); process.exit(4); }
  const j = await api(jeton, SA, { startDate: p.bas, endDate: p.bit, dimensions: ["query"], rowLimit: 1000 });
  // İlk satır pencere başlığı: pencere veriyle aynı dosyada gezsin diye. Tüketiciler
  // (sorgu-sinifi-to.py vb.) ilk sütunu int()'e çeviremeyince satırı zaten atlar.
  console.log(`# pencere\t${p.bas}\t${p.bit}\t${p.gun}`);
  for (const r of j.rows || []) {
    console.log(`${r.impressions}\t${r.clicks}\t${r.position.toFixed(1)}\t${r.keys[0]}`);
  }
  console.error(`(${(j.rows || []).length} sorgu; pencere ${p.bas}–${p.bit}, ${p.gun} veri günü; sütunlar: gösterim, tık, pozisyon, sorgu)`);
} else if (komut === "sayfalar") {
  // Sayfa boyutunda talep dökümü. Kullanımı: hangi sayfa gerçekten ARANIYOR?
  // 2026-08-20 otopsisi: dizine girmenin tek gerçek ayırıcısı sorgu talebiydi
  // (dizindekilerin medyan gösterimi 79, dizin dışıların 3). Dizin isteği kotası
  // günde ~10 ile sınırlı olduğundan sıra TALEBE göre kurulur — bu komut o
  // sıralamayı üretir (24.08).
  const gun = parseInt(arg[0] || "90", 10);
  const jeton = await erisimJetonu();
  const p = pencere(await veriGunleri(jeton, gun + PAY), gun);
  if (!p) { console.error("GSC hiç veri günü döndürmedi; pencere kurulamadı"); process.exit(4); }
  const satirlar = [];
  // API sayfa başına 25.000 satır sınırı koyar; 1000'lik dilimlerle tara.
  for (let bas = 0; ; bas += 1000) {
    const j = await api(jeton, SA, {
      startDate: p.bas, endDate: p.bit, dimensions: ["page"], rowLimit: 1000, startRow: bas,
    });
    const r = j.rows || [];
    satirlar.push(...r);
    if (r.length < 1000) break;
  }
  console.log(`# pencere\t${p.bas}\t${p.bit}\t${p.gun}`); // ilk satır: pencere başlığı (sorgular ile aynı)
  for (const r of satirlar) {
    console.log(`${r.impressions}\t${r.clicks}\t${r.position.toFixed(1)}\t${r.keys[0]}`);
  }
  console.error(`(${satirlar.length} sayfa; pencere ${p.bas}–${p.bit}, ${p.gun} veri günü; sütunlar: gösterim, tık, pozisyon, url)`);
} else if (komut === "ozet") {
  /* SONUÇ ÖLÇÜMÜ (31.08 eklendi). Karne bugüne dek yalnız SIRA ölçüyordu; bu
   * komut GERÇEK sonucu getirir: tık, gösterim, TO, ortalama pozisyon — hem
   * dönem toplamı hem haftalık seri hem de bir önceki eş dönemle kıyas.
   * Neden gerekli: 31.08 teşhisinde gösterim ikiye katlanırken TIKLAMANIN
   * gerilediği görüldü; sıra karnesi bu ayrışmayı göremiyor.
   * Kullanım: node scripts/gsc-api.mjs ozet [gün]   (varsayılan 28) */
  const gun = parseInt(arg[0] || "28", 10);
  const jeton = await erisimJetonu();
  // Tek date çekimi iki dönemi de verir: son N veri günü "şimdi", ondan önceki N "önceki".
  const gunler = await veriGunleri(jeton, 2 * gun + PAY);
  const p1 = pencere(gunler, gun);
  if (!p1) { console.error("GSC hiç veri günü döndürmedi; pencere kurulamadı"); process.exit(4); }
  const p0 = pencere(gunler, gun, p1.gun);
  const simdi = p1.satirlar;
  const onceki = p0 ? p0.satirlar : [];
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
    son_veri_gunu: p1.bit,
    pencere: { bas: p1.bas, bit: p1.bit, gun: p1.gun },
    onceki_pencere: p0 ? { bas: p0.bas, bit: p0.bit, gun: p0.gun } : null,
    // "donem" eski ad; karne-html.py donem.gun okuyor, pencere ile aynı değerler.
    donem: { bas: p1.bas, bit: p1.bit, gun: p1.gun },
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
} else if (komut === "pencere") {
  // Kuralı elden denetlemek için: bugün, GSC'nin son veri günü, gecikme ve N veri günlük pencere.
  const gun = parseInt(arg[0] || "28", 10);
  const jeton = await erisimJetonu();
  const p = pencere(await veriGunleri(jeton, gun + PAY), gun);
  const bugun = yerelTarih(new Date());
  const gecikme = p ? Math.round((Date.parse(bugun) - Date.parse(p.bit)) / 86400000) : null;
  console.log(JSON.stringify({
    bugun, son_veri_gunu: p ? p.bit : null, gecikme_gun: gecikme,
    pencere: p ? { bas: p.bas, bit: p.bit, gun: p.gun } : null,
  }));
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
  console.error("Komutlar: denetle | denetle-dosya | sorgular | sayfalar | ozet | pencere | sitemap-gonder (üstteki yorum bloğuna bak)");
  process.exit(1);
}
