// Bölge turu: Ankara'nın farklı noktalarından uule (GPS) ile pws=0 SERP ölçümü.
// Local Falcon'un yaptığı işin ücretsiz karşılığı — konum sinyali uule ile verilir,
// her nokta için ayrı IP GEREKMEZ (Google konumu bildirilen koordinattan okur).
// Konteyner kanalından çalışır; Özgün'ün ev kanalını (günlük ~370 sınırı) HİÇ kullanmaz.
// Protokol kuralları geçerli: reCAPTCHA/sorry görülürse ÇÖZMEDEN dur, o ölçüm diske yazılmaz.
// Ön ayarlı turlar (07.10): BOLGE_ON_AYAR=cekirdek|halka node bolge-tur.mjs --listele  (aşağıda ON_AYARLAR)
// İki kip:
//   node bolge-tur.mjs --listele   → taze uule'li 14 URL + ölçüm JS'ini basar (uygulama içi
//                                    tarayıcıyla elle/gece turu için; playwright GEREKMEZ).
//                                    uule zaman damgası taşıdığı için URL'ler HER TURDA yeniden üretilir.
//   PW_KOK=<playwright-core kurulu dizin> node bolge-tur.mjs [MAX=n] → kendi Chromium'uyla sürer.
//     NOT 23.08: konteynerden denendi, çıkış politikası google.com'u 403'lüyor — bu kip ancak
//     google.com'a çıkışı olan bir ortamda işe yarar. Tekrar deneyip vakit yakma.
// 08.10 (karne incelemesi ana-3): çıkarıcı alan adını <cite>'tan okur (şifreli `/goto?url=…` bağlarında
//   eski seçici n=0 veriyordu) ve 5'ten az sonuç bulursa {hata:"cikarim", n, tt} döner. O çıktı ve n<5
//   "ilk 10 dışı" DEĞİLDİR; iki kipte de kayıt yazılmaz. Gerçek SERP'te henüz denenmedi (ilk turda n'e bak).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(DIR, 'sonuclar-bolge.jsonl');
// 08.10: tarih İstanbul gününden alınır. Eskiden UTC'den alınıyordu (toISOString): gece 00:00–03:00 arası
// koşan tur bir önceki günün damgasını yazıyor, "bugün ölçülenler" süzgeci de dünün kayıtlarını bugünkü
// sanıp o sorguları atlıyordu. Python ekleyiciler zaten yerel tarih yazıyor. en-CA biçimi = YYYY-AA-GG.
const BUGUN = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Istanbul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
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

// 07.10 "şıp diye bulunma" planı (SIP-DIYE-PLAN-07-10.md §5): 20.10 ve 04.11 okumaları
// her seferinde AYNI sorgu×nokta kümesiyle yapılsın diye ön ayar. Elle env yazınca küme
// oynuyordu (28.08 turu 10 nokta, 07.10 tabanı 1 nokta — yan yana konamadı).
//   BOLGE_ON_AYAR=cekirdek → 10 sorgu: çıplak "emlakçı" + "eryaman emlakçı" (kontrol) +
//                            "emlak ofisi" × merkez/Göksu/Güzelkent, + marka sorgusu (merkez).
//                            20.10 ve 04.11'de; çıplak "emlakçı" organik kaybı kalıcı mı sorusu.
//   BOLGE_ON_AYAR=halka    → 18 sorgu: "emlakçı" + "emlak ofisi" × 28.08 tabanının 8 noktası,
//                            + "eryaman emlakçı" × Sincan/Batıkent. GBP kategori/hizmet
//                            değişikliğinden EN AZ 72 saat sonra; taban kutu #1 3/8 nokta.
// Günlük reCAPTCHA duvarı ~41-60 sorgu: iki ön ayar aynı gün koşulmaz.
// Ön ayar verilince BOLGE_SORGULAR / BOLGE_NOKTALAR yok sayılır.
const ON_AYARLAR = {
  cekirdek: {
    noktalar: ['eryaman', 'goksu', 'guzelkent'],
    sorgular: ['emlakçı', 'eryaman emlakçı', 'emlak ofisi'],
    ek: [['eryaman', 'şirin gayrimenkul']],
  },
  halka: {
    noktalar: ['eryaman', 'sehit-osman-avci', 'seker', 'goksu', 'altay', 'yesilova', 'guzelkent', 'etimesgut'],
    sorgular: ['emlakçı', 'emlak ofisi'],
    ek: [['sincan', 'eryaman emlakçı'], ['batikent', 'eryaman emlakçı']],
  },
};
const ON_AYAR = process.env.BOLGE_ON_AYAR || null;
if (ON_AYAR && !ON_AYARLAR[ON_AYAR]) {
  console.error(`Bilinmeyen BOLGE_ON_AYAR="${ON_AYAR}" — geçerli: ${Object.keys(ON_AYARLAR).join(', ')}`);
  process.exit(1);
}
const noktaBul = (ad) => {
  const nk = TUM_NOKTALAR.find((n) => n.n === ad);
  if (!nk) throw new Error('Tanımsız nokta: ' + ad);
  return nk;
};
// Ölçülecek (nokta, sorgu) çiftleri — iki kip de bu listeyi yürür.
const CIFTLER = ON_AYAR
  ? [
      ...ON_AYARLAR[ON_AYAR].noktalar.flatMap((n) => ON_AYARLAR[ON_AYAR].sorgular.map((q) => ({ nk: noktaBul(n), q }))),
      ...ON_AYARLAR[ON_AYAR].ek.map(([n, q]) => ({ nk: noktaBul(n), q })),
    ]
  : NOKTALAR.flatMap((nk) => SORGULAR.map((q) => ({ nk, q })));

