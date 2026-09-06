#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Tarihli iş takvimi üretici → is-takvimi.json

NEDEN: karnenin "Yarın ne yapılacak" bölümü yalnız dizin damlası kuyruğunu
gösteriyordu. Oysa defterde (PROTOKOL-gece.md) ve kaldıraç defterinde tarihe
bağlı başka işler duruyor — title donmasının bitişi, PR'ların etkisini ölçme
günleri, GA4 özel boyutunun ilk okuması, beklenen düşüşlerin sınanması — ve
takvimde durmadıkları için unutulmaya açıklar. Bu üretici hepsini tek, tarihe
göre sıralı listeye toplar. Okuyucu Özgün; her satır "ne, neden, kaynak, kim".

Tarihler ve rakamlar elle yazılmaz, veriden türetilir:
  • damla günleri  : DIZIN-DAMLASI-31-08.md'deki açık "- [ ] url" satırları
                     günlük kotaya (KOTA_GUN) bölünür → bitiş tarihi;
                     gözlenen tempo aynı dosyadaki "← gg.aa istek gönderildi"
                     işaretlerinden sayılır
  • kutu listesi   : hedef-sorgular.json (kutu_var ve kutuda == 0)
  • tarama denetimi: damla dosyasındaki mahalle sayfası isteklerinin tarihi + 3 / + 4
  • title donması  : eryaman-emlakci.json title_donuk (yedek: PROTOKOL-gece.md'deki
                     "…'a kadar başlık/H1 deneyi YAPILMAZ" cümlesi)
  • ada kıyasları  : PR #87 commit tarihi (git log) + 14 / + 28
  • GA4 konum      : PR #88 commit tarihi (git log) + 14
  • beklenen düşüş : Yenimahalle kaldırma commit'i (#79) + 28 + GSC gecikmesi
  • cihaz / sınıf  : cihaz.json ve sorgu-sinifi-to.json guncelleme + 28
Git'e ulaşılamazsa yedek tarih kullanılır ve kaynak alanına "(yedek tarih)" düşülür.

Çıktı: is-takvimi.json — {guncelleme, damla, gbp_kutu, uyarilar, isler[]}
       isler[i] = {tarih (ISO, sıralama için), tarih_tr, is, neden, kaynak, kim, ayrinti?}
karne-html.py bu dosyayı okuyabilir; bu betik karneye dokunmaz.
Çalıştırma: python3 is-takvimi-uret.py   (KARNE_SCRATCH gerekmez)
"""
import datetime
import json
import math
import os
import re
import subprocess
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import tranahtar  # noqa: E402 — Türkçe İ'ye dayanıklı küçük harf anahtarı

KOK = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(KOK, "..", ".."))
BUGUN = datetime.date.today()
YIL = BUGUN.year

# karne-html.py'deki _kota_gun ile aynı sayı (kaldıraç defteri: "Kota günde ~10,
# kayan 24 saat"). karne-html.py içe aktarılmıyor: içe aktarmak tüm karneyi koşturur.
KOTA_GUN = 10
# eryaman-emlakci.json uyarısı "GSC 2-3 gün geriden gelir" — güvenli tarafta 3.
GSC_GECIKME = 3
# Karnedeki bütün GSC bölümleri 28 günlük pencereyle ölçülüyor; kıyas için ikinci
# BAĞIMSIZ pencere de bu kadar sonra dolar.
PENCERE = 28
# Mahalle sayfası isteği → yeniden tarama denetimi: PROTOKOL 02.09 08:28 notu
# "04-05.09'da yeniden bak" dedi; istek 01.09'daydı, yani +3 ve +4 gün.
TARAMA_DENETIM_GUN = (3, 4)
# GA4 özel boyutu geriye dönük çalışmaz; PROTOKOL 02.09: "ilk anlamlı okuma ~14 gün sonra".
GA4_ILK_OKUMA_GUN = 14

GUNLER = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"]
MAH_AD = {"tunahan-mahallesi": "Tunahan", "altay-mahallesi": "Altay",
          "devlet-mahallesi": "Devlet", "eryaman-mahallesi": "Eryaman",
          "goksu-mahallesi": "Göksu", "guzelkent-mahallesi": "Güzelkent",
          "sehit-osman-avci-mahallesi": "Şehit Osman Avcı", "seker-mahallesi": "Şeker",
          "seyh-samil-mahallesi": "Şeyh Şamil", "yavuz-selim-mahallesi": "Yavuz Selim",
          "yesilova-mahallesi": "Yeşilova"}

UYARILAR = []


# ---------------- yardımcılar ----------------
def tr_sayi(n, ondalik=0):
    """Türkçe biçim: binlik nokta, ondalık virgül (karne-html.py ile aynı)."""
    if n is None:
        return "—"
    t = f"{n:,.{ondalik}f}"
    return t.replace(",", "\x00").replace(".", ",").replace("\x00", ".")


def iso(d):
    return d.isoformat()


def tr_tarih(d):
    return f"{d:%d.%m} {GUNLER[d.weekday()]}"


def kisa(iso_s):
    """'2026-09-02' → '02.09'. Dilimleyerek ([5:]) yapılırsa AA.GG çıkar — ilk
    çalıştırmada tam bu hata vardı; tek yerden geçsin."""
    if not iso_s or len(iso_s) < 10:
        return "?"
    return f"{iso_s[8:10]}.{iso_s[5:7]}"


def gg_aa(s, yil=YIL):
    """'01.09' → date. Takvim tek yıl içinde; Aralık→Ocak sarkması yok."""
    g, a = s.split(".")
    return datetime.date(yil, int(a), int(g))


def tarih_iso(s):
    return datetime.date.fromisoformat(s)


def yukle(ad):
    with open(os.path.join(KOK, ad), encoding="utf-8") as f:
        return json.load(f)


def git_tarih(desen, yedek, etiket):
    """Commit mesajında `desen` geçen SON commit'in tarihi. Git yoksa yedek.

    Neden git: PR'ın yayına girdiği gün ölçüm penceresinin başlangıcıdır; onu
    elle yazmak yerine depodan okumak, karne başka gün koşunca da doğru kalır.
    """
    try:
        r = subprocess.run(
            ["git", "log", "-n", "1", "--format=%ad|%s", "--date=short", "--grep", desen],
            cwd=REPO, capture_output=True, text=True, timeout=20)
        if r.returncode == 0 and r.stdout.strip():
            t, _, konu = r.stdout.strip().partition("|")
            return tarih_iso(t), konu, f"git log --grep '{desen}'"
    except (OSError, subprocess.SubprocessError, ValueError):
        pass
    UYARILAR.append(f"{etiket}: git'ten tarih okunamadı, yedek tarih {yedek} kullanıldı.")
    return tarih_iso(yedek), "", f"{etiket} (yedek tarih)"


def slug_ad(url):
    """URL'nin son parçası; okunur ama ASCII slug (GSC arayüzünde aranan biçim bu)."""
    yol = url.split("/mahalleler/")[-1].rstrip("/")
    parca = yol.split("/")
    if len(parca) == 1:
        return MAH_AD.get(parca[0], parca[0]) + " (mahalle sayfası)"
    return f"{parca[1]} ({MAH_AD.get(parca[0], parca[0])})"


