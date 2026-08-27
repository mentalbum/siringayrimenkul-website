#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Künyesi eksik kayıtların parsellerini TKGM doğrudan ucundan çeker.

Hedef sırası (kota sınırlı, sıra = kazanç):
  1. Künyesinde alan veya kat EKSİK olan kayıtlar — bu boşluk scripts/
     kunye-dokum.mjs çalıştırılarak GERÇEK parser'dan öğrenilir, tahmin
     edilmez; metinden zaten alan/kat çıkan sitede sorgu kazanç getirmez.
  2. Kayıt başına eksik parsel sayısı az olan (tek sorguyla tamamlananlar).

Kadastro mahalle ID'si adaya göre seçilir: aynı adanın başka bir parseli
önbellekteyse onun mahalleId'si kesin doğrudur; yoksa idari mahalleye göre
aday listesi sırayla denenir (404 → sıradaki aday). Kadastro mahallesi idari
mahalleyle aynı değildir — tahmin etme, önbellekten öğren.

Kullanım: python3 scripts/tkgm-eksik-parsel.py <kaç-sorgu> [--liste]
403 (kota) görülür görülmez durur; çekilenler önbelleğe yazılmıştır, ertesi
gün aynı komut kaldığı yerden devam eder.
"""
import json, os, sys, time, glob, subprocess, urllib.request, urllib.error

CACHE = os.path.expanduser("~/.cache/tkgm-eryaman")
KOK = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
SITELER = os.path.join(KOK, "content", "siteler")
HDR = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
       "Referer": "https://parselsorgu.tkgm.gov.tr/"}
BEKLE = 3.0

# İdari mahalle → denenecek kadastro mahalle ID'leri (önbellekten doğrulanmış
# eşleşmeler; sıra = isabet olasılığı).
ADAY_KADASTRO = {
    "altay-mahallesi": [124123, 124128],
    "goksu-mahallesi": [124123, 124128],
    "sehit-osman-avci-mahallesi": [124128, 124123],
    "seker-mahallesi": [124128, 124123],
    "yavuz-selim-mahallesi": [124123, 205665],
}
VARSAYILAN_KADASTRO = [124123]


def onbellek_indeksi():
    """{'ada/parsel': mahalleId} + adaya göre bilinen kadastro ID'si."""
    parsel, ada_mah = {}, {}
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
        a, p = str(pr.get("adaNo") or ""), str(pr.get("parselNo") or "")
        if not a or not p:
            continue
        parsel[f"{a}/{p}"] = pr.get("mahalleId")
        if pr.get("mahalleId"):
            ada_mah[a] = pr["mahalleId"]
    hm = os.path.join(CACHE, "parsel-nitelik-haritasi.json")
    if os.path.exists(hm):
        for k in json.load(open(hm)):
            parsel.setdefault(k, None)
    return parsel, ada_mah


def kunye_bosluklari():
    """{'mahalle/slug'} — künyesinde alan ya da katMax eksik olan kayıtlar."""
    dokum = subprocess.run(
        ["node", os.path.join(KOK, "scripts", "kunye-dokum.mjs")],
        capture_output=True, text=True, cwd=KOK, check=True,
    ).stdout
    return {
        f"{r['mahalle']}/{r['slug']}"
        for r in json.loads(dokum)
        if r.get("parselAlaniM2") is None or r.get("katMax") is None
    }


