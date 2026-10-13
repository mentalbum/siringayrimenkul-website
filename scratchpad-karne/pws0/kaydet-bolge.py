#!/usr/bin/env python3
"""kaydet-bolge.py <onayar> — stdin satırları: nokta<TAB>q<TAB>jsonA<TAB>jsonB ; sonuclar-bolge.jsonl'e ekler."""
import json,sys,datetime,re
P='/Users/ozgun/websitem/scratchpad-karne/pws0/'
src=open(P+'bolge-tur.mjs',encoding='utf-8').read()
NOK={m.group(1):(float(m.group(2)),float(m.group(3))) for m in re.finditer(r"\{ n: '([\w-]+)',\s*lat: ([\d.]+),\s*lng: ([\d.]+)",src)}
onayar=sys.argv[1]; n=0
for sat in sys.stdin:
    sat=sat.rstrip('\n')
    if not sat.strip(): continue
    nokta,q,ja,jb=sat.split('\t',3); a=json.loads(ja); b=json.loads(jb) if jb.strip() else {}
    if a.get('hata') or a.get('n',0)<5: print("!! ATLANDI",nokta,q,a); continue
    lat,lng=NOK[nokta]
    kayit={"d":datetime.date.today().isoformat(),"kanal":"ev","onayar":onayar,"nokta":nokta,"lat":lat,"lng":lng,"q":q}
    kayit.update(a); kayit.update(b); kayit.pop('tt',None)
    open(P+'sonuclar-bolge.jsonl','a',encoding='utf-8').write(json.dumps(kayit,ensure_ascii=False)+'\n'); n+=1
    print(f"{nokta} | {q} → organik {a.get('sira') or 'ilk10 dışı'} · kutu {'#'+str(a['hs']) if a.get('hs') else ('var, biz yok' if a.get('hp') else 'yok')} · n {a.get('n')} · loc {a.get('loc','')[:30]}")
print("eklendi:",n)
