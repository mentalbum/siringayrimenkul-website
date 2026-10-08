#!/usr/bin/env python3
"""Deney kaydı — kompakt çıkarıcı çıktısından (uzun SERP listelerinde tool çıktısı
kesiliyordu; bu biçim yalnız n + ilk3 + BİZİM sonuçlarımızı taşır).
Kullanım: python3 ekle-deney-kompakt.py '<slug>' '<q>' '<json>'
  json: serp-cikarici-kompakt.js çıktısı:
        {"n":10,"ilk3":["host/path",...],"biz":[[sira,"/yol","baslik"],...],"u_kaynak":"href"|"cite"|null}
08.10 (karne incelemesi ana-2): biz[i][2] Google'ın gösterdiği başlığın TAMAMI olmalı; kayda 'bas' (ilk 25
  karakter, eski kayıtlarla kıyas için) ve 'bas_tam' (kesilmemiş) birlikte yazılır. Bağ şifreliyse çıkarıcı
  yolu "cite:<kırıntı>" verir, kayıt 'adresi doğrulanamayan' sayılır; o kanalda serp-cikarici-0710.js +
  ekle-uule.py kullan.
"""
import json, sys, datetime, os
s, q, ham = sys.argv[1], sys.argv[2], json.loads(sys.argv[3])
mah = s.split('/')[0]
biz = ham.get('biz', [])
sira = biz[0][0] if biz else 0
u = biz[0][1] if biz else None
bas_tam = (biz[0][2] or None) if biz else None
bas = bas_tam[:25] if bas_tam else None
rec = {"d": datetime.date.today().isoformat(), "kanal": "deney-0410", "tur": "site",
       "mah": mah, "s": s, "q": q, "sira": sira, "u": u, "u_kaynak": ham.get('u_kaynak'),
       "bas": bas, "bas_tam": bas_tam,
       "ilk3": [x[:80] for x in ham.get('ilk3', [])], "isgal": len(biz),
       "bizu": [b[1] for b in biz],
       "isgal_sira": [b[0] for b in biz], "n": ham.get('n', 0), "hl": [],
       "s2sira": None, "s2u": None, "not": "deney"}
yol = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'sonuclar-site-emlakci.jsonl')
open(yol, 'a').write(json.dumps(rec, ensure_ascii=False) + '\n')
hedef = '/mahalleler/' + s
# Bağ şifreliyse yol "cite:<kırıntı>" gelir: sayfa bilinmiyor demektir, 'YANLIS' değil (dogru-sayfa.py de
# bu kaydı "adresi doğrulanamayan" sayar).
durum = 'DISI' if not u else ('BELIRSIZ' if u.startswith('cite:') else ('DOGRU' if u == hedef else 'YANLIS'))
print(f"{s} → {durum} | sira {sira} | {u}")
