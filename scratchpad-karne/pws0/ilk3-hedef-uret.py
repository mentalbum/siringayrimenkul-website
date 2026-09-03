#!/usr/bin/env python3
"""İlk 3 hedefi — "ilk 3'te DOĞRU sayfası olmayan" her sorgunun tek tek sınıfı.

Özgün'ün 02.09 isteği: "bizi aratmalarda ilk 3'e taşımaya çalış, ilk 3'te
çıkmayanlarda." Karne "ilk 3'te %68" diyor ama o sıraların bir kısmını YANLIŞ
sayfamız tutuyor (dogru-sayfa.py). Bu betik iki kuyruğu birleştirip her sorguyu
tek satırda sınıflar; sınıf başına sayar; kanıtlı/ölçülmüş kaldıracı yazar.

Sorgular:
  - kuyruk-site-emlakci.json         "<site adı> emlakçı" (11 Eryaman mahallesi)
  - hedef-sorgular.json (satirlar)   5 etap + 11 mahalle + "eryaman emlakçı"

SINIFLAR (Özgün'ün istediği A–E + iki zorunlu ek):
  A   ilk 10 dışı, DİZİN DIŞI             → kaldıraç: damla (kanıtlı)
  B   ilk 10 dışı, dizinde (sıra sorunu)  → kaldıraç: ? (boş; analiz ekseni dolduracak)
  AB? ilk 10 dışı, dizin durumu DENETLENMEDİ (A mı B mi bilinmiyor — uydurulmaz)
  C   4-10'da doğru sayfa (alt: 4-5 / 6-10) → ? (boş)
  D   ilk 3'te ama YANLIŞ sayfa (alt: ada / mahalle / eski / baska_site / ana_sayfa / diger)
      → doğru sayfa yerine yanlış sayfa çıkıyor; 07.09 sonrası başlık hizası,
        eski adres için 301 sindirme
  F   4-10'da YANLIŞ sayfa (A–E şemasında yeri yoktu; D'nin mekanizması + sıra sorunu)
  E   ilk 3'te doğru sayfa (hedef dışı, sayım için)
  Ö   hiç ölçülmemiş (kuyrukta var, sonuç dosyasında yok)

D ve F içinde doğru sayfası DİZİN DIŞI olanlar (dogru_sayfa_dizin_disi=true) ayrı
işaretlenir: onlarda kaldıraç başlık hizası değil DAMLA'dır — 31.08 damla-A-sınıfı
ölçütü ("slot zaten bizim, doğru sayfa dizinsiz"). Başlık dizinde olmayan sayfaya işlemez.

"Doğru sayfa": site sorgusunda /mahalleler/<s>; kuyruktaki `es` alanı aynı adı
paylaşan ikinci kaydı taşır — o da çıkarsa doğru sayılır ama `adas_es` ile
işaretlenir. Hedef sorguda `beklenen_sayfa`.

"Doğru sayfa aynı SERP'te var mı?" — ölçüm JS'i yalnız İLK sonucumuzun URL'sini
yazar; ilk3u ilk 3 sonucun URL'sini (bazen yalnız alan adını) tutar; isgal 1.
sayfadaki sonuç sayımızdır. Bu üçünden çıkarılabilen kadarı yazılır, gerisi
"bilinmiyor" — rakam uydurulmaz.

Dizin durumu / son tarama: <KARNE_SCRATCH>/*-denetim.tsv (gsc-api denetle-dosya
çıktıları; aynı URL birden çok dosyadaysa dosya mtime'ı en yeni olan kazanır,
API 500 satırı sağlam bir kaydı ezmez). Orada yoksa dizin-tarama-2026-08-27.tsv
(27.08 tam envanteri, ESKİ diye etiketlenir). O da yoksa "denetlenmedi".

28g gösterim: sayfa-sorgu28.tsv (sorgu × sayfa) + sayfalar28.tsv (sayfa toplamı).
NOT: 02.09 çekiminde 3.983 sorgu×sayfa satırının HİÇBİRİ "<site adı> emlakçı"
biçiminde değil — bu sorgu sınıfının GSC'de görünür talebi yok (memory: 'emlakçı'
sınıfı gösterimin %2'si). Bu yüzden satırda hem sorgu bazlı (çoğu 0) hem sayfa
bazlı gösterim var.

Girdi : yukarıdakiler + DIZIN-DAMLASI-31-08.md, DIZINE-EKLENECEKLER.md (istek
        durumu), gorunmez-teshis.json (olu_liste), canli-durum.tsv (eski adres 308),
        content/siteler/*.json (hayalet denetimi)
Çıktı : ilk3-hedef.json  (+ stdout özet tablosu)
Çalıştırma: KARNE_SCRATCH=<scratchpad> python3 ilk3-hedef-uret.py
"""
import collections
import datetime
import glob
import json
import os
import re
import sys

KOK = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, KOK)
from tranahtar import anahtar  # noqa: E402
from pencere import pencere_oku  # noqa: E402

S = os.environ.get("KARNE_SCRATCH") or (
    "/private/tmp/claude-501/-Users-ozgun-websitem/"
    "8215cac7-7362-431c-ac61-1ec168bf300e/scratchpad")
if not os.path.isdir(S):
    sys.exit("KARNE_SCRATCH ayarla (denetim tsv'lerinin ve GSC tsv'lerinin durduğu klasör)")

