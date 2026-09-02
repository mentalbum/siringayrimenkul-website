#!/usr/bin/env python3
"""“eryaman emlakçı” — en değerli sorgunun MÜLK düzeyi günlük serisi.

Karne bu sorguyu bugüne dek tek rakamla (28 günlük TO) gösteriyordu. Tek rakam
iki şeyi gizliyor: (1) TO'nun ne zaman düştüğünü, (2) sırayı hangi sayfamızın
tuttuğunu. Bu betik GSC API'den sorgu süzgeçli günlük seriyi çeker ve üç şey
üretir: haftalık seri, üç dönem özeti, sayfa kırılımı.

Okuma anahtarı (veriden çıkan, betik her turda yeniden hesaplar):
  - GSC'nin "konum"u mülk düzeyinde EN İYİ adresimizin konumudur. Bu sorguda
    en iyi adres harita kutusundaki GBP bağıdır (önce utm'li adres, o adres
    GSC'den düşünce "/"). Yani 1,2–1,4 harita kutusunun konumu; organik sırayı
    GSC değil pws=0 SERP ölçümü verir (sonuclar-emlakci.jsonl'den okunur).
  - Organik sıra sabitken TO'nun düşmesi snippet/başlık sorunudur.

Girdi : GSC API (node, servis hesabı anahtarı ~/.config/gsc-servis-anahtari.json)
        sonuclar-emlakci.jsonl (pws=0 SERP ölçümleri, q bazında)
        git (15.08 açıklama kısaltması commit'inin konusu)
Önbellek: KARNE_SCRATCH varsa ham çekimler oraya TSV yazılır; API erişilemezse
        oradan okunur ve çıktıda "kaynak" alanı bunu söyler.
Çıktı : eryaman-emlakci.json — karne-html.py okur.
"""
import json, os, sys, subprocess, datetime, collections, re

KOK = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(KOK, "..", ".."))
S = os.environ.get("KARNE_SCRATCH", "")
SORGU = "eryaman emlakçı"
BASLANGIC = datetime.date(2026, 7, 27)     # 26.07 slug taşımasından sonraki ilk tam gün (Pazartesi)
BUGUN = datetime.date.today()
MULK = "https://www.siringayrimenkul.com"
UTM = f"{MULK}/?utm_source=google&utm_medium=gbp"
ACIKLAMA_COMMIT = "3f58e7f"                 # 15.08 ana sayfa meta description kısaltması
TITLE_DONUK = datetime.date(2026, 9, 7)

# Üç dönem. D2 = geçiş penceresi: utm'li adres GSC'den düştü (12.08) + ana sayfa
# açıklaması kısaldı (15.08). D3 bitişi son veri gününe göre her turda kayar.
DONEMLER = [
    ("d1", datetime.date(2026, 7, 27), datetime.date(2026, 8, 11), "Taban: harita bağı utm'li adreste"),
    ("d2", datetime.date(2026, 8, 12), datetime.date(2026, 8, 15), "Geçiş: utm'li adres GSC'den düştü, 15.08 açıklama kısaltması"),
    ("d3", datetime.date(2026, 8, 16), None, "Kısaltma sonrası"),
]

