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
import tranahtar
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
    ("sehit-osman-avci", "Şehit Osman Avcı", "tur-sehit-osman-avci-2908.json"),
    ("seker", "Şeker", "tur-seker-2908.json"),
    ("yesilova", "Yeşilova", "tur-yesilova-2908.json"),
    ("yavuz-selim", "Yavuz Selim", "tur-yavuz-selim-2908.json"),
    ("seyh-samil", "Şeyh Şamil", "tur-seyh-samil-2908.json"),
]
BEKLEYEN = []
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
    site = [r for r in g if "/" in r["s"] and "/etaplar/" not in r["s"]]
    mahq = [r for r in g if "/" not in r["s"]]
    ilk3 = [r for r in site if 1 <= r["sira"] <= 3]
    yok = [r for r in site if r["sira"] == 0]
    orta = [r for r in site if r["sira"] >= 4]
    bir = [r for r in site if r["sira"] == 1]
    return dict(site=site, mahq=mahq[0] if mahq else None,
                n=len(site), i3=len(ilk3), o=len(orta), y=len(yok), bir=bir,
                olculen=len(g), kuyruk=len(gs), s_listesi=[r["s"] for r in site])

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
# 31.08: anahtar .lower() ile kuruluyordu ve Türkçe İ'de bozuluyordu —
# 'İ'.lower() iki karakter üretir (i + birleşik nokta), böylece aynı sorgunun
# iki yazımı ayrı satır sayılıyordu (İlgazlar vakası). tranahtar.anahtar()
# hepsini tek kovaya indirger. Kayıtlar dosya sırasına göre okunduğu için
# sonuncusu geçerli olur — dosya append-only.
hson = {}
for r in hrows:
    hson[tranahtar.anahtar(r["q"])] = r

def hedef(q):
    return hson.get(tranahtar.anahtar(q))

def etap_son(i):
    """iki kaynaktan (hedef dosyası + tur dosyasındaki */etaplar/N kayıtları) en tazesi"""
    adaylar = [hedef(f"Eryaman {i}. Etap emlakçı")]
    # 31.08: filtre startswith("Eryaman") ile büyük harfe duyarlıydı; veride
    # aynı sorgunun küçük harfli yazımı da var ("eryaman 2. etap emlakçı") ve
    # öyle bir kayıt sessizce DÜŞERDİ. Normalize edilmiş eşleştirme.
    adaylar += [r for r in rows if r["s"].endswith(f"/etaplar/{i}")
                and tranahtar.anahtar(r.get("q", "")).startswith("eryaman")]
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

# ---------------- rakip haritası ----------------
from collections import Counter as _C
PORTAL = {"sahibinden.com", "hepsiemlak.com", "emlakjet.com", "remax.com.tr",
          "cb.com.tr", "bulurum.com", "com.com.tr", "tapu.com"}
DIZIN_D = {"eryaman.bilgiemlak.com.tr", "bilgiemlak.com.tr"}
SOSYAL_D = {"instagram.com", "facebook.com", "yandex.com.tr", "youtube.com"}

def _rakip_hesapla(son_olcumler):
    say = _C(); bir = _C(); sinif = _C(); yerel = _C()
    for r in son_olcumler:
        u = r.get("ilk3u") or []
        for i, x in enumerate(u):
            d = x.split("/")[0].replace("www.", "")
            if "siringayrimenkul" in d:
                continue
            say[d] += 1
            if i == 0:
                bir[d] += 1
        if not u:
            continue
        d0 = u[0].split("/")[0].replace("www.", "")
        if "siringayrimenkul" in d0:
            sinif["biz"] += 1
        elif d0 in PORTAL:
            sinif["portal"] += 1
        elif d0 in DIZIN_D:
            sinif["dizin"] += 1
        elif d0 in SOSYAL_D or d0.startswith("("):
            sinif["sosyal"] += 1
        else:
            sinif["yerel"] += 1
            yerel[d0] += 1
    return say, bir, sinif, yerel

# ---------------- değişim (yeniden ölçüm) ----------------
from collections import defaultdict
_gecmis = defaultdict(list)
for r in rows:
    if r["d"] >= "2026-08-21":          # bu tur döneminin ölçümleri
        _gecmis[r["s"]].append(r)

