# -*- coding: utf-8 -*-
"""SERP turlarından dizin isteği adaylarını üretir.

Ölçüt: sayfa SERP'te kayıp (görünmez / ada / komşu / mahalle sayfası temsil /
eski slug / eski başlık) VE dizin envanterinde bayat.
Dizinsizlere kota harcanmaz (Özgün kararı) — ayrı listede raporlanır.
Zaten istek gönderilmişler (28-29.08) düşülür.
"""
import json, re, datetime
import tranahtar

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

# Güncel başlık şablonları: 2026-08 ("<Site> Emlakçı | …") ve Başlık deneyi 2'nin tedavi başlığı
# ("<Site> Eryaman | Tapu ve Site Bilgileri", 07.10). İkincisi yoktu; Google yeni başlığı gösterdikçe
# 50 tedavi sayfası "eski başlık" görünecekti (08.10, karne incelemesi ana-2).
TAZE_BAS = re.compile(r"Emlakçı\s*\||\|\s*Tapu ve Site Bilgileri")

def sinif(r):
    """SERP kaybının türü; None = kayıp yok (ya da bilinmiyor)"""
    if r["sira"] == 0:
        return "GÖRÜNMEZ"
    u = r.get("u") or ""
    # adresi doğrulanamayan kayıt (u = "cite:…" ya da kesik kırıntı): hangi sayfanın çıktığı bilinmiyor,
    # "komşu sayfa temsil" denemez (dogru-sayfa.py'nin 'belirsiz' kuralıyla aynı)
    if u.startswith("cite:") or "…" in u or "..." in u:
        return None
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
    # Başlık: varsa kesilmemiş 'bas_tam'. 06.09–07.10 arası kayıtlarda yalnız 25 karaktere kesilmiş 'bas'
    # var ("Altıntepe Sitesi Emlakçı " gibi; '|' kesimde kalmış). Kesik başlıktan şablon okunamaz:
    # o kayıtlara "eski başlık" DENMEZ (bilinmiyor). Aynı kusurun ikinci biçimi: 05–06.09 ve 06–07.10'un 86
    # kaydında başlık '|' işaretinin hemen önünde kesilmiş ("Ulaş Sitesi Emlakçı "); o da okunamaz sayılır.
    # 08.10 koşusunda bu iki kuralla "eski başlık" diye listelenen sıra sorunu 134'ten 19'a indi; yeni
    # şablonu taşıyan altintepe-sitesi adaylıktan düştü.
    bas = r.get("bas_tam") or r.get("bas") or ""
    if not r.get("bas_tam") and (len(bas) == 25 or bas.rstrip().endswith("Emlakçı")):
        return None
    if bas and not TAZE_BAS.search(bas):
        return "eski başlık"
    return None

adaylar, dizinsizler, beklemede = [], [], []
YASAK = ("ata-mahallesi/", "susuz-mahallesi/", "cumhuriyet-mahallesi/",  # 27.08 siteden kaldırıldı, 410
         "devlet-mahallesi/4-devlet-mahallesi-sitesi")  # 06.10 sayfa kaldırıldı (Maliye Lojmanları), 410 — istek gönderme

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
#   DIZIN-DAMLASI-31-08.md → damla kuyruğunun açık maddeleri. Tek başına ilkini
#     kullanmak listeyi eksik bırakıyordu.
# 08.10 — AÇIK SATIRIN HEPSİ "DİZİN DIŞI" DEĞİL. 31.08'de kuyruktaki her açık madde API ile dizin dışı
# doğrulanmıştı; sonradan aynı dosyaya "yeniden tarama" (sayfa dizinde, yalnız kopyası bayat) ve
# "eski adres" (308 veren 26.07 öncesi adres) satırları da eklendi. Açık satırın türü artık karnenin
# öbür okuyucularıyla (karne-html.py, yonetici-ozeti-uret.py, anlik-goruntu-uret.py, is-takvimi-uret.py)
# AYNI kuralla okunur; biri değişirse beşi birden değişir:
#   eski_adres      adres eski şemada: /mahalleler/<slug> (alt yollu ya da yolsuz; mahalle KÖKÜ de eski
#                   adrestir) ve <slug> "-mahallesi" ile bitmiyor
#   dizin_disi      değilse, satırın "←" SONRASI notunda "dizin dışı" geçiyor; büyük/küçük harf ayrımı yok
#                   ("DİZİN DIŞI", "Dizin dışı" da eşleşir). Harf süzgeci tranahtar.anahtar: str.lower()
#                   Türkçe İ'de bozulur. Okun SOLUNDAKİ metne bakılmaz.
#   yeniden_tarama  ikisi de değil
# Ölü sayfa kümesine yalnız dizin_disi girer. "https" taşımayan "- [ ]" satırları eskisi gibi sayım dışı.
# Yazım öbür okuyuculardaki işlevle satır satır aynı tutulur (bu betik ayrıca adresi de döndürür).
def damla_turu(satir):
    m = re.match(r"^- \[ \] (https://\S+)(.*)$", satir)
    if not m:
        return None, None
    url = m.group(1).rstrip("/")
    e = re.match(r"^https://[^/]+/mahalleler/([^/?#]+)", m.group(1))
    if e and not e.group(1).endswith("-mahallesi"):
        return "eski_adres", url
    kalan = m.group(2)
    notu = kalan.split("←", 1)[1] if "←" in kalan else ""
    return ("dizin_disi" if tranahtar.anahtar("dizin dışı") in tranahtar.anahtar(notu) else "yeniden_tarama"), url

_OLU = set()
_kaynak_okundu = False   # iki kaynaktan en az biri okunabildi mi (boş küme ≠ kaynak yok)
_damla_say = {"dizin_disi": 0, "yeniden_tarama": 0, "eski_adres": 0}
try:
    _t = json.load(open("gorunmez-teshis.json"))
    _OLU |= {u.rstrip("/") for u in _t.get("olu_liste", [])}
    _kaynak_okundu = True
except Exception:
    pass
try:
    for _satir in open("DIZIN-DAMLASI-31-08.md").read().split("\n"):
        _tur, _url = damla_turu(_satir)
        if not _tur:
            continue
        _damla_say[_tur] += 1
        if _tur == "dizin_disi":
            _OLU.add(_url)
    _kaynak_okundu = True
except Exception:
    pass
# Eskiden "küme boşsa süzme" deniyordu; o kural, doğrulanmış ölü sayfa KALMADIĞINDA (bugünkü durum) bütün
# SERP-kayıp sayfaları yeniden "aday" yapardı. Süzgeç yalnız iki kaynak da okunamazsa atlanır.
if not _kaynak_okundu:
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
print(f"damla kuyruğu açık satırları: dizin dışı {_damla_say['dizin_disi']}, "
      f"yeniden tarama bekleyen {_damla_say['yeniden_tarama']}, eski adres {_damla_say['eski_adres']}"
      + ("" if _kaynak_okundu else " — UYARI: doğrulama kaynakları okunamadı, liste SÜZÜLMEDİ"))
json.dump(adaylar, open("dizin-adaylari.json", "w"), ensure_ascii=False, indent=1)
json.dump(sira_sorunlulari, open("sira-sorunlulari.json", "w"), ensure_ascii=False, indent=1)
