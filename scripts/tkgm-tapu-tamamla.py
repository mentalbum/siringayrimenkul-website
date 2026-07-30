#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Tapu niteliği metinde OLMAYAN kayıtlar için TKGM nokta sorgusu turu.

Tasarım (aynı-ad tuzağına kapalı): sorgu kaydın KENDİ koordinatından yapılır;
dönen adaNo kayıttaki adalar[] ile karşılaştırılır —
  - eşleşiyorsa: zeminKmdurum/nitelik/alan o kayda GÜVENLE aittir → sonuç dosyasına "uygun"
  - eşleşmiyorsa: koordinat ya da adalar hatalı demektir → "celiski" (kayda YAZILMAZ, kart açılır)
Metinlere bu script DOKUNMAZ; uygulama ayrı adımda, çapraz ajan denetiminden sonra.

Kullanım: python3 scripts/tkgm-tapu-tamamla.py <hedefler.json> <cikti.json>
403'te durur, kalan hedefleri cikti'ya "kota" durumuyla yazar (ertesi gün devam).
"""
import json, os, sys, time, urllib.request

CACHE = os.path.expanduser("~/.cache/tkgm-eryaman")
os.makedirs(CACHE, exist_ok=True)
HDR = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
       "Referer": "https://parselsorgu.tkgm.gov.tr/"}
BEKLE = 3.0


def sorgu(lat, lng):
    url = f"https://cbsapi.tkgm.gov.tr/megsiswebapi.v3/api/parsel/{lat}/{lng}/"
    req = urllib.request.Request(url, headers=HDR)
    return json.load(urllib.request.urlopen(req, timeout=30))


def main():
    hedefler = json.load(open(sys.argv[1]))
    cikti_yol = sys.argv[2]
    sonuclar = []
    kota = False
    for i, h in enumerate(hedefler):
        if kota:
            sonuclar.append({**h, "durum": "kota"})
            continue
        onbellek = os.path.join(CACHE, f"nokta-serp-{h['slug']}.json")
        try:
            if os.path.exists(onbellek):
                r = json.load(open(onbellek))
            else:
                r = sorgu(h["lat"], h["lng"])
                json.dump(r, open(onbellek, "w"), ensure_ascii=False)
                time.sleep(BEKLE)
        except Exception as e:
            if "403" in repr(e):
                kota = True
                sonuclar.append({**h, "durum": "kota"})
                print(f"[{i}] {h['slug']}: 403 KOTA — kalanlar kuyruğa", flush=True)
                continue
            sonuclar.append({**h, "durum": "hata", "hata": repr(e)[:80]})
            print(f"[{i}] {h['slug']}: HATA {repr(e)[:60]}", flush=True)
            continue
        p = (r or {}).get("properties") or {}
        if not p:
            sonuclar.append({**h, "durum": "bos"})
            print(f"[{i}] {h['slug']}: BOŞ yanıt", flush=True)
            continue
        ada = str(p.get("adaNo") or "")
        kayit_adalar = [str(a) for a in h.get("adalar", [])]
        eslesme = ada in kayit_adalar
        sonuclar.append({
            **h,
            "durum": "uygun" if eslesme else "celiski",
            "tkgm": {
                "adaNo": ada, "parselNo": str(p.get("parselNo") or ""),
                "nitelik": " ".join((p.get("nitelik") or "").split()),
                "alan": p.get("alan"), "zeminKmdurum": p.get("zeminKmdurum"),
                "kadastroMah": p.get("mahalleAd"), "ilce": p.get("ilceAd"),
            },
        })
        isaret = "OK " if eslesme else "!!!"
        print(f"[{i}] {isaret} {h['slug']}: {ada}/{p.get('parselNo')} "
              f"{p.get('zeminKmdurum')} | {(p.get('nitelik') or '')[:45]}", flush=True)
    json.dump(sonuclar, open(cikti_yol, "w"), ensure_ascii=False, indent=1)
    ozet = {}
    for s in sonuclar:
        ozet[s["durum"]] = ozet.get(s["durum"], 0) + 1
    print("ÖZET:", json.dumps(ozet, ensure_ascii=False), flush=True)


if __name__ == "__main__":
    main()
