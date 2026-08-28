# -*- coding: utf-8 -*-
"""Bulunabilirlik Karnesi — HTML üretici.

Veriden okur, elle rakam girilmez:
  sonuclar-site-emlakci.jsonl  (site-emlakçı turu; s bazında SON ölçüm geçerli)
  tur-*.json                   (mahalle kuyrukları — hangi s hangi mahallede)
  sonuclar-emlakci.jsonl       (hedef sorgular; q bazında SON ölçüm)
  dizin-analiz-2708.json       (554 sayfalık dizin envanteri)

Çıktı: bulunabilirlik-karnesi.html  →  Artifact olarak aynı adrese yayınlanır.
Kullanım: python3 karne-html.py
"""
import json, html, datetime, re

BUGUN = datetime.date.today().strftime("%d.%m.%Y")

# ---------------- veri ----------------
rows = [json.loads(l) for l in open("sonuclar-site-emlakci.jsonl") if l.strip()]
son = {}
for r in rows:
    son[r["s"]] = r  # son ölçüm geçerli

TURLAR = [
    ("tunahan", "Tunahan", "tur-tunahan-2708.json"),
    ("altay", "Altay", "tur-altay-2708.json"),
    ("devlet", "Devlet", "tur-devlet-2708.json"),
    ("eryaman", "Eryaman", "tur-eryaman-2708.json"),
    ("goksu", "Göksu", "tur-goksu-2808.json"),
    ("guzelkent", "Güzelkent", "tur-guzelkent-2808.json"),
]
BEKLEYEN = [
    ("sehit-osman-avci", "Şehit Osman Avcı", "tur-sehit-osman-avci-2908.json"),
    ("seker", "Şeker", None),
    ("seyh-samil", "Şeyh Şamil", None),
    ("yavuz-selim", "Yavuz Selim", None),
    ("yesilova", "Yeşilova", None),
]
DA = json.load(open("dizin-analiz-2708.json"))
DKEY = {  # tur anahtarı -> dizin-analiz anahtarı
    "tunahan": "tunahan-mahallesi", "altay": "altay-mahallesi",
    "devlet": "devlet-mahallesi", "eryaman": "eryaman-mahallesi",
    "goksu": "goksu-mahallesi", "guzelkent": "guzelkent-mahallesi",
    "sehit-osman-avci": "sehit-osman-avci-mahallesi", "seker": "seker-mahallesi",
    "seyh-samil": "seyh-samil-mahallesi", "yavuz-selim": "yavuz-selim-mahallesi",
    "yesilova": "yesilova-mahallesi",
}

def mah_stats(dosya):
    kf = json.load(open(dosya))
    gs = [k["s"] for k in kf]
    g = [son[s] for s in gs if s in son]
    site = [r for r in g if "/" in r["s"]]
    mahq = [r for r in g if "/" not in r["s"]]
    ilk3 = [r for r in site if 1 <= r["sira"] <= 3]
    yok = [r for r in site if r["sira"] == 0]
    orta = [r for r in site if r["sira"] >= 4]
    bir = [r for r in site if r["sira"] == 1]
    return dict(site=site, mahq=mahq[0] if mahq else None,
                n=len(site), i3=len(ilk3), o=len(orta), y=len(yok), bir=bir,
                olculen=len(g), kuyruk=len(gs))

OLCULEN = {k: mah_stats(f) for k, ad, f in TURLAR}
# ŞOA ilerlemesi: yalnız BU turda (28.08 ve sonrası) ölçülenler sayılır —
# eski turlardan kalan ölçümler kuyruğu "ölçülmüş" göstermesin
_soa_k = json.load(open("tur-sehit-osman-avci-2908.json"))
SOA_OLCULEN = sum(1 for k in _soa_k if k["s"] in son and son[k["s"]]["d"] >= "2026-08-28")
SOA_KUYRUK = len(_soa_k)