def _sira_puan(r):
    """0 (ilk 10 dışı) en kötü sayılsın diye 99'a çevrilir"""
    return r["sira"] if r["sira"] else 99

DEGISIM = {}   # s -> dict(onceki, simdi, fark, o_tarih, y_tarih)
for s_, v in _gecmis.items():
    v = sorted(v, key=lambda r: r["d"])
    if len(v) < 2 or v[-1]["d"] == v[-2]["d"]:
        continue
    onceki, simdi = v[-2], v[-1]
    DEGISIM[s_] = dict(onceki=_sira_puan(onceki), simdi=_sira_puan(simdi),
                       fark=_sira_puan(onceki) - _sira_puan(simdi),
                       o_tarih=onceki["d"], y_tarih=simdi["d"],
                       s=s_, bas=simdi.get("bas"), not_=simdi.get("not", ""))

_tur_olcumleri = [r for s_, r in son.items() if r["d"] >= "2026-08-21"]
RAKIP_SAY, RAKIP_BIR, RAKIP_SINIF, RAKIP_YEREL = _rakip_hesapla(_tur_olcumleri)
RAKIP_TOPLAM = sum(RAKIP_SINIF.values())

YUKSELEN = sorted([d for d in DEGISIM.values() if d["fark"] > 0], key=lambda d: -d["fark"])
DUSEN = sorted([d for d in DEGISIM.values() if d["fark"] < 0], key=lambda d: d["fark"])
SABIT = [d for d in DEGISIM.values() if d["fark"] == 0]

try:
    SONUC = json.load(open("sonuc-ozeti.json"))
except FileNotFoundError:
    SONUC = None

try:
    ISGAL = json.load(open("isgal-3108.json"))
except FileNotFoundError:
    ISGAL = None

try:
    ADAYLAR = json.load(open("dizin-adaylari.json"))
except FileNotFoundError:
    ADAYLAR = []

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
    "seyh-samil": "Mahalle sayfası kanibalizasyonunun merkezi: 9 sorguda site yerine mahalle sayfamız çıkıyor. Yapısal adaş yoğunluğu da en yüksek burada (Umut 19 Emlak, Onur Emlak, Nisan Emlak, Turkuaz Mahallesi). 3. Etap sorgusu 6→4 iyileşti ve harita kutusuna girdi.",
    "yavuz-selim": "Ada sayfası kanibalizasyonunun merkezi: 7 sorguda site yerine ada sayfamız çıkıyor (Erkaraca, Genç Avrasya, Keyfim, Utku, Uyum 90, Yunuskent, Yükselen). Mahalle sorgusunda organik 4 + kutu 2 ile ölçülen en iyi mahalle sorgularından.",
    "sehit-osman-avci": "Eryaman'ın en büyük ikinci bayat yığını (29 sayfa, 4.083 gösterim). 11 sorguda görünmez — çoğu güçlü adaş (İçtaş Holding, Soyak GYO, Çamlık/Çiçek ofisleri).",
    "seker": "Küçük ama derli toplu mahalle; en büyük kayıp Zirve Loft ve İzoser (ikisi de adaşsız görünmez). Mahalle sorgusunda organikte yokuz, kutuda 3.",
    "yesilova": "EN GÜÇLÜ MAHALLE: 22 sorgunun 20'si ilk 3'te, ilk 10 dışı hiç yok. Zayıflık eski slug kalıntıları (may-tower, green-place, koçaklar). Mahalle sorgusunda ne organik ne kutu var.",
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

def mah_degisim(v):
    iy = ko = 0
    for s_ in v["s_listesi"]:
        d = DEGISIM.get(s_)
        if not d:
            continue
        if d["fark"] > 0: iy += 1
        elif d["fark"] < 0: ko += 1
    if not iy and not ko:
        return '<span class="alt">—</span>'
    p = []
    if iy: p.append(f'<span class="chip iyi">▲ {iy}</span>')
    if ko: p.append(f'<span class="chip kotu">▼ {ko}</span>')
    return " ".join(p)

