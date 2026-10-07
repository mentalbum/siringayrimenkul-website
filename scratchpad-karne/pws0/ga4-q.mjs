// GA4 Data API — GÜNLÜK ham çekim (anlik-goruntu-uret.py'nin geri doldurması için).
//
// Neden ayrı betik: scripts/ga4-api.mjs yalnız "N gün önce → dün" penceresi bilir;
// "geçen hafta 28 günlük değer neydi" sorusu için tarih aralığı gerekiyor. Kümülatif
// pencereleri (7/14/21/28) birbirinden çıkarmak da olurdu ama ga4-api çıktıyı
// yuvarlıyor (süre tam saniye, hemen çıkma 0,1) ve çıkarma bu yuvarlamayı büyütür.
// Günlük satır alınca 28 günlük kayan pencere her gün için TAM hesaplanır:
//   oturum          = Σ günlük oturum
//   ort. süre       = Σ(gün ort. süre × gün oturum) / Σ oturum
//   hemen çıkma     = Σ(gün hemen çıkma × gün oturum) / Σ oturum
// gsc-q.mjs ile aynı anahtar ve aynı çağrı biçimi.
//
// Kullanım:
//   node ga4-q.mjs <bas> <bit> gunluk   → tarih  oturum  ort_sure_sn  hemen_cikma  goruntuleme
//   node ga4-q.mjs <bas> <bit> kanal    → tarih  kanal  cihaz  oturum   (07.10, hatirlanirlik-uret.py)
//   node ga4-q.mjs <bas> <bit> olaylar  → tarih  olay_adi  sayi   (phone_click, whatsapp_click, form_start, contact_form_submit)
import { createSign } from "node:crypto";
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
const MULK = "543052025";
const k = JSON.parse(readFileSync(process.env.GSC_KEY || join(homedir(), ".config", "gsc-servis-anahtari.json"), "utf8"));
const b64u = (s) => Buffer.from(s).toString("base64url");
const simdi = Math.floor(Date.now() / 1000);
const govde = b64u(JSON.stringify({ alg: "RS256", typ: "JWT" })) + "." + b64u(JSON.stringify({ iss: k.client_email, scope: "https://www.googleapis.com/auth/analytics.readonly", aud: "https://oauth2.googleapis.com/token", iat: simdi, exp: simdi + 3600 }));
const imza = createSign("RSA-SHA256").update(govde).sign(k.private_key, "base64url");
const tr = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${govde}.${imza}` }) });
const jeton = (await tr.json()).access_token;
if (!jeton) { console.error("GA4 jetonu alınamadı"); process.exit(3); }
const [, , bas, bit, komut = "gunluk"] = process.argv;
const tarih = [{ startDate: bas, endDate: bit }];
async function rapor(govde) {
  const r = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${MULK}:runReport`, { method: "POST", headers: { authorization: `Bearer ${jeton}`, "content-type": "application/json" }, body: JSON.stringify(govde) });
  const j = await r.json();
  if (!r.ok) { console.error(`HTTP ${r.status}: ${(j.error?.message || "").slice(0, 300)}`); process.exit(4); }
  return j;
}
const gun = (s) => `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`; // GA4 tarihi YYYYMMDD verir
if (komut === "gunluk") {
  const j = await rapor({ dateRanges: tarih, dimensions: [{ name: "date" }],
    metrics: [{ name: "sessions" }, { name: "averageSessionDuration" }, { name: "bounceRate" }, { name: "screenPageViews" }],
    orderBys: [{ dimension: { dimensionName: "date" } }], limit: 400 });
  for (const r of j.rows || []) {
    const v = r.metricValues.map((x) => Number(x.value));
    console.log([gun(r.dimensionValues[0].value), v[0], v[1].toFixed(2), (v[2] * 100).toFixed(2), v[3]].join("\t"));
  }
  console.error(`(${(j.rows || []).length} gün)`);
} else if (komut === "olaylar") {
  const j = await rapor({ dateRanges: tarih, dimensions: [{ name: "date" }, { name: "eventName" }], metrics: [{ name: "eventCount" }],
    dimensionFilter: { filter: { fieldName: "eventName", inListFilter: { values: ["phone_click", "whatsapp_click", "form_start", "contact_form_submit"] } } },
    orderBys: [{ dimension: { dimensionName: "date" } }], limit: 2000 });
  for (const r of j.rows || []) console.log([gun(r.dimensionValues[0].value), r.dimensionValues[1].value, r.metricValues[0].value].join("\t"));
  console.error(`(${(j.rows || []).length} satır)`);
} else if (komut === "kanal") {
  // 07.10: hatırlanırlık bölümü için — tarih  kanal  cihaz  oturum (sessionDefaultChannelGroup × deviceCategory)
  const j = await rapor({ dateRanges: tarih, dimensions: [{ name: "date" }, { name: "sessionDefaultChannelGroup" }, { name: "deviceCategory" }],
    metrics: [{ name: "sessions" }], orderBys: [{ dimension: { dimensionName: "date" } }], limit: 10000 });
  for (const r of j.rows || []) console.log([gun(r.dimensionValues[0].value), r.dimensionValues[1].value, r.dimensionValues[2].value, r.metricValues[0].value].join("\t"));
  console.error(`(${(j.rows || []).length} satır)`);
} else {
  console.error("Komutlar: gunluk | olaylar | kanal  <bas> <bit>"); process.exit(1);
}
