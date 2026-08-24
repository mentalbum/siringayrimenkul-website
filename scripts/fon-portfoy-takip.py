#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Serbest fon (TLY vb.) hisse pozisyonu takibi — aylık rapor + getiriden çıkarım.

NEDEN BÖYLE KURULDU
-------------------
Bir fonun hisse dökümünü öğrenmenin iki yolu var ve ikisi de sakat:

1) AYLIK PORTFÖY DAĞILIM RAPORU (kurucunun sitesi / KAP). Hisse bazında tam
   döküm burada, ama ay sonu fotoğrafı ve ertesi ayın ilk haftasında
   yayımlanıyor: elinizdeki en taze veri 1-5 hafta bayat. Fon o sürede
   pozisyonu çoktan değiştirmiş olabilir. Bu betik raporu ÜRETMEZ, elle
   indirdiğiniz dökümü `anlik` ile içe alır ve `fark` ile ay-aya diff'ler.

2) TEFAS. 2026'da TEFAS eski `api/DB/BindHistory*` uçlarını emekliye ayırıp
   `api/funds/...` JSON uçlarına geçti. Bu betik `fonFiyatBilgiGetir` ucunu
   kullanıyor (fiyat; tefas-crawler 0.6.0 ile doğrulandı). DİKKAT: tefas-crawler
   "varlık dağılımı artık hiçbir uçtan alınamıyor" diyor, ama yeni API'de
   `api/funds/dagilimSiraliGetirT` adlı bir dağılım ucu olduğu raporlandı —
   bu ortamdan (egress kapalı) teyit EDİLEMEDİ. Teyit edilse bile o uç VARLIK
   SINIFI kırılımı verir (hisse %X, ters repo %Y), hisse bazında döküm vermez.
   Yani hisse listesi için tek kaynak yine aylık rapordur.

Geriye kalan tek köprü: fonun günlük getirisi. Fon hangi hisseleri taşıyorsa
getirisi o hisselerin getirisiyle birlikte hareket eder. `teshis` ve `aday`
komutları bunu kullanır — raporlar arasındaki kör dönemde pozisyon değişimini
FİYATTAN ÇIKARIR. Bu bir açıklama değil, İSTATİSTİKSEL TAHMİNDİR; çıktısı
"şu hisse portföyde" demez, "fonun son hareketleri bu hisseyle daha çok
örtüşmeye başladı" der. Kesinlik isteyen aylık rapora bakmalı.

`teshis` çıktısındaki toplam ağırlık 1'i belirgin aşıyorsa fon kaldıraçlı
demektir; o durumda hisse listesini kopyalamak getiriyi ÜRETMEZ, çünkü getiri
seçimden değil kaldıraçtan geliyordur. Kopyalamaya karar vermeden önce bu
sayıya bakın.

KULLANIM
--------
  python3 scripts/fon-portfoy-takip.py fiyat TLY [--periyod 12]
  python3 scripts/fon-portfoy-takip.py hisse ASELS,EREGL [--gun 400]
  python3 scripts/fon-portfoy-takip.py evren [--dosya evren.txt]
  python3 scripts/fon-portfoy-takip.py teshis TLY [--gun 90]
  python3 scripts/fon-portfoy-takip.py aday  TLY [--pencere 30] [--ilk 15]
  python3 scripts/fon-portfoy-takip.py anlik TLY --ay 2026-07 --dosya temmuz.csv
  python3 scripts/fon-portfoy-takip.py fark  TLY
  python3 scripts/fon-portfoy-takip.py buyukluk --dosya tly-portfoy-2026-07.csv
  python3 scripts/fon-portfoy-takip.py kap   TLY [--ay 2026-07]   # sonda, doğrulanmadı
  python3 scripts/fon-portfoy-takip.py dagilim TLY                # sonda, doğrulanmadı

