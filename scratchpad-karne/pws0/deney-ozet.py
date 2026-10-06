#!/usr/bin/env python3
"""Deney kolu ara okuma: taban (kuyruk) → bugünkü ölçüm çapraz tablosu."""
import json, collections
kuyruk = {x["s"]: x for x in json.load(open("deney-kuyruk-0410.json"))}
son = {}
for l in open("sonuclar-site-emlakci.jsonl"):
    if l.strip() and '"deney-0410"' in l:
        r = json.loads(l); son[r["s"]] = r
def sinif(r, s):
    if not r.get("u"): return "disi"
    return "dogru" if r["u"] == "/mahalleler/" + s else "yanlis"
cap = collections.Counter(); kol = collections.Counter()
eski_adres = []
for s, r in son.items():
    k = kuyruk.get(s)
    if not k: continue
    kol[k["kol"]] += 1
    if k["kol"] != "deney": continue
    y = sinif(r, s)
    cap[(k["taban"], y)] += 1
    if y == "yanlis" and r.get("u","").startswith("/mahalleler/") and "-mahallesi/" not in r["u"] and r["u"].count("/")>2:
        eski_adres.append((s, r["u"]))
d = sum(v for (t,_),v in cap.items())
print(f"DENEY KOLU ölçülen: {d} / {sum(1 for x in kuyruk.values() if x['kol']=='deney')}")
print(f"{'taban':8} {'→dogru':>7} {'→yanlis':>8} {'→disi':>6}")
for t in ("yanlis","disi","dogru"):
    satir = [cap[(t,y)] for y in ("dogru","yanlis","disi")]
    if sum(satir): print(f"{t:8} {satir[0]:7d} {satir[1]:8d} {satir[2]:6d}")
yd = cap[("yanlis","dogru")]; yt = sum(cap[("yanlis",y)] for y in ("dogru","yanlis","disi"))
dd = cap[("disi","dogru")]; dt = sum(cap[("disi",y)] for y in ("dogru","yanlis","disi"))
if yt: print(f"\nYanlış→doğru düzelme: {yd}/{yt} = %{round(100*yd/yt)}  (GSC okuması: %52; kontrol kolu %22)")
if dt: print(f"Dışı→doğru kazanım:  {dd}/{dt} = %{round(100*dd/dt)}")
if eski_adres:
    print(f"\nESKİ ADRES vakaları ({len(eski_adres)}) — başlık deneyi bunları çözemez:")
    for s,u in eski_adres: print(f"  {s} → {u}")
