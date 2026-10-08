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
                     İSTİSNA (08.10 onarım) — SERP metriklerinin GEÇMİŞ noktaları: iki
                     kaynak aynı jsonl'den hesaplanır; ayrışıyorsa anlık satır o gün bayat
                     girdiyle ya da eski sınıflamayla basılmıştır. Kıyas ve sparkline geri
                     doldurma değerini kullanır, o gün basılan değer metrikte
                     onceki_karnede_basilan alanında durur. Ölçülen vaka: 07.10 anlık satırı
                     doğru sayfa payını 85,5 basmıştı, aynı günün tam dosyayla değeri 90,8;
                     düzeltme olmasa 14.10 karnesi hiç yeni ölçüm yokken "+5,3, iyi" derdi.
                     Son nokta (bugünkü anlık) olduğu gibi kalır: karnede basılan odur.

Geri doldurma yöntemi (21.08'den bugüne, her gün için):
  SERP  : sonuclar-site-emlakci.jsonl — her sayfa için o güne kadarki EN TAZE ölçüm
          (dogru-sayfa.py ile aynı sınıflama: adaş eş "doğru", uule kaydında eski
          şema kırıntısı "belirsiz"; kuyruk-site-emlakci.json üyeliği ve "es" alanı).
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
  Temas : ga4-temas.mjs <bas> <bit> (bu klasörde ya da KARNE_SCRATCH'te; tek JSON, alan
          temas_oturum.toplam) — telefon ya da WhatsApp düğmesine basan ZİYARET sayısı,
          yalnız canlı alan adı. Çağrı pahalı olduğu için her gün değil SABİT haftalık
          ızgarada (TEMAS_IZGARA_BAS + 7k) ve kıyasın iki ucunda (bugün, −7) çekilir;
          penceresi 3 günden eski bitmiş değerler jsonl'deki eski satırdan taşınır, yeniden
          çekilmez. İlk koşu ızgaranın tamamını çeker (08.10'da 7 pencere + 2 haftalık dilim
          = 9 çağrı); sonraki günlerde yalnız eksik uçlar: bugün, varsa −7, olgunlaşmamış
          son ızgara günü ve iki haftalık dilim (en çok 5 çağrı). Betik yoksa seri yok.
  Ham çekimler KARNE_SCRATCH'e TSV olarak bırakılır; API düşerse (--yerel ya da
  hata) oradaki TSV okunur, o da yoksa alanlar null kalır ve uyarı basılır.