ICERIK = os.path.normpath(os.path.join(KOK, "..", "..", "content", "siteler"))
ALAN = "https://www.siringayrimenkul.com"
BUGUN = datetime.date.today()
YENIMAHALLE = ("ata-mahallesi", "susuz-mahallesi", "cumhuriyet-mahallesi", "ata", "susuz", "cumhuriyet")

SINIF_AD = {
    "A": "İlk 10 dışı — dizin dışı (damla)",
    "B": "İlk 10 dışı — dizinde (sıra sorunu)",
    "AB?": "İlk 10 dışı — dizin durumu denetlenmedi",
    "C": "4-10'da doğru sayfa",
    "D": "İlk 3'te ama YANLIŞ sayfa",
    "F": "4-10'da YANLIŞ sayfa",
    "E": "İlk 3'te doğru sayfa (hedef dışı)",
    "Ö": "Ölçülmedi",
}
TUR_AD = {
    "dogru": "doğru site sayfası", "dogru_es": "doğru (aynı adlı ikinci kaydımız, es)",
    "ada": "ada sayfamız", "mahalle": "mahalle sayfamız", "eski": "taşınmadan önceki adres",
    "baska_site": "başka site sayfamız", "ana_sayfa": "ana sayfa", "diger": "başka sayfamız (/siteler, blog vb.)",
    "belirsiz": "ölçüm kırıntısı (URL okunamadı)", "yok": "ilk 10'da yok",
}
KALDIRAC = {
    "A": "DAMLA — GSC dizin isteği. Ölçüm: istek→aynı gün tarama 14.08 8/8, 29.08 10/10; "
         "istek→sıra 31.08 tam-geçmiş denetiminde 6'da 3 (kaldirac-defteri.json). Kota ~10/gün.",
    "B": "",
    "AB?": "önce denetim (gsc-api denetle-dosya) — A/B ayrımı yapılmadan kaldıraç yazılmaz",
    "C": "",
    "D": "doğru sayfa yerine yanlış sayfa çıkıyor → 07.09 sonrası başlık hizası (title/H1 07.09'a kadar donuk)",
    "D-eski": "eski adres çıkıyor → 301 sindirme: eski adresin yeniden taranması gerekir; dizindeki sayfaya istek "
              "aynı gün tarama getirmedi (02.09), yani kotayla değil doğal taramayla; 07.09 sonrası başlık hizası da geçerli",
    "F": "",
    "D-dizin-disi": "DAMLA — doğru sayfa DİZİN DIŞI (slot zaten bizim, yanlış URL tutuyor; 31.08 damla-A-sınıfı ölçütü). "
                    "Başlık hizası dizinde olmayan sayfaya işlemez; önce dizin isteği (istek→aynı gün tarama 8/8, 10/10).",
    "E": "hedef dışı — ilk 3'te doğru sayfa",
    "Ö": "önce ölçüm",
}


# ---------------------------------------------------------------- yardımcılar
def yol(u):
    """URL/yol → alan adsız, sondaki eğik çizgisiz yol. '' → '/'."""
    if not u:
        return None
    u = u.strip()
    if u.startswith("http"):
        u = re.sub(r"^https?://(www\.)?siringayrimenkul\.com", "", u)
    u = u.split("?")[0].rstrip("/")
    return u or "/"


def serp_u(u):
    """Ölçüm kaydındaki u alanını yola çevirir; cite: kırıntılarını çözer."""
    if not u:
        return None
    if u.startswith("cite:"):
        if "(ana sayfa)" in u:
            return "/"
        return "belirsiz:" + u
    if "…" in u or "..." in u:
        return "belirsiz:" + u
    return yol(u)


def sayfa_turu(p, dogru, es_yollari):
    if p is None:
        return "yok"
    if p.startswith("belirsiz:"):
        return "belirsiz"
    if p == dogru:
        return "dogru"
    if p in es_yollari:
        return "dogru_es"
    if p == "/":
        return "ana_sayfa"
    if "/adalar/" in p:
        return "ada"
    if re.fullmatch(r"/mahalleler/[^/]+", p):
        return "mahalle"
    if "/mahalleler/" not in p:
        return "diger"
    m = re.match(r"/mahalleler/([^/]+)/", p)
    if m and not m.group(1).endswith("-mahallesi"):
        return "eski"
    return "baska_site"


def tarih_kisa(t):
    return t[:10] if t and t not in ("-", "") else None


# ---------------------------------------------------------------- denetimler
def denetimleri_yukle():
    """<S>/*-denetim.tsv → yol → kayıt. Dosya mtime'ı en yeni olan kazanır; HATA sağlamı ezmez."""
    kayit = {}
    dosyalar = sorted(glob.glob(os.path.join(S, "*-denetim.tsv")), key=os.path.getmtime)
    for f in dosyalar:
        dosya = os.path.basename(f)
        dtarih = datetime.date.fromtimestamp(os.path.getmtime(f)).isoformat()
        for L in open(f, encoding="utf-8"):
            p = L.rstrip("\n").split("\t")
            if len(p) < 3:
                continue
            u = yol(p[0])
            if p[1] == "HATA":
                if u in kayit and kayit[u]["durum"] != "HATA":
                    continue
                kayit[u] = {"durum": "HATA", "kapsam": "API hatası (500)", "son_tarama": None,
                            "canonical": None, "kaynak": f"{dosya} ({dtarih})", "denetim_tarihi": dtarih}
                continue
            if len(p) < 4:
                continue
            kayit[u] = {"durum": p[1], "kapsam": p[2], "son_tarama": tarih_kisa(p[3]),
                        "canonical": yol(p[4]) if len(p) > 4 and p[4] not in ("-", "") else None,
                        "kaynak": f"{dosya} ({dtarih})", "denetim_tarihi": dtarih}
    return kayit, [os.path.basename(f) for f in dosyalar]


