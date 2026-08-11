#!/usr/bin/env python3
"""Site-emlakçı turunun karnesi: ilk 3'te OLMAYANLARIN notu + başlık görünürlüğü.

Özgün'ün isteği (2026-08-11): 520+ site kaydının her biri için "«site adı»
emlakçı" sorgusunda kaçıncı sıradayız; ilk 3'te çıkmayanlar not edilecek;
"Evinizi Satalım, Kiraya Verelim" ekinin SERP'te görünüp görünmediği izlenecek.

Kullanım: python3 karne-site-emlakci.py          → özet + tam liste (stdout)
          python3 karne-site-emlakci.py --md     → ilk3-disi-siteler.md yazar
"""
import json, os, sys
from collections import Counter

KOK = os.path.dirname(os.path.abspath(__file__))
KUYRUK = os.path.join(KOK, "kuyruk-site-emlakci.json")
SONUC = os.path.join(KOK, "sonuclar-site-emlakci.jsonl")
CIKTI = os.path.join(KOK, "ilk3-disi-siteler.md")

kuyruk = json.load(open(KUYRUK))
rows = {}
if os.path.exists(SONUC):
    for l in open(SONUC):
        if l.strip():
            r = json.loads(l)
            rows[r["q"]] = r  # aynı sorgu tekrar ölçülürse SON ölçüm geçerli

olculen = [x for x in kuyruk if x["q"] in rows]
kalan = [x for x in kuyruk if x["q"] not in rows]
ilk3, dort_on, yok = [], [], []
for x in olculen:
    r = rows[x["q"]]
    (ilk3 if 0 < r["sira"] <= 3 else dort_on if r["sira"] <= 10 else yok).append((x, r))

basli = [r for r in rows.values() if r.get("bas")]
ekli = [r for r in basli if "Evinizi Satalım" in r["bas"]]

L = []
L.append(f"# İlk 3'te OLMAYAN site-emlakçı sorguları — {len(olculen)}/{len(kuyruk)} ölçüldü\n")
L.append(f"- İlk 3'te: **{len(ilk3)}** | 4-10 arası: **{len(dort_on)}** | ilk 10'da yok: **{len(yok)}** | ölçülmedi: {len(kalan)}")
if basli:
    L.append(f"- SERP'te görünen {len(basli)} sonucumuzun **{len(ekli)}** tanesinde \"Evinizi Satalım, Kiraya Verelim\" eki görünüyor; "
             f"kalan {len(basli)-len(ekli)} sonuçta Google BAYAT kopyanın eski başlığını basıyor (site şablonunda ek zaten var, iş tarama sindirimi).\n")
L.append("\n## İlk 10'da hiç yokuz\n")
L.append("| Sorgu | Kayıt | Not |\n|---|---|---|")
for x, r in yok:
    L.append(f"| {x['q']} | {x['s']} | {r.get('not','')} |")
L.append("\n## 4-10 arasındayız (ilk 3'e itme adayları)\n")
L.append("| Sıra | Sorgu | Sıralanan sayfa | Not |\n|---|---|---|---|")
for x, r in sorted(dort_on, key=lambda t: t[1]["sira"]):
    L.append(f"| {r['sira']} | {x['q']} | {r.get('u','')} | {r.get('not','')} |")
L.append("\n## İlk 3'teyiz (koru)\n")
L.append("| Sıra | Sorgu |\n|---|---|")
for x, r in sorted(ilk3, key=lambda t: t[1]["sira"]):
    L.append(f"| {r['sira']} | {x['q']} |")
metin = "\n".join(L) + "\n"

if "--md" in sys.argv:
    open(CIKTI, "w").write(metin)
    print(f"yazıldı: {CIKTI} ({len(olculen)}/{len(kuyruk)})")
else:
    print(metin)