Ağ: bu betik dış uçlara çıkar (tefas.gov.tr, isyatirim.com.tr). Kapalı ağda
çalışmaz; önbellek ~/.cache/fon-takip altında tutulur, bir kez çekilen seri
tekrar çekilmez (--taze ile zorlanır).
"""
import csv, json, math, os, sys, time, urllib.request, urllib.error
from datetime import date, datetime, timedelta

ONBELLEK = os.path.expanduser("~/.cache/fon-takip")
UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36")
BEKLE = 0.6  # sn — İş Yatırım art arda istekte 403 veriyor

# TEFAS yeni ucu geriye dönük süreyi bu kümeye yuvarlıyor; başka değer
# "Sistem Hatası!!" döndürüyor (tefas-crawler 0.6.0).
TEFAS_PERIYOT = (1, 3, 6, 12, 36, 60)
TEFAS_FIYAT = "https://www.tefas.gov.tr/api/funds/fonFiyatBilgiGetir"
ISY_HISSE = "https://www.isyatirim.com.tr/_layouts/15/Isyatirim.Website/Common/Data.aspx/HisseTekil"
ISY_ENDEKS = ("https://www.isyatirim.com.tr/_Layouts/15/IsYatirim.Website/Common"
              "/ChartData.aspx/IndexHistoricalAll")

# Başlangıç evreni: BIST'in en likit isimleri. KENDİ LİSTENLE DEĞİŞTİR —
# `evren --dosya <yol>` satır satır kod okur. Çekilemeyen kod sessizce atlanır,
# yani listedeki bir hata analizi bozmaz, sadece o adayı düşürür.
VARSAYILAN_EVREN = """
AKBNK GARAN ISCTR YKBNK VAKBN HALKB TSKB ALBRK
THYAO PGSUS TCELL TTKOM ASELS OTKAR TOASO FROTO KARSN TTRAK
EREGL KRDMD ISDMR SISE TRKCM SASA PETKM TUPRS AYGAZ
KCHOL SAHOL ENKAI TAVHL DOAS MGROS BIMAS SOKM ULKER CCOLA AEFES
KOZAL KOZAA IPEKE EKGYO TKFEN ENJSA AKSEN ZOREN ODAS
HEKTS GUBRF EGEEN ARCLK VESTL BRSAN CIMSA AKCNS OYAKC
""".split()


# ---------------------------------------------------------------- altyapı

def _dizin(*p):
    y = os.path.join(ONBELLEK, *p)
    os.makedirs(os.path.dirname(y) if os.path.splitext(y)[1] else y, exist_ok=True)
    return y


def _iste(url, govde=None, deneme=3):
    """GET/POST; JSON döner. Geçici hatada üstel bekleyip yeniden dener."""
    veri = json.dumps(govde).encode() if govde is not None else None
    basliklar = {"User-Agent": UA, "Accept": "application/json, text/plain, */*"}
    if veri is not None:
        basliklar["Content-Type"] = "application/json"
    son = None
    for i in range(deneme):
        try:
            r = urllib.request.Request(url, data=veri, headers=basliklar)
            with urllib.request.urlopen(r, timeout=40) as y:
                return json.loads(y.read().decode("utf-8", "replace"))
        except Exception as e:                      # noqa: BLE001
            son = e
            if i < deneme - 1:
                time.sleep(2 ** i)
    raise RuntimeError(f"istek başarısız: {url[:90]} → {type(son).__name__}: {son}")


def _seri_yaz(ad, seri):
    yol = os.path.join(_dizin("seri"), f"{ad}.json")
    json.dump(seri, open(yol, "w"), ensure_ascii=False)
    return yol


def _seri_oku(ad):
    yol = os.path.join(ONBELLEK, "seri", f"{ad}.json")
    return json.load(open(yol)) if os.path.exists(yol) else None


# ------------------------------------------------------------ veri çekme

def fon_fiyat(fon, periyod=12, taze=False):
    """TEFAS günlük fiyat serisi → {'YYYY-MM-DD': fiyat}."""
    if periyod not in TEFAS_PERIYOT:
        periyod = min(p for p in TEFAS_PERIYOT if p >= periyod)
    ad = f"fon-{fon.upper()}"
    if not taze:
        v = _seri_oku(ad)
        if v:
            return v
    ham = _iste(TEFAS_FIYAT, {"fonKodu": fon.upper(), "dil": "TR", "periyod": periyod})
    satirlar = ham.get("resultList") or []
    seri = {}
    for s in satirlar:
        t, f = s.get("tarih"), s.get("fiyat")
        if t and f is not None:
            seri[str(t)[:10]] = float(f)
    if not seri:
        raise RuntimeError(f"{fon}: TEFAS boş döndü (fon kodu doğru mu, serbest fon TEFAS'ta mı?)")
    _seri_yaz(ad, seri)
    return seri


def _kapanis_alani(satir):
    """HisseTekil alan adları sürümden sürüme oynuyor; kapanışı sırayla ara."""
    for a in ("HGDG_KAPANIS", "HG_KAPANIS", "KAPANIS", "HGDG_AGIRLIKLI_ORT"):
        d = satir.get(a)
        if isinstance(d, (int, float)) and d > 0:
            return a
    return None


def hisse_fiyat(kod, gun=400, taze=False):
    """İş Yatırım günlük kapanış → {'YYYY-MM-DD': kapanis}. Yoksa None."""
    ad = f"hisse-{kod.upper()}"
    if not taze:
        v = _seri_oku(ad)
        if v:
            return v
    bit = date.today()
    bas = bit - timedelta(days=gun)
    url = (f"{ISY_HISSE}?hisse={kod.upper()}"
           f"&startdate={bas.strftime('%d-%m-%Y')}&enddate={bit.strftime('%d-%m-%Y')}")
    try:
        ham = _iste(url)
    except RuntimeError:
        return None
    satirlar = ham.get("value") or []
    if not satirlar:
        return None
    alan = _kapanis_alani(satirlar[0]) or _kapanis_alani(satirlar[-1])
    if not alan:
        return None
    seri = {}
    for s in satirlar:
        t = s.get("HGDG_TARIH")
        d = s.get(alan)
        if not t or not isinstance(d, (int, float)) or d <= 0:
            continue
        try:
            seri[datetime.strptime(t, "%d-%m-%Y").strftime("%Y-%m-%d")] = float(d)
        except ValueError:
            continue
    if not seri:
        return None
    _seri_yaz(ad, seri)
    return seri


def endeks_fiyat(kod="XU100", gun=400, taze=False):
    ad = f"endeks-{kod.upper()}"
    if not taze:
        v = _seri_oku(ad)
        if v:
            return v
    bit = date.today(); bas = bit - timedelta(days=gun)
    url = (f"{ISY_ENDEKS}?period=1440&from={bas.strftime('%Y%m%d')}000000"
           f"&to={bit.strftime('%Y%m%d')}235959&endeks={kod.upper()}")
    try:
        ham = _iste(url)
    except RuntimeError:
        return None
    seri = {}
    for cift in (ham.get("data") or []):
        try:
            ts, deger = cift[0], float(cift[1])
        except (TypeError, ValueError, IndexError):
            continue
        g = datetime.utcfromtimestamp(ts / 1000).date() + timedelta(days=1)
        seri[g.isoformat()] = deger
    if not seri:
        return None
    _seri_yaz(ad, seri)
    return seri


# ------------------------------------------------------------- istatistik

def getiri(seri):
    """{'gün': fiyat} → [(gün, log-getiri)] — log getiri toplanabilir olduğu
    için pencere birleştirmede aritmetik getiriden güvenli."""
    gunler = sorted(seri)
    cikti = []
    for onceki, simdi in zip(gunler, gunler[1:]):
        a, b = seri[onceki], seri[simdi]
        if a > 0 and b > 0:
            cikti.append((simdi, math.log(b / a)))
    return cikti


def hizala(*getiriler):
    """Ortak günlerde kesişim; tek bir gün eksikse o gün tamamen düşer."""
    kumeler = [set(g for g, _ in s) for s in getiriler]
    ortak = sorted(set.intersection(*kumeler)) if kumeler else []
    return ortak, [[dict(s)[g] for g in ortak] for s in getiriler]


def _ort(x):
    return sum(x) / len(x) if x else 0.0


def beta_r2(y, x):
    """y'yi x ile açıkla: (beta, alfa, r²). Tek değişkenli EKK."""
    n = len(y)
    if n < 5:
        return 0.0, 0.0, 0.0
    my, mx = _ort(y), _ort(x)
    sxy = sum((a - mx) * (b - my) for a, b in zip(x, y))
    sxx = sum((a - mx) ** 2 for a in x)
    if sxx <= 0:
        return 0.0, 0.0, 0.0
    beta = sxy / sxx
    alfa = my - beta * mx
    syy = sum((b - my) ** 2 for b in y)
    if syy <= 0:
        return beta, alfa, 0.0
    kalan = sum((b - (alfa + beta * a)) ** 2 for a, b in zip(x, y))
    return beta, alfa, max(0.0, 1 - kalan / syy)


