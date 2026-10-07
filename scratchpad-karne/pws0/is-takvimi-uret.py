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
                     işaretlerinden sayılır. Açık satırın TÜRÜ satir_turu() ile
                     belirlenir (08.10 ortak kuralı, üç okuyucuda aynı): eski_adres /
                     dizin_disi / yeniden_tarama. Yalnız dizin_disi "Google'da yok"
                     gerekçesiyle basılır; "- [~]" satırları hiçbir sayıma girmez.
  • kutu listesi   : hedef-sorgular.json (kutu_var ve kutuda == 0)
  • tarama denetimi: damla dosyasındaki mahalle sayfası isteklerinin tarihi + 3 / + 4
  • title donması  : eryaman-emlakci.json title_donuk (yedek: PROTOKOL-gece.md'deki
                     "…'a kadar başlık/H1 deneyi YAPILMAZ" cümlesi). 08.10'dan beri bu
                     tarihe iş BAĞLANMIYOR (bkz. "07.09" bölümü); alan yalnız
                     turetilen_tarihler'de durur.
  • defter takvimi : kaldirac-defteri.json kayıtlarındaki "takvim" listeleri
                     (yeni tarihli iş için koda dokunulmaz, deftere yazılır)
  • ada kıyasları  : PR #87 commit tarihi (git log) + 14 / + 28
  • GA4 konum      : PR #88 commit tarihi (git log) + 14
  • beklenen düşüş : Yenimahalle kaldırma commit'i (#79) + 28 + GSC gecikmesi
  • cihaz / sınıf  : cihaz.json ve sorgu-sinifi-to.json guncelleme + 28
Git'e ulaşılamazsa yedek tarih kullanılır ve kaynak alanına "(yedek tarih)" düşülür.

Çıktı: is-takvimi.json — {guncelleme, damla, gbp_kutu, uyarilar, isler[]}
       isler[i] = {tarih (ISO, sıralama için), tarih_tr, is, neden, kaynak, kim, ayrinti?,
                   bitis?, bitis_tr? (günlerce süren iş)}
       damla.acik = istek kuyruğu (dizin dışı + yeniden tarama); damla.acik_tur = üç türün sayısı
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
TUR_AD = {"dizin_disi": "dizin dışı", "yeniden_tarama": "yeniden tarama bekleyen", "eski_adres": "eski adres"}


def satir_turu(url, not_):
    """Açık "- [ ] https://…" satırının türü — 08.10 ORTAK KURALI. Aynı kural
    karne-html.py ve yonetici-ozeti-uret.py'de de var; biri değişirse üçü değişir.

      eski_adres     : adres yolu eski şemada — /mahalleler/<slug>/… ve <slug>
                       "-mahallesi" ile bitmiyor (26.07 taşımasından önceki adres, 308 verir)
      dizin_disi     : değilse, satırdaki "←" sonrası notta "dizin dışı" geçiyor
      yeniden_tarama : geri kalanı (sayfa dizinde; içeriği/başlığı değişti)

    NEDEN: üç okuyucu da her açık satırı "Google'da yok" sayıyordu. 08.10'da 4 açık
    satırın 2'si dizindeydi, 2'si eski adresti, API'ye göre dizin dışı sayfa 0'dı;
    karne yine de "her sayfa dizin dışı doğrulandı" gerekçesiyle iş basıyordu.
    """
    m = re.search(r"/mahalleler/([^/?#\s]+)/", url)
    if m and not m.group(1).endswith("-mahallesi"):
        return "eski_adres"
    # .lower() Türkçe I/İ'de bozulur ("DİZİN DIŞI" eşleşmez) — tranahtar.anahtar şart.
    # anahtar() ı'yı da i'ye indirger; bu yüzden aranan ifade de aynı süzgeçten geçer.
    if tranahtar.anahtar("dizin dışı") in tranahtar.anahtar(not_ or ""):
        return "dizin_disi"
    return "yeniden_tarama"


