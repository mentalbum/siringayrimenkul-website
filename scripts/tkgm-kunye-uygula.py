#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""TKGM önbelleğindeki parsel yanıtlarını kayıtların adalar[] alanlarına işler.

Yazılan alanlar (YALNIZ veri; aciklama/ozellikler METİNLERİNE DOKUNULMAZ):
  adalar[].alanM2   ← properties.alan  (yüzölçümü, m²)
  adalar[].nitelik  ← properties.nitelik (tapu niteliği ham metni)
lib/kunye.ts bu iki alanı yalnız METİNDEN çıkarım yapılamadığında yedek kaynak
olarak okur; görünür metne ada/parsel numarası yazılmaz.

ATLAMA KURALLARI (her biri gerçek bir hata sınıfına karşılık gelir):
  - Aynı parsel birden çok site kaydında geçiyorsa (48 vaka) parselin alanı ve
    blok/kat niteliği tek siteye mal edilemez → hiçbir şey yazılmaz.
  - properties.durum == "0" kapalı (yenilemeyle gitmiş) parseldir → yazılmaz.
  - Konut dışı nitelik (okul, spor tesisi, park, trafo…) → yazılmaz, çelişki
    listesine düşer (Sky Göksu dersi: yanlış varlığı dört kaynak doğrulayabilir).

ALAN BİÇİMİ TUZAĞI: cbsapi iki biçim döndürüyor — eski yanıtlar "9.939,00"
(TR), 2026-07-30 sonrası "15,523.00" (US). Tek biçim varsayan çözümleyici
9.939 m²'yi 9,9 m² okur; alan_coz her ikisini de ayırt eder.

Kullanım: python3 scripts/tkgm-kunye-uygula.py <rapor.json> [--yaz]
"""
import json, os, re, sys, glob, collections

CACHE = os.path.expanduser("~/.cache/tkgm-eryaman")
KOK = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
SITELER = os.path.join(KOK, "content", "siteler")

KONUT_DISI_NITELIK = re.compile(
    r"okul|üniversite|park[ıi]?$|yol|trafo|cami|yurt|hastane|sağlık|karakol|"
    r"belediye|ibadet|mezarlık|dere|kanal|spor tesisi|kreş",
    re.I,
)
# Konut sözcüğü de geçiyorsa parsel karmadır ("Betonarme Apartman Ve Betonarme
# Kreş") — konut dışı sayılmaz, yalnız hiç konut ifadesi olmayanlar elenir.
KONUT_IZI = re.compile(r"apartman|mesken|konut|daire|dubleks|\bev\b|bina|blok", re.I)

TR_BICIM = re.compile(r"^\d{1,3}(?:\.\d{3})*,\d{1,2}$")
US_BICIM = re.compile(r"^\d{1,3}(?:,\d{3})*\.\d{1,2}$")


def alan_coz(ham):
    """'9.939,00' (TR) ve '15,523.00' (US) biçimlerini m² tam sayısına çevirir."""
    s = str(ham or "").strip()
    if TR_BICIM.match(s):
        s = s.replace(".", "").replace(",", ".")
    elif US_BICIM.match(s):
        s = s.replace(",", "")
    elif re.match(r"^\d+(?:\.\d{1,2})?$", s):
        pass
    else:
        return None
    try:
        deger = float(s)
    except ValueError:
        return None
    if deger < 100 or deger > 500000:
        return None
    return int(round(deger))


def cache_indeksi():
    idx = {}
    for yol in glob.glob(os.path.join(CACHE, "*.json")):
        ad = os.path.basename(yol)
        if ad in ("parsel-nitelik-haritasi.json", "eksik-hedefler.json"):
            continue
        try:
            d = json.load(open(yol))
        except Exception:
            continue
        if not isinstance(d, dict):
            continue
        pr = d.get("properties") or {}
        ada, parsel = str(pr.get("adaNo") or ""), str(pr.get("parselNo") or "")
        if not ada or not parsel:
            continue
        idx[f"{ada}/{parsel}"] = {
            "alan": alan_coz(pr.get("alan")),
            "nitelik": " ".join((pr.get("nitelik") or "").split()),
            "durum": str(pr.get("durum") or ""),
        }
    # Nitelik haritası yalnız boşluk doldurur (geometrisiz özet döküm).
    hm = os.path.join(CACHE, "parsel-nitelik-haritasi.json")
    if os.path.exists(hm):
        for k, v in json.load(open(hm)).items():
            if k in idx:
                continue
            idx[k] = {"alan": alan_coz(v[1]), "nitelik": " ".join((v[0] or "").split()), "durum": ""}
    return idx


def kayitlar():
    for mah in sorted(os.listdir(SITELER)):
        dizin = os.path.join(SITELER, mah)
        if not os.path.isdir(dizin):
            continue
        for dosya in sorted(os.listdir(dizin)):
            if not dosya.endswith(".json"):
                continue
            yol = os.path.join(dizin, dosya)
            yield mah, yol, json.load(open(yol))


def main():
    rapor_yol = sys.argv[1]
    yaz = "--yaz" in sys.argv
    idx = cache_indeksi()

    kullanim = collections.Counter()
    for mah, _, d in kayitlar():
        for a in d.get("adalar") or []:
            kullanim[f"{a['no']}/{a.get('parsel') or '1'}"] += 1

    rapor = {"yazilan": [], "paylasimli": [], "kapali": [], "konutDisi": [], "cacheYok": []}
    for mah, yol, d in kayitlar():
        adalar = d.get("adalar") or []
        if not adalar:
            continue
        degisti = False
        for a in adalar:
            anahtar = f"{a['no']}/{a.get('parsel') or '1'}"
            c = idx.get(anahtar)
            etiket = f"{mah}/{d['slug']}"
            if not c:
                rapor["cacheYok"].append({"slug": etiket, "parsel": anahtar})
                continue
            if kullanim[anahtar] > 1:
                rapor["paylasimli"].append({"slug": etiket, "parsel": anahtar, "siteSayisi": kullanim[anahtar]})
                continue
            if c["durum"] == "0":
                rapor["kapali"].append({"slug": etiket, "parsel": anahtar})
                continue
            if KONUT_DISI_NITELIK.search(c["nitelik"]) and not KONUT_IZI.search(c["nitelik"]):
                rapor["konutDisi"].append({"slug": etiket, "parsel": anahtar, "nitelik": c["nitelik"]})
                continue
            eklenen = {}
            if c["alan"] and a.get("alanM2") != c["alan"]:
                a["alanM2"] = c["alan"]
                eklenen["alanM2"] = c["alan"]
            if c["nitelik"] and a.get("nitelik") != c["nitelik"]:
                a["nitelik"] = c["nitelik"]
                eklenen["nitelik"] = c["nitelik"]
            if eklenen:
                degisti = True
                rapor["yazilan"].append({"slug": etiket, "parsel": anahtar, **eklenen})
        if degisti and yaz:
            # Sondaki satır sonu KORUNUR: kayıtlar üzerinde paralel oturumlar
            # çalışıyor, newline'ı düşüren yazım 720 dosyada sahte fark üretir.
            with open(yol, "w") as f:
                json.dump(d, f, ensure_ascii=False, indent=2)
                f.write("\n")

    json.dump(rapor, open(rapor_yol, "w"), ensure_ascii=False, indent=1)
    print(" ".join(f"{k}={len(v)}" for k, v in rapor.items()), f"(yaz={yaz})")


if __name__ == "__main__":
    main()
