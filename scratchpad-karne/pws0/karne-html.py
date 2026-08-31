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
# 31.08 — panel kotayı ZATEN 1. SIRADAKİ sayfalara harcatıyordu. SIRADAKI eski
# kuyruğun ham .md sırasından okunuyordu; o sıralama gösterim talebine göreydi
# ve sayfanın Google'da olup olmadığına ya da hâlihazırda kaçıncı sırada
# olduğuna bakmıyordu. Ölçüm: panelde çıkan 5 sayfanın 3'ü organik 1., 2'si
# 2. sıradaydı. Artık API ile dizin dışı doğrulanmış kuyruktan besleniyor.
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

# DEGİŞİM KARŞILAŞTIRMASININ İKİ ŞARTI (31.08'de eklendi, öncesinde yoktu):
#
# 1) AYNI SORGU olmalı. Anahtar yalnız sayfaydı; sorgu metni turlar arasında
#    düzeltilince (yazım hatası, "Eryaman" ekinin kalkması, blok/site adının
#    değişmesi) iki FARKLI sorgu karşılaştırılıyordu. Ölçüldü: 523 çiftin 31'i
#    böyle. Örnek: Tepe Blokları "Eryaman'lı" sorguda 2., "Eryaman'sız" sorguda
#    6. — panel bunu 4 sıralık DÜŞÜŞ diye basıyordu, oysa iki ayrı sorgu.
#
# 2) AYNI KANAL olmalı. Ölçümler normal pencere, uygulama içi tarayıcı ve gizli
#    sekmeden geliyor; 523 çiftin 84'ü kanal atlıyor. Kanallar denk kabul
#    edilse bile bir sıralık farkı kanal değişimine mi gerçek harekete mi
#    yazacağımızı bilemeyiz, o yüzden karşılaştırma dışı bırakılır.
#
# Her ikisi de "veri yok" demek değil; sayfanın yeni ÖLÇÜMÜ geçerli, yalnız
# önceki ile KIYASLANMIYOR. Sayıları karnede ayrıca raporlanır ki kaybolmasın.
KIYASLANMADI = {"sorgu": 0, "kanal": 0}
DEGISIM = {}   # s -> dict(onceki, simdi, fark, o_tarih, y_tarih)
for s_, v in _gecmis.items():
    v = sorted(v, key=lambda r: r["d"])
    if len(v) < 2 or v[-1]["d"] == v[-2]["d"]:
        continue
    onceki, simdi = v[-2], v[-1]
    if tranahtar.anahtar(onceki.get("q", "")) != tranahtar.anahtar(simdi.get("q", "")):
        KIYASLANMADI["sorgu"] += 1
        continue
    if (onceki.get("kanal") or "normal") != (simdi.get("kanal") or "normal"):
        KIYASLANMADI["kanal"] += 1
        continue
    DEGISIM[s_] = dict(onceki=_sira_puan(onceki), simdi=_sira_puan(simdi),
                       fark=_sira_puan(onceki) - _sira_puan(simdi),
                       o_tarih=onceki["d"], y_tarih=simdi["d"],
                       s=s_, bas=simdi.get("bas"), not_=simdi.get("not", ""))

_tur_olcumleri = [r for s_, r in son.items() if r["d"] >= "2026-08-21"]
RAKIP_SAY, RAKIP_BIR, RAKIP_SINIF, RAKIP_YEREL = _rakip_hesapla(_tur_olcumleri)
RAKIP_TOPLAM = sum(RAKIP_SINIF.values())

# 31.08: değişim iki BAMBAŞKA olayı tek listede topluyordu ve büyük olanlar
# küçükleri eziyordu. "İlk 10'a girmek" 99→1 diye kaydediliyor, yani fark 98;
# panel en büyük 10'u gösterdiği için ekranda YALNIZ giriş/çıkış olayları
# kalıyordu. Sonuç: ilk 10 İÇİNDE gerçek yükseliş yapan 49 sayfanın hiçbiri
# Özgün'e görünmüyordu. Artık üçe ayrılıyor:
#   giriş/çıkış  — sayfanın ilk 10'da olup olmaması (en büyük olay)
#   ilk 10 içi   — sıra hareketi; ±1 gürültü sayılır (veri-sagligi.py, %86)
# Kaldırılan Yenimahalle sayfaları (27.08) hepsinden süzülür.
_YM_MAH = {"ata-mahallesi", "susuz-mahallesi", "cumhuriyet-mahallesi"}
_DIS = lambda d: (d.get("onceki") or 99) >= 99
_IC = lambda d: (d.get("onceki") or 99) < 99 and (d.get("simdi") or 99) < 99
_DEG = [d for d in DEGISIM.values() if d["s"].split("/")[0] not in _YM_MAH]

GIRENLER = sorted([d for d in _DEG if _DIS(d) and (d.get("simdi") or 99) < 99],
                  key=lambda d: (d["simdi"], d["s"]))
