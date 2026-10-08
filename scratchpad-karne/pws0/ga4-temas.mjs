// Siteden gelen temas — tek okuma (yalnız OKUMA; GA4 Data API runReport, mülk 543052025).
//
// Kullanım:  node ga4-temas.mjs <bas YYYY-MM-DD> <bit YYYY-MM-DD>      → stdout'a TEK JSON
//   Boru hattında: node ga4-temas.mjs <bas> <bit> > $KARNE_SCRATCH/ga4-temas28.json
//   (tik-sonrasi-uret.py dosya yoksa ya da penceresi tutmuyorsa bu betiği kendisi çağırır.)
//
// NEDEN ayrı betik (08.10 denetimi): scripts/ga4-api.mjs "olaylar" yalnız olay ADEDİ verir ve karne
// o adetleri temas diye basıyordu. Dört yanlış okuma çıktı:
//   1. TIK ≠ ZİYARET. 12 telefon + 9 WhatsApp tıkı 15 ayrı ziyaretten geliyordu (aynı ziyaretten 3 telefon
//      tıkı iki kez görüldü). Ev sahibi için sonuç temas eden ZİYARET; burada sessions metriğiyle sayılır.
//   2. form_start ana sayfadaki ARAMA KUTUSUNDA da tetikleniyor (<form role=search>). "3 form başlatıldı,
//      hiçbiri gönderilmedi" okuması yanlıştı: üçü de arama kutusuydu. Burada yalnız /ev-degerleme ve
//      /iletisim sayılır; başka sayfadakiler ayrı listelenir.
//   3. Sahibinden çıkışı özel olayla (site_ust_sahibinden → 04.10'dan beri sahibinden_click) sayılıyordu;
//      özel olay 04.10'a kadar yalnız site sayfasının üst düğmesindeydi. Gelişmiş ölçümün yerleşik "click"
//      olayı + linkDomain her dönemde TEK tanım verir. DİKKAT: yerleşik click özel olayın üst kümesi DEĞİL
//      (07.10'da özel olay 3, click 2) — alt sınır diye okunur. Konum kırılımı yalnız özel olayda var.
//   4. Aynı ölçüm kimliği localhost'ta da olay üretiyor; bütün istekler canlı alan adına süzülür
//      (suzulen_host alanı dışarıda kalanı gösterir — boş olması beklenir, değilse yerel test izidir).
//
// Çıktı alanları (ad DEĞİŞMEZ; tik-sonrasi-uret.py ve karne okur — yeni alan eklenebilir):
//   pencere{bas,bit} · host · oturum{cihaz:n}
//   temas_olay{phone_click,whatsapp_click}           tık adedi
//   temas_oturum{toplam,phone_click,whatsapp_click}  temas eden ziyaret (toplam = ikisinden en az biri)
//   temas_konum[]                                    "olay/konum: N olay, M oturum"
//   form{form_start_form_sayfasinda, form_start_baska_sayfada[], contact_form_submit,
//        form_sayfasi_goruntuleme{toplam,bot_izli,insan_tahmini}}
//   sahibinden_cikis_click{olay,oturum,cihaz{}}      yerleşik click + linkDomain = mağaza
//   sahibinden_ozel_olay{site_ust_sahibinden,sahibinden_click} · sahibinden_ozel_konum[]
//   click_linkdomain[]                               yerleşik click'in bütün dış alan adları (sahibinden, wa.me, harita…)
//   degerleme_cta[] · mobil_ofis_saati{acik,kapali,oran_kapali_bolu_acik} · suzulen_host[]
//
// Bot süzgeci YALNIZ form sayfası görüntülemesinde kullanılır, temas sayılarına dokunmaz. Buluşsaldır:
// her sabah /ev-degerleme'ye inen başsız tarayıcı (1920x10000, ülkesi yok) + Linux masaüstünden gelip
// etkileşim süresi 0 olan görüntülemeler (1280x800 / Linux / ABD kalıbı ilk süzgeçten kaçıyordu).
import { createSign } from "node:crypto";
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const MULK = "543052025";
const HOST = "www.siringayrimenkul.com";
const MAGAZA = "eryamansiringayrimenkul.sahibinden.com";
const FORM_SAYFALARI = ["/ev-degerleme", "/iletisim"];
const TEMAS = ["phone_click", "whatsapp_click"];

const [, , bas, bit] = process.argv;
const TARIH = /^\d{4}-\d{2}-\d{2}$/;
if (!TARIH.test(bas || "") || !TARIH.test(bit || "")) {
  console.error("kullanım: node ga4-temas.mjs <bas YYYY-MM-DD> <bit YYYY-MM-DD>"); process.exit(1);
}