function uule(lat, lng) {
  const metin = [
    'role:1', 'producer:12', 'provenance:6',
    `timestamp:${Date.now() * 1000}`,
    'latlng{', `latitude_e7:${Math.round(lat * 1e7)}`, `longitude_e7:${Math.round(lng * 1e7)}`, '}',
    'radius:-1',
  ].join('\n');
  return 'a+' + encodeURIComponent(Buffer.from(metin).toString('base64'));
}

const OLCUM_JS = `(()=>{let N=[...document.querySelectorAll('.dbg0pd')].map(e=>e.innerText.trim());if(!N.length)N=[...document.querySelectorAll('div[role="heading"][aria-level="3"]')].map(e=>e.innerText.trim());const B=N.findIndex(x=>/Şirin/i.test(x));const a=[...document.querySelectorAll('#rso a')].filter(x=>x.querySelector('h3'));const T=[];const G=new Set();for(const x of a){const c=x.closest('[data-hveid],div.MjjYud,div.g')||x.parentElement;const cs=c?[...c.querySelectorAll('cite')]:[];const ci=cs.find(e=>/^https?:\\/\\//.test(e.innerText.trim()))||cs[0]||null;const ct=ci?ci.innerText.trim():'';let h=null;try{const u=new URL(x.href);if(/^https?:$/.test(u.protocol)&&!/google\\./.test(u.hostname))h=u}catch(e){}let d='',p='';if(/^https?:\\/\\//.test(ct)){const s=ct.split('›').map(y=>y.trim());try{d=new URL(s[0]).hostname.replace('www.','')}catch(e){d=s[0]}p=h?h.pathname:'/'+s.slice(1).filter(y=>y!=='...'&&y!=='…').join('/')}else if(h){d=h.hostname.replace('www.','');p=h.pathname}else{d='?'+ct.slice(0,30)}const t=x.querySelector('h3').innerText;const k=d+p+(h?'':t);if(!G.has(k)){G.add(k);T.push({d,p,t})}}if(T.length<5)return JSON.stringify({hata:'cikarim',n:T.length,tt:document.title.slice(0,60)});const i=T.findIndex(x=>x.d==='siringayrimenkul.com');const TUR=d=>d[0]==='?'?'belirsiz':/sahibinden|hepsiemlak|emlakjet|zingat|endeksa|trovit/.test(d)?'portal':/instagram|facebook|tiktok|youtube/.test(d)?'sosyal':/yandex|bulurum|com\\.com\\.tr|bilgiemlak|rehberi/.test(d)?'dizin':/century21|remax|coldwell|turyap|kw\\./.test(d)?'franchise':'ofis';const hk=[...document.querySelectorAll('.dbg0pd')].map(n=>{const c=n.closest('.rllt__details');const t=(c?c.innerText:n.innerText).replace(/\\n/g,' | ');const m=t.match(/(\\d[.,]\\d)\\s*\\((\\d[\\d.]*)\\)/);const kat=(t.match(/\\)\\s*·\\s*([^|]+)/)||[])[1];const dur=(t.match(/(Açık|Kapalı|Kapanmak üzere|Açılmak üzere)[^|]*/)||[])[0];return {ad:n.innerText.trim().slice(0,50),puan:m?m[1]:null,yorum:m?parseInt(m[2].replace('.','')):null,kat:kat?kat.trim().slice(0,30):null,durum:dur?dur.trim().slice(0,40):null}});const loc=(()=>{for(const s of ['.GNm3Qb .AhYzQb','.AhYzQb','.dfB0uf','#swml']){const e=document.querySelector(s);if(e&&e.innerText.trim())return e.innerText.trim().slice(0,60)}const re=/^\\d{5},\\s*[^,]+,\\s*[^,]+$|Konumunuza göre|^Konum:/;const h=[...document.querySelectorAll('span,div')].find(x=>x.children.length===0&&re.test((x.innerText||'').trim()));return h?h.innerText.trim().slice(0,60):''})();return JSON.stringify({hp:N.length>0,hs:B+1,hl:N.slice(0,6),sira:i+1,u:i>=0?T[i].p:null,bas:i>=0?T[i].t:null,ilk3u:T.slice(0,3).map(x=>x.d+x.p),ilk8u:T.slice(0,8).map(x=>x.d+x.p+'#'+TUR(x.d)),hk,saat:new Date().toISOString(),n:T.length,loc,tt:document.title.slice(0,45)})})()`;