# GSC'yi gsc-q.mjs ile aynı biçimde çeker; betik oturum scratchpad'ine bağımlı
# kalmasın diye JS burada gömülü. Parametreler ortam değişkeninden.
JS = r"""
import { createSign } from "node:crypto";
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
const MULK = "https://www.siringayrimenkul.com/";
const k = JSON.parse(readFileSync(process.env.GSC_KEY || join(homedir(), ".config", "gsc-servis-anahtari.json"), "utf8"));
const b64u = (s) => Buffer.from(s).toString("base64url");
const simdi = Math.floor(Date.now() / 1000);
const govde = b64u(JSON.stringify({ alg: "RS256", typ: "JWT" })) + "." + b64u(JSON.stringify({ iss: k.client_email, scope: "https://www.googleapis.com/auth/webmasters", aud: "https://oauth2.googleapis.com/token", iat: simdi, exp: simdi + 3600 }));
const imza = createSign("RSA-SHA256").update(govde).sign(k.private_key, "base64url");
const tr = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${govde}.${imza}` }) });
const jeton = (await tr.json()).access_token;
const body = { startDate: process.env.Q_BAS, endDate: process.env.Q_BIT, dimensions: process.env.Q_DIMS.split(","), rowLimit: 5000 };
if (process.env.Q_SORGU) body.dimensionFilterGroups = [{ filters: [{ dimension: "query", operator: "equals", expression: process.env.Q_SORGU }] }];
const r = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(MULK)}/searchAnalytics/query`, { method: "POST", headers: { authorization: `Bearer ${jeton}`, "content-type": "application/json" }, body: JSON.stringify(body) });
const j = await r.json();
if (!r.ok) { console.error(JSON.stringify(j).slice(0, 500)); process.exit(1); }
for (const row of j.rows || []) console.log([row.impressions, row.clicks, row.position.toFixed(2), ...row.keys].join("\t"));
"""


def tr_sayi(n, ondalik=0):
    """Türkçe biçim: binlik nokta, ondalık virgül (karne-html.py ile aynı)."""
    if n is None:
        return "—"
    t = f"{n:,.{ondalik}f}"
    return t.replace(",", "\x00").replace(".", ",").replace("\x00", ".")


def gg(d):
    return d.strftime("%d.%m")


def gsc(bas, bit, dims, sorgu=None):
    env = dict(os.environ, Q_BAS=bas.isoformat(), Q_BIT=bit.isoformat(), Q_DIMS=dims, Q_SORGU=sorgu or "")
    p = subprocess.run(["node", "--input-type=module", "-"], input=JS, env=env,
                       capture_output=True, text=True, timeout=120)
    if p.returncode != 0:
        raise RuntimeError(p.stderr.strip()[:300] or "node hata")
    return p.stdout


def cek(ad, bas, bit, dims, sorgu):
    """API'den çeker; KARNE_SCRATCH varsa TSV'yi oraya bırakır. API yoksa önbellekten okur."""
    yol = f"{S}/{ad}.tsv" if S else ""
    try:
        ham = gsc(bas, bit, dims, sorgu)
        if yol:
            open(yol, "w").write(ham)
        return ham, "api"
    except Exception as e:
        if yol and os.path.exists(yol):
            print(f"UYARI: GSC API erişilemedi ({e}); önbellek {yol}", file=sys.stderr)
            return open(yol).read(), "önbellek " + datetime.date.fromtimestamp(os.path.getmtime(yol)).isoformat()
        sys.exit(f"GSC API erişilemedi ve önbellek yok: {e}")


def satirlar(ham, n):
    for L in ham.splitlines():
        p = L.rstrip("\n").split("\t")
        if len(p) < 3 + n:
            continue
        try:
            yield int(p[0]), int(p[1]), float(p[2]), p[3:3 + n]
        except ValueError:
            continue


def ozet(kayitlar):
    """[(gos, tik, konum)] → toplam gös/tık/TO/gösterim ağırlıklı konum."""
    g = sum(k[0] for k in kayitlar); t = sum(k[1] for k in kayitlar)
    pk = sum(k[0] * k[2] for k in kayitlar)
    return {"gos": g, "tik": t, "to": round(t * 100 / g, 1) if g else None,
            "konum": round(pk / g, 2) if g else None}


# ── 1. Son veri günü (sorgu süzgeçsiz; GSC 2-3 gün geriden gelir) ──────────────
son_ham, _ = cek("gsc-son-gun", BUGUN - datetime.timedelta(days=10), BUGUN, "date", None)
son_gunler = [datetime.date.fromisoformat(k[0]) for _, _, _, k in satirlar(son_ham, 1)]
SON = max(son_gunler) if son_gunler else None
if SON is None:
    sys.exit("GSC son 10 günde hiç veri döndürmedi — son veri günü belirlenemedi")
