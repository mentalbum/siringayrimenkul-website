#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""ZAMAN BOYUTU — karnenin ana metriklerini günlük anlık görüntü olarak biriktirir.

Neden: karne bir anlık görüntü; "geçen haftaya göre ne değişti" sorusunun
karşılığı yoktu. Üreticiler her turda JSON'larını ÜSTÜNE yazdığı için dünkü
değer kayboluyordu. Bu betik her koşuda ana metrikleri tek satıra indirger ve
karne-gecmis.jsonl'a EKLER; aynı gün ikinci koşu o günün satırını değiştirir.

İki satır türü (kaynak alanı):
  "anlik"          — o gün üreticilerin yazdığı JSON'lardan okunan değerler.
                     Karnede basılan rakamın kendisi. Elle rakam yok; olmayan null.
  "geri_doldurma"  — ham veriden (SERP jsonl, GSC/GA4 günlük API) o gün için
                     SONRADAN hesaplanan değer. Anlık satırla aynı gün çakışırsa
                     özet anlık satırı üstün tutar (karnede görünen oydu).

Geri doldurma yöntemi (21.08'den bugüne, her gün için):
  SERP  : sonuclar-site-emlakci.jsonl — her sayfa için o güne kadarki EN TAZE ölçüm
          (dogru-sayfa.py ile aynı sınıflama; kuyruk-site-emlakci.json üyeliği).
          Her satır kullanılan ölçümlerin kanal dağılımını (serp_kanal) ve bölge
          turundan (27.08+) gelen payını (serp_bolge_turu_pay) taşır — NEDEN:
          22-23.08 turunun "ilk 10 dışı" sonuçları kararsız çıktı; 02.09'da
          ölçüldü: o turun 230 sıfırından 86'sı sonraki ölçümde ilk 3'e, 46'sı
          4-10'a döndü, 54'ü sıfır kaldı, 44'ü yeniden ölçülmedi. 27.08 öncesi
          noktalar aynı ölçüm rejiminde değil; okurken bu pay bakılır.
  Hedef : sonuclar-emlakci.jsonl + sonuclar-site-emlakci.jsonl — 17 hedef sorgu,
          hedef-sorgular-uret.py'nin eşleştirmesiyle; yalnız SIRA (kutu bilgisi
          not metninden okunuyor, geriye dönük güvenilir değil → null). Kanal
          dağılımı hedef_kanal'da (27.08 öncesi kayıtlar kanal etiketi taşımaz).
  GSC   : gsc-q.mjs (KARNE_SCRATCH) ile günlük satır; pencere gsc-api.mjs ozet ile
          AYNI: "son 28 VERİ günü". Tarihe göre kurarken D-2'ye kadar veri olan
          günlerin son 28'i alınır (GSC 2-3 gün geriden gelir; geçmiş bir günün
          o günkü gecikmesi bilinemez, bugünkü seriden en iyi yaklaşım budur).
          Eryaman ayrımı sonuc-ozeti-uret.py'deki regex ile (ata/susuz/cumhuriyet
          dışarıda). Konum = gösterimle ağırlıklı ortalama.
  GA4   : ga4-q.mjs (KARNE_SCRATCH) ile günlük satır; pencere ga4-api.mjs ile
          AYNI: 28daysAgo→yesterday, yani [D-28, D-1]. Ort. süre ve hemen çıkma
          oturumla ağırlıklı ortalama; olaylar (phone/whatsapp) toplam.
          Haftalık dilimler de yazılır (*_hafta: son 7 gün) — "son 4 hafta" okuması.
  Ham çekimler KARNE_SCRATCH'e TSV olarak bırakılır; API düşerse (--yerel ya da
  hata) oradaki TSV okunur, o da yoksa alanlar null kalır ve uyarı basılır.

