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
    print(f"{'nokta':<11}{'organik':<9}{'2.syf':<7}{'harita':<22}loc")
    for n in SIRA + sorted({k[1] for k in son if k[0] == q} - set(SIRA)):
        r = son.get((q, n))
        if not r:
            continue
        org = str(r["sira"]) if r["sira"] else "10 dışı"
        s2 = str(r.get("s2sira", "")) or "-"
        if not r.get("hp"):
            h = "kutu yok"
        elif r.get("hs"):
            h = f"kutuda {r['hs']}."
        else:
            h = "kutu var, biz yokuz"
        print(f"{n:<11}{org:<9}{s2:<7}{h:<22}{r.get('loc','')} ({r['d']})")
