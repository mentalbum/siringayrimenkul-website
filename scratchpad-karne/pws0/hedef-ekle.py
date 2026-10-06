#!/usr/bin/env python3
"""07.10 hedef sorgu yenilemesi — tarayıcı JS çıktısını sonuclar-*.jsonl'e ekler.
Kullanım: python3 hedef-ekle.py '<sorgu>' '<json>'
json: {"sira","u","bas","isgal","isgal_sira","n","hp","hl","ilk3","t"}
"""
import json, sys, datetime, os, re
PWS0 = os.path.dirname(os.path.abspath(__file__))
MAH = {"Eryaman":"eryaman-mahallesi","Tunahan":"tunahan-mahallesi","Altay":"altay-mahallesi",
       "Devlet":"devlet-mahallesi","Göksu":"goksu-mahallesi","Güzelkent":"guzelkent-mahallesi",
       "Şehit Osman Avcı":"sehit-osman-avci-mahallesi","Şeker":"seker-mahallesi",
       "Şeyh Şamil":"seyh-samil-mahallesi","Yavuz Selim":"yavuz-selim-mahallesi","Yeşilova":"yesilova-mahallesi"}
ETAP = {1:"altay-mahallesi/etaplar/1",2:"sehit-osman-avci-mahallesi/etaplar/2",3:"seyh-samil-mahallesi/etaplar/3",
        4:"tunahan-mahallesi/etaplar/4",5:"tunahan-mahallesi/etaplar/5"}
q, ham = sys.argv[1], json.loads(sys.argv[2])
d = datetime.date.today().isoformat()
hl = ham.get("hl") or []
hp = bool(ham.get("hp"))
kutu_not = ("harita kutusunda" if any(re.search(r"şirin", x, re.I) for x in hl)
            else ("harita kutusu var, biz yokuz" if hp else "harita kutusu çıkmadı"))
if q.lower() == "eryaman emlakçı":
    rec = {"d": d, "s": "eryaman-emlakci", "q": "eryaman emlakçı", "sira": ham["sira"], "u": ham["u"],
           "n": ham["n"], "hl": hl, "hp": hp, "isgal": ham.get("isgal", 0),
           "not": f"07.10 hedef yenilemesi, pws=0 gl=tr hl=tr; {kutu_not}"}
    yol = os.path.join(PWS0, "sonuclar-emlakci.jsonl")
    beklenen = "/"
else:
    m = re.fullmatch(r"Eryaman (\d)\. Etap emlakçı", q)
    if m:
        s = ETAP[int(m.group(1))]; tur = "etap"; mah = s.split("/")[0]
    else:
        ad = re.fullmatch(r"(.+) Mahallesi emlakçı", q).group(1)
        s = MAH[ad]; tur = "mahalle"; mah = s
    rec = {"d": d, "kanal": "normal", "tur": tur, "mah": mah, "s": s, "q": q,
           "sira": ham["sira"], "u": ham["u"], "bas": (ham.get("bas") or None),
           "ilk3": [x[:80] for x in ham.get("ilk3", [])], "isgal": ham.get("isgal", 0),
           "isgal_sira": ham.get("isgal_sira", []), "n": ham["n"], "hl": hl, "hp": hp,
           "s2sira": None, "s2u": None, "not": f"07.10 hedef yenilemesi; {kutu_not}"}
    yol = os.path.join(PWS0, "sonuclar-site-emlakci.jsonl")
    beklenen = "/mahalleler/" + s
open(yol, "a").write(json.dumps(rec, ensure_ascii=False) + "\n")
durum = "DOGRU" if rec["u"] == beklenen else ("DISI" if not rec["u"] else "YANLIS:" + str(rec["u"]))
print(f"{q} → sıra {rec['sira']} {durum} | kutu: {'biz ' + str([i+1 for i,x in enumerate(hl) if re.search('şirin',x,re.I)]) if 'kutusunda' in kutu_not else kutu_not} | n={rec['n']} | hl={hl[:3]}")