def kok_sayfa(url):
    return len(url.split("/mahalleler/")[-1].rstrip("/").split("/")) == 1


# ---------------- damla kuyruğu ----------------
def damla_oku():
    """DIZIN-DAMLASI-31-08.md → açık kayıtlar (dosya sırası = kuyruk sırası),
    bitmiş kayıtlar (tarih + açıklama), adressiz satır sayısı.

    Dosyada bazı açıklama satırlarının ("_hiç bilinmiyor_") üstünde URL yok —
    31.08 kurulumundan geliyor. Bunlar kuyrukta sayılmaz ama uyarı olarak raporlanır:
    sayı "kalan" ile oynamasın diye sessizce yutulmuyor.
    """
    yol = os.path.join(KOK, "DIZIN-DAMLASI-31-08.md")
    acik, bitmis, adressiz = [], [], 0
    mah, son = None, None  # son: bir önceki satır URL satırıysa o kayıt
    with open(yol, encoding="utf-8") as f:
        for sat in f:
            m = re.match(r"^## ([a-z-]+mahallesi)", sat)
            if m:
                mah = m.group(1)
            m = re.match(r"^- \[ \] (https://\S+)\s*(.*)$", sat)
            if m:
                son = {"url": m.group(1), "mah": mah, "not": m.group(2).strip(" ←").strip(),
                       "durum": ""}
                acik.append(son)
                continue
            m = re.match(r"^- \[x\] (https://\S+)\s*←\s*(\d\d\.\d\d)\s*(.*)$", sat)
            if m:
                son = {"url": m.group(1), "tarih": m.group(2), "aciklama": m.group(3).strip(),
                       "durum": ""}
                bitmis.append(son)
                continue
            m = re.match(r"^\s+_(.*)_\s*$", sat)
            if m:
                if son is None:
                    adressiz += 1
                else:
                    son["durum"] = m.group(1).strip()
                son = None
                continue
            son = None
    return acik, bitmis, adressiz


ACIK, BITMIS, ADRESSIZ = damla_oku()
if ADRESSIZ:
    UYARILAR.append(f"DIZIN-DAMLASI-31-08.md içinde {ADRESSIZ} açıklama satırının üstünde adres yok; "
                    f"bunlar açık sayıya girmiyor (31.08 kurulumundan kalan boşluk).")

