#!/usr/bin/env python3
"""Site sorgusu ölçümünü (uule=Eryaman merkez) sonuclar-site-emlakci.jsonl'e ekler — 07.10 çıkarıcı biçimi.
Kullanım: python3 ekle-uule.py '<slug>' '<q>' '<json>' [kanal=uule-eryaman] [not]
  json: serp-cikarici-0710.js çıktısı ({"sira","u","bas","isgal","isgal_sira","biz":[[sira,p,bas25,tamBaslik],...],
        "n","hp","hl","ilk3","loc"}). Bizim sayfanın YOLU cite'tan güvenilir çıkmaz: biz[i][3] tam başlık site adıyla
        başlıyorsa u=/mahalleler/<slug> (doğru sayfa); değilse cite yolu olduğu gibi yazılır ve not'a 'yol≈' düşer.
"""
import json, sys, datetime, os, re, unicodedata
K = os.path.dirname(os.path.abspath(__file__))
s, q, ham = sys.argv[1], sys.argv[2], json.loads(sys.argv[3])
kanal = sys.argv[4] if len(sys.argv) > 4 else "uule-eryaman"
ek_not = sys.argv[5] if len(sys.argv) > 5 else ""
def norm(t): return re.sub(r"\s+", " ", unicodedata.normalize("NFKC", t or "")).strip().lower()
site_ad = norm(re.sub(r"\s+emlakç[ıi]s?[ıi]?$", "", q, flags=re.I))
biz = ham.get("biz") or []
kayitlar = []
for b in biz:
    sira, p, bas25 = b[0], b[1], b[2]
    tam = b[3] if len(b) > 3 else ""
    if norm(tam).startswith(site_ad): u = f"/mahalleler/{s}"; yol_notu = ""
    else: u = p; yol_notu = f"yol≈(cite) başlık: {tam[:60]}"
    kayitlar.append((sira, u, bas25, yol_notu))
sira = kayitlar[0][0] if kayitlar else 0
u = kayitlar[0][1] if kayitlar else None
bas = kayitlar[0][2] if kayitlar else None
hl = ham.get("hl") or []
kutu = ("harita kutusunda" if any(re.search("şirin", x, re.I) for x in hl) else ("kutu var biz yok" if ham.get("hp") else "kutu yok"))
notlar = [f"kanal {kanal}", kutu] + [k[3] for k in kayitlar if k[3]] + ([ek_not] if ek_not else [])
rec = {"d": datetime.date.today().isoformat(), "kanal": kanal, "loc": ham.get("loc"), "tur": "site", "mah": s.split("/")[0],
       "s": s, "q": q, "sira": sira, "u": u, "bas": bas, "ilk3": [x[:80] for x in ham.get("ilk3", [])],
       "isgal": len(kayitlar), "isgal_sira": [k[0] for k in kayitlar], "n": ham.get("n", 0), "hl": hl, "hp": bool(ham.get("hp")),
       "s2sira": None, "s2u": None, "not": "; ".join(notlar)}
open(os.path.join(K, "sonuclar-site-emlakci.jsonl"), "a").write(json.dumps(rec, ensure_ascii=False) + "\n")
hedef = "/mahalleler/" + s
durum = "DOGRU" if u == hedef else ("DISI" if not u else "YANLIS:" + str(u))
print(f"{s} → sıra {sira} {durum} | {kutu} | n={rec['n']}")