def envanter_2708():
    """dizin-tarama-2026-08-27.tsv (554 sayfa) — taze denetim yoksa ESKİ kaynak."""
    e = {}
    f = os.path.join(KOK, "dizin-tarama-2026-08-27.tsv")
    if not os.path.exists(f):
        return e
    for L in open(f, encoding="utf-8"):
        p = L.rstrip("\n").split("\t")
        if len(p) < 4:
            continue
        e[yol(p[0])] = {"durum": p[1], "kapsam": p[2], "son_tarama": tarih_kisa(p[3]), "canonical": None,
                        "kaynak": "dizin-tarama-2026-08-27.tsv (27.08 envanteri, ESKİ)", "denetim_tarihi": "2026-08-27"}
    return e


def damla_yukle():
    """DIZIN-DAMLASI-31-08.md + DIZINE-EKLENECEKLER.md → yol → [{dosya, isaret, not}]."""
    d = collections.defaultdict(list)
    for dosya in ("DIZIN-DAMLASI-31-08.md", "DIZINE-EKLENECEKLER.md"):
        f = os.path.join(KOK, dosya)
        if not os.path.exists(f):
            continue
        for L in open(f, encoding="utf-8"):
            m = re.match(r"^- \[( |x)\] (https?://\S+)(.*)$", L.rstrip("\n"))
            if not m:
                continue
            nott = m.group(3)
            nott = re.sub(r"<!--.*?-->", "", nott).strip()
            nott = nott.lstrip("← ").strip()
            d[yol(m.group(2))].append({"dosya": dosya, "isaret": m.group(1) == "x", "not": nott})
    return d


def istek_durumu(p, damla, olu_liste):
    """A sınıfı için: istek gitti mi, kuyrukta mı."""
    kayitlar = damla.get(p, [])
    for k in kayitlar:
        n = k["not"]
        if "istek gönderildi" in n:
            m = re.search(r"(\d\d\.\d\d)", n)
            return f"istek gönderildi {m.group(1) if m else '?'} ({k['dosya']})"
    for k in kayitlar:
        n = k["not"]
        if "DİZİNDE" in n or "KENDİLİĞİNDEN" in n:
            m = re.search(r"(\d\d\.\d\d)", n)
            return f"kendiliğinden dizine girdi/tarandı {m.group(1) if m else ''} ({k['dosya']})".replace("  ", " ")
    for k in kayitlar:
        if not k["isaret"] and k["dosya"] == "DIZIN-DAMLASI-31-08.md":
            return "damla kuyruğunda, AÇIK (DIZIN-DAMLASI-31-08.md)"
    for k in kayitlar:
        if not k["isaret"]:
            return "eski kuyrukta, açık (DIZINE-EKLENECEKLER.md)"
    if p in olu_liste:
        return "gorunmez-teshis.json olu_liste'de (31.08), md kuyruğunda satırı yok"
    return "kuyrukta değil"


def dizin_bak(p, denetim, envanter, damla, olu_liste):
    """Bir yol için dizin durumu + son tarama; kaynağı açık yazar."""
    if p is None or p.startswith("belirsiz:"):
        return {"durum": None, "kapsam": None, "son_tarama": None, "kaynak": "yol bilinmiyor", "tarama_yasi_gun": None}
    k = denetim.get(p)
    if k is None:
        k = envanter.get(p)
    if k is None:
        # taze denetim yok; damla md'si "dizin dışı" diye açık kayıt tutuyorsa onu söyle
        kayitlar = damla.get(p, [])
        acik = [x for x in kayitlar if not x["isaret"] and x["dosya"] == "DIZIN-DAMLASI-31-08.md"]
        if acik or p in olu_liste:
            return {"durum": "YOK", "kapsam": "dizin dışı (damla kaydı; API satırı yok)", "son_tarama": None,
                    "kaynak": "DIZIN-DAMLASI-31-08.md / gorunmez-teshis.json", "tarama_yasi_gun": None}
        return {"durum": None, "kapsam": None, "son_tarama": None, "kaynak": "denetlenmedi", "tarama_yasi_gun": None}
    yas = None
    if k["son_tarama"]:
        try:
            yas = (datetime.date.fromisoformat(k["denetim_tarihi"]) - datetime.date.fromisoformat(k["son_tarama"])).days
        except ValueError:
            yas = None
    # Denetim okumasının KENDİ yaşı. 03.09 dersi: bu alan olmadan tarama_kovasi
    # "bugün itibarıyla" sanılıyor ve karışık tarihli kaynaklar (27.08 envanteri,
    # 31.08 turu, 02.09 partisi) tek tabloda toplanınca yanlış sonuç çıkıyor.
    # O gün 94 C+F sayfası taze denetlendi: türetilmiş dağılım ≤7g 26 / 30+g 39
    # diyordu, GERÇEĞİ ≤7g 48 / 30+g 27'ydi. Bir deneyin kolları bu yüzden
    # yanlış kurulmuştu (deney kolunun 4/10'u aslında tazeydi).
    dy = None
    if k.get("denetim_tarihi"):
        try:
            dy = (BUGUN - datetime.date.fromisoformat(k["denetim_tarihi"])).days
        except ValueError:
            dy = None
    return {"durum": k["durum"], "kapsam": k["kapsam"], "son_tarama": k["son_tarama"],
            "kaynak": k["kaynak"], "tarama_yasi_gun": yas, "canonical": k.get("canonical"),
            "denetim_tarihi": k.get("denetim_tarihi"), "denetim_yasi_gun": dy,
            "kova_guvenilir": (dy is not None and dy <= 3)}


