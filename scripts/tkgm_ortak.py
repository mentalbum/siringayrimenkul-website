#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""TKGM cbsapi yanıt alanlarını çözen ortak yardımcılar.

Birden çok script aynı yanıt gövdesini okuyor; çözümleyici kopyalandığında
sürümler ayrışıyor ve fark sessiz veri kaybı olarak çıkıyor. Yeni bir script
cbsapi yanıtı ayrıştıracaksa çözümleyicisini kopyalamak yerine buradan alsın.

Hyphen'li dosya adları import edilemediği için modül adı alt çizgili;
`python3 scripts/<script>.py` çağrısında scripts/ zaten sys.path[0] olur.
"""
import re

# cbsapi'nin ondalık biçimi istekten isteğe değişiyor: aynı uç, aynı turda,
# 3 saniye arayla gelen iki yanıttan biri "9.939,00" (TR) diğeri "15,523.00"
# (US) olabiliyor (2026-07-30 04:00 turunda gözlendi). Yani biçim tarihten,
# uçtan ya da parametreden kestirilemez — yalnız değerin kendisinden okunur.
_TR_BICIM = re.compile(r"^\d{1,3}(?:\.\d{3})*,\d{1,2}$")
_US_BICIM = re.compile(r"^\d{1,3}(?:,\d{3})*\.\d{1,2}$")
_AYRACSIZ = re.compile(r"^\d+(?:\.\d{1,2})?$")


def alan_coz(ham, en_az=0, en_cok=None):
    """'9.939,00' (TR) / '15,523.00' (US) / '950' → m² tam sayısı, yoksa None.

    Ayraç konumu iki biçimi ayırt etmeye yetmediğinde ("1.234" 1234 m² de
    olabilir 1,234 m² de) TAHMİN EDİLMEZ, None döner: eksik alan boşluk
    bırakır, yanlış alan yayına çıkar.

    en_az/en_cok aklıselim sınırıdır; aralık dışı değer veri hatası sayılır.
    """
    s = str(ham or "").strip()
    if _TR_BICIM.match(s):
        s = s.replace(".", "").replace(",", ".")
    elif _US_BICIM.match(s):
        s = s.replace(",", "")
    elif not _AYRACSIZ.match(s):
        return None
    try:
        deger = float(s)
    except ValueError:
        return None
    if deger < en_az or (en_cok is not None and deger > en_cok):
        return None
    return int(round(deger))
