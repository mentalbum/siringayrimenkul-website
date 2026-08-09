import json, os, sys
n = int(sys.argv[1]) if len(sys.argv)>1 else 10
kuyruk = json.load(open('/Users/ozgun/websitem/scratchpad-karne/pws0/kuyruk-t2.json'))
olculen = set()
if os.path.exists('/Users/ozgun/websitem/scratchpad-karne/pws0/sonuclar-siteler-t2.jsonl'):
    for l in open('/Users/ozgun/websitem/scratchpad-karne/pws0/sonuclar-siteler-t2.jsonl'):
        if l.strip(): olculen.add(json.loads(l)['s'])
kalan = [x for x in kuyruk if x['s'] not in olculen]
print(f"KALAN: {len(kalan)}")
parti = kalan[:n]
print(json.dumps([x['q'] for x in parti], ensure_ascii=False))
print(json.dumps([x['s'] for x in parti], ensure_ascii=False))
