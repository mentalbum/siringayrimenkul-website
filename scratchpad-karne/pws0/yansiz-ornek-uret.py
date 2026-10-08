#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Yansız örnek okuması → yansiz-ornek.json

NEDEN (08.10): karnenin iki tepe SERP rakamı ("ilk 3 payı", "ilk 3 içinde doğru sayfa")
seçici yeniden ölçümle şişiyordu: Ekim'de yalnız sorunlu çıkan sorgular yeniden ölçüldü,
"doğru" sayılan eski kayıtlar hiç ölçülmedi. Bu betik, o eski "doğru" kayıtlardan SABİT
TOHUMLA seçilmiş 30 sorgunun (yeniden-olcum-kuyrugu-0810.json → yansiz_ornek_30) yeniden
ölçüm sonucunu okur ve bozulma oranını verir. Rakam elle yazılmaz; ölçüm dosyasından sayılır.

Girdi : yeniden-olcum-kuyrugu-0810.json, sonuclar-site-emlakci.jsonl, dogru-sayfa.json
Çıktı : yansiz-ornek.json
Çalıştırma: python3 yansiz-ornek-uret.py   (dogru-sayfa.py'den SONRA, karne-html.py'den ÖNCE)
"""
import json, math, os, re, datetime

KOK = os.path.dirname(os.path.abspath(__file__))
def yukle(ad):
    with open(os.path.join(KOK, ad), encoding="utf-8") as f:
        return json.load(f)

K = yukle("yeniden-olcum-kuyrugu-0810.json")
ORNEK = K["dilimler"]["yansiz_ornek_30"]["kayitlar"]
TOHUM = K.get("tohum")
rows = [json.loads(l) for l in open(os.path.join(KOK, "sonuclar-site-emlakci.jsonl"), encoding="utf-8") if l.strip()]

# Örnek kayıtları "bayat" tanımıyla seçildi: son ölçümü 06.09 ve öncesi. Yeniden ölçüm o
# tarihten SONRAKİ ilk gerçek-bağ (u_kaynak=href) kaydıdır; başlıktan çözülen kayıt sayılmaz.
BAYAT_SINIR = "2026-09-06"

def sinif(r, s):
    """dogru-sayfa.py ile aynı ayrım, yalnız bu okuma için gereken kadarı."""
    u = r.get("u")
    if not u or not r.get("sira"):
        return "yok"
    if u == "/mahalleler/" + s:
        return "dogru"
    m = re.match(r"/mahalleler/([^/]+)(/.*)?$", u)
    if m and not m.group(1).endswith("-mahallesi"):
        return "eski"
    if m and not m.group(2):
        return "mahalle"
    if "/adalar/" in u:
        return "ada"
    return "baska_site"

satirlar = []
for o in ORNEK:
    s = o["s"]
    v = [r for r in rows if r.get("s") == s]
    onceki = [r for r in v if r["d"] <= BAYAT_SINIR]
    yeni = [r for r in v if r["d"] > BAYAT_SINIR and r.get("u_kaynak") in ("href", None) and r.get("kanal") != "uule-eryaman"]
    if not onceki or not yeni:
        satirlar.append({"s": s, "q": o["q"], "olculdu": False})
        continue
    a, b = onceki[-1], yeni[-1]
    satirlar.append({"s": s, "q": o["q"], "olculdu": True,
                     "onceki": {"d": a["d"], "sira": a.get("sira") or 0, "sinif": sinif(a, s)},
                     "simdi": {"d": b["d"], "sira": b.get("sira") or 0, "sinif": sinif(b, s), "u": b.get("u")}})

olc = [x for x in satirlar if x["olculdu"]]
def ilk3(x): return 0 < x["sira"] <= 3
onc_i3d = [x for x in olc if ilk3(x["onceki"]) and x["onceki"]["sinif"] == "dogru"]   # önceden ilk 3 + doğru
kaldi = [x for x in onc_i3d if ilk3(x["simdi"]) and x["simdi"]["sinif"] == "dogru"]
i3_yanlis = [x for x in onc_i3d if ilk3(x["simdi"]) and x["simdi"]["sinif"] != "dogru"]
dustu = [x for x in onc_i3d if not ilk3(x["simdi"])]
simdi_i3 = [x for x in olc if ilk3(x["simdi"])]
simdi_i3d = [x for x in simdi_i3 if x["simdi"]["sinif"] == "dogru"]

def wilson(k, n, z=1.96):
    if not n:
        return None
    p = k / n
    c = (p + z * z / (2 * n)) / (1 + z * z / n)
    h = z * math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / (1 + z * z / n)
    return [round(100 * (c - h), 1), round(100 * (c + h), 1)]

cikti = {
    "guncelleme": datetime.date.today().isoformat(),
    "uretim": "yansiz-ornek-uret.py",
    "tohum": TOHUM,
    "ornek": len(ORNEK),
    "olculen": len(olc),
    "olcum_gunleri": sorted({x["simdi"]["d"] for x in olc}),
    "onceden_ilk3_dogru": len(onc_i3d),
    "hala_ilk3_dogru": len(kaldi),
    "ilk3te_ama_yanlis_sayfa": len(i3_yanlis),
    "ilk3ten_dustu": len(dustu),
    "hala_ilk3_dogru_yuzde": round(100 * len(kaldi) / len(onc_i3d), 1) if onc_i3d else None,
    "hala_ilk3_dogru_aralik95": wilson(len(kaldi), len(onc_i3d)),
    "simdi_ilk3": len(simdi_i3),
    "simdi_ilk3_dogru": len(simdi_i3d),
    "simdi_ilk3_dogru_yuzde": round(100 * len(simdi_i3d) / len(simdi_i3), 1) if simdi_i3 else None,
    "bozulanlar": [{"s": x["s"], "onceki_sira": x["onceki"]["sira"], "simdi_sira": x["simdi"]["sira"],
                    "simdi_sinif": x["simdi"]["sinif"], "u": x["simdi"].get("u")}
                   for x in onc_i3d if x not in kaldi],
    "satirlar": satirlar,
}

# Kaba yansıtma: dogru-sayfa.json'daki "daha eski" kovaya (yeniden ölçülmemiş kayıtlar) örnek
# oranları uygulanır. Sayı tahmindir; n=30 olduğu için aralık geniş, karne bunu açıkça yazar.
try:
    DS = yukle("dogru-sayfa.json")
    yk = DS.get("yas_kiyasi") or {}
    tz, es = yk.get("taze"), yk.get("eski")
    if tz and es and onc_i3d:
        p_kal = len(simdi_i3) / len(olc)                     # örnekte şimdi ilk 3'te olanların payı
        p_dog = len(simdi_i3d) / len(simdi_i3) if simdi_i3 else 0
        es_i3_tah = es["kayit"] * p_kal
        es_i3d_tah = es_i3_tah * p_dog
        top = DS.get("toplam") or (tz["kayit"] + es["kayit"])
        cikti["yansitma"] = {
            "eski_kova_kayit": es["kayit"],
            "tahmini_ilk3_pay": round(100 * (tz["ilk3"] + es_i3_tah) / top, 1),
            "tahmini_dogru_sayfa_pay": round(100 * (tz["ilk3_dogru"] + es_i3d_tah) / (tz["ilk3"] + es_i3_tah), 1),
            "karnedeki_ilk3_pay": round(100 * DS["ilk3_toplam"] / top, 1),
            "karnedeki_dogru_sayfa_pay": round(100 * DS["ilk3_dogru"] / DS["ilk3_toplam"], 1),
            "not": "Örnek oranları yeniden ölçülmemiş eski kayıtlara uygulandı; kaba tahmin.",
        }
except Exception as e:  # dogru-sayfa.json yoksa yansıtma basılmaz
    cikti["yansitma_hata"] = str(e)

with open(os.path.join(KOK, "yansiz-ornek.json"), "w", encoding="utf-8") as f:
    json.dump(cikti, f, ensure_ascii=False, indent=1)
    f.write("\n")
print(f"yansız örnek: {cikti['olculen']}/{cikti['ornek']} ölçüldü; önceden ilk 3'te doğru {cikti['onceden_ilk3_dogru']}, "
      f"hâlâ öyle {cikti['hala_ilk3_dogru']} (%{cikti['hala_ilk3_dogru_yuzde']}, %95 aralık {cikti['hala_ilk3_dogru_aralik95']}); "
      f"ilk 3'te ama yanlış sayfa {cikti['ilk3te_ama_yanlis_sayfa']}, ilk 3'ten düşen {cikti['ilk3ten_dustu']}")
print("yansıtma:", cikti.get("yansitma"))
