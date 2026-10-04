#!/usr/bin/env python3
"""Deney taraması yardımcı: kuyruktaki ölçülmemiş sorguları sırayla listeler.
Kullanım: python3 deney-sira.py [n=3]
Çıktı: index | kol | taban | s | tam Google URL (pws=0&gl=tr&hl=tr) — browser_batch'e yapıştırılır.
Ölçülen = sonuclar-site-emlakci.jsonl'de kanal=deney-0410 kaydı olan s. reCAPTCHA'da DUR (günde 2 çözüm)."""
import json, sys, os, urllib.parse
K = os.path.dirname(os.path.abspath(__file__))
n = int(sys.argv[1]) if len(sys.argv) > 1 else 3
kuyruk = json.load(open(f"{K}/deney-kuyruk-0410.json"))
olculen = {json.loads(l)["s"] for l in open(f"{K}/sonuclar-site-emlakci.jsonl") if l.strip() and '"deney-0410"' in l}
kalan = [(i, x) for i, x in enumerate(kuyruk) if x["s"] not in olculen]
print(f"ölçülen {len(kuyruk)-len(kalan)}/{len(kuyruk)} · kalan {len(kalan)}")
for i, x in kalan[:n]:
    u = "https://www.google.com/search?q=" + urllib.parse.quote_plus(x["q"]) + "&pws=0&gl=tr&hl=tr"
    print(f"{i} | {x['kol']} | {x['taban']} | {x['s']} | {x['q']}\n    {u}")
