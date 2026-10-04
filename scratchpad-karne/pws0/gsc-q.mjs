// GSC Search Analytics ham çekimi — karne üreticilerinin yardımcısı.
// Kullanım: node gsc-q.mjs <bas> <bit> <dims:virgüllü> [filtre]
//   filtre biçimi: "boyut::operator::ifade"  (ör. page::excludingRegex::/mahalleler/(ata|susuz)/ )
// Çıktı: TSV satırları  gösterim \t tık \t konum(2 ondalık) \t boyut1 [\t boyut2 ...]
// Oturum scratchpad'i silinince kaybolmasın diye depoda (pws0) durur (04.10 dersi).
import { createSign } from "node:crypto";
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
const [bas, bit, dims, filtre] = process.argv.slice(2);
if (!bas || !bit || !dims) { console.error("kullanım: gsc-q.mjs <bas> <bit> <dims> [boyut::op::ifade]"); process.exit(2); }
const MULK = "https://www.siringayrimenkul.com/";
const k = JSON.parse(readFileSync(process.env.GSC_KEY || join(homedir(), ".config", "gsc-servis-anahtari.json"), "utf8"));
const b64u = (s) => Buffer.from(s).toString("base64url");
const simdi = Math.floor(Date.now() / 1000);
const govde = b64u(JSON.stringify({ alg: "RS256", typ: "JWT" })) + "." + b64u(JSON.stringify({ iss: k.client_email, scope: "https://www.googleapis.com/auth/webmasters", aud: "https://oauth2.googleapis.com/token", iat: simdi, exp: simdi + 3600 }));
const imza = createSign("RSA-SHA256").update(govde).sign(k.private_key, "base64url");
const tr = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${govde}.${imza}` }) });
const jeton = (await tr.json()).access_token;
if (!jeton) { console.error("jeton alınamadı"); process.exit(1); }
const SA = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(MULK)}/searchAnalytics/query`;
let startRow = 0; const SAYFA = 25000;
while (true) {
  const body = { startDate: bas, endDate: bit, dimensions: dims.split(","), rowLimit: SAYFA, startRow };
  if (filtre) { const [dimension, operator, expression] = filtre.split("::"); body.dimensionFilterGroups = [{ filters: [{ dimension, operator, expression }] }]; }
  const r = await fetch(SA, { method: "POST", headers: { authorization: `Bearer ${jeton}`, "content-type": "application/json" }, body: JSON.stringify(body) });
  const j = await r.json();
  if (!r.ok) { console.error(JSON.stringify(j).slice(0, 500)); process.exit(1); }
  const rows = j.rows || [];
  for (const row of rows) console.log([row.impressions, row.clicks, row.position.toFixed(2), ...row.keys].join("\t"));
  if (rows.length < SAYFA) break; startRow += SAYFA;
}