MAH_AD = {
    "sehit-osman-avci-mahallesi": "Şehit Osman Avcı", "goksu-mahallesi": "Göksu",
    "yavuz-selim-mahallesi": "Yavuz Selim", "seker-mahallesi": "Şeker",
    "seyh-samil-mahallesi": "Şeyh Şamil", "tunahan-mahallesi": "Tunahan",
    "altay-mahallesi": "Altay", "devlet-mahallesi": "Devlet",
    "eryaman-mahallesi": "Eryaman", "guzelkent-mahallesi": "Güzelkent",
    "yesilova-mahallesi": "Yeşilova",
}

# hedef sorgular (etaplar + ana sorgu) — q bazında son ölçüm
hrows = [json.loads(l) for l in open("sonuclar-emlakci.jsonl") if l.strip()]
hson = {}
for r in hrows:
    hson[r["q"].strip().lower()] = r

def hedef(q):
    return hson.get(q.lower())

def etap_son(i):
    """iki kaynaktan (hedef dosyası + tur dosyasındaki */etaplar/N kayıtları) en tazesi"""
    adaylar = [hedef(f"Eryaman {i}. Etap emlakçı")]
    adaylar += [r for r in rows if r["s"].endswith(f"/etaplar/{i}") and r.get("q", "").startswith("Eryaman")]
    adaylar = [a for a in adaylar if a]
    return max(adaylar, key=lambda r: r["d"]) if adaylar else None

ETAPLAR = [etap_son(i) for i in range(1, 6)]
ANA = hedef("eryaman emlakçı")

TOPLAM_N = sum(v["n"] for v in OLCULEN.values())
TOPLAM_I3 = sum(v["i3"] for v in OLCULEN.values())
TOPLAM_BIR = sum(len(v["bir"]) for v in OLCULEN.values())
DTOT = {k: sum(len(v[k]) for m, v in DA.items() if isinstance(v, dict)) for k in ("dizinsiz", "bayat", "orta", "taze")}
DTOPLAM = sum(DTOT.values())

# kuyruktan bekleyen istekler
dk = open("DIZINE-EKLENECEKLER.md").read()
try:
    dk2 = open("gsc-dizin-kuyrugu-194.md").read()
except FileNotFoundError:
    dk2 = ""
# yalnız son dalganın istekleri "tarama bekliyor" sayılır (10 günden eski işaretler
# ya çoktan tarandı ya da düştü — 194'lük tarihi defterin tamamını sayma)
_bugun = datetime.date.today()
_istekli = set()
for metin in (dk, dk2):
    for m in re.finditer(r"(https://www\.siringayrimenkul\.com/\S+?)\s.*?←\s*(\d\d)\.(\d\d) istek gönderildi", metin):
        t = datetime.date(_bugun.year, int(m.group(3)), int(m.group(2)))
        if 0 <= (_bugun - t).days <= 10:
            _istekli.add(m.group(1).rstrip(">"))
BEKLEYEN_ISTEK = len(_istekli)
SIRADAKI = re.findall(r"- \[ \] https://www\.siringayrimenkul\.com(/\S+)\s+<!-- (\d+) gos", dk)[:5]

def yuzde(a, b):
    return round(100 * a / b) if b else 0

def esc(s):
    return html.escape(str(s), quote=True)

def site_adi(s):
    """md karneleriyle tutarlı kısa slug: son parça, '-sitesi' eki atılır"""
    ad = s.split("/")[-1]
    return re.sub(r"-sitesi$", "", ad)

def tr_tarih(iso):
    return f"{iso[8:10]}.{iso[5:7]}" if iso and len(iso) >= 10 else ""

