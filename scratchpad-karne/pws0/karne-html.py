# -*- coding: utf-8 -*-
"""Bulunabilirlik Karnesi — HTML üretici.

Veriden okur, elle rakam girilmez. Her rakam ya bir ölçüm dosyasından ya da bir
ÜRETİCİ betiğin yazdığı JSON'dan gelir; üreticiler tek seferlik değildir, her
turda karneden ÖNCE yeniden koşar. Eksik JSON'da karne o bölümü boş bırakır,
uydurmaz.

Doğrudan okunan ölçüm dosyaları (bu klasör):
  sonuclar-site-emlakci.jsonl  (site-emlakçı turu; s bazında SON ölçüm geçerli)
  sonuclar-emlakci.jsonl       (hedef sorgular; q bazında SON ölçüm)
  tur-*.json                   (mahalle kuyrukları — hangi s hangi mahallede)
  kuyruk-site-emlakci.json, dizin-analiz-2708.json (554 sayfalık dizin envanteri),
  isgal-3108.json, kaldirac-defteri.json, DIZINE-EKLENECEKLER.md,
  gsc-dizin-kuyrugu-194.md, DIZIN-DAMLASI-31-08.md,
  karne-gecmis.jsonl (yalnız hangi günün "anlik" satırı var — sparkline nokta rengi)

Üretici sırası — hepsi bu klasörden koşar. KARNE_SCRATCH = oturum scratchpad'i
(içinde gsc-q.mjs durur; GSC/GA4 ham çekimleri oraya TSV/JSON olarak bırakılır):

  export KARNE_SCRATCH=/…/scratchpad
  node ../../scripts/gsc-api.mjs sorgular 28 > $KARNE_SCRATCH/sorgular28.tsv
  node ../../scripts/gsc-api.mjs sayfalar 28 > $KARNE_SCRATCH/sayfalar28.tsv
  node ../../scripts/ga4-api.mjs ozet 28     > $KARNE_SCRATCH/ga4-ozet28.json
  node ../../scripts/ga4-api.mjs aile 28     > $KARNE_SCRATCH/ga4-aile28.json
  node ../../scripts/ga4-api.mjs olaylar 28  > $KARNE_SCRATCH/ga4-olaylar28.tsv
  python3 sonuc-ozeti-uret.py     → sonuc-ozeti.json       (gsc-api'yi kendisi çağırır)
  python3 dogru-sayfa.py          → dogru-sayfa.json
  python3 sayfa-turu-verimi.py    → sayfa-turu-verimi.json (sayfalar28.tsv)
  python3 ada-beklenti-uret.py    → ada-beklenti.json + ada-beklenti-gecmis.jsonl
                                    (gsc-q.mjs ile sayfa-sorgu28.tsv / sayfa-toplam28.tsv çeker;
                                     --yerel: çekmez, mevcut TSV'leri okur)
  python3 sorgu-sinifi-to.py      → sorgu-sinifi-to.json   (sorgular28.tsv; sayfa-sorgu28.tsv
                                    varsa onu da okur → ada-beklenti'den SONRA koş)
  python3 tik-sonrasi-uret.py     → tik-sonrasi.json       (ga4-ozet28 / ga4-aile28 / ga4-olaylar28)
  python3 veri-sagligi.py         → veri-sagligi.json      (ölçüm dosyaları + content/siteler)
  python3 gorunmez-teshis-uret.py → gorunmez-teshis.json   (gorunmez-denetim.tsv: gsc-api
                                    denetle-dosya çıktısı, KOTA YAKAR — gsc-dizin becerisi; + sayfalar28.tsv)
  python3 dizin-adaylari-uret.py  → dizin-adaylari.json + sira-sorunlulari.json
                                    (gorunmez-teshis.json'u okur → ondan SONRA koş)
  python3 hedef-sorgular-uret.py  → hedef-sorgular.json    (jsonl'ler + isgal-*.json)
  python3 eryaman-emlakci-uret.py → eryaman-emlakci.json   (GSC API'yi kendisi çağırır; ham
                                    çekimi KARNE_SCRATCH'e yazar, API düşerse oradan okur)
  python3 cihaz-uret.py           → cihaz.json             (gsc-q.mjs, mülk düzeyi device)
  --- bütün üreticilerden SONRA (JSON'larını okurlar), karne-html.py'den ÖNCE ---
  python3 anlik-goruntu-uret.py   → karne-gecmis.jsonl + karne-gecmis-ozet.json
                                    (günlük zaman serisi; gsc-q.mjs/ga4-q.mjs ile geri doldurma;
                                     --yerel API'ye gitmez, --yalniz-anlik geri doldurmaz.
                                     karne-gecmis-ozet.json'un TEK sahibi bu betik.)
  python3 yonetici-ozeti-uret.py  → yonetici-ozeti.json    (tepe 6 rakam + yapılan/beklenen;
                                    7 günlük farkı karne-gecmis-ozet.json'dan OKUR → anlıktan sonra)
  python3 is-takvimi-uret.py      → is-takvimi.json        (tarihli iş listesi: damla kuyruğu,
                                    hedef-sorgular, kaldıraç defteri, git log)
  python3 karne-html.py           → bulunabilirlik-karnesi.html (KARNE_SCRATCH gerekmez)

Pencere (02.09): scripts/gsc-api.mjs sorgular/sayfalar TSV'nin ilk satırına
"# pencere<TAB>bas<TAB>bit<TAB>gün" yazar; her GSC üreticisi JSON'una
pencere{bas,bit,gun} girer (pencere.py). Karne her GSC/GA4 bölümünün notuna
"pencere: bas–bit, N veri günü" satırını O BÖLÜMÜN JSON'undan basar; başka
bölümden ödünç almaz (üç üretici üç ayrı pencerede çıkmıştı, karne hepsine
"son 28 gün" diyordu). Alan yoksa "ölçülmedi".

Çıktı: bulunabilirlik-karnesi.html  →  Artifact olarak aynı adrese yayınlanır.
Yayın öncesi denetim: "{…}" kalıntısı, etiket dengesi, Türkçe ek, İngiliz sayı biçimi.
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
    # kuyruktaki SİTE sorgusu sayısı (mahalle sorgusu ve etap kayıtları hariç) —
    # "mahalle TAMAM" ölçütü: bunların hepsi en az bir kez ölçülmüş mü
    site_kuyruk = [s for s in gs if "/" in s and "/etaplar/" not in s]
    return dict(site=site, mahq=mahq[0] if mahq else None,
                n=len(site), i3=len(ilk3), o=len(orta), y=len(yok), bir=bir,
                olculen=len(g), kuyruk=len(gs), site_kuyruk=len(site_kuyruk),
                s_listesi=[r["s"] for r in site])

OLCULEN = {k: mah_stats(f) for k, ad, f in TURLAR}
# 01.09: başlık kartındaki "11/11 mahalle TAMAM" elle yazılıydı; bir tur düşse
# sessizce yanlışa düşerdi. TAMAM = turun kuyruğundaki her site sorgusu ölçülmüş.
MAH_TAMAM = sum(1 for v in OLCULEN.values() if v["n"] == v["site_kuyruk"])
MAH_TOPLAM = len(TURLAR)
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
# Bayat yığınlar: mahalle başına bayat sayfa sayısı + gösterim talebi toplamı,
# talebe göre büyükten küçüğe ('_statik' mahalle değil, dışarıda). Bayat elemanı
# [yol, tarama_tarihi, gösterim, durum].
_BAYAT_SIRA = sorted(
    ((k, len(v["bayat"]), sum(x[2] for x in v["bayat"]))
     for k, v in DA.items() if k != "_statik" and isinstance(v, dict) and "bayat" in v),
    key=lambda x: x[2], reverse=True)

# kuyruktan bekleyen istekler
dk = open("DIZINE-EKLENECEKLER.md").read()
try:
    dk2 = open("gsc-dizin-kuyrugu-194.md").read()
except FileNotFoundError:
    dk2 = ""
# yalnız son dalganın istekleri "tarama bekliyor" sayılır (10 günden eski işaretler
# ya çoktan tarandı ya da düştü — 194'lük tarihi defterin tamamını sayma)
_bugun = datetime.date.today()
_ISTEK_PENCERE = 10  # gün; hem sayımda hem karne metninde aynı eşik
_istekli = set()
for metin in (dk, dk2):
    for m in re.finditer(r"(https://www\.siringayrimenkul\.com/\S+?)\s.*?←\s*(\d\d)\.(\d\d) istek gönderildi", metin):
        t = datetime.date(_bugun.year, int(m.group(3)), int(m.group(2)))
        if 0 <= (_bugun - t).days <= _ISTEK_PENCERE:
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

# --- 02.09: üç yeni üretici -------------------------------------------------
# yonetici-ozeti.json  → tepe 6 rakam + bu hafta yapılan/beklenen (yonetici-ozeti-uret.py)
# karne-gecmis-ozet.json → metrik başına 8 günlük seri + 7 günlük fark (anlik-goruntu-uret.py)
# is-takvimi.json      → tarihli iş listesi (is-takvimi-uret.py); "Yarın ne yapılacak"ın yerini aldı
try:
    _YO = json.load(open("yonetici-ozeti.json"))
except Exception:
    _YO = None
try:
    _GO = json.load(open("karne-gecmis-ozet.json"))
    if not isinstance(_GO.get("metrikler"), dict):
        _GO = None  # eski şema ({"kayitlar":…}, 02.09 öncesi yonetici-ozeti çıktısı) — seri değil
except Exception:
    _GO = None
try:
    _IT = json.load(open("is-takvimi.json"))
except Exception:
    _IT = None
# Sparkline nokta rengi: o gün karnede BASILMIŞ değer ("anlik" satırı) koyu, ham
# veriden sonradan hesaplanan ("geri_doldurma") açık. Özet JSON nokta başına
# kaynağı taşımıyor; jsonl'deki kaynak alanından okunur. Rakam okunmaz, yalnız gün.
try:
    _ANLIK_GUNLER = {r["tarih"] for r in (json.loads(l) for l in open("karne-gecmis.jsonl") if l.strip())
                     if r.get("kaynak") == "anlik"}
except Exception:
    _ANLIK_GUNLER = set()
try:
    _SON_ANLIK = max((json.loads(l) for l in open("karne-gecmis.jsonl") if l.strip() and '"anlik"' in l),
                     key=lambda r: r["tarih"], default=None)
except Exception:
    _SON_ANLIK = None
# Title/H1 donmasının bitiş günü: eryaman-emlakci.json title_donuk (elle tarih yazılmaz)
try:
    _TITLE_DONUK = json.load(open("eryaman-emlakci.json")).get("title_donuk")
except Exception:
    _TITLE_DONUK = None

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

def pencere_satir(p, etiket="", birim="veri günü"):
    """Her GSC/GA4 bölümünün notuna tek biçimli satır: "pencere: 03.08–30.08, 28 veri günü".

    02.09 denetimi: üç üretici üç ayrı pencerede çıkmış (sorgular28 02.08–30.08,
    sayfalar28 01.08–28.08, sayfa-toplam28 03.08–30.08), karne hepsine "son 28 gün"
    demişti. Artık her JSON kendi pencere{bas,bit,gun} alanını taşır ve karne ONU
    basar; başka bölümden ödünç alınmaz. Alan yoksa "ölçülmedi" — 28 varsayılmaz.
    """
    if not p or not p.get("bas") or not p.get("bit"):
        return f'<span class="pencere">pencere{etiket}: ölçülmedi</span>'
    return (f'<span class="pencere">pencere{etiket}: {tr_tarih(p["bas"])}–{tr_tarih(p["bit"])}, '
            f'{p["gun"]} {birim}</span>')

def _ondalik(*degerler):
    """Basılacak ondalık basamak: değerin kendisinde kaç basamak varsa o (en çok 2).
    Zaman serisi karışık büyüklükte (TO 2,35 · tık 2.471 · pay 68,7); tek sabit
    ya keser ya boş sıfır ekler."""
    en = 0
    for v in degerler:
        if isinstance(v, float) and not v.is_integer():
            kesir = f"{v:.2f}".rstrip("0").split(".")
            en = max(en, len(kesir[1]) if len(kesir) > 1 else 0)
    return min(en, 2)

# küratörlü mahalle bulguları (tur karnesinden)
# 31.08 — BU SÖZLÜKTEKİ RAKAMLAR SİLİNDİ. Denetimde 10'u tabloyla çelişik
# çıktı (tunahan "organik 9" → 10; seker "kutuda 3" → kutuda yok; devlet
# "12 sorguda görünmez" → 9; seyh-samil "9 sorguda mahalle sayfamız" → 13 …)
# ve iki mahalle birden "en güçlü" ilan edilmişti. Sayılar aynı satırda tablo
# tarafından CANLI basılıyor; metinde ikinci kez yazılmaları yalnız çelişki
# üretiyordu. Burada artık sadece ölçüyle değişmeyen YORUM durur — hangi
# mahallede hangi yapısal sorun var. Sayı gerekiyorsa f-string ile basılır.
BULGULAR = {
    "seyh-samil": "Mahalle sayfası kanibalizasyonunun merkezi: site adı aranınca sık sık mahalle sayfamız çıkıyor. Yapısal adaş yoğunluğu da en yüksek burada (Umut 19 Emlak, Onur Emlak, Nisan Emlak, Turkuaz Mahallesi).",
    "yavuz-selim": "Ada sayfası kanibalizasyonunun ikinci merkezi (Erkaraca, Genç Avrasya, Keyfim, Utku, Uyum 90, Yunuskent, Yükselen, Karköy Villaları). Mahalle sorgusunda hem organikte hem harita kutusunda varız.",
    "sehit-osman-avci": "Büyük bir bayat yığını var; görünmeyenlerin çoğu güçlü adaş taşıyor (İçtaş Holding, Soyak GYO, Çamlık/Çiçek ofisleri). Mahalle sorgusunda organikte en iyi sıramız burada ama harita kutusunda yokuz.",
    "seker": "Küçük ama derli toplu mahalle; en büyük kayıp Zirve Loft ve İzoser (ikisi de adaşsız görünmez). Mahalle sorgusunda ne organikte ne kutudayız — kutu çıkıyor ama içinde rakipler var.",
    "yesilova": "Site sorgularında en yüksek ilk-3 oranı. Zayıflığı eski slug kalıntıları (may-tower, green-place, koçaklar). Mahalle sorgusunda harita kutusu HİÇ çıkmıyor, o yüzden yorum emeği burada karşılık bulmaz.",
    "tunahan": "Dizinsiz sayfası olmayan tek mahalle ve sayfalarının çoğu taze taranmış. Mahalle sorgusunda organikte sondayız ama harita kutusundayız.",
    "altay": "Site sorgularında güçlü; mahalle sorgusunda organikte yokuz, bizi harita kutusu taşıyor.",
    "devlet": "Görünmeyenlerin çoğu adaşsız (Mavi Köy, Sedirkent, Selçuklu) — yani sorun rekabet değil dizin/tarama. Mahalle sorgusunda organikte yokuz, kutu taşıyor.",
    "eryaman": "Organikte en dengeli mahalle; mahalle sorgusunda sırayı ana sayfa karşılıyor (bilinen yamyamlık).",
    "goksu": "En zayıf karne, en büyük bayat yığın ve ada kanibalizasyonunun merkezi. Mahalle sorgusunda ne organikte ne kutuda varız.",
    "guzelkent": "En büyük dizinsiz yığın burada; site adı aranınca sık sık ada ya da komşu site sayfamız çıkıyor. Eski adres kalıntısı da en çok bu mahallede. Mahalle sorgusunda çift kayıp.",
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
# 31.08: her sınıf bağımsız round() ediliyordu ve yüzdeler %101'e topluyordu
# (26+59+8+7+1). En büyük artık yöntemi: taban paylar aşağı yuvarlanır, artan
# puan en büyük ondalık artığı olanlara verilir — toplam her zaman 100.
def _yuzde_dagit(sayilar, toplam):
    if not toplam:
        return {k: 0 for k in sayilar}
    ham = {k: 100 * v / toplam for k, v in sayilar.items()}
    pay = {k: int(v) for k, v in ham.items()}
    kalan = 100 - sum(pay.values())
    for k in sorted(ham, key=lambda x: -(ham[x] - int(ham[x])))[:max(0, kalan)]:
        pay[k] += 1
    return pay

_RAKIP_PAY = _yuzde_dagit({k: RAKIP_SINIF.get(k, 0)
                           for k in ("biz", "portal", "dizin", "yerel", "sosyal")},
                          RAKIP_TOPLAM)
birinci_html = ""
for k in ("biz", "portal", "dizin", "yerel", "sosyal"):
    n = RAKIP_SINIF.get(k, 0)
    if not n:
        continue
    p = _RAKIP_PAY.get(k, 0)
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
donem_notu = "son dönem, bir önceki dönemle karşılaştırmalı"
# GSC penceresi, cümle içi kullanım ("… son 28 günde …"); SONUC yoksa rakamsız.
# 02.09: sonuc-ozeti.json artık pencere{bas,bit,gun} taşıyor (eski ad donem aynı değer).
_SONUC_P = (SONUC.get("pencere") or SONUC.get("donem")) if SONUC else None
DONEM_GUNDE = f"son {_SONUC_P['gun']} günde" if _SONUC_P else "son dönemde"
sonuc_pencere = ""
if SONUC:
    _op = SONUC.get("onceki_pencere")
    sonuc_pencere = pencere_satir(_SONUC_P)
    if _op:
        sonuc_pencere += (f' <span class="pencere">önceki pencere: {tr_tarih(_op["bas"])}–{tr_tarih(_op["bit"])}, '
                          f'{_op["gun"]} veri günü</span>')
    if SONUC.get("son_veri_gunu"):
        sonuc_pencere += f' <span class="alt">Search Console son veri günü {tr_tarih(SONUC["son_veri_gunu"])}.</span>'
if SONUC:
    sm, on = SONUC["simdi"], SONUC["onceki"]
    _gun = _SONUC_P["gun"]  # sonuc-ozeti.json → pencere.gun
    donem_notu = f"son {_gun} gün, bir önceki {_gun} günle karşılaştırmalı"
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
                      f'ölçüyor, yani “önceki {_gun} gün” dönemi sitenin daha yeni tanındığı ilk aya '
                      f'denk geliyor. Rozet büyümeyi olduğundan büyük gösterir.</p>')
    # Pay GÜNCEL dönemden: Yenimahalle tıkı / toplam tık (31.08 ölçümü 873/2.531 = %34,5).
    # İlk yazımda "önceki dönem" alanları alınmış ve %51 basılmıştı — yanlış payda.
    _ym_simdi = (y.get("simdi") or {}).get("tik", 0); _top_simdi = (sm or {}).get("tik", 0) or 1
    ym_pay = f"%{round(_ym_simdi * 100 / _top_simdi)}" if _ym_simdi else "bir kısmı"
    try:
        _tv_y = next(r for r in json.load(open("sayfa-turu-verimi.json"))["satirlar"] if r["tur"] == "blog")
        yazi_gos, yazi_tik = tr_sayi(_tv_y["gos"]), tr_sayi(_tv_y["tik"])
    except Exception:
        yazi_gos, yazi_tik = "—", "—"
    sonuc_html = f'''<div class="kartlar">
    <div class="kart"><div class="buyuk">{tr_sayi(sm["tik"])}</div><div class="etiket">tıklama · {_gun} gün {_yuzde_rozet(sm["tik"], on["tik"])}</div></div>
    <div class="kart"><div class="buyuk">{tr_sayi(sm["gos"])}</div><div class="etiket">gösterim {_yuzde_rozet(sm["gos"], on["gos"])}</div></div>
    <div class="kart"><div class="buyuk">%{tr_sayi(sm["to"], 2)}</div><div class="etiket">tıklanma oranı (önce %{tr_sayi(on["to"], 2)})</div></div>
    <div class="kart"><div class="buyuk">{tr_sayi(sm["poz"], 1)}</div><div class="etiket">ortalama pozisyon (önce {tr_sayi(on["poz"], 1)})</div></div>
  </div>
  {kart_uyari}
  <div class="pano" style="margin-top:14px">
    <h3>Önümüzdeki haftalarda BEKLENEN düşüşler — panik yok</h3>
    <p class="alt" style="margin:8px 0 0">Üç düşüş bilinçli kararların sonucu ve karnede ayrı sayılıyor;
    Search Console′un toplam çizgisi bunlarla inecek. (1) <strong>Yenimahalle</strong>: 27.08′de siteden
    kaldırıldı, önceki dönemde tıkın {ym_pay} kadarı oradan geliyordu; sayfalar 410 döndükçe sıfırlanır.
    (2) <strong>Yazılar</strong>: 24 genel yazı 07.08′de kapatıldı; son {_gun} günde yazı ailesi
    {yazi_gos} gösterim / {yazi_tik} tık taşıyordu, o da eriyecek. (3) Eryaman dışı “nereye bağlı”
    sorguları için mahalle sayfalarındaki bilgi kutusu 17.08′de söküldü. Karnenin
    <strong>Eryaman satırı</strong> bu üçünden etkilenmez — ölçüt o.</p>
  </div>
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
      <p class="alt" style="margin:10px 0 0">Son {_gun} gündeki tıklamanın <strong>%{round(100*y["simdi"]["tik"]/sm["tik"])} kadarı</strong>
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
                  f'<strong>{_top} tanesi bize ait (%{round(100*_top/_n)})</strong> · '
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
    f"{len(GIRENLER)} tanesi ilk 10′a girdi, {len(CIKANLAR)} tanesi çıktı; ilk 10 içinde "
    f"{len(IC_YUKSELEN)} tanesi yükseldi, {len(IC_DUSEN)} tanesi düştü, {len(IC_GURULTU)} tanesi ±1 "
    f"sınırında kaldı (gürültü), {_sabit_ic} tanesi hiç kıpırdamadı. "
    f"Ayrıca <strong>{_kiy} ölçüm kıyaslama dışı</strong> bırakıldı: "
    f"{KIYASLANMADI['sorgu']} tanesinde sorgu metni turlar arasında değişmiş, "
    f"{KIYASLANMADI['kanal']} tanesinde ölçüm başka bir pencereden yapılmış — "
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
#
# İKİNCİ DÜZELTME (aynı gün, denetim turu buldu): ilk sürüm son.values()
# üzerinden sayıyordu, yani ölçüm TARİHÇESİNİN tamamı — içinde 27.08'de
# siteden kaldırılan Yenimahalle sayfaları da vardı (9 ada + 3 mahalle) ve
# Eryaman anlatısının içinde duruyorlardı. Ayrıca "u" alanı cite: kırıntısı
# olan kayıtlar hiçbir süzgece takılmıyordu. İkisi de düzeltildi: evren
# güncel kuyruk (504), cite: kayıtları da sınıflanıyor.
_KUYRUK_S = {r["s"] for r in json.load(open("kuyruk-site-emlakci.json"))}
_evren = [r for r in son.values() if r["s"] in _KUYRUK_S]

def _u_ada(u):
    return "/adalar/" in u or "› adalar" in u

def _u_mahalle(u):
    if _re.fullmatch(r"/mahalleler/[^/]+/?", u):
        return True
    # cite: kırıntısı — "siringayrimenkul.com › mahalleler › goksu-mahallesi".
    # DİKKAT: kesik kayıtlar da üç parçalı görünür ("… › mahalleler › elit-y...")
    # ama aslında SİTE sayfasını gösterirler; kesikse sayılmaz. Ayrıca son
    # parça gerçekten bir mahalle adı olmalı.
    if u.startswith("cite:") and "› adalar" not in u:
        if u.rstrip().endswith("...") or "…" in u:
            return False
        _p = [x.strip() for x in u.split("›")]
        return (len(_p) == 3 and _p[1].lower().startswith("mahalleler")
                and _p[2].lower().replace(" ", "-") in MAH_AD)
    return False

_ada_v = [r for r in _evren if _u_ada(r.get("u") or "")]
_mah_v = [r for r in _evren if _u_mahalle(r.get("u") or "")]
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

# --- ZAYIF HALKALAR: elle yazılıydı, dört iddiası da tabloyla çelişiyordu ----
# 31.08 denetimi: "5 mahallede ilk 10'a giremiyoruz" gerçekte 6 (Göksu eksikti,
# 28.08'de 7.'ydi, 31.08'de düştü); "bu sorgularda bizi harita kutusu taşıyor"
# 6'nın yalnız 2'sinde doğru; "üç mahallede kutu da yok" gerçekte 6.
# Bu blok GBP yorum kampanyasında hangi mahallenin adının geçeceğini
# belirliyor — yanlış olması doğrudan iş kaybı, o yüzden artık veriden üretilir.
_mq = {k: (v.get("mahq") or {}) for k, v in OLCULEN.items()}
_ORG_YOK = sorted(k for k, m in _mq.items() if not m.get("sira"))
_KUTU_YOK = sorted(k for k, m in _mq.items() if not m.get("h"))
_CIFT_KAYIP = sorted(set(_ORG_YOK) & set(_KUTU_YOK))
# Kutu HİÇ çıkmayan sorgu (hl boş) ile kutu var ama biz içinde değiliz farkı
# kritik: birincisinde yorum emeği karşılık bulmaz, kutu zaten render edilmiyor.
_KUTU_HIC = sorted(k for k in _CIFT_KAYIP if not (_mq[k].get("hl") or []))
_KUTU_RAKIP = [k for k in _CIFT_KAYIP if k not in _KUTU_HIC]
# OLCULEN kısa anahtar ("goksu"), MAH_AD uzun anahtar ("goksu-mahallesi") kullanıyor;
# doğrudan arama slug basıyordu.
_ADI = lambda k: MAH_AD.get(f"{k}-mahallesi", MAH_AD.get(k, k))
_ad = lambda ks: ", ".join(_ADI(k) for k in ks)
_ORG_VAR = sorted((k for k, m in _mq.items() if m.get("sira")), key=lambda k: _mq[k]["sira"])
# ESKİ ADRES KALINTILARI — "20'den fazla" elle yazılıydı, gerçekte iki katı.
# İki sınıf ayrılır: sayfanın KENDİ taşınma öncesi adresi (301 sindirme işi
# bunları çözer) ve başka bir sayfamızın kısa adresi (onlara 301 bir şey
# kazandırmaz). Karışık sayılırsa işin boyutu yanlış tahmin edilir.
_eski_kendi, _eski_baska = [], []
for r in _evren:
    u = r.get("u") or ""
    m = _re.match(r"/mahalleler/([^/]+)/(.+)$", u)
    if not m or m.group(1).endswith("-mahallesi"):
        continue
    (_eski_kendi if m.group(2).rstrip("/") == r["s"].split("/")[1] else _eski_baska).append(r)
_eski_mah = _C(r["s"].split("/")[0] for r in _eski_kendi)
_eski_ilk = ", ".join(f"{_ADI(k.replace('-mahallesi',''))} {v}" for k, v in _eski_mah.most_common(3))

_eniyi = ", ".join(
    f"{_ADI(k)} ({_mq[k]['sira']}." + (" + harita kutusu" if _mq[k].get("h") else "") + ")"
    for k in _ORG_VAR[:2])

siradaki_html = "".join(
    f'<li><span><strong>{esc(a["site"])}</strong> '
    f'<span class="alt">{esc(MAH_AD.get(a["mah"], a["mah"]))}</span></span>'
    f'<span class="chip {a["renk"]}">{esc(a["tur"])}</span></li>'
    for a in KUYRUK_OLU[:5]) or '<li class="alt">Kuyruk boş</li>'

# Bayat yığınlar cümlesi: ilk ikisi DA'dan; "damla sırasının başında" ibaresi
# yalnız ikisi de KUYRUK_OLU'nun ilk 5'inde mahalle olarak geçiyorsa basılır.
_bayat_ilk2 = " ve ".join(
    f"{MAH_AD.get(k, k)} ({n} sayfa · {tr_sayi(g)} gösterim talebi)" if i == 0
    else f"{MAH_AD.get(k, k)} ({n} · {tr_sayi(g)})"
    for i, (k, n, g) in enumerate(_BAYAT_SIRA[:2]))
_damla_mah = {a["mah"] for a in KUYRUK_OLU[:5]}
_bayat_damla = ("; ikisi de damla sırasının başında"
                if all(k in _damla_mah for k, _, _ in _BAYAT_SIRA[:2]) else "")

ana_org = ANA["sira"] if ANA else "?"
ana_har = ANA.get("h", "?") if ANA else "?"
ana_d = tr_tarih(ANA["d"]) if ANA else ""

# günlük dizin isteği kotası (betik parametresi, ölçüm değil). Adı bilerek
# _gun değil: _gun yukarıda GSC dönemi (pencere.gun) — ikisi karışınca
# "28/gün ile biter" gibi sessiz bir yanlış çıkar. 02.09: is-takvimi.json da
# aynı kotayla damla günlerini kuruyor; takvim varsa sayı ORADAN okunur ki iki
# yerde ayrışmasın. ("Yarın ne yapılacak" listesi is-takvimi'ne taşındı — EYLEM
# bloğu kaldırıldı; damla kuyruğu takvimin damla günlerinde adres adres duruyor.)
_kota_gun = ((_IT or {}).get("damla") or {}).get("kota_gun") or 10

# --- tıktan sonra (02.09, GA4 Data API) ------------------------------------
# Karne sıra + GSC tık/TO gösteriyordu; gelenin sayfada ne yaptığı yoktu.
# GA4 API 02.09'da açıldı. Ev sahibi için asıl sonuç TEMAS (telefon/WhatsApp/
# form); karne artık onu sayıyor. Üretici: tik-sonrasi-uret.py
try:
    _TS = json.load(open("tik-sonrasi.json"))
except Exception:
    _TS = None
if _TS:
    _o = _TS["ozet"]; _t = _TS["temas"]; _t100 = _TS["temas_100"]
    _ts_satir = ""
    for a in _TS["aileler"]:
        _ts_satir += (f'<tr><td><strong>{esc(a["ad"])}</strong></td><td class="num">{tr_sayi(a["oturum"])}</td>'
                      f'<td class="num">{tr_sayi(a["goruntuleme"])}</td><td class="num">{a["ort_sure_sn"]} sn</td>'
                      f'<td class="num">%{tr_sayi(a["hemen_cikma"], 1)}</td></tr>')
    _temas_toplam = _t["phone_click"] + _t["whatsapp_click"] + _t["contact_form_submit"]
    tiksonrasi_html = f"""
  <h2>Tıktan sonra — gelen ne yapıyor</h2>
  <p class="not">Search Console tıkı sayar; Analytics tıktan sonrasını. Ev sahibi için asıl
  sonuç <strong>temas</strong>: telefon, WhatsApp ya da form. Son {_TS['gun']} gün.
  {pencere_satir(_TS.get('pencere'), ' (Analytics, dün dahil)', 'gün')}
  <span class="alt">Analytics penceresi Search Console′unkiyle bilerek aynı değil: Analytics dünü verir,
  Search Console 2-3 gün geriden gelir.</span></p>
  <div class="kartlar">
    <div class="kart"><div class="buyuk">{tr_sayi(_o['oturum'])}</div><div class="etiket">oturum · {tr_sayi(_o['kullanici'])} kullanıcı</div></div>
    <div class="kart"><div class="buyuk">{_o['ort_sure_sn']} sn</div><div class="etiket">ortalama oturum süresi</div></div>
    <div class="kart"><div class="buyuk">%{tr_sayi(_o['hemen_cikma'], 1)}</div><div class="etiket">hemen çıkma (10 sn altı, tek sayfa)</div></div>
    <div class="kart"><div class="buyuk">{_temas_toplam}</div><div class="etiket">temas: {_t['phone_click']} telefon · {_t['whatsapp_click']} WhatsApp · {_t['contact_form_submit']} form</div></div>
  </div>
  <div class="iki" style="margin-top:16px">
    <div class="pano">
      <h3>Sayfa ailesine göre</h3>
      <div class="tablo-kabuk"><table>
        <thead><tr><th>Aile</th><th class="num">Oturum</th><th class="num">Görüntüleme</th><th class="num">Süre</th><th class="num">Hemen çıkma</th></tr></thead>
        <tbody>{_ts_satir}</tbody>
      </table></div>
    </div>
    <div class="pano">
      <h3>100 oturumda kaç temas</h3>
      <ul>
        <li><span>Telefon tıklaması</span><span class="chip {'iyi' if _t100['phone_click'] >= 1 else 'kotu'}">{tr_sayi(_t100['phone_click'], 2)}</span></li>
        <li><span>WhatsApp</span><span class="chip">{tr_sayi(_t100['whatsapp_click'], 2)}</span></li>
        <li><span>Form başlatma</span><span class="chip">{tr_sayi(_t100['form_start'], 2)}</span></li>
        <li><span>Site sayfasından sahibinden mağazasına geçiş</span><span class="chip orta">{tr_sayi(_t100['site_ust_sahibinden'], 2)}</span></li>
      </ul>
      <p class="alt" style="margin:10px 0 0">Sahibinden geçişi ({_t['site_ust_sahibinden']}) telefon tıklamasından
      ({_t['phone_click']}) fazla: site sayfasına gelen, aramak yerine ilanlara gidiyor. Bu bir gözlem,
      henüz karar değil — {_TS['gun']} gün daha izlenecek.</p>
    </div>
  </div>
  <p class="alt" style="margin-top:10px"><strong>İki ölçüm uyarısı.</strong> (1) Analytics kodu sayfa hızı
  için boşta (≤3 sn) yüklenir; 3 saniyeden kısa ziyaretler hiç sayılmaz, süreler birkaç saniye
  eksik okunur. (2) 26 telefon bağının 10′u PR #88′e kadar izlenmiyordu — telefon sayısı bir
  <strong>taban</strong>, gerçek sayı daha yüksek. PR yayına girince kıyas tabanı sıfırlanır.</p>