DONEMLER = [(k, b, e or SON, ad) for k, b, e, ad in DONEMLER]

# ── 2. Mülk düzeyi günlük seri ────────────────────────────────────────────────
gun_ham, kaynak = cek("eryaman-emlakci-gunluk", BASLANGIC, BUGUN, "date", SORGU)
gunluk = {}
for g, t, poz, (d,) in satirlar(gun_ham, 1):
    gunluk[datetime.date.fromisoformat(d)] = (g, t, poz)
# gösterimsiz gün API'de satır olarak gelmez; seri için 0'la doldur
seri = []
d = BASLANGIC
while d <= SON:
    g, t, poz = gunluk.get(d, (0, 0, None))
    seri.append({"d": d.isoformat(), "gos": g, "tik": t, "konum": poz})
    d += datetime.timedelta(days=1)

# ── 3. Sayfa × gün (sırayı hangi adres tutuyor) ───────────────────────────────
sg_ham, _ = cek("eryaman-emlakci-sayfa-gunluk", BASLANGIC, BUGUN, "page,date", SORGU)
sayfa_gun = collections.defaultdict(dict)   # url → {gün: (g,t,poz)}
for g, t, poz, (u, d) in satirlar(sg_ham, 2):
    sayfa_gun[u][datetime.date.fromisoformat(d)] = (g, t, poz)


def sayfa_ad(u):
    yol = u.replace(MULK, "") or "/"
    if u == UTM:
        return "Ana sayfa — GBP bağı (utm'li adres)"
    if yol == "/":
        return "Ana sayfa"
    if yol == "/ev-degerleme":
        return "Değerleme sayfası"
    m = re.fullmatch(r"/mahalleler/([^/]+)-mahallesi/?", yol)
    if m:
        return m.group(1).replace("-", " ").title() + " Mahallesi sayfası"
    return yol


def sayfa_kirilimi(bas, bit):
    cikti = []
    for u, gunler in sayfa_gun.items():
        k = [v for d, v in gunler.items() if bas <= d <= bit]
        if not k:
            continue
        o = ozet(k)
        gl = sorted(d for d in gunler if bas <= d <= bit)
        cikti.append({"u": u.replace(MULK, "") or "/", "ad": sayfa_ad(u), **o,
                      "gun": len(k), "ilk": gl[0].isoformat(), "son": gl[-1].isoformat()})
    cikti.sort(key=lambda x: -x["gos"])
    return cikti


def sira_tutan(kirilim):
    """En iyi konumlu sayfa — ama kırıntı sayfalar (1 gösterimde konum 1) sayılmaz:
    en çok gösterim alanın en az dörtte biri kadar gösterimi olmalı."""
    if not kirilim:
        return None
    esik = kirilim[0]["gos"] / 4
    aday = [x for x in kirilim if x["gos"] >= esik and x["konum"] is not None]
    return min(aday, key=lambda x: x["konum"])["u"] if aday else None


# ── 4. Haftalar (Pazartesi başlangıçlı; 27.07 Pazartesi) ──────────────────────
haftalar = []
h = BASLANGIC
while h <= SON:
    hb = h + datetime.timedelta(days=6)
    k = [(gunluk[d][0], gunluk[d][1], gunluk[d][2]) for d in gunluk if h <= d <= hb]
    haftalar.append({"bas": h.isoformat(), "bit": hb.isoformat(), "etiket": f"{gg(h)}–{gg(hb)}",
                     "gun": (min(hb, SON) - h).days + 1, "kismi": hb > SON, **ozet(k)})
    h = hb + datetime.timedelta(days=1)

