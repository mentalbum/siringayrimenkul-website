// Bölge turu: Ankara'nın farklı noktalarından uule (GPS) ile pws=0 SERP ölçümü.
// Local Falcon'un yaptığı işin ücretsiz karşılığı — konum sinyali uule ile verilir,
// her nokta için ayrı IP GEREKMEZ (Google konumu bildirilen koordinattan okur).
// Konteyner kanalından çalışır; Özgün'ün ev kanalını (günlük ~370 sınırı) HİÇ kullanmaz.
// Protokol kuralları geçerli: reCAPTCHA/sorry görülürse ÇÖZMEDEN dur, o ölçüm diske yazılmaz.
// İki kip:
//   node bolge-tur.mjs --listele   → taze uule'li 14 URL + ölçüm JS'ini basar (uygulama içi
//                                    tarayıcıyla elle/gece turu için; playwright GEREKMEZ).
//                                    uule zaman damgası taşıdığı için URL'ler HER TURDA yeniden üretilir.
//   PW_KOK=<playwright-core kurulu dizin> node bolge-tur.mjs [MAX=n] → kendi Chromium'uyla sürer.
//     NOT 23.08: konteynerden denendi, çıkış politikası google.com'u 403'lüyor — bu kip ancak
//     google.com'a çıkışı olan bir ortamda işe yarar. Tekrar deneyip vakit yakma.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(DIR, 'sonuclar-bolge.jsonl');
const BUGUN = new Date().toISOString().slice(0, 10);
const MAX = Number(process.env.MAX || Infinity);

const TUM_NOKTALAR = [
  { n: 'eryaman',   lat: 39.9779, lng: 32.6382 }, // Eryaman merkez (metro civarı)
  { n: 'etimesgut', lat: 39.9587, lng: 32.6866 },
  { n: 'sincan',    lat: 39.9666, lng: 32.5786 },
  { n: 'batikent',  lat: 39.9694, lng: 32.7316 },
  { n: 'kizilay',   lat: 39.9208, lng: 32.8541 },
  { n: 'kecioren',  lat: 39.9871, lng: 32.8639 },
  { n: 'mamak',     lat: 39.9382, lng: 32.9126 },
  // Bulunabilirlik programı (27.08): Eryaman İÇİ mahalle noktaları — dış/orta
  // halkadan arayanın gördüğü harita kutusunu ölçmek için. Koordinatlar
  // content'teki site kayıtlarının mahalle başına ortalaması.
  { n: 'sehit-osman-avci', lat: 39.9772, lng: 32.6551 }, // 68 kayıt ort.
  { n: 'seker',            lat: 39.9667, lng: 32.6557 }, // 16 kayıt ort.
  { n: 'goksu',            lat: 39.9940, lng: 32.6431 }, // 68 kayıt ort.
  { n: 'altay',            lat: 39.9690, lng: 32.6437 }, // 26 kayıt ort.
  { n: 'yesilova',         lat: 39.9650, lng: 32.6102 }, // 23 kayıt ort.
  { n: 'guzelkent',        lat: 39.9902, lng: 32.6105 }, // 80 kayıt ort. (1 koordinatsız hariç)
];
const NOKTA_SUZ = process.env.BOLGE_NOKTALAR
  ? new Set(process.env.BOLGE_NOKTALAR.split(',').map((s) => s.trim()))
  : null;
const NOKTALAR = NOKTA_SUZ ? TUM_NOKTALAR.filter((n) => NOKTA_SUZ.has(n.n)) : TUM_NOKTALAR;
// Varsayılan tur: Özgün'ün 23.08 isteği. Başka bir sorgu kümesini aynı uule
// altyapısıyla ölçmek için (24.08): BOLGE_SORGULAR="a|b|c" ve istenirse
// BOLGE_NOKTALAR="eryaman,kizilay". Mahalle sorguları ulusal ölçekte belirsiz
// (Cumhuriyet/Göksu/Susuz her ilde var) — yerel görünüm ayrı ölçülmeli.
const SORGULAR = process.env.BOLGE_SORGULAR
  ? process.env.BOLGE_SORGULAR.split('|').map((s) => s.trim()).filter(Boolean)
  : ['eryaman emlakçı', 'emlakçı'];