"""
else:
    tiksonrasi_html = ""

# --- sorgu sınıfına göre TO (01.09) ----------------------------------------
# Özgün'ün gönderdiği GSC raporu "TO %2" diyor. Tek rakam hangi sınıfın gösterim
# alıp tık ALMADIĞINI gizler. Yalın site adı sorguları en büyük havuz ve en
# düşük TO — burada bir puanlık iyileşme toplam tıkı en çok oynatır.
try:
    _ST = json.load(open("sorgu-sinifi-to.json"))
except Exception:
    _ST = None
if _ST:
    _en = max((x["to"] for x in _ST["siniflar"]), default=1) or 1
    _st_satir = ""
    for x in _ST["siniflar"]:
        _pay = max(2, round(100 * x["to"] / _en))
        _st_satir += (f'<tr><td><strong>{esc(x["ad"])}</strong></td><td class="num">{x["sorgu"]}</td>'
                      f'<td class="num">{tr_sayi(x["gos"])}</td><td class="num">{tr_sayi(x["tik"])}</td>'
                      f'<td class="num">%{tr_sayi(x["to"], 1)}</td><td class="num">{tr_sayi(x["poz"], 1)}</td>'
                      f'<td><div class="bar"><i style="width:{_pay}%"></i></div></td></tr>')
    _mk = "".join(
        f'<li><span><strong>{esc(m["q"])}</strong> <span class="alt">konum {tr_sayi(m["poz"], 1)}</span></span>'
        f'<span class="chip kotu">{m["gos"]} göst · {m["tik"]} tık</span></li>' for m in _ST["makas"]) \
        or '<li class="alt">Yok</li>'
    _yalin = next((x for x in _ST["siniflar"] if x["k"] == "yalin"), None)
    _alici = next((x for x in _ST["siniflar"] if x["k"] == "alici"), None)
    _st_not = ""
    if _yalin and _alici:
        _st_not = (f"En büyük havuz yalın site adı: {tr_sayi(_yalin['gos'])} gösterim, %{tr_sayi(_yalin['to'], 1)} "
                   f"tıklanma. Alıcı niyetli sorgular {tr_sayi(_alici['gos'])} gösterimle %{tr_sayi(_alici['to'], 1)} "
                   f"tıklanıyor. Dikkat: yalın sınıfta düşük oranın sebebi snippet değil KONUM — bu "
                   f"sorgularda ortalama {tr_sayi(_yalin['poz'], 1)}. sıradayız; kaldıraç tarama/damla. "
                   f"Bu tablo ilk 1000 sorguyu kapsar (gösterimin yaklaşık beşte biri, tıkın dörtte biri); "
                   f"sınıflama sorgu metninden, kural tabanlı; oranlar büyüklük sırası için güvenilir.")
    sorgusinif_html = f"""
  <h2>Hangi sorgu sınıfı tıklanıyor</h2>
  <p class="not">Search Console′daki tek “tıklanma oranı” rakamı hangi sorguların gösterim alıp
  tık <strong>almadığını</strong> gizler. Son {_ST['gun']} günün ilk 1000 sorgusu niyetine göre
  ayrıldı; toplam {tr_sayi(_ST['toplam_gos'])} gösterim, {tr_sayi(_ST['toplam_tik'])} tık,
  %{tr_sayi(_ST['to'], 2)}. {pencere_satir(_ST.get('pencere'))}</p>
  <div class="tablo-kabuk"><table>
    <thead><tr><th>Sorgu sınıfı</th><th class="num">Sorgu</th><th class="num">Gösterim</th>
    <th class="num">Tık</th><th class="num">TO</th><th class="num">Konum</th><th>&nbsp;</th></tr></thead>
    <tbody>{_st_satir}</tbody>
  </table></div>
  <p class="alt" style="margin-top:8px">{_st_not}</p>
  <div class="pano" style="margin-top:14px">
    <h3>Snippet makası — ilk 5′te ama tıklanmıyor</h3>
    <p class="alt" style="margin:8px 0 10px">Konumu 5 ve üstü, 40+ gösterim, TO %2′nin altında.
    Sıra sorunu değil, sonuçta görünen başlık/açıklama sorunu: bunlar title donukluğu
    ({tr_tarih(_TITLE_DONUK) if _TITLE_DONUK else 'bitince'}) kalkınca ilk bakılacak sorgular.</p>
    <ul>{_mk}</ul>
  </div>