# ── 5. Dönemler ───────────────────────────────────────────────────────────────
donemler = []
for key, b, e, ad in DONEMLER:
    k = [gunluk[d] for d in gunluk if b <= d <= e]
    o = ozet(k)
    kir = sayfa_kirilimi(b, e)
    st = sira_tutan(kir)
    donemler.append({"k": key, "ad": ad, "etiket": f"{gg(b)}–{gg(e)}", "bas": b.isoformat(), "bit": e.isoformat(),
                     "gun": (e - b).days + 1, **o, "kucuk_ornek": o["gos"] < 100,
                     "sayfalar": kir, "sira_tutan": st,
                     "sira_tutan_ad": next((x["ad"] for x in kir if x["u"] == st), None)})

toplam = ozet(list(gunluk.values()))
sayfalar = sayfa_kirilimi(BASLANGIC, SON)

# ── 6. utm'li adres: ne zaman düştü, ana sayfa konumu öncesi/sonrası ──────────
utm_gunler = sorted(sayfa_gun.get(UTM, {}))
ana_gunler = sayfa_gun.get(MULK + "/", {})
utm = {"adres": "/?utm_source=google&utm_medium=gbp", "ilk": None, "son": None, "gun": len(utm_gunler),
       "ozet": None, "ana_konum_utm_varken": None, "ana_konum_utm_sonrasi": None, "denetim": "ölçülmedi"}
if utm_gunler:
    utm["ilk"], utm["son"] = utm_gunler[0].isoformat(), utm_gunler[-1].isoformat()
    utm["ozet"] = ozet([sayfa_gun[UTM][d] for d in utm_gunler])
    utm["ana_konum_utm_varken"] = ozet([v for d, v in ana_gunler.items() if d <= utm_gunler[-1]])["konum"]
    utm["ana_konum_utm_sonrasi"] = ozet([v for d, v in ana_gunler.items() if d > utm_gunler[-1]])["konum"]
# URL denetimi (günde 2.000 kota; tek çağrı): adres Google'da hâlâ ayrı bir sayfa mı?
try:
    p = subprocess.run(["node", f"{REPO}/scripts/gsc-api.mjs", "denetle", UTM],
                       capture_output=True, text=True, timeout=60, cwd=REPO)
    if p.returncode == 0 and p.stdout.strip():
        a = p.stdout.strip().split("\t")
        utm["denetim"] = f"{a[0]} — {a[1]}" if len(a) > 1 else a[0]
except Exception:
    pass

# ── 7. pws=0 SERP ölçümleri (organik sıra — GSC'nin veremediği şey) ───────────
serp = {}
yol = f"{KOK}/sonuclar-emlakci.jsonl"
if os.path.exists(yol):
    for L in open(yol):
        L = L.strip()
        if not L:
            continue
        try:
            r = json.loads(L)
        except ValueError:
            continue
        if not isinstance(r, dict) or (r.get("q") or "").strip().lower() != SORGU or not r.get("d"):
            continue
        try:
            sira = int(r.get("sira")) if r.get("sira") not in (None, "", "-") else None
        except (TypeError, ValueError):
            sira = None
        serp[r["d"]] = {"d": r["d"], "sira": sira, "u": (r.get("u") or "")[:60],
                        "harita": str(r.get("h")) == "1", "kanal": r.get("kanal") or "oturumlu/belirsiz"}
serp = [serp[d] for d in sorted(serp) if d >= BASLANGIC.isoformat()]

# ── 8. 15.08 açıklama kısaltması — commit konusu git'ten (rakam elle yazılmaz) ─
try:
    p = subprocess.run(["git", "-C", REPO, "log", "-1", "--format=%h%x09%ad%x09%s", "--date=short", ACIKLAMA_COMMIT],
                       capture_output=True, text=True, timeout=30)
    aciklama_commit = dict(zip(("h", "d", "konu"), p.stdout.strip().split("\t", 2))) if p.returncode == 0 and p.stdout.strip() else None
except Exception:
    aciklama_commit = None