# Gözlenen tempo: hangi gün kaç istek KABUL edildi (kendiliğinden dizine girenler
# kota harcamaz, tempoya girmez).
ISTEK_GUN = {}
KENDILIGINDEN = 0   # istek olmadan taranan/dizine giren (kota harcanmadı)
ZATEN_DIZINDE = 0   # yeniden denetimde "dizinde" çıkan (kuyruğa hiç girmemeliydi)
for b in BITMIS:
    # .lower() Türkçe İ'de bozulur ("KENDİLİĞİNDEN" eşleşmez) — tranahtar.anahtar şart.
    a = tranahtar.anahtar(b["aciklama"])
    if "istek gönderildi" in a:
        ISTEK_GUN[b["tarih"]] = ISTEK_GUN.get(b["tarih"], 0) + 1
    elif "kendiliğinden" in a:
        KENDILIGINDEN += 1
    elif "yeniden denetim" in a:
        ZATEN_DIZINDE += 1

SON_ISLEM = max((gg_aa(b["tarih"]) for b in BITMIS), default=None)
# Bugün tur yapıldıysa (dosyada bugünün işareti varsa) damla yarın başlar.
DAMLA_BAS = BUGUN if (SON_ISLEM is None or SON_ISLEM < BUGUN) else SON_ISLEM + datetime.timedelta(days=1)

KALAN = len(ACIK)
DAMLA_GUN = math.ceil(KALAN / KOTA_GUN) if KALAN else 0
DAMLA_BIT = DAMLA_BAS + datetime.timedelta(days=DAMLA_GUN - 1) if DAMLA_GUN else None
ORT_ISTEK = (sum(ISTEK_GUN.values()) / len(ISTEK_GUN)) if ISTEK_GUN else None
DAMLA_BIT_GOZLENEN = (DAMLA_BAS + datetime.timedelta(days=math.ceil(KALAN / ORT_ISTEK) - 1)
                      if (ORT_ISTEK and KALAN) else None)

ISLER = []


def ekle(tarih, is_, neden, kaynak, kim, oncelik=1, ayrinti=None):
    kayit = {"tarih": iso(tarih), "tarih_tr": tr_tarih(tarih), "is": is_, "neden": neden,
             "kaynak": kaynak, "kim": kim, "_oncelik": oncelik}
    if ayrinti is not None:
        kayit["ayrinti"] = ayrinti
    ISLER.append(kayit)


# --- damla günleri ---
for gun_no in range(DAMLA_GUN):
    bas_i = gun_no * KOTA_GUN
    dilim = ACIK[bas_i:bas_i + KOTA_GUN]
    kalan_once = KALAN - bas_i
    kalan_sonra = kalan_once - len(dilim)
    t = DAMLA_BAS + datetime.timedelta(days=gun_no)
    ilk = dilim[0]
    is_ = (f"Dizin damlası: {len(dilim)} istek gönder, {slug_ad(ilk['url'])} ile başla. "
           f"Kuyrukta {kalan_once} sayfa açık, gün sonunda {kalan_sonra} kalır.")
    if gun_no == 0:
        neden = (f"Kuyruktaki her sayfa Search Console API ile dizin dışı doğrulandı ve 28 günde "
                 f"sıfır gösterim aldı; tek ilacı dizine girmek. Kota günde yaklaşık {KOTA_GUN} istek "
                 f"ve takvim günü değil kayan 24 saat: dünkü istekler sabah gittiyse pencere ertesi "
                 f"gün aynı saatten sonra açılır; 'sorun oluştu' balonu kota dolu demektir, tekrar "
                 f"basılmaz. İstek, dizin dışı sayfada aynı gün tarama getiriyor (damla turları).")
        if ilk["not"]:
            neden += f" İlk sıradaki sayfanın kuyruk notu: {ilk['not']}"
    else:
        # Aynı gerekçeyi beş gün art arda basmak okuyucuyu boğar; ilk günde tam hâli var.
        neden = f"Kuyruk devam ediyor; gerekçe ve kota kuralı ilk damla gününde ({tr_tarih(DAMLA_BAS)})."
    ekle(t, is_, neden,
         "DIZIN-DAMLASI-31-08.md (açık satırlar, dosya sırası) + kaldirac-defteri.json 'Dizin isteği damlası'",
         "Claude", oncelik=0,
         ayrinti=[{"url": a["url"], "durum": a["durum"]} for a in dilim])

if DAMLA_BIT:
    t = DAMLA_BIT + datetime.timedelta(days=1)
    ekle(t, "Damla kuyruğu tükenir: yeni kuyruk için görünmezleri API'ye sor "
            "(gsc-dizin becerisi; gorunmez-teshis-uret.py → dizin-adaylari-uret.py), "
            "yalnız 'dizin dışı' doğrulananlar yeni kuyruğa girer.",
         f"Kota boşa harcanmasın: 31.08 kurulumunda görünmez sayfaların çoğu zaten dizindeydi, "
         f"onlara istek göndermek sıra kazandırmıyor. Bitiş gününün ({tr_tarih(DAMLA_BIT)}) "
         f"ertesine kondu ki kuyruk boşken kota boş kalmasın.",
         "DIZIN-DAMLASI-31-08.md giriş notu (57/96 dizindeydi)", "Claude")