"""
else:
    sorgusinif_html = ""

# --- sırayı KİM tutuyor (31.08) -------------------------------------------
# Karnenin baş rakamı "%68'i ilk 3'te" idi ve tek başına yanıltıcıydı: o
# sıraların üçte biri YANLIŞ sayfamızla kazanılmış. Site adını arayan kişi ada
# sayfasına, mahalle sayfasına ya da taşınmadan önceki adrese düşüyor — sıra
# tutuluyor ama ziyaretçi aradığını bulamıyor. İkisi ayrı ölçülür.
try:
    _DS = json.load(open("dogru-sayfa.json"))
except Exception:
    _DS = None
if _DS:
    _RENK = {"dogru": "iyi", "eski": "kotu", "ada": "orta", "mahalle": "orta",
             "baska_site": "orta", "belirsiz": "nul", "dis": "kotu", "yok": "kotu"}
    _ds_satir = "".join(
        f'<li><span>{esc(x["ad"])}</span>'
        f'<span class="chip {_RENK.get(x["k"], "nul")}">{x["n"]}</span></li>'
        for x in _DS["hepsi"])
    _i3 = _DS["ilk3_toplam"]
    _ds_toplam = _DS.get("toplam") or sum(x["n"] for x in _DS["hepsi"])  # dogru-sayfa.json → toplam
    _i3d = _DS["ilk3_dogru"]
    _i3y = _i3 - _i3d
    _pay = round(_i3d * 100 / _i3) if _i3 else 0
    _yanlis_mah = ", ".join(f"{MAH_AD.get(m, m)} {n}" for m, n in _DS["yanlis_mahalle"][:5])
    _belirsiz = next((x["n"] for x in _DS["hepsi"] if x["k"] == "belirsiz"), 0)
    dogrusayfa_html = f"""
  <h2>Sırayı hangi sayfamız tutuyor</h2>
  <p class="not">“İlk 3′teyiz” demek “doğru sayfa çıkıyor” demek değil. Site adını arayan
  kişi ada sayfasına, mahalle sayfasına ya da taşınmadan önceki adrese düşebiliyor: sıra
  tutuluyor, ziyaretçi aradığını bulamıyor. Bu ikisi ayrı sayılmalı.</p>
  <div class="iki">
    <div class="pano">
      <h3>İlk 3′teki {_i3} sıranın kimliği</h3>
      <p class="alt" style="margin:0 0 10px">Bunların <strong>{_i3d} tanesi doğru site sayfasıyla</strong>
      kazanılmış (%{_pay}); kalan <strong>{_i3y} tanesinde</strong> sıra bizde ama açılan sayfa
      aranan site değil.</p>
      <div class="bar" style="height:14px"><i style="width:{_pay}%"></i></div>
      <p class="alt" style="margin:10px 0 0">Yanlış sayfanın en yoğun olduğu mahalleler:
      {_yanlis_mah}.</p>
    </div>
    <div class="pano">
      <h3>{_ds_toplam} sorgunun tamamı</h3>
      <ul>{_ds_satir}</ul>
      <p class="alt" style="margin:10px 0 0">“Ölçüm kırıntısı” ({_belirsiz}): o kayıtta hangi
      sayfanın sıralandığı okunamamış — sonuç adresi kesik kaydedilmiş. Bunlar hiçbir sınıfa
      sayılmaz, yeniden ölçülmeleri gerekir.</p>
    </div>
  </div>
