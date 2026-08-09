import json, sys, urllib.parse, os
kuyruk = json.load(open('kuyruk-t2.json'))
olculen = set()
if os.path.exists('sonuclar-siteler-t2.jsonl'):
    for l in open('sonuclar-siteler-t2.jsonl'):
        if l.strip(): olculen.add(json.loads(l)['s'])
kalan = [x for x in kuyruk if x['s'] not in olculen]
print(f"ÖLÇÜLEN: {len(olculen)} | KALAN: {len(kalan)}")
for i, x in enumerate(kalan[:3]):
    u = "https://www.google.com/search?q=" + urllib.parse.quote_plus(x['q']) + "&pws=0&gl=tr&hl=tr"
    print(f"[{i}] {x['s']} | {x['q']}\n    {u}")
