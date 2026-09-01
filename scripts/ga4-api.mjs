/**
 * GA4 Data API — tıktan SONRA ne oluyor? (etkileşim, hemen çıkma, phone_click)
 *
 * Neden: Karne sıra + GSC tık/TO gösteriyor; GA4 "gelen 20 saniye kalıp çıkıyor"
 * diyor ve o rakam karneye akmıyor. Bu betik aynı servis hesabıyla (GSC ile
 * aynı anahtar) GA4 mülkünden sayfa ailesi bazında etkileşim çeker.
 *
 * ÖN KOŞUL (01.09 itibarıyla AÇIK DEĞİL — 403):
 *   1. GCP projesinde Analytics Data API etkinleştirilecek:
 *      https://console.developers.google.com/apis/api/analyticsdata.googleapis.com/overview?project=2958258419
 *   2. GA4 mülkü 543052025'e servis hesabı e-postası "Görüntüleyici" olarak eklenecek
 *      (Yönetici → Mülk erişim yönetimi → Ekle): anahtar dosyasındaki client_email.
 *
 * Kullanım:
 *   node scripts/ga4-api.mjs ozet [gün=28]     # etkin kullanıcı, etkileşim süresi, hemen çıkma, phone_click
 *   node scripts/ga4-api.mjs aile [gün=28]     # sayfa AİLESİ bazında (site/ada/mahalle/etap/yazı/diğer)
 *   node scripts/ga4-api.mjs sayfalar [gün=28] # sayfa bazında, görüntülemeye göre
 *   node scripts/ga4-api.mjs olaylar [gün=28]  # olay adı bazında sayılar
 */