def tarama_kovasi(d):
    """Denetim günü itibarıyla tarama yaşı kovası — BUGÜN itibarıyla DEĞİL.

    Denetim okuması 3 günden eskiyse kovaya "(bayat okuma)" eklenir: o satır
    üzerinden bugünkü tazelik hakkında karar VERİLEMEZ, önce yeniden denetlenir.
    """
    if d.get("durum") is None:
        return "denetlenmedi"
    if d.get("son_tarama") is None:
        return "hiç taranmamış" if d.get("durum") == "YOK" else "tarama tarihi yok"
    y = d.get("tarama_yasi_gun")
    if y is None:
        return "?"
    kova = "≤7 gün" if y <= 7 else ("8-30 gün" if y <= 30 else "30+ gün")
    return kova if d.get("kova_guvenilir") else kova + " (bayat okuma)"


# ---------------------------------------------------------------- GSC
def gsc_yukle():
    sayfa = {}
    pen = pencere_oku(os.path.join(S, "sayfalar28.tsv"))
    for L in open(os.path.join(S, "sayfalar28.tsv"), encoding="utf-8"):
        p = L.rstrip("\n").split("\t")
        if len(p) < 4 or p[0].startswith("#"):
            continue
        try:
            sayfa[yol(p[3])] = {"gost": int(p[0]), "tik": int(p[1]), "poz": float(p[2])}
        except ValueError:
            pass
    sorgu = collections.defaultdict(list)
    ssdosya = os.path.join(S, "sayfa-sorgu28.tsv")
    ss_pen = pencere_oku(ssdosya)
    n_ss = 0
    for L in open(ssdosya, encoding="utf-8"):
        p = L.rstrip("\n").split("\t")
        if len(p) < 5 or p[0].startswith("#"):
            continue
        try:
            sorgu[anahtar(p[4])].append({"gost": int(p[0]), "tik": int(p[1]), "poz": float(p[2]), "sayfa": yol(p[3])})
            n_ss += 1
        except ValueError:
            pass
    ss_mtime = datetime.date.fromtimestamp(os.path.getmtime(ssdosya)).isoformat()
    return sayfa, pen, sorgu, ss_pen, n_ss, ss_mtime


def canli_durum():
    """canli-durum.tsv (31.08): eski adres → canlı HTTP durumu (308 hedefi)."""
    c = {}
    f = os.path.join(S, "canli-durum.tsv")
    if not os.path.exists(f):
        return c
    for L in open(f, encoding="utf-8"):
        p = L.rstrip("\n").split("\t")
        if len(p) < 2:
            continue
        kod, _, hedef = p[1].partition("|")
        c[yol(p[0])] = {"kod": kod, "hedef": yol(hedef) if hedef else None,
                        "sitemapte": (p[3].split("=")[1] == "1") if len(p) > 3 and "=" in p[3] else None}
    return c


# ---------------------------------------------------------------- ölçümler
def olcumleri_yukle():
    son = {}          # s → son kayıt
    tarihli = {}      # (s, d) → kayıt
    for L in open(os.path.join(KOK, "sonuclar-site-emlakci.jsonl"), encoding="utf-8"):
        L = L.strip()
        if not L:
            continue
        r = json.loads(L)
        son[r["s"]] = r
        tarihli[(r["s"], r.get("d"))] = r
    cati = {}         # d → "eryaman emlakçı" kaydı
    f = os.path.join(KOK, "sonuclar-emlakci.jsonl")
    if os.path.exists(f):
        for L in open(f, encoding="utf-8"):
            L = L.strip()
            if not L:
                continue
            r = json.loads(L)
            if anahtar(r.get("q", "")) == anahtar("eryaman emlakçı"):
                cati[r.get("d")] = r
    return son, tarihli, cati


def alan_adi(x):
    return (x or "").split("/")[0]


def bizim_mi(dom):
    return "siringayrimenkul" in dom


def rakip_bilgisi(rec):
    """1. sırayı kim tutuyor + ilk rakip (bizim olmayan ilk alan adı)."""
    ilk3u = rec.get("ilk3u") or []
    on = rec.get("on")
    sira = rec.get("sira") or 0
    sira1 = None
    if ilk3u:
        sira1 = alan_adi(ilk3u[0]) or None
    elif sira == 1:
        sira1 = "siringayrimenkul.com"
    elif on:
        sira1 = on[0]
    rakip = None
    for i, x in enumerate(ilk3u):
        d = alan_adi(x)
        if d and not bizim_mi(d) and not d.startswith("cite:"):
            rakip = {"sira": i + 1, "alan": d, "url": x}
            break
    if rakip is None and on:
        for i, d in enumerate(on):
            if d and not bizim_mi(d):
                rakip = {"sira": i + 1, "alan": d, "url": None}
                break
    return {
        "sira1": sira1,
        "sira1_bizim_kanal": (bizim_mi(sira1) if sira1 else None),
        "sira1_kendi_magaza": (bool(sira1) and "sahibinden" in sira1 and "siringayrimenkul" in sira1),
        "ilk_rakip": rakip,
        "ilk3u": ilk3u or None,
        "isgal": rec.get("isgal"),
        "ilk3u_yok": not ilk3u,
    }