# --- GBP yorum kampanyası: kutu var, biz yokuz ---
HS = yukle("hedef-sorgular.json")
BIZ_YOK = [s for s in HS["satirlar"] if s.get("kutu_var") and not s.get("kutuda")]
KUTU_YOK = [s for s in HS["satirlar"] if s.get("kutu_var") is False]
KUTUDA = [s for s in HS["satirlar"] if s.get("kutu_var") and s.get("kutuda")]


def sorgu_adi(s):
    """Sorgu → listede okunur ad. Çatı sorgu 'eryaman emlakçı' mahalle adına
    indirgenirse Eryaman Mahallesi ile karışır; ayrı etiketlenir."""
    if s["aile"] == "cati":
        return f"'{s['sorgu']}' (çatı sorgu)"
    ad = re.sub(r"\s+emlakçı$", "", s["sorgu"]).replace(" Mahallesi", "")
    if s["aile"] == "mahalle" and ad == "Eryaman":
        return "Eryaman (mahalle)"
    return ad


GBP_MAH = [sorgu_adi(s) for s in BIZ_YOK if s["aile"] == "mahalle"]
GBP_ETAP = [sorgu_adi(s) for s in BIZ_YOK if s["aile"] == "etap"]
GBP_HARIC = [sorgu_adi(s) for s in KUTU_YOK]
GBP_ZATEN = [sorgu_adi(s) for s in KUTUDA]
_olcum_tarihleri = sorted({s["tarih"] for s in BIZ_YOK})
if BIZ_YOK:
    is_ = (f"GBP yorum kampanyası: sıradaki yorumlarda şu mahalle adları geçsin — "
           f"{', '.join(GBP_MAH)}.")
    if GBP_ETAP:
        is_ += (f" Etap sorgularında da kutu var, biz yokuz: {', '.join(GBP_ETAP)} — "
                f"yorumda etap adı geçirmek henüz denenmedi, ölçülmedi.")
    if GBP_HARIC:
        is_ += f" {', '.join(GBP_HARIC)} hariç: orada harita kutusu hiç çıkmıyor, yorum boşa gider."
    neden = (f"Bu {len(BIZ_YOK)} sorguda harita kutusu çıkıyor ama biz kutuda değiliz "
             f"(son ölçüm {kisa(_olcum_tarihleri[0])}–{kisa(_olcum_tarihleri[-1])}). "
             f"Harita kutusu organik sıradan bağımsız ölçüldü; kaldıracı sayfa değil işletme "
             f"profili. Yorumlarda mahalle adı geçirmek yürüyen kampanya, etkisi henüz ölçülmedi. "
             f"Zaten kutuda olduğumuz sorgular için yorum istemeye gerek yok: "
             f"{', '.join(GBP_ZATEN)}. Kural: her yoruma farklı mahalle adı, hazır metin "
             f"kopyalatılmaz, kiracı aleyhine ifade yok.")
    ekle(DAMLA_BAS, is_, neden,
         "hedef-sorgular.json (kutu_var ve kutuda alanları)", "Özgün",
         ayrinti=[{"sorgu": s["sorgu"], "kutu_yon": s.get("kutu_yon"), "organik_sira": s["sira"] or "ilk 10 dışı",
                   "olcum": s["tarih"]} for s in BIZ_YOK])

# --- mahalle sayfası yeniden tarama denetimi (+3 / +4 gün) ---
MAH_ISTEK = [b for b in BITMIS if kok_sayfa(b["url"]) and "istek gönderildi" in b["aciklama"]]
KD = yukle("kaldirac-defteri.json")
_damla_kaldirac = next((k for k in KD["kaldiraclar"] if k["ad"] == "Dizin isteği damlası"), None)
_ek_cumle = ""
if _damla_kaldirac:
    m = re.search(r"02\.09 EK:\s*(.*)$", _damla_kaldirac["olcum"])
    _ek_cumle = m.group(1).strip() if m else ""
HS_MAH = {}  # yalın mahalle adı → hedef-sorgular satırı (sıra yeniden ölçümü cümlesi için)
for s in HS["satirlar"]:
    if s["aile"] == "mahalle":
        # sorgu_adi() Eryaman'ı "(mahalle)" etiketiyle döndürür; slug_ad() ile eşleşmesi
        # için burada yalın ad kullanılır.
        HS_MAH[re.sub(r"\s+Mahallesi emlakçı$", "", s["sorgu"])] = s