def damla_oku():
    """DIZIN-DAMLASI-31-08.md → açık kayıtlar (dosya sırası = kuyruk sırası),
    bitmiş kayıtlar (tarih + açıklama), adressiz satır sayısı.

    Dosyada bazı açıklama satırlarının ("_hiç bilinmiyor_") üstünde URL yok —
    31.08 kurulumundan geliyor. Bunlar kuyrukta sayılmaz ama uyarı olarak raporlanır:
    sayı "kalan" ile oynamasın diye sessizce yutulmuyor.

    Sayılmayanlar: "- [ ]" olup https içermeyen satırlar (07.09 slug listesi) ve
    "- [~]" satırları (bilerek vazgeçilen istek) — desen ikisini de yakalamaz.
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
                not_ = m.group(2).strip(" ←").strip()
                son = {"url": m.group(1), "mah": mah, "not": not_,
                       "tur": satir_turu(m.group(1), not_), "durum": ""}
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

KD = yukle("kaldirac-defteri.json")

# Türlere ayır (satir_turu). İstek kuyruğu = dizin_disi + yeniden_tarama, dosya sırasıyla.
# eski_adres satırı kuyruğa GİRMEZ: eski adrese istek kaldıracı defterde ölü; satır
# yalnız sayılır ve uyarı olarak gösterilir (karar elle verilir, takvim iş basmaz).
ACIK_TUR = {t: [a for a in ACIK if a["tur"] == t] for t in TUR_AD}
KUYRUK = [a for a in ACIK if a["tur"] != "eski_adres"]
_eski_k = next((k for k in KD["kaldiraclar"] if k["ad"].startswith("Eski adresi yeniden taratma")), None)
_DURUM_AD = {"olu": "ölü", "curuk": "çürük", "acik": "açık", "kanitli": "kanıtlı", "dogrulandi": "doğrulandı"}
if ACIK_TUR["eski_adres"]:
    _d = (_eski_k or {}).get("durum")
    UYARILAR.append(
        f"DIZIN-DAMLASI-31-08.md içinde {len(ACIK_TUR['eski_adres'])} açık satır eski adres (26.07 taşımasından "
        f"önceki şema): istek kuyruğuna alınmadı. Eski adrese istek kaldıracının defterdeki durumu: "
        f"{_DURUM_AD.get(_d, _d) if _d else 'kayıt yok'}.")
if ACIK and not ACIK_TUR["dizin_disi"]:
    UYARILAR.append(
        f"Açık {len(ACIK)} satırın hiçbiri dizin dışı değil ({len(ACIK_TUR['yeniden_tarama'])} yeniden tarama "
        f"bekleyen, {len(ACIK_TUR['eski_adres'])} eski adres); 'Google'da yok' sayısı 0.")

KALAN = len(KUYRUK)
DAMLA_GUN = math.ceil(KALAN / KOTA_GUN) if KALAN else 0
DAMLA_BIT = DAMLA_BAS + datetime.timedelta(days=DAMLA_GUN - 1) if DAMLA_GUN else None
ORT_ISTEK = (sum(ISTEK_GUN.values()) / len(ISTEK_GUN)) if ISTEK_GUN else None
DAMLA_BIT_GOZLENEN = (DAMLA_BAS + datetime.timedelta(days=math.ceil(KALAN / ORT_ISTEK) - 1)
                      if (ORT_ISTEK and KALAN) else None)

ISLER = []


def ekle(tarih, is_, neden, kaynak, kim, oncelik=1, ayrinti=None, bitis=None):
    """bitis: iş birden çok güne yayılıyorsa son günü (tek satır basılır, tarih = ilk gün)."""
    kayit = {"tarih": iso(tarih), "tarih_tr": tr_tarih(tarih), "is": is_, "neden": neden,
             "kaynak": kaynak, "kim": kim, "_oncelik": oncelik}
    if bitis is not None:
        kayit["bitis"] = iso(bitis)
        kayit["bitis_tr"] = tr_tarih(bitis)
    if ayrinti is not None:
        kayit["ayrinti"] = ayrinti
    ISLER.append(kayit)


# --- damla günleri ---
# Gerekçe TÜRE göre basılır (08.10): "API ile dizin dışı doğrulandı, tek ilacı dizine
# girmek" cümlesi yalnız dizin_disi satırları için doğrudur. Dizindeki sayfaya giden
# istek yeniden tarama isteğidir; onu "Google'da yok" diye göstermek karneyi yanıltıyordu.
for gun_no in range(DAMLA_GUN):
    bas_i = gun_no * KOTA_GUN
    dilim = KUYRUK[bas_i:bas_i + KOTA_GUN]
    kalan_once = KALAN - bas_i
    kalan_sonra = kalan_once - len(dilim)
    t = DAMLA_BAS + datetime.timedelta(days=gun_no)
    ilk = dilim[0]
    n_dd = sum(1 for a in dilim if a["tur"] == "dizin_disi")
    n_yt = len(dilim) - n_dd
    if n_dd and n_yt:
        bas = f"Dizin isteği: {len(dilim)} istek gönder ({n_dd} dizin dışı, {n_yt} yeniden tarama)"
    elif n_dd:
        bas = f"Dizin damlası: {len(dilim)} istek gönder"
    else:
        bas = f"Yeniden tarama isteği: {len(dilim)} sayfa"
    is_ = (f"{bas}, {slug_ad(ilk['url'])} ile başla. "
           f"Kuyrukta {kalan_once} sayfa açık, gün sonunda {kalan_sonra} kalır.")
    if gun_no == 0:
        parca = []
        if n_dd:
            parca.append(f"Dizin dışı {n_dd} sayfa: her biri Search Console API ile dizin dışı doğrulandı ve "
                         f"28 günde sıfır gösterim aldı; tek ilacı dizine girmek. İstek, dizin dışı sayfada "
                         f"aynı gün tarama getiriyor (damla turları).")
        if n_yt:
            parca.append(f"Yeniden tarama {n_yt} sayfa: dizinde, içeriği/başlığı değişti; yeniden tarama isteği. "
                         f"Bu sayfalar Google'da var, eksik olan yeni hâllerinin okunması. Dizindeki sayfaya "
                         f"istek de tarama getiriyor (kaldıraç defteri 'Dizin isteği damlası', 04.10 eki).")
        parca.append(f"Kota günde yaklaşık {KOTA_GUN} istek ve takvim günü değil kayan 24 saat: dünkü istekler "
                     f"sabah gittiyse pencere ertesi gün aynı saatten sonra açılır; 'sorun oluştu' balonu kota "
                     f"dolu demektir, tekrar basılmaz. Kota bütün isteklerde ortaktır: aynı güne yazılı başka "
                     f"istek işi varsa toplam bu sayıyı geçmez.")
        neden = " ".join(parca)
        if ilk["not"]:
            neden += f" İlk sıradaki sayfanın kuyruk notu: {ilk['not']}"
    else:
        # Aynı gerekçeyi beş gün art arda basmak okuyucuyu boğar; ilk günde tam hâli var.
        neden = f"Kuyruk devam ediyor; gerekçe ve kota kuralı ilk damla gününde ({tr_tarih(DAMLA_BAS)})."
    ekle(t, is_, neden,
         "DIZIN-DAMLASI-31-08.md (açık satırlar, dosya sırası; tür satir_turu ile) + "
         "kaldirac-defteri.json 'Dizin isteği damlası'",
         "Claude", oncelik=0,
         # durum: karne satırın yanına basar. Satırın altında açıklama yoksa (yeniden tarama
         # satırlarında yok) kuyruk notu gösterilir; tür her durumda başta yazar.
         ayrinti=[{"url": a["url"], "tur": a["tur"],
                   "durum": TUR_AD[a["tur"]] + (f" · {a['durum'] or a['not']}" if (a["durum"] or a["not"]) else "")}
                  for a in dilim])

# "Kuyruk tükenir → görünmezleri API'ye sor" işi yalnız DİZİN DIŞI kuyruk varken anlamlı:
# biten odur. Açık satırların hepsi yeniden tarama ise dizin dışı kuyruk zaten boştur ve
# bu iş boş yere yazılır (08.10'da 4 açık satırın hiçbiri dizin dışı değilken 09.10'a yazılıyordu).
if DAMLA_BIT and ACIK_TUR["dizin_disi"]:
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
    # 08.10: burada öncelik-1 bir madde vardı — "Title/H1 donması biter. İlk iş: 'eryaman
    # emlakçı' için ana sayfa meta description (ve gerekirse title) yeniden kurulur". Madde
    # d1/d3 tıklanma oranı farkını "sorun snippet'te" diye okuyordu. Ölçüm bunu taşımıyor:
    # günlük gösterim iki dönemde neredeyse aynı, fark birkaç tık ve rastlantıdan ayrılmıyor
    # (eryaman-emlakci.json donem_farki); organik sıra da sabit değildi, yükselmişti. Madde
    # KALDIRILDI ve yerine tıklık eşik KONMADI; başlığa/açıklamaya dokunulmuyor. Yeniden açma
    # koşulu kaldıraç defterinde: "Ana sayfa başlık/açıklama değişikliği" kaydının kisit alanı.
    #
    # Kaldıraç defterinde bu tarihe bağlanmış, HENÜZ BAKILMAMIŞ bir iş var mı?
    # 08.10: koşul "kisit ya da olcum metninde 07.09 geçiyor" idi ve üç kayıt eşleşiyordu —
    # ikisi tarih rastlantısı ("API denetimi 07.09 02:30", "28g GSC, 07.09-04.10"; biri hâlâ
    # koşan Başlık deneyi 2), üçüncüsü 16.08'de yapılmış ada başlığı işi. Karne üçünü de
    # "(çürük) … ikinci başlık işi: ada sayfası başlığı" diye basıyordu. Şimdi üç şart birden:
    # kayıt çürük, kısıt cümlesi 07.09'u anıyor ve iş hâlâ "bakılacak" diye bekliyor.
    for k in KD["kaldiraclar"]:
        if k["ad"] == "Ev sahibi dilli başlık şablonu":
            continue  # bu kayıt donmanın kendisi, iş değil
        _kisit = k.get("kisit", "")
        if k.get("durum") == "curuk" and "07.09" in _kisit and "bakılacak" in _kisit:
            # Kaydın adı çürük kaldıracın adı (ör. canonical); iş o değil, kısıt
            # cümlesinin işaret ettiği başlık işi. Ad yalnız kaynak olarak geçer.
            ekle(TITLE_DONUK,
                 f"Donma bittiğinde ikinci başlık işi: ada sayfası başlığı. Kaldıraç defteri notu: {k.get('kisit','—')}",
                 f"Bağlı kayıt '{k.get('ad','—')}' (çürük) — ölçümü: {k.get('olcum','—')}",
                 f"kaldirac-defteri.json ({k.get('kaynak','—')})", "Claude", oncelik=2)

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

# ---------------- defterdeki tarihli işler (07.10) ----------------
# Kaldıraç defterindeki bir kayıt "takvim": [{"tarih": "2026-10-20", "is": "...",
# "neden": "...", "kim": "Claude"|"Özgün"}] alanı taşıyorsa satırlar buraya girer.
# NEDEN: 07.10 planının 20.10 / 04.11 okumaları yalnız "sonraki_olcum" serbest metninde
# duruyordu; o alan takvime girmediği için 21.09 ve 05.10 okumaları da böyle kaçmıştı
# (defter: okuma_0710 "İlk okuma (21.09/05.10 yapılmamıştı)"). Yeni tarihli iş için
# koda dokunmak gerekmesin: deftere "takvim" yaz, üreticiyi koş.
# İsteğe bağlı alanlar: "oncelik" (aynı gün içinde sıra; küçük önce, varsayılan 2) ve
# "bitis" (ISO; günlerce süren iş tek satırda durur, tarih = ilk gün).
for k in KD.get("kaldiraclar", []):
    for t_ in k.get("takvim", []) or []:
        try:
            _t = tarih_iso(t_["tarih"])
            _b = tarih_iso(t_["bitis"]) if t_.get("bitis") else None
        except (KeyError, ValueError):
            UYARILAR.append(f"Defterde tarihi okunamayan takvim satırı: {k.get('ad', '—')[:60]}")
            continue
        ekle(_t, t_.get("is", "—"), t_.get("neden", k.get("ad", "—")),
             f"kaldirac-defteri.json '{k.get('ad', '—')[:70]}'", t_.get("kim", "Claude"),
             oncelik=t_.get("oncelik", 2), bitis=_b)

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
        # acik = istek kuyruğu (dizin dışı + yeniden tarama). 08.10'a kadar bütün açık
        # satırlar sayılıyordu; eski adres satırı artık kuyrukta değil, acik_tur'da ayrı durur.
        "acik": KALAN,
        "acik_tur": {t: len(v) for t, v in ACIK_TUR.items()},
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

_tur_ozet = ", ".join(f"{TUR_AD[t]} {len(v)}" for t, v in ACIK_TUR.items())
print(f"is-takvimi.json: {len(ISLER)} iş, istek kuyruğu {KALAN} açık ({_tur_ozet}) → {DAMLA_BAS:%d.%m}–"
      f"{DAMLA_BIT:%d.%m} (kota {KOTA_GUN}/gün)" if DAMLA_BIT else
      f"is-takvimi.json: {len(ISLER)} iş, istek kuyruğu boş ({_tur_ozet})")
for u in UYARILAR:
    print("UYARI:", u)