DİKKAT — iki kaynak aynı günün değerinde birkaç yüzde ayrışabilir: GSC son
günleri sonradan tamamlar (31.08'de çekilen 28 günlük toplam 2.531 tık, aynı
pencere 02.09'da 2.603), GA4 dünü gece yeniden işler. Bu hata değil, veri
olgunlaşması; özetteki her nokta kaynağını taşır.

YÖN HÜKMÜNÜ SUSTURAN ÜÇ KURAL (özet; karne ve yönetici özeti bu alanları okur):
  Rejim   : iki ucun ölçüm rejimi ayrışıyor (SERP'te bölge turu payı, hedefte kanal etiketi).
  Seçici  : (08.10) ilk3_pay ve dogru_sayfa_pay için — pencerede yeniden ölçülen sorguların
            "önceden doğru" payı kuyruk genelinden ≥25 puan ayrışıyorsa (ve ≥20 sorgu yeniden
            ölçüldüyse) tur yalnız bir kesimi yeniden ölçmüştür; fark tek yönlüdür. 08.10'da
            ölçülen: 209 sorgunun 37'si önceden doğruydu, kuyrukta 509'un 328'i.
  Gürültü : (08.10) temas sayıları küçük. 7 gün arayla iki 28 günlük pencere 21 günü
            paylaşır; fark = giren hafta − çıkan hafta. z = (giren − N·p) / √(N·p·(1−p)),
            N = giren + çıkan, p = giren haftanın oturum payı. |z| < 2 ise yön "nötr".
            Oturum düşüşünü temas oranı düşüşünden ayırır; sıfır temaslı haftayı yakalar.
            Sınama yapılamıyorsa (haftalık dilim yok, kıyas tam 7 gün değil) yön yine "nötr":
            sınanmamış küçük sayı farkına iyi/kötü denmez.
  Üçünde de olcum_yontemi_degisti / gurultu / secici_yeniden_olcum alanları nedenini taşır.

Kullanım (KARNE_SCRATCH şart: ham TSV'ler oraya yazılır; gsc-q.mjs orada, ga4-q.mjs bu klasörde durur):
  python3 anlik-goruntu-uret.py                 # anlık satır + geri doldurma (API) + özet
  python3 anlik-goruntu-uret.py --yerel         # API'ye gitmez, scratchpad TSV'lerini okur
  python3 anlik-goruntu-uret.py --yalniz-anlik  # geri doldurma yok; anlık satır + özet

Girdi : sonuc-ozeti.json, tik-sonrasi.json, dogru-sayfa.json, hedef-sorgular.json,
        ada-beklenti.json, ada-beklenti-gecmis.jsonl, gorunmez-teshis.json,
        veri-sagligi.json, DIZIN-DAMLASI-31-08.md, kuyruk-site-emlakci.json,
        sonuclar-site-emlakci.jsonl, sonuclar-emlakci.jsonl, (varsa) ga4-temas.mjs
Çıktı : karne-gecmis.jsonl (birikir), karne-gecmis-ozet.json (her koşuda yeniden)
"""
import json, math, os, re, sys, subprocess, datetime, collections

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
    ("temas_oturum_28",     "Temas eden ziyaret (28 gün)",          "ziyaret", "iyi"),
    ("hedef_ilk3",          "Hedef sorgu: ilk 3'te",                "sorgu", "iyi"),
    ("hedef_kutuda",        "Hedef sorgu: harita kutusunda",        "sorgu", "iyi"),
    ("hedef_disi",          "Hedef sorgu: ilk 10 dışında",          "sorgu", "kotu"),
    ("ada_beklenti_orani",  "Ada sayfaları: alınan / beklenen tık", "oran",  "iyi"),
    ("damla_acik",          "Dizin damlası: açık kayıt",            "adet",  "kotu"),
    ("damla_dizin_disi",    "Dizin kuyruğu: Google′da olmayan sayfa", "adet", "kotu"),
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
# "Önceki nokta daha çok 27.08 öncesi turdan" notu için en az ayrışma (puan). 08.10'a kadar her
# pozitif fark notu basıyordu: %99,8'e karşı %100 için de "27.08 öncesi turdan" deniyordu.
REJIM_NOT_ESIK = 5
# Seçici yeniden ölçüm (08.10, ye-1 f): pencerede en az SECICI_MIN sorgu yeniden ölçüldüyse ve
# bunların "önceden doğru" payı kuyruk genelinden SECICI_ESIK puan ayrışıyorsa fark tek yönlüdür.
SECICI_METRIK = ("ilk3_pay", "dogru_sayfa_pay")
SECICI_MIN = 20
SECICI_ESIK = 25
# Gürültü kuralı (08.10, temas-1): 28 günlük metrik → haftalık dilim alan(lar)ı. Ziyaret dilimi
# yoksa (ga4-temas.mjs koşmadıysa) temas_oturum_28 için telefon + WhatsApp tıkı yedek ölçüdür.
TEMAS_HAFTA = {
    "phone_click_28": [(("phone_click_hafta",), "tık")],
    "whatsapp_click_28": [(("whatsapp_click_hafta",), "tık")],
    "temas_oturum_28": [(("temas_oturum_hafta",), "ziyaret"),
                        (("phone_click_hafta", "whatsapp_click_hafta"), "tık")],
}
GURULTU_Z = 2.0
TEMAS_OLGUN_GUN = 3    # penceresi bu kadar gün önce bitmiş temas değeri yeniden çekilmez (GA4 dünü yeniden işler)
# Temas eden ziyaret serisinin sabit haftalık ızgarası: bu günden başlayarak 7 günde bir (bölge
# turunun ilk günü; 08.10 ilk geri doldurmasının günleriyle aynı: 27.08, 03.09 … 08.10).
TEMAS_IZGARA_BAS = datetime.date(2026, 8, 27)
# SERP metriklerinde aynı günün anlık ve geri doldurma değeri en az bu kadar ayrışıyorsa (değerler
# bir ondalıkla yazılır) anlık satır bayat girdiyle basılmış sayılır.
SERP_AYRISMA = 0.05


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


# --- Dizin damlası satır türü — ORTAK SÖZLEŞME S1 (08.10) ---
# karne-html.py, yonetici-ozeti-uret.py ve is-takvimi-uret.py AYNI kuralı uygular; biri
# değişirse dördü birden değişir. Açık "- [ ] https://…" satırı:
#   adres eski şemadaysa (/mahalleler/<slug>… ve <slug> "-mahallesi" ile bitmiyor) → eski_adres
#   değilse "←" sonrası notta "dizin dışı" geçiyorsa                               → dizin_disi
#   değilse                                                                         → yeniden_tarama
# https içermeyen "- [ ]" satırı sayım dışıdır (kapanmış eski kuyruk listeleri).
_DAMLA_ACIK = re.compile(r"^- \[ \] (https://\S+)(.*)$")
_DAMLA_ESKI = re.compile(r"^https://[^/]+/mahalleler/([^/?#]+)")


def damla_satir_turu(satir):
    m = _DAMLA_ACIK.match(satir)
    if not m:
        return None
    e = _DAMLA_ESKI.match(m.group(1))
    if e and not e.group(1).endswith("-mahallesi"):
        return "eski_adres"
    kalan = m.group(2)
    notu = kalan.split("←", 1)[1] if "←" in kalan else ""
    return "dizin_disi" if anahtar("dizin dışı") in anahtar(notu) else "yeniden_tarama"


def damla_turleri(metin):
    say = {"dizin_disi": 0, "yeniden_tarama": 0, "eski_adres": 0}
    for L in metin.splitlines():
        t = damla_satir_turu(L)
        if t:
            say[t] += 1
    return say


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
        # 08.10: temas eden ZİYARET (tik-sonrasi-uret.py ga4-temas.mjs çıktısından yazar);
        # eski tik-sonrasi.json'da alan yok → null, seri geri doldurmadan beslenir
        r["temas_oturum_28"] = ts["temas"].get("temas_oturum")
        r["ga4_pencere"] = ts.get("pencere")
    if hs:
        o = hs["ozet"]
        r["hedef_ilk3"] = o["ilk3"]           # 1. sıradakiler dahil (ilk3+ilk4_10+disarida = 17)
        r["hedef_kutuda"] = o["kutuda"]
        r["hedef_disi"] = o["disarida"]
    if ab:
        r["ada_beklenti_orani"] = ab["ada"]["oran"]
    # damla: "- [ ] https://…" açık (türü S1 ile), "- [x] url ← …" bitmiş.
    # 08.10: damla_acik eskiden HER "- [ ]" satırını sayıyordu (kapanmış 07.09 kuyruğunun
    # https'siz satırları dahil) ve hepsi "dizin dışı" okunuyordu. Artık yalnız https'li açık
    # satırlar sayılır ve üç türe ayrılır; damla_tanim alanı tanım değişikliğini işaretler
    # (özet, eski tanımlı noktayla kıyasta yön hükmü vermez).
    dp = f"{KOK}/DIZIN-DAMLASI-31-08.md"
    if os.path.exists(dp):
        metin = open(dp, encoding="utf-8").read()
        dt = damla_turleri(metin)
        r["damla_acik"] = sum(dt.values())
        r["damla_dizin_disi"] = dt["dizin_disi"]
        r["damla_yeniden_tarama"] = dt["yeniden_tarama"]
        r["damla_eski_adres"] = dt["eski_adres"]
        r["damla_tanim"] = "S1"
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
# --- SERP: dogru-sayfa.py'deki ESKI_CITE + es_sozlugu() + sinif() ile birebir; oradan değişirse burası da ---
ESKI_CITE = re.compile(
    r"siringayrimenkul\.com/(?:mahalleler/)?"
    r"(?:altay|devlet|eryaman|goksu|guzelkent|sehit-osman-avci|seker|seyh-samil|tunahan|yavuz-selim|yesilova)"
    r"(?:/|$)")


def es_sozlugu(kuyruk_kayitlari):
    """s → adaş eşlerin yolları ({"/mahalleler/<es>", …}); kuyruğun "es" alanından."""
    es = collections.defaultdict(set)
    for r in kuyruk_kayitlari:
        for e in (r.get("es") or []):
            es[r["s"]].add(f"/mahalleler/{e}")
    return dict(es)


def sinif(r, es):
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
    yol = u.rstrip("/")
    if yol == f"/mahalleler/{r['s']}" or yol in es.get(r["s"], ()):
        # 08.10: u başlıktan çözülmüş (ekle-uule.py) ve kırıntı eski şemayı gösteriyor
        if r.get("kanal") == "uule-eryaman" and any(ESKI_CITE.search(x) for x in (r.get("ilk3") or [])):
            return "belirsiz"
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


def serp_kayitlari():
    """(kuyruk içi SERP kayıtları [gün, dosya sırası], adaş eş sözlüğü)."""
    kq = json.load(open(f"{KOK}/kuyruk-site-emlakci.json", encoding="utf-8"))
    kuyruk = {r["s"] for r in kq}
    kayit = [r for r in jsonl("sonuclar-site-emlakci.jsonl") if r.get("s") in kuyruk and r.get("d")]
    kayit.sort(key=lambda r: (r["d"], r["_sira_no"]))   # gün içinde dosya sırası: son yazılan geçerli
    return kayit, es_sozlugu(kq)


def secici_yeniden_olcum(onceki_t, son_t, kayit=None, es=None):
    """(onceki_t, son_t] penceresinde YENİDEN ölçülen sorguların önceki sınıfı kuyruk geneline
    benziyor mu? Benzemiyorsa tur seçiciydi (08.10: yalnız Eylül'de sorunlu çıkanlar yeniden
    ölçüldü) ve ilk 3 / doğru sayfa payındaki fark tüm kuyruğun hareketi değildir.

    "Önceki sınıf" = sorgunun onceki_t gününe kadarki son ölçümü. Pencerede ilk kez ölçülen
    sorgu yeniden ölçüm sayılmaz (ilk_kez alanında ayrı durur)."""
    if kayit is None:
        kayit, es = serp_kayitlari()
    gecmis = collections.defaultdict(list)
    for r in kayit:
        if r["d"] <= son_t:
            gecmis[r["s"]].append(r)
    yeniden = onceden_dogru = kuyruk_dogru = kuyruk_toplam = ilk_kez = 0
    onceki_gunler, yeni_gunler = [], []
    for v in gecmis.values():
        onceki = [x for x in v if x["d"] <= onceki_t]
        yeni = [x for x in v if x["d"] > onceki_t]
        if not onceki:
            ilk_kez += 1
            continue
        dogruydu = sinif(onceki[-1], es) == "dogru"
        kuyruk_toplam += 1
        kuyruk_dogru += dogruydu
        if yeni:
            yeniden += 1
            onceden_dogru += dogruydu
            onceki_gunler.append(onceki[-1]["d"])
            yeni_gunler.append(yeni[-1]["d"])
    if not kuyruk_toplam:
        return None
    yp, kp = yuzde(onceden_dogru, yeniden), yuzde(kuyruk_dogru, kuyruk_toplam)
    tek_yonlu = bool(yeniden >= SECICI_MIN and yp is not None and kp is not None
                     and abs(yp - kp) >= SECICI_ESIK)
    c = {"yeniden_olculen": yeniden, "onceden_dogru": onceden_dogru,
         "kuyruk_onceden_dogru": kuyruk_dogru, "kuyruk_toplam": kuyruk_toplam,
         "yeniden_pay": yp, "kuyruk_pay": kp, "ilk_kez": ilk_kez, "tek_yonlu": tek_yonlu,
         "pencere": {"bas": onceki_t, "bit": son_t},
         "yeni_olcum": {"bas": min(yeni_gunler), "bit": max(yeni_gunler)} if yeni_gunler else None,
         "onceki_olcum": {"bas": min(onceki_gunler), "bit": max(onceki_gunler)} if onceki_gunler else None}
    if tek_yonlu:
        kesim = "sorunlu çıkanlar" if yp < kp else "doğru çıkanlar"
        c["not"] = (f"pencerede yeniden ölçülen {tr_sayi(yeniden)} sorgudan {tr_sayi(onceden_dogru)} tanesi "
                    f"önceden doğru sayfaydı (kuyruk genelinde {tr_sayi(kuyruk_toplam)} sorgudan "
                    f"{tr_sayi(kuyruk_dogru)}); çoğunlukla {kesim} yeniden ölçüldü, fark tek yönlü")
    return c


def serp_serisi(gunler):
    """Her gün için: o güne kadarki en taze ölçümle ilk3 / doğru sayfa / ilk 10 dışı."""
    kayit, ES = serp_kayitlari()
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
        dogru3 = sum(1 for r in ilk3 if sinif(r, ES) == "dogru")
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


_TEMAS_UYARILDI = set()


def temas_cek(bas, bit):
    """[bas, bit] aralığında temas eden ziyaret sayısı (ga4-temas.mjs → temas_oturum.toplam).
    Betik, KARNE_SCRATCH ya da çıktı yoksa None: seri yok denir, üretici durmaz."""
    betik = yardimci("ga4-temas.mjs")
    ad = f"ga4-temas-{bas.isoformat()}-{bit.isoformat()}.json"
    # betik yoksa çağrı denenmez; --yerel'de eldeki önbellek dosyası yine okunur
    if not os.path.exists(betik) and not (YEREL and S and os.path.exists(f"{S}/{ad}")):
        if "betik" not in _TEMAS_UYARILDI:
            _TEMAS_UYARILDI.add("betik")
            print("UYARI: ga4-temas.mjs yok — temas_oturum_28 için seri yok (geri doldurulmadı)", file=sys.stderr)
        return None
    sat = calistir([betik, bas.isoformat(), bit.isoformat()], ad)
    if sat is None:
        return None
    try:
        return int(json.loads("\n".join(sat))["temas_oturum"]["toplam"])
    except (ValueError, KeyError, TypeError) as e:
        print(f"UYARI: {ad} okunamadı ({e}) — o günün temas_oturum alanı null", file=sys.stderr)
        return None


def geri_doldur(eski=()):
    gunler = [GERI_BAS + datetime.timedelta(days=i) for i in range((BUGUN - GERI_BAS).days + 1)]
    # Temas eden ziyaret: 28 günlük değer SABİT haftalık ızgarada (TEMAS_IZGARA_BAS + 7k) ve kıyasın
    # iki ucunda (bugün, −7); haftalık dilim yalnız gürültü kuralının iki ucunda (bugün ve −28).
    # Eldeki olgun değer yeniden çekilmez.
    # 08.10 onarım: ızgara BUGUN'e çapalıydı (bugün − 7k). Zincir başka bir gün koşunca ızgaranın
    # bütün günleri değişiyor, her yeni günde 7 pencere + 2 dilim = 9 çağrı yapılıyordu. Sabit
    # ızgarada geçmiş noktalar bir kez çekilir; eksik kalan nokta sonraki koşuda kendiliğinden dolar.
    eski_geri = {r["tarih"]: r for r in eski if r.get("kaynak") == "geri_doldurma"}
    sabit_izgara = {TEMAS_IZGARA_BAS + datetime.timedelta(days=7 * k)
                    for k in range((BUGUN - TEMAS_IZGARA_BAS).days // 7 + 1)}
    izgara = {"temas_oturum_28": sabit_izgara | {BUGUN, BUGUN - datetime.timedelta(days=7)},
              "temas_oturum_hafta": {BUGUN, BUGUN - datetime.timedelta(days=28)}}
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
        bit = g - datetime.timedelta(days=1)
        for alan, gun_sayisi in (("temas_oturum_28", 28), ("temas_oturum_hafta", 7)):
            v = eski_geri.get(gs, {}).get(alan)
            if g in izgara[alan] and (v is None or (BUGUN - bit).days < TEMAS_OLGUN_GUN):
                yeni = temas_cek(g - datetime.timedelta(days=gun_sayisi), bit)
                v = yeni if yeni is not None else v
            if v is not None:
                r[alan] = v
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


def temas_gurultu(m, son_t, onceki_t, geri_satir):
    """Temas farkı gürültüden ayrılıyor mu? (docstring'deki z kuralı.)

    28 günlük iki pencere 7 gün arayla 21 günü paylaşır; fark yalnız GİREN hafta [t−7, t−1]
    ile ÇIKAN haftanın [t−35, t−29] farkıdır. Oturum da değiştiği için beklenen pay giren
    haftanın oturum payıdır. Haftalık dilimler geri doldurma satırlarında durur
    (hafta(t) ve hafta(t−28)); yoksa ya da kıyas tam 7 gün değilse None (sınanamadı)."""
    if m not in TEMAS_HAFTA or not onceki_t:
        return None
    son_d = datetime.date.fromisoformat(son_t)
    if (son_d - datetime.date.fromisoformat(onceki_t)).days != 7:
        return None
    g = geri_satir.get(son_t)
    c = geri_satir.get((son_d - datetime.timedelta(days=28)).isoformat())
    if not g or not c:
        return None
    og, oc = g.get("ga4_oturum_hafta"), c.get("ga4_oturum_hafta")
    if not og or not oc:
        return None
    for alanlar, olcu in TEMAS_HAFTA[m]:
        gv, cv = [g.get(a) for a in alanlar], [c.get(a) for a in alanlar]
        if None in gv or None in cv:
            continue
        giren, cikan = sum(gv), sum(cv)
        n, p = giren + cikan, og / (og + oc)
        z = (giren - n * p) / math.sqrt(n * p * (1 - p)) if n else 0.0
        return {"z": round(z, 2), "giren": giren, "cikan": cikan, "oturum_giren": og, "oturum_cikan": oc,
                "olcu": olcu, "bant": abs(z) < GURULTU_Z}
    return None


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

    # SERP metrikleri iki kaynakta da AYNI jsonl'den hesaplanır; aynı günün iki değeri ayrışıyorsa
    # anlık satır o gün bayat girdiyle (ya da eski sınıflamayla) basılmıştır. Geri doldurma tam
    # dosya ve güncel sınıflamayla hesaplanmış olandır — "son" nokta da öyle hesaplanıyor. GEÇMİŞ
    # noktalarda seri geri doldurma değerini taşır, karnede o gün basılan değer `basilan`da kalır.
    # Son gün dokunulmaz (karnede basılan rakam odur).
    basilan = {m: {} for m in SERP_METRIK}
    for m in SERP_METRIK:
        if not seri[m]:
            continue
        son_gun = max(seri[m])
        for t, (v, k, _r) in list(seri[m].items()):
            g = geri_satir.get(t)
            gv = g.get(m) if g else None
            if t != son_gun and k == "anlik" and gv is not None and abs(gv - v) >= SERP_AYRISMA:
                basilan[m][t] = v
                seri[m][t] = (gv, "geri_doldurma", g)

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

    # seçici yeniden ölçüm: iki SERP metriği aynı pencereyi paylaşır, bir kez hesaplanır
    _serp_kayit = []
    _secici = {}

    def secici(onceki_t, son_t):
        if (onceki_t, son_t) not in _secici:
            if not _serp_kayit:
                _serp_kayit.extend(serp_kayitlari())
            _secici[(onceki_t, son_t)] = secici_yeniden_olcum(onceki_t, son_t, *_serp_kayit)
        return _secici[(onceki_t, son_t)]

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
        onceki_k = s[onceki_t][1] if onceki_t else None
        onceki_basilan = basilan.get(m, {}).get(onceki_t) if onceki_t else None
        fark = fark_yuzde = None
        if onceki_v is not None:
            fark = round(son_v - onceki_v, 2)
            fark_yuzde = round(100 * fark / onceki_v, 1) if onceki_v else None
        if fark is None or fark == 0:
            yon = "nötr"
        else:
            yon = "iyi" if (fark > 0) == (artis == "iyi") else "kötü"
        # Gürültü kuralı (temas metrikleri): fark gürültü bandındaysa ya da sınanamadıysa yön
        # hükmü verilmez (−3 tık gibi küçük sayıda sınanmamış kırmızı ok yanıltır)
        gurultu = temas_gurultu(m, son_t, onceki_t, geri_satir) if fark else None
        if m in TEMAS_HAFTA and fark and (gurultu is None or gurultu["bant"]):
            yon = "nötr"
        # 8 noktalı sparkline: son gün ve ondan önceki 7 gün, günlük kadans; boş gün null
        sp_t = [(son_d - datetime.timedelta(days=7 - i)).isoformat() for i in range(8)]
        sp = [s[t][0] if t in s else None for t in sp_t]
        kayit = {"ad": ad, "birim": birim, "artis": artis,
                 "son": son_v, "son_tarih": son_t, "son_kaynak": son_k,
                 "onceki": onceki_v, "onceki_tarih": onceki_t,
                 "onceki_kaynak": onceki_k, "onceki_karnede_basilan": onceki_basilan,
                 "fark": fark, "fark_yuzde": fark_yuzde, "yon": yon,
                 "sparkline": sp, "sparkline_tarihler": sp_t,
                 "nokta_sayisi": len(s)}
        notlar = []
        if gurultu:
            kayit["gurultu"] = gurultu
            notlar.append(("gürültü bandında" if gurultu["bant"] else "gürültü bandının dışında") +
                          f" (z={tr_sayi(gurultu['z'], 2)}; oturum düzeltmeli)")
        elif m in TEMAS_HAFTA and fark:
            notlar.append("gürültü sınaması yapılamadı (haftalık dilim yok ya da kıyas tam 7 gün değil); "
                          "yön basılmadı")
        if m in SERP_METRIK:
            kayit["sparkline_duzeltilen"] = [t for t in sp_t if t in basilan[m]]
        if onceki_basilan is not None:
            notlar.append(f"{onceki_t[8:10]}.{onceki_t[5:7]} karnesinde basılan değer {tr_sayi(onceki_basilan, 1)} idi "
                          f"(o gün girdi eksikti ya da sınıflama farklıydı); kıyas aynı ölçüm dosyasından yeniden "
                          f"hesaplanan {tr_sayi(onceki_v, 1)} ile yapıldı")
        if onceki_t is None:
            notlar.append("7 gün önceki değer ölçülmedi")
        elif son_k != onceki_k and (m.startswith("gsc_") or m.startswith("ga4_")
                                    or m in ("eryaman_tik_28", "phone_click_28", "whatsapp_click_28",
                                             "temas_oturum_28")):
            # yalnız GSC/GA4: SERP değerleri iki kaynakta da aynı jsonl'den gelir; ayrıştığı
            # geçmiş noktalar yukarıda geri doldurma değerine çevrildi (onceki_karnede_basilan)
            notlar.append("iki uç farklı kaynaktan (anlık JSON / geri doldurma); GSC son günleri sonradan "
                          "tamamlar, GA4 dünü yeniden işler — birkaç yüzde ayrışma veri olgunlaşmasıdır")
        rejim = False
        nedenler = []   # olcum_yontemi_degisti'nin nedeni: bolge_turu / kanal_etiketi / secici_yeniden_olcum / tanim_degisti
        if m in SERP_METRIK:
            # rejim payı: iki ucun ölçümleri ne kadar bölge turundan (27.08+) geliyor
            kayit["son_bolge_turu_pay"] = bolge_pay(son_t, son_r)
            kayit["onceki_bolge_turu_pay"] = bolge_pay(onceki_t, s[onceki_t][2]) if onceki_t else None
            if onceki_t and ((kayit["son_bolge_turu_pay"] or 0)
                             - (kayit["onceki_bolge_turu_pay"] or 0)) >= REJIM_NOT_ESIK:
                notlar.append("önceki nokta daha çok 27.08 öncesi turdan; o turun 'ilk 10 dışı' sonuçları "
                              "yeniden ölçümde büyük ölçüde geri döndü (bkz. pencere_notu.serp)")
            rejim = ayrisiyor(kayit["son_bolge_turu_pay"], kayit["onceki_bolge_turu_pay"])
            if rejim:
                nedenler.append("bolge_turu")
        if m in SECICI_METRIK and onceki_t:
            sec = secici(onceki_t, son_t)
            if sec:
                kayit["secici_yeniden_olcum"] = sec
                if sec["tek_yonlu"]:
                    rejim = True
                    nedenler.append("secici_yeniden_olcum")
                    notlar.append(sec["not"])
        if m in HEDEF_METRIK:
            kayit["son_etiketli_pay"] = etiketli_pay(son_t, son_r)
            kayit["onceki_etiketli_pay"] = etiketli_pay(onceki_t, s[onceki_t][2]) if onceki_t else None
            rejim = ayrisiyor(kayit["son_etiketli_pay"], kayit["onceki_etiketli_pay"])
            if rejim:
                nedenler.append("kanal_etiketi")
                notlar.append("önceki nokta kanal etiketi taşımayan (27.08 öncesi) ölçümlerden; hedef sorgular "
                              "bölümü aynı kıyasa 'kanal değişti' diyor — fark iyi/kötü diye okunmaz")
        # Tanım değişikliği (08.10). (a) Temas kartı tık yerine ziyareti saymaya başladı: kartın
        # ziyaret bastığı İLK gün işaretlenir (fark geri doldurulmuş ziyaret serisinden, aynı
        # tanımla hesaplanır; işaret bir gün önceki karnede basılı rakamın tık olduğunu söyler).
        # (b) damla_acik artık yalnız https'li açık satırları sayıyor: eski tanımlı noktayla kıyas.
        if m == "temas_oturum_28" and son_k == "anlik":
            ilk_anlik = min(t for t, v in s.items() if v[1] == "anlik")
            if son_t == ilk_anlik:
                rejim = True
                nedenler.append("tanim_degisti")
                kayit["tanim_notu"] = ("kart bugünden itibaren tık yerine temas eden ziyareti sayıyor (önceki "
                                       "karnelerde basılı rakam tıktı); fark ziyaret serisinden, aynı tanımla")
                notlar.append(kayit["tanim_notu"])
        if m == "damla_acik" and onceki_t and son_r.get("damla_tanim") != s[onceki_t][2].get("damla_tanim"):
            rejim = True
            nedenler.append("tanim_degisti")
            kayit["tanim_notu"] = ("açık kayıt sayımı değişti: yalnız adresi yazılı açık satırlar sayılıyor; "
                                   "önceki nokta kapanmış eski listeleri de sayıyordu")
            notlar.append(kayit["tanim_notu"])
        # Rejim ayrışınca yön hükmü verilmez: karne ve yönetici özeti bu alanı okur.
        kayit["olcum_yontemi_degisti"] = bool(rejim)
        kayit["rejim_nedeni"] = nedenler
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
                    "noktalar aynı ölçüm rejiminde değildir. İlk 3 ve doğru sayfa payında fark, pencerede yeniden "
                    "ölçülen sorgular kuyruğun geneline benziyorsa okunur; yalnız sorunlu (ya da yalnız doğru) "
                    "çıkanlar yeniden ölçüldüyse fark tek yönlüdür ve yön basılmaz (metrikteki "
                    "secici_yeniden_olcum alanı). Geçmiş bir günün karnede basılan değeri aynı günün ölçüm "
                    "dosyasından yeniden hesaplanan değerden ayrışıyorsa (o gün girdi eksikti ya da sınıflama "
                    "farklıydı) kıyas ve sparkline yeniden hesaplanan değeri kullanır; basılan değer "
                    "onceki_karnede_basilan alanında durur.",
            "hedef": "17 hedef sorgu; geri doldurmada yalnız sıra (kutu bilgisi geriye dönük güvenilir değil); "
                     "kanal karışık (hedef_kanal), 27.08 öncesi kayıtlar etiketsiz",
            "temas": "temas eden ziyaret = 28 günde telefon ya da WhatsApp düğmesine basan ziyaret (yalnız canlı alan "
                     "adı; form gönderimi ayrı). Sabit haftalık ızgarada ve kıyas günlerinde geri doldurulur, ara "
                     "günler boş kalır. 27.08 "
                     "öncesini içeren pencereler siteden kaldırılan Yenimahalle sayfalarının temaslarını da taşır, "
                     "02.09 öncesinde telefon bağlarının bir kısmı izlenmiyordu: eski seviyeler hedef değildir. "
                     "Temas farkı gürültü kuralından geçer (yön yalnız |z| ≥ 2 ise basılır; sınama "
                     "yapılamıyorsa yön basılmaz).",
        },
        "metrikler": metrikler,
    }


def main():
    eski = gecmisi_oku()
    yeni = [anlik_satir()]
    if not YALNIZ_ANLIK:
        yeni += geri_doldur(eski)
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