if MAH_ISTEK:
    gruplar = {}
    for b in MAH_ISTEK:
        gruplar.setdefault(b["tarih"], []).append(b)
    for tarih_s, grup in gruplar.items():
        t0 = gg_aa(tarih_s)
        adlar = [slug_ad(b["url"]).replace(" (mahalle sayfası)", "") for b in grup]
        bayat = []
        for b in grup:
            m = re.search(r"(\d\d\.\d\d)'den beri taranmamış", b["durum"])
            bayat.append(m.group(1) if m else "?")
        urls = " ".join(b["url"] for b in grup)
        # +3: tarama tarihi denetimi
        t = t0 + datetime.timedelta(days=TARAMA_DENETIM_GUN[0])
        is_ = (f"{' ve '.join(adlar)} mahalle sayfaları yeniden tarandı mı: "
               f"node scripts/gsc-api.mjs denetle {urls} — son tarama tarihleri "
               f"{' / '.join(bayat)} idi.")
        neden = (f"İstek {tarih_s} günü gitti; ertesi sabah API ikisini de hâlâ eski tarama "
                 f"tarihinde gösterdi. Kaldıraç defteri: {_ek_cumle} Üç gün sonra hâlâ bayatsa 'dizindeki sayfaya "
                 f"istek' kaldıraç defterine çürük yazılır; tazelendiyse sıra yeniden ölçülür.")
        ekle(t, is_, neden, "DIZIN-DAMLASI-31-08.md (Öncelik 0) + PROTOKOL-gece.md 02.09 08:28 + kaldirac-defteri.json",
             "Claude")
        # +4: sıra yeniden ölçümü
        t = t0 + datetime.timedelta(days=TARAMA_DENETIM_GUN[1])
        sira_parca = []
        for ad in adlar:
            s = HS_MAH.get(ad)
            if s:
                sira_parca.append(f"{s['sorgu']}: {s['sira'] if s['sira'] else 'ilk 10 dışı'} "
                                  f"({kisa(s['tarih'])})")
        is_ = (f"Tarandıysa sırayı yeniden ölç (serp-olcum, pws=0): "
               f"{'; '.join(sira_parca) if sira_parca else ' ve '.join(adlar)}.")
        neden = ("Tarama tazeliği ile sıra arasındaki ilişki ölçüldü (ilk 3 bandında bayat tarama "
                 "üç kat daha az) ama 02.09 ilk kontrolünde kendiliğinden taranan iki mahalle sayfası "
                 "sıra değiştirmedi. İkinci örnek bu ikisi; sonuç ne çıkarsa kaldıraç defterine girer.")
        ekle(t, is_, neden, "hedef-sorgular.json (son sıra) + kaldirac-defteri.json 'Tarama tazeliği'",
             "Claude")

# --- 07.09: title/H1 donması biter ---
EE = yukle("eryaman-emlakci.json")
TITLE_DONUK = None
TITLE_KAYNAK = "eryaman-emlakci.json title_donuk"
if EE.get("title_donuk"):
    TITLE_DONUK = tarih_iso(EE["title_donuk"])
else:
    with open(os.path.join(KOK, "PROTOKOL-gece.md"), encoding="utf-8") as f:
        m = re.search(r"(\d\d\.\d\d)'a kadar başlık/H1 deneyi YAPILMAZ", f.read())
    if m:
        TITLE_DONUK = gg_aa(m.group(1))
        TITLE_KAYNAK = "PROTOKOL-gece.md ('…kadar başlık/H1 deneyi YAPILMAZ')"
if TITLE_DONUK:
    d = {x["k"]: x for x in EE.get("donemler", [])}
    d1, d3 = d.get("d1"), d.get("d3")
    ac = EE.get("aciklama_commit", {})
    m = re.search(r"meta description (\d+)→(\d+)", ac.get("konu", ""))
    kisaltma = f"{m.group(1)} → {m.group(2)} karakter" if m else "kısaltıldı"
    is_ = (f"Title/H1 donması biter. İlk iş: 'eryaman emlakçı' için ana sayfa meta description "
           f"(ve gerekirse title) yeniden kurulur; değişiklik tek başına gider, aynı gün başka "
           f"şablon işi yapılmaz ki etkisi ayrışsın.")
    neden = ""
    if d1 and d3:
        neden = (f"'eryaman emlakçı' tıklanma oranı {d1['etiket']} döneminde %{tr_sayi(d1['to'], 1)}, "
                 f"{d3['etiket']} döneminde %{tr_sayi(d3['to'], 1)}; organik sıra ve harita kutusu "
                 f"aynı kaldı, yani sorun sırada değil snippet'te. ")
    neden += (f"Baş şüpheli {kisa(ac.get('d', ''))} tarihli ana sayfa açıklama kısaltması ({kisaltma}); "
              f"nedensellik ölçülmedi, tek şüpheli değil. Donma sebebi: 10.08 başlık değişikliğinin "
              f"tabanı eski başlıkla alınmıştı, üstüne ikinci müdahale binerse etki ayrışmaz.")
    ekle(TITLE_DONUK, is_, neden, f"{TITLE_KAYNAK} + eryaman-emlakci.json dönemler/notlar + PROTOKOL-gece.md satır 157",
         "Claude", oncelik=1)
    # Kaldıraç defterinde bu tarihe bağlanmış başka iş var mı (ör. ada sayfası başlığı)
    for k in KD["kaldiraclar"]:
        if k["ad"] == "Ev sahibi dilli başlık şablonu":
            continue  # bu kayıt donmanın kendisi, iş değil
        if "07.09" in k.get("kisit", "") or "07.09" in k.get("olcum", ""):
            # Kaydın adı çürük kaldıracın adı (ör. canonical); iş o değil, kısıt
            # cümlesinin işaret ettiği başlık işi. Ad yalnız kaynak olarak geçer.
            ekle(TITLE_DONUK,
                 f"Donma bittiğinde ikinci başlık işi: ada sayfası başlığı. Kaldıraç defteri notu: {k['kisit']}",
                 f"Bağlı kayıt '{k['ad']}' (çürük) — ölçümü: {k['olcum']}",
                 f"kaldirac-defteri.json ({k['kaynak']})", "Claude", oncelik=2)