DİKKAT — iki kaynak aynı günün değerinde birkaç yüzde ayrışabilir: GSC son
günleri sonradan tamamlar (31.08'de çekilen 28 günlük toplam 2.531 tık, aynı
pencere 02.09'da 2.603), GA4 dünü gece yeniden işler. Bu hata değil, veri
olgunlaşması; özetteki her nokta kaynağını taşır.

Kullanım (KARNE_SCRATCH şart: ham TSV'ler oraya yazılır; gsc-q.mjs orada, ga4-q.mjs bu klasörde durur):
  python3 anlik-goruntu-uret.py                 # anlık satır + geri doldurma (API) + özet
  python3 anlik-goruntu-uret.py --yerel         # API'ye gitmez, scratchpad TSV'lerini okur
  python3 anlik-goruntu-uret.py --yalniz-anlik  # geri doldurma yok; anlık satır + özet

Girdi : sonuc-ozeti.json, tik-sonrasi.json, dogru-sayfa.json, hedef-sorgular.json,
        ada-beklenti.json, ada-beklenti-gecmis.jsonl, gorunmez-teshis.json,
        veri-sagligi.json, DIZIN-DAMLASI-31-08.md, kuyruk-site-emlakci.json,
        sonuclar-site-emlakci.jsonl, sonuclar-emlakci.jsonl
Çıktı : karne-gecmis.jsonl (birikir), karne-gecmis-ozet.json (her koşuda yeniden)
"""
import json, os, re, sys, subprocess, datetime, collections

KOK = os.path.dirname(os.path.abspath(__file__))
S = os.environ.get("KARNE_SCRATCH", "")
sys.path.insert(0, KOK)
from tranahtar import anahtar  # Türkçe İ/ı sorunu — hedef sorgu eşleşmesi için şart

BUGUN = datetime.date.today()
GERI_BAS = datetime.date(2026, 8, 21)      # SERP turlarının düzenli başladığı gün
# Bölge turunun ilk günü: tur-tunahan-2708.json / tur-altay-2708.json … dosyaları bu
# tarihle başlar. Öncesindeki 22-23.08 turu farklı betik ve kanal sınırında koştu
# (bkz. docstring'deki sıfırların akıbeti); rejim ayrımı bu tarihten yapılır.
BOLGE_TURU_BAS = "2026-08-27"
GSC_GECIKME = 2                            # gsc-api.mjs: "GSC ~2 gün geriden gelir"
YEREL = "--yerel" in sys.argv
YALNIZ_ANLIK = "--yalniz-anlik" in sys.argv
GECMIS = f"{KOK}/karne-gecmis.jsonl"
OZET = f"{KOK}/karne-gecmis-ozet.json"

# Metrik sırası + yön kuralı. artis="iyi": yükselmesi iyi; "kotu": yükselmesi kötü.
# Konum (gsc_konum_28) küçüldükçe iyi; damla ve dizin dışı küçüldükçe iyi.
METRIKLER = [
    ("ilk3_pay",            "İlk 3 payı (ölçülen site sorguları)", "%",     "iyi"),
    ("dogru_sayfa_pay",     "İlk 3'te doğru sayfa payı",           "%",     "iyi"),
    ("ilk10_disi",          "İlk 10 dışı payı",                     "%",     "kotu"),
    ("gsc_tik_28",          "GSC tık (28 gün)",                     "adet",  "iyi"),
    ("gsc_gos_28",          "GSC gösterim (28 gün)",                "adet",  "iyi"),
    ("gsc_to_28",           "GSC TO (28 gün)",                      "%",     "iyi"),
    ("gsc_konum_28",        "GSC ortalama konum (28 gün)",          "sıra",  "kotu"),
    ("eryaman_tik_28",      "Eryaman tık (28 gün, Yenimahalle hariç)", "adet", "iyi"),
    ("ga4_oturum_28",       "GA4 oturum (28 gün)",                  "adet",  "iyi"),
    ("ga4_sure",            "GA4 ortalama oturum süresi (28 gün)",  "sn",    "iyi"),
    ("ga4_hemen",           "GA4 hemen çıkma (28 gün)",             "%",     "kotu"),
    ("phone_click_28",      "Telefon tıklaması (28 gün)",           "adet",  "iyi"),
    ("whatsapp_click_28",   "WhatsApp tıklaması (28 gün)",          "adet",  "iyi"),
    ("hedef_ilk3",          "Hedef sorgu: ilk 3'te",                "sorgu", "iyi"),
    ("hedef_kutuda",        "Hedef sorgu: harita kutusunda",        "sorgu", "iyi"),
    ("hedef_disi",          "Hedef sorgu: ilk 10 dışında",          "sorgu", "kotu"),
    ("ada_beklenti_orani",  "Ada sayfaları: alınan / beklenen tık", "oran",  "iyi"),
    ("damla_acik",          "Dizin damlası: açık kayıt",            "adet",  "kotu"),
    ("dizin_disi_sayisi",   "API'nin dizin dışı doğruladığı sayfa", "adet",  "kotu"),
    ("veri_saglik_agir",    "Veri sağlığı: ağır bulgu",             "adet",  "kotu"),
]
METRIK_AD = [m[0] for m in METRIKLER]
SERP_METRIK = ("ilk3_pay", "dogru_sayfa_pay", "ilk10_disi")
HEDEF_METRIK = ("hedef_ilk3", "hedef_kutuda", "hedef_disi")
# Rejim eşiği: iki ucun ölçüm rejimi payı bu kadar puan ayrışıyorsa fark gerçek hareket
# sayılmaz (yon nötr, olcum_yontemi_degisti true). SERP'te bölge turu payı, hedef
# sorgularda kanal etiketi payı (27.08 öncesi kayıtlar etiketsiz; hedef-sorgular-uret
# aynı kıyasa "kanal değişti" diyor — 02.09'da 26.08 noktası 17/17 etiketsizken
# seri "hedef ilk 3: 8 → 3, kötü" basıyordu).
REJIM_ESIK = 50


def tr_sayi(n, ondalik=0):
    """Türkçe biçim (karne-html.py ile aynı): binlik nokta, ondalık virgül — konsol özeti için."""
    if n is None:
        return "—"
    t = f"{n:,.{ondalik}f}"
    return t.replace(",", "\x00").replace(".", ",").replace("\x00", ".")


def oku_json(ad):
    p = f"{KOK}/{ad}"
    if not os.path.exists(p):
        print(f"UYARI: {ad} yok — o alanlar null", file=sys.stderr)
        return None
    return json.load(open(p))


def yuzde(a, b, nd=1):
    return round(100 * a / b, nd) if b else None


def kanal_sayimi(kayitlar):
    """Kanal dağılımı; etiketi olmayan eski kayıtlar 'etiketsiz' (27.08 öncesi hepsi böyle)."""
    return dict(collections.Counter((r.get("kanal") or "etiketsiz") for r in kayitlar))


# ======================= 1) ANLIK SATIR =======================
def anlik_satir():
    so = oku_json("sonuc-ozeti.json")
    ts = oku_json("tik-sonrasi.json")
    ds = oku_json("dogru-sayfa.json")
    hs = oku_json("hedef-sorgular.json")
    ab = oku_json("ada-beklenti.json")
    gt = oku_json("gorunmez-teshis.json")
    vs = oku_json("veri-sagligi.json")

    r = {"tarih": BUGUN.isoformat(), "kaynak": "anlik"}
    for m in METRIK_AD:
        r[m] = None

    if ds:
        toplam = ds.get("toplam") or sum(x["n"] for x in ds["hepsi"])
        yok = next((x["n"] for x in ds["hepsi"] if x["k"] == "yok"), 0)
        r["ilk3_pay"] = yuzde(ds["ilk3_toplam"], toplam)
        r["dogru_sayfa_pay"] = yuzde(ds["ilk3_dogru"], ds["ilk3_toplam"])
        r["ilk10_disi"] = yuzde(yok, toplam)
        r["serp_olculen"] = toplam
    if so:
        r["gsc_tik_28"] = so["simdi"]["tik"]
        r["gsc_gos_28"] = so["simdi"]["gos"]
        r["gsc_to_28"] = so["simdi"]["to"]
        r["gsc_konum_28"] = so["simdi"]["poz"]
        r["eryaman_tik_28"] = so["ayrim"]["eryaman"]["simdi"]["tik"]
        # pencere: karneye basılan değerin hangi günleri kapsadığı (02.09'dan
        # sonra "pencere", eski JSON'da "donem" adıyla)
        r["gsc_pencere"] = so.get("pencere") or so.get("donem")
    if ts:
        r["ga4_oturum_28"] = ts["ozet"]["oturum"]
        r["ga4_sure"] = ts["ozet"]["ort_sure_sn"]
        r["ga4_hemen"] = ts["ozet"]["hemen_cikma"]
        r["phone_click_28"] = ts["temas"]["phone_click"]
        r["whatsapp_click_28"] = ts["temas"]["whatsapp_click"]
        r["ga4_pencere"] = ts.get("pencere")
    if hs:
        o = hs["ozet"]
        r["hedef_ilk3"] = o["ilk3"]           # 1. sıradakiler dahil (ilk3+ilk4_10+disarida = 17)
        r["hedef_kutuda"] = o["kutuda"]
        r["hedef_disi"] = o["disarida"]
    if ab:
        r["ada_beklenti_orani"] = ab["ada"]["oran"]
    # damla: "- [ ] url" açık, "- [x] url ← …" bitmiş
    dp = f"{KOK}/DIZIN-DAMLASI-31-08.md"
    if os.path.exists(dp):
        metin = open(dp).read()
        r["damla_acik"] = len(re.findall(r"^- \[ \]", metin, re.M))
        r["damla_biten"] = len(re.findall(r"^- \[x\]", metin, re.M | re.I))
    if gt:
        r["dizin_disi_sayisi"] = gt["dizin_sorunu"]["n"]
    if vs:
        # karne-html ile aynı tanım: ağır VE temiz olmayan bulgu
        r["veri_saglik_agir"] = sum(1 for b in vs["bulgular"] if b["agir"] and not b["temiz"])
    # Hangi JSON hangi gün üretildi — anlık satır bayat JSON'dan da beslenebilir,
    # okuyan bunu görsün diye kaynak tarihleri saklanır.
    r["kaynak_tarihleri"] = {
        "sonuc_ozeti": so and so.get("uretim"),
        "tik_sonrasi": ts and ts.get("guncelleme"),
        "dogru_sayfa": ds and ds.get("guncelleme"),
        "hedef_sorgular": hs and hs.get("guncelleme"),
        "ada_beklenti": ab and ab.get("guncelleme"),
        "gorunmez_teshis": gt and gt.get("guncelleme"),
        "veri_sagligi": vs and vs.get("guncelleme"),
    }
    return r


# ======================= 2) GERİ DOLDURMA =======================
# --- SERP: dogru-sayfa.py'deki sinif() ile birebir; oradan değişirse burası da ---
def sinif(r):
    u = (r.get("u") or "")
    if not r.get("sira"):
        return "yok"
    if u.startswith("cite:") or "…" in u or "..." in u:
        return "belirsiz"
    if "/adalar/" in u:
        return "ada"
    if re.fullmatch(r"/mahalleler/[^/]+/?", u):
        return "mahalle"
    if "/mahalleler/" not in u:
        return "dis"
    if u.rstrip("/") == f"/mahalleler/{r['s']}":
        return "dogru"
    m = re.match(r"/mahalleler/([^/]+)/", u)
    if m and not m.group(1).endswith("-mahallesi"):
        return "eski"
    return "baska_site"


def jsonl(ad):
    out = []
    p = f"{KOK}/{ad}"
    if not os.path.exists(p):
        return out
    for i, L in enumerate(open(p)):
        L = L.strip()
        if L:
            r = json.loads(L)
            r["_sira_no"] = i
            out.append(r)
    return out


def serp_serisi(gunler):
    """Her gün için: o güne kadarki en taze ölçümle ilk3 / doğru sayfa / ilk 10 dışı."""
    kuyruk = {r["s"] for r in json.load(open(f"{KOK}/kuyruk-site-emlakci.json"))}
    kayit = [r for r in jsonl("sonuclar-site-emlakci.jsonl") if r.get("s") in kuyruk and r.get("d")]
    kayit.sort(key=lambda r: (r["d"], r["_sira_no"]))   # gün içinde dosya sırası: son yazılan geçerli
    son = {}
    i = 0
    cikti = {}
    for g in gunler:
        gs = g.isoformat()
        while i < len(kayit) and kayit[i]["d"] <= gs:
            son[kayit[i]["s"]] = kayit[i]
            i += 1
        n = len(son)
        if not n:
            cikti[gs] = {}
            continue
        ilk3 = [r for r in son.values() if r.get("sira") and r["sira"] <= 3]
        yok = sum(1 for r in son.values() if not r.get("sira"))
        dogru3 = sum(1 for r in ilk3 if sinif(r) == "dogru")
        bolge = sum(1 for r in son.values() if r["d"] >= BOLGE_TURU_BAS)
        cikti[gs] = {"ilk3_pay": yuzde(len(ilk3), n), "dogru_sayfa_pay": yuzde(dogru3, len(ilk3)),
                     "ilk10_disi": yuzde(yok, n), "serp_olculen": n,
                     "serp_bolge_turu_pay": yuzde(bolge, n), "serp_kanal": kanal_sayimi(son.values())}
    return cikti


# --- Hedef sorgular: hedef-sorgular-uret.py'deki HEDEFLER + eslesir() ile aynı ---
_MAHALLELER = ["Eryaman", "Tunahan", "Altay", "Devlet", "Göksu", "Güzelkent",
               "Şehit Osman Avcı", "Şeker", "Şeyh Şamil", "Yavuz Selim", "Yeşilova"]
_SLUG = {"Eryaman": "eryaman-mahallesi", "Tunahan": "tunahan-mahallesi", "Altay": "altay-mahallesi",
         "Devlet": "devlet-mahallesi", "Göksu": "goksu-mahallesi", "Güzelkent": "guzelkent-mahallesi",
         "Şehit Osman Avcı": "sehit-osman-avci-mahallesi", "Şeker": "seker-mahallesi",
         "Şeyh Şamil": "seyh-samil-mahallesi", "Yavuz Selim": "yavuz-selim-mahallesi",
         "Yeşilova": "yesilova-mahallesi"}
_ETAP = {1: "altay-mahallesi/etaplar/1", 2: "sehit-osman-avci-mahallesi/etaplar/2",
         3: "seyh-samil-mahallesi/etaplar/3", 4: "tunahan-mahallesi/etaplar/4", 5: "tunahan-mahallesi/etaplar/5"}
HEDEFLER = [{"sorgu": "eryaman emlakçı", "aile": "cati", "s": None}]
HEDEFLER += [{"sorgu": f"Eryaman {n}. Etap emlakçı", "aile": "etap", "s": _ETAP[n]} for n in range(1, 6)]
HEDEFLER += [{"sorgu": f"{ad} Mahallesi emlakçı", "aile": "mahalle", "s": _SLUG[ad]} for ad in _MAHALLELER]


def eslesir(r, h):
    qk = anahtar(r.get("q", ""))
    if qk == anahtar(h["sorgu"]):
        return "q"
    s = r.get("s") or ""
    if h["s"] and s == h["s"] and "emlakç" in qk:
        if h["aile"] == "etap" and "etap" in qk:
            return "s"
        if h["aile"] == "mahalle" and "mahalle" in qk:
            return "s"
    return None


def hedef_serisi(gunler):
    """Her gün için 17 hedefte o güne kadarki en taze ölçüm: ilk 3 / ilk 10 dışı sayısı.
    Aynı günün birden çok kaydında hedef-sorgular-uret.py'nin taze_once sırası
    (isgal'li, hl'li, sonra dosya sırası) geçerli."""
    kayit = jsonl("sonuclar-emlakci.jsonl") + jsonl("sonuclar-site-emlakci.jsonl")
    hedef_kayit = collections.defaultdict(list)
    for r in kayit:
        if not r.get("d"):
            continue
        for i, h in enumerate(HEDEFLER):
            if eslesir(r, h):
                hedef_kayit[i].append(r)
                break
    for v in hedef_kayit.values():
        v.sort(key=lambda r: (r["d"], 1 if "isgal" in r else 0, 1 if ("hl" in r or "hp" in r) else 0, r["_sira_no"]))
    cikti = {}
    for g in gunler:
        gs = g.isoformat()
        ilk3 = disi = 0
        kullanilan = []
        for i in range(len(HEDEFLER)):
            uygun = [r for r in hedef_kayit.get(i, []) if r["d"] <= gs]
            if not uygun:
                continue
            kullanilan.append(uygun[-1])
            sira = uygun[-1].get("sira") or 0
            if 1 <= sira <= 3:
                ilk3 += 1
            if sira == 0:
                disi += 1
        cikti[gs] = ({"hedef_ilk3": ilk3, "hedef_disi": disi, "hedef_olculen": len(kullanilan),
                      "hedef_kanal": kanal_sayimi(kullanilan)} if kullanilan else {})
    return cikti


# --- GSC / GA4 günlük ham çekim ---
def calistir(argv, cikti_dosya):
    """Betiği koştur, stdout'u dosyaya yaz; --yerel ya da hata halinde eldeki dosyayı kullan."""
    if not S:
        print("UYARI: KARNE_SCRATCH yok — GSC/GA4 geri doldurma atlandı", file=sys.stderr)
        return None
    yol = f"{S}/{cikti_dosya}"
    if not YEREL:
        try:
            p = subprocess.run(["node", *argv], capture_output=True, text=True, cwd=KOK, timeout=120)
            if p.returncode == 0 and p.stdout.strip():
                open(yol, "w").write(p.stdout)
            else:
                print(f"UYARI: {os.path.basename(argv[0])} başarısız ({p.stderr.strip()[:160]}) — eldeki {cikti_dosya} okunacak", file=sys.stderr)
        except Exception as e:  # ağ yok, node yok…
            print(f"UYARI: {os.path.basename(argv[0])} koşmadı ({e}) — eldeki {cikti_dosya} okunacak", file=sys.stderr)
    if not os.path.exists(yol):
        print(f"UYARI: {yol} yok — o alanlar null", file=sys.stderr)
        return None
    return open(yol).read().splitlines()


def yardimci(ad):
    """gsc-q.mjs / ga4-q.mjs: önce bu klasör (repoyla gezer), sonra KARNE_SCRATCH.
    NEDEN: scratchpad oturuma özel; yeni oturumda boş gelir ve geri doldurma sessizce
    null'a düşerdi. ga4-q.mjs bu yüzden pws0'da da duruyor."""
    for kok in (KOK, S):
        if kok and os.path.exists(f"{kok}/{ad}"):
            return f"{kok}/{ad}"
    return f"{S}/{ad}"   # yoksa calistir() uyarı basar


def gsc_gunluk(bas, bit, ek=None, dosya="gsc-gunluk.tsv"):
    argv = [yardimci("gsc-q.mjs"), bas.isoformat(), bit.isoformat(), "date"] + ([ek] if ek else [])
    sat = calistir(argv, dosya)
    if sat is None:
        return None
    d = {}
    for L in sat:
        p = L.split("\t")
        if len(p) >= 4:
            d[p[3]] = (int(p[0]), int(p[1]), float(p[2]))   # gös, tık, konum
    return d


def gsc_pencere(d, g, n):
    """gsc-api.mjs pencere() ile aynı: D-2'ye kadar VERİ olan günlerin son n'i."""
    sinir = (g - datetime.timedelta(days=GSC_GECIKME)).isoformat()
    gunler = sorted(k for k in d if k <= sinir)[-n:]
    r = [d[k] for k in gunler]
    gos = sum(x[0] for x in r); tik = sum(x[1] for x in r)
    if not r or not gos:
        return None
    return {"gos": gos, "tik": tik, "to": round(100 * tik / gos, 2),
            "poz": round(sum(x[2] * x[0] for x in r) / gos, 1),
            "gun": len(r), "bas": gunler[0], "bit": gunler[-1]}


def ga4_gunluk(bas, bit):
    sat = calistir([yardimci("ga4-q.mjs"), bas.isoformat(), bit.isoformat(), "gunluk"], "ga4-gunluk.tsv")
    ol = calistir([yardimci("ga4-q.mjs"), bas.isoformat(), bit.isoformat(), "olaylar"], "ga4-olaylar-gunluk.tsv")
    if sat is None:
        return None, None
    d = {}
    for L in sat:
        p = L.split("\t")
        if len(p) >= 5:
            d[p[0]] = (int(p[1]), float(p[2]), float(p[3]))   # oturum, ort süre, hemen çıkma
    o = collections.defaultdict(lambda: collections.Counter())
    for L in (ol or []):
        p = L.split("\t")
        if len(p) == 3:
            o[p[0]][p[1]] += int(p[2])
    return d, o


def ga4_pencere(d, o, bas, bit):
    r = [v for k, v in d.items() if bas.isoformat() <= k <= bit.isoformat()]
    ot = sum(x[0] for x in r)
    if not r or not ot:
        return None
    ev = collections.Counter()
    for k, c in o.items():
        if bas.isoformat() <= k <= bit.isoformat():
            ev.update(c)
    return {"oturum": ot, "sure": round(sum(x[1] * x[0] for x in r) / ot),
            "hemen": round(sum(x[2] * x[0] for x in r) / ot, 1),
            "phone": ev.get("phone_click", 0), "wa": ev.get("whatsapp_click", 0), "gun": len(r)}


def geri_doldur():
    gunler = [GERI_BAS + datetime.timedelta(days=i) for i in range((BUGUN - GERI_BAS).days + 1)]
    serp = serp_serisi(gunler)
    hedef = hedef_serisi(gunler)
    # ada beklentisi: ada-beklenti-gecmis.jsonl'daki (tarih → oran) satırları
    ada = {}
    for r in jsonl("ada-beklenti-gecmis.jsonl"):
        if r.get("tarih") and r.get("ada_oran") is not None:
            ada[r["tarih"]] = r["ada_oran"]

    # En eski pencere GERI_BAS'tan 28 veri günü + gecikme + pay geriye uzanır
    cekim_bas = GERI_BAS - datetime.timedelta(days=28 + GSC_GECIKME + 7)
    YM = "page::excludingRegex::/mahalleler/(ata|susuz|cumhuriyet)(-mahallesi)?/"  # sonuc-ozeti-uret.py ile aynı ayrım
    g_tum = gsc_gunluk(cekim_bas, BUGUN, None, "gsc-gunluk.tsv")
    g_ery = gsc_gunluk(cekim_bas, BUGUN, YM, "gsc-gunluk-eryaman.tsv")
    a_gun, a_olay = ga4_gunluk(cekim_bas, BUGUN)

    satirlar = []
    for g in gunler:
        gs = g.isoformat()
        r = {"tarih": gs, "kaynak": "geri_doldurma"}
        for m in METRIK_AD:
            r[m] = None
        r.update(serp.get(gs, {}))
        r.update(hedef.get(gs, {}))
        if gs in ada:
            r["ada_beklenti_orani"] = ada[gs]
        if g_tum:
            p = gsc_pencere(g_tum, g, 28)
            if p:
                r.update({"gsc_tik_28": p["tik"], "gsc_gos_28": p["gos"], "gsc_to_28": p["to"],
                          "gsc_konum_28": p["poz"],
                          "gsc_pencere": {"bas": p["bas"], "bit": p["bit"], "gun": p["gun"]}})
            h = gsc_pencere(g_tum, g, 7)
            if h:
                r.update({"gsc_tik_hafta": h["tik"], "gsc_gos_hafta": h["gos"], "gsc_to_hafta": h["to"]})
        if g_ery:
            p = gsc_pencere(g_ery, g, 28)
            if p:
                r["eryaman_tik_28"] = p["tik"]
        if a_gun:
            bas28, bit = g - datetime.timedelta(days=28), g - datetime.timedelta(days=1)
            p = ga4_pencere(a_gun, a_olay, bas28, bit)
            if p:
                r.update({"ga4_oturum_28": p["oturum"], "ga4_sure": p["sure"], "ga4_hemen": p["hemen"],
                          "phone_click_28": p["phone"], "whatsapp_click_28": p["wa"],
                          "ga4_pencere": {"bas": bas28.isoformat(), "bit": bit.isoformat(), "gun": p["gun"]}})
            h = ga4_pencere(a_gun, a_olay, g - datetime.timedelta(days=7), bit)
            if h:
                r.update({"ga4_oturum_hafta": h["oturum"], "ga4_sure_hafta": h["sure"], "ga4_hemen_hafta": h["hemen"],
                          "phone_click_hafta": h["phone"], "whatsapp_click_hafta": h["wa"]})
        satirlar.append(r)
    return satirlar


# ======================= 3) DOSYA + ÖZET =======================
def gecmisi_oku():
    return [{k: v for k, v in r.items() if k != "_sira_no"} for r in jsonl("karne-gecmis.jsonl")]


def gecmisi_yaz(satirlar):
    # (tarih, kaynak) tekil; eskiden yeniye, aynı günde geri_doldurma önce anlık sonra
    satirlar.sort(key=lambda r: (r["tarih"], 0 if r["kaynak"] == "geri_doldurma" else 1))
    with open(GECMIS, "w") as f:
        for r in satirlar:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")


def ust_yaz(satirlar, yeni):
    d = {(r["tarih"], r["kaynak"]): r for r in satirlar}
    for r in yeni:
        d[(r["tarih"], r["kaynak"])] = r
    return list(d.values())


def ozet_kur(satirlar):
    # gün → (değer, kaynak, satır); aynı günde anlık satır geri doldurmayı ezer (karnede basılan oydu)
    seri = {m: {} for m in METRIK_AD}
    for r in sorted(satirlar, key=lambda r: (r["tarih"], 0 if r["kaynak"] == "geri_doldurma" else 1)):
        for m in METRIK_AD:
            if r.get(m) is not None:
                seri[m][r["tarih"]] = (r[m], r["kaynak"], r)
    tarihler = sorted({r["tarih"] for r in satirlar})
    # anlık satır SERP rejim payını taşımaz (dogru-sayfa.json'dan gelir); aynı günün
    # geri doldurma satırı varsa pay oradan okunur
    geri_satir = {r["tarih"]: r for r in satirlar if r["kaynak"] == "geri_doldurma"}

    def bolge_pay(t, r):
        v = r.get("serp_bolge_turu_pay")
        return v if v is not None else geri_satir.get(t, {}).get("serp_bolge_turu_pay")

    def etiketli_pay(t, r):
        """Hedef ölçümlerinin kanal etiketi taşıyan payı (%); anlık satır taşımaz, aynı günün
        geri doldurma satırından okunur."""
        k = r.get("hedef_kanal") or geri_satir.get(t, {}).get("hedef_kanal")
        if not k:
            return None
        n = sum(k.values())
        return yuzde(n - k.get("etiketsiz", 0), n) if n else None

    def ayrisiyor(a, b):
        return a is not None and b is not None and abs(a - b) >= REJIM_ESIK

    metrikler = {}
    for m, ad, birim, artis in METRIKLER:
        s = seri[m]
        if not s:
            metrikler[m] = {"ad": ad, "birim": birim, "artis": artis, "son": None, "yon": "nötr",
                            "not": "ölçülmedi"}
            continue
        son_t = max(s)
        son_v, son_k, son_r = s[son_t]
        son_d = datetime.date.fromisoformat(son_t)
        # 7 gün öncesi: tam D-7; yoksa en yakın önceki gün (en çok 3 gün geri), o da yoksa null
        onceki_t = None
        for geri in range(7, 11):
            t = (son_d - datetime.timedelta(days=geri)).isoformat()
            if t in s:
                onceki_t = t
                break
        onceki_v = s[onceki_t][0] if onceki_t else None
        fark = fark_yuzde = None
        if onceki_v is not None:
            fark = round(son_v - onceki_v, 2)
            fark_yuzde = round(100 * fark / onceki_v, 1) if onceki_v else None
        if fark is None or fark == 0:
            yon = "nötr"
        else:
            yon = "iyi" if (fark > 0) == (artis == "iyi") else "kötü"
        # 8 noktalı sparkline: son gün ve ondan önceki 7 gün, günlük kadans; boş gün null
        sp_t = [(son_d - datetime.timedelta(days=7 - i)).isoformat() for i in range(8)]
        sp = [s[t][0] if t in s else None for t in sp_t]
        kayit = {"ad": ad, "birim": birim, "artis": artis,
                 "son": son_v, "son_tarih": son_t, "son_kaynak": son_k,
                 "onceki": onceki_v, "onceki_tarih": onceki_t,
                 "onceki_kaynak": s[onceki_t][1] if onceki_t else None,
                 "fark": fark, "fark_yuzde": fark_yuzde, "yon": yon,
                 "sparkline": sp, "sparkline_tarihler": sp_t,
                 "nokta_sayisi": len(s)}
        notlar = []
        if onceki_t is None:
            notlar.append("7 gün önceki değer ölçülmedi")
        elif son_k != s[onceki_t][1] and (m.startswith("gsc_") or m.startswith("ga4_")
                                          or m in ("eryaman_tik_28", "phone_click_28", "whatsapp_click_28")):
            # yalnız GSC/GA4: SERP ve hedef değerleri iki kaynakta da aynı jsonl'den gelir, ayrışmaz
            notlar.append("iki uç farklı kaynaktan (anlık JSON / geri doldurma); GSC son günleri sonradan "
                          "tamamlar, GA4 dünü yeniden işler — birkaç yüzde ayrışma veri olgunlaşmasıdır")
        rejim = False
        if m in SERP_METRIK:
            # rejim payı: iki ucun ölçümleri ne kadar bölge turundan (27.08+) geliyor
            kayit["son_bolge_turu_pay"] = bolge_pay(son_t, son_r)
            kayit["onceki_bolge_turu_pay"] = bolge_pay(onceki_t, s[onceki_t][2]) if onceki_t else None
            if onceki_t and (kayit["onceki_bolge_turu_pay"] or 0) < (kayit["son_bolge_turu_pay"] or 0):
                notlar.append("önceki nokta daha çok 27.08 öncesi turdan; o turun 'ilk 10 dışı' sonuçları "
                              "yeniden ölçümde büyük ölçüde geri döndü (bkz. pencere_notu.serp)")
            rejim = ayrisiyor(kayit["son_bolge_turu_pay"], kayit["onceki_bolge_turu_pay"])
        if m in HEDEF_METRIK:
            kayit["son_etiketli_pay"] = etiketli_pay(son_t, son_r)
            kayit["onceki_etiketli_pay"] = etiketli_pay(onceki_t, s[onceki_t][2]) if onceki_t else None
            rejim = ayrisiyor(kayit["son_etiketli_pay"], kayit["onceki_etiketli_pay"])
            if rejim:
                notlar.append("önceki nokta kanal etiketi taşımayan (27.08 öncesi) ölçümlerden; hedef sorgular "
                              "bölümü aynı kıyasa 'kanal değişti' diyor — fark iyi/kötü diye okunmaz")
        # Rejim ayrışınca yön hükmü verilmez: karne ve yönetici özeti bu alanı okur.
        kayit["olcum_yontemi_degisti"] = bool(rejim)
        if rejim:
            kayit["yon"] = "nötr"
        if notlar:
            kayit["not"] = " · ".join(notlar)
        metrikler[m] = kayit
    return {
        "guncelleme": BUGUN.isoformat(),
        "seri_bas": tarihler[0] if tarihler else None,
        "seri_bit": tarihler[-1] if tarihler else None,
        "satir_sayisi": dict(collections.Counter(r["kaynak"] for r in satirlar)),
        # gün sayısı satır sayısından az: aynı günde anlık + geri doldurma iki satır
        "gun_sayisi": len(tarihler),
        "yon_kurali": {"artis_iyi": [m for m, _, _, a in METRIKLER if a == "iyi"],
                       "artis_kotu": [m for m, _, _, a in METRIKLER if a == "kotu"]},
        "pencere_notu": {
            "gsc": "28 gün = gsc-api ozet penceresi: D-2'ye kadar veri olan günlerin son 28'i (GSC 2-3 gün geriden gelir); "
                   "satırdaki gsc_pencere gerçek başlangıç/bitişi verir",
            "ga4": "28 gün = ga4-api penceresi: D-28 … D-1 (dün dahil; GA4 dünü ertesi gün yeniden işler)",
            "serp": "her sayfa için o güne kadarki en taze ölçüm; payda = o güne dek en az bir kez ölçülen sayfa sayısı "
                    "(serp_olculen). 27.08 öncesi tur (22-23.08) kanal sınırında koştu ve 'ilk 10 dışı' sonuçları "
                    "kararsız çıktı: o sıfırların çoğu yeniden ölçümde ilk 10'a döndü. serp_bolge_turu_pay düşük "
                    "noktalar aynı ölçüm rejiminde değildir.",
            "hedef": "17 hedef sorgu; geri doldurmada yalnız sıra (kutu bilgisi geriye dönük güvenilir değil); "
                     "kanal karışık (hedef_kanal), 27.08 öncesi kayıtlar etiketsiz",
        },
        "metrikler": metrikler,
    }


def main():
    eski = gecmisi_oku()
    yeni = [anlik_satir()]
    if not YALNIZ_ANLIK:
        yeni += geri_doldur()
    hepsi = ust_yaz(eski, yeni)
    gecmisi_yaz(hepsi)
    oz = ozet_kur(hepsi)
    json.dump(oz, open(OZET, "w"), ensure_ascii=False, indent=1)

    say = oz["satir_sayisi"]
    print(f"karne-gecmis.jsonl: {say.get('anlik', 0)} anlık + {say.get('geri_doldurma', 0)} geri doldurma satırı "
          f"({oz['seri_bas']} → {oz['seri_bit']})")
    for m, ad, birim, _ in METRIKLER:
        k = oz["metrikler"][m]
        if k["son"] is None:
            print(f"  {ad:44} ölçülmedi")
            continue
        nd = 1 if isinstance(k["son"], float) else 0
        onc = tr_sayi(k["onceki"], nd) if k["onceki"] is not None else "—"
        frk = ("+" if (k["fark"] or 0) > 0 else "") + tr_sayi(k["fark"], nd) if k["fark"] is not None else "—"
        print(f"  {ad:44} {tr_sayi(k['son'], nd):>9} {birim:5} 7 gün önce {onc:>9}  fark {frk:>8}  {k['yon']}")


if __name__ == "__main__":
    main()
