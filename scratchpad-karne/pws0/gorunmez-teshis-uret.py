#!/usr/bin/env python3
"""SERP'te görünmeyen sayfaların GERÇEK teşhisi.

31.08'e kadar karne "görünmüyor → dizine ekle" varsayıyordu. API denetimi bunu
çürüttü: görünmeyen 96 sayfanın 57'si zaten dizinde ve 28 günde 2.584 gösterim
alıyor. Yani iki bambaşka sorun tek kutuda toplanmıştı:

  DİZİN SORUNU  → sayfa Google'da yok, sıfır gösterim. İlacı dizin isteği (kanıtlı).
  SIRA SORUNU   → sayfa dizinde, başka sorgularda çalışıyor, kendi adında ilk 10 dışı.
                  Dizin isteği buna ÇARE DEĞİL, kotayı yakar.

Girdi: <scratchpad>/gorunmez-denetim.tsv (gsc-api denetle-dosya çıktısı)
       sayfalar28.tsv (gsc-api sayfalar 28)
Çıktı: gorunmez-teshis.json — karne-html.py okur.
"""
import json, os, sys, collections
from pencere import pencere_zorunlu

S = os.environ.get("KARNE_SCRATCH", "")
if not S or not os.path.isdir(S):
    sys.exit("KARNE_SCRATCH ayarla (denetim tsv'lerinin durduğu klasör)")

# Gösterim/tık sütunlarının penceresi sayfalar28.tsv'nin başlığından (pencere.py, 02.09).
PENCERE = pencere_zorunlu(f"{S}/sayfalar28.tsv")
gost = {}
for L in open(f"{S}/sayfalar28.tsv"):
    p = L.rstrip("\n").split("\t")
    if len(p) < 4: continue
    try: gost[p[3].rstrip("/")] = (int(p[0]), int(p[1]), float(p[2]))
    except ValueError: pass

# 31.08 (ikinci düzeltme): görünmez listesi ölçüm TARİHÇESİNDEN türetiliyordu
# ve tarihçede içerik dosyası artık olmayan 16 anahtar duruyordu (eski slug'lar +
# yanlış mahalleye yazılmış üç kayıt). Onlar canlıda 404 veriyor — "dizin dışı"
# değil, YOK. Kota harcanmasın diye içerik dosyasıyla süzülüyor.
KOK = "/Users/ozgun/websitem/content/siteler"

def _gercek(u):
    if "/mahalleler/" not in u: return True          # mahalle kökü vb.
    yol = u.split("/mahalleler/")[1].rstrip("/")
    if yol.count("/") != 1: return True
    return os.path.exists(f"{KOK}/{yol}.json")

diz, olu, hatali, hayalet = [], [], [], []
for L in open(f"{S}/gorunmez-denetim.tsv"):
    p = L.rstrip("\n").split("\t")
    if len(p) < 3: continue
    if p[1] == "HATA":                 # 3 sütunlu satır: url \t HATA \t mesaj
        hatali.append({"u": p[0], "kapsam": p[2]}); continue
    if len(p) < 4: continue
    u = p[0].rstrip("/")
    if not _gercek(u):
        hayalet.append(u); continue
    kayit = {"u": u, "kapsam": p[2], "tarama": p[3],
             "gost": gost.get(u, (0, 0, 0))[0], "tik": gost.get(u, (0, 0, 0))[1],
             "poz": gost.get(u, (0, 0, 0))[2],
             "mah": u.split("/mahalleler/")[1].split("/")[0] if "/mahalleler/" in u else "?"}
    (diz if p[1] == "MEVCUT" else olu).append(kayit)

def topla(v):
    return {"n": len(v), "gost": sum(x["gost"] for x in v), "tik": sum(x["tik"] for x in v),
            "poz": round(sum(x["poz"] for x in v if x["gost"]) / max(1, sum(1 for x in v if x["gost"])), 1),
            "mah": collections.Counter(x["mah"] for x in v).most_common()}

cikti = {"guncelleme": "2026-08-31", "pencere": PENCERE,
         "sira_sorunu": topla(diz), "dizin_sorunu": topla(olu),
         "denetlenemedi": len(hatali), "hayalet": len(hayalet),
         "taze_ama_gorunmez": sum(1 for x in diz if x["tarama"] >= "2026-08-24"),
         "olu_liste": sorted((x["u"] for x in olu))}
json.dump(cikti, open("gorunmez-teshis.json", "w"), ensure_ascii=False, indent=1)
print(f"sıra sorunu {cikti['sira_sorunu']['n']} · dizin sorunu {cikti['dizin_sorunu']['n']} "
      f"· denetlenemedi {cikti['denetlenemedi']} · hayalet (içerik dosyası yok) {cikti['hayalet']}")
