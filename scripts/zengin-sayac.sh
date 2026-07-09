#!/bin/sh
# İçerik zenginleştirme sayacı: kaç yaptık / kaç kaldı
cd "$(dirname "$0")/.."
python3 - << 'PY'
import json, glob
tot=yap=0
for f in glob.glob('content/siteler/*/*.json'):
    if 'boundary' in f: continue
    tot+=1
    if json.load(open(f)).get('zenginlestirildi'): yap+=1
print(f"Zenginleştirilen: {yap} / {tot}  (kalan {tot-yap})")
PY
