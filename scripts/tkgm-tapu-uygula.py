#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""TKGM tapu turu sonuçlarını kayıtlara işler (yalnız "uygun" durumundakiler).

Yazılanlar (ozellikler[] veri satırları — aciklama METNİNE DOKUNULMAZ):
  - zeminKmdurum "Kat Mülkiyeti"  → "Kat mülkiyetli parsel (TKGM)"
  - zeminKmdurum "Kat İrtifakı"   → "Kat irtifaklı parsel (TKGM)"
  - "Ana Taşınmaz" → tapu satırı YAZILMAZ (kat mülkiyeti/irtifakı kurulmamış)
  - kayıt metninde hiç m² yoksa   → "~{alan} m² parsel (TKGM)"
Nitelik alanı yalnız RAPORLANIR; okul/park/yol/trafo gibi konut-dışı nitelik
çelişki listesine düşer ve kayda HİÇBİR ŞEY yazılmaz (Sky Göksu dersi).

Kullanım: python3 scripts/tkgm-tapu-uygula.py <sonuclar.json> <rapor.json> [--yaz]
--yaz verilmezse kuru koşu (dry run).
"""
import json, re, sys

KONUT_DISI_NITELIK = re.compile(
    r"okul|park[ıi]?$|yol|trafo|cami|yurt|hastane|sağlık|karakol|belediye|ibadet|mezarlık|dere|kanal",
    re.I,
)


def alan_metni(ham):
    # "7,895.00" (TKGM Amerikan biçimi) → "7.895"
    try:
        deger = float(str(ham).replace(",", ""))
    except ValueError:
        return None
    if deger < 300:
        return None
    return f"{int(round(deger)):,}".replace(",", ".")


def main():
    sonuclar = json.load(open(sys.argv[1]))
    yaz = "--yaz" in sys.argv
    rapor = {"yazilan": [], "atlanan": [], "celiski": [], "kota": 0}
    for s in sonuclar:
        if s["durum"] == "kota":
            rapor["kota"] += 1
            continue
        if s["durum"] != "uygun":
            rapor["celiski"].append({
                "slug": f"{s['mahalle']}/{s['slug']}", "durum": s["durum"],
                "tkgm": s.get("tkgm"), "kayitAdalar": s.get("adalar"),
            })
            continue
        t = s["tkgm"]
        if KONUT_DISI_NITELIK.search(t.get("nitelik") or ""):
            rapor["celiski"].append({
                "slug": f"{s['mahalle']}/{s['slug']}", "durum": "konut-disi-nitelik",
                "tkgm": t, "kayitAdalar": s.get("adalar"),
            })
            continue
        yol = f"content/siteler/{s['mahalle']}/{s['slug']}.json"
        d = json.load(open(yol))
        ozellikler = d.get("ozellikler") or []
        metin = (d.get("aciklama", "") + " " + " ".join(ozellikler)).lower()
        yeni = []
        # TKGM "Kat Mülkiyet"/"Kat İrtifak" biçiminde döndürüyor (sonek yok).
        km = (t.get("zeminKmdurum") or "").strip()
        if km.startswith("Kat Mülkiyet") and "kat mülkiyet" not in metin:
            yeni.append("Kat mülkiyetli parsel (TKGM)")
        elif km.startswith("Kat İrtifak") and "kat irtifak" not in metin:
            yeni.append("Kat irtifaklı parsel (TKGM)")
        if "m²" not in metin:
            am = alan_metni(t.get("alan"))
            if am:
                yeni.append(f"~{am} m² parsel (TKGM)")
        if not yeni:
            rapor["atlanan"].append({"slug": f"{s['mahalle']}/{s['slug']}", "sebep": f"eklenecek satır yok (zemin: {km})"})
            continue
        kayit = {
            "slug": f"{s['mahalle']}/{s['slug']}", "eklenen": yeni,
            "zemin": km, "nitelik": t.get("nitelik"), "adaParsel": f"{t['adaNo']}/{t['parselNo']}",
        }
        if yaz:
            # Veri satırları mahalle satırından ÖNCE, mevcut düzeni bozmadan eklenir.
            d["ozellikler"] = ozellikler[:-1] + yeni + ozellikler[-1:] if ozellikler else yeni
            d["zenginlestirildi"] = "2026-07-30"
            json.dump(d, open(yol, "w"), ensure_ascii=False, indent=2)
        rapor["yazilan"].append(kayit)
    json.dump(rapor, open(sys.argv[2], "w"), ensure_ascii=False, indent=1)
    print(f"yazilan={len(rapor['yazilan'])} atlanan={len(rapor['atlanan'])} "
          f"celiski={len(rapor['celiski'])} kota={rapor['kota']} (yaz={yaz})")


if __name__ == "__main__":
    main()