def nnls(X, y, tur=300):
    """min ||y - Xw||²,  w ≥ 0 — koordinat inişi.

    Negatif ağırlık yasağı şart: fon açığa satış yapmıyorsa negatif ağırlık
    veriye uydurma gürültüsüdür ve toplam ağırlığı (kaldıraç göstergesi)
    anlamsızlaştırır.
    """
    p = len(X)
    w = [0.0] * p
    kare = [sum(v * v for v in sutun) or 1e-12 for sutun in X]
    kalan = list(y)
    for _ in range(tur):
        oynama = 0.0
        for j in range(p):
            if w[j]:
                for i, v in enumerate(X[j]):
                    kalan[i] += w[j] * v
            yeni = max(0.0, sum(v * r for v, r in zip(X[j], kalan)) / kare[j])
            if yeni:
                for i, v in enumerate(X[j]):
                    kalan[i] -= yeni * v
            oynama = max(oynama, abs(yeni - w[j]))
            w[j] = yeni
        if oynama < 1e-9:
            break
    return w


def artik_std(X, y, w):
    """Uyumun açıklayamadığı günlük getirinin std'si = fonun hisse-DIŞI getirisi.

    Ağırlık tahmininin hata payı buna bağlı; aşağıdaki eşikler 12 tekrarlı
    sentetik simülasyonla kalibre edildi (14 aday, 30/45/60/90 gün pencere):
      artık %0,2/gün → ağırlık hatası ~4-6 puan, sıralama %100 doğru
      artık %0,5/gün → ~10-16 puan, sıralama %100 doğru
      artık %1,0/gün → ~15-30 puan, sıralama ancak %58-92 doğru
    """
    n = len(y)
    if n < 3:
        return 0.0
    kalan = [y[i] - sum(w[j] * X[j][i] for j in range(len(X))) for i in range(n)]
    ort = _ort(kalan)
    return (sum((k - ort) ** 2 for k in kalan) / n) ** 0.5


# --------------------------------------------------------------- komutlar

def komut_fiyat(argv):
    fon = (argv[0] if argv else "TLY").upper()
    periyod = int(_bayrak(argv, "--periyod", 12))
    seri = fon_fiyat(fon, periyod, taze="--taze" in argv)
    gunler = sorted(seri)
    ilk, son = seri[gunler[0]], seri[gunler[-1]]
    print(f"{fon}: {len(gunler)} gün  {gunler[0]} → {gunler[-1]}")
    print(f"  fiyat {ilk:,.6f} → {son:,.6f}   dönem getirisi %{(son/ilk-1)*100:,.2f}")
    g = [d for _, d in getiri(seri)]
    if g:
        yillik = math.sqrt(252) * (sum((v - _ort(g)) ** 2 for v in g) / len(g)) ** 0.5
        print(f"  günlük oynaklık %{ (sum((v-_ort(g))**2 for v in g)/len(g))**0.5*100:.2f}"
              f"   yıllıklandırılmış %{yillik*100:.1f}")