satirlar = ""
for key, ad, dosya in TURLAR:
    v = OLCULEN[key]
    satirlar += f"""
    <tr>
      <td class="mah"><strong>{ad}</strong><span class="alt">{v['n']} site sorgusu</span></td>
      <td class="met">{meter(v['i3'], v['o'], v['y'], v['n'])}<span class="pct">%{yuzde(v['i3'], v['n'])} ilk 3</span></td>
      <td class="num">{len(v['bir'])}</td>
      <td class="chips">{chip_org(v['mahq'])} {chip_har(v['mahq'])}</td>
      <td class="dgs">{mah_degisim(v)}</td>
      <td class="met">{dmini(key)}</td>
    </tr>"""

bekleyen_html = ""
for key, ad, dosya in BEKLEYEN:
    if dosya:
        _k = json.load(open(dosya))
        _o = sum(1 for x in _k if x["s"] in son and son[x["s"]]["d"] >= "2026-08-29")
        durum = f"{_o}/{len(_k)} ölçüldü — gece turunda sürecek" if _o else "sırada — gece turunda"
    else:
        durum = "sırada — gece turunda"
    v = DA.get(DKEY[key])
    doz = f"{len(v['bayat'])} bayat · {len(v['dizinsiz'])} dizinsiz" if v else ""
    bekleyen_html += f'<div class="bek"><strong>{ad}</strong><span>{durum}</span><span class="alt">{doz}</span></div>'

etap_html = ""
for i, r in enumerate(ETAPLAR, 1):
    etap_html += f"""<tr><td>Eryaman {i}. Etap emlakçı</td>
    <td>{chip_org(r)}</td><td>{chip_har(r)}</td><td class="alt">{tr_tarih(r['d']) if r else ''}</td></tr>"""

_SINIF_AD = {"biz": "Şirin Gayrimenkul", "portal": "İlan portalları",
             "dizin": "bilgiemlak dizini", "yerel": "Yerel emlak ofisleri",
             "sosyal": "Sosyal / harita"}
rakip_toplam = RAKIP_TOPLAM
birinci_html = ""
for k in ("biz", "portal", "dizin", "yerel", "sosyal"):
    n = RAKIP_SINIF.get(k, 0)
    if not n:
        continue
    p = round(100 * n / RAKIP_TOPLAM) if RAKIP_TOPLAM else 0
    cls = "iyi" if k == "biz" else ("kotu" if k == "portal" else "orta")
    birinci_html += (f'<li><span>{_SINIF_AD[k]}</span>'
                     f'<span><span class="chip {cls}">{n} sorgu · %{p}</span></span></li>')

rakip_html = ""
for d, n in RAKIP_SAY.most_common(8):
    if d.startswith("("):
        continue
    b = RAKIP_BIR.get(d, 0)
    rakip_html += (f'<li><span>{esc(d)}</span>'
                   f'<span class="alt">{n} kez ilk 3′te · {b} kez 1.</span></li>')

def _yuzde_rozet(simdi, onceki):
    if not onceki:
        return '<span class="chip nul">—</span>'
    d = round(100 * (simdi - onceki) / onceki)
    cls = "iyi" if d > 0 else ("kotu" if d < 0 else "nul")
    return f'<span class="chip {cls}">{d:+}%</span>'