# --- PR #87: ada beklentisi kıyasları (+14 / +28) ---
_sitemap_k = next((k for k in KD["kaldiraclar"] if k["ad"] == "Sitemap tazelik sinyali"), None)
_pr87_yedek = "2026-08-31"
if _sitemap_k:
    m = re.search(r"(\d\d)\.(\d\d)", _sitemap_k.get("kaynak", ""))
    if m:
        _pr87_yedek = f"{YIL}-{m.group(2)}-{m.group(1)}"
PR87, PR87_KONU, PR87_KAYNAK = git_tarih("#87", _pr87_yedek, "PR #87")
TABAN = None
try:
    with open(os.path.join(KOK, "ada-beklenti-gecmis.jsonl"), encoding="utf-8") as f:
        for sat in f:
            if sat.strip():
                kayit = json.loads(sat)
                if kayit.get("taban"):
                    TABAN = kayit
except FileNotFoundError:
    pass
ADA_KIYAS = []
for i, gun in enumerate((14, 28), start=1):
    t = PR87 + datetime.timedelta(days=gun)
    veri_bit = t - datetime.timedelta(days=GSC_GECIKME)
    pr_sonrasi = max(0, min(PENCERE, (veri_bit - PR87).days))
    pay = round(100 * pr_sonrasi / PENCERE)
    ADA_KIYAS.append(t)
    is_ = (f"Ada beklentisi kıyası {i}/2: KARNE_SCRATCH ile python3 ada-beklenti-uret.py → "
           f"ada-beklenti-gecmis.jsonl'e kıyas satırı düşer, tabanla yan yana okunur.")
    if TABAN:
        neden = (f"Taban — {TABAN['etiket']}: ada sayfaları beklenen tıkın %{round(100 * TABAN['ada_oran'])} "
                 f"kadarını getiriyor ({tr_sayi(TABAN['ada_tik'])} tık, beklenen {tr_sayi(TABAN['ada_beklenen'])}); "
                 f"aynı sorguda site sayfasıyla yan yana çıktığı {tr_sayi(TABAN['ortak_sorgu'])} sorguda gösterimin "
                 f"%{tr_sayi(TABAN['ortak_ada_pay'], 1)} kadarı ada sayfasına gidiyor. ")
    else:
        neden = "Taban kaydı bulunamadı (ada-beklenti-gecmis.jsonl). "
    neden += (f"PR #87 ({tr_tarih(PR87)}, sitemap tazelik sinyali) sonrası bu payın düşmesi bekleniyor. "
              f"Bu günkü 28 günlük pencerede PR sonrası gün payı %{pay} (GSC {GSC_GECIKME} gün geriden gelir); "
              + ("ilk okuma yön verir, karar ikinci okumada." if i == 1 else "bu okuma karar okumasıdır."))
    ekle(t, is_, neden, f"{PR87_KAYNAK} + ada-beklenti-gecmis.jsonl taban kaydı + ada-beklenti-uret.py docstring", "Claude")

# --- PR #88: GA4 konum boyutu ilk okuma ---
TS = yukle("tik-sonrasi.json")
PR88, PR88_KONU, PR88_KAYNAK = git_tarih("#88", TS.get("guncelleme", iso(BUGUN)), "PR #88")
t = PR88 + datetime.timedelta(days=GA4_ILK_OKUMA_GUN)
_ga4_kaynak = os.path.join(REPO, "scripts", "ga4-api.mjs")
try:
    with open(_ga4_kaynak, encoding="utf-8") as f:
        GA4_KONUM_VAR = "konum" in f.read()
except FileNotFoundError:
    GA4_KONUM_VAR = False
temas = TS.get("temas", {})
is_ = (f"GA4 'konum' özel boyutu ilk okuma: node scripts/ga4-api.mjs olaylar {GA4_ILK_OKUMA_GUN} — "
       f"phone_click ve whatsapp_click hangi sayfadan, hangi bağdan geliyor.")
if not GA4_KONUM_VAR:
    is_ += " Betikte konum kırılımı henüz yok; önce olaylar komutuna konum boyutu eklenir."
