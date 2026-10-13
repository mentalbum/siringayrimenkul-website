#!/usr/bin/env python3
"""kaydet.py <kuyruk.json> — stdin: her satır '<i>\t<kompakt json>' (serp-cikarici-kompakt.js çıktısı).
Kuyruk dosyası: [{"i":201,"s":"<mah>/<site>","q":"<Site> emlakçı","url":...}, ...]. Başlık (t) sorguyla
uyuşmazsa ya da n<5 ise (işletme kartı/boş sayfa) YAZMAZ; geçenleri ekle-deney-kompakt.py ile deney-0410 kanalına yazar.
14.10: oturum scratchpad'i siliniyordu, betik bu yüzden depoya alındı."""
import json,sys,subprocess,os
kuyruk={o['i']:o for o in json.load(open(sys.argv[1],encoding='utf-8'))}
PWS='/Users/ozgun/websitem/scratchpad-karne/pws0'
for sat in sys.stdin:
    sat=sat.rstrip('\n')
    if not sat.strip(): continue
    i,ham=sat.split('\t',1); o=kuyruk[int(i)]; h=json.loads(ham)
    t=h.pop('t',None)
    if t is not None and not o['q'].startswith(t[:min(len(t),len(o['q']),18)]):
        print(f"!! {i} BAŞLIK UYUŞMUYOR: beklenen '{o['q']}', sayfa '{t}' — YAZILMADI"); continue
    if h.get('n',0)<5:
        print(f"!! {i} n={h.get('n')} <5 — çıkarım şüpheli, YAZILMADI"); continue
    r=subprocess.run(['python3',os.path.join(PWS,'ekle-deney-kompakt.py'),o['s'],o['q'],json.dumps(h,ensure_ascii=False)],capture_output=True,text=True)
    print(i,(r.stdout or r.stderr).strip()[:200])
