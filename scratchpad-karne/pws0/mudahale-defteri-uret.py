#!/usr/bin/env python3
"""MÜDAHALE DEFTERİ — yaptığımız iş işe yaradı mı?

Karne 24 bölüme çıktı ama hiçbiri şu soruyu sormuyordu: "gönderdiğimiz dizin
istekleri SONUÇ verdi mi?" 14.08'den bu yana 37 sayfaya istek gönderilmiş;
hangisi dizine girdi, hangisi girmedi, girenlerin sırası ne oldu — hiçbir yerde
yazmıyordu. Karne "ne durumdayız"ı gösteriyordu, "yaptığımız işe yaradı mı"yı
göstermiyordu. Bu betik o döngüyü kapatır.

Üç kaynak birleşir:
  1. Kuyruk dosyaları: "← GG.AA istek gönderildi" işaretleri (ne zaman, hangi sayfa)
  2. GSC API denetimi: sayfa ŞİMDİ dizinde mi, en son ne zaman tarandı
  3. SERP ölçümleri: istekten ÖNCEKİ ve SONRAKİ sıra (sonuclar-site-emlakci.jsonl)

DİKKAT — bu bir GÖZLEM defteri, kontrollü deney DEĞİL. Aynı dönemde istek
gönderilmeden kendiliğinden dizine giren sayfalar da var (03.09'da 4 tane).
"İstek işe yaradı" ile "zaten girecekti" bu veriyle AYRILAMAZ; karnede bu uyarı
basılır. Gerçek nedensellik için kontrol grubu gerekir.

Girdi : DIZIN-DAMLASI-31-08.md + gsc-dizin-kuyrugu-194.md (istek işaretleri)
        <scratchpad>/istek-sonuc.tsv  (node scripts/gsc-api.mjs denetle-dosya)
        sonuclar-site-emlakci.jsonl   (sıra tarihçesi)
Çıktı : mudahale-defteri.json
"""
import json, os, re, sys, datetime, collections

KOK = os.path.dirname(os.path.abspath(__file__))
S = os.environ.get("KARNE_SCRATCH", "")
if not S or not os.path.exists(f"{S}/istek-sonuc.tsv"):
    sys.exit("KARNE_SCRATCH içinde istek-sonuc.tsv yok. Önce:\n"
             "  grep '← .. istek gönderildi' ile URL listesi çıkar\n"
             "  node scripts/gsc-api.mjs denetle-dosya <liste> <scratchpad>/istek-sonuc.tsv")

YIL = 2026
SITE = "https://www.siringayrimenkul.com"


def tarihe(gg_aa):
    g, a = gg_aa.split(".")
    return datetime.date(YIL, int(a), int(g))


# 1) istek işaretleri — iki kuyruk dosyasından
istek = {}
for dosya in ("DIZIN-DAMLASI-31-08.md", "gsc-dizin-kuyrugu-194.md"):
    p = os.path.join(KOK, dosya)
    if not os.path.exists(p):
        continue
    for m in re.finditer(r"^- \[x\] (https://\S+?)\s*←\s*(\d\d\.\d\d) istek gönderildi",
                         open(p).read(), re.M):
        u = m.group(1).rstrip("/")
        istek.setdefault(u, {"url": u, "tarih": m.group(2), "kaynak": dosya})

# 2) şimdiki dizin durumu
durum = {}
for L in open(f"{S}/istek-sonuc.tsv"):
    x = L.rstrip("\n").split("\t")
    if len(x) >= 4 and x[1] in ("MEVCUT", "YOK"):
        durum[x[0].rstrip("/")] = {
            "dizinde": x[1] == "MEVCUT", "kapsam": x[2],
            "son_tarama": x[3][:10] if x[3] != "-" else None,
        }

# 3) sıra tarihçesi
gecmis = collections.defaultdict(list)
for L in open(os.path.join(KOK, "sonuclar-site-emlakci.jsonl")):
    L = L.strip()
    if not L:
        continue
    try:
        r = json.loads(L)
    except json.JSONDecodeError:
        continue
    if r.get("s"):
        gecmis[f"{SITE}/mahalleler/{r['s']}"].append(r)