def komut_hisse(argv):
    kodlar = [k.strip().upper() for k in (argv[0] if argv else "").split(",") if k.strip()]
    if not kodlar:
        sys.exit("kullanım: hisse ASELS,EREGL [--gun 400]")
    gun = int(_bayrak(argv, "--gun", 400))
    for k in kodlar:
        s = hisse_fiyat(k, gun, taze="--taze" in argv)
        print(f"  {k:6s} {'—' if not s else f'{len(s)} gün, son {max(s)}'}")
        time.sleep(BEKLE)


def _evren(argv):
    yol = _bayrak(argv, "--dosya", None)
    if yol:
        with open(yol) as f:
            return [s.strip().upper() for s in f if s.strip() and not s.startswith("#")]
    return list(VARSAYILAN_EVREN)


def komut_evren(argv):
    kodlar = _evren(argv)
    gun = int(_bayrak(argv, "--gun", 400))
    print(f"{len(kodlar)} kod çekiliyor (önbellekte olan atlanır)…")
    olan, olmayan = [], []
    for k in kodlar:
        (olan if hisse_fiyat(k, gun) else olmayan).append(k)
        time.sleep(BEKLE)
    print(f"  alınan {len(olan)}, alınamayan {len(olmayan)}")
    if olmayan:
        print("  alınamayan: " + " ".join(olmayan))


def komut_teshis(argv):
    """Fonun getirisi NEREDEN geliyor: hisseden mi, başka bir şeyden mi?

    Buradaki ölçüt r² DEĞİL. r² getirinin oynaklığının ne kadarının endeksle
    açıklandığını söyler; getirinin KENDİSİNİN nereden geldiğini söylemez.
    Günlük %0,4 sabit carry taşıyan, endekse betası 0,18 olan bir fonda r²
    0,47 çıkabiliyor — yani "yarısı endeksten" gibi görünürken getirinin
    neredeyse tamamı hisse dışından geliyor. O yüzden dönem getirisi
    beta·endeks (hisse) + alfa·gün (hisse-dışı) + artık olarak ayrıştırılır.
    """
    fon = (argv[0] if argv else "TLY").upper()
    gun = int(_bayrak(argv, "--gun", 90))
    fseri = fon_fiyat(fon, 12)
    eseri = endeks_fiyat("XU100", max(gun + 60, 400))
    if not eseri:
        sys.exit("XU100 alınamadı — ağ/uç erişilebilir mi?")
    ortak, (fy, ex) = hizala(getiri(fseri), getiri(eseri))
    if len(ortak) < 20:
        sys.exit(f"ortak gün az ({len(ortak)}) — önce `fiyat` çalıştır")
    fy, ex, ortak = fy[-gun:], ex[-gun:], ortak[-gun:]
    n = len(ortak)
    beta, alfa, r2 = beta_r2(fy, ex)

    top_fon, top_end = sum(fy), sum(ex)
    hisseden = beta * top_end
    hisse_disi = alfa * n
    artik = top_fon - hisseden - hisse_disi
    boluk = abs(hisseden) + abs(hisse_disi) + abs(artik) or 1e-12
    p_his, p_dis = abs(hisseden) / boluk * 100, abs(hisse_disi) / boluk * 100

    print(f"\n{fon} × XU100 — son {n} işlem günü ({ortak[0]} → {ortak[-1]})")
    print(f"  dönem getirisi   fon %{(math.exp(top_fon)-1)*100:,.1f}"
          f"   endeks %{(math.exp(top_end)-1)*100:,.1f}")
    print(f"  beta {beta:.2f}   r² {r2:.2f}   günlük alfa %{alfa*100:.3f}")
    print(f"\n  GETİRİ NEREDEN GELİYOR")
    print(f"    hisse maruziyeti (beta×endeks)  %{p_his:5.1f}")
    print(f"    hisse dışı (alfa×gün)           %{p_dis:5.1f}")
    print(f"    açıklanamayan artık             %{abs(artik)/boluk*100:5.1f}")
    print()
    if p_his < 40:
        print("  → Getirinin ÇOĞU hisse maruziyetinden GELMİYOR. Fonun hisselerini")
        print("    kopyalamak bu getiriyi üretmez; kaynak muhtemelen türev/faiz/döviz")
        print("    pozisyonu ya da kaldıraçlı carry. `aday` çıktısı bu durumda fonun")
        print("    getirisini değil, yalnız küçük hisse ayağını tarif eder.")
    elif beta > 1.5:
        print(f"  → Getiri hisseden geliyor AMA beta {beta:.1f}: fon KALDIRAÇLI çalışıyor.")
        print("    Aynı hisseleri kaldıraçsız almak getirinin kabaca 1/%.1f'ini verir."
              % beta)
    else:
        print("  → Getiri ağırlıkla hisse maruziyetinden geliyor ve kaldıraç ılımlı;")
        print("    pozisyon kopyalama anlamlı olabilir. Aylık rapor gecikmesi yine de geçerli.")


