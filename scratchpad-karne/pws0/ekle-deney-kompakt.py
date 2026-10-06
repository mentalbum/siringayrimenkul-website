#!/usr/bin/env python3
"""Deney kaydı — kompakt çıkarıcı çıktısından (uzun SERP listelerinde tool çıktısı
kesiliyordu; bu biçim yalnız n + ilk3 + BİZİM sonuçlarımızı taşır).
Kullanım: python3 ekle-deney-kompakt.py '<slug>' '<q>' '<json>'
  json: {"n":10,"ilk3":["host/path",...],"biz":[[sira,"/yol","baslik"],...]}
"""
import json, sys, datetime, os
s, q, ham = sys.argv[1], sys.argv[2], json.loads(sys.argv[3])
mah = s.split('/')[0]
biz = ham.get('biz', [])
sira = biz[0][0] if biz else 0
u = biz[0][1] if biz else None
bas = (biz[0][2] or '')[:25] if biz else None
rec = {"d": datetime.date.today().isoformat(), "kanal": "deney-0410", "tur": "site",
       "mah": mah, "s": s, "q": q, "sira": sira, "u": u, "bas": bas,
       "ilk3": [x[:80] for x in ham.get('ilk3', [])], "isgal": len(biz),
       "isgal_sira": [b[0] for b in biz], "n": ham.get('n', 0), "hl": [],
       "s2sira": None, "s2u": None, "not": "deney"}
yol = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'sonuclar-site-emlakci.jsonl')
open(yol, 'a').write(json.dumps(rec, ensure_ascii=False) + '\n')
hedef = '/mahalleler/' + s
durum = 'DOGRU' if u == hedef else ('DISI' if not u else 'YANLIS')
print(f"{s} → {durum} | sira {sira} | {u}")