bugun = datetime.date.today()
satir = []
for u, i in istek.items():
    d = durum.get(u) or {}
    t = tarihe(i["tarih"])
    v = sorted(gecmis.get(u, []), key=lambda r: r.get("d") or "")
    once = [r for r in v if (r.get("d") or "") < t.isoformat()]
    sonra = [r for r in v if (r.get("d") or "") >= t.isoformat()]
    gun = (bugun - t).days
    st = d.get("son_tarama")
    satir.append({
        "url": u,
        "sayfa": u.split("/mahalleler/")[-1],
        "istek_tarihi": i["tarih"],
        "gun_gecti": gun,
        "dizinde": d.get("dizinde"),
        "kapsam": d.get("kapsam"),
        "son_tarama": st,
        # istekten SONRA taranmış mı — isteğin tetiklediği tarama buradan okunur
        "istekten_sonra_tarandi": bool(st and st >= t.isoformat()),
        "sira_once": (once[-1].get("sira") if once else None) or 0,
        "sira_sonra": (sonra[-1].get("sira") if sonra else None) or 0,
        "olculdu_sonra": bool(sonra),
        "sonuc": ("dizine girdi" if d.get("dizinde")
                  else ("henüz erken" if gun < 3 else "girmedi")),
    })
satir.sort(key=lambda x: (x["istek_tarihi"], x["sayfa"]))

# Olgun = isteğin üzerinden en az 3 gün geçmiş; öncesi "henüz erken".
olgun = [x for x in satir if x["gun_gecti"] >= 3]
girdi = [x for x in olgun if x["dizinde"]]
sirali = [x for x in girdi if x["sira_sonra"] > 0]
ilk3 = [x for x in sirali if x["sira_sonra"] <= 3]
tarandi = [x for x in olgun if x["istekten_sonra_tarandi"]]

# Bugün gönderilen istekler ayrıca sayılır: 03.09'da 8 sayfanın 8'i istekten
# ~1 saat sonra taranıp dizine girdi. "Olgun" eşiği (3 gün) SIRA okumak için
# doğru ama DİZİN dönüşümü çok daha hızlı olabiliyor; ikisi ayrı raporlanır.
hepsi_girdi = [x for x in satir if x["dizinde"]]
ayni_gun = [x for x in satir if x["dizinde"] and x["son_tarama"]
            and x["son_tarama"] == tarihe(x["istek_tarihi"]).isoformat()]

cikti = {
    "guncelleme": bugun.isoformat(),
    "toplam_istek": len(satir),
    "hepsi_girdi": len(hepsi_girdi),
    "hepsi_donusum": round(len(hepsi_girdi) * 100 / len(satir)) if satir else None,
    "ayni_gun_tarandi": len(ayni_gun),
    "olgun": len(olgun),
    "bekleyen": len(satir) - len(olgun),
    "dizine_girdi": len(girdi),
    "girmedi": len(olgun) - len(girdi),
    "donusum": round(len(girdi) * 100 / len(olgun)) if olgun else None,
    "istekten_sonra_tarandi": len(tarandi),
    "tarama_orani": round(len(tarandi) * 100 / len(olgun)) if olgun else None,
    "girenlerden_olculdu": len(sirali),
    "girenlerden_ilk3": len(ilk3),
    "tarihe_gore": [
        {"tarih": t, "istek": n,
         "girdi": sum(1 for x in satir if x["istek_tarihi"] == t and x["dizinde"]),
         "olgun": sum(1 for x in satir if x["istek_tarihi"] == t and x["gun_gecti"] >= 3)}
        for t, n in sorted(collections.Counter(x["istek_tarihi"] for x in satir).items())
    ],
    "satirlar": satir,
    "uyari": ("GÖZLEM defteri, kontrollü deney değil: aynı dönemde istek gönderilmeden "
              "kendiliğinden dizine giren sayfalar da var (03.09'da 4). 'İstek işe yaradı' "
              "ile 'zaten girecekti' bu veriyle ayrılamaz."),
}
json.dump(cikti, open(os.path.join(KOK, "mudahale-defteri.json"), "w"),
          ensure_ascii=False, indent=1)

print(f"{cikti['toplam_istek']} istek · olgun {cikti['olgun']} · dizine girdi "
      f"{cikti['dizine_girdi']} (%{cikti['donusum']}) · henüz erken {cikti['bekleyen']}")
print(f"istekten sonra taranan: {cikti['istekten_sonra_tarandi']}/{cikti['olgun']} "
      f"(%{cikti['tarama_orani']})")
print("tarihe göre (girdi/istek):",
      ", ".join(f"{t['tarih']} {t['girdi']}/{t['istek']}" for t in cikti["tarihe_gore"]))
print(f"girenlerin {cikti['girenlerden_olculdu']}'i sonradan ölçülmüş, "
      f"{cikti['girenlerden_ilk3']}'i ilk 3'te")
print(f"TÜM istekler: {cikti['hepsi_girdi']}/{cikti['toplam_istek']} dizinde "
      f"(%{cikti['hepsi_donusum']}); istek günü taranan: {cikti['ayni_gun_tarandi']}")