def komut_aday(argv):
    """Fonun son pencerede ağırlığını YÜKSELTTİĞİ hisseleri fiyattan çıkarır.

    İki aşama, çünkü tek aşama yanlış cevap veriyor: BIST'te hisseler birlikte
    hareket ettiği için fonda hiç bulunmayan bir hisse de tek değişkenli
    beta'sını yükseltmiş görünebilir (sentetik testte fonda %0 ağırlıklı bir
    isim ikinci sıraya çıktı). O yüzden tek değişkenli tarama yalnızca KISA
    LİSTE üretir; kararı, aynı aday kümesini iki pencerede birlikte çözen
    negatiflik-yasaklı uyum verir — testte yanlış pozitifi 0,000'a indirip
    gerçek ağırlıkları 0,013 hatayla geri kurtardı.
    """
    fon = (argv[0] if argv else "TLY").upper()
    pencere = int(_bayrak(argv, "--pencere", 30))
    ilk_k = int(_bayrak(argv, "--ilk", 15))
    kodlar = _evren(argv)

    fseri = fon_fiyat(fon, 12)
    fg = getiri(fseri)

    metrik, seriler = [], {}
    for k in kodlar:
        hs = hisse_fiyat(k)
        if not hs:
            continue
        hg = getiri(hs)
        ortak, (fy, hx) = hizala(fg, hg)
        if len(ortak) < 2 * pencere + 5:
            continue
        b_son, _, r_son = beta_r2(fy[-pencere:], hx[-pencere:])
        b_onc, _, r_onc = beta_r2(fy[-2 * pencere:-pencere], hx[-2 * pencere:-pencere])
        metrik.append({"kod": k, "skor": (b_son - b_onc) * max(r_son - r_onc, 0.0),
                       "r_son": r_son, "r_onc": r_onc})
        seriler[k] = hg

    if len(metrik) < 2:
        sys.exit("aday hesaplanamadı — önce `evren` ile hisse serilerini çek")

    # Kısa liste: sadece "yükselenler" değil, önceden taşınanlar da girmeli;
    # yoksa ağırlığı azalan bir pozisyon uyumdan düşer ve kalan ağırlıklar şişer.
    kisa = []
    for anahtar in ("skor", "r_son", "r_onc"):
        for a in sorted(metrik, key=lambda m: -m[anahtar])[:8]:
            if a["kod"] not in kisa:
                kisa.append(a["kod"])
    kisa = kisa[:14]

    ortak, hepsi = hizala(fg, *[seriler[k] for k in kisa])
    if len(ortak) < 2 * pencere:
        sys.exit(f"ortak gün az ({len(ortak)}); --pencere küçült")
    y_son = hepsi[0][-pencere:]
    y_onc = hepsi[0][-2 * pencere:-pencere]
    X_son = [s[-pencere:] for s in hepsi[1:]]
    X_onc = [s[-2 * pencere:-pencere] for s in hepsi[1:]]
    w_son, w_onc = nnls(X_son, y_son), nnls(X_onc, y_onc)

    satir = sorted(({"kod": k, "onc": o, "son": s, "delta": s - o}
                    for k, o, s in zip(kisa, w_onc, w_son)),
                   key=lambda d: -d["delta"])

    # Hata payı ÖNCE hesaplanır: "yeni pozisyon" damgasını gürültü sınırının
    # altındaki bir ağırlığa basmak, aracın verebileceği en pahalı yanlış.
    artik = artik_std(X_son, y_son, w_son)
    olcek = 30.0 / max(pencere, 5)          # pencere büyüdükçe hata küçülür
    if artik < 0.002:
        pay, hukum = 6 * olcek, "sıralama ve ağırlıklar güvenilir"
    elif artik < 0.005:
        pay, hukum = 16 * olcek, "sıralama güvenilir, ağırlıklar kaba"
    else:
        pay, hukum = 30 * olcek, "SIRALAMA BİLE ŞÜPHELİ — --pencere 90 dene"
    esik = pay / 100.0

    g1, g2 = ortak[-2 * pencere], ortak[-pencere - 1]
    print(f"\n{fon} — çıkarsanan hisse ağırlıkları, {len(kisa)} adaylık kısa liste")
    print(f"  önceki pencere {g1} → {g2}   |   son pencere {ortak[-pencere]} → {ortak[-1]}\n")

    anlamli = [d for d in satir if abs(d["delta"]) >= esik]
    zayif = [d for d in satir if abs(d["delta"]) < esik and max(d["son"], d["onc"]) >= esik]

    if anlamli:
        print(f"  {'kod':6s} {'önce':>7s} {'sonra':>7s} {'değişim':>9s}")
        for d in anlamli[:ilk_k]:
            # "YENİ" ancak önceki ağırlık bandın YARISININ da altındaysa ve yeni
            # ağırlık bandın 3 katıysa basılır: ±16 puanlık bir bantta %20'lik
            # eski bir pozisyonu sıfırdan ayırt etmek mümkün değil, damga
            # veriden fazlasını iddia eder.
            im = "YENİ" if d["onc"] < esik / 2 and d["son"] >= 3 * esik else ""
            print(f"  {d['kod']:6s} %{d['onc']*100:6.1f} %{d['son']*100:6.1f} "
                  f"{d['delta']*100:+8.1f} p  {im}")
    else:
        print("  Hata payını aşan tek bir ağırlık değişimi yok — bu pencerede fonun")
        print("  hisse dağılımı ölçülebilir biçimde değişmemiş görünüyor.")

    if zayif:
        print(f"\n  taşınıyor ama değişimi gürültü sınırının altında: "
              + ", ".join(f"{d['kod']} %{d['son']*100:.0f}" for d in zayif[:8]))

    t_onc, t_son = sum(w_onc), sum(w_son)
    print(f"\n  toplam hisse maruziyeti  %{t_onc*100:.0f} → %{t_son*100:.0f}")
    print(f"  hisse-dışı günlük getiri  %{artik*100:.2f}/gün"
          f"   → ağırlık hata payı ±{pay:.0f} puan; {hukum}")
    if t_son > 1.15:
        print("  → 100'ün belirgin üstü: fon KALDIRAÇLI. Aynı hisseleri kaldıraçsız")
        print("    almak bu getiriyi üretmez.")
    print("\n  UYARI: bu açıklanmış veri değil, fiyattan istatistiksel çıkarımdır.")
    print("  Kesin döküm için aylık portföy dağılım raporuna bak (`anlik` + `fark`).")
    print("  Önce `teshis` çalıştır: getiri hisseden gelmiyorsa bu tablo anlamsızdır.")


