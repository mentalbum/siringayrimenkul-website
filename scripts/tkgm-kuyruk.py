#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Bekleyen TKGM sorgu kuyruğu — kota açılınca: python3 scripts/tkgm-kuyruk.py [--uygula]

Kota dolunca (403) sorgular buraya birikir; ertesi gün tek komutla koşulur.
--uygula: doğrudan-parsel hedeflerinde boundary dosyasını da üretir (kayıttaki
adalar ile sorgu sonucu eşleşiyorsa). Metinlere asla dokunmaz — o iş elle.

Kuyruk güncelleme: aşağıdaki DOGRUDAN / NOKTA listelerini düzenle.
Sonuçlar CACHE dizinine yeni-<ada>-<parsel>.json / nokta-<etiket>.json olarak yazılır.
"""
import json, os, sys, time, urllib.request

CACHE = os.path.expanduser("~/.cache/tkgm-eryaman")
os.makedirs(CACHE, exist_ok=True)
KOK = os.path.join(os.path.dirname(__file__), "..")
HDR = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
       "Referer": "https://parselsorgu.tkgm.gov.tr/"}
BEKLE = 3.0  # sn — art arda isteklerde rate-limit şart

# (etiket, kadastroId, ada, parsel, kayıt-yolu | None)
# Kayıt yolu verilirse --uygula boundary üretir.
DOGRUDAN = [
    # kuyruk boş — yeni bekleyenleri buraya ekle
]

# (etiket, lat, lng) — koordinattan parsel bulunur; kayda işleme elle yapılır.
NOKTA = [
    # kuyruk boş
]


def sorgu(url):
    req = urllib.request.Request(url, headers=HDR)
    return json.load(urllib.request.urlopen(req, timeout=30))


def main():
    uygula = "--uygula" in sys.argv
    hata403 = False

    for etiket, kad, ada, parsel, kayit in DOGRUDAN:
        hedef = os.path.join(CACHE, f"yeni-{ada}-{parsel}.json")
        if os.path.exists(hedef):
            r = json.load(open(hedef)); kaynak = "CACHE"
        else:
            try:
                r = sorgu(f"https://cbsapi.tkgm.gov.tr/megsiswebapi.v3/api/parsel/{kad}/{ada}/{parsel}/")
                json.dump(r, open(hedef, "w")); kaynak = "CANLI"
                time.sleep(BEKLE)
            except Exception as e:
                if "403" in repr(e): hata403 = True
                print(f"{etiket:16} {ada}/{parsel}: HATA {repr(e)[:60]}"); continue
        pr = r.get("properties", {})
        nit = " ".join((pr.get("nitelik") or "").split())
        print(f"{etiket:16} {ada}/{parsel} [{kaynak}]: {nit[:60]} | {pr.get('alan')}")
        if uygula and kayit and r.get("geometry"):
            tam = os.path.join(KOK, kayit)
            d = json.load(open(tam))
            adalar = [f"{a['no']}/{a.get('parsel', '1')}" for a in d.get("adalar", [])]
            if f"{ada}/{parsel}" in adalar:
                byol = tam.replace(".json", "-boundary.geojson")
                b = {"type": "Feature", "properties": {"adalar": [f"{ada}/{parsel}"]},
                     "geometry": r["geometry"]}
                json.dump(b, open(byol, "w"), ensure_ascii=False)
                if not d.get("sinirGeoJSON"):
                    d["sinirGeoJSON"] = kayit.replace("content/", "").replace(".json", "-boundary.geojson")
                    json.dump(d, open(tam, "w"), ensure_ascii=False, indent=2)
                print(f"  → boundary üretildi: {byol}")
            else:
                print(f"  ! kayıttaki adalar {adalar} sorguyla eşleşmiyor — boundary ÜRETİLMEDİ")

    for etiket, lat, lng in NOKTA:
        hedef = os.path.join(CACHE, f"nokta-{etiket}.json")
        if os.path.exists(hedef):
            r = json.load(open(hedef)); kaynak = "CACHE"
        else:
            try:
                r = sorgu(f"https://cbsapi.tkgm.gov.tr/megsiswebapi.v3/api/parsel/{lat}/{lng}/")
                json.dump(r, open(hedef, "w")); kaynak = "CANLI"
                time.sleep(BEKLE)
            except Exception as e:
                if "403" in repr(e): hata403 = True
                print(f"{etiket:16} NOKTA: HATA {repr(e)[:60]}"); continue
        pr = r.get("properties", {})
        nit = " ".join((pr.get("nitelik") or "").split())
        print(f"{etiket:16} NOKTA [{kaynak}] → {pr.get('mahalleAd')} {pr.get('adaNo')}/{pr.get('parselNo')}: {nit[:50]} | {pr.get('alan')}")

    if hata403:
        print("\nKOTA HÂLÂ KAPALI (403) — daha sonra yeniden dene.")


if __name__ == "__main__":
    main()
