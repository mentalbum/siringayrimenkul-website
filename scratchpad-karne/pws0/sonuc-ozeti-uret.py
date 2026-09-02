# -*- coding: utf-8 -*-
"""GSC'den SONUÇ verisini çeker (tık/gösterim/TO) ve karnenin okuduğu JSON'u üretir.

Neden: karne bugüne dek yalnız SIRA ölçüyordu. 31.08'de ölçüldü ki toplam
tıklamanın üçte biri 27.08'de siteden kaldırılan Yenimahalle sayfalarından
geliyor — bu trafik önümüzdeki haftalarda düşecek ve sıra karnesi bunu
"başarısızlık" gibi gösterecekti. Ayrım şart.

Pencere (02.09 denetimi): gsc-api.mjs artık bitişi GSC'nin gerçek son veri gününden
alır ve N VERİ günü ister; "ozet" çıktısı pencere/onceki_pencere/son_veri_gunu taşır,
bu JSON'a olduğu gibi geçer. Kümülatif 7/14/…/42 günlük "sayfalar" çekimleri de aynı
son veri gününde biter, yani haftalık dilimler tam 7 veri günüdür.

Kullanım: python3 sonuc-ozeti-uret.py     (GSC API çağrısı yapar, ~1 dk)
"""
import json, re, subprocess, datetime, os

KOK = "/Users/ozgun/websitem"
YM = re.compile(r"/mahalleler/(ata|susuz|cumhuriyet)(-mahallesi)?/")

def calistir(*a):
    return subprocess.run(["node", f"{KOK}/scripts/gsc-api.mjs", *a],
                          capture_output=True, text=True, cwd=KOK).stdout

ozet = json.loads(calistir("ozet", "28"))

def sayfa(gun):
    d = {}
    for l in calistir("sayfalar", str(gun)).splitlines():
        a = l.split("\t")
        if len(a) < 4:
            continue
        try:
            d[a[3]] = (int(a[0]), int(a[1]))
        except ValueError:      # ilk satır "# pencere" başlığı (gsc-api.mjs 02.09)
            continue
    return d

s28, s56 = sayfa(28), sayfa(56)
def bol(src):
    ym = ery = None
    ym = [0, 0]; ery = [0, 0]
    for u, (g, t) in src.items():
        hedef = ym if YM.search(u) else ery
        hedef[0] += g; hedef[1] += t
    return {"gos": ery[0], "tik": ery[1]}, {"gos": ym[0], "tik": ym[1]}

e28, y28 = bol(s28)
e56, y56 = bol(s56)
onceki = lambda a, b: {"gos": a["gos"] - b["gos"], "tik": a["tik"] - b["tik"]}
ozet["ayrim"] = {
    "eryaman": {"simdi": e28, "onceki": onceki(e56, e28)},
    "yenimahalle": {"simdi": y28, "onceki": onceki(y56, y28)},
}

# HAFTALIK AYRIM — 31.08'de iki hata birden bulundu ve ikisi de bu veriyle çözülüyor:
#
# 1) "Toplam +%130 büyüme" rozetleri yanıltıcıydı. GSC mülkünün verisi 25.06'da
#    BAŞLIYOR (ilk hafta 1 tık); "önceki 28 gün" tabanı mülkün ilk ayına denk
#    geliyor, yani rozet büyümeyi değil mülkün rampasını ölçüyordu.
# 2) "Son üç hafta düşüyor — sebebi Yenimahalle kaldırması" cümlesi de yanlıştı.
#    Haftalık ayrım gösteriyor ki düşüş HER İKİ grupta da var ve 27.08'den
#    ÖNCE başlamış. Yenimahalle'nin kalkması ayrıca gelecek bir kayıp, ama
#    şimdiki düşüşün sebebi değil.
haftalik = []
pencereler = [7, 14, 21, 28, 35, 42]
kumulatif = {g: bol(sayfa(g)) for g in pencereler}
onceki_g = None
for g in pencereler:
    e, y = kumulatif[g]
    if onceki_g is None:
        haftalik.append({"gecmis_hafta": 1, "eryaman": e["tik"], "yenimahalle": y["tik"]})
    else:
        # DİKKAT: pencereler KÜMÜLATİF (son 14 gün, son 21 gün...). Bir haftalık
        # dilim = BÜYÜK pencere eksi küçük pencere. İlk yazımda ters çıkarılmış
        # ve bütün haftalar eksi değer vermişti.
        pe, py = kumulatif[onceki_g]
        haftalik.append({"gecmis_hafta": g // 7,
                         "eryaman": e["tik"] - pe["tik"],
                         "yenimahalle": y["tik"] - py["tik"]})
    onceki_g = g
ozet["haftalik_ayrim"] = list(reversed(haftalik))   # eskiden yeniye

# MÜLKÜN İLK VERİSİ. 28 günlük çağrının serisi yalnız son 4 haftayı verir ve
# başlangıcı 01.08 sanır; gerçek başlangıç için geniş pencere sorulur.
_uzun = json.loads(calistir("ozet", "180")).get("haftalar") or []
ozet["mulk_baslangic"] = _uzun[0]["bas"] if _uzun else None
ozet["mulk_haftalari"] = len(_uzun)
ozet["uretim"] = datetime.date.today().isoformat()
if "pencere" not in ozet:
    raise SystemExit("gsc-api.mjs ozet çıktısında 'pencere' yok — scripts/gsc-api.mjs güncel değil")
p = f"{KOK}/scratchpad-karne/pws0/sonuc-ozeti.json"
json.dump(ozet, open(p, "w"), ensure_ascii=False, indent=1)
e, y = ozet["ayrim"]["eryaman"], ozet["ayrim"]["yenimahalle"]
print(f"yazıldı: sonuc-ozeti.json · pencere {ozet['pencere']['bas']} → {ozet['pencere']['bit']} "
      f"({ozet['pencere']['gun']} veri günü, GSC son veri günü {ozet['son_veri_gunu']})")
print(f"  toplam  {ozet['simdi']['tik']} tık · {ozet['simdi']['gos']} gösterim · TO %{ozet['simdi']['to']}")
print(f"  Eryaman {e['simdi']['tik']} tık (önceki {e['onceki']['tik']})")
print(f"  Yenimahalle {y['simdi']['tik']} tık — 27.08'de kaldırıldı, bu trafik düşecek")