const k = JSON.parse(readFileSync(process.env.GSC_KEY || join(homedir(), ".config", "gsc-servis-anahtari.json"), "utf8"));
const b64u = (s) => Buffer.from(s).toString("base64url");
const simdi = Math.floor(Date.now() / 1000);
const g = b64u(JSON.stringify({ alg: "RS256", typ: "JWT" })) + "." + b64u(JSON.stringify({ iss: k.client_email, scope: "https://www.googleapis.com/auth/analytics.readonly", aud: "https://oauth2.googleapis.com/token", iat: simdi, exp: simdi + 3600 }));
const imza = createSign("RSA-SHA256").update(g).sign(k.private_key, "base64url");
const jeton = (await (await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${g}.${imza}` }) })).json()).access_token;
if (!jeton) { console.error("GA4 jetonu alınamadı"); process.exit(3); }

// --- süzgeç yardımcıları: her istek canlı alan adıyla VE'lenir ---
const esit = (alan, v) => ({ filter: { fieldName: alan, stringFilter: { matchType: "EXACT", value: v } } });
const icinde = (alan, v) => ({ filter: { fieldName: alan, inListFilter: { values: v } } });
const host = esit("hostName", HOST);
const ve = (...e) => ({ andGroup: { expressions: [host, ...e] } });
const olayIn = (...v) => icinde("eventName", v);

// Satırları [boyut1, boyut2, …, metrik1, metrik2, …] dizisi olarak döndürür (metrikler sayı).
async function r(dimensions, metrics, filtre, limit = 5000) {
  const res = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${MULK}:runReport`, {
    method: "POST", headers: { authorization: `Bearer ${jeton}`, "content-type": "application/json" },
    body: JSON.stringify({ dateRanges: [{ startDate: bas, endDate: bit }], dimensions: dimensions.map((name) => ({ name })), metrics: metrics.map((name) => ({ name })), dimensionFilter: filtre, limit }) });
  const j = await res.json();
  if (!res.ok) { console.error(`HTTP ${res.status}: ${(j.error?.message || "").slice(0, 300)}`); process.exit(4); }
  return (j.rows || []).map((x) => [...(x.dimensionValues || []).map((d) => d.value), ...(x.metricValues || []).map((m) => Number(m.value))]);
}
const topla = (satirlar, i) => satirlar.reduce((t, x) => t + x[i], 0);

const cikti = { pencere: { bas, bit }, host: HOST };

// --- oturum (payda) ---
cikti.oturum = Object.fromEntries(await r(["deviceCategory"], ["sessions"], host));

// --- temas: tık adedi ve temas eden ziyaret ---
cikti.temas_olay = { phone_click: 0, whatsapp_click: 0, ...Object.fromEntries(await r(["eventName"], ["eventCount"], ve(olayIn(...TEMAS)))) };
cikti.temas_oturum = {
  // toplam: boyutsuz istek → telefon YA DA WhatsApp tıkı olan ayrık oturum (ikisini toplamak çift sayar)
  toplam: (await r([], ["sessions"], ve(olayIn(...TEMAS))))[0]?.[0] ?? 0,
  phone_click: 0, whatsapp_click: 0,
  ...Object.fromEntries(await r(["eventName"], ["sessions"], ve(olayIn(...TEMAS)))),
};
cikti.temas_konum = (await r(["eventName", "customEvent:konum"], ["eventCount", "sessions"], ve(olayIn(...TEMAS))))
  .sort((a, b) => b[2] - a[2]).map(([e, k2, n, s]) => `${e}/${k2}: ${n} olay, ${s} oturum`);

// --- form: yalnız form sayfalarındaki başlatma + gönderim ---
const fs = await r(["eventName", "pagePath"], ["eventCount"], ve(olayIn("form_start", "contact_form_submit")));
const formSayfa = (p) => FORM_SAYFALARI.includes(p);
cikti.form = {
  form_start_form_sayfasinda: topla(fs.filter((x) => x[0] === "form_start" && formSayfa(x[1])), 2),
  form_start_baska_sayfada: fs.filter((x) => x[0] === "form_start" && !formSayfa(x[1])).map((x) => `${x[1]}: ${x[2]}`),
  contact_form_submit: topla(fs.filter((x) => x[0] === "contact_form_submit"), 2),
};
// Form sayfasını kaç insan gördü (payda).
// Satır: [yol, çözünürlük, ülke, işletim sistemi, cihaz, görüntüleme, etkileşim süresi sn]
const fv = await r(["pagePath", "screenResolution", "country", "operatingSystem", "deviceCategory"], ["screenPageViews", "userEngagementDuration"], ve(icinde("pagePath", FORM_SAYFALARI)));
const bot = (x) => x[1] === "1920x10000" || x[2] === "(not set)" || (x[3] === "Linux" && x[4] === "desktop" && x[6] === 0);
cikti.form.form_sayfasi_goruntuleme = { toplam: topla(fv, 5), bot_izli: topla(fv.filter(bot), 5), insan_tahmini: topla(fv.filter((x) => !bot(x)), 5) };

