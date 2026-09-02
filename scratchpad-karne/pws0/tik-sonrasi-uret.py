#!/usr/bin/env python3
"""TIKTAN SONRA ne oluyor? — GA4 verisini karnenin okuduğu JSON'a indirger.

Karne 02.09'a kadar sıra + GSC tık/TO gösteriyordu; gelen kişinin sayfada ne
yaptığı yoktu. GA4 Data API 02.09'da açıldı (Özgün API'yi etkinleştirdi,
servis hesabı Görüntüleyici olarak eklendi). İlk okuma: 28 günde 2.393 oturum,
11 telefon tıklaması, 7 WhatsApp — ve site sayfasından sahibinden mağazasına
17 geçiş. Ev sahibi için asıl sonuç TEMAS; karne artık onu sayıyor.

İki ölçüm uyarısı, karnede de basılır:
  1. gtag.js sayfa hızı için boşta (≤3 sn) yüklenir; 3 sn altı ziyaretler hiç
     sayılmaz, süreler birkaç saniye eksik okunur (bilinçli tercih, lib/ga.ts).
  2. 26 tel: bağının 10'u PR #88'e kadar izlenmiyordu; phone_click bir TABAN,
     gerçek arama sayısı daha yüksek. PR yayına girince kıyas tabanı sıfırlanır.

Girdi : <scratchpad>/ga4-ozet28.json, ga4-aile28.json, ga4-olaylar28.tsv
        (node scripts/ga4-api.mjs ozet|aile|olaylar 28)
Çıktı : tik-sonrasi.json
"""
import json, os, sys, datetime
from pencere import ga4_pencere

S = os.environ.get("KARNE_SCRATCH", "")
KOK = os.path.dirname(os.path.abspath(__file__))
for f in ("ga4-ozet28.json", "ga4-aile28.json", "ga4-olaylar28.tsv"):
    if not S or not os.path.exists(f"{S}/{f}"):
        sys.exit(f"KARNE_SCRATCH içinde {f} yok")

ozet = json.load(open(f"{S}/ga4-ozet28.json"))
aile = json.load(open(f"{S}/ga4-aile28.json"))["aileler"]
olay = {}
for L in open(f"{S}/ga4-olaylar28.tsv"):
    p = L.rstrip("\n").split("\t")
    if len(p) == 2:
        try: olay[p[1]] = int(p[0])
        except ValueError: pass

AD = {"site": "Site sayfaları", "ana sayfa": "Ana sayfa", "mahalle": "Mahalle sayfaları",
      "ada": "Ada sayfaları", "etap": "Etap sayfaları", "yazı": "Yazılar", "diğer": "Diğer (araçlar, iletişim…)"}
oturum = ozet["oturum"] or 1
temas = {"phone_click": olay.get("phone_click", 0), "whatsapp_click": olay.get("whatsapp_click", 0),
         "form_start": olay.get("form_start", 0), "contact_form_submit": olay.get("contact_form_submit", 0),
         "site_ust_sahibinden": olay.get("site_ust_sahibinden", 0)}
cikti = {
    "guncelleme": datetime.date.today().isoformat(), "gun": ozet["gun"],
    # GA4'ün penceresi GSC'ninkinden farklı biter (dün / bugün−3); pencere.py'de gerekçesi.
    "pencere": ga4_pencere(ozet["gun"]),
    "ozet": ozet,
    "temas": temas,
    "temas_100": {k: round(v * 100 / oturum, 2) for k, v in temas.items()},
    "aileler": [{"ad": AD.get(a["aile"], a["aile"]), **a} for a in aile],
}
json.dump(cikti, open(f"{KOK}/tik-sonrasi.json", "w"), ensure_ascii=False, indent=1)
print(f"{ozet['gun']} gün · {ozet['oturum']} oturum · ort {ozet['ort_sure_sn']} sn · hemen çıkma %{ozet['hemen_cikma']}")
print("temas / 100 oturum:", {k: v for k, v in cikti["temas_100"].items()})