# küratörlü mahalle bulguları (tur karnesinden)
BULGULAR = {
    "tunahan": "En güçlü mahalle; 21 sayfası taze. Mahalle sorgusunda organik 9 ama harita kutusu 1.",
    "altay": "Site sorgularında güçlü; mahalle sorgusunda organikte yokuz, kutu 1. taşıyor.",
    "devlet": "12 sorguda ilk 10'da yokuz (adaşsız görünmezler: Mavi Köy, Sedirkent, Selçuklu — istek sırada).",
    "eryaman": "Organikte en dengeli mahalle; mahalle sorgusunda #4'ü ana sayfa karşılıyor (bilinen yamyamlık).",
    "goksu": "En zayıf karne + EN BÜYÜK bayat yığın (36 sayfa, 4.410 gösterim talebi). Harita kutusunda YOKUZ.",
    "guzelkent": "23 dizinsiz sayfayla en büyük dizinsiz yığın; 8 sorguda ada, 9'unda komşu site bizi temsil ediyor. Mahalle sorgusunda çift kayıp: ne organikte ne kutuda.",
}

# ---------------- html ----------------
def meter(i3, o, y, n):
    """üç bölmeli sıralı ölçer — konum + etiket kodlu, tek renk rampası"""
    if not n:
        return ""
    seg = ""
    for cnt, cls in ((i3, "m1"), (o, "m2"), (y, "m3")):
        if cnt:
            seg += f'<span class="{cls}" style="flex:{cnt}"><i>{cnt}</i></span>'
    return f'<div class="meter" role="img" aria-label="{i3} ilk üçte, {o} dört-on arası, {y} ilk onda yok">{seg}</div>'

def dmini(key):
    v = DA.get(DKEY.get(key), None)
    if not v:
        return ""
    t, o, b, z = len(v["taze"]), len(v["orta"]), len(v["bayat"]), len(v["dizinsiz"])
    seg = ""
    for cnt, cls in ((t, "d1"), (o, "d2"), (b, "d3"), (z, "d4")):
        if cnt:
            seg += f'<span class="{cls}" style="flex:{cnt}"><i>{cnt}</i></span>'
    return f'<div class="meter dm" role="img" aria-label="{t} taze, {o} orta, {b} bayat, {z} dizinsiz">{seg}</div>'

def chip_org(r):
    if not r:
        return '<span class="chip nul">ölçülmedi</span>'
    s = r["sira"] if "sira" in r else 0
    if s == 0:
        return '<span class="chip kotu">ilk 10′da yok</span>'
    cls = "iyi" if s <= 3 else "orta"
    return f'<span class="chip {cls}">{s}.</span>'

def chip_har(r):
    if not r:
        return '<span class="chip nul">—</span>'
    h = r.get("h", 0) or 0
    if h == 0:
        return '<span class="chip kotu">kutuda yok</span>'
    return f'<span class="chip iyi">kutu {h}.</span>'

satirlar = ""
for key, ad, dosya in TURLAR:
    v = OLCULEN[key]
    satirlar += f"""
    <tr>
      <td class="mah"><strong>{ad}</strong><span class="alt">{v['n']} site sorgusu</span></td>
      <td class="met">{meter(v['i3'], v['o'], v['y'], v['n'])}<span class="pct">%{yuzde(v['i3'], v['n'])} ilk 3</span></td>
      <td class="num">{len(v['bir'])}</td>
      <td class="chips">{chip_org(v['mahq'])} {chip_har(v['mahq'])}</td>
      <td class="met">{dmini(key)}</td>
    </tr>"""

bekleyen_html = ""
for key, ad, dosya in BEKLEYEN:
    durum = "sırada"
    if key == "sehit-osman-avci":
        durum = f"sürüyor — {SOA_OLCULEN}/{SOA_KUYRUK} ölçüldü"
    v = DA.get(DKEY[key])
    doz = f"{len(v['bayat'])} bayat · {len(v['dizinsiz'])} dizinsiz" if v else ""
    bekleyen_html += f'<div class="bek"><strong>{ad}</strong><span>{durum}</span><span class="alt">{doz}</span></div>'

etap_html = ""
for i, r in enumerate(ETAPLAR, 1):
    etap_html += f"""<tr><td>Eryaman {i}. Etap emlakçı</td>
    <td>{chip_org(r)}</td><td>{chip_har(r)}</td><td class="alt">{tr_tarih(r['d']) if r else ''}</td></tr>"""