function uule(lat, lng) {
  const metin = [
    'role:1', 'producer:12', 'provenance:6',
    `timestamp:${Date.now() * 1000}`,
    'latlng{', `latitude_e7:${Math.round(lat * 1e7)}`, `longitude_e7:${Math.round(lng * 1e7)}`, '}',
    'radius:-1',
  ].join('\n');
  return 'a+' + encodeURIComponent(Buffer.from(metin).toString('base64'));
}

const OLCUM_JS = `(()=>{let N=[...document.querySelectorAll('.dbg0pd')].map(e=>e.innerText.trim());if(!N.length)N=[...document.querySelectorAll('div[role="heading"][aria-level="3"]')].map(e=>e.innerText.trim());const B=N.findIndex(x=>/Şirin/i.test(x));const a=[...document.querySelectorAll('#rso a[href^="http"]')].filter(x=>x.querySelector('h3'));const T=[];const G=new Set();for(const x of a){try{const u=new URL(x.href);const d=u.hostname.replace('www.','');const k=d+u.pathname;if(!G.has(k)){G.add(k);T.push({d,p:u.pathname,t:x.querySelector('h3').innerText})}}catch(e){}}const i=T.findIndex(x=>x.d==='siringayrimenkul.com');const loc=(document.querySelector('.dfB0uf')?.innerText||document.querySelector('#swml')?.innerText||'').slice(0,60);return JSON.stringify({hp:N.length>0,hs:B+1,hl:N.slice(0,6),sira:i+1,u:i>=0?T[i].p:null,bas:i>=0?T[i].t:null,ilk3u:T.slice(0,3).map(x=>x.d+x.p),n:T.length,loc,tt:document.title.slice(0,45)})})()`;

if (process.argv.includes('--listele')) {
  console.log('# Bölge turu URL listesi (taze uule — bu listeyi her turda yeniden üret)');
  console.log('# Sıra: navigate → 4 sn bekle → aşağıdaki JS → JSONL satırını ANINDA sonuclar-bolge.jsonl\'e yaz.');
  console.log('# loc alanı beklenen semti göstermiyorsa uule tutmamış demektir: DUR, not düş.\n');
  for (const nk of NOKTALAR) for (const q of SORGULAR) {
    console.log(`${nk.n} | ${q}`);
    console.log(`https://www.google.com/search?q=${encodeURIComponent(q)}&pws=0&gl=tr&hl=tr&uule=${uule(nk.lat, nk.lng)}`);
  }
  console.log('\n# Ölçüm JS (tek satır):');
  console.log(OLCUM_JS);
  console.log('\n# Kayıt biçimi (JS çıktısındaki tt YAZILMAZ; kanal: "ev"):');
  console.log('{"d":"<bugün>","kanal":"ev","nokta":"<nokta>","lat":N,"lng":N,"q":"<sorgu>",...JS çıktısı}');
  console.log('# sira:0 ise aynı URL + "&start=10" ile 2. sayfaya bakılır, kayda s2sira eklenir (0=orada da yok).');
  process.exit(0);
}

const require = createRequire(process.env.PW_KOK ? path.join(process.env.PW_KOK, 'x.js') : import.meta.url);
const { chromium } = require('playwright-core');

const olculen = new Set(
  fs.existsSync(OUT)
    ? fs.readFileSync(OUT, 'utf8').split('\n').filter(Boolean)
        .map((l) => JSON.parse(l)).filter((r) => r.d === BUGUN)
        .map((r) => r.nokta + '|' + r.q)
    : []
);