CIKANLAR = sorted([d for d in _DEG if not _DIS(d) and (d.get("simdi") or 99) >= 99],
                  key=lambda d: (d["onceki"], d["s"]))
IC_YUKSELEN = sorted([d for d in _DEG if _IC(d) and d["fark"] >= 2], key=lambda d: -d["fark"])
IC_DUSEN = sorted([d for d in _DEG if _IC(d) and d["fark"] <= -2], key=lambda d: d["fark"])
IC_GURULTU = [d for d in _DEG if _IC(d) and 0 < abs(d["fark"]) <= 1]

# GİRİŞ SAYISININ İHTİYAT NOTU (31.08). "İlk 10'a girenler" en gösterişli
# rakam ama tabanı tek bir tura yaslanıyor: girişlerin %94'ü 22-23.08 turuyla
# kıyaslanıyor ve O TURDA "ilk 10 dışı" oranı %33-40'tı, sonraki turlarda
# %13-22. Aradaki farkın ne kadarı gerçek iyileşme, ne kadarı o turun ölçüm
# koşulu BİLİNMİYOR — 21.08 turuyla ortak sayfa olmadığı için ayırt edilemedi.
# Rakam basılır ama tek başına başarı diye okunmasın diye uyarı da basılır.
_gt = _C(d["o_tarih"] for d in GIRENLER)
_eski_taban = sum(v for k, v in _gt.items() if k <= "2026-08-23")
_sifir_oran = {}
for r in rows:
    if not r.get("s") or r["s"].count("/") != 1:
        continue
    g = _sifir_oran.setdefault(r["d"], [0, 0])
    g[0] += 1
    if not r.get("sira"):
        g[1] += 1
def _oran(d):
    v = _sifir_oran.get(d)
    return round(v[1] * 100 / v[0]) if v and v[0] else None
GIRIS_IHTIYAT = {
    "toplam": len(GIRENLER), "eski_taban": _eski_taban,
    "yuzde": round(_eski_taban * 100 / len(GIRENLER)) if GIRENLER else 0,
    "o22": _oran("2026-08-22"), "o23": _oran("2026-08-23"),
    "o28": _oran("2026-08-28"), "o30": _oran("2026-08-30"),
}

# TAVAN ETKİSİ — karnenin en yanıltıcı yeriydi, 31.08'de ölçülüp ayrıldı.
# İlk 10'da hem önce hem sonra ölçülen 293 sayfanın ortalaması 2,04'ten 2,36'ya
# "kötüleşiyor" görünüyordu. Ama o sayfaların %41'i zaten 1. SIRADAYDI: yapısal
# olarak yükselemez, yalnız düşebilirler. Yükselecek yeri olanlara (3. sıra ve
# gerisi) bakınca yön TERSİNE dönüyor: 3,69 → 3,38 ve ≥2 yükselen 16'ya karşı
# ≥2 düşen 5. Ortalama tek başına yanlış karar verdirir; ikisi birlikte basılır.
_IC_HEPSI = [d for d in _DEG if _IC(d)]
_IC_YERI_VAR = [d for d in _IC_HEPSI if d["onceki"] >= 3]


def _ort(v, alan):
    return round(sum(d[alan] for d in v) / len(v), 2) if v else None


TAVAN = {
    "hepsi_n": len(_IC_HEPSI),
    "hepsi_once": _ort(_IC_HEPSI, "onceki"), "hepsi_sonra": _ort(_IC_HEPSI, "simdi"),
    "birinci": sum(1 for d in _IC_HEPSI if d["onceki"] == 1),
    "yeri_var_n": len(_IC_YERI_VAR),
    "yeri_var_once": _ort(_IC_YERI_VAR, "onceki"), "yeri_var_sonra": _ort(_IC_YERI_VAR, "simdi"),
    "yeri_var_yuk": sum(1 for d in _IC_YERI_VAR if d["fark"] >= 2),
    "yeri_var_dus": sum(1 for d in _IC_YERI_VAR if d["fark"] <= -2),
}

# eski adlar geriye dönük kalsın (başka bölümler kullanıyor olabilir)
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

# 31.08 — "Dizine eklenecekler" tablosu YANLIŞ SAYFALARI gösteriyordu.
# Tablo dizin-adaylari.json'u basıyordu; o dosya adayları yalnız SERP KAYBINA
# göre seçiyor, Google'da olup olmadıklarına bakmıyordu. API denetimiyle
# çaprazlanınca 203 adayın 203'ü de DİZİNDE çıktı — yani karne, kendi teşhis
# bölümünün "bunlara kota boşa gider" dediği sayfaları öneriyordu.
# Gerçek ölü sayfalar (API ile doğrulanmış) damla kuyruğunda duruyor ve
# karnede HİÇ görünmüyordu. İki liste kesişimi TAM SIFIR.
# Tablo artık kuyruktan besleniyor; SERP-kayıp listesi ayrı bir "sıra sorunu"
# kutusuna indi.
import re as _re
MAH_AD_HAM = {"tunahan-mahallesi": "Tunahan", "altay-mahallesi": "Altay",
              "devlet-mahallesi": "Devlet", "eryaman-mahallesi": "Eryaman",
              "goksu-mahallesi": "Göksu", "guzelkent-mahallesi": "Güzelkent",
              "sehit-osman-avci-mahallesi": "Şehit Osman Avcı", "seker-mahallesi": "Şeker",
              "seyh-samil-mahallesi": "Şeyh Şamil", "yavuz-selim-mahallesi": "Yavuz Selim",
              "yesilova-mahallesi": "Yeşilova"}