// --- sahibinden çıkışı: yerleşik click + linkDomain (tek tanım) ve özel olay (konumlu) ---
const magazaTiki = ve(esit("eventName", "click"), esit("linkDomain", MAGAZA));
const sc = await r(["deviceCategory"], ["eventCount", "sessions"], magazaTiki);
cikti.sahibinden_cikis_click = {
  olay: topla(sc, 1),
  // boyutsuz istek: ayrık oturum (bir oturumun tek cihazı olduğu için cihaz satırlarının toplamıyla aynı çıkar)
  oturum: (await r([], ["sessions"], magazaTiki))[0]?.[0] ?? 0,
  cihaz: Object.fromEntries(sc.map((x) => [x[0], x[1]])),
};
const ozel = ve(olayIn("site_ust_sahibinden", "sahibinden_click"));
cikti.sahibinden_ozel_olay = { site_ust_sahibinden: 0, sahibinden_click: 0, ...Object.fromEntries(await r(["eventName"], ["eventCount"], ozel)) };
cikti.sahibinden_ozel_konum = (await r(["eventName", "customEvent:konum"], ["eventCount", "sessions"], ozel))
  .sort((a, b) => b[2] - a[2]).map(([e, k2, n, s]) => ({ olay: e, konum: k2, n, oturum: s }));
// Yerleşik click'in bütün dış alan adları: sahibinden dışındaki çıkışlar (wa.me, harita…) da görünsün.
cikti.click_linkdomain = (await r(["linkDomain"], ["eventCount", "sessions"], ve(esit("eventName", "click"))))
  .sort((a, b) => b[1] - a[1]).map(([alan, olay, oturum]) => ({ alan, olay, oturum }));

cikti.degerleme_cta = (await r(["customEvent:konum"], ["eventCount"], ve(olayIn("degerleme_cta")))).map(([k2, n]) => `${k2}: ${n}`);

// --- mobilde ofis AÇIK / KAPALI saat (Pzt–Cmt 09–19, Pazar 09–17; mülk saati Europe/Istanbul) ---
const acik = (dow, h) => h >= 9 && h < (dow === 0 ? 17 : 19); // GA4 dayOfWeek: 0 = Pazar
const so = await r(["dayOfWeek", "hour"], ["sessions", "engagedSessions"], ve(esit("deviceCategory", "mobile")));
const st = await r(["dayOfWeek", "hour", "eventName"], ["sessions", "eventCount"], ve(esit("deviceCategory", "mobile"), olayIn(...TEMAS)));
const T = { acik: { oturum: 0, etkilesimli: 0, phone_click: 0, whatsapp_click: 0 }, kapali: { oturum: 0, etkilesimli: 0, phone_click: 0, whatsapp_click: 0 } };
for (const [d, h, s, e] of so) { const a = acik(+d, +h) ? "acik" : "kapali"; T[a].oturum += s; T[a].etkilesimli += e; }
for (const [d, h, ev, s] of st) T[acik(+d, +h) ? "acik" : "kapali"][ev] += s; // gün × saat × olay satırındaki oturum
for (const a of ["acik", "kapali"]) {
  const t = T[a];
  t.temas_oturum_yaklasik = t.phone_click + t.whatsapp_click; // aynı ziyarette iki olay türü varsa iki kez sayılır
  t.temas_100 = +(100 * t.temas_oturum_yaklasik / (t.oturum || 1)).toFixed(2);
}
T.oran_kapali_bolu_acik = +(T.kapali.temas_100 / (T.acik.temas_100 || 1)).toFixed(2);
cikti.mobil_ofis_saati = T;

// --- süzgecin dışarıda bıraktığı: canlı alan adı dışındaki oturum ve olaylar (teşhis) ---
const disi = { notExpression: host };
const dh = await r(["hostName"], ["sessions", "eventCount"], disi);
const izlenen = olayIn(...TEMAS, "form_start", "contact_form_submit", "site_ust_sahibinden", "sahibinden_click", "degerleme_cta");
const de = await r(["hostName", "eventName"], ["eventCount"], { andGroup: { expressions: [disi, izlenen] } });
cikti.suzulen_host = dh.map(([ad, oturum, olay]) => ({ ad, oturum, olay, izlenen_olaylar: Object.fromEntries(de.filter((x) => x[0] === ad).map((x) => [x[1], x[2]])) }));

console.log(JSON.stringify(cikti, null, 1));