def dogru_serpte(rec, sira, dogru):
    """D/F için: doğru sayfa aynı SERP'te var mı, kaçıncı? Çıkarılamıyorsa 'bilinmiyor'."""
    ilk3u = rec.get("ilk3u") or []
    isgal = rec.get("isgal")
    for i, x in enumerate(ilk3u):
        if x.startswith("siringayrimenkul.com/") and yol(x[len("siringayrimenkul.com"):]) == dogru:
            return {"var": True, "sira": i + 1, "kaynak": "ilk3u (tam yol)"}
    for i, x in enumerate(ilk3u):
        if x == "siringayrimenkul.com" and i + 1 != sira:
            return {"var": "belirsiz", "sira": i + 1,
                    "kaynak": f"ilk3u: {i + 1}. sırada ikinci bir sayfamız var, URL kaydedilmedi"}
    if isgal is not None:
        if isgal > 1:
            return {"var": "belirsiz", "sira": None,
                    "kaynak": f"isgal={isgal}: 1. sayfada {isgal} sayfamız var; ilk 3 dışındakilerin URL'si kaydedilmedi"}
        return {"var": False, "sira": None,
                "kaynak": f"isgal={isgal}: 1. sayfada tek sayfamız var, o da yanlış sayfa → doğru sayfa 1. sayfada YOK"}
    return {"var": None, "sira": None, "kaynak": "bilinmiyor — ölçüm yalnız ilk sonucumuzun URL'sini kaydediyor, isgal ölçülmemiş"}