# --- Aşağıdaki iki uç bu oturumda DOĞRULANAMADI (egress politikası ilgili
# hostları kapatıyor). Şema varsaymak yerine "sonda" olarak yazıldılar: isteği
# ve ham yanıt yapısını basarlar. Şema tutmazsa betik sessizce yanlış veri
# üretmez, ne aldığını gösterir ve sen ayarlarsın.

def _sonda(ad, url, govde):
    print(f"  → {ad}: POST {url}")
    print(f"    gövde: {json.dumps(govde, ensure_ascii=False)}")
    try:
        ham = _iste(url, govde)
    except RuntimeError as e:
        print(f"    BAŞARISIZ: {e}")
        return None
    if isinstance(ham, dict):
        print(f"    yanıt: sözlük, anahtarlar = {list(ham)[:12]}")
        for a in ("resultList", "data", "result", "value", "list"):
            if isinstance(ham.get(a), list):
                print(f"    '{a}' listesinde {len(ham[a])} kayıt")
                return ham[a]
        return ham
    if isinstance(ham, list):
        print(f"    yanıt: {len(ham)} kayıtlı liste")
        return ham
    print(f"    yanıt: {type(ham).__name__}")
    return ham


def komut_kap(argv):
    """KAP'tan aylık 'Portföy Dağılım Raporu' bildirimlerini arar (DOĞRULANMADI)."""
    fon = (argv[0] if argv else "TLY").upper()
    ay = _bayrak(argv, "--ay", None)
    if ay:
        yil, a = (int(x) for x in ay.split("-"))
        bas = date(yil, a, 1)
        bit = (date(yil + (a == 12), (a % 12) + 1, 1) - timedelta(days=1))
    else:
        bit = date.today(); bas = bit - timedelta(days=75)
    kayitlar = _sonda("KAP fon bildirimleri",
                      "https://www.kap.org.tr/tr/api/disclosure/funds/byCriteria",
                      {"fromDate": bas.strftime("%d.%m.%Y"),
                       "toDate": bit.strftime("%d.%m.%Y")})
    if not isinstance(kayitlar, list) or not kayitlar:
        print("\n  Kayıt alınamadı. Uç adı/gövdesi değişmiş olabilir; yukarıdaki")
        print("  isteği tarayıcının ağ sekmesiyle karşılaştır.")
        return
    print(f"\n  örnek kaydın alanları: {list(kayitlar[0])[:16]}\n")
    metin = lambda k: json.dumps(k, ensure_ascii=False).upper()
    esles = [k for k in kayitlar if fon in metin(k) and "DAĞILIM" in metin(k)]
    print(f"  {fon} + 'dağılım' geçen {len(esles)} kayıt:")
    for k in esles[:15]:
        print("   ", json.dumps(k, ensure_ascii=False)[:220])
    if not esles:
        print("    (yok — filtreyi gevşetmek için ham kayıtlara bak)")
        print("   ", json.dumps(kayitlar[0], ensure_ascii=False)[:300])


def komut_dagilim(argv):
    """TEFAS varlık SINIFI dağılımı — hisse bazında değil (DOĞRULANMADI)."""
    fon = (argv[0] if argv else "TLY").upper()
    gun = int(_bayrak(argv, "--gun", 120))
    bit = date.today(); bas = bit - timedelta(days=gun)
    kayitlar = _sonda("TEFAS portföy dağılımı",
                      "https://www.tefas.gov.tr/api/funds/dagilimSiraliGetirT",
                      {"fonKodu": fon, "dil": "TR",
                       "basTarih": bas.strftime("%Y%m%d"),
                       "bitTarih": bit.strftime("%Y%m%d")})
    if not isinstance(kayitlar, list) or not kayitlar:
        print("\n  Alınamadı. Bu uç tefas-crawler 0.6.0'da YOK; varlığı arama")
        print("  sonuçlarından geldi ve teyit edilmedi. Çalışmazsa hisse ağırlığı")
        print("  sinyali için `teshis` (fiyattan çıkarım) tek yol.")
        return
    print(f"\n  {len(kayitlar)} kayıt; ilk kaydın alanları:")
    print("   ", json.dumps(kayitlar[0], ensure_ascii=False)[:400])
    print("\n  NOT: bu VARLIK SINIFI kırılımıdır (hisse %X, ters repo %Y).")
    print("  Hisse bazında döküm vermez; onun için aylık rapor gerekir.")