if (process.argv.includes('--listele')) {
  console.log('# Bölge turu URL listesi (taze uule — bu listeyi her turda yeniden üret)');
  console.log('# Sıra: navigate → 4 sn bekle → aşağıdaki JS → JSONL satırını ANINDA sonuclar-bolge.jsonl\'e yaz.');
  console.log('# loc alanı beklenen semti göstermiyorsa uule tutmamış demektir: DUR, not düş.\n');
  if (ON_AYAR) console.log(`# Ön ayar: ${ON_AYAR} — ${CIFTLER.length} sorgu; kayda "onayar":"${ON_AYAR}" alanı eklenir.\n`);
  for (const { nk, q } of CIFTLER) {
    console.log(`${nk.n} | ${q}`);
    console.log(`https://www.google.com/search?q=${encodeURIComponent(q)}&pws=0&gl=tr&hl=tr&uule=${uule(nk.lat, nk.lng)}`);
  }
  console.log('\n# Ölçüm JS (tek satır):');
  console.log(OLCUM_JS);
  console.log('\n# Kayıt biçimi (JS çıktısındaki tt YAZILMAZ; kanal: "ev"):');
  console.log('{"d":"<bugün>","kanal":"ev","nokta":"<nokta>","lat":N,"lng":N,"q":"<sorgu>",...JS çıktısı}');
  console.log('# UYARI: JS çıktısında "hata" alanı varsa ya da n<5 ise kayıt YAZMA; "ilk 10 dışı" değildir (çıkarım hatası: boş/yarım SERP ya da değişen DOM). 4 sn daha bekleyip JS\'i bir kez daha koş; yine hata ise o sorguyu atla, not düş. Üst üste 3 sorguda hata çıkarsa turu durdur (çıkarıcı bozulmuş olabilir).');
  console.log('# hk[].durum ("Açık"/"Kapalı ⋅ Açılış saati…") ve saat alanı JS çıktısında gelir; silme — mesai içi/dışı kıyası buna bakıyor.');
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
  // 08.10 (karne incelemesi ana-3): Google organik bağları `/goto?url=…` (şifreli) olunca eski seçici
  // (`#rso a[href^="http"]` + hostname) n=0 veriyordu. Alan adı artık önce sonucun kapsayıcısındaki <cite>
  // metninden okunur (serp-cikarici-0710.js ile aynı mantık); cite adres taşımıyorsa ve bağ google dışıysa
  // bağdan. Yol: bağ gerçek adresse oradan, değilse cite kırıntısından (kırıntı yolu güvenilmez).
  // Hiçbiri yoksa sonuç yine SAYILIR (alan adı "?…"), yoksa sıralar kayar.
  // OLCUM_JS ile bu işlev AYNI çıkarımı yapar; birini değiştirirsen öbürünü de değiştir.
  const a = [...document.querySelectorAll('#rso a')].filter((x) => x.querySelector('h3'));
  const T = []; const G = new Set();
  for (const x of a) {
    const c = x.closest('[data-hveid],div.MjjYud,div.g') || x.parentElement;
    const cs = c ? [...c.querySelectorAll('cite')] : [];
    const ci = cs.find((e) => /^https?:\/\//.test(e.innerText.trim())) || cs[0] || null;
    const ct = ci ? ci.innerText.trim() : '';
    let h = null;
    try { const u = new URL(x.href); if (/^https?:$/.test(u.protocol) && !/google\./.test(u.hostname)) h = u; } catch (e) {}
    let d = '', p = '';
    if (/^https?:\/\//.test(ct)) {
      const s = ct.split('›').map((y) => y.trim());
      try { d = new URL(s[0]).hostname.replace('www.', ''); } catch (e) { d = s[0]; }
      p = h ? h.pathname : '/' + s.slice(1).filter((y) => y !== '...' && y !== '…').join('/');
    } else if (h) { d = h.hostname.replace('www.', ''); p = h.pathname; } else { d = '?' + ct.slice(0, 30); }
    const t = x.querySelector('h3').innerText; const k = d + p + (h ? '' : t);
    if (!G.has(k)) { G.add(k); T.push({ d, p, t }); }
  }
  // 5'ten az sonuç = çıkarım hatası (boş/yarım SERP, değişen DOM). "İlk 10 dışı" DEĞİLDİR; kayıt yazılmaz.
  if (T.length < 5) return { hata: 'cikarim', n: T.length, tt: document.title.slice(0, 60) };
  const i = T.findIndex((x) => x.d === 'siringayrimenkul.com');
  // 07.10: kutu kartı alanları (puan/yorum/kategori/açıklık) + ilk 8 organik (tür etiketli) + saat —
  // Şirin/Efor yorum farkı ve 'arama anında açık' sinyali seri olarak izlensin diye.
  const TUR=d=>d[0]==='?'?'belirsiz':/sahibinden|hepsiemlak|emlakjet|zingat|endeksa|trovit/.test(d)?'portal':/instagram|facebook|tiktok|youtube/.test(d)?'sosyal':/yandex|bulurum|com\.com\.tr|bilgiemlak|rehberi/.test(d)?'dizin':/century21|remax|coldwell|turyap|kw\./.test(d)?'franchise':'ofis';const hk=[...document.querySelectorAll('.dbg0pd')].map(n=>{const c=n.closest('.rllt__details');const t=(c?c.innerText:n.innerText).replace(/\n/g,' | ');const m=t.match(/(\d[.,]\d)\s*\((\d[\d.]*)\)/);const kat=(t.match(/\)\s*·\s*([^|]+)/)||[])[1];const dur=(t.match(/(Açık|Kapalı|Kapanmak üzere|Açılmak üzere)[^|]*/)||[])[0];return {ad:n.innerText.trim().slice(0,50),puan:m?m[1]:null,yorum:m?parseInt(m[2].replace('.','')):null,kat:kat?kat.trim().slice(0,30):null,durum:dur?dur.trim().slice(0,40):null}});
  // 07.10: Google arayüzü değişti — .dfB0uf/#swml boş dönüyor. Yeni gösterge alt bilgi
  // çubuğunda span.AhYzQb (kapsayıcı .GNm3Qb): "06824, Tunahan, Etimesgut/Ankara".
  // Sınıf adları uçucu olduğu için zincir: yeni → eski → metin kalıbı ("posta kodu, semt, ilçe/il").
  const loc = (() => {
    for (const s of ['.GNm3Qb .AhYzQb', '.AhYzQb', '.dfB0uf', '#swml']) {
      const e = document.querySelector(s);
      if (e && e.innerText.trim()) return e.innerText.trim().slice(0, 60);
    }
    const re = /^\d{5},\s*[^,]+,\s*[^,]+$|Konumunuza göre|^Konum:/;
    const h = [...document.querySelectorAll('span,div')].find(x => x.children.length === 0 && re.test((x.innerText || '').trim()));
    return h ? h.innerText.trim().slice(0, 60) : '';
  })();
  return {
    hp: N.length > 0, hs: B + 1, hl: N.slice(0, 6), hyedek: yedek,
    sira: i + 1, u: i >= 0 ? T[i].p : null, bas: i >= 0 ? T[i].t : null,
    ilk3u: T.slice(0, 3).map((x) => x.d + x.p), ilk8u: T.slice(0, 8).map((x) => x.d + x.p + '#' + TUR(x.d)), hk, saat: new Date().toISOString(), n: T.length,
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

// engel = robot duvarı / gezinme hatası (o gün bitti). cikarimDur = üst üste 3 çıkarım hatası (çıkarıcı
// bozulmuş olabilir; robot duvarı DEĞİL, çıkarıcı düzeltilince aynı gün sürdürülebilir). Ayrı bayrak:
// son satırda ikisi aynı ifadeyle ("ENGELLE KESİLDİ") basılınca okuyan "o gün bitti" sanıyordu.
let yapilan = 0, hatali = 0, ardisik = 0, engel = false, cikarimDur = false;
disari:
for (const { nk, q } of CIFTLER) {
  {
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
    if (r.hata || r.n < 5) {
      await bekle(2500);
      try { r = await page.evaluate(CIKAR); } catch (e) {}
    }
    // 08.10: çıkarım hatası (hata alanı ya da n<5) "ilk 10 dışı" DEĞİLDİR; eskiden sira:0 diye dosyaya
    // yazılıyordu. Artık kayıt YAZILMAZ, sayfa dökülür, tur sıradaki sorguyla sürer.
    if (r.hata || r.n < 5) {
      const hdump = path.join(process.env.HATA_DIZINI || DIR, `bolge-hata-${nk.n}.html`);
      fs.writeFileSync(hdump, await page.content());
      console.error(`ÇIKARIM HATASI: ${nk.n}|${q} — n=${r.n} title="${r.tt}" → ${hdump} (kayıt YAZILMADI)`);
      if (/sorry|unusual|olağan/i.test(r.tt || '')) { engel = true; break disari; }
      hatali++;
      if (++ardisik >= 3) { // tek tük hata atlanır; üst üste 3 hata çıkarıcının bozulduğunu gösterir, sorgu bütçesi yakılmaz
        console.error('ÜST ÜSTE 3 ÇIKARIM HATASI — çıkarıcı bozulmuş olabilir, tur durduruldu');
        cikarimDur = true; break disari;
      }
      await bekle(20000 + Math.random() * 15000); // tempo yazılmayan sorguda da korunur
      continue;
    }
    ardisik = 0;
    const kayit = { d: BUGUN, kanal: 'konteyner', ...(ON_AYAR ? { onayar: ON_AYAR } : {}), nokta: nk.n, lat: nk.lat, lng: nk.lng, q, ...r };
    delete kayit.tt;
    fs.appendFileSync(OUT, JSON.stringify(kayit) + '\n');
    console.log(`${nk.n} | ${q} → organik:${r.sira || 'ilk10 dışı'} harita:${r.hp ? (r.hs || 'kutu var, biz yok') : 'kutu yok'} n:${r.n} loc:"${r.loc}"`);
    yapilan++;
    if (yapilan < MAX) await bekle(20000 + Math.random() * 15000); // tempo: sorgu başına 20-35 sn
  }
}
await browser.close();
console.log(`BİTTİ: +${yapilan} ölçüm${hatali ? `, ${hatali} çıkarım hatası (yazılmadı)` : ''}${engel ? ' — ENGELLE KESİLDİ' : ''}${cikarimDur ? ' — ÇIKARIM HATASIYLA DURDU (robot duvarı değil)' : ''}`);
process.exit(engel || cikarimDur ? 2 : 0);