sonuc_html = ""
if SONUC:
    sm, on = SONUC["simdi"], SONUC["onceki"]
    e = SONUC["ayrim"]["eryaman"]; y = SONUC["ayrim"]["yenimahalle"]
    hafta = SONUC.get("haftalar") or []
    en = max([h["tik"] for h in hafta] or [1])
    cubuk = "".join(
        f'<span class="hf" style="height:{max(6, round(46*h["tik"]/en))}px" '
        f'title="{h["bas"]} · {h["tik"]} tık"><i>{h["tik"]}</i></span>' for h in hafta)
    sonuc_html = f'''<div class="kartlar">
    <div class="kart"><div class="buyuk">{sm["tik"]:,}</div><div class="etiket">tıklama · 28 gün {_yuzde_rozet(sm["tik"], on["tik"])}</div></div>
    <div class="kart"><div class="buyuk">{sm["gos"]:,}</div><div class="etiket">gösterim {_yuzde_rozet(sm["gos"], on["gos"])}</div></div>
    <div class="kart"><div class="buyuk">%{sm["to"]}</div><div class="etiket">tıklanma oranı (önce %{on["to"]})</div></div>
    <div class="kart"><div class="buyuk">{sm["poz"]}</div><div class="etiket">ortalama pozisyon (önce {on["poz"]})</div></div>
  </div>
  <div class="iki" style="margin-top:16px">
    <div class="pano">
      <h3>Haftalık tıklama</h3>
      <div class="hafta">{cubuk}</div>
      <p class="alt" style="margin:10px 0 0">Soldan sağa son 4 hafta. Toplam yukarı ama son üç hafta düşüyor —
      sebebi aşağıdaki ayrımda.</p>
    </div>
    <div class="pano">
      <h3>Bu trafik nereden geliyor</h3>
      <ul>
        <li><span><strong>Eryaman</strong> <span class="alt">(sitede kalan)</span></span>
            <span><span class="chip iyi">{e["simdi"]["tik"]} tık {_yuzde_rozet(e["simdi"]["tik"], e["onceki"]["tik"])}</span></span></li>
        <li><span><strong>Yenimahalle</strong> <span class="alt">27.08′de siteden kaldırıldı</span></span>
            <span><span class="chip kotu">{y["simdi"]["tik"]} tık</span></span></li>
      </ul>
      <p class="alt" style="margin:10px 0 0">Son 28 günün tıklamasının <strong>%{round(100*y["simdi"]["tik"]/sm["tik"])}′i</strong>
      artık sitede olmayan Yenimahalle sayfalarından geldi. Bu trafik önümüzdeki haftalarda sıfırlanacak —
      beklenen ve kararlaştırılmış bir düşüş. Asıl performans Eryaman satırı: {e["onceki"]["tik"]} → {e["simdi"]["tik"]} tık.</p>
    </div>
  </div>'''

isgal_satirlari = ""
isgal_ozet = ""
if ISGAL:
    _o = ISGAL["olcumler"]
    _top = sum(x["isgal"] for x in _o); _n = sum(x["n"] for x in _o)
    for x in _o:
        oran = x["isgal"] / x["n"] if x["n"] else 0
        cls = "iyi" if oran >= 0.2 else ("orta" if x["isgal"] else "kotu")
        sir = ", ".join(f"{i}." for i in x["siralar"]) or "—"
        har = f'<span class="chip iyi">kutu {x["harita"]}.</span>' if x["harita"] else '<span class="chip kotu">kutuda yok</span>'
        isgal_satirlari += (f'<tr><td><strong>{esc(x["q"])}</strong></td>'
            f'<td><span class="chip {cls}">{x["isgal"]} / {x["n"]}</span></td>'
            f'<td>{sir}</td><td>{har}</td></tr>')
    isgal_ozet = (f'Ölçülen {len(_o)} sorguda ilk sayfadaki {_n} organik sıranın '
                  f'<strong>{_top}′i bize ait (%{round(100*_top/_n)})</strong> · '
                  f'ölçüm {ISGAL["tarih"][8:10]}.{ISGAL["tarih"][5:7]}, gizli pencere.')

def _sira_yazi(p):
    return "yok" if p >= 99 else f"{p}."

def _degisim_satir(d):
    ok = "▲" if d["fark"] > 0 else "▼"
    cls = "iyi" if d["fark"] > 0 else "kotu"
    return (f'<li><span><strong>{esc(site_adi(d["s"]))}</strong> '
            f'<span class="alt">{esc(MAH_AD.get(d["s"].split("/")[0], ""))}</span></span>'
            f'<span class="chip {cls}">{ok} {_sira_yazi(d["onceki"])} → {_sira_yazi(d["simdi"])}</span></li>')

yukselen_html = "".join(_degisim_satir(d) for d in YUKSELEN[:10]) or '<li class="alt">Henüz yükselen yok</li>'
dusen_html = "".join(_degisim_satir(d) for d in DUSEN[:10]) or '<li class="alt">Düşen yok</li>'
degisim_ozet = (f"Yeniden ölçülen {len(DEGISIM)} sorgunun <strong>{len(YUKSELEN)}′i yükseldi</strong>, "
                f"{len(DUSEN)}′i düştü, {len(SABIT)}′i aynı kaldı.")