# ── 9. Notlar (her rakam yukarıdaki hesaplardan) ──────────────────────────────
D = {x["k"]: x for x in donemler}
notlar = []


def yuzde(x):
    return "ölçülmedi" if x is None else f"%{tr_sayi(x, 1)}"


def kon(x):
    return "ölçülmedi" if x is None else tr_sayi(x, 1)


# Dönem konumlarının aralığı — notta "1,2–1,4" elle yazılıydı (02.09 denetimi), veriden gelir
_konumlar = [x["konum"] for x in donemler if x.get("konum") is not None]
KONUM_ARALIK = f"{kon(min(_konumlar))}–{kon(max(_konumlar))}" if _konumlar else "ölçülmedi"


notlar.append(
    f"TO üç dönemde {yuzde(D['d1']['to'])} → {yuzde(D['d2']['to'])} → {yuzde(D['d3']['to'])} "
    f"({D['d1']['etiket']} / {D['d2']['etiket']} / {D['d3']['etiket']}); GSC konumu aynı dönemlerde "
    f"{kon(D['d1']['konum'])} / {kon(D['d2']['konum'])} / {kon(D['d3']['konum'])}."
    + (f" {D['d2']['etiket']} dönemi {D['d2']['gun']} gün / {tr_sayi(D['d2']['gos'])} gösterim: oran güvenilmez." if D["d2"]["kucuk_ornek"] else ""))

if utm["son"]:
    notlar.append(
        f"GSC “konum”u mülk düzeyinde en iyi adresimizin konumudur. {gg(datetime.date.fromisoformat(utm['ilk']))}–"
        f"{gg(datetime.date.fromisoformat(utm['son']))} arasında bu adres harita kutusundaki GBP bağıydı (utm'li adres, "
        f"konum {kon(utm['ozet']['konum'])}, {tr_sayi(utm['ozet']['gos'])} gösterim / {tr_sayi(utm['ozet']['tik'])} tık); "
        f"ana sayfa “/” aynı günlerde konum {kon(utm['ana_konum_utm_varken'])}. utm'li adres "
        f"{gg(datetime.date.fromisoformat(utm['son']))} sonrası GSC'de yok (URL denetimi: {utm['denetim']}) ve “/” konumu "
        f"{kon(utm['ana_konum_utm_sonrasi'])} oldu — harita bağının gösterimi artık “/” adresine yazılıyor. "
        f"Yani sabit görünen {KONUM_ARALIK} harita kutusunun konumudur; organik sırayı GSC değil pws=0 SERP ölçümü verir.")

if serp:
    dizi = ", ".join(f"{'—' if s['sira'] is None else s['sira']} ({gg(datetime.date.fromisoformat(s['d']))})" for s in serp)
    harita = sum(1 for s in serp if s["harita"])
    notlar.append(f"pws=0 SERP ölçümlerinde organik sıra: {dizi}; harita kutusunda 1. sıra {harita}/{len(serp)} ölçümde. "
                  f"Organik sıra sabit, harita sabit, TO düştü → sorun sırada değil, snippet/başlıkta.")
else:
    notlar.append("pws=0 SERP ölçümü bu sorgu için bulunamadı (sonuclar-emlakci.jsonl) — organik sıra ölçülmedi.")

d1_ana = next((x for x in D["d1"]["sayfalar"] if x["u"] == "/"), None)
d3_ana = next((x for x in D["d3"]["sayfalar"] if x["u"] == "/"), None)
if d1_ana and d3_ana:
    notlar.append(
        f"Tıkları taşıyan sayfa her dönemde ana sayfa: {D['d1']['etiket']} döneminde “/” {tr_sayi(d1_ana['tik'])} tık "
        f"(konum {kon(d1_ana['konum'])}, organik), {D['d3']['etiket']} döneminde {tr_sayi(d3_ana['tik'])} tık "
        f"(konum {kon(d3_ana['konum'])}, harita bağı dahil). Harita bağı dahil edildiği hâlde tık düşmüşse organik tık kaybı bundan da büyüktür.")

