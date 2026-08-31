# -*- coding: utf-8 -*-
"""SERP turlarından dizin isteği adaylarını üretir.

Ölçüt: sayfa SERP'te kayıp (görünmez / ada / komşu / mahalle sayfası temsil /
eski slug / eski başlık) VE dizin envanterinde bayat.
Dizinsizlere kota harcanmaz (Özgün kararı) — ayrı listede raporlanır.
Zaten istek gönderilmişler (28-29.08) düşülür.
"""
import json, re, datetime

rows = [json.loads(l) for l in open("sonuclar-site-emlakci.jsonl") if l.strip()]
son = {}
for r in rows:
    son[r["s"]] = r

DA = json.load(open("dizin-analiz-2708.json"))
durum, gos, tarama = {}, {}, {}
for mah, v in DA.items():
    if not isinstance(v, dict):
        continue
    for k in ("dizinsiz", "bayat", "orta", "taze"):
        for x in v.get(k, []):
            yol = x[0]
            durum[yol] = k
            tarama[yol] = x[1]
            gos[yol] = x[2]

istekli = set()
for dosya in ("DIZINE-EKLENECEKLER.md", "gsc-dizin-kuyrugu-194.md"):
    try:
        metin = open(dosya).read()
    except FileNotFoundError:
        continue
    for m in re.finditer(r"(/mahalleler/\S+?)\s.*?istek gönderildi", metin):
        istekli.add(m.group(1).rstrip(">"))

TAZE_BAS = re.compile(r"Emlakçı\s*\|")  # 2026-08 şablonu

def sinif(r):
    """SERP kaybının türü; None = kayıp yok"""
    if r["sira"] == 0:
        return "GÖRÜNMEZ"
    u = r.get("u") or ""
    kendi = r["s"].split("/")[-1]
    mah = r["s"].split("/")[0]
    eski_mah = mah.replace("-mahallesi", "")
    if "/adalar/" in u:
        return "ada temsil"
    if u.rstrip("/").endswith("/" + eski_mah) or u.rstrip("/").endswith("/" + mah):
        return "mahalle sayfası temsil"
    if u and not u.rstrip("/").endswith("/" + kendi):
        return "komşu sayfa temsil"
    if "/mahalleler/" + eski_mah + "/" in u:
        return "eski slug"
    bas = r.get("bas") or ""
    if bas and not TAZE_BAS.search(bas):
        return "eski başlık"
    return None

adaylar, dizinsizler, beklemede = [], [], []
YASAK = ("ata-mahallesi/", "susuz-mahallesi/", "cumhuriyet-mahallesi/")  # 27.08 siteden kaldırıldı, 410

for s, r in son.items():
    if "/" not in s or "/etaplar/" in s:
        continue
    if s.startswith(YASAK):      # Yenimahalle grubu — istek GÖNDERİLMEZ
        continue
    if r["d"] < "2026-08-21":     # bayat ölçüm — tur dışı
        continue
    t = sinif(r)
    if not t:
        continue
    yol = "/mahalleler/" + s
    d = durum.get(yol, "?")
    kayit = dict(yol=yol, mah=s.split("/")[0], site=s.split("/")[-1], tur=t,
                 sira=r["sira"], gos=gos.get(yol, 0), tarama=tarama.get(yol, "-"),
                 durum=d, olcum=r["d"])
    if yol in istekli:
        beklemede.append(kayit)
    elif d == "dizinsiz":
        dizinsizler.append(kayit)
    elif d in ("bayat", "orta", "?"):
        adaylar.append(kayit)

# 31.08 — EN AĞIR KUSUR BURADAYDI. Adaylar yalnız SERP KAYBINA göre seçiliyordu;
# sayfanın Google'da olup olmadığına hiç bakılmıyordu. Ölçüldü: 203 adayın
# 203'ü de aslında DİZİNDE. Yani tablo, karnenin kendi teşhis bölümünün
# "dizin isteği bunlara boşa gider, kotayı yakar" dediği gruptan öneri
# yapıyordu. Artık gorunmez-teshis.json'daki API doğrulaması bağlanıyor:
#   dizin dışı  → istek gönderilir (gerçek aday)
#   dizinde     → SIRA sorunu; ayrı listeye alınır, kota harcanmaz
# Doğrulanmış ölü sayfa kümesi İKİ kaynaktan birleşir:
#   gorunmez-teshis.json  → SERP'te görünmeyenlerin API denetimi (17 sayfa)
#   DIZIN-DAMLASI-31-08.md → damla kuyruğunun açık maddeleri; hepsi API ile
#     dizin dışı doğrulandı (71 sayfa). Tek başına ilkini kullanmak listeyi
#     eksik bırakıyordu.
import re as _re
_OLU = set()
try:
    _t = json.load(open("gorunmez-teshis.json"))
    _OLU |= {u.rstrip("/") for u in _t.get("olu_liste", [])}
except Exception:
    pass
try:
    _kuyruk = open("DIZIN-DAMLASI-31-08.md").read()
    _OLU |= {m.rstrip("/") for m in _re.findall(r"^- \[ \] (https://\S+)", _kuyruk, _re.M)}
except Exception:
    pass
if not _OLU:
    _OLU = None

_SITE = "https://www.siringayrimenkul.com"
sira_sorunlulari = []
if _OLU is not None:
    _gercek = [a for a in adaylar if f"{_SITE}{a['yol']}" in _OLU]
    sira_sorunlulari = [a for a in adaylar if f"{_SITE}{a['yol']}" not in _OLU]
    adaylar = _gercek