SERP_DURUM_RENK = {"GÖRÜNMEZ": "kotu", "ada temsil": "orta", "komşu sayfa temsil": "orta",
                   "mahalle sayfası temsil": "orta", "eski slug": "orta", "eski başlık": "nul"}
aday_satirlari = ""
for i, a in enumerate(ADAYLAR[:20], 1):
    sira = "yok" if a["sira"] == 0 else f"{a['sira']}."
    renk = SERP_DURUM_RENK.get(a["tur"], "nul")
    aday_satirlari += (f"<tr><td class=\"num\" style=\"font-size:15px\">{i}</td>"
        f"<td><strong>{esc(a['site'])}</strong></td><td class=\"alt\">{esc(MAH_AD.get(a['mah'], a['mah']))}</td>"
        f"<td><span class=\"chip {renk}\">{esc(a['tur'])}</span></td>"
        f"<td>{sira}</td><td>{a['gos']}</td><td class=\"alt\">{tr_tarih(a['tarama'])}</td></tr>")
aday_sayisi = len(ADAYLAR)

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

# --- görünmezlerin gerçek teşhisi (31.08) ---------------------------------
# Karne 31.08'e kadar "görünmüyor → dizine ekle" varsayıyordu. API denetimi
# bunu çürüttü: görünmeyen 96 sayfanın 57'si zaten dizinde. İki bambaşka sorun
# tek kutuda toplanmıştı; ayrıştırılmadan kota doğru yere gitmiyor.
try:
    _GT = json.load(open("gorunmez-teshis.json"))
except Exception:
    _GT = None
if _GT:
    _sr, _dz = _GT["sira_sorunu"], _GT["dizin_sorunu"]
    _mah_sr = ", ".join(f"{m.replace('-mahallesi','').replace('-',' ').title()} {n}"
                        for m, n in _sr["mah"][:4])
    _mah_dz = ", ".join(f"{m.replace('-mahallesi','').replace('-',' ').title()} {n}"
                        for m, n in _dz["mah"][:4])
    _hata_not = (f' <span class="alt">{_GT["denetlenemedi"]} sayfada Google API hata '
                 f'döndürdü, yeniden sorulacak.</span>' if _GT["denetlenemedi"] else "")
    teshis_html = f"""
  <h2>Görünmeyen sayfalar — iki ayrı sorun</h2>
  <p class="not">SERP turunda kendi adıyla ilk 10′a giremeyen {_sr['n'] + _dz['n']} sayfa
  Search Console′a tek tek soruldu. Çıkan sonuç karnenin eski varsayımını çevirdi:
  <strong>görünmemek her zaman dizin sorunu değil.</strong> İkisinin ilacı farklı, o yüzden
  ayrı sayılıyorlar.{_hata_not}</p>
  <div class="iki">
    <div class="pano">
      <h3>Sıra sorunu — {_sr['n']} sayfa</h3>
      <p class="alt" style="margin:0 0 10px">Google′da <strong>var</strong>, başka sorgularda
      çalışıyor; yalnız kendi site adı sorgusunda ilk 10 dışında.</p>
      <ul>
        <li>Son 28 günde <strong>{format(_sr['gost'], ',').replace(',', '.')}</strong> gösterim, <strong>{_sr['tik']}</strong> tık
            aldılar — ortalama pozisyon {str(_sr['poz']).replace('.', ',')}.</li>
        <li>{_GT['taze_ama_gorunmez']}′i son 7 gün içinde tarandı; yani taze, dizinde ve
            yine de görünmüyor — yeniden taratmak çare değil.</li>
        <li>Yoğunlaştığı mahalleler: {_mah_sr}.</li>
      </ul>
      <p class="alt" style="margin:10px 0 0"><strong>Dizin isteği bunlara boşa gider.</strong>
      Kotayı yakar, sıra kazandırmaz.</p>
    </div>
    <div class="pano">
      <h3>Dizin sorunu — {_dz['n']} sayfa</h3>
      <p class="alt" style="margin:0 0 10px">Google′da <strong>yok</strong>: ya hiç bilinmiyor
      ya keşfedilip dizine alınmamış.</p>
      <ul>
        <li>Son 28 günde <strong>sıfır</strong> gösterim, <strong>sıfır</strong> tık.
            Tam ölü — tek ilaçları dizine girmek.</li>
        <li>Yoğunlaştığı mahalleler: {_mah_dz}.</li>
        <li>Kanıt: 14.08 turunda 8/8, 29.08 turunda 10/10 sayfa istek sonrası aynı gün tarandı.</li>
      </ul>
      <p class="alt" style="margin:10px 0 0"><strong>Günlük kotanın tamamı buraya.</strong>
      ~10/gün ile 3-4 günde biter.</p>
    </div>
  </div>
"""
else:
    teshis_html = ""

