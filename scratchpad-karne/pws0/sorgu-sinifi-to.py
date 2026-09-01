#!/usr/bin/env python3
"""Sorgu SINIFINA göre tıklanma oranı — GSC raporunu hangi sınıf taşıyor?

01.09: Özgün'ün gönderdiği GSC raporu TO %2 diyor. Tek rakam hangi sorgu
sınıfının gösterim alıp tık ALMADIĞINI gizliyor. Bu betik son 28 günün ilk
1000 sorgusunu niyet sınıfına ayırır ve sınıf başına gösterim / tık / TO /
konum basar. Sınıflama sorgu metninden, kural tabanlı; sınır vakaları vardır,
oranlar büyüklük sırası için güvenilirdir, ondalığı için değil.

Girdi : <scratchpad>/sorgular28.tsv  (node scripts/gsc-api.mjs sorgular 28)
Çıktı : sorgu-sinifi-to.json — karne-html.py okur.
"""
import json, os, re, sys, collections, datetime

S = os.environ.get("KARNE_SCRATCH", "")
KOK = os.path.dirname(os.path.abspath(__file__))
if not S or not os.path.exists(f"{S}/sorgular28.tsv"):
    sys.exit("KARNE_SCRATCH ayarla; içinde sorgular28.tsv olmalı")

SINIF_AD = {
    "yalin": "Yalın site adı (ör. “X Sitesi”)",
    "alici": "Alıcı niyeti (satılık / kiralık / daire)",
    "site_emlakci": "“<site> emlakçı”",
    "bolge_emlakci": "“Eryaman / mahalle emlakçı”",
    "marka": "Marka (Şirin Gayrimenkul)",
    "sahip": "Ev sahibi niyeti (satmak / kiraya vermek / değerleme)",
}


def sinif(q):
    q = q.lower()
    if "şirin" in q or "sirin" in q:
        return "marka"
    if re.search(r"satmak|kiraya ver|değerleme|degerleme|ev sahibi|evimi", q):
        return "sahip"
    if re.search(r"satılık|kiralık|satilik|kiralik|fiyat|daire|m2|m²", q):
        return "alici"
    if re.search(r"emlakç|emlakc|emlak\b", q):
        # bölge sorgusu: "eryaman emlakçı", "tunahan mahallesi emlakçı", "etimesgut emlak".
        # Geri kalan her "… emlakçı" bir SİTE adı taşır (Koz Modern, Dalgıç Residence…).
        kalan = re.sub(r"emlakç\w*|emlakc\w*|emlak\b|mahallesi|mahalle|ankara|etimesgut|eryaman|"
                       r"tunahan|altay|devlet|göksu|goksu|güzelkent|guzelkent|şehit osman avcı|"
                       r"sehit osman avci|şeker|seker|şeyh şamil|seyh samil|yavuz selim|yeşilova|yesilova|"
                       r"\d\.?\s*etap|etap|\s", "", q)
        return "bolge_emlakci" if not kalan else "site_emlakci"
    return "yalin"


t = collections.defaultdict(lambda: {"sorgu": 0, "gos": 0, "tik": 0, "pozxg": 0.0})
makas = []
for L in open(f"{S}/sorgular28.tsv"):
    p = L.rstrip("\n").split("\t")
    if len(p) < 4:
        continue
    try:
        g, c, poz = int(p[0]), int(p[1]), float(p[2])
    except ValueError:
        continue
    k = sinif(p[3])
    o = t[k]
    o["sorgu"] += 1; o["gos"] += g; o["tik"] += c; o["pozxg"] += poz * g
    if g >= 40 and c * 100 / g < 2.0 and poz <= 5:
        makas.append({"q": p[3], "gos": g, "tik": c, "to": round(c * 100 / g, 1), "poz": poz, "sinif": k})

satir = []
for k, o in t.items():
    satir.append({"k": k, "ad": SINIF_AD.get(k, k), "sorgu": o["sorgu"], "gos": o["gos"], "tik": o["tik"],
                  "to": round(o["tik"] * 100 / o["gos"], 1) if o["gos"] else 0,
                  "poz": round(o["pozxg"] / o["gos"], 1) if o["gos"] else 0})
satir.sort(key=lambda x: -x["gos"])
makas.sort(key=lambda x: -x["gos"])
toplam_g = sum(x["gos"] for x in satir); toplam_t = sum(x["tik"] for x in satir)
cikti = {"guncelleme": datetime.date.today().isoformat(), "gun": 28, "toplam_gos": toplam_g, "toplam_tik": toplam_t,
         "to": round(toplam_t * 100 / toplam_g, 2) if toplam_g else 0, "siniflar": satir, "makas": makas[:12]}
json.dump(cikti, open(f"{KOK}/sorgu-sinifi-to.json", "w"), ensure_ascii=False, indent=1)
print(f"{'sınıf':46} {'sorgu':>6} {'gösterim':>9} {'tık':>5} {'TO':>6} {'konum':>6}")
for x in satir:
    print(f"{x['ad']:46} {x['sorgu']:6} {x['gos']:9} {x['tik']:5} {x['to']:5}% {x['poz']:6}")
print(f"\nkonum ≤5, gösterim ≥40, TO <%2 olan (snippet makası): {len(makas)}")
for m in makas[:6]:
    print(f"   {m['gos']:4} göst · {m['tik']:2} tık · konum {m['poz']:>4} · {m['q']}")