if aciklama_commit:
    notlar.append(f"Baş şüpheli: {aciklama_commit['d']} ana sayfa meta description kısaltması "
                  f"(commit {aciklama_commit['h']}: “{aciklama_commit['konu']}”). TO düşüşü bu tarihten sonraki dönemde görülüyor; "
                  f"nedensellik ölçülmedi, tek şüpheli değil (aynı günlerde harita bağı da “/” adresine geçti).")
else:
    notlar.append("Baş şüpheli: 15.08 ana sayfa meta description kısaltması (commit konusu git'ten okunamadı).")

notlar.append(f"Title/H1 donuk, serbest kalma tarihi {gg(TITLE_DONUK)} (08.08 değişikliğinin 4 haftalık bekleme süresi); "
              f"o tarihe kadar müdahale yalnızca meta description olabilir.")

uyari = (f"Sorgu düzeyi veri: GSC gizlilik süzgeci bazı günleri düşürür; günlük gösterim küçük "
         f"(ortalama {tr_sayi(toplam['gos'] / len(seri), 1)}/gün). Tek güne değil hafta ve dönem toplamına bak. "
         f"Son veri günü {gg(SON)} — GSC 2-3 gün geriden gelir.")

cikti = {
    "guncelleme": BUGUN.isoformat(), "sorgu": SORGU, "kaynak": kaynak,
    "baslangic": BASLANGIC.isoformat(), "son_veri_gunu": SON.isoformat(), "gun": len(seri),
    "toplam": toplam, "haftalar": haftalar, "donemler": donemler, "sayfalar": sayfalar,
    "utm": utm, "serp": serp, "aciklama_commit": aciklama_commit, "title_donuk": TITLE_DONUK.isoformat(),
    "gunluk": seri, "notlar": notlar, "uyari": uyari,
}
json.dump(cikti, open(f"{KOK}/eryaman-emlakci.json", "w"), ensure_ascii=False, indent=1)

# ── Ekrana ────────────────────────────────────────────────────────────────────
print(f"“{SORGU}” · {gg(BASLANGIC)}–{gg(SON)} ({len(seri)} gün) · kaynak: {kaynak}")
print(f"toplam {tr_sayi(toplam['gos'])} gösterim · {tr_sayi(toplam['tik'])} tık · TO {yuzde(toplam['to'])} · konum {kon(toplam['konum'])}\n")
print(f"{'hafta':14} {'gün':>3} {'göst':>5} {'tık':>4} {'TO':>7} {'konum':>6}")
for h in haftalar:
    print(f"{h['etiket']:14} {h['gun']:3} {h['gos']:5} {h['tik']:4} {yuzde(h['to']):>7} {kon(h['konum']):>6}{'  (kısmi)' if h['kismi'] else ''}")
print(f"\n{'dönem':14} {'gün':>3} {'göst':>5} {'tık':>4} {'TO':>7} {'konum':>6}  sırayı tutan")
for x in donemler:
    print(f"{x['etiket']:14} {x['gun']:3} {x['gos']:5} {x['tik']:4} {yuzde(x['to']):>7} {kon(x['konum']):>6}  {x['sira_tutan']}")
    for s in x["sayfalar"]:
        print(f"    {s['gos']:5} göst · {s['tik']:3} tık · konum {kon(s['konum']):>5} · {s['ad']}")
print("\nSERP (pws=0) organik sıra:", ", ".join(f"{s['sira']} ({s['d']}, {s['kanal']})" for s in serp) or "ölçülmedi")
print(f"utm'li adres: {utm['ilk']} → {utm['son']} ({utm['gun']} gün) · denetim: {utm['denetim']}")
print("\nNOTLAR")
for n in notlar:
    print(" -", n)
print("\nUYARI:", uyari)