KUYRUK_OLU = []
try:
    _ky = open("DIZIN-DAMLASI-31-08.md").read()
    _mah_bas = None
    for _sat in _ky.split("\n"):
        _m = _re.match(r"^## ([a-z-]+mahallesi)", _sat)
        if _m:
            _mah_bas = _m.group(1)
        _u = _re.match(r"^- \[ \] (https://\S+)", _sat)
        if _u:
            _yol = _u.group(1).split("/mahalleler/")[-1].rstrip("/")
            _parca = _yol.split("/")
            _kok = len(_parca) == 1          # /mahalleler/<mahalle> — mahalle sayfasının kendisi
            KUYRUK_OLU.append({
                "mah": _parca[0],
                "site": MAH_AD_HAM.get(_parca[0], _parca[0]) + " (mahalle sayfası)" if _kok else _parca[1],
                "tur": "bayat taranmış" if _kok else "Google′da yok",
                "renk": "orta" if _kok else "kotu",
                "url": _u.group(1)})
except FileNotFoundError:
    pass

try:
    SIRA_SORUNLULARI = json.load(open("sira-sorunlulari.json"))
except FileNotFoundError:
    SIRA_SORUNLULARI = []

def tr_sayi(n, ondalik=0):
    """Türkçe biçim: binlik nokta, ondalık virgül.

    31.08: karnede aynı sayfada iki biçim birden vardı — GSC kartları
    Python'un {:,} biçimini kullandığı için "2,531" ve "105,951" basıyordu,
    aynı sayfadaki üretilmiş metinlerde ise "1.146" duruyordu. Aynı büyüklüğün
    iki farklı biçimde görünmesi okuyucuyu yanıltır (2,531 → "iki virgül beş"
    diye okunabilir).
    """
    if n is None:
        return "—"
    t = f"{n:,.{ondalik}f}"
    return t.replace(",", "\x00").replace(".", ",").replace("\x00", ".")


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
    # 31.08 DÜZELTMESİ — iki yanlış cümle buradaydı:
    #  (a) "+%130 büyüme" rozetleri: GSC mülkünün verisi 25.06'da başlıyor, yani
    #      "önceki 28 gün" tabanı mülkün ilk ayına denk geliyor. Rozet büyümeyi
    #      değil mülkün rampasını ölçüyordu; yanına uyarı kondu.
    #  (b) "son üç hafta düşüyor — sebebi aşağıdaki ayrımda": ÖLÇÜM BUNU
    #      ÇÜRÜTTÜ. Haftalık ayrımda düşüş HER İKİ grupta da var ve Yenimahalle
    #      27.08'de kaldırılmadan ÖNCE başlamış. Yenimahalle ayrıca gelecek bir
    #      kayıp, ama şimdiki düşüşün sebebi değil.
    _ha = SONUC.get("haftalik_ayrim") or []
    if len(_ha) >= 3:
        _zirve = max(_ha, key=lambda h: h["eryaman"])
        _son = _ha[-1]
        _dus_e = round((_zirve["eryaman"] - _son["eryaman"]) * 100 / _zirve["eryaman"]) if _zirve["eryaman"] else 0
        _zy = max(_ha, key=lambda h: h["yenimahalle"])
        _dus_y = round((_zy["yenimahalle"] - _son["yenimahalle"]) * 100 / _zy["yenimahalle"]) if _zy["yenimahalle"] else 0
        hafta_notu = (
            f"Soldan sağa son {len(hafta)} hafta. Düşüş gerçek ama <strong>sebebi "
            f"Yenimahalle′nin kaldırılması değil</strong>: aynı dönemde Eryaman "
            f"sayfaları da zirveden %{_dus_e} geriledi ({_zirve['eryaman']} → "
            f"{_son['eryaman']} tık/hafta), Yenimahalle %{_dus_y}. İki grup birlikte "
            f"düşüyor ve düşüş 27.08′deki kaldırmadan önce başladı."
        )
    else:
        hafta_notu = f"Soldan sağa son {len(hafta)} hafta."
    _mb = SONUC.get("mulk_baslangic")
    kart_uyari = ""
    if _mb:
        kart_uyari = (f'<p class="alt" style="margin:10px 0 0">Yüzde rozetleri dikkatli okunmalı: '
                      f'Search Console bu siteyi <strong>{tr_tarih(_mb)}</strong> tarihinden beri '
                      f'ölçüyor, yani “önceki 28 gün” dönemi sitenin daha yeni tanındığı ilk aya '
                      f'denk geliyor. Rozet büyümeyi olduğundan büyük gösterir.</p>')
    sonuc_html = f'''<div class="kartlar">
    <div class="kart"><div class="buyuk">{tr_sayi(sm["tik"])}</div><div class="etiket">tıklama · 28 gün {_yuzde_rozet(sm["tik"], on["tik"])}</div></div>
    <div class="kart"><div class="buyuk">{tr_sayi(sm["gos"])}</div><div class="etiket">gösterim {_yuzde_rozet(sm["gos"], on["gos"])}</div></div>
    <div class="kart"><div class="buyuk">%{tr_sayi(sm["to"], 2)}</div><div class="etiket">tıklanma oranı (önce %{tr_sayi(on["to"], 2)})</div></div>
    <div class="kart"><div class="buyuk">{tr_sayi(sm["poz"], 1)}</div><div class="etiket">ortalama pozisyon (önce {tr_sayi(on["poz"], 1)})</div></div>
  </div>
  {kart_uyari}
  <div class="iki" style="margin-top:16px">
    <div class="pano">
      <h3>Haftalık tıklama</h3>
      <div class="hafta">{cubuk}</div>
      <p class="alt" style="margin:10px 0 0">{hafta_notu}</p>
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
    # 31.08: her hareket gerçek değil. Kısa aralıkla yeniden ölçülen ve iki
    # ölçümde de ilk 10'da olan çiftlerin %86'sı ≤1 sıra oynuyor (veri-sagligi.py,
    # n=43). Yani ±1 ölçümün kendi oynaklığı — "gürültü" diye işaretlenir ki
    # peşine düşülmesin. İlk 10'a giriş/çıkış bu kurala GİRMEZ, o gerçek olay.
    ok = "▲" if d["fark"] > 0 else "▼"
    cls = "iyi" if d["fark"] > 0 else "kotu"
    # DİKKAT: "ilk 10 dışı" bu sözlükte 99 ile temsil ediliyor ve bool(99) True.
    # İlk yazımda bool() ile kontrol edilmiş ve giriş/çıkış olayları da "ikisi de
    # ilk 10'da" sayılmıştı; sayısal karşılaştırma şart.
    ikisi_de_ilk10 = (d.get("onceki") or 99) < 99 and (d.get("simdi") or 99) < 99
    gurultu = ikisi_de_ilk10 and abs(d["fark"]) <= 1
    if gurultu:
        cls = "gurultu"
    etiket = ' <span class="gurultu-not">gürültü sınırında</span>' if gurultu else ""
    return (f'<li><span><strong>{esc(site_adi(d["s"]))}</strong> '
            f'<span class="alt">{esc(MAH_AD.get(d["s"].split("/")[0], ""))}</span>{etiket}</span>'
            f'<span class="chip {cls}">{ok} {_sira_yazi(d["onceki"])} → {_sira_yazi(d["simdi"])}</span></li>')

girenler_html = "".join(_degisim_satir(d) for d in GIRENLER[:10]) or '<li class="alt">Yok</li>'
cikanlar_html = "".join(_degisim_satir(d) for d in CIKANLAR[:10]) or '<li class="alt">Yok</li>'
ic_yukselen_html = "".join(_degisim_satir(d) for d in IC_YUKSELEN[:10]) or '<li class="alt">Yok</li>'
ic_dusen_html = "".join(_degisim_satir(d) for d in IC_DUSEN[:10]) or '<li class="alt">Yok</li>'


def _v(x):
    return str(x).replace(".", ",")


tavan_yon = "iyileşme" if TAVAN["yeri_var_sonra"] < TAVAN["yeri_var_once"] else "gerileme"
yukselen_html = "".join(_degisim_satir(d) for d in YUKSELEN[:10]) or '<li class="alt">Henüz yükselen yok</li>'
dusen_html = "".join(_degisim_satir(d) for d in DUSEN[:10]) or '<li class="alt">Düşen yok</li>'
# 31.08: özet cümlesi YUKSELEN/DUSEN üzerinden kuruluyordu ve hemen altındaki
# panellerle tutmuyordu (166/97 diyordu, paneller 139/38 gösteriyordu). Artık
# panellerle AYNI muhasebeden üretiliyor ve kıyaslanamayan çiftleri de sayıyor.
_sabit_ic = len([d for d in _DEG if _IC(d) and d["fark"] == 0])
_kiy = KIYASLANMADI["sorgu"] + KIYASLANMADI["kanal"]
degisim_ozet = (
    f"Bu turda <strong>{len(_DEG)} sorgu</strong> yeniden ölçüldü: "
    f"{len(GIRENLER)}′i ilk 10′a girdi, {len(CIKANLAR)}′i çıktı; ilk 10 içinde "
    f"{len(IC_YUKSELEN)}′i yükseldi, {len(IC_DUSEN)}′i düştü, {len(IC_GURULTU)}′i ±1 "
    f"sınırında kaldı (gürültü), {_sabit_ic}′i hiç kıpırdamadı. "
    f"Ayrıca <strong>{_kiy} ölçüm kıyaslama dışı</strong> bırakıldı: "
    f"{KIYASLANMADI['sorgu']}′inde sorgu metni turlar arasında değişmiş, "
    f"{KIYASLANMADI['kanal']}′inde ölçüm başka bir pencereden yapılmış — "
    f"ikisi de farklı şeyleri karşılaştırmak olurdu.")

SERP_DURUM_RENK = {"GÖRÜNMEZ": "kotu", "ada temsil": "orta", "komşu sayfa temsil": "orta",
                   "mahalle sayfası temsil": "orta", "eski slug": "orta", "eski başlık": "nul"}
aday_satirlari = ""
for i, a in enumerate(KUYRUK_OLU[:20], 1):
    aday_satirlari += (f"<tr><td class=\"num\" style=\"font-size:15px\">{i}</td>"
        f"<td><strong>{esc(a['site'])}</strong></td>"
        f"<td class=\"alt\">{esc(MAH_AD.get(a['mah'], a['mah']))}</td>"
        f"<td><span class=\"chip {a['renk']}\">{esc(a['tur'])}</span></td></tr>")
aday_sayisi = len(KUYRUK_OLU)

# SERP'te kayıp ama dizinde olanlar — kota harcanmaz, ayrı kutu
sira_sorun_html = "".join(
    f"<li><span><strong>{esc(a['site'])}</strong> "
    f"<span class=\"alt\">{esc(MAH_AD.get(a['mah'], a['mah']))}</span></span>"
    f"<span class=\"chip\">{a['gos']} gösterim</span></li>"
    for a in SIRA_SORUNLULARI[:8]) or '<li class="alt">Yok</li>'
sira_sorun_sayi = len(SIRA_SORUNLULARI)

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

# 31.08: bu rakamlar ELLE yazılıydı ("25 sorguda ada, 20 sorguda mahalle") ve
# ölçümle tutmuyordu — betiğin kendi kuralı "elle rakam girilmez" diyor.
_ada_v = [r for r in son.values() if "/adalar/" in (r.get("u") or "")]
_mah_v = [r for r in son.values()
          if _re.fullmatch(r"/mahalleler/[^/]+/?", (r.get("u") or "") or "x") is not None]
_ada_m = _C(r["s"].split("/")[0] for r in _ada_v)
_mah_m = _C(r["s"].split("/")[0] for r in _mah_v)
def _enyogun(c):
    if not c:
        return "—"
    k, v = c.most_common(1)[0]
    return f"{MAH_AD.get(k, k)}: {v}"
yamyam_cumle = (
    f"{len(_ada_v)} sorguda site yerine ada sayfamız (en yoğunu {_enyogun(_ada_m)}), "
    f"{len(_mah_v)} sorguda mahalle sayfamız (en yoğunu {_enyogun(_mah_m)}) listeleniyor. "
    f"Sıra tutuluyor ama site adını arayan kişiye yanlış sayfa açılıyor.")

siradaki_html = "".join(
    f'<li><span><strong>{esc(a["site"])}</strong> '
    f'<span class="alt">{esc(MAH_AD.get(a["mah"], a["mah"]))}</span></span>'
    f'<span class="chip {a["renk"]}">{esc(a["tur"])}</span></li>'
    for a in KUYRUK_OLU[:5]) or '<li class="alt">Kuyruk boş</li>'

ana_org = ANA["sira"] if ANA else "?"
ana_har = ANA.get("h", "?") if ANA else "?"
ana_d = tr_tarih(ANA["d"]) if ANA else ""

# --- sayfa türü verimi (31.08) --------------------------------------------
# Karne sayfaları tek tek ölçüyordu ama hangi AİLENİN emeğe değdiğini
# göstermiyordu. Ayrım kararı değiştiriyor: ada sayfaları adres sayısı olarak
# site sayfaları kadar ama sayfa başına tıkları on üçte biri.
try:
    _TV = json.load(open("sayfa-turu-verimi.json"))["satirlar"]
except Exception:
    _TV = None
if _TV:
    _en = max(r["tik_sayfa"] for r in _TV) or 1
    _tv_satir = ""
    for r in _TV:
        _pay = max(2, round(100 * r["tik_sayfa"] / _en))
        _vurgu = ' class="vurgu"' if r["tur"] in ("site", "ada") else ""
        _tv_satir += (
            f'<tr{_vurgu}><td><strong>{esc(r["ad"])}</strong></td>'
            f'<td class="num">{tr_sayi(r["sayfa"])}</td>'
            f'<td class="num">{tr_sayi(r["gos"])}</td>'
            f'<td class="num">{tr_sayi(r["tik"])}</td>'
            f'<td class="num">{tr_sayi(r["tik_sayfa"], 2)}</td>'
            f'<td><div class="bar"><i style="width:{_pay}%"></i></div></td></tr>')
    _site = next((r for r in _TV if r["tur"] == "site"), None)
    _ada = next((r for r in _TV if r["tur"] == "ada"), None)
    _tv_not = ""
    if _site and _ada and _ada["tik_sayfa"]:
        _kat = round(_site["tik_sayfa"] / _ada["tik_sayfa"])
        _tv_not = (f"Ada sayfaları adres sayısı olarak site sayfalarıyla neredeyse eşit "
                   f"({tr_sayi(_ada['sayfa'])}′e {tr_sayi(_site['sayfa'])}) ama sayfa başına "
                   f"<strong>{_kat} kat</strong> az tık getiriyor "
                   f"({tr_sayi(_ada['tik_sayfa'], 2)}′e {tr_sayi(_site['tik_sayfa'], 2)}). "
                   f"Yine de sitemap′te kalıyorlar: 31.08 ölçümünde tarama bütçesi yemedikleri "
                   f"görüldü (son 7 günde site 10/30, ada 4/30 tarandı) ve çıkarmanın ölçülmüş "
                   f"bir kazancı yok.")
    turverim_html = f"""
  <h2>Hangi sayfa ailesi trafiği taşıyor</h2>
  <p class="not">Son 28 gün, Search Console. Kaldırılan Yenimahalle sayfaları hariç.
  Sütunlardan en önemlisi <strong>adres başına tık</strong> — toplam sayı çok adresli
  aileleri olduğundan büyük gösterir.</p>
  <div class="tablo-kabuk"><table>
    <thead><tr><th>Aile</th><th class="num">Adres</th><th class="num">Gösterim</th>
    <th class="num">Tık</th><th class="num">Adres başına tık</th><th>&nbsp;</th></tr></thead>
    <tbody>{_tv_satir}</tbody>
  </table></div>
  <p class="alt" style="margin-top:8px">{_tv_not}</p>
"""
else:
    turverim_html = ""

# --- veri sağlığı (31.08) -------------------------------------------------
# Tek günde ÜÇ sessiz veri hatası çıktı (hayalet kayıtlar, Türkçe İ, büyük harf
# duyarlı filtre) ve üçü de karneyi yanlış gösterdi. Sağlık denetimi her üretimde
# çalışır; geçmeyen rakama güvenilmez. Üreteci: veri-sagligi.py
try:
    _VS = json.load(open("veri-sagligi.json"))
except Exception:
    _VS = None
if _VS:
    _agir = [b for b in _VS["bulgular"] if b["agir"] and not b["temiz"]]
    _uyari = [b for b in _VS["bulgular"] if not b["agir"] and not b["temiz"]]
    _temiz = [b for b in _VS["bulgular"] if b["temiz"]]

    def _vs_satir(b):
        sinif = "kotu" if b["agir"] else "orta"
        orn = ""
        if b.get("ornek"):
            orn = ('<span class="alt" style="display:block;margin-top:4px">'
                   + esc(" · ".join(b["ornek"][:3])) + "</span>")
        return (f'<li><span><strong>{esc(b["ad"])}</strong>'
                f'<span class="alt" style="display:block">{esc(b["aciklama"])}</span>{orn}</span>'
                f'<span class="chip {sinif}">{b["adet"]}</span></li>')

    _vs_sorun = "".join(_vs_satir(b) for b in _agir + _uyari) or \
        '<li class="alt">Denetimlerin hepsi temiz.</li>'
    _vs_temiz = ", ".join(esc(b["ad"].lower()) for b in _temiz) or "—"
    _yas = {k: v for k, v in _VS["yas"]}
    _gu = _VS.get("gurultu") or {}
    _vs_gurultu = ""
    if _gu.get("oran") is not None:
        _vs_gurultu = (f'Kısa aralıklı {_gu["cift"]} yeniden ölçümün '
                       f'<strong>%{_gu["oran"]}′i ≤1 sıra oynuyor</strong> — bu yüzden bir sıralık '
                       f'hareket gürültü sayılıyor. Ayrıca {_gu["giris_cikis"]} giriş/çıkış olayı var, '
                       f'onlar gerçek.')
    saglik_html = f"""
  <h2>Verinin sağlığı</h2>
  <p class="not">Karnedeki her rakam ölçüm dosyalarından üretiliyor; o dosyalar
  bozulursa karne çalışmaya devam eder ama <strong>yanlış söyler</strong>. 31.08′de tek
  günde üç sessiz hata çıktı, bu yüzden her üretimde şu denetimler koşuyor.</p>
  <div class="iki">
    <div class="pano">
      <h3>Kapsama</h3>
      <ul>
        <li><span>Ölçüm kuyruğundaki sayfa</span><span class="chip">{_VS["kuyruk"]}</span></li>
        <li><span>En az bir kez ölçülmüş</span><span class="chip iyi">{_VS["olculen"]}</span></li>
        <li><span>Son 7 gün içinde ölçülmüş</span><span class="chip iyi">{_yas.get("0-7 gün", 0)}</span></li>
        <li><span>8-14 gündür ölçülmemiş</span><span class="chip">{_yas.get("8-14 gün", 0)}</span></li>
        <li><span>15 günden eski</span><span class="chip">{_yas.get("15-30 gün", 0) + _yas.get("30+ gün", 0)}</span></li>
      </ul>
      <p class="alt" style="margin:10px 0 0">{_vs_gurultu}</p>
    </div>
    <div class="pano">
      <h3>Bulunan sorunlar</h3>
      <ul>{_vs_sorun}</ul>
      <p class="alt" style="margin:10px 0 0">Temiz çıkan denetimler: {_vs_temiz}.</p>
    </div>
  </div>
"""
else:
    saglik_html = ""

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
    _hayalet = _GT.get("hayalet", 0)
    _hayalet_not = (f' <strong>{_hayalet} kayıt listeden çıkarıldı:</strong> ölçüm '
                    f'tarihçesinde duran ama sitede karşılığı olmayan eski adreslerdi '
                    f'(canlıda 404). Onlar dizin dışı değil, YOK — kota harcanmayacak.'
                    if _hayalet else "")
    _hata_not = (f' <span class="alt">{_GT["denetlenemedi"]} sayfada Google API hata '
                 f'döndürdü, yeniden soruldu.</span>' if _GT["denetlenemedi"] else "")
    teshis_html = f"""
  <h2>Görünmeyen sayfalar — iki ayrı sorun</h2>
  <p class="not">SERP turunda kendi adıyla ilk 10′a giremeyen {_sr['n'] + _dz['n']} sayfa
  Search Console′a tek tek soruldu. Çıkan sonuç karnenin eski varsayımını çevirdi:
  <strong>görünmemek her zaman dizin sorunu değil.</strong> İkisinin ilacı farklı, o yüzden
  ayrı sayılıyorlar.{_hayalet_not}{_hata_not}</p>
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
.chip.gurultu {{ background:var(--zemin2,transparent); color:var(--m3); border:1px solid var(--cizgi) }}
/* 31.08: .hafta/.hf sınıfları basılıyordu ama CSS'leri HİÇ YOKTU — grafik
   ekranda "697698598538" diye bitişik rakam yığını olarak görünüyordu. */
.hafta {{ display:flex; align-items:flex-end; gap:10px; height:64px; margin-top:6px }}
.hf {{ flex:1; display:flex; align-items:flex-start; justify-content:center;
       background:var(--iyi-z); border:1px solid var(--iyi); border-bottom:none;
       border-radius:4px 4px 0 0; min-width:0 }}
.hf i {{ font-style:normal; font-size:11px; color:var(--iyi); font-variant-numeric:tabular-nums;
         transform:translateY(-15px); white-space:nowrap }}
.gurultu-not {{ font-size:11px; color:var(--m3); font-style:italic }}
.bar {{ background:var(--cizgi); border-radius:3px; height:8px; min-width:60px }}
.bar i {{ display:block; height:100%; background:var(--iyi); border-radius:3px }}
tr.vurgu td {{ background:var(--yuzey) }}
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
        <li><strong>Kendi sayfalarımız birbirinin önüne geçiyor.</strong> {yamyam_cumle}</li>
        <li><strong>Eski adres kalıntıları.</strong> 20′den fazla sorguda hâlâ taşınmadan önceki sayfa adresi listeleniyor
        (Yeşilova′da may-tower, green-place, koçaklar; Şeker′de relax-line; ŞOA′da address-göksu, ardıç).</li>
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
  <p class="not">Burada iki bambaşka olay var ve bir arada gösterilince büyük olan
  küçüğü eziyordu: bir sayfanın <strong>ilk 10′a girmesi</strong> ile <strong>ilk 10
  içinde sıra değiştirmesi</strong>. Birincisi 99′dan 1′e atlamak gibi kaydedildiği
  için listeyi tek başına dolduruyor, ikincisi hiç görünmüyordu. Artık ayrı.
  {degisim_ozet}</p>

  <h3 class="kgrup">İlk 10′a giriş ve çıkış — en büyük olay</h3>
  <div class="iki">
    <div class="pano">
      <h3>İlk 10′a girenler <span class="krozet">{len(GIRENLER)}</span></h3>
      <ul>{girenler_html}</ul>
      <p class="alt" style="margin:10px 0 0"><strong>İhtiyatla oku.</strong> Bu girişlerin
      %{GIRIS_IHTIYAT['yuzde']}′i ({GIRIS_IHTIYAT['eski_taban']} tanesi) 22-23 Ağustos turuyla
      kıyaslanıyor ve o turda “ilk 10′da yok” oranı %{GIRIS_IHTIYAT['o22']}-{GIRIS_IHTIYAT['o23']}′ti;
      sonraki turlarda %{GIRIS_IHTIYAT['o28']}-{GIRIS_IHTIYAT['o30']}. Farkın ne kadarı gerçek
      iyileşme, ne kadarı o turun ölçüm koşulu ayırt edilemedi — o tur 21.08 turuyla ortak sayfa
      içermiyor, karşılaştırılacak taban yok.</p>
    </div>
    <div class="pano">
      <h3>İlk 10′dan çıkanlar <span class="krozet">{len(CIKANLAR)}</span></h3>
      <ul>{cikanlar_html}</ul>
    </div>
  </div>

  <h3 class="kgrup">İlk 10 içinde hareket — ±1 gürültü sayılır</h3>
  <p class="not" style="margin-bottom:12px">Kısa aralıkla yeniden ölçülen ve iki
  ölçümde de ilk 10′da olan sayfaların <strong>%86′sı ≤1 sıra oynuyor</strong>; yani
  bir sıralık hareket ölçümün kendi dalgalanması, peşine düşülmez. Bu turda
  {len(IC_GURULTU)} sayfa o aralıkta kaldı ve listeye alınmadı.</p>
  <div class="iki">
    <div class="pano">
      <h3>İçeride yükselenler <span class="krozet">{len(IC_YUKSELEN)}</span></h3>
      <ul>{ic_yukselen_html}</ul>
    </div>
    <div class="pano">
      <h3>İçeride düşenler <span class="krozet">{len(IC_DUSEN)}</span></h3>
      <ul>{ic_dusen_html}</ul>
    </div>
  </div>

  <div class="pano" style="margin-top:14px">
    <h3>Ortalama neden kötüleşmiş görünüyor — tavan etkisi</h3>
    <p class="alt" style="margin:8px 0 0">İlk 10′da hem önce hem sonra ölçülen
    <strong>{TAVAN['hepsi_n']}</strong> sayfanın ortalama sırası
    {_v(TAVAN['hepsi_once'])} → {_v(TAVAN['hepsi_sonra'])}, yani kâğıt üzerinde kötüleşmiş.
    Ama bu sayfaların <strong>{TAVAN['birinci']}′i zaten 1. sıradaydı</strong> —
    yükselecek yerleri yoktu, yalnız düşebilirlerdi.</p>
    <p class="alt" style="margin:10px 0 0">Yükselecek yeri olanlara (3. sıra ve
    gerisinden başlayan {TAVAN['yeri_var_n']} sayfa) bakınca yön tersine dönüyor:
    ortalama <strong>{_v(TAVAN['yeri_var_once'])} → {_v(TAVAN['yeri_var_sonra'])}</strong>,
    ≥2 sıra yükselen {TAVAN['yeri_var_yuk']}′e karşı düşen {TAVAN['yeri_var_dus']}.
    Yani gerçek yön {tavan_yon}. Tek başına ortalamaya bakmak burada yanlış karar
    verdirirdi.</p>
  </div>

  <h2>Dizine eklenecekler</h2>
  <p class="not">Bu tablo <strong>yalnız Google′da gerçekten olmayan</strong> sayfaları
  gösterir; her satır Search Console′a tek tek sorulup doğrulanmıştır. Günlük istek kotası
  ~10 olduğu için sıra önemli: önce hedef sorgu sayfası olan bayat mahalleler, sonra
  mahalle kümesine göre ölü site sayfaları.</p>
  <div class="tablo-kabuk"><table>
    <thead><tr><th>Sıra</th><th>Sayfa</th><th>Mahalle</th><th>Durum</th></tr></thead>
    <tbody>{aday_satirlari}</tbody>
  </table></div>
  <p class="alt" style="margin-top:8px">Tam kuyruk ({aday_sayisi} sayfa):
  <code>scratchpad-karne/pws0/DIZIN-DAMLASI-31-08.md</code></p>

  <div class="pano" style="margin-top:16px">
    <h3>Bunlara istek GÖNDERİLMEZ — {sira_sorun_sayi} sayfa</h3>
    <p class="alt" style="margin:8px 0 10px">31.08′e kadar bu tabloda bu sayfalar vardı ve
    yanlıştı. SERP′te kayıp oldukları için aday sayılıyorlardı, ama Search Console′a
    sorulunca <strong>203′ünün 203′ü de dizinde çıktı</strong>. Dertleri dizin değil sıra;
    istek göndermek kotayı yakar, hiçbir şey kazandırmaz. En çok gösterim alanlar:</p>
    <ul>{sira_sorun_html}</ul>
  </div>

{turverim_html}
{saglik_html}
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