"""
else:
    dogrusayfa_html = ""

# --- sayfa türü verimi (31.08) --------------------------------------------
# Karne sayfaları tek tek ölçüyordu ama hangi AİLENİN emeğe değdiğini
# göstermiyordu. Ayrım kararı değiştiriyor: ada sayfaları adres sayısı olarak
# site sayfaları kadar ama sayfa başına tıkları on üçte biri.
try:
    _TVJ = json.load(open("sayfa-turu-verimi.json"))
    _TV = _TVJ["satirlar"]
except Exception:
    _TVJ, _TV = None, None
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
                   f"(ada {tr_sayi(_ada['sayfa'])}, site {tr_sayi(_site['sayfa'])}) ama sayfa başına "
                   f"<strong>{_kat} kat</strong> az tık getiriyor "
                   f"(ada {tr_sayi(_ada['tik_sayfa'], 2)}, site {tr_sayi(_site['tik_sayfa'], 2)}). "
                   f"Yine de sitemap′te kalıyorlar: 31.08 ölçümünde tarama bütçesi yemedikleri "
                   f"görüldü (bkz. Sıra nasıl iyileşir → Ada sayfalarını sitemap′ten çıkarmak) "
                   f"ve çıkarmanın ölçülmüş bir kazancı yok.")
    # Pencere: sayfa-turu-verimi.json kendi pencere'sini taşır (sayfalar28.tsv başlığı).
    # 02.09'a kadar sonuc-ozeti'den ödünç alınıyordu ve iki dosya farklı pencerede
    # çıkmıştı (sayfalar28 01.08–28.08, sonuc-ozeti 01.08–29.08) — ödünç yok.
    _tv_p = _TVJ.get("pencere")
    _tv_donem = (f"Son {_tv_p['gun']} gün, Search Console." if _tv_p
                 else "Search Console; pencere ölçülmedi.")
    turverim_html = f"""
  <h2>Hangi sayfa ailesi trafiği taşıyor</h2>
  <p class="not">{_tv_donem} Kaldırılan Yenimahalle sayfaları hariç.
  Sütunlardan en önemlisi <strong>adres başına tık</strong> — toplam sayı çok adresli
  aileleri olduğundan büyük gösterir. {pencere_satir(_tv_p)}</p>
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
    # Ölçüm yaşı kovaları veri-sagligi.py'de sabit sırayla yazılır (en taze
    # kova önce, açık uçlu "N+ gün" en sonda). Satır etiketleri kova adından
    # türetilir; eşik orada değişirse karne kendiliğinden uyar, elle rakam yok.
    _yas_kova = [k for k, _ in _VS["yas"]]

    def _kova_sinir(k):
        # "0-7 gün" -> (0, 7); "30+ gün" -> (30, None)
        s = k.split()[0]
        if s.endswith("+"):
            return int(s[:-1]), None
        a, b = s.split("-")
        return int(a), int(b)

    _yas_ilk, _yas_orta, _yas_eski = _yas_kova[0], _yas_kova[1], _yas_kova[2:]
    _yas_satirlar = (
        f'<li><span>Son {_kova_sinir(_yas_ilk)[1]} gün içinde ölçülmüş</span>'
        f'<span class="chip iyi">{_yas.get(_yas_ilk, 0)}</span></li>'
        f'<li><span>{_kova_sinir(_yas_orta)[0]}-{_kova_sinir(_yas_orta)[1]} gündür ölçülmemiş</span>'
        f'<span class="chip">{_yas.get(_yas_orta, 0)}</span></li>'
        f'<li><span>{_kova_sinir(_yas_eski[0])[0]} günden eski</span>'
        f'<span class="chip">{sum(_yas.get(k, 0) for k in _yas_eski)}</span></li>'
    )
    _gu = _VS.get("gurultu") or {}
    _vs_gurultu = ""
    if _gu.get("oran") is not None:
        _vs_gurultu = (f'Kısa aralıklı {_gu["cift"]} yeniden ölçüm içinde '
                       f'<strong>≤1 sıra oynayanların payı %{_gu["oran"]}</strong> — bu yüzden bir sıralık '
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
        {_yas_satirlar}
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

# "Son ölçümde ne değişti" bölümündeki gürültü cümlesi de aynı orandan beslenir;
# veri-sagligi.json yoksa rakamsız kurulur (elle rakam yazılmaz).
_gurultu_oran = (_VS.get("gurultu") or {}).get("oran") if _VS else None
GURULTU_ORAN_METNI = (f"<strong>≤1 sıra oynayanların payı %{_gurultu_oran}</strong>"
                      if _gurultu_oran is not None
                      else "<strong>büyük çoğunluk ≤1 sıra oynuyor</strong>")

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
    # Pencere: gorunmez-teshis.json kendi pencere'sini yazar (üretici 02.09'da bunu
    # öğrendi; bir sonraki koşuda alan dolar). Yoksa sonuc-ozeti'den ÖDÜNÇ ALINMAZ —
    # 31.08 çekimi başka pencereydi (sayfalar28 01.08–28.08), "son 28 gün" yanlış olurdu.
    _gt_p = _GT.get("pencere")
    _son_donem = f"Son {_gt_p['gun']} günde" if _gt_p else "Ölçüm penceresinde"
    _gt_pencere = pencere_satir(_gt_p)
    # Gösterim/tık penceresi güncel çekimden (sayfalar28.tsv); dizin DURUMU (var/yok) ise
    # API denetiminin yapıldığı günden. İki ayrı tarih, ikisi de basılır — 02.09 denetimi:
    # pencere alanı dolunca denetim tarihi kayboluyordu, okuyucu "bugün soruldu" sanırdı.
    if _GT.get("guncelleme"):
        _gt_pencere += (f' <span class="alt">Dizin durumu (var/yok) {tr_tarih(_GT["guncelleme"])} tarihli '
                        f'API denetiminden; gösterim ve tık güncel pencereden.</span>')
    if not _gt_p:
        _gt_pencere += (f' <span class="alt">gorunmez-teshis.json {tr_tarih(_GT.get("guncelleme"))} tarihli '
                        f'denetimden; pencere alanı bir sonraki koşuda yazılır.</span>')
    # günlük dizin isteği kotası: eylem_gun ile aynı değişken ve formül
    _dz_gun = -(-_dz['n'] // _kota_gun) if _dz['n'] else 0
    teshis_html = f"""
  <h2>Görünmeyen sayfalar — iki ayrı sorun</h2>
  <p class="not">SERP turunda kendi adıyla ilk 10′a giremeyen {_sr['n'] + _dz['n']} sayfa
  Search Console′a tek tek soruldu. Çıkan sonuç karnenin eski varsayımını çevirdi:
  <strong>görünmemek her zaman dizin sorunu değil.</strong> İkisinin ilacı farklı, o yüzden
  ayrı sayılıyorlar.{_hayalet_not}{_hata_not} {_gt_pencere}</p>
  <div class="iki">
    <div class="pano">
      <h3>Sıra sorunu — {_sr['n']} sayfa</h3>
      <p class="alt" style="margin:0 0 10px">Google′da <strong>var</strong>, başka sorgularda
      çalışıyor; yalnız kendi site adı sorgusunda ilk 10 dışında.</p>
      <ul>
        <li>{_son_donem} <strong>{tr_sayi(_sr['gost'])}</strong> gösterim, <strong>{tr_sayi(_sr['tik'])}</strong> tık
            aldılar — ortalama pozisyon {str(_sr['poz']).replace('.', ',')}.</li>
        <li>{_GT['taze_ama_gorunmez']} tanesi yakın tarihte tarandı; yani taze, dizinde ve
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
        <li>{_son_donem} <strong>{tr_sayi(_dz['gost'])}</strong> gösterim, <strong>{tr_sayi(_dz['tik'])}</strong> tık.
            Tam ölü — tek ilaçları dizine girmek.</li>
        <li>Yoğunlaştığı mahalleler: {_mah_dz}.</li>
        <li>Kanıt: damla turlarında istek gönderilen sayfaların tamamı aynı gün tarandı
            (bkz. Sıra nasıl iyileşir → Dizin isteği damlası).</li>
      </ul>
      <p class="alt" style="margin:10px 0 0"><strong>Günlük kotanın tamamı buraya.</strong>
      ~{_kota_gun}/gün ile {_dz_gun} günde biter.</p>
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

# --- hedef sorgular (02.09) -----------------------------------------------
# Karnenin baş rakamı 504 site sorgusunun ilk-3 oranıydı; asıl hedef olan 17
# sorgu (5 etap + 11 mahalle + çatı "eryaman emlakçı") karnede dağınık
# duruyordu — etap tablosu ayrı, mahalle sütunu ayrı, çatı kartta. Tek tablo,
# tek üretici: hedef-sorgular-uret.py. "Sıra" ile "sırayı hangi sayfa tutuyor"
# ayrı sütun: etap sorgularında sırayı ANA SAYFA tutuyor, birleşik okunursa
# "1. sıradayız" etap sayfası görünüyor sanılır.
try:
    _HS = json.load(open("hedef-sorgular.json"))
except Exception:
    _HS = None
if _HS:
    _ho = _HS["ozet"]
    _YON_RENK = {"yükseldi": "iyi", "geriledi": "kotu", "aynı": "nul",
                 "ilk 10'a girdi": "iyi", "ilk 10'dan çıktı": "kotu", "dışarıda kaldı": "kotu"}

    def _hs_org(r):
        if not r.get("olculdu"):
            return '<span class="chip nul">ölçülmedi</span>'
        s = r.get("sira") or 0
        if s == 0:
            return '<span class="chip kotu">ilk 10′da yok</span>'
        return f'<span class="chip {"iyi" if s <= 3 else "orta"}">{s}.</span>'

    def _hs_sayfa(r):
        if not r.get("olculdu") or not r.get("sira"):
            return '<span class="alt">—</span>'
        tur = r.get("sayfa_turu") or "okunamadı"
        if r.get("dogru_sayfa") is True:
            return f'<span class="chip iyi">{esc(tur)}</span>'
        if r.get("dogru_sayfa") is False:
            return f'<span class="chip orta">{esc(tur)}</span>'
        return f'<span class="chip nul">{esc(tur)}</span>'

    def _hs_kutu(r):
        if r.get("kutu_var") is None:
            return '<span class="chip nul">ölçülmedi</span>'
        if r.get("kutu_var") is False:
            return '<span class="chip kotu">kutu çıkmıyor</span>'
        k = r.get("kutuda")
        if k is None:
            return '<span class="chip nul">kutu var, sıramız okunamadı</span>'
        if k == 0:
            return '<span class="chip kotu">kutuda yok</span>'
        return f'<span class="chip iyi">kutu {k}.</span>'

    def _hs_isgal(r):
        if r.get("isgal") is None:
            t = r.get("isgal_dosyasinda_daha_taze")
            if t and t.get("isgal") is not None:
                return (f'<strong>{t["isgal"]}</strong> <span class="alt">'
                        f'({tr_tarih(t["tarih"])}, işgal dosyası)</span>')
            return '<span class="alt">ölçülmedi</span>'
        return f'<strong>{r["isgal"]}</strong>'

    def _hs_s(x):
        return "yok" if not x else f"{x}."

    def _hs_degisim(r):
        o = r.get("onceki")
        if not o:
            return '<span class="chip nul">önceki ölçüm yok</span>'
        yon = r.get("yon") or "—"
        ka = r.get("kanal_ayni")
        # † kanal değişti (gizli → normal); ‡ önceki ölçümün kanal kaydı yok (belirsiz)
        kanal = "" if ka else (" †" if ka is False else " ‡")
        return (f'<span class="chip {_YON_RENK.get(yon, "nul")}">{esc(yon).replace(chr(39), "′")}</span>'
                f'<span class="alt" style="display:block">{_hs_s(o.get("sira"))} → {_hs_s(r.get("sira"))}'
                f' · önceki {tr_tarih(o.get("tarih"))}{kanal}</span>')

    _hs_satir = ""
    for r in _HS["satirlar"]:
        _kanal = r.get("kanal") or "kanal belirsiz"
        _hs_satir += (
            f'<tr><td><strong>{esc(r["sorgu"])}</strong>'
            f'<span class="alt" style="display:block">{esc(r["aile_ad"])}</span></td>'
            f'<td>{_hs_org(r)}</td><td>{_hs_sayfa(r)}</td><td>{_hs_kutu(r)}</td>'
            f'<td>{_hs_isgal(r)}</td><td>{_hs_degisim(r)}</td>'
            f'<td class="alt">{tr_tarih(r.get("tarih"))}<br>{esc(_kanal)}</td></tr>')

    _hs_aile = ""
    for k in ("cati", "etap", "mahalle"):
        a = (_ho.get("aileler") or {}).get(k)
        if not a:
            continue
        _hs_aile += (f'<tr><td><strong>{esc(a["ad"])}</strong></td><td class="num">{a["toplam"]}</td>'
                     f'<td class="num">{a["birinci"]}</td><td class="num">{a["ilk3"]}</td>'
                     f'<td class="num">{a["ilk4_10"]}</td><td class="num">{a["disarida"]}</td>'
                     f'<td class="num">{a["kutuda"]}</td></tr>')

    _yon_parca = [f"{n} {ad.replace(chr(39), '′')}" for ad, n in (_ho.get("yon") or {}).items() if n]
    _yon_cumle = ", ".join(_yon_parca) if _yon_parca else "kıyaslanacak önceki ölçüm yok"
    _ilk10 = _ho["ilk3"] + _ho["ilk4_10"]
    _belirsiz = _ho.get("ilk10_sayfa_belirsiz") or 0
    _belirsiz_cumle = f", {_belirsiz} tanesinde sayfa okunamadı (kırıntı)" if _belirsiz else ""
    _eb = _ho.get("en_bayat") or {}
    _hs_uyari = "".join(f'<li><span>{esc(u)}</span></li>' for u in _HS.get("uyarilar") or [])
    # 16 hedef = 5 etap + 11 mahalle (hedef-sorgular.md); çatı sorgu ayrı satır. Sayılar
    # üreticinin aile toplamlarından — "5 etap, 11 mahalle" elle yazılıydı (02.09 denetimi).
    _ha = _ho.get("aileler") or {}
    _n_etap = (_ha.get("etap") or {}).get("toplam") or 0
    _n_mah = (_ha.get("mahalle") or {}).get("toplam") or 0
    _n_hedef = _n_etap + _n_mah
    _kb = _ho.get("kanal_belirsiz_kiyas")
    _kb_s = "ölçülmedi" if _kb is None else str(_kb)
    hedefsorgu_html = f"""
  <h2>Hedef sorgular — {_n_hedef} hedef + çatı sorguda neredeyiz</h2>
  <p class="not">Bütün sıra çalışmasının hedefi bu {_n_hedef} sorgu: {_n_etap} etap, {_n_mah} Eryaman
  mahallesi; çatı sorgu “eryaman emlakçı” ayrıca izlenir (tabloda {_ho['hedef_sayisi']} satır).
  Her satırda organik sıra ile <strong>sırayı hangi sayfamızın tuttuğu</strong> ayrı okunur —
  etap sorgularında sırayı çoğunlukla ana sayfa tutuyor, yani sıra var ama etap sayfası görünmüyor.
  Harita kutusu organikten ayrı sayılır.
  {_ho['olculen']} sorgu ölçüldü, {_ho['olculmeyen']} sorgu ölçülmedi; {tr_sayi(_HS['kayit_sayisi'])} ölçüm kaydı tarandı.</p>
  <div class="kartlar">
    <div class="kart"><div class="buyuk">{_ho['birinci']}</div><div class="etiket">sorguda organik 1. sıra</div></div>
    <div class="kart"><div class="buyuk">{_ho['ilk3']}</div><div class="etiket">sorguda ilk 3 (1. sıra dahil)</div></div>
    <div class="kart"><div class="buyuk">{_ho['ilk4_10']}</div><div class="etiket">sorguda 4–10 arası</div></div>
    <div class="kart"><div class="buyuk">{_ho['disarida']}</div><div class="etiket">sorguda ilk 10′da yok</div></div>
    <div class="kart vurgu"><div class="buyuk">{_ho['kutuda']}</div><div class="etiket">sorguda harita kutusundayız · {_ho['kutuda_birinci']} tanesinde 1.</div></div>
  </div>
  <div class="tablo-kabuk" style="margin-top:16px"><table>
    <thead><tr><th>Sorgu</th><th>Organik</th><th>Sırayı tutan sayfa</th><th>Harita kutusu</th>
    <th>İşgal</th><th>Önceki ölçüme göre</th><th>Ölçüm</th></tr></thead>
    <tbody>{_hs_satir}</tbody>
  </table></div>
  <p class="alt" style="margin-top:8px">“Sırayı tutan sayfa” yeşilse hedef sayfa çıkıyor, sarıysa
  başka sayfamız (çoğunlukla ana sayfa) sırayı karşılıyor. † iki ölçüm farklı pencereden
  (gizli → normal); {_ho['kanal_degisen_kiyas']} kıyas böyle, ±1 sıralık fark gürültü sayılır.
  ‡ önceki ölçümün penceresi kayıtta yok (oturumlu Chrome dönemi); {_kb_s} kıyas böyle, aynı ihtiyatla okunur.
  İşgal = 1. sayfada bize ait sonuç sayısı (site + mağaza + sosyal), {_ho['isgal_olculen']} sorguda ölçüldü,
  toplam {_ho['isgal_toplam']} sıra.</p>
  <div class="iki" style="margin-top:16px">
    <div class="pano">
      <h3>Aileye göre</h3>
      <div class="tablo-kabuk"><table style="min-width:0">
        <thead><tr><th>Aile</th><th class="num">Hedef</th><th class="num">1.</th><th class="num">İlk 3</th>
        <th class="num">4–10</th><th class="num">Dışarıda</th><th class="num">Kutuda</th></tr></thead>
        <tbody>{_hs_aile}</tbody>
      </table></div>
      <p class="alt" style="margin:10px 0 0">İlk 10′daki {_ilk10} sıranın <strong>{_ho['ilk10_dogru_sayfa']} tanesini
      hedef sayfa</strong> tutuyor; {_ho['ilk10_ana_sayfa_temsil']} tanesinde sırayı ana sayfa karşılıyor{_belirsiz_cumle}.
      Harita: {_ho['kutuda']} sorguda kutudayız, {_ho['kutu_var_biz_yok']} sorguda kutu var ama biz yokuz,
      {_ho['kutu_yok']} sorguda kutu hiç çıkmıyor.</p>
    </div>
    <div class="pano">
      <h3>Önceki ölçüme göre yön</h3>
      <p class="alt" style="margin:0 0 10px">{_yon_cumle}. Tek ölçüm karar verdirmez; yön için üç günün
      eğilimine bakılır.</p>
      <ul>
        <li><span>Ölçümlerin ortalama yaşı</span><span class="chip">{tr_sayi(_ho['yas_ortalama_gun'], 1)} gün</span></li>
        <li><span>En bayat: “{esc(_eb.get('sorgu', '—'))}”</span><span class="chip {'orta' if (_eb.get('yas_gun') or 0) >= 3 else 'nul'}">{tr_tarih(_eb.get('tarih'))} · {_eb.get('yas_gun', '—')} gün</span></li>
        <li><span>7 günden eski ölçüm</span><span class="chip {'kotu' if _ho['bayat_7gun'] else 'iyi'}">{_ho['bayat_7gun']}</span></li>
        <li><span>Önceki ölçümü olmayan</span><span class="chip">{_ho['onceki_yok']}</span></li>
      </ul>
    </div>
  </div>
  <div class="pano" style="margin-top:14px">
    <h3>Ölçüm uyarıları</h3>
    <ul>{_hs_uyari}</ul>
  </div>
"""
else:
    hedefsorgu_html = ""

# --- "eryaman emlakçı" — tık serisi (02.09) --------------------------------
# Çatı sorgu. Karne yalnız SERP sırasını basıyordu; Search Console bu sorguda
# ne gösterip ne tıklattığını değil. Üretici (eryaman-emlakci-uret.py) GSC'yi
# doğrudan çeker. Kritik bulgu üreticiden geliyor: GSC "konum"u burada harita
# kutusundaki GBP bağının konumu — organik sıra değil. İkisi ayrı okunur.
try:
    _EE = json.load(open("eryaman-emlakci.json"))
except Exception:
    _EE = None
if _EE:
    _et = _EE["toplam"]

    def _ee_to(x, nd=1):
        return "ölçülmedi" if x is None else f"%{tr_sayi(x, nd)}"

    def _ee_kn(x):
        return "ölçülmedi" if x is None else tr_sayi(x, 1)

    _hmax = max((h.get("to") or 0) for h in _EE["haftalar"]) or 1
    _ee_hafta = ""
    for h in _EE["haftalar"]:
        _pay = max(2, round(100 * (h.get("to") or 0) / _hmax))
        _kismi = ' <span class="alt">(kısmi hafta)</span>' if h.get("kismi") else ""
        _ee_hafta += (f'<tr><td><strong>{esc(h["etiket"])}</strong>{_kismi}</td>'
                      f'<td class="num">{tr_sayi(h["gos"])}</td><td class="num">{tr_sayi(h["tik"])}</td>'
                      f'<td class="num">{_ee_to(h.get("to"))}</td><td class="num">{_ee_kn(h.get("konum"))}</td>'
                      f'<td><div class="bar"><i style="width:{_pay}%"></i></div></td></tr>')
    _ee_donem = ""
    for d in _EE["donemler"]:
        _ko = ' <span class="chip nul">küçük örnek</span>' if d.get("kucuk_ornek") else ""
        _ee_donem += (f'<tr><td><strong>{esc(d["ad"])}</strong>{_ko}'
                      f'<span class="alt" style="display:block">{esc(d["etiket"])} · {d["gun"]} gün</span></td>'
                      f'<td class="num">{tr_sayi(d["gos"])}</td><td class="num">{tr_sayi(d["tik"])}</td>'
                      f'<td class="num">{_ee_to(d.get("to"))}</td><td class="num">{_ee_kn(d.get("konum"))}</td>'
                      f'<td>{esc(d.get("sira_tutan_ad") or "—")}</td></tr>')
    _ee_sayfa = ""
    for s in _EE["sayfalar"]:
        _u_alt = "" if s["ad"] == s["u"] else f'<span class="alt" style="display:block">{esc(s["u"])}</span>'
        _ee_sayfa += (f'<tr><td><strong>{esc(s["ad"])}</strong>{_u_alt}</td>'
                      f'<td class="num">{tr_sayi(s["gos"])}</td><td class="num">{tr_sayi(s["tik"])}</td>'
                      f'<td class="num">{_ee_to(s.get("to"))}</td><td class="num">{_ee_kn(s.get("konum"))}</td>'
                      f'<td class="alt">{s["gun"]} gün · {tr_tarih(s["ilk"])}–{tr_tarih(s["son"])}</td></tr>')

    def _ee_serp_satir(x):
        s = x.get("sira")
        cls = "iyi" if s and s <= 3 else ("orta" if s else "kotu")
        org = f"organik {s}." if s else "organik ilk 10′da yok"
        har = ('<span class="chip iyi">harita 1.</span>' if x.get("harita")
               else '<span class="chip kotu">harita 1. değil</span>')
        return (f'<li><span>{tr_tarih(x["d"])} <span class="alt">{esc(x.get("kanal") or "")}</span></span>'
                f'<span><span class="chip {cls}">{org}</span> {har}</span></li>')

    _ee_serp = "".join(_ee_serp_satir(x) for x in _EE["serp"]) or '<li class="alt">Ölçüm yok</li>'
    _u = _EE["utm"]
    _ee_not = "".join(f'<li><span>{esc(n)}</span></li>' for n in _EE.get("notlar") or [])
    _ac = _EE.get("aciklama_commit")
    _kaynak = _EE.get("kaynak") or "ölçülmedi"
    _kaynak_ad = ("Search Console API, canlı çekim" if _kaynak == "api"
                  else esc(_kaynak).replace("önbellek", "önbellek (API düştü, tarihli TSV)"))
    _ac_cumle = (f'Baş şüpheli değişiklik: {tr_tarih(_ac["d"])}, commit {esc(_ac["h"])} — “{esc(_ac["konu"])}”.'
                 if _ac else "Açıklama değişikliğinin commit kaydı okunamadı.")
    eryamanemlakci_html = f"""
  <h2>“eryaman emlakçı” — gösterim, tık ve sırayı kim tutuyor</h2>
  <p class="not">Çatı sorgu. Yukarıdaki kart SERP sırasını söyler; bu bölüm Search Console′un
  aynı sorguda <strong>ne gösterip ne tıklattığını</strong> söyler.
  Bu bölümün penceresi öteki Search Console bölümlerinden <strong>bilerek uzun</strong> ({_EE['gun']} gün):
  üç dönem yan yana okunuyor, karnenin standart penceresi ilk dönemi dışarıda bırakırdı. Dikkat: Search
  Console′un “konum”u burada harita kutusundaki işletme bağının konumudur, organik sıra
  değil — organik sıra aşağıdaki pws=0 ölçümlerinden okunur. {pencere_satir(_EE.get('pencere'))}</p>
  <div class="kartlar">
    <div class="kart"><div class="buyuk">{tr_sayi(_et['gos'])}</div><div class="etiket">gösterim · {_EE['gun']} gün</div></div>
    <div class="kart"><div class="buyuk">{tr_sayi(_et['tik'])}</div><div class="etiket">tık</div></div>
    <div class="kart"><div class="buyuk">{_ee_to(_et.get('to'))}</div><div class="etiket">tıklanma oranı</div></div>
    <div class="kart"><div class="buyuk">{_ee_kn(_et.get('konum'))}</div><div class="etiket">Search Console konumu (harita bağı dahil)</div></div>
  </div>
  <div class="tablo-kabuk" style="margin-top:16px"><table>
    <thead><tr><th>Dönem</th><th class="num">Gösterim</th><th class="num">Tık</th><th class="num">TO</th>
    <th class="num">Konum</th><th>Sırayı tutan adres</th></tr></thead>
    <tbody>{_ee_donem}</tbody>
  </table></div>
  <div class="iki" style="margin-top:16px">
    <div class="pano">
      <h3>Haftalık tıklanma oranı</h3>
      <div class="tablo-kabuk"><table style="min-width:0">
        <thead><tr><th>Hafta</th><th class="num">Göst.</th><th class="num">Tık</th><th class="num">TO</th><th class="num">Konum</th><th>&nbsp;</th></tr></thead>
        <tbody>{_ee_hafta}</tbody>
      </table></div>
    </div>
    <div class="pano">
      <h3>Organik sıra — pws=0 ölçümleri</h3>
      <ul>{_ee_serp}</ul>
      <p class="alt" style="margin:10px 0 0"><strong>Harita bağının adresi.</strong> İşletme profilindeki
      site bağı <code>{esc(_u['adres'])}</code> adresine gidiyordu; Search Console bu adresi
      {tr_tarih(_u['ilk'])}–{tr_tarih(_u['son'])} arasında ayrı saydı: {tr_sayi(_u['ozet']['gos'])} gösterim,
      {_u['ozet']['tik']} tık, konum {_ee_kn(_u['ozet'].get('konum'))}. O günlerde ana sayfanın konumu
      {_ee_kn(_u.get('ana_konum_utm_varken'))}, sonrasında {_ee_kn(_u.get('ana_konum_utm_sonrasi'))}.
      URL denetimi: {esc(_u.get('denetim') or 'ölçülmedi')}.</p>
    </div>
  </div>
  <div class="pano" style="margin-top:14px">
    <h3>Sorguya çıkan adreslerimiz</h3>
    <div class="tablo-kabuk"><table>
      <thead><tr><th>Adres</th><th class="num">Gösterim</th><th class="num">Tık</th><th class="num">TO</th><th class="num">Konum</th><th>Görüldüğü günler</th></tr></thead>
      <tbody>{_ee_sayfa}</tbody>
    </table></div>
  </div>
  <div class="pano" style="margin-top:14px">
    <h3>Okuma</h3>
    <ul>{_ee_not}</ul>
    <p class="alt" style="margin:10px 0 0">{_ac_cumle} Title/H1 serbest kalma tarihi:
    {tr_tarih(_EE.get('title_donuk'))}.</p>
  </div>
  <p class="alt" style="margin-top:8px"><strong>Ölçüm uyarısı.</strong> {esc(_EE.get('uyari') or '')}
  Veri kaynağı: {_kaynak_ad}.</p>
"""
else:
    eryamanemlakci_html = ""

# --- ada sayfaları: beklenen tık (02.09) ----------------------------------
# "Hangi sayfa ailesi trafiği taşıyor" ada sayfalarının sayfa başına az tık
# getirdiğini söylüyor ama NEDENİNİ ayırmıyor: düşük sırada oldukları için mi,
# yoksa aynı sırada bile tıklanmadıkları için mi? Üretici (ada-beklenti-uret.py)
# ada HARİÇ sayfalardan konum bandı başına TO eğrisi kurar ve ada sayfalarının
# kendi bandında ne kadar tık getirmesi gerektiğini hesaplar.
try:
    _AB = json.load(open("ada-beklenti.json"))
except Exception:
    _AB = None
if _AB:
    _a = _AB["ada"]; _sd = _AB["sayfa_duzeyi"]["ada"]; _ok = _AB["ortak"]
    _ab_d = _AB["donem"]

    def _ab_fark(f, nd=1):
        if f is None:
            return '<span class="chip nul">ölçülmedi</span>'
        cls = "kotu" if f < 0 else ("iyi" if f > 0 else "nul")
        isaret = "+" if f > 0 else ("−" if f < 0 else "")
        return f'<span class="chip {cls}">{isaret}{tr_sayi(abs(f), nd)}</span>'

    _ab_bant = ""
    for b in _a["bantlar"]:
        _ab_bant += (f'<tr><td><strong>{esc(b["bant"])}</strong><span class="alt" style="display:block">{tr_sayi(b["satir"])} satır</span></td>'
                     f'<td class="num">{tr_sayi(b["gos"])}</td><td class="num">{tr_sayi(b["tik"])}</td>'
                     f'<td class="num">%{tr_sayi(b["to"], 2)}</td><td class="num">%{tr_sayi(b["egri_to"], 2)}</td>'
                     f'<td class="num">{tr_sayi(b["beklenen"], 1)}</td><td>{_ab_fark(b["fark"])}</td></tr>')
    _kucuk = min(_a["bantlar"], key=lambda b: b["gos"]) if _a["bantlar"] else None
    _kucuk_cumle = (f' En küçük bant ({esc(_kucuk["bant"])}) {_kucuk["gos"]} gösterim / {_kucuk["tik"]} tık:'
                    f' tek tık, oran değil — okunmaz.' if _kucuk else "")
    _ab_aile = ""
    for a in _AB["aileler"]:
        bp = a.get("bant_pay") or {}
        _ab_aile += (f'<tr><td><strong>{esc(a["ad"])}</strong><span class="alt" style="display:block">{tr_sayi(a["satir"])} satır</span></td>'
                     f'<td class="num">{tr_sayi(a["gos"])}</td><td class="num">{tr_sayi(a["tik"])}</td>'
                     f'<td class="num">%{tr_sayi(a["to"], 2)}</td><td class="num">{tr_sayi(a["poz"], 1)}</td>'
                     + "".join(f'<td class="num" style="font-size:15px">%{tr_sayi(bp.get(bn), 1)}</td>' for bn in _AB["bantlar"])
                     + '</tr>')
    _ab_ornek = ""
    for o in _ok.get("ornekler") or []:
        _ab_ornek += (f'<tr><td><strong>{esc(o["q"])}</strong></td>'
                      f'<td class="num">{tr_sayi(o["ada_gos"])}</td><td class="num">{tr_sayi(o["ada_tik"])}</td>'
                      f'<td class="num">{tr_sayi(o["ada_poz"], 1)}</td>'
                      f'<td class="num">{tr_sayi(o["site_gos"])}</td><td class="num">{tr_sayi(o["site_tik"])}</td>'
                      f'<td class="num">{tr_sayi(o["site_poz"], 1)}</td></tr>')
    _kp = _AB.get("kapsam") or {}
    _kp_ada = (_kp.get("ada") or {}).get("tik_pay")
    _kp_site = (_kp.get("site") or {}).get("tik_pay")
    _tb = _AB.get("taban") or {}
    _ky = _AB.get("kiyas") or []
    if _ky:
        _ab_kiyas = ('<div class="tablo-kabuk"><table><thead><tr><th>Tarih</th><th class="num">Ada payı (puan)</th>'
                     '<th class="num">Ada tık farkı</th><th class="num">Ortak sorgu farkı</th><th class="num">Ada önde farkı</th>'
                     '<th class="num">Ada oran farkı</th><th class="num">Sayfa düzeyi ada tık farkı</th></tr></thead><tbody>'
                     + "".join(
                         f'<tr><td><strong>{tr_tarih(k.get("tarih"))}</strong></td>'
                         f'<td>{_ab_fark(k.get("ada_pay_puan"))}</td><td>{_ab_fark(k.get("ada_tik_fark"), 0)}</td>'
                         f'<td>{_ab_fark(k.get("ortak_sorgu_fark"), 0)}</td><td>{_ab_fark(k.get("ada_onde_fark"), 0)}</td>'
                         f'<td>{_ab_fark(k.get("ada_oran_fark"), 2)}</td><td>{_ab_fark(k.get("sayfa_ada_tik_fark"), 0)}</td></tr>'
                         for k in _ky)
                     + '</tbody></table></div>')
    else:
        _ab_kiyas = ('<p class="alt" style="margin:0">Henüz kıyas yok: bu ilk kayıt taban. Sonraki çalıştırmalar '
                     'ada payı, ada tıkı, ortak sorgu sayısı ve “ada önde” sayısını bu tabanla karşılaştırır.</p>')
    _tb_cumle = (f'Taban: {esc(_tb.get("etiket") or "")} — pencere '
                 f'{tr_tarih((_tb.get("donem") or {}).get("bas"))}–{tr_tarih((_tb.get("donem") or {}).get("bit"))}, '
                 f'ada {tr_sayi(_tb.get("ada_gos"))} gösterim / {tr_sayi(_tb.get("ada_tik"))} tık, oran {tr_sayi(_tb.get("ada_oran"), 2)}, '
                 f'ortak sorgu {tr_sayi(_tb.get("ortak_sorgu"))}, ada payı %{tr_sayi(_tb.get("ortak_ada_pay"), 1)}, '
                 f'ada önde {tr_sayi(_tb.get("ortak_ada_onde_sorgu"))}.' if _tb else "Taban kaydı yok.")
    _ab_dip = "".join(f'<li><span>{esc(n)}</span></li>' for n in _AB.get("dipnotlar") or [])
    _kesik = ('<span class="chip kotu">döküm 5.000 satır sınırına çarptı — rakamlar eksik</span>'
              if _AB.get("kesik") else "")
    adabeklenti_html = f"""
  <h2>Ada sayfaları beklenenin ne kadarını getiriyor</h2>
  <p class="not">Yukarıdaki tablo ada sayfalarının sayfa başına az tık getirdiğini söylüyor ama
  nedenini ayırmıyor: <strong>düşük sırada oldukları için mi, aynı sırada bile tıklanmadıkları
  için mi?</strong> Bu bölüm ada hariç sayfalardan konum bandı başına bir tıklanma eğrisi kurar ve
  ada sayfalarının kendi bandında ne kadar tık getirmesi gerektiğini hesaplar.
  {tr_tarih(_ab_d['bas'])}–{tr_tarih(_ab_d['bit'])}, {_ab_d.get('veri_gun') or _ab_d['gun']} gün; Yenimahalle hariç
  ({tr_sayi(_AB['yenimahalle_dusulen'])} satır düşüldü, {tr_sayi(_AB['kullanilan_satir'])} satır kullanıldı). {_kesik}
  {pencere_satir(_AB.get('pencere') or _ab_d)}</p>
  <div class="kartlar">
    <div class="kart"><div class="buyuk">{tr_sayi(_a['gos'])}</div><div class="etiket">ada gösterimi (sayfa×sorgu dökümü)</div></div>
    <div class="kart"><div class="buyuk">{tr_sayi(_a['tik'])}</div><div class="etiket">gerçek tık · beklenen {tr_sayi(_a['beklenen'], 1)}</div></div>
    <div class="kart vurgu"><div class="buyuk">×{tr_sayi(_a['oran'], 2)}</div><div class="etiket">beklenenin katı (yalnız site eğrisiyle ×{tr_sayi(_AB['ada_site_egrisi']['oran'], 2)})</div></div>
    <div class="kart"><div class="buyuk">×{tr_sayi(_sd['oran'], 2)}</div><div class="etiket">tam kapsamlı ikinci bakış · {tr_sayi(_sd['sayfa'])} ada sayfası, {tr_sayi(_sd['tik'])} tık / beklenen {tr_sayi(_sd['beklenen'], 1)}</div></div>
  </div>
  <div class="tablo-kabuk" style="margin-top:16px"><table>
    <thead><tr><th>Konum bandı</th><th class="num">Ada gösterim</th><th class="num">Ada tık</th><th class="num">Ada TO</th>
    <th class="num">Eğri TO</th><th class="num">Beklenen tık</th><th>Fark</th></tr></thead>
    <tbody>{_ab_bant}</tbody>
  </table></div>
  <p class="alt" style="margin-top:8px">Eğri TO = aynı bandda ada olmayan sayfaların tıklanma oranı.
  Beklenen = ada gösterimi × eğri TO. Fark eksi ise ada sayfası aynı sırada daha az tıklanıyor.{_kucuk_cumle}</p>
  <div class="iki" style="margin-top:16px">
    <div class="pano">
      <h3>Ada ve site sayfası aynı sorguda</h3>
      <p class="alt" style="margin:0 0 10px">Ada sayfası görünen {tr_sayi(_ok['ada_gorunen_sorgu'])} sorgunun
      <strong>{tr_sayi(_ok['sorgu'])} tanesinde</strong> site sayfamız da çıkıyor ({tr_sayi(_ok['ada_yalniz_sorgu'])}
      sorguda yalnız ada). Bu sorgularda ada gösterim payı %{tr_sayi(_ok['ada_pay_ada_site'], 1)}
      (ada {tr_sayi(_ok['ada_gos'])} / site {tr_sayi(_ok['site_gos'])}).</p>
      <ul>
        <li><span>Ada sayfası tık · konum</span><span><span class="chip kotu">{tr_sayi(_ok['ada_tik'])} tık</span> <span class="chip">{tr_sayi(_ok['ada_poz'], 1)}</span></span></li>
        <li><span>Site sayfası tık · konum</span><span><span class="chip iyi">{tr_sayi(_ok['site_tik'])} tık</span> <span class="chip">{tr_sayi(_ok['site_poz'], 1)}</span></span></li>
        <li><span>Ada TO · site TO</span><span><span class="chip">%{tr_sayi(_ok['ada_to'], 2)}</span> <span class="chip">%{tr_sayi(_ok['site_to'], 2)}</span></span></li>
        <li><span>Ada sayfası site sayfasının önünde</span><span class="chip orta">{tr_sayi(_ok['ada_onde_sorgu'])} sorgu · {tr_sayi(_ok['ada_onde_gos'])} göst · {tr_sayi(_ok['ada_onde_tik'])} tık</span></li>
      </ul>
    </div>
    <div class="pano">
      <h3>Aileye göre konum bandı dağılımı</h3>
      <div class="tablo-kabuk"><table style="min-width:0">
        <thead><tr><th>Aile</th><th class="num">Göst.</th><th class="num">Tık</th><th class="num">TO</th><th class="num">Konum</th>
        {"".join(f'<th class="num">{esc(bn)}</th>' for bn in _AB["bantlar"])}</tr></thead>
        <tbody>{_ab_aile}</tbody>
      </table></div>
      <p class="alt" style="margin:10px 0 0">Son {len(_AB['bantlar'])} sütun gösterimin konum bantlarına yüzde dağılımı.</p>
    </div>
  </div>
  <div class="pano" style="margin-top:14px">
    <h3>Örnek ortak sorgular — gösterime göre ilk {len(_ok.get('ornekler') or [])}</h3>
    <div class="tablo-kabuk"><table>
      <thead><tr><th>Sorgu</th><th class="num">Ada göst.</th><th class="num">Ada tık</th><th class="num">Ada konum</th>
      <th class="num">Site göst.</th><th class="num">Site tık</th><th class="num">Site konum</th></tr></thead>
      <tbody>{_ab_ornek}</tbody>
    </table></div>
  </div>
  <div class="pano" style="margin-top:14px">
    <h3>Taban ve kıyas</h3>
    <p class="alt" style="margin:0 0 10px">{_tb_cumle}</p>
    {_ab_kiyas}
  </div>
  <div class="pano" style="margin-top:14px">
    <h3>Ölçüm notları</h3>
    <ul>{_ab_dip}</ul>
    <p class="alt" style="margin:10px 0 0">Kapsam: sayfa×sorgu dökümü ada tıklarının %{tr_sayi(_kp_ada)} kadarını,
    site tıklarının %{tr_sayi(_kp_site)} kadarını görüyor (Google′ın gizlediği sorgular dökümde yok);
    sayfa düzeyi ikinci bakış tam kapsamlı ama konumu kaba. İki bakış aynı yönü gösteriyor
    (×{tr_sayi(_a['oran'], 2)} ve ×{tr_sayi(_sd['oran'], 2)}); ondalığına güvenilmez.</p>
  </div>
"""
else:
    adabeklenti_html = ""

# --- cihaz kırılımı (02.09) -----------------------------------------------
# Ev sahibi telefondan arıyor; snippet/başlık işi telefon ekranında görünene
# göre değerlendirilmeli. Üretici (cihaz-uret.py) her turda GSC'den canlı çeker;
# önceki dönem mülkün rampasına denk geldiği için büyüme rozeti BASILMAZ.
try:
    _CZ = json.load(open("cihaz.json"))
except Exception:
    _CZ = None
if _CZ:
    _ct = _CZ["toplam"]; _cot = _CZ.get("onceki_toplam") or {}; _mp = _CZ["mobil_pay"]
    _tel = next((c for c in _CZ["cihazlar"] if c["k"] == "MOBILE"), None)
    _mas = next((c for c in _CZ["cihazlar"] if c["k"] == "DESKTOP"), None)

    def _cz_to_puan(p, on=""):
        if p is None:
            return f'<span class="chip nul">{on}ölçülmedi</span>'
        if p == 0:
            return f'<span class="chip nul">{on}aynı</span>'
        cls = "iyi" if p > 0 else "kotu"
        return f'<span class="chip {cls}">{on}{"+" if p > 0 else "−"}{tr_sayi(abs(p), 2)} puan</span>'

    def _cz_poz(p, on=""):
        # konum farkı: eksi = iyileşme
        if p is None:
            return f'<span class="chip nul">{on}ölçülmedi</span>'
        if p == 0:
            return f'<span class="chip nul">{on}aynı</span>'
        cls = "iyi" if p < 0 else "kotu"
        return f'<span class="chip {cls}">{on}{tr_sayi(abs(p), 2)} {"iyileşti" if p < 0 else "geriledi"}</span>'

    _cz_satir = ""
    for c in _CZ["cihazlar"]:
        o = c.get("onceki") or {}; f = c.get("fark") or {}
        _cz_satir += (f'<tr><td><strong>{esc(c["ad"])}</strong></td>'
                      f'<td class="num">{tr_sayi(c["gos"])}</td><td class="num" style="font-size:15px">%{tr_sayi(c["gos_pay"], 1)}</td>'
                      f'<td class="num">{tr_sayi(c["tik"])}</td><td class="num" style="font-size:15px">%{tr_sayi(c["tik_pay"], 1)}</td>'
                      f'<td class="num">%{tr_sayi(c["to"], 2)}</td><td class="num">{tr_sayi(c["poz"], 2)}</td>'
                      f'<td class="alt">%{tr_sayi(o.get("to"), 2)} · {tr_sayi(o.get("poz"), 2)}</td>'
                      f'<td>{_cz_to_puan(f.get("to_puan"), "TO ")} {_cz_poz(f.get("poz"), "konum ")}</td></tr>')
    _cz_satir += (f'<tr><td><strong>Toplam</strong></td>'
                  f'<td class="num">{tr_sayi(_ct["gos"])}</td><td class="num" style="font-size:15px">%100</td>'
                  f'<td class="num">{tr_sayi(_ct["tik"])}</td><td class="num" style="font-size:15px">%100</td>'
                  f'<td class="num">%{tr_sayi(_ct["to"], 2)}</td><td class="num">{tr_sayi(_ct["poz"], 2)}</td>'
                  f'<td class="alt">%{tr_sayi(_cot.get("to"), 2)} · {tr_sayi(_cot.get("poz"), 2)}</td>'
                  f'<td>{_cz_to_puan((_CZ.get("toplam_fark") or {}).get("to_puan"), "TO ")} {_cz_poz((_CZ.get("toplam_fark") or {}).get("poz"), "konum ")}</td></tr>')
    _to_fark = (None if not (_tel and _mas) else round(_mas["to"] - _tel["to"], 2))
    _to_fark_cumle = (f"Masaüstü tıklanma oranı telefonun {tr_sayi(abs(_to_fark), 2)} puan "
                      f"{'üstünde' if _to_fark > 0 else 'altında'}." if _to_fark else "")
    _bg = _CZ.get("baslik_gozlem")
    _cz_bg = ""
    if _bg:
        _bo, _bs = _bg["oncesi"], _bg["sonrasi"]
        _bg_satir = ""
        for c in list(_bg.get("cihazlar") or []) + [{"ad": "Toplam", "oncesi": _bo["toplam"], "sonrasi": _bs["toplam"], "fark": _bg.get("toplam_fark") or {}}]:
            o, s, f = c["oncesi"], c["sonrasi"], c.get("fark") or {}
            _bg_satir += (f'<tr><td><strong>{esc(c["ad"])}</strong></td>'
                          f'<td class="num">%{tr_sayi(o["to"], 2)} → %{tr_sayi(s["to"], 2)}</td><td>{_cz_to_puan(f.get("to_puan"))}</td>'
                          f'<td class="num" style="font-size:15px">{tr_sayi(o["gos_gun"], 0)} → {tr_sayi(s["gos_gun"], 0)}</td>'
                          f'<td class="num" style="font-size:15px">{tr_sayi(o["tik_gun"], 1)} → {tr_sayi(s["tik_gun"], 1)}</td>'
                          f'<td class="num" style="font-size:15px">{tr_sayi(o["poz"], 2)} → {tr_sayi(s["poz"], 2)}</td><td>{_cz_poz(f.get("poz"))}</td></tr>')
        _bg_uyari = "".join(f'<li><span>{esc(u)}</span></li>' for u in _bg.get("uyari") or [])
        _cz_bg = f"""
  <div class="pano" style="margin-top:14px">
    <h3>{tr_tarih(_bg['degisiklik'])} başlık değişikliği — öncesi ve sonrası, cihaza göre</h3>
    <p class="alt" style="margin:0 0 10px">Öncesi {tr_tarih(_bo['bas'])}–{tr_tarih(_bo['bit'])} ({_bo['gun']} gün),
    sonrası {tr_tarih(_bs['bas'])}–{tr_tarih(_bs['bit'])} ({_bs['gun']} gün). Pencereler eşit değil,
    gösterim ve tık <strong>gün başına</strong> kıyaslanır. Gözlem satırıdır, nedensellik iddiası değil.</p>
    <div class="tablo-kabuk"><table>
      <thead><tr><th>Cihaz</th><th class="num">TO</th><th>Fark</th><th class="num">Gösterim/gün</th>
      <th class="num">Tık/gün</th><th class="num">Konum</th><th>Konum farkı</th></tr></thead>
      <tbody>{_bg_satir}</tbody>
    </table></div>
    <ul style="margin-top:10px">{_bg_uyari}</ul>
  </div>"""
    _cz_uyari = "".join(f'<li><span>{esc(u)}</span></li>' for u in _CZ.get("uyarilar") or [])
    # Yenimahalle kalıntısı: üretici sayfa×cihaz alt kümesinden kapsamı ve Yenimahalle
    # HARİÇ telefon payını ölçer (02.09). Alan yoksa "ölçülmedi" — rakam uydurulmaz.
    _ym = _CZ.get("yenimahalle") or {}; _ckp = _CZ.get("kapsam") or {}
    if _ym.get("eryaman_telefon_gos_pay") is not None and _ckp.get("gos_pay") is not None:
        _ym_fark = abs(_ym["eryaman_telefon_gos_pay"] - _mp["gos"])
        _ym_hukum = ("tam sayımla aynı resim" if _ym_fark <= 3
                     else f"tam sayımdan {tr_sayi(_ym_fark, 1)} puan ayrışıyor")
        _cz_ym_cumle = (f"Sayfa süzgeçli alt kümede (gösterimin %{tr_sayi(_ckp['gos_pay'])} kadarını kapsar) "
                        f"Yenimahalle payı %{tr_sayi(_ym.get('kapsam_ici_gos_pay'), 1)}; Yenimahalle hariç telefon payı "
                        f"<strong>%{tr_sayi(_ym['eryaman_telefon_gos_pay'], 1)}</strong> — {_ym_hukum}.")
    else:
        _cz_ym_cumle = "Yenimahalle hariç cihaz payı ölçülmedi."
    _cz_p = _CZ.get("pencere") or _CZ.get("donem")
    _cz_op = _CZ.get("onceki_pencere") or _CZ.get("onceki_donem")
    _cz_pencere = pencere_satir(_cz_p)
    if _cz_op and _cz_op.get("bas"):
        _cz_pencere += (f' <span class="pencere">önceki pencere: {tr_tarih(_cz_op["bas"])}–{tr_tarih(_cz_op["bit"])}'
                        f'{", " + str(_cz_op["gun"]) + " veri günü" if _cz_op.get("gun") else ""}</span>')
    cihaz_html = f"""
  <h2>Telefon mu, masaüstü mü</h2>
  <p class="not">Ev sahibi telefondan arıyor: son {_CZ['gun']} günde gösterimin
  <strong>%{tr_sayi(_mp['gos'], 1)} kadarı</strong>, tıkın %{tr_sayi(_mp['tik'], 1)} kadarı telefondan.
  Başlık ve açıklama işi telefon ekranında görünene göre değerlendirilmeli. {_to_fark_cumle}
  Dönem {tr_tarih(_CZ['donem']['bas'])}–{tr_tarih(_CZ['donem']['bit'])}, Search Console son veri günü
  {tr_tarih(_CZ['son_veri_gunu'])}; mülk düzeyi, sayfa süzgeci yok — 27.08′de kaldırılan Yenimahalle
  sayfalarının kalıntı gösterimi toplamın içinde. {_cz_ym_cumle} {_cz_pencere}</p>
  <div class="kartlar">
    <div class="kart"><div class="buyuk">%{tr_sayi(_mp['gos'], 1)}</div><div class="etiket">gösterimin telefon payı · önceki dönem %{tr_sayi(_mp['onceki_gos'], 1)}</div></div>
    <div class="kart"><div class="buyuk">%{tr_sayi(_mp['tik'], 1)}</div><div class="etiket">tıkın telefon payı · önceki dönem %{tr_sayi(_mp['onceki_tik'], 1)}</div></div>
    <div class="kart"><div class="buyuk">%{tr_sayi(_tel['to'], 2) if _tel else '—'}</div><div class="etiket">telefon TO · masaüstü %{tr_sayi(_mas['to'], 2) if _mas else '—'}</div></div>
    <div class="kart"><div class="buyuk">{tr_sayi(_tel['poz'], 2) if _tel else '—'}</div><div class="etiket">telefon konumu · masaüstü {tr_sayi(_mas['poz'], 2) if _mas else '—'}</div></div>
  </div>
  <div class="tablo-kabuk" style="margin-top:16px"><table>
    <thead><tr><th>Cihaz</th><th class="num">Gösterim</th><th class="num">Pay</th><th class="num">Tık</th><th class="num">Pay</th>
    <th class="num">TO</th><th class="num">Konum</th><th>Önceki dönem TO · konum</th><th>Değişim</th></tr></thead>
    <tbody>{_cz_satir}</tbody>
  </table></div>
  <p class="alt" style="margin-top:8px">Önceki dönem {tr_tarih(_CZ['onceki_donem']['bas'])}–{tr_tarih(_CZ['onceki_donem']['bit'])}.
  Gösterim ve tık artışı bilerek rozetlenmedi: önceki pencere Search Console′un bu siteyi tanıdığı ilk aya
  denk geliyor, fark büyümeyi değil rampayı ölçer. Konum farkında eksi iyileşmedir.</p>
  {_cz_bg}
  <div class="pano" style="margin-top:14px">
    <h3>Ölçüm uyarıları</h3>
    <ul>{_cz_uyari}</ul>
  </div>
"""
else:
    cihaz_html = ""


# =============================================================================
# 02.09 — ÜÇ YENİ BÖLÜM: yönetici özeti, zaman içinde, iş takvimi
# Ortak kural: rakam üreticinin JSON'undan; fark yoksa "7 gün önce ölçülmedi".
# =============================================================================
_BIRIM_FARK = {"%": "puan", "adet": "", "sorgu": "sorgu", "sn": "sn", "sıra": "sıra", "oran": "", "tık": "tık",
               "temas": "temas", "sayfa": "sayfa", "puan": "puan"}

def _fark_chip(f):
    """7 günlük fark oku: ▲/▼ + fark + birim. Renk üreticinin yön hükmünden (iyi/kötü/nötr).
    "Ölçüm yöntemi değişti" işaretliyse renk basılmaz — rakam gerçek hareket değil
    (SERP serisinde 27.08 öncesi nokta başka ölçüm rejiminden)."""
    if not f or f.get("deger") is None:
        return '<span class="chip nul">7 gün önce ölçülmedi</span>'
    d = f["deger"]
    ok = "▲" if d > 0 else ("▼" if d < 0 else "▬")
    cls = {"iyi": "iyi", "kötü": "kotu"}.get(f.get("yon"), "nul")
    isaret = "+" if d > 0 else ("−" if d < 0 else "")
    birim = _BIRIM_FARK.get(f.get("birim") or "", f.get("birim") or "")
    yontem = " · yöntem değişti" if f.get("olcum_yontemi_degisti") else ""
    return (f'<span class="chip {cls}" title="{esc(f.get("not") or "")}">{ok} {isaret}'
            f'{tr_sayi(abs(d), _ondalik(d))}{(" " + birim) if birim else ""}{yontem}</span>')

# --- YÖNETİCİ ÖZETİ ---------------------------------------------------------
# Karne 14 bölüm; Özgün'ün ilk 10 saniyede görmesi gereken altı rakam en üstte.
# Üretici: yonetici-ozeti-uret.py (6 rakam, "ne demek" cümlesi, kaynak, 7 günlük
# fark); fark karne-gecmis-ozet.json'dan gelir. Yapılan/beklenen iki sütun.
def _baslik_duzelt(t):
    """PROTOKOL başlıkları çoğunlukla BÜYÜK HARF; listede bağırmasın.
    str.lower() Türkçe İ'yi iki karaktere bozar (tranahtar vakası) — İ→i, I→ı elle.
    Yalnız harflerinin ≥%70'i büyük olan başlık çevrilir (karışık olan olduğu gibi
    kalır), kısaltmalar korunur, ilk harf yeniden büyütülür."""
    harf = [c for c in t if c.isalpha()]
    if not harf or sum(c.isupper() for c in harf) / len(harf) < 0.7:
        return t
    kucuk = t.replace("İ", "i").replace("I", "ı").lower()
    # I→ı kuralı İngilizce sözcükleri bozar (CANONICAL → canonıcal, API → apı, SITEMAP →
    # sıtemap): kısaltma ve Latin sözcük listesi ı'sız biçimiyle eşleştirilir.
    KISALTMA = {"ga4", "pr", "api", "gsc", "serp", "seo", "url", "h1", "tsv", "json", "gbp",
                "cwv", "psi", "utm", "to", "keos", "tkgm", "ga", "id", "dmca", "spk"}
    LATIN = {"canonical", "sitemap", "workflow", "snippet", "title", "description", "indexnow",
             "search", "console", "analytics", "meta", "chrome", "google", "matterport", "yandex",
             "bing", "instagram", "facebook", "whatsapp", "commit", "merge", "cron", "script",
             "sitelinks", "residence", "tower", "city", "park", "loft"}
    def _tok(m):
        tok = m.group(0); norm = tok.replace("ı", "i")
        return norm.upper() if norm in KISALTMA else (norm if norm in LATIN else tok)
    kucuk = re.sub(r"[a-zçğıöşü0-9]+", _tok, kucuk)
    for i, c in enumerate(kucuk):
        if c.isalpha():
            bas = "İ" if c == "i" else ("I" if c == "ı" else c.upper())
            return kucuk[:i] + bas + kucuk[i + 1:]
    return kucuk

yonetici_html = ""
if _YO:
    _yo_kart = ""
    for r in _YO["rakamlar"]:
        f = r.get("fark_7g")
        _kiyas = (f' <span class="alt">{tr_tarih(f["kiyas_tarihi"])} tarihine göre</span>' if f else "")
        _yo_kart += (f'<div class="kart yo"><div class="buyuk">{esc(r["gosterim"])}</div>'
                     f'<div class="etiket">{esc(r["baslik"])}</div>'
                     f'<div class="fark">{_fark_chip(f)}{_kiyas}</div>'
                     f'<p class="alt">{esc(r["ne_demek"])}</p></div>')
    _yo_yapilan = ""
    for g in _YO.get("bu_hafta_yapilan") or []:
        _liste = "".join(f'<li>{esc(_baslik_duzelt(b))}</li>' for b in g["basliklar"])
        _yo_yapilan += (f'<li><span><strong>{esc(g["tarih"])}</strong> '
                        f'<span class="alt">{g["baslik_sayisi"]} başlık</span><ul class="ic">{_liste}</ul></span></li>')
    _yo_yapilan = _yo_yapilan or '<li class="alt">Son 7 günde defterde tarihli başlık yok.</li>'
    _yo_beklenen = ""
    for b in _YO.get("bu_hafta_beklenen") or []:
        m = b["metin"]
        if b.get("tarih") and m.startswith(b["tarih"]):
            m = m[len(b["tarih"]):].lstrip(" —–-")  # tarih zaten kalın basılıyor, iki kez yazılmasın
        _yo_beklenen += (f'<li><span><strong>{esc(b["tarih"] or "Süregelen")}</strong> — {esc(m)}'
                         f'<span class="kkaynak" style="display:block">{esc(b.get("kaynak") or "")}</span></span></li>')
    _yo_beklenen = _yo_beklenen or '<li class="alt">Beklenen madde yok.</li>'
    _yo_uyari = "".join(f'<li><span>{esc(u)}</span></li>' for u in _YO.get("uyarilar") or [])
    _yo_g = _YO.get("gecmis") or {}
    _yo_seri = (f'Fark {_yo_g.get("kayit")} günlük seriden ({(_GO or {}).get("seri_bas") and tr_tarih(_GO["seri_bas"])}'
                f'–{(_GO or {}).get("seri_bit") and tr_tarih(_GO["seri_bit"])}).' if _GO and _yo_g.get("kayit") else
                "Zaman serisi henüz yok; fark okları seri birikince dolar.")
    yonetici_html = f"""
  <h2 class="ilk">Yönetici özeti</h2>
  <p class="not">Karnenin altı ana rakamı. Oklar yedi gün önceki değere göre değişimi gösterir;
  yeşil iyi, kırmızı kötü, gri ya ölçülmedi ya da ölçüm yöntemi değişti. {_yo_seri}
  {pencere_satir(_SONUC_P, ' (Search Console)')}
  {pencere_satir((_TS or {}).get('pencere'), ' (Analytics, dün dahil)', 'gün')}</p>
  <div class="kartlar yo">{_yo_kart}</div>
  <div class="iki" style="margin-top:16px">
    <div class="pano">
      <h3>Bu hafta yapıldı</h3>
      <ul>{_yo_yapilan}</ul>
      <p class="alt" style="margin:10px 0 0">{esc(_YO.get("bu_hafta_yapilan_kurali") or "")}</p>
    </div>
    <div class="pano">
      <h3>Bekleniyor</h3>
      <ul>{_yo_beklenen}</ul>
    </div>
  </div>
  <details style="margin-top:12px"><summary><strong>Veri uyarıları</strong> <span class="alt">({len(_YO.get("uyarilar") or [])})</span></summary>
    <ul class="duz">{_yo_uyari or '<li class="alt">Uyarı yok.</li>'}</ul>
  </details>
"""

# --- ZAMAN İÇİNDE ------------------------------------------------------------
# Karne anlık görüntüydü; üreticiler JSON'larının üstüne yazdığı için dünkü değer
# kayboluyordu. Üretici: anlik-goruntu-uret.py → karne-gecmis-ozet.json (metrik
# başına son 8 gün, tam D-7 kıyası). Sparkline tek renk, son nokta vurgulu;
# o gün karnede basılmamış (ham veriden sonradan hesaplanan) noktalar açık renk.
_ZAMAN_GRUP = [
    ("SERP turu (pws=0)", ("ilk3_pay", "dogru_sayfa_pay", "ilk10_disi", "hedef_ilk3", "hedef_kutuda", "hedef_disi")),
    ("Search Console, 28 veri günü", ("gsc_tik_28", "gsc_gos_28", "gsc_to_28", "gsc_konum_28", "eryaman_tik_28")),
    ("Analytics, 28 gün", ("ga4_oturum_28", "ga4_sure", "ga4_hemen", "phone_click_28", "whatsapp_click_28")),
    ("İş durumu", ("ada_beklenti_orani", "damla_acik", "dizin_disi_sayisi", "veri_saglik_agir")),
]

def _sparkline(degerler, tarihler):
    W, H, P = 132, 34, 5
    pts = [(i, v) for i, v in enumerate(degerler) if v is not None]
    if not pts:
        return '<span class="alt">seri yok</span>'
    vs = [v for _, v in pts]
    lo, hi = min(vs), max(vs)
    span = (hi - lo) or 1
    n = max(len(degerler) - 1, 1)

    def xy(i, v):
        return (P + i * (W - 2 * P) / n, H - P - (v - lo) * (H - 2 * P) / span)

    # ardışık günleri birleştir; boş gün çizgiyi kırar (uydurma ara değer yok)
    parcalar, seg, onceki_i = [], [], None
    for i, v in pts:
        if onceki_i is not None and i != onceki_i + 1:
            parcalar.append(seg); seg = []
        seg.append(xy(i, v)); onceki_i = i
    parcalar.append(seg)
    cizgi = "".join('<polyline points="' + " ".join(f"{x:.1f},{y:.1f}" for x, y in sg) + '"/>'
                    for sg in parcalar if len(sg) >= 2)
    son_i = pts[-1][0]
    nokta = ""
    for i, v in pts:
        x, y = xy(i, v)
        t = tarihler[i] if i < len(tarihler) else ""
        cls = "son" if i == son_i else ("anlik" if t in _ANLIK_GUNLER else "geri")
        nokta += (f'<circle class="{cls}" cx="{x:.1f}" cy="{y:.1f}" r="{3.8 if i == son_i else 2.3}">'
                  f'<title>{tr_tarih(t)}: {tr_sayi(v, _ondalik(v))}</title></circle>')
    return (f'<svg class="spark" viewBox="0 0 {W} {H}" width="{W}" height="{H}" role="img" '
            f'aria-label="son {len(degerler)} gün">{cizgi}{nokta}</svg>')

def _deger_yaz(v, birim, nd):
    if v is None:
        return "—"
    t = tr_sayi(v, nd)
    return {"%": f"%{t}", "sn": f"{t} sn", "oran": f"×{t}"}.get(birim, t)

zaman_html = ""
if _GO:
    _M = _GO["metrikler"]
    _z_satir = ""
    _UST = "¹²³⁴⁵⁶⁷⁸⁹"
    for grup, anahtarlar in _ZAMAN_GRUP:
        _z_satir += f'<tr class="grup"><td colspan="5">{esc(grup)}</td></tr>'
        # Aynı not (ör. "iki uç farklı kaynaktan…") gruptaki her satırda yineleniyordu;
        # grup içinde bir kez dipnot olarak basılır, satırda yalnız üst simge durur.
        _dipnot = []
        for k in anahtarlar:
            m = _M.get(k)
            if not m:
                continue
            nd = _ondalik(m.get("son"), m.get("onceki"))
            # rejim işareti: SERP serisinde önceki nokta 27.08 öncesi turdan mı (bölge turu payı)
            # Rejim hükmü üreticiden (olcum_yontemi_degisti: SERP'te bölge turu payı, hedef
            # sorgularda kanal etiketi payı ≥50 puan ayrışınca). Eski özet JSON'da alan yoksa
            # SERP kuralı burada yinelenir.
            rejim = m.get("olcum_yontemi_degisti")
            if rejim is None:
                rejim = (m.get("onceki_bolge_turu_pay") is not None and m.get("son_bolge_turu_pay") is not None
                         and abs(m["son_bolge_turu_pay"] - m["onceki_bolge_turu_pay"]) >= 50)
            f = ({"deger": m["fark"], "yon": "nötr" if rejim else m.get("yon"), "birim": m.get("birim"),
                  "olcum_yontemi_degisti": rejim, "not": m.get("not")} if m.get("fark") is not None else None)
            _not = ""
            if m.get("not"):
                if m["not"] not in _dipnot:
                    _dipnot.append(m["not"])
                _not = f'<sup title="{esc(m["not"])}">{_UST[_dipnot.index(m["not"]) % len(_UST)]}</sup>'
            _onc = (f'{_deger_yaz(m["onceki"], m.get("birim"), nd)}<small>{tr_tarih(m.get("onceki_tarih"))}</small>'
                    if m.get("onceki") is not None else '<span class="alt">—</span>')
            _z_satir += (f'<tr><td><strong>{esc(m["ad"])}</strong>{_not}</td>'
                         f'<td>{_sparkline(m.get("sparkline") or [], m.get("sparkline_tarihler") or [])}</td>'
                         f'<td class="num">{_deger_yaz(m["son"], m.get("birim"), nd)}</td>'
                         f'<td class="num">{_onc}</td><td>{_fark_chip(f)}</td></tr>')
        if _dipnot:
            _z_satir += ('<tr class="dipnot"><td colspan="5">' + " ".join(
                f'<span>{_UST[j % len(_UST)]} {esc(n)}</span>' for j, n in enumerate(_dipnot)) + '</td></tr>')
    _pn = _GO.get("pencere_notu") or {}
    _z_notlar = "".join(f'<li><span><strong>{esc(k.upper() if k in ("gsc", "ga4") else k)}</strong>: {esc(v)}</span></li>'
                        for k, v in _pn.items())
    _sa = _SON_ANLIK or {}
    _z_tarihler = (_M.get("gsc_tik_28") or {}).get("sparkline_tarihler") or []
    _z_aralik = f"{tr_tarih(_z_tarihler[0])}–{tr_tarih(_z_tarihler[-1])}" if _z_tarihler else ""
    _ss = _GO.get("satir_sayisi") or {}
    zaman_html = f"""
  <h2>Zaman içinde</h2>
  <p class="not">Her metrik için son {len(_z_tarihler) or 8} gün ({_z_aralik}); seri {tr_tarih(_GO.get("seri_bas"))} tarihinden
  beri birikiyor ({_ss.get("anlik", 0)} gün karnede basılan değer, {_ss.get("geri_doldurma", 0)} gün ham veriden sonradan
  hesaplanan). Çizgideki <strong>koyu nokta</strong> o gün karnede basılan değer, <strong>açık nokta</strong> sonradan
  hesaplanan; büyük nokta bugün. Boş gün çizgiyi kırar, ara değer uydurulmaz.
  {pencere_satir(_sa.get('gsc_pencere'), ' (Search Console)')}
  {pencere_satir(_sa.get('ga4_pencere'), ' (Analytics, dün dahil)', 'gün')}</p>
  <div class="tablo-kabuk zaman"><table>
    <thead><tr><th>Metrik</th><th>Son 8 gün</th><th class="num">Bugün</th><th class="num">7 gün önce</th><th>Fark</th></tr></thead>
    <tbody>{_z_satir}</tbody>
  </table></div>
  <details style="margin-top:12px"><summary><strong>Pencere ve yöntem notları</strong> <span class="alt">(üreticiden)</span></summary>
    <ul class="duz">{_z_notlar}</ul>
  </details>
"""

# --- İŞ TAKVİMİ — "Yarın ne yapılacak"ın yerine ------------------------------
# Eski bölüm yalnız damla kuyruğunu listeliyordu; tarihe bağlı öbür işler (title
# donmasının bitişi, PR etkisi ölçümleri, GA4 ilk okuma, beklenen düşüş sınaması)
# defterde dağınık duruyor ve unutuluyordu. Üretici: is-takvimi-uret.py — tarihler
# veriden/git'ten türetilir. Damla günlerinin adres listesi satırın içinde kalır.
takvim_html = ""
if _IT:
    _org = lambda v: f"{v}." if isinstance(v, int) else str(v)
    _it_satir, _onceki_tarih = "", None
    for i in _IT["isler"]:
        ayr, ek = i.get("ayrinti"), ""
        if isinstance(ayr, list) and ayr and "url" in ayr[0]:
            ek = (f'<details class="ic"><summary>{len(ayr)} adres — sırayla</summary><ul>'
                  + "".join(f'<li><code>{esc(a["url"].split("/mahalleler/")[-1])}</code> '
                            f'<span class="alt">{esc(a.get("durum") or "")}</span></li>' for a in ayr)
                  + '</ul></details>')
        elif isinstance(ayr, list) and ayr and "sorgu" in ayr[0]:
            ek = (f'<details class="ic"><summary>{len(ayr)} sorgu — kutu durumu</summary><ul>'
                  + "".join(f'<li><strong>{esc(a["sorgu"])}</strong> <span class="alt">{esc(a.get("kutu_yon") or "")} · '
                            f'organik {esc(_org(a.get("organik_sira")))} · ölçüm {tr_tarih(a.get("olcum"))}</span></li>' for a in ayr)
                  + '</ul></details>')
        elif isinstance(ayr, str) and ayr:
            ek = f'<span class="alt" style="display:block;margin-top:4px">{esc(ayr)}</span>'
        tarih_h = "" if i["tarih_tr"] == _onceki_tarih else f'<strong>{esc(i["tarih_tr"])}</strong>'
        _onceki_tarih = i["tarih_tr"]
        kim_cls = "claude" if i.get("kim") == "Claude" else "ozgun"
        _it_satir += (f'<tr><td class="tarih">{tarih_h}</td>'
                      f'<td>{esc(i["is"])}{ek}</td>'
                      f'<td class="alt">{esc(i["neden"])}<span class="kkaynak" style="display:block">{esc(i.get("kaynak") or "")}</span></td>'
                      f'<td><span class="kim {kim_cls}">{esc(i.get("kim") or "?")}</span></td></tr>')
    _d = _IT.get("damla") or {}
    _it_uyari = "".join(f'<li><span>{esc(u)}</span></li>' for u in _IT.get("uyarilar") or [])
    _isler = _IT["isler"]
    _kim_say = {}
    for i in _isler:
        _kim_say[i.get("kim")] = _kim_say.get(i.get("kim"), 0) + 1
    _kim_cumle = " · ".join(f"{k} {n}" for k, n in _kim_say.items())
    _damla_cumle = ""
    if _d.get("acik") is not None:
        _damla_cumle = (f' Damla kuyruğunda {tr_sayi(_d["acik"])} açık sayfa: günde ~{_d.get("kota_gun")} istekle '
                        f'{tr_tarih(_d.get("bitis_kota"))} biter; gözlenen tempo günde {tr_sayi(_d.get("ortalama_istek"), 1)} istek, '
                        f'o tempoyla {tr_tarih(_d.get("bitis_gozlenen"))}. Bitmiş {tr_sayi(_d.get("bitmis"))} kayıt: '
                        f'{tr_sayi(_d.get("kendiliginden_dizine_giren"))} tanesi istek olmadan dizine girdi, '
                        f'{tr_sayi(_d.get("yeniden_denetimde_dizinde"))} tanesi yeniden denetimde zaten dizindeydi.')
    takvim_html = f"""
  <h2>İş takvimi</h2>
  <p class="not">Tarihe bağlı her iş tek listede: <strong>{len(_isler)} iş</strong>,
  {esc(_isler[0]["tarih_tr"]) if _isler else ""} – {esc(_isler[-1]["tarih_tr"]) if _isler else ""} ({_kim_cumle}).
  Damla günlerinin adres listesi satırın içinde.{_damla_cumle}</p>
  <div class="tablo-kabuk takvim"><table>
    <thead><tr><th>Tarih</th><th>İş</th><th>Neden</th><th>Kim</th></tr></thead>
    <tbody>{_it_satir}</tbody>
  </table></div>
  <div class="pano" style="margin-top:14px">
    <h3>Takvim uyarıları</h3>
    <ul>{_it_uyari or '<li class="alt">Uyarı yok.</li>'}</ul>
    <p class="alt" style="margin:10px 0 0">Tam kuyruk: <code>scratchpad-karne/pws0/DIZIN-DAMLASI-31-08.md</code> ·
    takvim üreticisi <code>is-takvimi-uret.py</code>, {tr_tarih(_IT.get("guncelleme"))}.</p>
  </div>
"""

# 02.09 denetimi: başlık kartlarındaki "sorguların ilk 3′te olduğu oran" kartı kaldırıldı —
# aynı rakam (%{ilk3}) yönetici özetinin 1. kartında aynı hesapla (504 tabanı) basılıyor;
# iki kez görünmesi okuyucuya iki ayrı ölçüm gibi geliyordu. TOPLAM_I3 hesabı duruyor.
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
/* 02.09: yönetici özeti, zaman içinde, iş takvimi, pencere satırı */
h2.ilk {{ margin-top:26px }}
.pencere {{ display:inline-block; margin-top:4px; font-size:12.5px; color:var(--m2); font-variant-numeric:tabular-nums;
            border:1px solid var(--cizgi); border-radius:4px; padding:1px 8px; background:var(--yuzey) }}
.kartlar.yo {{ grid-template-columns:repeat(auto-fit,minmax(290px,1fr)) }}
.kart.yo .fark {{ margin-top:8px; display:flex; flex-wrap:wrap; gap:6px; align-items:center }}
.kart.yo p.alt {{ margin:8px 0 0; font-size:13px; line-height:1.45 }}
.pano li ul.ic {{ list-style:disc; padding-left:18px; margin:4px 0 0; font-size:13.5px; color:var(--m2) }}
.pano li ul.ic li {{ display:list-item; border:0; padding:2px 0 }}
ul.duz {{ margin:0; padding:10px 0 12px 18px; font-size:13.5px; color:var(--m2) }}
ul.duz li {{ padding:3px 0 }}
.spark {{ display:block }}
.spark polyline {{ fill:none; stroke:var(--lacivert); stroke-width:1.6; stroke-linejoin:round; stroke-linecap:round }}
.spark circle.anlik {{ fill:var(--lacivert) }}
.spark circle.geri {{ fill:var(--lacivert-2); opacity:.55 }}
.spark circle.son {{ fill:var(--lacivert); stroke:var(--yuzey); stroke-width:1.5 }}
tr.grup td {{ font-size:12px; text-transform:uppercase; letter-spacing:.06em; color:var(--m3); font-weight:600;
              background:var(--zemin); padding:8px 14px }}
.zaman td.num {{ font-size:17px }}
.zaman sup {{ color:var(--m3); font-size:11px; margin-left:3px; cursor:help }}
.zaman tr.dipnot td {{ font-size:12.5px; color:var(--m3); padding:6px 14px 10px; line-height:1.5 }}
.zaman tr.dipnot td span {{ display:block }}
.zaman td.num small {{ font-family:"Source Sans 3",sans-serif; font-size:12px; font-weight:400; color:var(--m3); display:block }}
.kim {{ display:inline-block; padding:2px 10px; border-radius:99px; font-size:12.5px; font-weight:700; letter-spacing:.02em; white-space:nowrap }}
.kim.claude {{ background:var(--lacivert-3); color:var(--lacivert) }}
.kim.ozgun {{ background:var(--orta-z); color:var(--orta-r); border:1px solid var(--orta-r) }}
.takvim table {{ min-width:860px }}
.takvim td {{ vertical-align:top; font-size:14.5px }}
.takvim td.tarih {{ white-space:nowrap; font-variant-numeric:tabular-nums }}
.takvim details.ic {{ margin:6px 0 0; padding:0 10px; background:var(--zemin) }}
.takvim details.ic summary {{ padding:6px 0; font-size:13px }}
.takvim details.ic ul {{ margin:0; padding:6px 0 8px 16px; font-size:13px }}
.takvim code, .pano code {{ font-size:12.5px }}
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
{yonetici_html}
{zaman_html}

  <h2>Sıra ölçümü — başlık kartları</h2>
  <div class="kartlar">
    <div class="kart"><div class="buyuk">{TOPLAM_N}</div><div class="etiket">site sorgusu ölçüldü · {MAH_TAMAM}/{MAH_TOPLAM} mahalle {'TAMAM' if MAH_TAMAM == MAH_TOPLAM else 'tamam'}</div></div>
    <div class="kart"><div class="buyuk">{TOPLAM_BIR}</div><div class="etiket">sorguda organik 1. sıradayız</div></div>
    <div class="kart vurgu"><div class="buyuk">{ana_org}<small>. sıra</small></div><div class="etiket">“eryaman emlakçı” organik (harita {ana_har}.) · {ana_d}</div></div>
  </div>

  <h2>Gerçek sonuç — tıklama</h2>
  <p class="not">Sıra tek başına yanıltıcı: yukarıdaki sıralar iyileşirken tıklama başka yöne gidebilir.
  Bu bölüm Google Search Console′un gerçek rakamlarını gösterir ({donem_notu}).
  {sonuc_pencere}</p>
  {sonuc_html}
{hedefsorgu_html}
{eryamanemlakci_html}

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
        <li><strong>Mahalle sorgularının organiği.</strong> {len(OLCULEN)} mahallenin
        {len(_ORG_YOK)} tanesinde “… mahallesi emlakçı” aramasında ilk 10′a giremiyoruz
        ({_ad(_ORG_YOK)}). Bunların yalnız {len(set(_ORG_YOK) - set(_KUTU_YOK))} tanesinde harita
        kutusu bizi taşıyor. En iyiler: {_eniyi}.</li>
        <li><strong>Ne organikte ne kutuda: {len(_CIFT_KAYIP)} mahalle.</strong> {_ad(_CIFT_KAYIP)}.
        Yorum kampanyasında mahalle adı geçirme önceliği bunlar — <strong>ama
        {_ad(_KUTU_HIC)}</strong> hariç: o sorguda harita kutusu hiç çıkmıyor, yorum emeği
        karşılık bulmaz. Kutu var ama biz içinde değiliz: {_ad(_KUTU_RAKIP)}.</li>
        <li><strong>Bayat yığınlar.</strong> {_bayat_ilk2}
        en büyük iki tazeleme borcu{_bayat_damla}.</li>
        <li><strong>Kendi sayfalarımız birbirinin önüne geçiyor.</strong> {yamyam_cumle}</li>
        <li><strong>Eski adres kalıntıları.</strong> {len(_eski_kendi)} sorguda sayfanın
        kendi taşınma öncesi adresi listeleniyor — 301 sindirme işi tam olarak bunları çözer.
        En yoğun: {_eski_ilk}. Ayrıca {len(_eski_baska)} sorguda başka bir sayfamızın kısa
        adresi çıkıyor; onlara 301 bir şey kazandırmaz, ayrı iş.</li>
      </ul>
    </div>
    <div class="pano">
      <h3>Dizin damlası — sıradaki {len(KUYRUK_OLU[:5])}</h3>
      <ul>{siradaki_html}</ul>
      <p class="alt" style="margin:10px 0 0">Kota: günde ~{_kota_gun} istek; son {_ISTEK_PENCERE} günde {BEKLEYEN_ISTEK} sayfaya istek gönderildi.
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
  <p class="not">İlk 3 kaydı tutulan {rakip_toplam} ölçümde birinci sırayı kimin tuttuğu
  (her ölçümde ilk 3 alan adı kaydedilmiyor; bu yüzden sayı toplam ölçümden azdır).
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
      %{GIRIS_IHTIYAT['yuzde']} kadarı ({GIRIS_IHTIYAT['eski_taban']} tanesi) 22-23 Ağustos turuyla
      kıyaslanıyor ve o turda “ilk 10′da yok” oranı %{GIRIS_IHTIYAT['o22']}-{GIRIS_IHTIYAT['o23']} düzeyindeydi;
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
  ölçümde de ilk 10′da olan sayfalar arasında {GURULTU_ORAN_METNI}; yani
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
    Ama bu sayfaların <strong>{TAVAN['birinci']} tanesi zaten 1. sıradaydı</strong> —
    yükselecek yerleri yoktu, yalnız düşebilirlerdi.</p>
    <p class="alt" style="margin:10px 0 0">Yükselecek yeri olanlara (3. sıra ve
    gerisinden başlayan {TAVAN['yeri_var_n']} sayfa) bakınca yön tersine dönüyor:
    ortalama <strong>{_v(TAVAN['yeri_var_once'])} → {_v(TAVAN['yeri_var_sonra'])}</strong>,
    ≥2 sıra yükselen {TAVAN['yeri_var_yuk']}, düşen {TAVAN['yeri_var_dus']}.
    Yani gerçek yön {tavan_yon}. Tek başına ortalamaya bakmak burada yanlış karar
    verdirirdi.</p>
  </div>

  <h2>Dizine eklenecekler</h2>
  <p class="not">Bu tablo <strong>yalnız Google′da gerçekten olmayan</strong> sayfaları
  gösterir; her satır Search Console′a tek tek sorulup doğrulanmıştır. Günlük istek kotası
  ~{_kota_gun} olduğu için sıra önemli: önce hedef sorgu sayfası olan bayat mahalleler, sonra
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
    sorulunca <strong>{sira_sorun_sayi} sayfanın tamamı dizinde çıktı</strong>. Dertleri dizin değil sıra;
    istek göndermek kotayı yakar, hiçbir şey kazandırmaz. En çok gösterim alanlar:</p>
    <ul>{sira_sorun_html}</ul>
  </div>

{takvim_html}

{tiksonrasi_html}
{sorgusinif_html}
{dogrusayfa_html}
{turverim_html}
{adabeklenti_html}
{cihaz_html}
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
