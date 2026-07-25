#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Mahalle slug'larına "-mahallesi" eki ekler: /mahalleler/tunahan -> /mahalleler/tunahan-mahallesi

Slug 5 ayrı yerde yaşıyor; beşi birden değişmezse site kırılır:
  1. content/mahalleler/<slug>.json  — dosya ADI ve içindeki "slug" alanı
  2. content/siteler/<slug>/         — dizin ADI
  3. content/siteler/*/*.json        — "mahalleSlug" alanı (727 kayıt)
  4. content/siteler/*/*.json        — "sinirGeoJSON" yolu (siteler/<slug>/...)
  5. content/blog/*.mdx              — gövdedeki /mahalleler/<slug> iç linkleri
Ayrıca next.config.ts'teki mevcut yönlendirmelerin HEDEFLERİ yeni slug'a çevrilir
(kaynakları eski kalır — onlar zaten eski URL'ler).

Kullanım:  python3 scripts/mahalle-slug-tasi.py [--uygula]
--uygula verilmezse hiçbir şeye dokunmaz, yalnız ne yapacağını listeler.
"""
import json, os, re, subprocess, sys, glob

KOK = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
UYGULA = "--uygula" in sys.argv
EK = "-mahallesi"


def mahalle_slugleri():
    """Mevcut slug -> yeni slug. Zaten ekli olanlara ikinci kez eklemez."""
    harita = {}
    for yol in sorted(glob.glob(os.path.join(KOK, "content/mahalleler/*.json"))):
        d = json.load(open(yol, encoding="utf-8"))
        eski = d["slug"]
        harita[eski] = eski if eski.endswith(EK) else eski + EK
    return harita


def git_mv(eski, yeni):
    if UYGULA:
        subprocess.run(["git", "mv", eski, yeni], cwd=KOK, check=True)
    print(f"  mv  {os.path.relpath(eski, KOK)}  ->  {os.path.relpath(yeni, KOK)}")


def json_yaz(yol, d):
    if UYGULA:
        with open(yol, "w", encoding="utf-8") as fh:
            json.dump(d, fh, ensure_ascii=False, indent=2)
            fh.write("\n")


def main():
    harita = mahalle_slugleri()
    degisen = {e: y for e, y in harita.items() if e != y}
    if not degisen:
        print("Tüm slug'lar zaten '-mahallesi' ekli — yapılacak iş yok.")
        return
    print(f"{len(degisen)} mahalle taşınacak:\n")
    for e, y in sorted(degisen.items()):
        print(f"  {e:20} -> {y}")

    # 1) mahalle json'ları: içerik + dosya adı
    print("\n[1] content/mahalleler/")
    for eski, yeni in sorted(degisen.items()):
        yol = os.path.join(KOK, "content/mahalleler", f"{eski}.json")
        d = json.load(open(yol, encoding="utf-8"))
        d["slug"] = yeni
        json_yaz(yol, d)
        git_mv(yol, os.path.join(KOK, "content/mahalleler", f"{yeni}.json"))

    # 2+3+4) site kayıtları: mahalleSlug + sinirGeoJSON, sonra dizin adı
    print("\n[2] content/siteler/ — kayıt alanları ve dizin adları")
    for eski, yeni in sorted(degisen.items()):
        dizin = os.path.join(KOK, "content/siteler", eski)
        if not os.path.isdir(dizin):
            print(f"  ! dizin yok, atlandı: {eski}")
            continue
        sayac = 0
        for yol in sorted(glob.glob(os.path.join(dizin, "*.json"))):
            d = json.load(open(yol, encoding="utf-8"))
            dokunuldu = False
            if d.get("mahalleSlug") == eski:
                d["mahalleSlug"] = yeni
                dokunuldu = True
            sg = d.get("sinirGeoJSON")
            if sg and sg.startswith(f"siteler/{eski}/"):
                d["sinirGeoJSON"] = sg.replace(f"siteler/{eski}/", f"siteler/{yeni}/", 1)
                dokunuldu = True
            gorsel = d.get("gorsel")
            if gorsel and f"/{eski}/" in gorsel:
                d["gorsel"] = gorsel.replace(f"/{eski}/", f"/{yeni}/", 1)
                dokunuldu = True
            if dokunuldu:
                json_yaz(yol, d)
                sayac += 1
        print(f"  {eski:20} {sayac} kayıt güncellendi")
        git_mv(dizin, os.path.join(KOK, "content/siteler", yeni))

    # 5) blog iç linkleri
    print("\n[3] content/blog/ — iç linkler")
    toplam = 0
    for yol in sorted(glob.glob(os.path.join(KOK, "content/blog/*.mdx"))):
        s = open(yol, encoding="utf-8").read()
        yeni_s = s
        for eski, yeni in degisen.items():
            yeni_s = re.sub(rf"(/mahalleler/){re.escape(eski)}(?=[/)\"'\s#])", rf"\g<1>{yeni}", yeni_s)
        if yeni_s != s:
            toplam += 1
            if UYGULA:
                open(yol, "w", encoding="utf-8").write(yeni_s)
    print(f"  {toplam} yazıda iç link güncellendi")

    # 6) next.config.ts — mevcut yönlendirmelerin HEDEFLERİ
    print("\n[4] next.config.ts — mevcut yönlendirme hedefleri")
    yol = os.path.join(KOK, "next.config.ts")
    s = open(yol, encoding="utf-8").read()
    yeni_s = s
    for eski, yeni in degisen.items():
        # Yalnız destination alanındaki yolu çevir; source eski kalmalı.
        yeni_s = re.sub(
            rf'(destination:\s*"/mahalleler/){re.escape(eski)}(?=["/])',
            rf'\g<1>{yeni}',
            yeni_s,
        )
    n = sum(1 for a, b in zip(s.split("\n"), yeni_s.split("\n")) if a != b)
    if UYGULA and yeni_s != s:
        open(yol, "w", encoding="utf-8").write(yeni_s)
    print(f"  {n} hedef satırı güncellendi")

    print("\n" + ("UYGULANDI" if UYGULA else "KURU ÇALIŞTIRMA — hiçbir şeye dokunulmadı"))
    if not UYGULA:
        print("Uygulamak için: python3 scripts/mahalle-slug-tasi.py --uygula")


if __name__ == "__main__":
    main()
