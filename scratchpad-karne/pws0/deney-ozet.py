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
    # Eski adres = /mahalleler/<mahalle>/... ama "-mahallesi/" YOK.
    # SADECE 1. sonuca bakma: alt sıralardaki eski adres de slot yiyor
    # (07.10: sutek + bizim-sirinkoy böyle kaçmıştı). Eski kayıtlarda
    # "bizu" yok, o zaman u + ilk3'ten kurtarılabildiği kadarını al.
    def _eski(yol):
        return (yol or "").startswith("/mahalleler/") and "-mahallesi/" not in yol and yol.count("/") > 2
    adaylar = list(r.get("bizu") or ([r["u"]] if r.get("u") else []))
    for h in r.get("ilk3", []):
        if h.startswith("siringayrimenkul.com/"):
            adaylar.append(h[len("siringayrimenkul.com"):])
    for yol in dict.fromkeys(adaylar):
        if _eski(yol):
            eski_adres.append((s, yol, "1." if yol == r.get("u") else "alt"))
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
    for s,u,nerede in eski_adres: print(f"  [{nerede:3}] {s} → {u}")