def _hisse_ham(kod, gun=20):
    """HisseTekil'in ham son kaydı — piyasa değeri alanı buradan okunur."""
    bit = date.today(); bas = bit - timedelta(days=gun)
    url = (f"{ISY_HISSE}?hisse={kod.upper()}"
           f"&startdate={bas.strftime('%d-%m-%Y')}&enddate={bit.strftime('%d-%m-%Y')}")
    try:
        ham = _iste(url)
    except RuntimeError:
        return None
    satirlar = [s for s in (ham.get("value") or []) if isinstance(s, dict)]
    return satirlar[-1] if satirlar else None


def _pd_oku(satir):
    """Piyasa değeri alanını bul. Ad sürümden sürüme oynadığı için sırayla
    denenir; hiçbiri tutmazsa None döner ve çağıran alan adlarını basar."""
    for a in ("HGDG_PD", "PD", "HGDG_PIYASA_DEGERI", "PIYASA_DEGERI"):
        d = satir.get(a)
        if isinstance(d, (int, float)) and d > 0:
            return float(d), a
    return None, None


def komut_buyukluk(argv):
    """Verilen hisseleri PİYASA DEĞERİNE göre küçükten büyüğe sıralar.

    Fiyat piyasa değeri DEĞİLDİR: 4.462 TL'lik bir hisse, az sayıda pay
    dolaşımdaysa 20 TL'lik bir hisseden küçük şirket olabilir. Bu yüzden
    "küçük şirket" kararı fiyattan değil buradan verilir.

    --fon-buyuklugu verilirse fonun o şirketteki pozisyonunun şirketin piyasa
    değerine oranı da hesaplanır. Asıl sınır bu: fon şirketin %5'ini tutuyorsa
    o pozisyonun arkasından gitmek, çıkarken karşında alıcı bulamamak demektir.
    """
    yol = _bayrak(argv, "--dosya", None)
    fon_buyukluk = _bayrak(argv, "--fon-buyuklugu", None)
    fon_buyukluk = float(fon_buyukluk) if fon_buyukluk else None
    agirlik = {}
    if yol:
        with open(yol, encoding="utf-8-sig") as f:
            for s in csv.DictReader(l for l in f if not l.startswith("#")):
                kod = (s.get("tam_kod") or "").strip().upper()
                if not kod:
                    continue
                agirlik[kod] = (float(s.get("yuzde") or 0),
                                float(s.get("degisim_puan") or 0))
        kodlar = list(agirlik)
    else:
        kodlar = [k.strip().upper() for k in (argv[0] if argv else "").split(",") if k.strip()]
    if not kodlar:
        sys.exit("kullanım: buyukluk KOD1,KOD2  |  buyukluk --dosya portfoy.csv\n"
                 "  (CSV'de 'tam_kod' sütunu dolu olmalı — kırpık kodlar sorgulanamaz)")

    sonuc, alansiz = [], None
    for k in kodlar:
        satir = _hisse_ham(k)
        time.sleep(BEKLE)
        if not satir:
            sonuc.append((k, None)); continue
        pd, alan = _pd_oku(satir)
        if pd is None and alansiz is None:
            alansiz = sorted(satir)
        sonuc.append((k, pd))

    if alansiz:
        print("  Piyasa değeri alanı tanınmadı. Yanıttaki alan adları:")
        print("   ", ", ".join(alansiz))
        print("  Doğru alanı _pd_oku() içindeki listeye ekle.\n")

    bilinen = sorted([(k, v) for k, v in sonuc if v], key=lambda t: t[1])
    bilinmez = [k for k, v in sonuc if not v]

    print(f"\nPiyasa değerine göre küçükten büyüğe ({len(bilinen)} hisse)\n")
    bas = f"  {'kod':8s} {'piyasa değeri':>18s}"
    if agirlik:
        bas += f" {'fon ağ.':>8s} {'değişim':>9s}"
    if fon_buyukluk:
        bas += f" {'fonun payı':>11s}"
    print(bas)
    for k, pd in bilinen:
        satir = f"  {k:8s} {pd:18,.0f}"
        if agirlik:
            y, d = agirlik.get(k, (0, 0))
            satir += f" {y:7.2f}% {d:+8.2f}p"
        if fon_buyukluk and agirlik:
            y, _ = agirlik.get(k, (0, 0))
            oran = (fon_buyukluk * y / 100.0) / pd * 100.0
            satir += f" {oran:10.2f}%" + ("  ← ŞİRKETİN BÜYÜK KISMI" if oran > 5 else "")
        print(satir)
    if bilinmez:
        print(f"\n  veri alınamayan: {', '.join(bilinmez)}")
    if bilinen and not fon_buyukluk:
        print("\n  İpucu: --fon-buyuklugu <TL> ver, fonun her şirkette kaçta kaçını")
        print("  tuttuğu da hesaplansın. Peşinden gidilebilirliği asıl o belirler.")