detaylar = ""
for key, ad, dosya in TURLAR:
    v = OLCULEN[key]
    birler = " ".join(f'<span class="tag t1">{esc(site_adi(r["s"]))}</span>' for r in sorted(v["bir"], key=lambda x: x["s"]))
    dislar = " ".join(f'<span class="tag t3">{esc(site_adi(r["s"]))}</span>' for r in sorted(v["site"], key=lambda x: x["s"]) if r["sira"] == 0)
    detaylar += f"""
    <details><summary><strong>{ad}</strong><span class="alt"> — %{yuzde(v['i3'], v['n'])} ilk 3 · {len(v['bir'])} organik 1 · {v['y']} görünmez</span></summary>
      <p class="bulgu">{esc(BULGULAR.get(key, ''))}</p>
      <p class="etk">Organik 1 olduklarımız</p><p class="tags">{birler or '—'}</p>
      <p class="etk">İlk 10′da görünmediklerimiz</p><p class="tags">{dislar or '—'}</p>
    </details>"""

siradaki_html = "".join(
    f'<li><span>{esc(site_adi(u))}</span><span class="alt">{esc(MAH_AD.get(u.split("/")[-2], "site geneli") if "/mahalleler/" in u else "site geneli")} · {g} gösterim talebi</span></li>'
    for u, g in SIRADAKI)

ana_org = ANA["sira"] if ANA else "?"
ana_har = ANA.get("h", "?") if ANA else "?"
ana_d = tr_tarih(ANA["d"]) if ANA else ""

