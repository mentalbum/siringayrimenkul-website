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

ONCELIK = {"GÖRÜNMEZ": 0, "ada temsil": 1, "komşu sayfa temsil": 1,
           "mahalle sayfası temsil": 1, "eski slug": 2, "eski başlık": 3}
adaylar.sort(key=lambda x: (ONCELIK.get(x["tur"], 9), -x["gos"]))

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
       f"**{len(adaylar)} aday · {len(beklemede)} istek gönderilmiş bekliyor · "
       f"{len(dizinsizler)} dizinsiz (kota dışı)**\n",
       "## Öncelik sırası (görünmez → temsil edilen → eski slug → eski başlık)\n",
       "| # | Sayfa | Mahalle | SERP durumu | Sıra | Gösterim | Son tarama |",
       "|---|---|---|---|---|---|---|"]
for i, a in enumerate(adaylar, 1):
    sira = "yok" if a["sira"] == 0 else str(a["sira"]) + "."
    sat.append(f"| {i} | `{a['site']}` | {MAH_AD.get(a['mah'], a['mah'])} | {a['tur']} | "
               f"{sira} | {a['gos']} | {a['tarama']} |")

sat.append("\n## İstek gönderildi, tarama bekliyor\n")
for a in sorted(beklemede, key=lambda x: -x["gos"]):
    sira = "yok" if a["sira"] == 0 else str(a["sira"]) + "."
    sat.append(f"- `{a['site']}` ({MAH_AD.get(a['mah'], a['mah'])}) — {a['tur']}, sıra {sira}, {a['gos']} gösterim")

sat.append("\n## Dizinsiz + SERP'te kayıp (kota HARCANMAZ, doğal tarama beklenir)\n")
for a in sorted(dizinsizler, key=lambda x: (x["mah"], x["site"])):
    sat.append(f"- `{a['site']}` ({MAH_AD.get(a['mah'], a['mah'])}) — {a['tur']}")

open("dizin-adaylari.md", "w").write("\n".join(sat) + "\n")
print(f"yazıldı: dizin-adaylari.md — {len(adaylar)} aday, {len(beklemede)} bekleyen, {len(dizinsizler)} dizinsiz")
json.dump(adaylar, open("dizin-adaylari.json", "w"), ensure_ascii=False, indent=1)