ONCELIK = {"GÖRÜNMEZ": 0, "ada temsil": 1, "komşu sayfa temsil": 1,
           "mahalle sayfası temsil": 1, "eski slug": 2, "eski başlık": 3}
adaylar.sort(key=lambda x: (ONCELIK.get(x["tur"], 9), -x["gos"]))
sira_sorunlulari.sort(key=lambda x: -x["gos"])

MAH_AD = {"tunahan-mahallesi": "Tunahan", "altay-mahallesi": "Altay",
          "devlet-mahallesi": "Devlet", "eryaman-mahallesi": "Eryaman",
          "goksu-mahallesi": "Göksu", "guzelkent-mahallesi": "Güzelkent",
          "sehit-osman-avci-mahallesi": "Şehit Osman Avcı", "seker-mahallesi": "Şeker",
          "seyh-samil-mahallesi": "Şeyh Şamil", "yavuz-selim-mahallesi": "Yavuz Selim",
          "yesilova-mahallesi": "Yeşilova"}

bugun = datetime.date.today().strftime("%d.%m.%Y")
sat = ["# DİZİN İSTEĞİ ADAYLARI — SERP turlarından üretildi",
       f"\nÜretim: {bugun} · `python3 dizin-adaylari-uret.py`  ",
       "Ölçüt: sayfa SERP'te kayıp + dizinde bayat. Dizinsizlere kota harcanmaz",
       "(Özgün kararı) — ayrı bölümde. İstek gönderilmişler düşüldü.  ",
       "Yenimahalle grubu (Ata/Susuz/Cumhuriyet) hariç — 27.08'de siteden kaldırıldı, 410.  ",
       "**Bu liste ADAY listesidir**: istek öncesi sayfa API ile doğrulanır ve",
       "SERP'te kendiliğinden kurtulmuşsa kota harcanmaz.\n",
       f"**{len(adaylar)} aday · {len(sira_sorunlulari)} SIRA sorunu (kota harcanmaz) · "
       f"{len(beklemede)} istek gönderilmiş bekliyor · {len(dizinsizler)} dizinsiz**\n",
       "> **Aday olmak için SERP'te kayıp olmak yetmez, Google'da OLMAMAK gerekir.**",
       "> 31.08'de ölçüldü: SERP kaybına göre seçilen 203 sayfanın 203'ü de zaten",
       "> dizindeydi. Onlara istek göndermek kotayı yakar, sıra kazandırmaz —",
       "> dertleri dizin değil sıra. Bu liste artık GSC denetimiyle süzülüyor.\n",
       "## Öncelik sırası (görünmez → temsil edilen → eski slug → eski başlık)\n",
       "| # | Sayfa | Mahalle | SERP durumu | Sıra | Gösterim | Son tarama |",
       "|---|---|---|---|---|---|---|"]
for i, a in enumerate(adaylar, 1):
    sira = "yok" if a["sira"] == 0 else str(a["sira"]) + "."
    sat.append(f"| {i} | `{a['site']}` | {MAH_AD.get(a['mah'], a['mah'])} | {a['tur']} | "
               f"{sira} | {a['gos']} | {a['tarama']} |")

sat.append("\n## SERP'te kayıp AMA dizinde — kota harcanmaz, sıra sorunu\n")
sat.append("Bu sayfalar Google'da var; SERP'te kaybolmalarının sebebi dizin değil.")
sat.append("Dizin isteği göndermek kotayı boşa yakar.\n")
for a in sira_sorunlulari[:40]:
    sira = "yok" if a["sira"] == 0 else str(a["sira"]) + "."
    sat.append(f"- `{a['site']}` ({MAH_AD.get(a['mah'], a['mah'])}) — {a['tur']}, "
               f"sıra {sira}, {a['gos']} gösterim")
if len(sira_sorunlulari) > 40:
    sat.append(f"- … ve {len(sira_sorunlulari) - 40} sayfa daha")

sat.append("\n## İstek gönderildi, tarama bekliyor\n")
for a in sorted(beklemede, key=lambda x: -x["gos"]):
    sira = "yok" if a["sira"] == 0 else str(a["sira"]) + "."
    sat.append(f"- `{a['site']}` ({MAH_AD.get(a['mah'], a['mah'])}) — {a['tur']}, sıra {sira}, {a['gos']} gösterim")

sat.append("\n## Dizinsiz + SERP'te kayıp (kota HARCANMAZ, doğal tarama beklenir)\n")
for a in sorted(dizinsizler, key=lambda x: (x["mah"], x["site"])):
    sat.append(f"- `{a['site']}` ({MAH_AD.get(a['mah'], a['mah'])}) — {a['tur']}")

open("dizin-adaylari.md", "w").write("\n".join(sat) + "\n")
print(f"yazıldı: dizin-adaylari.md — {len(adaylar)} GERÇEK aday, "
      f"{len(sira_sorunlulari)} sıra sorunu (kota harcanmaz), "
      f"{len(beklemede)} bekleyen, {len(dizinsizler)} dizinsiz")
json.dump(adaylar, open("dizin-adaylari.json", "w"), ensure_ascii=False, indent=1)
json.dump(sira_sorunlulari, open("sira-sorunlulari.json", "w"), ensure_ascii=False, indent=1)
