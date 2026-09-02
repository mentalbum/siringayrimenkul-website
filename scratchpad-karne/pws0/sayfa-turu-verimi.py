#!/usr/bin/env python3
"""Sayfa TÜRÜ başına verim — hangi sayfa ailesi trafiği taşıyor?

Karne bugüne dek sayfaları tek tek ölçüyordu; hangi AİLENİN emeğe değdiğini
göstermiyordu. Bu ayrım kararı değiştiriyor: ada sayfaları adres sayısı olarak
site sayfaları kadar (663'e 659) ama sayfa başına tıkları on üçte biri.

Yenimahalle (ata/susuz/cumhuriyet) hariç tutulur — 27.08'de siteden kaldırıldı.

Girdi : <scratchpad>/sayfalar28.tsv  (node scripts/gsc-api.mjs sayfalar 28)
        İlk satırı "# pencere" başlığı: bas/bit/gün oradan okunur (pencere.py).
Çıktı : sayfa-turu-verimi.json — "pencere": {bas, bit, gun} taşır.
"""
import json, os, re, sys, collections
from pencere import pencere_zorunlu

S = os.environ.get("KARNE_SCRATCH", "")
KOK = os.path.dirname(os.path.abspath(__file__))
if not S or not os.path.exists(f"{S}/sayfalar28.tsv"):
    sys.exit("KARNE_SCRATCH ayarla; içinde sayfalar28.tsv olmalı")
# 02.09 denetimi: bu JSON'da pencere hiç yoktu, karne sonuc-ozeti'nin gününü ödünç
# alıyordu; iki dosya farklı günlerde çekilince (31.08 / 02.09) yanlış oluyordu.
PENCERE = pencere_zorunlu(f"{S}/sayfalar28.tsv")

YM = re.compile(r"/mahalleler/(ata|susuz|cumhuriyet)(-mahallesi)?/")
AD = {"site": "Site sayfaları", "ada": "Ada sayfaları", "mahalle": "Mahalle sayfaları",
      "etap": "Etap sayfaları", "blog": "Yazılar", "diğer": "Diğer (ana sayfa, araçlar)"}


def tur(u):
    if "/adalar/" in u:
        return "ada"
    if "/etaplar/" in u:
        return "etap"
    if "/blog/" in u:
        return "blog"
    if re.search(r"/mahalleler/[^/]+/[^/]+/?$", u):
        return "site"
    if re.search(r"/mahalleler/[^/]+/?$", u):
        return "mahalle"
    return "diğer"


t = collections.defaultdict(lambda: [0, 0, 0])
for L in open(f"{S}/sayfalar28.tsv"):
    p = L.rstrip("\n").split("\t")
    if len(p) < 4:
        continue
    try:
        g, c = int(p[0]), int(p[1])
    except ValueError:
        continue
    if YM.search(p[3]):
        continue
    k = tur(p[3])
    t[k][0] += 1
    t[k][1] += g
    t[k][2] += c

satir = []
for k, (n, g, c) in t.items():
    satir.append({"tur": k, "ad": AD.get(k, k), "sayfa": n, "gos": g, "tik": c,
                  "tik_sayfa": round(c / n, 2) if n else 0,
                  "to": round(c * 100 / g, 2) if g else 0})
satir.sort(key=lambda x: -x["tik"])

cikti = {"guncelleme": __import__("datetime").date.today().isoformat(),
         "pencere": PENCERE, "gun": PENCERE["gun"], "satirlar": satir}
json.dump(cikti, open(f"{KOK}/sayfa-turu-verimi.json", "w"), ensure_ascii=False, indent=1)
print(f"pencere {PENCERE['bas']} → {PENCERE['bit']} ({PENCERE['gun']} veri günü)")
print(f"{'tür':26} {'adres':>6} {'gösterim':>9} {'tık':>6} {'tık/adres':>10} {'TO':>7}")
for r in satir:
    print(f"{r['ad']:26} {r['sayfa']:6} {r['gos']:9} {r['tik']:6} {r['tik_sayfa']:10} {r['to']:6}%")