# --- kaldıraç defteri: hangi yol ölçüldü, hangisi elendi -------------------
# 31.08: karne "nerede geriyiz"i gösteriyordu ama "ne işe yarar"ı göstermiyordu.
# Bu bölüm her kaldıracı ÖLÇÜMÜYLE birlikte basar; çürüğü de basar ki aynı iş
# ikinci kez denenmesin (içerik ekleme ve iç bağ pompası ikisi de öyle elendi).
try:
    _KD = json.load(open("kaldirac-defteri.json"))["kaldiraclar"]
except Exception:
    _KD = []
_ROZET = {"kanitli": ("işe yarıyor", "iyi"), "curuk": ("çürütüldü", "kotu"),
          "acik": ("açık soru", "orta")}
def _kaldirac_kart(k):
    yazi, sinif = _ROZET.get(k["durum"], ("?", "orta"))
    kisit = f'<p class="alt" style="margin:6px 0 0">{esc(k["kisit"])}</p>' if k.get("kisit") else ""
    return (f'<div class="kaldirac {sinif}"><div class="kbas">'
            f'<strong>{esc(k["ad"])}</strong><span class="krozet">{yazi}</span></div>'
            f'<p>{esc(k["olcum"])}</p>{kisit}'
            f'<p class="kkaynak">{esc(k.get("kaynak",""))}</p></div>')
def _kaldirac_grup(durum):
    v = [k for k in _KD if k["durum"] == durum]
    return "".join(_kaldirac_kart(k) for k in v) or '<p class="alt">kayıt yok</p>'
kaldirac_kanitli = _kaldirac_grup("kanitli")
kaldirac_curuk = _kaldirac_grup("curuk")
kaldirac_acik = _kaldirac_grup("acik")
kaldirac_say = len(_KD)

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
.kgrup {{ font-size:13px; text-transform:uppercase; letter-spacing:.06em; color:var(--m3);
          margin:22px 0 10px; font-weight:600 }}
.kaldiraclar {{ display:grid; gap:12px; grid-template-columns:repeat(auto-fit,minmax(320px,1fr)) }}
.kaldirac {{ background:var(--yuzey); border:1px solid var(--cizgi); border-radius:8px;
             padding:14px 16px; border-left:3px solid var(--m3) }}
.kaldirac.iyi {{ border-left-color:var(--iyi) }}
.kaldirac.kotu {{ border-left-color:var(--kotu) }}
.kaldirac.orta {{ border-left-color:var(--orta-r) }}
.kaldirac p {{ font-size:13.5px; margin:8px 0 0; line-height:1.55 }}
.kbas {{ display:flex; align-items:baseline; justify-content:space-between; gap:10px }}
.krozet {{ font-size:11.5px; padding:2px 8px; border-radius:20px; white-space:nowrap;
           background:var(--orta-z); color:var(--orta-r) }}
