#!/usr/bin/env python3
"""tkgm-sorgu.py (eski adı tk.py; 20.10 kapsam turu) nokta <lat> <lng>  |  tk.py ada <kadastroId> <ada> <parsel>  |  tk.py ekle <mahalle> <slug> <kadastroId> <ada> <parsel>
Ham TKGM özelliklerini basar; 'ekle' parseli mevcut sınır dosyasına (MultiPolygon) ve site JSON adalar[]'ına ekler."""
import json,sys,os,time,urllib.request
REPO='/Users/ozgun/websitem'; C=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','scratchpad-karne','kapsam-2010','tkgm-cache.json')
cache=json.load(open(C)) if os.path.exists(C) else {}
HDR={"User-Agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)","Referer":"https://parselsorgu.tkgm.gov.tr/"}
def cek(u):
    if u in cache: return cache[u]
    time.sleep(1.5)
    try:
        with urllib.request.urlopen(urllib.request.Request(u,headers=HDR),timeout=25) as r: d=json.loads(r.read().decode())
    except Exception as e: print('HATA',u,e); return None
    cache[u]=d; json.dump(cache,open(C,'w')); return d
def ozet(d):
    if not d or d.get('type')!='Feature': return 'YOK'
    p=d['properties']; return f"ada {p.get('adaNo')}/{p.get('parselNo')} | kadastroId {p.get('mahalleId')} {p.get('mahalleAd')} | alan {p.get('alan')} | nitelik {p.get('nitelik')} | durum {p.get('durum')}"
a=sys.argv[1]
if a=='nokta':
    d=cek(f"https://cbsapi.tkgm.gov.tr/megsiswebapi.v3/api/parsel/{sys.argv[2]}/{sys.argv[3]}"); print(ozet(d))
elif a=='ada':
    d=cek(f"https://cbsapi.tkgm.gov.tr/megsiswebapi.v3/api/parsel/{sys.argv[2]}/{sys.argv[3]}/{sys.argv[4]}/"); print(ozet(d))
elif a=='ekle':
    m,sl,kid,ada,par=sys.argv[2:7]
    d=cek(f"https://cbsapi.tkgm.gov.tr/megsiswebapi.v3/api/parsel/{kid}/{ada}/{par}/"); print(ozet(d))
    if not d or d.get('type')!='Feature': sys.exit(2)
    g=d['geometry']; polys=[g['coordinates']] if g['type']=='Polygon' else g['coordinates']
    bp=f"{REPO}/content/siteler/{m}/{sl}-boundary.geojson"; b=json.load(open(bp))
    key=f"{ada}/{par}"
    if key in b['properties']['adalar']: print('zaten var'); sys.exit(0)
    if b['geometry']['type']=='Polygon': b['geometry']={'type':'MultiPolygon','coordinates':[b['geometry']['coordinates']]}
    b['geometry']['coordinates'].extend(polys); b['properties']['adalar'].append(key)
    json.dump(b,open(bp,'w'),ensure_ascii=False,indent=1); open(bp,'a').write('\n')
    sp=f"{REPO}/content/siteler/{m}/{sl}.json"; s=json.load(open(sp,encoding='utf-8'))
    s.setdefault('adalar',[]).append({'no':ada,'parsel':par})
    json.dump(s,open(sp,'w',encoding='utf-8'),ensure_ascii=False,indent=2); open(sp,'a').write('\n')
    print('eklendi',key,'→',sl)