HTML = f"""<title>Bulunabilirlik Karnesi</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700;800&family=Source+Sans+3:ital,wght@0,400;0,600;0,700;1,400&display=swap">
<style>
:root {{
  --zemin:#f4f6f9; --yuzey:#ffffff; --cizgi:#dfe4ec; --murekkep:#18212f; --m2:#4d5a6e; --m3:#7b8798;
  --lacivert:#1d3f77; --lacivert-2:#7d9cc9; --lacivert-3:#d7dfec; --altin:#9a742a;
  --iyi:#1f6b3d; --iyi-z:#e3efe7; --kotu:#a3352d; --kotu-z:#f6e7e5; --orta-r:#8a6410; --orta-z:#f3ecdc;
  --d1:#1d3f77; --d2:#5c7cb2; --d3:#a9bdd9; --d4:#e7ebf1; --d4c:#9aa5b4;
}}
:root:not([data-theme="light"]) {{ }}
@media (prefers-color-scheme: dark) {{
  :root:not([data-theme="light"]) {{
    --zemin:#0d1420; --yuzey:#16202f; --cizgi:#2a3648; --murekkep:#e7ecf4; --m2:#a9b4c4; --m3:#7f8b9c;
    --lacivert:#83a7de; --lacivert-2:#48699e; --lacivert-3:#243350; --altin:#d3a54e;
    --iyi:#5cb684; --iyi-z:#17301f; --kotu:#e08078; --kotu-z:#3a1f1c; --orta-r:#d3a54e; --orta-z:#33290f;
    --d1:#83a7de; --d2:#48699e; --d3:#2e4160; --d4:#1b2536; --d4c:#556278;
  }}
}}
:root[data-theme="dark"] {{
  --zemin:#0d1420; --yuzey:#16202f; --cizgi:#2a3648; --murekkep:#e7ecf4; --m2:#a9b4c4; --m3:#7f8b9c;
  --lacivert:#83a7de; --lacivert-2:#48699e; --lacivert-3:#243350; --altin:#d3a54e;
  --iyi:#5cb684; --iyi-z:#17301f; --kotu:#e08078; --kotu-z:#3a1f1c; --orta-r:#d3a54e; --orta-z:#33290f;
  --d1:#83a7de; --d2:#48699e; --d3:#2e4160; --d4:#1b2536; --d4c:#556278;
}}
* {{ box-sizing:border-box }}
body {{ background:var(--zemin); color:var(--murekkep); margin:0;
  font:16px/1.55 "Source Sans 3", "Segoe UI", system-ui, sans-serif; }}
.sarici {{ max-width:1020px; margin:0 auto; padding:32px 20px 64px }}
h1,h2,h3,summary strong {{ font-family:Archivo, "Source Sans 3", sans-serif; letter-spacing:-.01em }}
h1 {{ font-size:clamp(26px,4vw,36px); font-weight:800; margin:0; text-wrap:balance }}
h2 {{ font-size:19px; font-weight:700; margin:40px 0 12px }}
.ust {{ display:flex; flex-wrap:wrap; gap:8px 24px; align-items:baseline; border-bottom:3px solid var(--lacivert); padding-bottom:14px }}
.ust .kim {{ color:var(--m2); font-weight:600 }}
.ust .tarih {{ margin-left:auto; color:var(--m3); font-size:14px }}
.not {{ color:var(--m3); font-size:13.5px; margin-top:8px }}
.kartlar {{ display:grid; grid-template-columns:repeat(auto-fit,minmax(170px,1fr)); gap:12px; margin-top:20px }}
.kart {{ background:var(--yuzey); border:1px solid var(--cizgi); border-radius:8px; padding:14px 16px }}
.kart .buyuk {{ font-family:Archivo,sans-serif; font-size:30px; font-weight:800; font-variant-numeric:tabular-nums; line-height:1.1 }}
.kart .buyuk small {{ font-size:16px; font-weight:600; color:var(--m2) }}
.kart .etiket {{ font-size:12.5px; text-transform:uppercase; letter-spacing:.05em; color:var(--m3); margin-top:4px }}
.kart.vurgu {{ border-top:3px solid var(--altin) }}
.tablo-kabuk {{ overflow-x:auto; background:var(--yuzey); border:1px solid var(--cizgi); border-radius:8px }}
table {{ border-collapse:collapse; width:100%; min-width:720px; font-variant-numeric:tabular-nums }}
th {{ text-align:left; font-size:12px; text-transform:uppercase; letter-spacing:.06em; color:var(--m3);
  padding:12px 14px 8px; border-bottom:1px solid var(--cizgi); font-weight:600 }}
td {{ padding:12px 14px; border-bottom:1px solid var(--cizgi); vertical-align:middle }}
tr:last-child td {{ border-bottom:none }}
td.mah .alt {{ display:block }}
.alt {{ color:var(--m3); font-size:13px }}
td.num {{ font-family:Archivo,sans-serif; font-size:20px; font-weight:700 }}
.meter {{ display:flex; gap:2px; height:22px; min-width:170px; border-radius:4px; overflow:hidden }}
.meter span {{ display:flex; align-items:center; justify-content:center; min-width:14px }}
.meter i {{ font-style:normal; font-size:11.5px; font-weight:700 }}
.m1 {{ background:var(--lacivert) }} .m1 i {{ color:var(--yuzey) }}
.m2 {{ background:var(--lacivert-2) }} .m2 i {{ color:var(--yuzey) }}
.m3 {{ background:var(--lacivert-3) }} .m3 i {{ color:var(--m2) }}
.d1 {{ background:var(--d1) }} .d1 i {{ color:var(--yuzey) }}
.d2 {{ background:var(--d2) }} .d2 i {{ color:var(--yuzey) }}
.d3 {{ background:var(--d3) }} .d3 i {{ color:#18212f }}
:root[data-theme="dark"] .d3 i {{ color:var(--murekkep) }}
@media (prefers-color-scheme: dark) {{ :root:not([data-theme="light"]) .d3 i {{ color:var(--murekkep) }} }}
.d4 {{ background:var(--d4); outline:1px dashed var(--d4c); outline-offset:-1px }} .d4 i {{ color:var(--d4c) }}
.pct {{ display:block; font-size:12.5px; color:var(--m2); margin-top:3px }}
.chip {{ display:inline-block; padding:2px 9px; border-radius:99px; font-size:13px; font-weight:600; white-space:nowrap }}
.chip.iyi {{ background:var(--iyi-z); color:var(--iyi) }}
.chip.kotu {{ background:var(--kotu-z); color:var(--kotu) }}
.chip.orta {{ background:var(--orta-z); color:var(--orta-r) }}
.chip.nul {{ background:transparent; color:var(--m3); border:1px dashed var(--cizgi) }}
.lejant {{ display:flex; flex-wrap:wrap; gap:14px; font-size:13px; color:var(--m2); margin:10px 2px 0 }}
.lejant span {{ display:inline-flex; align-items:center; gap:6px }}
.lejant b {{ width:12px; height:12px; border-radius:3px; display:inline-block }}
.bekler {{ display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:10px; margin-top:12px }}
.bek {{ background:var(--yuzey); border:1px dashed var(--cizgi); border-radius:8px; padding:10px 14px; display:flex; flex-direction:column; gap:2px }}
.bek > span:first-of-type {{ color:var(--altin); font-weight:600; font-size:13.5px }}
.iki {{ display:grid; grid-template-columns:1fr 1fr; gap:16px }}
@media (max-width:760px) {{ .iki {{ grid-template-columns:1fr }} }}
.pano {{ background:var(--yuzey); border:1px solid var(--cizgi); border-radius:8px; padding:16px 18px }}
.pano h3 {{ margin:0 0 10px; font-size:16px }}
.pano ul {{ margin:0; padding:0; list-style:none }}
.pano li {{ display:flex; justify-content:space-between; gap:12px; padding:7px 0; border-bottom:1px solid var(--cizgi); font-size:14.5px }}
.pano li:last-child {{ border-bottom:none }}
.zayif li {{ display:block }}
.zayif li strong {{ color:var(--kotu) }}
details {{ background:var(--yuzey); border:1px solid var(--cizgi); border-radius:8px; margin-bottom:10px; padding:0 18px }}
summary {{ cursor:pointer; padding:13px 0; font-size:15.5px }}
summary:focus-visible {{ outline:2px solid var(--lacivert); outline-offset:2px; border-radius:4px }}
details[open] summary {{ border-bottom:1px solid var(--cizgi) }}
.bulgu {{ font-size:14.5px; color:var(--m2); margin:12px 0 }}
.etk {{ font-size:12px; text-transform:uppercase; letter-spacing:.06em; color:var(--m3); margin:14px 0 6px; font-weight:600 }}
.tags {{ margin:0 0 14px; line-height:2 }}
.tag {{ display:inline-block; padding:2px 9px; border-radius:5px; font-size:13px; margin-right:4px }}
.t1 {{ background:var(--lacivert-3); color:var(--lacivert) }}
:root[data-theme="dark"] .t1, .t3 {{ font-weight:600 }}
.t3 {{ background:var(--kotu-z); color:var(--kotu) }}
.dip {{ margin-top:40px; padding-top:14px; border-top:1px solid var(--cizgi); color:var(--m3); font-size:13px }}
@media (prefers-reduced-motion:no-preference) {{ details {{ transition:border-color .15s }} }}
</style>
<div class="sarici" lang="tr">
  <header class="ust">
    <h1>Bulunabilirlik Karnesi</h1>
    <span class="kim">Şirin Gayrimenkul · Eryaman</span>
    <span class="tarih">Güncelleme: {BUGUN}</span>
  </header>
  <p class="not">Tüm ölçümler kişiselleştirmesiz Google aramasıyla yapılır (pws=0, Türkiye).
  Google ilk ~10 sonucu gösterir; “görünmez” = ilk 10′da yok demektir. Harita kutusu organikten ayrı sayılır.</p>

  <div class="kartlar">
    <div class="kart"><div class="buyuk">{TOPLAM_N}</div><div class="etiket">site sorgusu ölçüldü · 6/11 mahalle</div></div>
    <div class="kart"><div class="buyuk">%{yuzde(TOPLAM_I3, TOPLAM_N)}</div><div class="etiket">sorguların ilk 3′te olduğu oran</div></div>
    <div class="kart"><div class="buyuk">{TOPLAM_BIR}</div><div class="etiket">sorguda organik 1. sıradayız</div></div>
    <div class="kart vurgu"><div class="buyuk">{ana_org}<small>. sıra</small></div><div class="etiket">“eryaman emlakçı” organik (harita {ana_har}.) · {ana_d}</div></div>
  </div>

  <h2>Mahalle karnesi</h2>
  <div class="tablo-kabuk"><table>
    <thead><tr><th>Mahalle</th><th>Site sorgularında sıra dağılımı</th><th>Organik 1</th><th>“… mahallesi emlakçı”</th><th>Sayfa tazeliği (dizin)</th></tr></thead>
    <tbody>{satirlar}</tbody>
  </table></div>
  <div class="lejant">
    <span><b style="background:var(--lacivert)"></b> ilk 3</span>
    <span><b style="background:var(--lacivert-2)"></b> 4–10</span>
    <span><b style="background:var(--lacivert-3)"></b> ilk 10′da yok</span>
    <span style="margin-left:14px"><b style="background:var(--d1)"></b> taze</span>
    <span><b style="background:var(--d2)"></b> orta</span>
    <span><b style="background:var(--d3)"></b> bayat</span>
    <span><b style="background:var(--d4);outline:1px dashed var(--d4c)"></b> dizinsiz</span>
  </div>

  <div class="bekler">{bekleyen_html}</div>

  <h2>Etap sorguları</h2>
  <div class="tablo-kabuk"><table>
    <thead><tr><th>Sorgu</th><th>Organik</th><th>Harita</th><th>Son ölçüm</th></tr></thead>
    <tbody>{etap_html}</tbody>
  </table></div>

  <div class="iki" style="margin-top:24px">
    <div class="pano zayif">
      <h3>Zayıf halkalar</h3>
      <ul>
        <li><strong>Mahalle sorgularının organiği.</strong> 6 mahallenin 3′ünde (Altay, Devlet, Güzelkent) “… mahallesi emlakçı” aramasında ilk 10′a giremiyoruz; bizi harita kutusu taşıyor.</li>
        <li><strong>Göksu + Güzelkent harita kutusu.</strong> Bu iki mahallede kutuda da yokuz — yorum kampanyasında mahalle adı geçirme önceliği bu ikisine kaydı.</li>
        <li><strong>Bayat yığınlar.</strong> Göksu (36 sayfa · 4.410 gösterim talebi) ve Şehit Osman Avcı (29 · 4.083) en büyük iki tazeleme borcu.</li>
        <li><strong>Eski adres kalıntıları.</strong> 13+ sorguda hâlâ eski sayfa adresi listeleniyor (taşınma sindirimi sürüyor).</li>
      </ul>
    </div>
    <div class="pano">
      <h3>Dizin damlası — sıradaki 5</h3>
      <ul>{siradaki_html}</ul>
      <p class="alt" style="margin:10px 0 0">Kota: günde ~6-10 istek; son 10 günde {BEKLEYEN_ISTEK} sayfaya istek gönderildi.
      Sayfa envanteri: {DTOT['taze']} taze · {DTOT['orta']} orta · {DTOT['bayat']} bayat · {DTOT['dizinsiz']} dizinsiz (toplam {DTOPLAM}).</p>
    </div>
  </div>

  <h2>Mahalle ayrıntıları</h2>
  {detaylar}

  <p class="dip">Kaynak: site-emlakçı turu ölçümleri (sonuclar-site-emlakci.jsonl), hedef sorgu ölçümleri,
  GSC dizin envanteri ({DTOPLAM} sayfa, API denetimi). Karne her turdan sonra bu sayfaya yeniden yayınlanır.</p>
</div>
"""
open("bulunabilirlik-karnesi.html", "w").write(HTML)
print("yazıldı: bulunabilirlik-karnesi.html", len(HTML), "bayt")
