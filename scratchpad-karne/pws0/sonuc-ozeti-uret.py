# -*- coding: utf-8 -*-
"""GSC'den SONUÇ verisini çeker (tık/gösterim/TO) ve karnenin okuduğu JSON'u üretir.

Neden: karne bugüne dek yalnız SIRA ölçüyordu. 31.08'de ölçüldü ki toplam
tıklamanın üçte biri 27.08'de siteden kaldırılan Yenimahalle sayfalarından
geliyor — bu trafik önümüzdeki haftalarda düşecek ve sıra karnesi bunu
"başarısızlık" gibi gösterecekti. Ayrım şart.

Kullanım: python3 sonuc-ozeti-uret.py     (GSC API çağrısı yapar, ~1 dk)
"""
import json, re, subprocess, datetime, os

KOK = "/Users/ozgun/websitem"
YM = re.compile(r"/mahalleler/(ata|susuz|cumhuriyet)(-mahallesi)?/")

def calistir(*a):
    return subprocess.run(["node", f"{KOK}/scripts/gsc-api.mjs", *a],
                          capture_output=True, text=True, cwd=KOK).stdout

ozet = json.loads(calistir("ozet", "28"))

def sayfa(gun):
    d = {}
    for l in calistir("sayfalar", str(gun)).splitlines():
        a = l.split("\t")
        if len(a) < 4:
            continue
        d[a[3]] = (int(a[0]), int(a[1]))
    return d

s28, s56 = sayfa(28), sayfa(56)
def bol(src):
    ym = ery = None
    ym = [0, 0]; ery = [0, 0]
    for u, (g, t) in src.items():
        hedef = ym if YM.search(u) else ery
        hedef[0] += g; hedef[1] += t
    return {"gos": ery[0], "tik": ery[1]}, {"gos": ym[0], "tik": ym[1]}

e28, y28 = bol(s28)
e56, y56 = bol(s56)
onceki = lambda a, b: {"gos": a["gos"] - b["gos"], "tik": a["tik"] - b["tik"]}
ozet["ayrim"] = {
    "eryaman": {"simdi": e28, "onceki": onceki(e56, e28)},
    "yenimahalle": {"simdi": y28, "onceki": onceki(y56, y28)},
}
ozet["uretim"] = datetime.date.today().isoformat()
p = f"{KOK}/scratchpad-karne/pws0/sonuc-ozeti.json"
json.dump(ozet, open(p, "w"), ensure_ascii=False, indent=1)
e, y = ozet["ayrim"]["eryaman"], ozet["ayrim"]["yenimahalle"]
print(f"yazıldı: sonuc-ozeti.json")
print(f"  toplam  {ozet['simdi']['tik']} tık · {ozet['simdi']['gos']} gösterim · TO %{ozet['simdi']['to']}")
print(f"  Eryaman {e['simdi']['tik']} tık (önceki {e['onceki']['tik']})")
print(f"  Yenimahalle {y['simdi']['tik']} tık — 27.08'de kaldırıldı, bu trafik düşecek")
