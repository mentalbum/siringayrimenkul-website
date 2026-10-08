#!/usr/bin/env python3
"""07.10 hedef sorgu yenilemesi — tarayıcı JS çıktısını sonuclar-*.jsonl'e ekler.
Kullanım: python3 hedef-ekle.py '<sorgu>' '<json>' [kanal=normal]
json: serp-cikarici-0710.js çıktısı: {"sira","u","bas","bas_tam","kap","u_kaynak","isgal","isgal_sira",
      "isgal_diger","n","hp","hl","ilk3","t"}
08.10 ekleri (karne incelemesi ana-2 + ek-4): kayda Google'ın gösterdiği başlığın TAMAMI (bas_tam),
  baş sorguda ('eryaman emlakçı') ayrıca 25 karakterlik bas ve sonuç kutusu metni (kap, en çok 300 karakter),
  yolun kaynağı (u_kaynak: href|cite|baslik) ve sitemiz dışındaki varlıklarımızın sıraları
  (isgal_diger: [[sıra, varlık], …]) yazılır. Çıkarıcı eski sürümse bu alanlar null kalır (= ölçülmedi).
  'isgal' yeniden tanımlanmadı: yalnız siringayrimenkul.com sonuçlarının sayısı.
kap nasıl okunur (baş sorgu): içinde 'biz çıkarırız' ya da 'doğru alıcıyı' varsa Google meta description'ı
  gösteriyor; 'arayan ev sahipleri için' ya da '11 mahalle' varsa kesiti gövdeden derliyor. Telefon numarası
  ayıraç DEĞİLDİR (gövdede de geçiyor). kap boş ya da yalnız başlık + cite ise çıkarıcıda kapsayıcı bir üst
  öğeye alınır.
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
KANAL = sys.argv[3] if len(sys.argv) > 3 else "normal"  # ör. "uule-eryaman": uule=Eryaman merkez (39.9779,32.6382)
LOC = ham.get("loc")
d = datetime.date.today().isoformat()
hl = ham.get("hl") or []
hp = bool(ham.get("hp"))
kutu_not = ("harita kutusunda" if any(re.search(r"şirin", x, re.I) for x in hl)
            else ("harita kutusu var, biz yokuz" if hp else "harita kutusu çıkmadı"))
if q.lower() == "eryaman emlakçı":
    rec = {"d": d, "s": "eryaman-emlakci", "q": "eryaman emlakçı", "sira": ham["sira"], "u": ham["u"],
           "u_kaynak": ham.get("u_kaynak"),
           "bas": (ham.get("bas") or None), "bas_tam": (ham.get("bas_tam") or None), "kap": (ham.get("kap") or None),
           "n": ham["n"], "hl": hl, "hp": hp, "isgal": ham.get("isgal", 0), "isgal_diger": ham.get("isgal_diger"),
           "kanal": KANAL, "loc": LOC, "not": f"07.10 hedef yenilemesi, pws=0 gl=tr hl=tr, kanal {KANAL}; {kutu_not}"}
    yol = os.path.join(PWS0, "sonuclar-emlakci.jsonl")
    beklenen = "/"
else:
    m = re.fullmatch(r"Eryaman (\d)\. Etap emlakçı", q)
    if m:
        s = ETAP[int(m.group(1))]; tur = "etap"; mah = s.split("/")[0]
    else:
        ad = re.fullmatch(r"(.+) Mahallesi emlakçı", q).group(1)
        s = MAH[ad]; tur = "mahalle"; mah = s
    rec = {"d": d, "kanal": KANAL, "loc": LOC, "tur": tur, "mah": mah, "s": s, "q": q,
           "sira": ham["sira"], "u": ham["u"], "u_kaynak": ham.get("u_kaynak"),
           "bas": (ham.get("bas") or None), "bas_tam": (ham.get("bas_tam") or None),
           "ilk3": [x[:80] for x in ham.get("ilk3", [])], "isgal": ham.get("isgal", 0),
           "isgal_sira": ham.get("isgal_sira", []), "isgal_diger": ham.get("isgal_diger"),
           "n": ham["n"], "hl": hl, "hp": hp,
           "s2sira": None, "s2u": None, "not": f"07.10 hedef yenilemesi, kanal {KANAL}; {kutu_not}"}
    yol = os.path.join(PWS0, "sonuclar-site-emlakci.jsonl")
    beklenen = "/mahalleler/" + s
open(yol, "a").write(json.dumps(rec, ensure_ascii=False) + "\n")
durum = "DOGRU" if rec["u"] == beklenen else ("DISI" if not rec["u"] else "YANLIS:" + str(rec["u"]))
print(f"{q} → sıra {rec['sira']} {durum} | kutu: {'biz ' + str([i+1 for i,x in enumerate(hl) if re.search('şirin',x,re.I)]) if 'kutusunda' in kutu_not else kutu_not} | n={rec['n']} | hl={hl[:3]}")