def hedefler():
    bosluk = kunye_bosluklari()
    parsel, ada_mah = onbellek_indeksi()
    # Birden çok site kaydına atanmış parsel hiçbir kayda işlenmeyeceği için
    # (tkgm-kunye-uygula.py atlar) sorgulanmaz da — kota boşa gitmesin.
    kullanim = {}
    for mah in sorted(os.listdir(SITELER)):
        dizin = os.path.join(SITELER, mah)
        if not os.path.isdir(dizin):
            continue
        for dosya in sorted(os.listdir(dizin)):
            if not dosya.endswith(".json"):
                continue
            for a in json.load(open(os.path.join(dizin, dosya))).get("adalar") or []:
                k = f"{a['no']}/{a.get('parsel') or '1'}"
                kullanim[k] = kullanim.get(k, 0) + 1
    liste = []
    for mah in sorted(os.listdir(SITELER)):
        dizin = os.path.join(SITELER, mah)
        if not os.path.isdir(dizin):
            continue
        for dosya in sorted(os.listdir(dizin)):
            if not dosya.endswith(".json"):
                continue
            d = json.load(open(os.path.join(dizin, dosya)))
            adalar = d.get("adalar") or []
            if not adalar:
                continue
            # Künyesi zaten tam olan kayıt için sorgu atmaya gerek yok:
            # her parselinde hem alan hem nitelik varsa atla.
            if all(a.get("alanM2") and a.get("nitelik") for a in adalar):
                continue
            eksik = [a for a in adalar
                     if f"{a['no']}/{a.get('parsel') or '1'}" not in parsel
                     and kullanim[f"{a['no']}/{a.get('parsel') or '1'}"] == 1]
            if not eksik:
                continue
            for a in eksik:
                adaylar = ([ada_mah[str(a["no"])]] if str(a["no"]) in ada_mah
                           else ADAY_KADASTRO.get(mah, VARSAYILAN_KADASTRO))
                liste.append({"mahalle": mah, "slug": d["slug"], "eksikSayisi": len(eksik),
                              "oncelik": 0 if f"{mah}/{d['slug']}" in bosluk else 1,
                              "ada": str(a["no"]), "parsel": str(a.get("parsel") or "1"),
                              "adaylar": list(adaylar)})
    liste.sort(key=lambda h: (h["oncelik"], h["eksikSayisi"], h["mahalle"], h["slug"]))
    # Aynı parsel birden çok sitede geçebilir — tek kez sorgula.
    gorulen, tekil = set(), []
    for h in liste:
        k = f"{h['ada']}/{h['parsel']}"
        if k in gorulen:
            continue
        gorulen.add(k)
        tekil.append(h)
    return tekil


def sorgu(kad, ada, parsel):
    url = f"https://cbsapi.tkgm.gov.tr/megsiswebapi.v3/api/parsel/{kad}/{ada}/{parsel}/"
    req = urllib.request.Request(url, headers=HDR)
    return json.load(urllib.request.urlopen(req, timeout=30))


def main():
    butce = int(sys.argv[1]) if len(sys.argv) > 1 and sys.argv[1].isdigit() else 0
    hl = hedefler()
    if "--liste" in sys.argv or not butce:
        print(f"bekleyen benzersiz parsel: {len(hl)}")
        for h in hl[:20]:
            print(f"  {h['eksikSayisi']}x {h['mahalle']}/{h['slug']} {h['ada']}/{h['parsel']} {h['adaylar']}")
        return

    atilan = bulunan = 0
    for h in hl:
        if atilan >= butce:
            print(f"BÜTÇE DOLDU ({butce} sorgu) — kalan {len(hl) - bulunan} parsel yarına.", flush=True)
            break
        hedef = os.path.join(CACHE, f"yeni-{h['ada']}-{h['parsel']}.json")
        if os.path.exists(hedef):
            continue
        for kad in h["adaylar"]:
            if atilan >= butce:
                break
            try:
                r = sorgu(kad, h["ada"], h["parsel"])
                atilan += 1
                time.sleep(BEKLE)
            except urllib.error.HTTPError as e:
                atilan += 1
                time.sleep(BEKLE)
                if e.code == 403:
                    print(f"403 KOTA KAPANDI — {atilan} sorgu atıldı, {bulunan} parsel bulundu.", flush=True)
                    return
                if e.code == 404:
                    continue
                print(f"  {h['ada']}/{h['parsel']} kad={kad}: HTTP {e.code}", flush=True)
                continue
            except Exception as e:
                atilan += 1
                time.sleep(BEKLE)
                print(f"  {h['ada']}/{h['parsel']} kad={kad}: {repr(e)[:70]}", flush=True)
                continue
            pr = (r or {}).get("properties") or {}
            if not pr:
                continue
            json.dump(r, open(hedef, "w"), ensure_ascii=False)
            bulunan += 1
            nit = " ".join((pr.get("nitelik") or "").split())
            print(f"[{atilan}] {h['mahalle']}/{h['slug']} {h['ada']}/{h['parsel']} "
                  f"durum={pr.get('durum')} {pr.get('alan')} | {nit[:55]}", flush=True)
            break
    print(f"BİTTİ: {atilan} sorgu, {bulunan} parsel önbelleğe yazıldı.", flush=True)


if __name__ == "__main__":
    main()