neden = (f"PR #88 ({tr_tarih(PR88)}) ile telefon bağlarının tamamı tek olay adı ve konum parametresiyle "
         f"izleniyor; öncesinde bağların bir kısmı hiç sayılmıyordu. Özel boyut geriye dönük çalışmaz, "
         f"anlamlı ilk okuma yayından {GA4_ILK_OKUMA_GUN} gün sonra. Eski tanımla 28 günde phone_click "
         f"{tr_sayi(temas.get('phone_click'))}, whatsapp_click {tr_sayi(temas.get('whatsapp_click'))} "
         f"sayılmıştı; taban sıfırlandığı için bu rakamlarla kıyas yapılmaz, sadece hangi konum kaç tık "
         f"getiriyor okunur.")
ekle(t, is_, neden, f"{PR88_KAYNAK} + PROTOKOL-gece.md 02.09 (GA4 açıldı) + tik-sonrasi.json", "Claude")

# --- beklenen düşüşler sınaması ---
YM, YM_KONU, YM_KAYNAK = git_tarih("#79", "2026-08-27", "Yenimahalle kaldırma (#79)")
YAZI, YAZI_KONU, YAZI_KAYNAK = git_tarih("24 genel konulu blog", "2026-08-07", "yazıların kapatılması")
SO = yukle("sonuc-ozeti.json")
STV = yukle("sayfa-turu-verimi.json")
_blog = next((s for s in STV["satirlar"] if s["tur"] == "blog"), None)
ym_tik = SO["ayrim"]["yenimahalle"]["simdi"]["tik"]
top_tik = SO["simdi"]["tik"]
er_tik = SO["ayrim"]["eryaman"]["simdi"]["tik"]
t = YM + datetime.timedelta(days=PENCERE + GSC_GECIKME)
# Ada kıyasının ikinci okumasıyla bir-iki gün içindeyse aynı tura bindirilir: iki
# ayrı GSC çekimi yerine tek çekim, tek karne.
if ADA_KIYAS and abs((t - ADA_KIYAS[-1]).days) <= 2:
    t = ADA_KIYAS[-1]
is_ = ("Beklenen düşüşler sınaması: python3 sonuc-ozeti-uret.py ve sayfa-turu-verimi.py yeniden; "
       "toplam tık çizgisi inmiş olmalı, Eryaman satırı inmemiş olmalı.")
neden = (f"Yenimahalle sayfaları {tr_tarih(YM)} günü siteden kaldırıldı (410 dönüyor); son 28 günde "
         f"toplam {tr_sayi(top_tik)} tıkın {tr_sayi(ym_tik)} tıkı (%{round(100 * ym_tik / top_tik)}) oradandı. ")
if _blog:
    neden += (f"Yazılar: {tr_sayi(_blog['sayfa'])} sayfa, {tr_sayi(_blog['gos'])} gösterim / "
              f"{tr_sayi(_blog['tik'])} tık; 24 genel yazı {tr_tarih(YAZI)} günü kapatılmıştı, o da eriyecek. ")
neden += (f"Bu gün, kaldırmadan sonraki ilk tam 28 günlük pencerenin okunabildiği gündür "
          f"(GSC {GSC_GECIKME} gün geriden gelir). Ölçüt Eryaman satırı: son 28 günde {tr_sayi(er_tik)} tık; "
          f"toplam iner ama Eryaman inmezse plan tutuyor, Eryaman da inerse gerçek sorun var.")
ekle(t, is_, neden, f"{YM_KAYNAK} + sonuc-ozeti.json ayrim + sayfa-turu-verimi.json", "Claude")

# --- cihaz ve sorgu sınıfı TO yeniden ---
CI = yukle("cihaz.json")
SS = yukle("sorgu-sinifi-to.json")
t_ci = tarih_iso(CI["guncelleme"]) + datetime.timedelta(days=PENCERE)
t_ss = tarih_iso(SS["guncelleme"]) + datetime.timedelta(days=PENCERE)
mob = CI.get("mobil_pay", {})
yalin = next((s for s in SS["siniflar"] if s["k"] == "yalin"), None)
alici = next((s for s in SS["siniflar"] if s["k"] == "alici"), None)
_ci_donem = CI.get("donem", {})
if t_ci == t_ss:
    is_ = ("Cihaz kırılımı ve sorgu sınıfı TO yeniden: KARNE_SCRATCH ile python3 cihaz-uret.py ve "
           "python3 sorgu-sinifi-to.py (sorgular28.tsv taze çekilmiş olmalı).")
    kaynak = "cihaz.json + sorgu-sinifi-to.json guncelleme alanları"
else:
    is_ = "Cihaz kırılımı yeniden: KARNE_SCRATCH ile python3 cihaz-uret.py."
    kaynak = "cihaz.json guncelleme alanı"
neden = (f"{kisa(CI['guncelleme'])} ölçümü tek pencere ({kisa(_ci_donem.get('bas', ''))}–"
         f"{kisa(_ci_donem.get('bit', ''))}); önceki dönem mülkün rampasına değdiği için "
         f"dönem farkı büyümeyi değil rampayı ölçüyordu. İkinci bağımsız 28 günlük pencere bu gün dolar. "
         f"Taban: telefon gösterim payı %{tr_sayi(mob.get('gos'), 1)}, tık payı %{tr_sayi(mob.get('tik'), 1)}")
