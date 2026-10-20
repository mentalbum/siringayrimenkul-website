#!/usr/bin/env python3
"""Göksu kuzey kuşağı (63xxx adaları) parsel süpürmesi — depoda atanmamış yapı parsellerini bulur,
her birinin merkezinde Yandex suggest-geo ile ad arar. TKGM sırayla, 2 sn aralık; 403'te durur.
Çıktı: <scratch>/kapsam/kusak-63xxx.json ve .md"""
import json, os, sys, time, glob, urllib.request, urllib.parse, re
REPO = '/Users/ozgun/websitem'
S = sys.argv[1]
C = os.path.join(os.path.dirname(__file__), 'cache.json')
cache = json.load(open(C)) if os.path.exists(C) else {}
HDR = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)", "Referer": "https://parselsorgu.tkgm.gov.tr/"}
dur = False
def cek(u):
    global dur
    if u in cache: return cache[u]
    if dur: return None
    time.sleep(2.0)
    try:
        with urllib.request.urlopen(urllib.request.Request(u, headers=HDR), timeout=25) as r:
            d = json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        if e.code == 403: dur = True; print('403 — kota kapandı'); return None
        d = {'hata': e.code}
    except Exception as e:
        d = {'hata': str(e)}
    cache[u] = d; json.dump(cache, open(C, 'w')); return d
def ada(kid, a, p): return cek(f"https://cbsapi.tkgm.gov.tr/megsiswebapi.v3/api/parsel/{kid}/{a}/{p}/")
def centroid(d):
    g = d['geometry']; ring = g['coordinates'][0] if g['type'] == 'Polygon' else g['coordinates'][0][0]
    return sum(p[1] for p in ring)/len(ring), sum(p[0] for p in ring)/len(ring)
def yandex(part, lat, lng):
    u = ("https://suggest-maps.yandex.ru/suggest-geo?v=9&search_type=all&part=" + urllib.parse.quote(part) +
         f"&ll={lng},{lat}&spn=0.004,0.003&results=7&lang=tr_TR&bases=geo,biz")
    try:
        t = urllib.request.urlopen(urllib.request.Request(u, headers={"User-Agent": HDR["User-Agent"]}), timeout=20).read().decode()
        j = json.loads(t[t.index('(')+1:t.rindex(')')]) if '(' in t else json.loads(t)
    except Exception as e:
        return []
    out = []
    for r in j.get('results', []):
        if r.get('type') != 'toponym': continue
        ad = r.get('title', {}).get('text') if isinstance(r.get('title'), dict) else r.get('title')
        alt = r.get('subtitle', {}).get('text') if isinstance(r.get('subtitle'), dict) else r.get('subtitle')
        if ad and re.search(r'sitesi|konut|evleri|residence|rezidans|life|park|tower|loft|kent', ad, re.I) and 'Etimesgut' in (alt or ''):
            out.append({'ad': ad, 'alt': alt})
    return out

sahip = {}
for p in glob.glob(f'{REPO}/content/siteler/*/*-boundary.geojson'):
    slug = os.path.basename(p)[:-len('-boundary.geojson')]
    for k in json.load(open(p))['properties'].get('adalar', []): sahip[k] = slug
ADALAR = list(range(63357, 63411)) + [63932, 63933]
bulgular = []; tarandi = 0
for a in ADALAR:
    bos = 0
    for par in range(1, 13):
        if dur: break
        d = ada('124123', a, par)
        if not d or d.get('type') != 'Feature':
            bos += 1
            if bos >= 2 and par > 2: break
            continue
        bos = 0; tarandi += 1
        if not d.get('geometry'): continue
        pr = d['properties']; key = f"{a}/{par}"; nit = (pr.get('nitelik') or '').strip()
        if key in sahip: continue
        if re.search(r'trafo|yol|park|yeşil|okul|cami|ibadet|sağlık|otopark|rekreasyon|belediye', nit, re.I): continue
        lat, lng = centroid(d)
        yapi = bool(re.search(r'apartman|blok|konut|ev|residence|rezidans|işyeri|ofis', nit, re.I))
        adlar = yandex('sitesi', lat, lng) + yandex('konutları', lat, lng) + yandex('evleri', lat, lng) if yapi else []
        g = {}; yakin = [g.setdefault(x['ad'], x) for x in adlar if x['ad'] not in g]
        bulgular.append({'parsel': key, 'nitelik': nit, 'alan': pr.get('alan'), 'durum': pr.get('durum'), 'lat': round(lat, 6), 'lng': round(lng, 6),
                         'yapi': yapi, 'yandex_yakin': yakin[:6]})
        print(key, '|', nit[:60], '|', pr.get('alan'), '| yakın ad:', [x['ad'] for x in yakin][:3])
os.makedirs(f'{S}/kapsam', exist_ok=True)
json.dump(bulgular, open(f'{S}/kapsam/kusak-63xxx.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('taranan parsel', tarandi, '| atanmamış', len(bulgular), '| yapı', sum(1 for b in bulgular if b['yapi']), '| durdu' if dur else '')
