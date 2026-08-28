#!/usr/bin/env python3
# Bölge turu karnesi: sonuclar-bolge.jsonl → nokta × sorgu tablosu.
# Aynı nokta+sorgu birden çok ölçüldüyse SON satır geçerli (protokol kuralı).
import json, os

D = os.path.dirname(os.path.abspath(__file__))
YOL = os.path.join(D, "sonuclar-bolge.jsonl")
SIRA = ["eryaman", "etimesgut", "sincan", "batikent", "kizilay", "kecioren", "mamak"]

son = {}
with open(YOL) as f:
    for satir in f:
        if satir.strip():
            r = json.loads(satir)
            son[(r["q"], r["nokta"])] = r

for q in sorted({k[0] for k in son}):
    print(f"\nSORGU: {q}")
    print(f"{'nokta':<17}{'organik':<9}{'2.syf':<7}{'harita':<22}loc")
    kutu_ilk3 = kutu_var = org_ilk3 = toplam = 0
    for n in SIRA + sorted({k[1] for k in son if k[0] == q} - set(SIRA)):
        r = son.get((q, n))
        if not r:
            continue
        toplam += 1
        if r.get("hp") and r.get("hs") and 1 <= r["hs"] <= 3:
            kutu_ilk3 += 1
        if r.get("hp") and r.get("hs"):
            kutu_var += 1
        if 1 <= (r.get("sira") or 0) <= 3:
            org_ilk3 += 1
        org = str(r["sira"]) if r["sira"] else "10 dışı"
        s2 = str(r.get("s2sira", "")) or "-"
        if not r.get("hp"):
            h = "kutu yok"
        elif r.get("hs"):
            h = f"kutuda {r['hs']}."
        else:
            h = "kutu var, biz yokuz"
        print(f"{n:<17}{org:<9}{s2:<7}{h:<22}{r.get('loc','')} ({r['d']})")
    if toplam:
        # Kompozit metrik (28.08 geo-grid araştırması): Local Falcon'un
        # SoLV benzeri — noktaların yüzde kaçında kutu ilk-3'teyiz.
        print(f"  KOMPOZİT: kutu-ilk3 {kutu_ilk3}/{toplam} (%{round(100*kutu_ilk3/toplam)})"
              f" | kutuda-varız {kutu_var}/{toplam}"
              f" | organik-ilk3 {org_ilk3}/{toplam} (%{round(100*org_ilk3/toplam)})")