.kaldirac.iyi .krozet {{ background:var(--iyi-z); color:var(--iyi) }}
.kaldirac.kotu .krozet {{ background:var(--kotu-z); color:var(--kotu) }}
.kkaynak {{ font-size:11.5px !important; color:var(--m3); margin-top:10px !important;
            font-variant-numeric:tabular-nums }}
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
    <div class="kart"><div class="buyuk">{TOPLAM_N}</div><div class="etiket">site sorgusu ölçüldü · 11/11 mahalle TAMAM</div></div>
    <div class="kart"><div class="buyuk">%{yuzde(TOPLAM_I3, TOPLAM_N)}</div><div class="etiket">sorguların ilk 3′te olduğu oran</div></div>
    <div class="kart"><div class="buyuk">{TOPLAM_BIR}</div><div class="etiket">sorguda organik 1. sıradayız</div></div>
    <div class="kart vurgu"><div class="buyuk">{ana_org}<small>. sıra</small></div><div class="etiket">“eryaman emlakçı” organik (harita {ana_har}.) · {ana_d}</div></div>
  </div>

  <h2>Gerçek sonuç — tıklama</h2>
  <p class="not">Sıra tek başına yanıltıcı: yukarıdaki sıralar iyileşirken tıklama başka yöne gidebilir.
  Bu bölüm Google Search Console′un gerçek rakamlarını gösterir (son 28 gün, bir önceki 28 günle karşılaştırmalı).</p>
  {sonuc_html}

  <h2>Mahalle karnesi</h2>
  <div class="tablo-kabuk"><table>
    <thead><tr><th>Mahalle</th><th>Site sorgularında sıra dağılımı</th><th>Organik 1</th><th>“… mahallesi emlakçı”</th><th>Son ölçümde değişim</th><th>Sayfa tazeliği (dizin)</th></tr></thead>
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
        <li><strong>Mahalle sorgularının organiği.</strong> 11 mahallenin 5′inde “… mahallesi emlakçı”
        aramasında ilk 10′a giremiyoruz (Altay, Devlet, Güzelkent, Şeker, Yeşilova);
        bu sorgularda bizi harita kutusu taşıyor. En iyileri Yavuz Selim (organik 4 + kutu 2) ve Şeyh Şamil (organik 4).</li>
        <li><strong>Üç mahallede harita kutusu da yok.</strong> Göksu, Güzelkent ve Yeşilova′da ne organikte ne kutudayız —
        yorum kampanyasında mahalle adı geçirme önceliği bu üçü.</li>
        <li><strong>Bayat yığınlar.</strong> Göksu (36 sayfa · 4.410 gösterim talebi) ve Şehit Osman Avcı (29 · 4.083)
        en büyük iki tazeleme borcu; ikisi de damla sırasının başında.</li>
        <li><strong>Kendi sayfalarımız birbirinin önüne geçiyor.</strong> 25 sorguda site yerine ada sayfamız
        (en yoğunu Yavuz Selim: 7), 20 sorguda mahalle sayfamız (en yoğunu Şeyh Şamil: 9) listeleniyor.
        Sıra tutuluyor ama site adını arayan kişiye yanlış sayfa açılıyor.</li>
        <li><strong>Eski adres kalıntıları.</strong> 20′den fazla sorguda hâlâ taşınmadan önceki sayfa adresi listeleniyor
        (Yeşilova′da may-tower, green-place, koçaklar; Şeker′de relax-line; ŞOA′da address-göksu, ardıç).</li>
      </ul>
      </ul>
    </div>
    <div class="pano">
      <h3>Dizin damlası — sıradaki 5</h3>
      <ul>{siradaki_html}</ul>
      <p class="alt" style="margin:10px 0 0">Kota: günde ~6-10 istek; son 10 günde {BEKLEYEN_ISTEK} sayfaya istek gönderildi.
      Sayfa envanteri: {DTOT['taze']} taze · {DTOT['orta']} orta · {DTOT['bayat']} bayat · {DTOT['dizinsiz']} dizinsiz (toplam {DTOPLAM}).</p>
    </div>
  </div>

  <h2>1. sayfa işgali</h2>
  <p class="not">Amaç tek bir sayfayı 1. sıraya çıkarmak değil, arama sonuçlarının ilk sayfasını
  Şirin Gayrimenkul′e ait sonuçlarla doldurmak. Bu tabloda site, sahibinden mağazası ve sosyal
  hesaplarımızın <strong>tuttuğu sıra sayısı</strong> var — hangisinin önde olduğu önemsiz.
  Harita kutusu ayrı sayılır.</p>
  <div class="tablo-kabuk"><table>
    <thead><tr><th>Sorgu</th><th>İşgal</th><th>Tuttuğumuz sıralar</th><th>Harita kutusu</th></tr></thead>
    <tbody>{isgal_satirlari}</tbody>
  </table></div>
  <p class="alt" style="margin-top:8px">{isgal_ozet}</p>

  <h2>Kimlerle yarışıyoruz</h2>
  <p class="not">Bu tur ölçülen {rakip_toplam} sorguda birinci sırayı kimin tuttuğu.
  Sonuç net: rakibimiz mahalledeki emlak ofisleri değil, <strong>ilan portalları</strong>.</p>
  <div class="iki">
    <div class="pano">
      <h3>1. sırayı kim tutuyor</h3>
      <ul>{birinci_html}</ul>
    </div>
    <div class="pano">
      <h3>İlk 3′te en sık görülenler</h3>
      <ul>{rakip_html}</ul>
    </div>
  </div>

  <h2>Son ölçümde ne değişti</h2>
  <p class="not">Her sorgu yeniden ölçüldükçe önceki sıra ile karşılaştırılıyor.
  “İlk 10′da yok” en kötü konum sayılır; oradan ilk 10′a girmek en büyük kazanç.
  {degisim_ozet}</p>
  <div class="iki">
    <div class="pano">
      <h3>Yükselenler</h3>
      <ul>{yukselen_html}</ul>
    </div>
    <div class="pano">
      <h3>Düşenler</h3>
      <ul>{dusen_html}</ul>
    </div>
  </div>

  <h2>Dizine eklenecekler</h2>
  <p class="not">SERP turlarında <strong>kayıp</strong> ölçülen sayfalar (görünmez ya da yerine ada/komşu/mahalle
  sayfası çıkan) dizin envanteriyle çaprazlandı. İstek kotası günde ~10, o yüzden sıra önemli:
  önce hiç görünmeyenler, sonra başka sayfanın temsil ettikleri, en sonda yalnız başlığı bayat olanlar.
  Dizinsiz sayfalara kota harcanmıyor (doğal tarama bekleniyor).</p>
  <div class="tablo-kabuk"><table>
    <thead><tr><th>Sıra</th><th>Sayfa</th><th>Mahalle</th><th>SERP durumu</th><th>Google′daki sıra</th><th>Gösterim talebi</th><th>Son tarama</th></tr></thead>
    <tbody>{aday_satirlari}</tbody>
  </table></div>
  <p class="alt" style="margin-top:8px">Tam liste ({aday_sayisi} sayfa) ve dizinsiz sınıfı:
  <code>scratchpad-karne/pws0/dizin-adaylari.md</code> — her tur sonrası yeniden üretilir.</p>