const CIKAR = () => {
  let N = [...document.querySelectorAll('.dbg0pd')].map((e) => e.innerText.trim());
  const yedek = N.length === 0;
  if (yedek) N = [...document.querySelectorAll('div[role="heading"][aria-level="3"]')].map((e) => e.innerText.trim());
  const B = N.findIndex((x) => /Şirin/i.test(x));
  const a = [...document.querySelectorAll('#rso a[href^="http"]')].filter((x) => x.querySelector('h3'));
  const T = []; const G = new Set();
  for (const x of a) {
    try {
      const u = new URL(x.href); const d = u.hostname.replace('www.', ''); const k = d + u.pathname;
      if (!G.has(k)) { G.add(k); T.push({ d, p: u.pathname, t: x.querySelector('h3').innerText }); }
    } catch (e) {}
  }
  const i = T.findIndex((x) => x.d === 'siringayrimenkul.com');
  const loc = (document.querySelector('.dfB0uf')?.innerText || document.querySelector('#swml')?.innerText || '').slice(0, 60);
  return {
    hp: N.length > 0, hs: B + 1, hl: N.slice(0, 6), hyedek: yedek,
    sira: i + 1, u: i >= 0 ? T[i].p : null, bas: i >= 0 ? T[i].t : null,
    ilk3u: T.slice(0, 3).map((x) => x.d + x.p), n: T.length,
    tt: document.title.slice(0, 60), loc,
  };
};

const bekle = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium',
  headless: true,
  proxy: { server: process.env.HTTPS_PROXY || 'http://127.0.0.1:45027' },
});
const ctx = await browser.newContext({
  locale: 'tr-TR', timezoneId: 'Europe/Istanbul',
  viewport: { width: 1366, height: 768 },
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',
});
const page = await ctx.newPage();

let yapilan = 0, engel = false;
disari:
for (const nk of NOKTALAR) {
  for (const q of SORGULAR) {
    if (olculen.has(nk.n + '|' + q)) continue;
    if (yapilan >= MAX) break disari;
    const url = `https://www.google.com/search?q=${encodeURIComponent(q)}&pws=0&gl=tr&hl=tr&uule=${uule(nk.lat, nk.lng)}`;
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    } catch (e) {
      console.error(`HATA goto ${nk.n}|${q}: ${e.message.split('\n')[0]}`);
      engel = true; break disari;
    }
    await bekle(3500);
    if (page.url().includes('consent.google.com')) {
      const b = page.locator('button:has-text("Tümünü reddet"), button:has-text("Reject all")').first();
      try { await b.click({ timeout: 5000 }); await bekle(3000); } catch (e) {}
    }
    const title = await page.title();
    if (page.url().includes('/sorry') || /sorry|unusual|olağan dışı|robot/i.test(title)) {
      console.error(`ENGEL: ${nk.n}|${q} — title="${title}" url=${page.url().slice(0, 80)}`);
      engel = true; break disari; // protokol: CAPTCHA çözülmez, ölçüm yazılmaz
    }
    let r;
    try { r = await page.evaluate(CIKAR); } catch (e) { console.error(`HATA js ${nk.n}|${q}: ${e.message}`); continue; }
    if (r.n === 0) {
      await bekle(2500);
      try { r = await page.evaluate(CIKAR); } catch (e) {}
      if (r.n === 0) {
        const hdump = path.join(process.env.HATA_DIZINI || DIR, `bolge-hata-${nk.n}.html`);
        fs.writeFileSync(hdump, await page.content());
        console.error(`BOŞ SERP: ${nk.n}|${q} — title="${r.tt}" → ${hdump}`);
        if (/sorry|unusual|olağan/i.test(r.tt)) { engel = true; break disari; }
      }
    }
    const kayit = { d: BUGUN, kanal: 'konteyner', nokta: nk.n, lat: nk.lat, lng: nk.lng, q, ...r };
    delete kayit.tt;
    fs.appendFileSync(OUT, JSON.stringify(kayit) + '\n');
    console.log(`${nk.n} | ${q} → organik:${r.sira || 'ilk10 dışı'} harita:${r.hp ? (r.hs || 'kutu var, biz yok') : 'kutu yok'} n:${r.n} loc:"${r.loc}"`);
    yapilan++;
    if (yapilan < MAX) await bekle(20000 + Math.random() * 15000); // tempo: sorgu başına 20-35 sn
  }
}
await browser.close();
console.log(`BİTTİ: +${yapilan} ölçüm${engel ? ' — ENGELLE KESİLDİ' : ''}`);
process.exit(engel ? 2 : 0);