# ---------------------------------------------------------------- ana akış
def main():
    denetim, denetim_dosyalari = denetimleri_yukle()
    envanter = envanter_2708()
    damla = damla_yukle()
    try:
        olu_liste = {yol(u) for u in json.load(open(os.path.join(KOK, "gorunmez-teshis.json")))["olu_liste"]}
    except (OSError, KeyError, ValueError):
        olu_liste = set()
    sayfa28, pen, sorgu28, ss_pen, n_ss, ss_mtime = gsc_yukle()
    canli = canli_durum()
    son, tarihli, cati = olcumleri_yukle()
    kuyruk = json.load(open(os.path.join(KOK, "kuyruk-site-emlakci.json"), encoding="utf-8"))
    hedef = json.load(open(os.path.join(KOK, "hedef-sorgular.json"), encoding="utf-8"))

    satirlar = []
    uyarilar = []

    def satir_kur(sorgu, tur, aile, s, dogru, es_yollari, rec, olcum_tarihi, kanal, ek_not=None):
        d_dogru = dizin_bak(dogru, denetim, envanter, damla, olu_liste)
        if rec is None:
            return {
                "sorgu": sorgu, "tur": tur, "aile": aile, "s": s, "sayfa": dogru,
                "sinif": "Ö", "sinif_ad": SINIF_AD["Ö"], "alt_sinif": None,
                "sira": None, "tutan_url": None, "tutan_tur": None, "tutan_tur_ad": None,
                "dogru_sayfa_serpte": None, "dizin": d_dogru, "son_tarama": d_dogru["son_tarama"],
                "dizin_durumu": d_dogru["durum"], "tarama_kovasi": tarama_kovasi(d_dogru),
                "istek_durumu": istek_durumu(dogru, damla, olu_liste),
                "gost28": {"sorgu_satirlari": [], "sorgu_toplam": 0, "dogru_sayfa": sayfa28.get(dogru), "tutan_sayfa": None},
                "rakip": None, "olcum_tarihi": None, "kanal": None, "kaldirac": KALDIRAC["Ö"],
                "not": "kuyrukta var, sonuç dosyasında hiç kaydı yok",
                "icerik_dosyasi_var": os.path.exists(os.path.join(ICERIK, f"{s}.json")) if s else None,
            }
        sira = rec.get("sira") or 0
        p = serp_u(rec.get("u"))
        ttur = sayfa_turu(p, dogru, es_yollari) if sira else "yok"
        alt = None
        serpte = None
        if sira == 0:
            if d_dogru["durum"] == "YOK":
                sinif = "A"
                alt = d_dogru["kapsam"]
            elif d_dogru["durum"] == "MEVCUT":
                sinif = "B"
                alt = "27.08 envanteri (taze denetim yok)" if "ESKİ" in d_dogru["kaynak"] else "taze denetim"
            else:
                sinif = "AB?"
                alt = d_dogru["kaynak"]
        elif sira <= 3:
            if ttur in ("dogru", "dogru_es"):
                sinif = "E"
                alt = ttur
            else:
                sinif = "D"
                alt = ttur
                serpte = dogru_serpte(rec, sira, dogru)
        else:
            band = "4-5" if sira <= 5 else "6-10"
            if ttur in ("dogru", "dogru_es"):
                sinif = "C"
                alt = band
            else:
                sinif = "F"
                alt = ttur
                serpte = dogru_serpte(rec, sira, dogru)
        tutan_dizin = None
        if ttur not in ("dogru", "dogru_es", "yok", "belirsiz") and p:
            tutan_dizin = dizin_bak(p, denetim, envanter, damla, olu_liste)
        kaldirac = KALDIRAC["D-eski"] if (sinif == "D" and ttur == "eski") else KALDIRAC[sinif]
        dogru_dizin_disi = sinif in ("D", "F") and d_dogru["durum"] == "YOK"
        if dogru_dizin_disi:
            # 31.08 damla-A-sınıfı mantığı: slot zaten bizim, doğru sayfa dizinde bile değil —
            # başlık hizası bekleyemez, önce dizine girmesi lazım (kanıtlı kaldıraç: damla).
            kaldirac = KALDIRAC["D-dizin-disi"]
        eski_canli = canli.get(p) if ttur == "eski" else None
        gs = sorgu28.get(anahtar(sorgu), [])
        return {
            "sorgu": sorgu, "tur": tur, "aile": aile, "s": s, "sayfa": dogru,
            "sinif": sinif, "sinif_ad": SINIF_AD[sinif], "alt_sinif": alt,
            "sira": sira, "tutan_url": p, "tutan_tur": ttur, "tutan_tur_ad": TUR_AD.get(ttur),
            "adas_es": ttur == "dogru_es",
            "dogru_sayfa_serpte": serpte,
            "dizin": d_dogru, "son_tarama": d_dogru["son_tarama"], "dizin_durumu": d_dogru["durum"],
            "tarama_kovasi": tarama_kovasi(d_dogru),
            "tutan_dizin": tutan_dizin,
            "eski_adres_canli": eski_canli,
            "dogru_sayfa_dizin_disi": dogru_dizin_disi,
            "istek_durumu": istek_durumu(dogru, damla, olu_liste) if (sinif in ("A", "AB?", "B") or dogru_dizin_disi) else None,
            "gost28": {"sorgu_satirlari": gs, "sorgu_toplam": sum(x["gost"] for x in gs),
                       "dogru_sayfa": sayfa28.get(dogru),
                       "tutan_sayfa": sayfa28.get(p) if p and not p.startswith("belirsiz:") else None},
            "rakip": rakip_bilgisi(rec),
            "bas": rec.get("bas"), "h": rec.get("h"),
            "olcum_tarihi": olcum_tarihi, "kanal": kanal,
            "kaldirac": kaldirac,
            "not": ek_not or rec.get("not"),
            "icerik_dosyasi_var": os.path.exists(os.path.join(ICERIK, f"{s}.json")) if (s and tur == "site") else None,
        }

    # ---- site sorguları
    for k in kuyruk:
        s = k["s"]
        if s.split("/")[0] in YENIMAHALLE:
            uyarilar.append(f"Yenimahalle kaydı kuyrukta: {s} (dışarıda tutuldu)")
            continue
        dogru = f"/mahalleler/{s}"
        es_yollari = {f"/mahalleler/{e}" for e in (k.get("es") or [])}
        rec = son.get(s)
        satirlar.append(satir_kur(k["q"], "site", s.split("/")[0], s, dogru, es_yollari, rec,
                                  rec.get("d") if rec else None, rec.get("kanal") if rec else None))

    # ---- hedef sorguları (hedef-sorgular.json satırları; ham kayıt ilk3u/isgal için)
    for h in hedef["satirlar"]:
        s = h["beklenen_sayfa"].replace("/mahalleler/", "") if h["beklenen_sayfa"] != "/" else None
        if s and s.split("/")[0] in YENIMAHALLE:
            continue
        dogru = yol(h["beklenen_sayfa"])
        rec = None
        if s:
            rec = tarihli.get((s, h["tarih"])) or (son.get(s) if son.get(s, {}).get("d") == h["tarih"] else None)
        else:
            rec = cati.get(h["tarih"])
        if rec is None:
            rec = {"sira": h["sira"], "u": h["u"], "isgal": h.get("isgal"), "not": h.get("not"), "ilk3u": None}
            uyarilar.append(f"hedef '{h['sorgu']}' ham kaydı bulunamadı; hedef-sorgular.json alanlarıyla kuruldu (ilk3u yok)")
        else:
            rec = dict(rec)
            rec["sira"] = h["sira"]  # hedef-sorgular.json'un kararı esas (kırıntı/kanal çözümleri orada)
            if h.get("isgal") is not None and rec.get("isgal") is None:
                rec["isgal"] = h["isgal"]
        satirlar.append(satir_kur(h["sorgu"], "hedef", h["aile"], s, dogru, set(), rec, h["tarih"], h.get("kanal"),
                                  ek_not=h.get("not")))

    # ---- sayımlar
    def say(satirlar, anahtar_fn):
        return collections.Counter(anahtar_fn(x) for x in satirlar)

    siniflar = {}
    for kod in ("A", "B", "AB?", "C", "D", "F", "E", "Ö"):
        grup = [x for x in satirlar if x["sinif"] == kod]
        site = [x for x in grup if x["tur"] == "site"]
        hed = [x for x in grup if x["tur"] == "hedef"]
        bilgi = {
            "ad": SINIF_AD[kod], "kaldirac": KALDIRAC[kod], "n": len(grup),
            "n_site": len(site), "n_hedef": len(hed),
            "alt": say(grup, lambda x: x["alt_sinif"]).most_common(),
            "mahalle": say(grup, lambda x: x["aile"]).most_common(),
            "tarama_kovasi": say(grup, lambda x: x["tarama_kovasi"]).most_common(),
            "sira_dagilimi": say(grup, lambda x: x["sira"]).most_common(),
        }
        if kod == "A" or kod == "AB?":
            bilgi["istek_durumu"] = say(grup, lambda x: (x["istek_durumu"] or "").split(" (")[0]).most_common()
        if kod in ("D", "F"):
            bilgi["dogru_sayfa_serpte"] = say(
                grup, lambda x: {True: "evet, ilk 3'te (yol eşleşti)", False: "hayır (1. sayfada tek sayfamız var)",
                                 "belirsiz": "belirsiz (ikinci sayfamız var, URL kaydedilmedi)", None: "bilinmiyor"}[
                    x["dogru_sayfa_serpte"]["var"]]).most_common()
            bilgi["dogru_sayfa_dizin"] = say(grup, lambda x: x["dizin_durumu"] or "denetlenmedi").most_common()
            bilgi["tutan_sayfa_dizin"] = say(
                grup, lambda x: (x["tutan_dizin"] or {}).get("durum") or "denetlenmedi").most_common()
            bilgi["sira1_bizim_kanal"] = say(grup, lambda x: (x["rakip"] or {}).get("sira1_bizim_kanal")).most_common()
            bilgi["alt_x_dogru_dizin"] = say(
                grup, lambda x: f"{x['alt_sinif']} / doğru sayfa {'DİZİN DIŞI' if x['dogru_sayfa_dizin_disi'] else 'dizinde'}").most_common()
            bilgi["kaldirac_dagilimi"] = say(grup, lambda x: (x["kaldirac"] or "(boş)").split(" — ")[0].split(" →")[0]).most_common()
            bilgi["eski_tutan_tarama"] = say(
                [x for x in grup if x["alt_sinif"] == "eski"],
                lambda x: tarama_kovasi(x["tutan_dizin"] or {})).most_common()
            bilgi["eski_canli_308"] = sum(1 for x in grup if x["alt_sinif"] == "eski" and (x["eski_adres_canli"] or {}).get("kod") == "308")
            bilgi["dizin_disi_istek"] = say(
                [x for x in grup if x["dogru_sayfa_dizin_disi"]],
                lambda x: (x["istek_durumu"] or "").split(" (")[0]).most_common()
        if kod == "E":
            bilgi["adas_es"] = sum(1 for x in grup if x.get("adas_es"))
        siniflar[kod] = bilgi

    hedef_disi = [x for x in satirlar if x["sinif"] not in ("E", "Ö")]
    gs_var = sum(1 for x in satirlar if x["sinif"] != "Ö" and x["gost28"]["sorgu_toplam"] > 0)

    def kaldirac_ailesi(x):
        k = x["kaldirac"] or ""
        if k.startswith("DAMLA"):
            return "damla (kanıtlı)"
        if k.startswith("eski adres"):
            return "301 sindirme (eski adres, 07.09 sonrası başlık hizası da)"
        if k.startswith("doğru sayfa yerine"):
            return "başlık hizası (07.09 sonrası)"
        if k.startswith("önce denetim"):
            return "önce denetim"
        return "boş — analiz ekseni dolduracak"
    kaldirac_ozeti = collections.Counter(kaldirac_ailesi(x) for x in hedef_disi).most_common()

    # dogru-sayfa.json ile çapraz kontrol (aynı kaynaktan, es farkı beklenir)
    ds = {}
    try:
        ds = json.load(open(os.path.join(KOK, "dogru-sayfa.json"), encoding="utf-8"))
    except (OSError, ValueError):
        pass
    site_satir = [x for x in satirlar if x["tur"] == "site" and x["sinif"] != "Ö"]
    capraz = {
        "bu_betik": {"olculen": len(site_satir),
                     "ilk3_toplam": sum(1 for x in site_satir if x["sinif"] in ("D", "E")),
                     "ilk3_dogru_es_dahil": sum(1 for x in site_satir if x["sinif"] == "E"),
                     "ilk3_dogru_es_haric": sum(1 for x in site_satir if x["sinif"] == "E" and not x["adas_es"]),
                     "ilk10_yok": sum(1 for x in site_satir if x["sinif"] in ("A", "B", "AB?"))},
        "dogru_sayfa_json": {"olculen": ds.get("toplam"), "ilk3_toplam": ds.get("ilk3_toplam"),
                             "ilk3_dogru": ds.get("ilk3_dogru"), "guncelleme": ds.get("guncelleme")},
        "not": "dogru-sayfa.py 'es' (aynı adlı ikinci kayıt) eşleşmesini başka site sayar; bu betik doğru sayar ve adas_es ile işaretler.",
    }

    cikti = {
        "guncelleme": BUGUN.isoformat(),
        "amac": "Özgün 02.09: ilk 3'te DOĞRU sayfası olmayan her sorgunun sınıfı + sınıf başına ölçülmüş kaldıraç",
        "kaynaklar": {
            "sorgular": ["kuyruk-site-emlakci.json", "hedef-sorgular.json"],
            "serp": ["sonuclar-site-emlakci.jsonl (aynı s için SON kayıt)", "sonuclar-emlakci.jsonl (eryaman emlakçı)"],
            "dizin_denetimleri": denetim_dosyalari,
            "dizin_denetimi_url_sayisi": len(denetim),
            "dizin_yedek": "dizin-tarama-2026-08-27.tsv (27.08 envanteri, 554 URL; taze denetim yoksa, ESKİ etiketli)",
            "damla": ["DIZIN-DAMLASI-31-08.md", "DIZINE-EKLENECEKLER.md", "gorunmez-teshis.json olu_liste"],
            "gsc_sayfa": {"dosya": "sayfalar28.tsv", "pencere": pen},
            "gsc_sayfa_sorgu": {"dosya": "sayfa-sorgu28.tsv", "pencere": ss_pen,
                                "pencere_notu": None if ss_pen else f"dosyada '# pencere' başlığı yok; mtime {ss_mtime}, sayfalar28 ile aynı çekim olduğu VARSAYILMADI",
                                "satir": n_ss},
            "eski_adres_canli": "canli-durum.tsv (31.08, 48 adres)",
        },
        "siniflar": siniflar,
        "ozet": {
            "sorgu_toplam": len(satirlar),
            "site": sum(1 for x in satirlar if x["tur"] == "site"),
            "hedef": sum(1 for x in satirlar if x["tur"] == "hedef"),
            "olculmedi": siniflar["Ö"]["n"],
            "ilk3_dogru_E": siniflar["E"]["n"],
            "hedef_disi_toplam_A_B_AB_C_D_F": len(hedef_disi),
            "hedef_disi_kaldirac_ailesi": kaldirac_ozeti,
            "gsc_sorgu_satiri_olan": gs_var,
            "gsc_notu": f"{n_ss} sorgu×sayfa satırının {gs_var} tanesi bu listedeki bir sorguya denk geliyor; "
                        f"'<site adı> emlakçı' biçimi GSC dökümünde yok — sayfa bazlı gösterim (gost28.dogru_sayfa) kullanılmalı",
        },
        "capraz_kontrol": capraz,
        "uyarilar": uyarilar + [
            "Sıra 0 = ilk 10 dışı (num=20 ölü; 11+ görünmez). A/B ayrımı yalnız API denetimine dayanır; denetimsizler AB? sınıfında.",
            "dogru_sayfa_serpte yalnız ilk3u/isgal'den çıkarılabilen kadarını söyler; 'bilinmiyor' uydurulmamış demektir.",
            "tarama_yasi_gun denetim günü itibarıyladır (bugün değil): denetimden sonra kendiliğinden taranmış olabilir.",
            "Title/H1 07.09'a kadar donuk — D/F kaldıracı o tarihten önce uygulanmaz.",
        ],
        "satirlar": satirlar,
    }
    json.dump(cikti, open(os.path.join(KOK, "ilk3-hedef.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)

    # ---- stdout özeti
    print(f"ilk3-hedef.json yazıldı — {len(satirlar)} sorgu "
          f"({cikti['ozet']['site']} site + {cikti['ozet']['hedef']} hedef), "
          f"denetim {len(denetim)} URL, GSC sorgu satırı olan {gs_var}")
    print()
    print(f"{'sınıf':5} {'n':>4} {'site':>4} {'hedef':>5}  ad")
    for kod, b in siniflar.items():
        print(f"{kod:5} {b['n']:4} {b['n_site']:4} {b['n_hedef']:5}  {b['ad']}")
    print(f"{'':5} {len(hedef_disi):4}             HEDEF (E ve Ö hariç)")
    print()
    for kod in ("A", "B", "AB?", "C", "D", "F"):
        b = siniflar[kod]
        if not b["n"]:
            continue
        print(f"— {kod} {b['ad']} (n={b['n']})")
        print(f"   alt sınıf : {', '.join(f'{a}={n}' for a, n in b['alt'])}")
        print(f"   tarama    : {', '.join(f'{a}={n}' for a, n in b['tarama_kovasi'])}")
        mah = ", ".join(f"{a.replace('-mahallesi', '')}={n}" for a, n in b["mahalle"][:6])
        print(f"   mahalle   : {mah}")
        if "istek_durumu" in b:
            print(f"   istek     : {', '.join(f'{a}={n}' for a, n in b['istek_durumu'])}")
        if "dogru_sayfa_serpte" in b:
            print(f"   doğru sayfa SERP'te : {', '.join(f'{a}={n}' for a, n in b['dogru_sayfa_serpte'])}")
            print(f"   doğru sayfa dizin   : {', '.join(f'{a}={n}' for a, n in b['dogru_sayfa_dizin'])}")
            print(f"   tutan sayfa dizin   : {', '.join(f'{a}={n}' for a, n in b['tutan_sayfa_dizin'])}")
            print(f"   alt × doğru dizin   : {', '.join(f'{a}={n}' for a, n in b['alt_x_dogru_dizin'])}")
            print(f"   1. sıra bizim kanal : {', '.join(f'{a}={n}' for a, n in b['sira1_bizim_kanal'])}")
            print(f"   dizin dışı → istek  : {', '.join(f'{a}={n}' for a, n in b['dizin_disi_istek']) or '-'}")
            print(f"   kaldıraç dağılımı   : {', '.join(f'{a}={n}' for a, n in b['kaldirac_dagilimi'])}")
            if b["eski_tutan_tarama"]:
                print(f"   eski adres (tutan) tarama yaşı : {', '.join(f'{a}={n}' for a, n in b['eski_tutan_tarama'])} "
                      f"· canlıda 308 doğrulanan {b['eski_canli_308']}")
        if kod == "A":
            for x in sorted([x for x in satirlar if x["sinif"] == "A"], key=lambda x: x["sayfa"]):
                print(f"      {x['sayfa']:70} {x['dizin']['kapsam'][:32]:32} {x['istek_durumu']}")
        print(f"   kaldıraç  : {b['kaldirac'] or '(boş — analiz ekseni dolduracak)'}")
    print()
    print(f"HEDEF DIŞI {len(hedef_disi)} sorgunun kaldıraç ailesi: " + ", ".join(f"{a}={n}" for a, n in kaldirac_ozeti))
    print()
    print("çapraz kontrol (site sorguları):", json.dumps(capraz["bu_betik"], ensure_ascii=False),
          "| dogru-sayfa.json:", json.dumps(capraz["dogru_sayfa_json"], ensure_ascii=False))
    if uyarilar:
        print("uyarılar:", *uyarilar, sep="\n  ")


if __name__ == "__main__":
    main()