def komut_anlik(argv):
    """Elle indirilen aylık dökümü içe al: CSV (kod,ad,yuzde[,tl]) ya da JSON."""
    fon = (argv[0] if argv else "TLY").upper()
    ay = _bayrak(argv, "--ay", None)
    yol = _bayrak(argv, "--dosya", None)
    if not ay or not yol:
        sys.exit("kullanım: anlik TLY --ay 2026-07 --dosya temmuz.csv")
    kayit = []
    if yol.lower().endswith(".json"):
        ham = json.load(open(yol))
        kayit = ham if isinstance(ham, list) else ham.get("hisseler", [])
    else:
        with open(yol, newline="", encoding="utf-8-sig") as f:
            for s in csv.DictReader(f):
                d = {(k or "").strip().lower(): (v or "").strip() for k, v in s.items()}
                kod = d.get("kod") or d.get("hisse") or d.get("code")
                yzd = d.get("yuzde") or d.get("oran") or d.get("agirlik")
                if not kod or not yzd:
                    continue
                kayit.append({"kod": kod.upper(),
                              "ad": d.get("ad", ""),
                              "yuzde": float(yzd.replace("%", "").replace(",", ".")),
                              "tl": d.get("tl", "")})
    if not kayit:
        sys.exit("dosyadan hiç satır okunamadı (sütunlar: kod,yuzde[,ad,tl])")
    hedef = os.path.join(_dizin("anlik", fon), f"{ay}.json")
    json.dump({"fon": fon, "ay": ay, "hisseler": kayit},
              open(hedef, "w"), ensure_ascii=False, indent=1)
    print(f"{fon} {ay}: {len(kayit)} hisse yazıldı → {hedef}")


def komut_fark(argv):
    fon = (argv[0] if argv else "TLY").upper()
    dizin = os.path.join(ONBELLEK, "anlik", fon)
    aylar = sorted(f[:-5] for f in os.listdir(dizin)) if os.path.isdir(dizin) else []
    if len(aylar) < 2:
        sys.exit(f"{fon}: karşılaştırmak için en az iki ay lazım (şu an {len(aylar)}). "
                 "`anlik` ile aylık dökümleri içe al.")
    onc, son = aylar[-2], aylar[-1]
    a = {h["kod"]: h["yuzde"] for h in json.load(open(os.path.join(dizin, onc + ".json")))["hisseler"]}
    b = {h["kod"]: h["yuzde"] for h in json.load(open(os.path.join(dizin, son + ".json")))["hisseler"]}

    yeni = sorted(((k, b[k]) for k in b if k not in a), key=lambda t: -t[1])
    cikan = sorted(((k, a[k]) for k in a if k not in b), key=lambda t: -t[1])
    artan = sorted(((k, a[k], b[k], b[k] - a[k]) for k in b if k in a and b[k] - a[k] > 0.01),
                   key=lambda t: -t[3])
    azalan = sorted(((k, a[k], b[k], b[k] - a[k]) for k in b if k in a and b[k] - a[k] < -0.01),
                    key=lambda t: t[3])

    print(f"\n{fon}: {onc} → {son}\n")
    print(f"YENİ GİREN ({len(yeni)})")
    for k, y in yeni:
        print(f"  + {k:6s} %{y:6.2f}")
    print(f"\nAĞIRLIĞI ARTAN ({len(artan)})")
    for k, e, y, d in artan:
        kat = f" ({y/e:.1f}×)" if e > 0.01 else ""
        print(f"  ↑ {k:6s} %{e:6.2f} → %{y:6.2f}   {d:+.2f} puan{kat}")
    print(f"\nAĞIRLIĞI AZALAN ({len(azalan)})")
    for k, e, y, d in azalan:
        print(f"  ↓ {k:6s} %{e:6.2f} → %{y:6.2f}   {d:+.2f} puan")
    print(f"\nTAMAMEN ÇIKILAN ({len(cikan)})")
    for k, e in cikan:
        print(f"  − {k:6s} %{e:6.2f}")
    print(f"\n  Toplam hisse ağırlığı: %{sum(a.values()):.1f} → %{sum(b.values()):.1f}")
    print("  Not: bu ay-sonu fotoğrafıdır ve yayımı 1-5 hafta gecikmelidir.")


def _bayrak(argv, ad, varsayilan):
    if ad in argv:
        i = argv.index(ad)
        if i + 1 < len(argv):
            return argv[i + 1]
    return varsayilan


KOMUTLAR = {"fiyat": komut_fiyat, "hisse": komut_hisse, "evren": komut_evren,
            "teshis": komut_teshis, "aday": komut_aday,
            "anlik": komut_anlik, "fark": komut_fark,
            "kap": komut_kap, "dagilim": komut_dagilim,
            "buyukluk": komut_buyukluk}


def main():
    if len(sys.argv) < 2 or sys.argv[1] not in KOMUTLAR:
        print(__doc__)
        sys.exit(0 if len(sys.argv) < 2 else 1)
    KOMUTLAR[sys.argv[1]](sys.argv[2:])


if __name__ == "__main__":
    main()
