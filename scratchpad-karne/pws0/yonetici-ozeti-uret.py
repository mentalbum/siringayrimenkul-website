#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Yönetici özeti — karnenin tepesindeki 6 rakam (02.09).

Karne 14 bölüm oldu; Özgün'ün ilk 10 saniyede görmesi gereken altı rakam tek
JSON'da toplanır. Hiçbir rakam elle yazılmaz: her biri bir üreticinin
JSON'undan ya da doğrudan ölçüm dosyasından okunur, kaynağı yanına yazılır.

  1. site sorgularında ilk 3 payı     ← sonuclar-site-emlakci.jsonl + tur-*.json
                                        (karne başlık kartıyla AYNI hesap, aşağıda neden)
  2. ilk 3'te doğru sayfa payı        ← dogru-sayfa.json
  3. GSC 28g Eryaman tıkı             ← sonuc-ozeti.json  (ayrim.eryaman.simdi.tik)
  4. GA4 28g temas eden ZİYARET       ← tik-sonrasi.json  (temas.temas_oturum; tık sayıları
                                        açıklamada. 08.10'a kadar kart tıkı sayıyordu.)
  5. hedef sorgularda kutuda olduğumuz sayı ← hedef-sorgular.json (ozet.kutuda)
  6. dizin kuyruğu: Google'da olmayan ← DIZIN-DAMLASI-31-08.md (açık "- [ ] https://…" satırları,
                                        türü sözleşme S1 ile: dizin dışı / yeniden tarama / eski adres)

Her rakam için: değer, bir cümlelik "ne demek", kaynak, 7 günlük fark.
Fark karne-gecmis-ozet.json'dan OKUNUR; o dosyanın tek sahibi
anlik-goruntu-uret.py (günlük zaman serisi, "metrikler" şeması). 02.09'a kadar
bu betik de aynı dosyayı kendi şemasıyla yazıyordu — son koşan kazanıyor, öteki
bölüm boş kalıyordu; o yüzden yazma kaldırıldı. Eşleme FARK_KAYNAK'ta; seri
yoksa fark null, uydurulmaz.

Yansız örnek (08.10): 1. ve 2. kartın "ne demek" metnine, yansiz-ornek.json varsa ve yansitma
alanı doluysa tek cümle eklenir: "Yansız örneğe göre gerçek değer yaklaşık %X." (yansitma.
tahmini_ilk3_pay / tahmini_dogru_sayfa_pay, tam sayıya yuvarlanır; ayrıntıda yansiz_tahmin).
2. kartta bu cümle "Gerçek oran %A ile %B arasındadır." kapanışının YERİNE geçer (ikisi birlikte
çelişir). Kartın deger/gosterim alanı DEĞİŞMEZ, seri aynı tanımla sürer. Dosya yoksa eski metin.

Ayrıca:
  "bu hafta ne yapıldı"    ← PROTOKOL-gece.md'nin son 7 gündeki bölüm başlıkları
                             (betikle ayıklanır; gün başına bir madde, en yeni 3 gün)
  "bu hafta ne bekleniyor" ← beklenen düşüşler (sonuc-ozeti + sayfa-turu-verimi),
                             14.09 (kaldirac-defteri.json sitemap kaydı: 31.08 + 2 hafta)
                             (08.10: "07.09 başlık dondurması biter, ilk iş ana sayfa snippet'i"
                             maddesi kaldırıldı — yanlış alarmdı, gerekçe aşağıda.)

Çalıştırma (KARNE_SCRATCH gerekmez, hepsi bu klasörden okunur):
  python3 yonetici-ozeti-uret.py  → yonetici-ozeti.json