{teshis_html}
  <h2>Sıra nasıl iyileşir</h2>
  <p class="not">Karne nerede geride olduğumuzu gösteriyor; bu bölüm <strong>ne yapmanın işe
  yaradığını</strong> gösteriyor. Her satır bir ölçüme dayanıyor — çürüyenler de duruyor,
  çünkü asıl maliyet aynı işi ikinci kez denemek. Toplam {kaldirac_say} kaldıraç izleniyor.</p>
  <h3 class="kgrup">İşe yaradığı ölçüldü</h3>
  <div class="kaldiraclar">{kaldirac_kanitli}</div>
  <h3 class="kgrup">Açık sorular</h3>
  <div class="kaldiraclar">{kaldirac_acik}</div>
  <h3 class="kgrup">Ölçüldü, çürüdü — tekrar denenmeyecek</h3>
  <div class="kaldiraclar">{kaldirac_curuk}</div>

  <h2>Mahalle ayrıntıları</h2>
  {detaylar}

  <p class="dip">Kaynak: site-emlakçı turu ölçümleri (sonuclar-site-emlakci.jsonl), hedef sorgu ölçümleri,
  GSC dizin envanteri ({DTOPLAM} sayfa, API denetimi). Karne her turdan sonra bu sayfaya yeniden yayınlanır.</p>
</div>
"""
open("bulunabilirlik-karnesi.html", "w").write(HTML)
print("yazıldı: bulunabilirlik-karnesi.html", len(HTML), "bayt")