if yalin and alici:
    neden += (f"; yalın site adı sınıfı TO %{tr_sayi(yalin['to'], 1)} (konum {tr_sayi(yalin['poz'], 1)}), "
              f"alıcı niyeti TO %{tr_sayi(alici['to'], 1)} (konum {tr_sayi(alici['poz'], 1)})")
neden += ". Yenimahalle kalıntısı bu ikinci pencerede artık yok, Eryaman'a özgü ilk temiz okuma."
ekle(t_ci, is_, neden, kaynak + " + cihaz.json uyarıları", "Claude")
if t_ss != t_ci:
    ekle(t_ss, "Sorgu sınıfı TO yeniden: KARNE_SCRATCH ile python3 sorgu-sinifi-to.py.",
         f"{kisa(SS['guncelleme'])} ölçümünün ikinci bağımsız 28 günlük penceresi bu gün dolar.",
         "sorgu-sinifi-to.json guncelleme alanı", "Claude")

# ---------------- sırala, yaz ----------------
ISLER.sort(key=lambda k: (k["tarih"], k["_oncelik"]))
for k in ISLER:
    del k["_oncelik"]

if KALAN == 0:
    # 06.09: kuyruk ilk kez tamamen boşaldı; tempo/bitiş hesabı None döner, tr_tarih(None) patlar.
    UYARILAR.append("Dizin damlası kuyruğu tamamlandı (açık madde 0); tempo ve bitiş hesabı artık "
                    "anlamsız, yeni kuyruk açılırsa yeniden hesaplanır.")
elif ORT_ISTEK is not None and ORT_ISTEK < KOTA_GUN and DAMLA_BIT_GOZLENEN and DAMLA_BIT:
    UYARILAR.append(
        f"Gözlenen tempo kotanın altında: {', '.join(f'{g} günü {n} istek' for g, n in sorted(ISTEK_GUN.items()))} "
        f"(ortalama {tr_sayi(ORT_ISTEK, 1)}); bu tempoyla damla {tr_tarih(DAMLA_BIT_GOZLENEN)} günü biter, "
        f"kotayla {tr_tarih(DAMLA_BIT)}. Düşük günün sebebi kayan 24 saat sınırıydı, kalıcı tempo değil.")
UYARILAR.append(f"GSC verisi {GSC_GECIKME} gün geriden gelir; pencere hesapları buna göre kaydırıldı.")

CIKTI = {
    "guncelleme": iso(BUGUN),
    "uretim": "is-takvimi-uret.py",
    "damla": {
        "acik": KALAN,
        "kota_gun": KOTA_GUN,
        "baslangic": iso(DAMLA_BAS),
        "bitis_kota": iso(DAMLA_BIT) if DAMLA_BIT else None,
        "gun_sayisi": DAMLA_GUN,
        "istek_gunluk": ISTEK_GUN,
        "ortalama_istek": round(ORT_ISTEK, 1) if ORT_ISTEK is not None else None,
        "bitis_gozlenen": iso(DAMLA_BIT_GOZLENEN) if DAMLA_BIT_GOZLENEN else None,
        "kendiliginden_dizine_giren": KENDILIGINDEN,
        "yeniden_denetimde_dizinde": ZATEN_DIZINDE,
        "bitmis": len(BITMIS),
        "adressiz_satir": ADRESSIZ,
    },
    "gbp_kutu": {
        "mahalle": GBP_MAH, "etap": GBP_ETAP, "haric_kutu_cikmiyor": GBP_HARIC,
        "zaten_kutuda": GBP_ZATEN, "sorgu_sayisi": len(BIZ_YOK),
    },
    "turetilen_tarihler": {  # hepsi veriden/git'ten okundu; yedek kullanıldıysa uyarilar'da yazar
        "title_donuk": iso(TITLE_DONUK) if TITLE_DONUK else None,
        "pr87": iso(PR87), "pr88": iso(PR88), "yenimahalle_kaldirma": iso(YM), "yazilar_kapatma": iso(YAZI),
    },
    "uyarilar": UYARILAR,
    "isler": ISLER,
}
with open(os.path.join(KOK, "is-takvimi.json"), "w", encoding="utf-8") as f:
    json.dump(CIKTI, f, ensure_ascii=False, indent=1)
    f.write("\n")

print(f"is-takvimi.json: {len(ISLER)} iş, damla {KALAN} açık → {DAMLA_BAS:%d.%m}–"
      f"{DAMLA_BIT:%d.%m} (kota {KOTA_GUN}/gün)" if DAMLA_BIT else
      f"is-takvimi.json: {len(ISLER)} iş, damla kuyruğu boş")
for u in UYARILAR:
    print("UYARI:", u)
