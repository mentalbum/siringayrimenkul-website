import json, os, urllib.parse
K = os.path.dirname(os.path.abspath(__file__))
kuyruk = json.load(open(os.path.join(K, 'kuyruk-site-emlakci.json')))
olculen = set()
p = os.path.join(K, 'sonuclar-site-emlakci.jsonl')
if os.path.exists(p):
    for l in open(p):
        if l.strip(): olculen.add(json.loads(l)['q'])
kalan = [x for x in kuyruk if x['q'] not in olculen]
print(f"ÖLÇÜLEN: {len(olculen)} | KALAN: {len(kalan)}")
for i, x in enumerate(kalan[:3]):
    u = "https://www.google.com/search?pws=0&gl=tr&hl=tr&q=" + urllib.parse.quote_plus(x['q'])
    print(f"[{i}] {x['s']} | {x['q']}\n    {u}")