import { createSign } from "node:crypto";
import { readFileSync, existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const MULK = "543052025";
const ANAHTAR_YOLU = process.env.GSC_KEY || join(homedir(), ".config", "gsc-servis-anahtari.json");
const b64u = (s) => Buffer.from(s).toString("base64url");

async function jeton() {
  if (!existsSync(ANAHTAR_YOLU)) { console.error(`Anahtar yok: ${ANAHTAR_YOLU}`); process.exit(2); }
  const k = JSON.parse(readFileSync(ANAHTAR_YOLU, "utf8"));
  const now = Math.floor(Date.now() / 1000);
  const govde = b64u(JSON.stringify({ alg: "RS256", typ: "JWT" })) + "." + b64u(JSON.stringify({
    iss: k.client_email, scope: "https://www.googleapis.com/auth/analytics.readonly",
    aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600 }));
  const imza = createSign("RSA-SHA256").update(govde).sign(k.private_key, "base64url");
  const r = await fetch("https://oauth2.googleapis.com/token", { method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${govde}.${imza}` }) });
  const j = await r.json();
  if (!j.access_token) { console.error("Jeton alınamadı:", JSON.stringify(j).slice(0, 300)); process.exit(3); }
  return j.access_token;
}

async function rapor(govde) {
  const t = await jeton();
  const r = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${MULK}:runReport`, {
    method: "POST", headers: { authorization: `Bearer ${t}`, "content-type": "application/json" },
    body: JSON.stringify(govde) });
  const j = await r.json();
  if (!r.ok) {
    const m = j.error?.message || "";
    if (/has not been used|is disabled/.test(m)) console.error("Analytics Data API projede KAPALI — üstteki 1. adım.");
    else if (r.status === 403) console.error("Servis hesabının GA4 mülküne erişimi yok — üstteki 2. adım.");
    console.error(`HTTP ${r.status}: ${m.slice(0, 200)}`); process.exit(4);
  }
  return j;
}

function aile(yol) {
  if (yol === "/" ) return "ana sayfa";
  if (yol.includes("/adalar/")) return "ada";
  if (yol.includes("/etaplar/")) return "etap";
  if (yol.startsWith("/blog/")) return "yazı";
  if (/^\/mahalleler\/[^/]+\/[^/]+\/?$/.test(yol)) return "site";
  if (/^\/mahalleler\/[^/]+\/?$/.test(yol)) return "mahalle";
  return "diğer";
}

const [, , komut = "ozet", gunArg = "28"] = process.argv;
const gun = String(parseInt(gunArg, 10) || 28);
const tarih = [{ startDate: `${gun}daysAgo`, endDate: "yesterday" }];

if (komut === "ozet") {
  const j = await rapor({ dateRanges: tarih,
    metrics: [{ name: "activeUsers" }, { name: "sessions" }, { name: "averageSessionDuration" },
              { name: "bounceRate" }, { name: "engagementRate" }, { name: "eventCount" }, { name: "screenPageViews" }] });
  const v = (j.rows?.[0]?.metricValues || []).map((x) => Number(x.value));
  const [kul, oturum, sure, hemen, etk, olay, gor] = v;
  const tel = await rapor({ dateRanges: tarih, metrics: [{ name: "eventCount" }],
    dimensionFilter: { filter: { fieldName: "eventName", stringFilter: { value: "phone_click" } } }, dimensions: [{ name: "eventName" }] });
  const telSay = Number(tel.rows?.[0]?.metricValues?.[0]?.value || 0);
  console.log(JSON.stringify({ gun: Number(gun), kullanici: kul, oturum, gorunum: gor, ort_sure_sn: Math.round(sure),
    hemen_cikma: +(hemen * 100).toFixed(1), etkilesim_orani: +(etk * 100).toFixed(1), olay, phone_click: telSay,
    tel_oturum_basina: oturum ? +(telSay / oturum).toFixed(3) : null }));
} else if (komut === "aile" || komut === "sayfalar") {
  const j = await rapor({ dateRanges: tarih, dimensions: [{ name: "pagePath" }],
    metrics: [{ name: "screenPageViews" }, { name: "sessions" }, { name: "averageSessionDuration" }, { name: "bounceRate" }, { name: "eventCount" }],
    limit: 5000 });
  const rows = (j.rows || []).map((r) => ({ yol: r.dimensionValues[0].value, v: r.metricValues.map((x) => Number(x.value)) }));
  if (komut === "sayfalar") {
    rows.sort((a, b) => b.v[0] - a.v[0]);
    for (const r of rows) console.log([r.v[0], r.v[1], Math.round(r.v[2]), (r.v[3] * 100).toFixed(0), r.v[4], r.yol].join("\t"));
  } else {
    const t = {};
    for (const r of rows) {
      const a = aile(r.yol); const o = (t[a] ||= { sayfa: 0, gor: 0, oturum: 0, sureXot: 0, hemenXot: 0, olay: 0 });
      o.sayfa++; o.gor += r.v[0]; o.oturum += r.v[1]; o.sureXot += r.v[2] * r.v[1]; o.hemenXot += r.v[3] * r.v[1]; o.olay += r.v[4];
    }
    const cikti = Object.entries(t).map(([a, o]) => ({ aile: a, sayfa: o.sayfa, goruntuleme: o.gor, oturum: o.oturum,
      ort_sure_sn: o.oturum ? Math.round(o.sureXot / o.oturum) : 0, hemen_cikma: o.oturum ? +((o.hemenXot / o.oturum) * 100).toFixed(1) : 0, olay: o.olay }))
      .sort((a, b) => b.oturum - a.oturum);
    console.log(JSON.stringify({ gun: Number(gun), aileler: cikti }, null, 1));
  }
} else if (komut === "olaylar") {
  const j = await rapor({ dateRanges: tarih, dimensions: [{ name: "eventName" }], metrics: [{ name: "eventCount" }], limit: 100 });
  for (const r of j.rows || []) console.log(`${r.metricValues[0].value}\t${r.dimensionValues[0].value}`);
} else {
  console.error("Komutlar: ozet | aile | sayfalar | olaylar  [gün]");
}