Sıra: karne-html.py'den ÖNCE, diğer üreticilerden ve anlik-goruntu-uret.py'den
SONRA koşar (onların JSON'unu okur). Hesaplanamayan rakam None kalır ve gosterim "ölçülmedi" olur; uydurulmaz.
"""
import json, math, re, os, sys, datetime, collections

KOK = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, KOK)
from tranahtar import anahtar  # noqa: E402 — Türkçe İ/ı: "DİZİN DIŞI" ile "dizin dışı" aynı sayılsın
BUGUN = datetime.date.today()
AY_AD = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim",
         "Kasım", "Aralık"]


def yol(ad):
    return os.path.join(KOK, ad)


def tr_sayi(n, ondalik=0):
    """Türkçe biçim: binlik nokta, ondalık virgül (karne-html.py ile aynı).

    karne-html.py içe aktarılamaz (modül düzeyinde HTML üretir, adı tireli);
    aynı sayfada iki sayı biçimi görünmesin diye tanım burada tekrarlanır.
    """
    if n is None:
        return "—"
    t = f"{n:,.{ondalik}f}"
    return t.replace(",", "\x00").replace(".", ",").replace("\x00", ".")


def yuzde(a, b):
    return round(100 * a / b) if b else 0


def tr_tarih(iso):
    """'2026-08-29' → '29.08'."""
    return f"{iso[8:10]}.{iso[5:7]}" if iso and len(iso) >= 10 else ""


def gg_aa(d):
    return d.strftime("%d.%m")


UYARILAR = []


# ---------------------------------------------------------------------------
# 1. Site sorgularında ilk 3 payı
# ---------------------------------------------------------------------------
# Karnenin başlık kartı bu rakamı üretici JSON'undan değil, 11 mahalle turunun
# kuyruk dosyalarından hesaplıyor (karne-html.py: OLCULEN / TOPLAM_N / TOPLAM_I3).
# dogru-sayfa.json ise kuyruk-site-emlakci.json'u taban alır.
# Tepe rakam karne başlığıyla AYNI olmalı — aynı sayfada iki ayrı toplam birlikte
# görünürse okuyucu hangisine inanacağını bilemez. O yüzden hesap burada karnenin
# yöntemiyle tekrarlanır; liste karne-html.py TURLAR ile birebir tutulur.
# 08.10: tur dosyaları kuyrukla hizalandı (sitede dosyası olmayan 2 kayıt çıkarıldı,
# kuyrukta olup hiçbir tur dosyasında olmayan 7 kayıt eklendi; 504 → 509). İki taban
# yeniden ayrışırsa 2. rakamdaki uyarı bunu söyler: tur dosyası ya da kuyruk güncellenmeli.
TURLAR = [
    "tur-tunahan-2708.json", "tur-altay-2708.json", "tur-devlet-2708.json",
    "tur-eryaman-2708.json", "tur-goksu-2808.json", "tur-guzelkent-2808.json",
    "tur-sehit-osman-avci-2908.json", "tur-seker-2908.json", "tur-yesilova-2908.json",
    "tur-yavuz-selim-2908.json", "tur-seyh-samil-2908.json",
]


def ilk3_payi():
    son = {}
    for L in open(yol("sonuclar-site-emlakci.jsonl"), encoding="utf-8"):
        if L.strip():
            r = json.loads(L)
            son[r["s"]] = r  # s bazında SON ölçüm geçerli (karne ile aynı)
    n = i3 = 0
    for f in TURLAR:
        gs = [k["s"] for k in json.load(open(yol(f), encoding="utf-8"))]
        g = [son[s] for s in gs if s in son]
        # etap kayıtları ve mahalle sorguları site sorgusu değil (karne ile aynı süzgeç)
        site = [r for r in g if "/" in r["s"] and "/etaplar/" not in r["s"]]
        n += len(site)
        i3 += sum(1 for r in site if 1 <= r["sira"] <= 3)
    return n, i3


# ---------------------------------------------------------------------------
# 6. Damla kuyruğu
# ---------------------------------------------------------------------------
# ORTAK SÖZLEŞME S1 (08.10) — karne-html.py, is-takvimi-uret.py ve anlik-goruntu-uret.py
# AYNI kuralı uygular; biri değişirse dördü birden değişir. Açık "- [ ] https://…" satırı:
#   adres eski şemadaysa (/mahalleler/<slug>… ve <slug> "-mahallesi" ile bitmiyor) → eski_adres
#   değilse "←" sonrası notta "dizin dışı" geçiyorsa                               → dizin_disi
#   değilse                                                                         → yeniden_tarama
# https içermeyen "- [ ]" satırı sayım dışıdır. NEDEN: 08.10'a kadar her açık satır
# "Google'da yok" sayılıyordu; o gün açık 4 satırın 2'si dizindeydi (yeniden tarama
# bekliyordu), 2'si eski adresti, API'ye göre dizin dışı sayfa sıfırdı.
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


def damla_sayimi():
    metin = open(yol("DIZIN-DAMLASI-31-08.md"), encoding="utf-8").read()
    tur = {"dizin_disi": 0, "yeniden_tarama": 0, "eski_adres": 0}
    for L in metin.splitlines():
        t = damla_satir_turu(L)
        if t:
            tur[t] += 1
    bitmis = len(re.findall(r"^- \[x\] https://\S+", metin, re.M))
    return tur, bitmis


# ---------------------------------------------------------------------------
# Geçmiş (7 günlük fark) — karne-gecmis-ozet.json'dan yalnız OKUNUR
# ---------------------------------------------------------------------------
# 02.09: bu betik dosyayı kendisi yazıyordu ({"kayitlar": [...]} şeması); aynı
# dosyayı anlik-goruntu-uret.py de {"metrikler": {...}} şemasıyla yazıyor ve son
# koşan ötekinin çıktısını siliyordu. Tek sahip artık anlık üretici; burada
# yalnız eşleme var: tepe rakam → serideki metrik(ler). Serinin "onceki"si tam
# D-7, yoksa en çok 3 gün geriye en yakın nokta (7-10 gün) — "yedi günlük fark"
# adına uygun.
# 08.10: temas kartı tık yerine temas eden ZİYARETİ sayar (aynı ziyaretçi tek ziyarette
# üç kez basabiliyor: 28 günde 21 tık 15 ziyaretten geldi). Seri temas_oturum_28
# (anlik-goruntu-uret.py ga4-temas.mjs ile geri doldurur). tik-sonrasi.json eski sürümse
# (temas_oturum yok) kart ve fark eski tık serisine döner, uyarı basılır.
# Dizin kuyruğu kartı yalnız "dizin dışı" türündeki satırları sayar; serisi damla_dizin_disi.
GECMIS_DOSYA = "karne-gecmis-ozet.json"
FARK_KAYNAK = {
    "ilk3_pay": ["ilk3_pay"],
    "dogru_sayfa_pay": ["dogru_sayfa_pay"],
    "gsc_eryaman_tik": ["eryaman_tik_28"],
    "ga4_temas": ["temas_oturum_28"],
    "hedef_kutuda": ["hedef_kutuda"],
    "damla_kalan": ["damla_dizin_disi"],
}
FARK_KAYNAK_TIK = ["phone_click_28", "whatsapp_click_28"]   # eski tik-sonrasi.json için yedek
FARK_NOTU = {
    "ga4_temas": "telefon ya da WhatsApp düğmesine basan ziyaret (yalnız canlı alan adı); form gönderimi ayrı sayılır",
    # 08.10 (eski-1 + ye-1 f): 04-07.10 deney taraması yalnız Eylül'de sorunlu çıkan sorguları
    # yeniden ölçtü; doğru sayfa payı o hafta +11 puan "iyi" basacaktı. Not yalnız seri
    # "seçici yeniden ölçüm" bayrağını kaldırdığında basılır ve rakamları seriden alır
    # (kaç sorgu, kaçı önceden doğruydu, önceki ölçüm ne zamandı) — sabit tarih/rakam yazılmaz,
    # pencere geçince not kendiliğinden düşer.
    "dogru_sayfa_pay": "fark o günden beri birikmiş sindirim ve ölçüm tazelemesidir, bu haftanın kazancı değil",
}
FARK_NOTU_KOSULU = {"dogru_sayfa_pay": "secici_yeniden_olcum"}   # yalnız bu rejim nedeni işaretliyse
NEDEN_KISA = {
    "bolge_turu": "önceki nokta 27.08 öncesi turdan",
    "kanal_etiketi": "önceki nokta kanal etiketi taşımayan ölçümlerden",
    "secici_yeniden_olcum": "yalnız bir kesim yeniden ölçüldü, fark tek yönlü",
    "tanim_degisti": "sayım tanımı değişti",
}
GURULTU_Z = 2.0                          # anlik-goruntu-uret.py ile AYNI eşik
# Seçici yeniden ölçüm eşikleri — anlik-goruntu-uret.py ile AYNI ad ve değer (iki kopya birlikte değişir).
SECICI_MIN = 20                          # en az bu kadar sorgu yeniden ölçüldüyse hüküm verilir
SECICI_ESIK = 25                         # "önceden doğru" payı kuyruk genelinden bu kadar puan ayrışırsa seçicidir
ARALIK_EN_COK = 30                       # "gerçek oran %A ile %B arasında" yalnız aralık bu kadar puandan darsa basılır
TEL_IZLEME_TARIH = datetime.date(2026, 9, 2)   # telefon bağı izlemesi genişledi; öncesini içeren pencere eksik sayar


def gecmis_oku():
    try:
        g = json.load(open(yol(GECMIS_DOSYA), encoding="utf-8"))
    except (FileNotFoundError, json.JSONDecodeError):
        return None
    return g if isinstance(g.get("metrikler"), dict) else None


def gurultu_birlestir(parcalar):
    """Temas farkı gürültüden ayrılıyor mu? — anlik-goruntu-uret.py'deki kuralın AYNISI.

    7 gün arayla iki 28 günlük pencere 21 günü paylaşır; fark = giren hafta − çıkan hafta.
    z = (giren − N·p) / √(N·p·(1−p)), N = giren + çıkan, p = giren haftanın oturum payı;
    |z| < 2 ise fark gürültü bandındadır. Üretici her seriye giren/çıkan sayılarını yazar
    (metrik.gurultu); birden çok seri toplanıyorsa (telefon + WhatsApp) sayılar toplanıp z
    burada yeniden hesaplanır. Bir parçada bile yoksa None: sınanamadı."""
    gs = [p.get("gurultu") for _, p in parcalar]
    if not gs or any(g is None for g in gs):
        return None
    og, oc = gs[0].get("oturum_giren"), gs[0].get("oturum_cikan")
    if not og or not oc or any((g.get("oturum_giren"), g.get("oturum_cikan")) != (og, oc) for g in gs):
        return None
    giren, cikan = sum(g["giren"] for g in gs), sum(g["cikan"] for g in gs)
    n, p = giren + cikan, og / (og + oc)
    z = (giren - n * p) / math.sqrt(n * p * (1 - p)) if n else 0.0
    return {"z": round(z, 2), "giren": giren, "cikan": cikan, "oturum_giren": og, "oturum_cikan": oc,
            "olcu": gs[0].get("olcu"), "bant": abs(z) < GURULTU_Z}


def fark_kur(gecmis, k, birim):
    """Tepe rakam k için 7 günlük fark; seri eksikse None."""
    parcalar = [(m, (gecmis or {}).get("metrikler", {}).get(m)) for m in FARK_KAYNAK.get(k, [])]
    if not parcalar or any(p is None or p.get("onceki") is None or p.get("son") is None for _, p in parcalar):
        return None
    tarihler = {p["onceki_tarih"] for _, p in parcalar}
    if len(tarihler) != 1:
        return None  # parçalar farklı güne kıyaslanıyorsa toplanmaz
    onceki_tarih = tarihler.pop()
    son = sum(p["son"] for _, p in parcalar)
    onceki = sum(p["onceki"] for _, p in parcalar)
    fark = round(son - onceki, 2)
    artis = {p["artis"] for _, p in parcalar}
    if len(artis) != 1:
        return None
    artis = artis.pop()
    yon = "nötr" if fark == 0 else ("iyi" if (fark > 0) == (artis == "iyi") else "kötü")
    # SERP serisinde 27.08 öncesi nokta başka ölçüm rejiminden (bölge turu payı
    # %0 → %99): fark gerçek hareket değil; işaretlenir, iyi/kötü diye okunmaz.
    # Üretici artık hükmü kendisi yazıyor (olcum_yontemi_degisti: SERP'te bölge turu payı,
    # hedefte kanal etiketi payı); eski özet JSON'da alan yoksa SERP kuralı burada yinelenir.
    rejim = any(p.get("olcum_yontemi_degisti") for _, p in parcalar) or any(
        p.get("olcum_yontemi_degisti") is None
        and p.get("onceki_bolge_turu_pay") is not None and p.get("son_bolge_turu_pay") is not None
        and abs(p["son_bolge_turu_pay"] - p["onceki_bolge_turu_pay"]) >= 50 for _, p in parcalar)
    # Neden: üretici rejim_nedeni listesini yazar (bolge_turu / kanal_etiketi /
    # secici_yeniden_olcum / tanim_degisti). Eski özet JSON'da alan yoksa SERP kuralı varsayılır.
    nedenler = []
    for _, p in parcalar:
        if p.get("olcum_yontemi_degisti"):
            nedenler += [n for n in (p.get("rejim_nedeni") or []) if n not in nedenler]
    if rejim and not nedenler:
        nedenler = ["bolge_turu"]
    notlar = [FARK_NOTU[k]] if k in FARK_NOTU and k not in FARK_NOTU_KOSULU else []
    # 08.10 onarım: seri, SERP metriklerinde 7 gün önceki nokta o gün bayat girdiyle basıldıysa kıyası
    # aynı dosyadan yeniden hesaplanan değerle yapar (onceki_karnede_basilan = o gün karnede yazan).
    # Okuyan geçen haftaki karnede başka rakam gördüyse nedenini burada bulur.
    basilan = None
    if len(parcalar) == 1 and parcalar[0][1].get("onceki_karnede_basilan") is not None:
        basilan = parcalar[0][1]["onceki_karnede_basilan"]
        on = "%" if birim == "%" else ""
        notlar.append(f"{tr_tarih(onceki_tarih)} karnesinde bu rakam {on}{tr_sayi(basilan, 1)} basılmıştı (o gün ölçüm "
                      f"dosyasının tamamı okunmamıştı ya da sayım kuralı farklıydı); kıyas, aynı dosyadan bugünkü "
                      f"kuralla yeniden hesaplanan {on}{tr_sayi(onceki, 1)} ile yapıldı")
    # Temas: gürültü kuralı (yalnız bu kart; sayılar küçük, pencereler 21 gün örtüşüyor)
    gurultu = None
    if k == "ga4_temas":
        if (datetime.date.fromisoformat(onceki_tarih) - datetime.timedelta(days=28)) < TEL_IZLEME_TARIH:
            notlar.append(f"kıyas penceresi {gg_aa(TEL_IZLEME_TARIH)} öncesini içeriyor: o tarihe kadar telefon "
                          f"bağlarının bir kısmı izlenmiyordu, ihtiyatla oku")
        if fark:
            gurultu = gurultu_birlestir(parcalar)
            if gurultu:
                if gurultu["bant"]:
                    yon = "nötr"
                notlar.append(("gürültü bandında" if gurultu["bant"] else "gürültü bandının dışında") +
                              f" (z={tr_sayi(gurultu['z'], 2)}; oturum düzeltmeli)")
            else:
                # sınanmamış küçük sayı farkına iyi/kötü denmez (−3 tık için kırmızı ok yanıltır)
                yon = "nötr"
                notlar.append("gürültü sınaması yapılamadı (haftalık dilim yok ya da kıyas tam 7 gün değil); "
                              "yön basılmadı")
    for n in nedenler:
        if n == "secici_yeniden_olcum":
            sec = next((p["secici_yeniden_olcum"] for _, p in parcalar if p.get("secici_yeniden_olcum")), None)
            if sec and sec.get("not"):
                metin = sec["not"]
                oo = sec.get("onceki_olcum")
                if oo:
                    metin += f"; bu sorguların önceki ölçümü {tr_tarih(oo['bas'])}–{tr_tarih(oo['bit'])} arasındaydı"
                notlar.append(metin)
        elif n == "tanim_degisti":
            notlar += [p["tanim_notu"] for _, p in parcalar if p.get("tanim_notu")]
        elif n == "kanal_etiketi":
            notlar.append("ölçüm yöntemi değişti: önceki nokta kanal etiketi taşımayan (27.08 öncesi) ölçümlerden")
        else:
            notlar.append("ölçüm yöntemi değişti: önceki nokta 27.08 öncesi turdan, sonuç aynı rejimde değil")
        if FARK_NOTU_KOSULU.get(k) == n:
            notlar.append(FARK_NOTU[k])
            # eski-1: üç rakam BİRLİKTE okunur — doğru sayfa payı yükselirken aynı yeniden ölçüm
            # ilk 3 payını ve ilk 10 dışını da oynattı; yalnız iyi haber basılmaz. Rakamlar seriden.
            yan = []
            for m2, ad2 in (("ilk3_pay", "ilk 3 payı"), ("ilk10_disi", "ilk 10 dışı")):
                q = (gecmis or {}).get("metrikler", {}).get(m2) or {}
                if q.get("onceki") is not None and q.get("son") is not None and q.get("onceki_tarih") == onceki_tarih:
                    yan.append(f"{ad2} %{tr_sayi(q['onceki'], 1)} → %{tr_sayi(q['son'], 1)}")
            if yan:
                notlar.append("aynı pencerede " + ", ".join(yan))
    return {
        "deger": fark, "onceki": round(onceki, 2), "son": round(son, 2),
        "kiyas_tarihi": onceki_tarih,
        "gun": (BUGUN - datetime.date.fromisoformat(onceki_tarih)).days,
        # yüzdelerde fark "puan", sayılarda adet — okuyucu "%3 arttı" ile "3 puan" ayrımını görsün
        "birim": "puan" if birim == "%" else birim,
        "yon": "nötr" if rejim else yon,
        "olcum_yontemi_degisti": rejim,
        "rejim_nedeni": nedenler,
        "neden_kisa": "; ".join(NEDEN_KISA.get(n, n) for n in nedenler) or None,
        "gurultu": gurultu,
        "onceki_karnede_basilan": basilan,
        "seri": [m for m, _ in parcalar],
        "not": "; ".join(notlar) or None,
    }


# ---------------------------------------------------------------------------
# Yansız örnek (08.10) — iki tepe SERP kartına "gerçek değer yaklaşık %X" cümlesi
# ---------------------------------------------------------------------------
# İki tepe SERP rakamı seçici yeniden ölçümle şişiyordu (Ekim'de yalnız sorunlu çıkanlar yeniden
# ölçüldü). yansiz-ornek-uret.py, eski "doğru" kayıtlardan sabit tohumla seçilmiş örneğin yeniden
# ölçümünü okur ve bozulma oranını yeniden ölçülmemiş kayıtlara yansıtır (yansiz-ornek.json →
# yansitma). Burada yalnız OKUNUR: kartın açıklamasına tek cümle düşer, kartın deger/gosterim alanı
# değişmez (zaman serisi aynı tanımla sürsün). Dosya yoksa, örnek ölçülmediyse (olculen 0) ya da
# yansıtma alanı boşsa cümle basılmaz, kart eski metniyle kalır.
YANSIZ_DOSYA = "yansiz-ornek.json"
YANSIZ_ALAN = {"ilk3_pay": "tahmini_ilk3_pay", "dogru_sayfa_pay": "tahmini_dogru_sayfa_pay"}


def yansiz_tahmin(k):
    """Kart k için yansız örnekten yansıtılmış tahmin (ham sayı, ör. 70.1) ya da None."""
    try:
        y = json.load(open(yol(YANSIZ_DOSYA), encoding="utf-8"))
    except (FileNotFoundError, json.JSONDecodeError):
        return None
    if not isinstance(y, dict) or not y.get("olculen") or not isinstance(y.get("yansitma"), dict):
        return None
    v = y["yansitma"].get(YANSIZ_ALAN.get(k))
    return v if isinstance(v, (int, float)) and not isinstance(v, bool) else None


def yansiz_cumle(v):
    return f" Yansız örneğe göre gerçek değer yaklaşık %{round(v)}." if v is not None else ""


# ---------------------------------------------------------------------------
# Rakamlar
# ---------------------------------------------------------------------------
RAKAMLAR = []


def ekle(k, baslik, deger, gosterim, ne_demek, kaynak, ayrinti=None, birim=None):
    RAKAMLAR.append({
        "k": k, "baslik": baslik, "deger": deger, "birim": birim,
        "gosterim": gosterim if deger is not None else "ölçülmedi",
        "ne_demek": ne_demek, "kaynak": kaynak, "ayrinti": ayrinti or {},
        "fark_7g": None,  # aşağıda doldurulur
    })


# 1 ------------------------------------------------------------------------
try:
    _n, _i3 = ilk3_payi()
    _pay = yuzde(_i3, _n)
    _yt = yansiz_tahmin("ilk3_pay")
    ekle("ilk3_pay", "Site sorgularında ilk 3", _pay, f"%{_pay}",
         f"Ölçülen {tr_sayi(_n)} site sorgusu içinde ilk 3 sıradan birini tuttuğumuz "
         f"sorgu sayısı {tr_sayi(_i3)}. (Sıra var demek doğru sayfa çıkıyor demek değil; "
         f"o ayrım 2. rakamda.)" + yansiz_cumle(_yt),
         "sonuclar-site-emlakci.jsonl + tur-*.json (karne başlık kartıyla aynı hesap)",
         {"sorgu": _n, "ilk3": _i3, "yansiz_tahmin": _yt}, birim="%")
except Exception as e:  # dosya yoksa uydurma, boş bırak
    ekle("ilk3_pay", "Site sorgularında ilk 3", None, None,
         "Ölçüm dosyası okunamadı.", "sonuclar-site-emlakci.jsonl + tur-*.json", birim="%")
    UYARILAR.append(f"ilk3_pay hesaplanamadı: {e}")

# 2 ------------------------------------------------------------------------
try:
    _DS = json.load(open(yol("dogru-sayfa.json"), encoding="utf-8"))
    _d3, _t3 = _DS["ilk3_dogru"], _DS["ilk3_toplam"]
    _pay = yuzde(_d3, _t3)
    _bel = next((x["n"] for x in _DS.get("ilk3") or [] if x["k"] == "belirsiz"), 0)
    _ne = (f"İlk 3 sırada olduğumuz {tr_sayi(_t3)} sorgunun {tr_sayi(_d3)} tanesinde arayanın "
           f"karşısına doğru site sayfası çıkıyor; kalanında sırayı ada, mahalle, eski adres ya da "
           f"başka bir site sayfamız tutuyor")
    if _bel:
        _ne += f" ({tr_sayi(_bel)} sorguda çıkan adres doğrulanamadı)"
    _ne += "."
    # 08.10 (ye-1) + onarım: ölçümler aynı yaşta değilse karışık oran yanlı olabilir. Hüküm ve
    # YÖNÜ dogru-sayfa.json → yas_kiyasi'ndan okunur (sınır ayından bu yana ölçülenler ile daha
    # eski ölçümlerin doğru sayfa oranı; eşikler ve yön orada, tek yerde). İlk sürüm yalnız
    # seçici yeniden ölçümün MUTLAK farkına bakıyordu: çoğunlukla önceden DOĞRU çıkanlar yeniden
    # ölçüldüğünde de "yalnız N tanesi önceden doğruydu, sorunlu çıkanlar yeniden ölçüldü, üst
    # sınır" diyordu; ayrıca takvim ayına bağlıydı, yeni ayda tek sorgu ölçülünce uyarı
    # kalkıyordu. Ters yönde sınır iddiası yapılmaz (yas_ayrisik: yansız cümle). Seçici yeniden
    # ölçüm cümlesi yalnız aynı kova içinse ve hükümle AYNI yöndeyse eklenir.
    _oy = _DS.get("olcum_yasi") or {}
    _sy = _DS.get("secilmis_yeniden_olcum") or {}
    _yk = _DS.get("yas_kiyasi") or {}
    _hukum = _yk.get("hukum")
    _yt = yansiz_tahmin("dogru_sayfa_pay")
    if _hukum in ("ust_sinir", "yas_ayrisik"):
        _tz, _es, _kova = _yk["taze"], _yk["eski"], _yk["taze_kova"]
        _ay = AY_AD[int(_kova[5:7]) - 1]
        _to, _eo = yuzde(_tz["ilk3_dogru"], _tz["ilk3"]), yuzde(_es["ilk3_dogru"], _es["ilk3"])
        # taze taraf sınır ayını ve sonrasını kapsar: tek aysa "<Ay> ayında", değilse "<Ay> ayından bu yana"
        _ne_zaman = f"{_ay} ayından bu yana" if len(_yk.get("taze_aylar") or []) > 1 else f"{_ay} ayında"
        # seçim yönü: + çoğunlukla sorunlu çıkanlar yeniden ölçüldü, − çoğunlukla doğru çıkanlar
        _secim = None
        if (_sy.get("kova") == _kova and _sy.get("yeniden_olculen", 0) >= SECICI_MIN
                and _sy.get("kuyruk_toplam")):
            _secim = (100 * _sy["kuyruk_onceden_dogru"] / _sy["kuyruk_toplam"]
                      - 100 * _sy["onceden_dogru"] / _sy["yeniden_olculen"])
        _olcum = (f"{_ne_zaman} ölçülen sorgularda ilk 3′teki {tr_sayi(_tz['ilk3'])} sıranın "
                  f"{tr_sayi(_tz['ilk3_dogru'])} tanesi doğru (%{_to}). Daha eski ölçümlerden kalan "
                  f"{tr_sayi(_es['ilk3'])} sıranın {tr_sayi(_es['ilk3_dogru'])} tanesi ")
        if _hukum == "ust_sinir":
            # 08.10 birleştirme: üst kart kısa tutulur; sayıların dökümü "Sırayı hangi sayfamız
            # tutuyor" bölümünde aynı JSON'dan basılıyor.
            _ne += (f" Bu oran üst sınırdır: {_ne_zaman} yeniden ölçülen sorgularda oran %{_to}, "
                    f"yeniden ölçülmeyen eski ölçümlerde %{_eo}.")
            if _secim is not None and _secim >= SECICI_ESIK:
                _ne += " Yeniden ölçülenlerin çoğu önceki ölçümde sorunlu çıkanlardı."
            # aralık yalnız bilgi veriyorsa basılır: yalnız birkaç sorunlu sıra yeniden ölçüldüyse taze
            # oran çok düşük çıkar, "%6 ile %91 arası" okuyana bir şey söylemez.
            # 08.10: yansız örnek varsa "gerçek oran" kapanışı onun cümlesidir (aşağıda); aralık ya da
            # "düşük olabilir" cümlesi onunla birlikte basılmaz, ikisi aynı soruya iki cevap olur.
            if _yt is None:
                if 0 < _pay - _to <= ARALIK_EN_COK:
                    _ne += f" Gerçek oran %{_to} ile %{_pay} arasındadır."
                else:
                    _ne += " Gerçek oran bundan düşük olabilir."
        else:
            _ne += f" Ölçümler aynı yaşta değil: {_olcum}doğru (%{_eo}) ve bunlar yeniden ölçülmedi."
            if _secim is not None and -_secim >= SECICI_ESIK:
                _ne += (f" {_ne_zaman} yeniden ölçülen {tr_sayi(_sy['yeniden_olculen'])} sorgudan "
                        f"{tr_sayi(_sy['onceden_dogru'])} tanesi önceden de doğruydu, yani çoğunlukla doğru çıkanlar "
                        f"yeniden ölçüldü; sorunlu çıkanlar yeniden ölçülmedi.")
            _ne += " Eski ölçümler tazelenince oran iki yöne de değişebilir."
    _ne += yansiz_cumle(_yt)
    ekle("dogru_sayfa_pay", "İlk 3 içinde doğru sayfa", _pay, f"%{_pay}", _ne,
         "dogru-sayfa.json", {"ilk3_dogru": _d3, "ilk3_toplam": _t3, "adresi_dogrulanamayan": _bel,
                              "olcum_yasi": _oy or None, "secilmis_yeniden_olcum": _sy or None,
                              "yas_kiyasi": _yk or None, "yas_hukmu": _hukum,
                              "guncelleme": _DS.get("guncelleme"), "yansiz_tahmin": _yt},
         birim="%")
    # 1. rakamın paydası ile bu dosyanın toplamı farklıysa açıkça söyle (505 / 504 vakası)
    if RAKAMLAR[0]["deger"] is not None and _DS.get("toplam") != RAKAMLAR[0]["ayrinti"]["sorgu"]:
        UYARILAR.append(
            f"Toplam sorgu sayısı iki dosyada farklı: karne başlığı/tepe rakam {tr_sayi(RAKAMLAR[0]['ayrinti']['sorgu'])} "
            f"(11 mahalle turu), dogru-sayfa.json {tr_sayi(_DS.get('toplam'))} (kuyruk-site-emlakci tabanı). "
            f"Tepe rakam karneyle aynı hesabı kullanır.")
except Exception as e:
    ekle("dogru_sayfa_pay", "İlk 3 içinde doğru sayfa", None, None,
         "dogru-sayfa.json okunamadı.", "dogru-sayfa.json", birim="%")
    UYARILAR.append(f"dogru_sayfa_pay hesaplanamadı: {e}")

# 3 ------------------------------------------------------------------------
try:
    _SO = json.load(open(yol("sonuc-ozeti.json"), encoding="utf-8"))
    _e = _SO["ayrim"]["eryaman"]["simdi"]
    _dn = _SO.get("donem", {})
    ekle("gsc_eryaman_tik", "Google′dan gelen tık (Eryaman)", _e["tik"], tr_sayi(_e["tik"]),
         f"Son {_dn.get('gun', 28)} günde ({tr_tarih(_dn.get('bas'))}–{tr_tarih(_dn.get('bit'))}) "
         f"Google aramasından sitede KALAN Eryaman sayfalarına gelen tık; {tr_sayi(_e['gos'])} gösterim. "
         f"Siteden kaldırılan Yenimahalle sayfaları bu rakama dahil değil.",
         "sonuc-ozeti.json (ayrim.eryaman.simdi)",
         {"gos": _e["gos"], "donem": _dn, "uretim": _SO.get("uretim"),
          "toplam_tik": _SO.get("simdi", {}).get("tik")}, birim="tık")
    if _SO.get("uretim") and _SO["uretim"] != BUGUN.isoformat():
        UYARILAR.append(f"sonuc-ozeti.json en son {tr_tarih(_SO['uretim'])} tarihinde üretildi "
                        f"(dönem {tr_tarih(_dn.get('bas'))}–{tr_tarih(_dn.get('bit'))}); GSC 2-3 gün geriden gelir.")
except Exception as e:
    ekle("gsc_eryaman_tik", "Google′dan gelen tık (Eryaman)", None, None,
         "sonuc-ozeti.json okunamadı.", "sonuc-ozeti.json", birim="tık")
    UYARILAR.append(f"gsc_eryaman_tik hesaplanamadı: {e}")

# 4 ------------------------------------------------------------------------
try:
    _TS = json.load(open(yol("tik-sonrasi.json"), encoding="utf-8"))
    _t = _TS["temas"]
    # form = contact_form_submit (karne 'Tıktan sonra' bölümüyle aynı tanım).
    # form_start temas değil: formu açıp bırakan da sayılır, gönderim ayrı olay.
    _tel, _wa, _form = _t.get("phone_click", 0), _t.get("whatsapp_click", 0), _t.get("contact_form_submit", 0)
    _tik = _tel + _wa
    _ziy = _t.get("temas_oturum")
    if _ziy is not None:
        # 08.10 (temas-1): kart tıkı değil temas eden ziyareti sayar; tık dökümü açıklamada.
        ekle("ga4_temas", "Siteden gelen temas (ziyaret)", _ziy, tr_sayi(_ziy),
             f"{tr_sayi(_ziy)} ziyaret ({tr_sayi(_tik)} tık: {tr_sayi(_tel)} telefon, {tr_sayi(_wa)} WhatsApp). "
             f"Son {_TS.get('gun', 28)} günde telefon ya da WhatsApp düğmesine basan ziyaret sayısı; aynı kişi "
             f"bir ziyarette birkaç kez basabildiği için tık değil ziyaret sayılır. Form gönderimi: "
             f"{tr_sayi(_form)}. (GA4; {tr_sayi(_TS['ozet']['oturum'])} oturum içinden.)",
             "tik-sonrasi.json (temas.temas_oturum)",
             {"temas_oturum": _ziy, "tik": _tik, "telefon": _tel, "whatsapp": _wa, "form": _form,
              "oturum": _TS["ozet"]["oturum"], "guncelleme": _TS.get("guncelleme")}, birim="ziyaret")
    else:
        # tik-sonrasi.json eski sürüm: ziyaret sayısı yok. Kart eski tanımıyla (tık + form) basılır,
        # fark da tık serisinden okunur — iki tanım karıştırılmaz.
        FARK_KAYNAK["ga4_temas"] = FARK_KAYNAK_TIK
        FARK_NOTU["ga4_temas"] = "form hariç (seride telefon + WhatsApp tıkı var, form gönderimi yok)"
        _top = _tik + _form
        ekle("ga4_temas", "Siteden gelen temas", _top, tr_sayi(_top),
             f"Son {_TS.get('gun', 28)} günde ziyaretçinin bizimle kurduğu temas: {tr_sayi(_tel)} telefon, "
             f"{tr_sayi(_wa)} WhatsApp, {tr_sayi(_form)} form (GA4; {tr_sayi(_TS['ozet']['oturum'])} oturum içinden).",
             "tik-sonrasi.json (temas)",
             {"telefon": _tel, "whatsapp": _wa, "form": _form, "oturum": _TS["ozet"]["oturum"],
              "guncelleme": _TS.get("guncelleme")}, birim="temas")
        UYARILAR.append("tik-sonrasi.json içinde temas eden ziyaret sayısı (temas.temas_oturum) yok: temas kartı "
                        "ziyareti değil tıkı sayıyor. tik-sonrasi-uret.py, ga4-temas.mjs çıktısıyla yeniden koşmalı.")
except Exception as e:
    ekle("ga4_temas", "Siteden gelen temas", None, None,
         "tik-sonrasi.json okunamadı (GA4 çekimi yapılmamış olabilir).", "tik-sonrasi.json", birim="temas")
    UYARILAR.append(f"ga4_temas hesaplanamadı: {e}")

# 5 ------------------------------------------------------------------------
try:
    _HS = json.load(open(yol("hedef-sorgular.json"), encoding="utf-8"))
    _oz = _HS["ozet"]
    _hedef = _oz["hedef_sayisi"]
    _kutuda = _oz["kutuda"]
    # ozet ile satırlar çelişirse söyle (üretici değişmiş olabilir)
    _hesap = sum(1 for s in _HS["satirlar"] if (s.get("kutuda") or 0) >= 1)
    if _hesap != _kutuda:
        UYARILAR.append(f"hedef-sorgular.json: ozet.kutuda {_kutuda} ile satırlardan sayılan {_hesap} uyuşmuyor; ozet esas alındı.")
    ekle("hedef_kutuda", "Hedef sorgularda harita kutusu", _kutuda, f"{_kutuda}/{_hedef}",
         f"{tr_sayi(_hedef)} hedef sorgunun {tr_sayi(_kutuda)} tanesinde harita kutusunda görünüyoruz, "
         f"{tr_sayi(_oz.get('kutuda_birinci', 0))} tanesinde kutuda 1. sıradayız; "
         f"{tr_sayi(_oz.get('kutu_var_biz_yok', 0))} sorguda kutu çıkıyor ama biz yokuz. "
         f"(Organik ilk 3: {tr_sayi(_oz.get('ilk3', 0))} sorgu.)",
         "hedef-sorgular.json (ozet.kutuda)",
         {"hedef": _hedef, "kutuda_birinci": _oz.get("kutuda_birinci"),
          "kutu_var_biz_yok": _oz.get("kutu_var_biz_yok"), "organik_ilk3": _oz.get("ilk3"),
          "organik_birinci": _oz.get("birinci"), "guncelleme": _HS.get("guncelleme")}, birim="sorgu")
except Exception as e:
    ekle("hedef_kutuda", "Hedef sorgularda harita kutusu", None, None,
         "hedef-sorgular.json okunamadı.", "hedef-sorgular.json", birim="sorgu")
    UYARILAR.append(f"hedef_kutuda hesaplanamadı: {e}")

# 6 ------------------------------------------------------------------------
try:
    _dtur, _bitmis = damla_sayimi()
    _dd, _yt, _ea = _dtur["dizin_disi"], _dtur["yeniden_tarama"], _dtur["eski_adres"]
    _acik = _dd + _yt + _ea
    # Kart yalnız Google'da OLMAYAN (dizin dışı doğrulanmış) sayfayı sayar; yeniden tarama
    # bekleyen ve eski adres satırları ayrı adla açıklamada ve ayrıntıda durur (S1).
    _ne = (f"Dizin kuyruğunda Google′da olmadığı doğrulanmış {tr_sayi(_dd)} sayfa var."
           if _dd else "Dizin kuyruğunda Google′da olmadığı doğrulanmış sayfa yok.")
    _diger = []
    if _yt:
        # S1'e göre notunda "dizin dışı" geçmeyen HER açık satır (notsuz satır dahil) bu türe düşer;
        # "Google′da var" kesin hükmü bu yüzden yazılmaz (bugünkü 2 satır API teyitli, yarınki olmayabilir)
        _diger.append(f"{tr_sayi(_yt)} sayfa yeniden tarama bekliyor (dizin dışı olduğu doğrulanmadı; "
                      f"Google′ın sayfayı yeniden okuması bekleniyor)")
    if _ea:
        _diger.append(f"{tr_sayi(_ea)} satır eski adres (yönlendirmenin Google′a işlenmesi bekleniyor)")
    if _diger:
        _ne += " Kuyrukta ayrıca " + ", ".join(_diger) + "."
    _ne += (f" Bugüne dek {tr_sayi(_bitmis)} satır işaretlendi (istek gönderildi ya da kendiliğinden dizine girdi). "
            f"İstek yalnız GSC arayüzünden, günlük kotayla gidiyor.")
    ekle("damla_kalan", "Dizin kuyruğu: Google′da olmayan sayfa", _dd, tr_sayi(_dd), _ne,
         "DIZIN-DAMLASI-31-08.md (açık \"- [ ] https://…\" satırları, türüne göre)",
         {"dizin_disi": _dd, "yeniden_tarama": _yt, "eski_adres": _ea, "acik_toplam": _acik,
          "bitmis": _bitmis, "toplam": _acik + _bitmis}, birim="sayfa")
except Exception as e:
    ekle("damla_kalan", "Dizin kuyruğu: Google′da olmayan sayfa", None, None,
         "DIZIN-DAMLASI-31-08.md okunamadı.", "DIZIN-DAMLASI-31-08.md", birim="sayfa")
    UYARILAR.append(f"damla_kalan hesaplanamadı: {e}")

# --- 7 günlük fark ---------------------------------------------------------
GECMIS = gecmis_oku()
for r in RAKAMLAR:
    if GECMIS and r["deger"] is not None:
        r["fark_7g"] = fark_kur(GECMIS, r["k"], r["birim"])
_kiyas_tarihleri = sorted({r["fark_7g"]["kiyas_tarihi"] for r in RAKAMLAR if r["fark_7g"]})
# Karne "Fark N günlük seriden" yazar: GÜN sayısı, satır sayısı değil (aynı günde anlık +
# geri doldurma iki satır; 02.09'da 13 gün için "14 günlük" basılmıştı).
KAYIT_SAYISI = ((GECMIS or {}).get("gun_sayisi") or 0) if GECMIS else 0
if GECMIS and not KAYIT_SAYISI:
    try:  # eski özet JSON (gun_sayisi yok): jsonl'den ayrı gün say
        KAYIT_SAYISI = len({json.loads(L)["tarih"] for L in open(yol("karne-gecmis.jsonl"), encoding="utf-8") if L.strip()})
    except Exception:
        KAYIT_SAYISI = sum(GECMIS.get("satir_sayisi", {}).values())
if not GECMIS:
    UYARILAR.append(f"7 günlük fark yok: {GECMIS_DOSYA} bulunamadı ya da 'metrikler' şeması değil — "
                    f"önce anlik-goruntu-uret.py koşmalı.")
else:
    _eksik = [r["baslik"] for r in RAKAMLAR if r["deger"] is not None and not r["fark_7g"]]
    if _eksik:
        UYARILAR.append("7 gün önceki değer seride yok, fark basılmadı: " + ", ".join(_eksik) +
                        f" — seri {GECMIS.get('seri_bas')} tarihinden beri birikiyor.")
    _rejim = [r for r in RAKAMLAR if r["fark_7g"] and r["fark_7g"].get("olcum_yontemi_degisti")]
    if _rejim:
        # neden kart başına yazılır: 27.08 öncesi tur, seçici yeniden ölçüm ve sayım tanımı
        # değişikliği ayrı şeylerdir (08.10'a kadar hepsine "27.08 öncesi turdan" deniyordu)
        UYARILAR.append("Fark iyi/kötü diye okunmaz: " + "; ".join(
            f"{r['baslik']} ({r['fark_7g'].get('neden_kisa') or 'ölçüm yöntemi değişti'})" for r in _rejim) + ".")

# ---------------------------------------------------------------------------
# Bu hafta ne yapıldı — PROTOKOL-gece.md başlıkları
# ---------------------------------------------------------------------------
# Başlık biçimleri defterde karışık: "## 2026-08-27 — …", "## 31.08 — …",
# "## 31.08 BAŞLIK…", "## 02.09 08:28 — …". Hepsini tek desen yakalar; tarihi
# olmayan başlık (## Adımlar, ### A) …) bu haftaya ait sayılmaz.
BASLIK_RE = re.compile(
    r"^#{2,3}\s+(?:(\d{4})-(\d{2})-(\d{2})|(\d{1,2})\.(\d{2}))"  # ISO ya da gg.aa
    r"(?:\s+\d{1,2}:\d{2})?"                                     # isteğe bağlı saat
    r"\s*(?:[—–-]\s*)?(.*\S)\s*$")


def protokol_basliklari():
    gunler = collections.OrderedDict()
    for L in open(yol("PROTOKOL-gece.md"), encoding="utf-8"):
        m = BASLIK_RE.match(L)
        if not m:
            continue
        try:
            if m.group(1):
                t = datetime.date(int(m.group(1)), int(m.group(2)), int(m.group(3)))
            else:
                # gg.aa biçiminde yıl yok: bu yıl varsayılır; gelecekteki bir tarih
                # çıkarsa (yılbaşı geçişi) geçen yıla düşer
                t = datetime.date(BUGUN.year, int(m.group(5)), int(m.group(4)))
                if t > BUGUN + datetime.timedelta(days=1):
                    t = t.replace(year=BUGUN.year - 1)
        except ValueError:
            continue
        gunler.setdefault(t, []).append(m.group(6).strip())
    return gunler


YAPILAN = []
try:
    _g = protokol_basliklari()
    _hafta = {t: b for t, b in _g.items() if BUGUN - datetime.timedelta(days=7) <= t <= BUGUN}
    # gün başına bir madde, en yeni 3 gün: "3 madde" derken haftanın üç gününü
    # göstermek, bugünün üç başlığını göstermekten daha iyi anlatır
    for t in sorted(_hafta, reverse=True)[:3]:
        b = _hafta[t]
        metin = f"{gg_aa(t)} — " + " · ".join(b[:3])
        if len(b) > 3:
            metin += f" (+{len(b) - 3} başlık daha)"
        YAPILAN.append({"tarih": gg_aa(t), "iso": t.isoformat(), "baslik_sayisi": len(b),
                        "basliklar": b, "metin": metin})
    if not YAPILAN:
        UYARILAR.append("PROTOKOL-gece.md içinde son 7 güne ait tarihli başlık yok.")
except Exception as e:
    UYARILAR.append(f"PROTOKOL-gece.md okunamadı: {e}")

# ---------------------------------------------------------------------------
# Bu hafta ne bekleniyor
# ---------------------------------------------------------------------------
BEKLENEN = []

# (a) beklenen düşüşler — karnenin 'panik yok' paneliyle aynı kaynaklar
try:
    _SO = json.load(open(yol("sonuc-ozeti.json"), encoding="utf-8"))
    _ym = _SO["ayrim"]["yenimahalle"]["simdi"]["tik"]
    _top = _SO["simdi"]["tik"]
    _er = _SO["ayrim"]["eryaman"]["simdi"]["tik"]
    _yazi = None
    try:
        _yazi = next(r for r in json.load(open(yol("sayfa-turu-verimi.json"), encoding="utf-8"))["satirlar"]
                     if r["tur"] == "blog")
    except Exception:
        pass
    metin = (f"Search Console′un toplam tık çizgisi İNECEK, panik yok: son {_SO['donem']['gun']} gündeki "
             f"{tr_sayi(_top)} tıkın %{yuzde(_ym, _top)} kadarı ({tr_sayi(_ym)}) artık sitede olmayan "
             f"Yenimahalle sayfalarından geldi")
    if _yazi:
        metin += f"; kapatılan genel yazılar da {tr_sayi(_yazi['gos'])} gösterim / {tr_sayi(_yazi['tik'])} tık taşıyordu"
    metin += f". İkisi eriyecek; ölçüt Eryaman satırı ({tr_sayi(_er)} tık)."
    BEKLENEN.append({"tarih": None, "iso": None, "metin": metin,
                     "kaynak": "sonuc-ozeti.json (ayrim) + sayfa-turu-verimi.json (blog)",
                     "ayrinti": {"yenimahalle_tik": _ym, "toplam_tik": _top, "pay": yuzde(_ym, _top),
                                 "yazi_gos": _yazi["gos"] if _yazi else None,
                                 "yazi_tik": _yazi["tik"] if _yazi else None}})
except Exception as e:
    UYARILAR.append(f"beklenen düşüş maddesi kurulamadı: {e}")

# (b) 08.10'da KALDIRILDI (ana-1): "07.09 başlık/H1 dondurması biter; o gün ilk iş ana sayfanın
# başlığı ve snippet′i: 'eryaman emlakçı'da sıra yerinde, tıklanma oranı düştü" maddesi yanlış
# alarmdı. İki dönem arasında günlük gösterim neredeyse aynı, fark birkaç tıklık küçük sayı
# farkı (anlamlı değil); organik sıra da "yerinde" değil, 08.08 başlığıyla iyileşti; Google
# başlığımızı aynen gösteriyor. Ana sayfa başlığına dokunulmuyor; yeniden açma koşulu kaldıraç
# defterinde. eryaman-emlakci.json'daki title_donuk / donemler alanları duruyor, burada okunmaz.

# (c) 14.09 — sitemap tazelik düzeltmesinin izleme süresi dolar
# Tarih elle yazılmaz: kaldıraç kaydının 'kaynak' alanındaki gün (31.08) +
# 'kisit' alanındaki "1-2 hafta"nın üst sınırı (2 hafta) toplanır.
try:
    _KD = json.load(open(yol("kaldirac-defteri.json"), encoding="utf-8"))
    _sm = next(k for k in _KD["kaldiraclar"] if k["ad"].lower().startswith("sitemap"))
    if _sm.get("durum") != "acik":
        raise StopIteration  # 08.10: okuma yapıldı; kayıt kapandıysa "bekleniyor" maddesi basılmaz
    _mg = re.search(r"(\d{1,2})\.(\d{2})", _sm.get("kaynak", ""))
    _mh = re.search(r"(\d+)\s*-\s*(\d+)\s*hafta", _sm.get("kisit", ""))
    if not (_mg and _mh):
        raise ValueError("kaldıraç kaydında tarih ya da hafta aralığı okunamadı")
    _bas = datetime.date(BUGUN.year, int(_mg.group(2)), int(_mg.group(1)))
    if _bas > BUGUN:
        _bas = _bas.replace(year=BUGUN.year - 1)
    _hafta_ust = int(_mh.group(2))
    _bit = _bas + datetime.timedelta(weeks=_hafta_ust)
    # PR numarası ve tarih kaydın 'kaynak' alanından olduğu gibi alınır (elle "PR #87" yazılmaz);
    # 'durum' ham anahtar (acik/kanitli/curuk) okuyucuya Türkçe etiketle gösterilir
    _DURUM_AD = {"acik": "açık, sonuç bekleniyor", "kanitli": "kanıtlı", "curuk": "çürük"}
    metin = (f"{gg_aa(_bit)} — Sitemap tazelik düzeltmesinin ({_sm.get('kaynak')}) izleme süresi dolar: "
             f"tarama dağılımı {_mh.group(1)}-{_mh.group(2)} hafta izleniyor. Sonuç henüz ölçülmedi; "
             f"o güne kadar Google site sayfalarını ada sayfalarından taze görmeye başlamadıysa kaldıraç "
             f"yeniden değerlendirilir. Kaldıraç defterindeki durumu: {_DURUM_AD.get(_sm.get('durum'), _sm.get('durum'))}.")
    BEKLENEN.append({"tarih": gg_aa(_bit), "iso": _bit.isoformat(), "metin": metin,
                     "kaynak": "kaldirac-defteri.json (Sitemap tazelik sinyali: kaynak tarihi + kisit haftası)",
                     "ayrinti": {"baslangic": _bas.isoformat(), "hafta": _hafta_ust, "durum": _sm.get("durum")}})
except StopIteration:
    pass
except Exception as e:
    UYARILAR.append(f"14.09 maddesi kurulamadı: {e}")

# ---------------------------------------------------------------------------
# Çıktı
# ---------------------------------------------------------------------------
CIKTI = {
    "guncelleme": BUGUN.isoformat(),
    "rakamlar": RAKAMLAR,
    "bu_hafta_yapilan": YAPILAN,
    "bu_hafta_yapilan_kurali": "PROTOKOL-gece.md'nin son 7 gündeki tarihli bölüm başlıkları; gün başına bir madde, en yeni 3 gün.",
    "bu_hafta_beklenen": BEKLENEN,
    "gecmis": {"dosya": GECMIS_DOSYA, "sahip": "anlik-goruntu-uret.py", "kayit": KAYIT_SAYISI,
               "kiyas_tarihi": _kiyas_tarihleri[0] if len(_kiyas_tarihleri) == 1 else (_kiyas_tarihleri or None)},
    "uyarilar": UYARILAR,
}
json.dump(CIKTI, open(yol("yonetici-ozeti.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)

for r in RAKAMLAR:
    f = r["fark_7g"]
    fs = (f" (7g: {'+' if f['deger'] > 0 else ''}{tr_sayi(f['deger'], 1)} {f['birim']}"
          f"{' · yöntem değişti' if f.get('olcum_yontemi_degisti') else ''})") if f else " (7g: —)"
    print(f"{r['baslik']:36} {r['gosterim']:>8}{fs}   ← {r['kaynak']}")
print(f"yapılan {len(YAPILAN)} madde · beklenen {len(BEKLENEN)} madde · geçmiş kayıt {KAYIT_SAYISI} · uyarı {len(UYARILAR)}")
for u in UYARILAR:
    print("  !", u)
