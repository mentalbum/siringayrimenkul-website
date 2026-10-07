#!/usr/bin/env python3
"""Sırayı KİM tutuyor? — "ilk 3'teyiz" demek "doğru sayfa çıkıyor" demek değil.

31.08 denetiminde ortaya çıktı: karne "%68'i ilk 3'te" diyordu ama o sıraların
üçte biri YANLIŞ sayfamızla kazanılmış. Site adını arayan kişi ada sayfasına,
mahalle sayfasına ya da taşınmadan önceki adrese düşüyor. Sıra tutuluyor,
ziyaretçi aradığını bulamıyor — bu ikisi ayrı ölçülmeli.

08.10 denetimi (ye-1) üç şey ekledi:
  * Adaş eş: kuyruğun "es" alanı aynı sorguyu paylaşan adaş kaydı gösterir
    (Doktorlar Sitesi Altay / Yavuz Selim). Eş çıktıysa bu "başka site" değil,
    doğru sayfadır (ilk3-hedef-uret.py zaten böyle sayıyordu).
  * Adresi doğrulanamayan: uule-eryaman kanalında Google bağları şifreli; ekle-uule.py
    başlığı site adıyla başlayan sonucu BEKLENEN adres diye yazıyor. Eski adres
    kopyasının başlığı da site adıyla başlar. Kaydın kendi ilk3 kırıntısı eski
    şemayı (…/mahalleler/devlet, …/guzelkent/…) gösteriyorsa hangi adresin
    sıralandığı belli değildir: "doğru" sayılmaz, "belirsiz" sayılır.
  * Ölçüm yaşı + seçici yeniden ölçüm: Ekim turu yalnız Eylül'de SORUNLU çıkan
    sorguları yeniden ölçtü; doğru çıkanlar yeniden ölçülmedi. Karışık oran bu
    yüzden tek yönlü; çıktı ay kovalarını ve seçim göstergesini ayrı taşır.

Çıplak "/mahalleler/<x>" adresi ("-mahallesi" eki olmasa da) "mahalle" kalır:
ilk3-hedef-uret.py de öyle sayıyor; yönlendirme sindirilince iniş yine mahalle sayfası.

Girdi : kuyruk-site-emlakci.json (geçerli sorgular, "es" adaş eşleri) + sonuclar-site-emlakci.jsonl
Çıktı : dogru-sayfa.json
        olcum_yasi             {"2026-09": {"kayit", "ilk3", "ilk3_dogru"}, …} — son ölçümün ayı
        secilmis_yeniden_olcum {"yeniden_olculen", "onceden_dogru", "kuyruk_onceden_dogru",
                                "kuyruk_toplam", "kova", …} — en taze ay kovası için
        uulesiz_kayit          son ölçümü Eryaman konumlu (uule) kanaldan OLMAYAN sorgu sayısı
"""
import json, os, re, collections, datetime

KOK = os.path.dirname(os.path.abspath(__file__))

SINIF_AD = {
    "dogru": "Doğru site sayfası",
    "eski": "Taşınmadan önceki adres",
    "baska_site": "Başka bir site sayfamız",
    "ada": "Ada sayfamız",
    "mahalle": "Mahalle sayfamız",
    "belirsiz": "Adresi doğrulanamayan",
    "dis": "Bize ait olmayan sonuç",
    "yok": "İlk 10′da yok",
}

# Eski şema: mahalle bölümünde "-mahallesi" eki yok (26.07 taşımasından önce) ya da
# "/mahalleler" öneki hiç yok. Kırıntı "…/devlet-mahallesi/…" ise eşleşmez.
ESKI_CITE = re.compile(
    r"siringayrimenkul\.com/(?:mahalleler/)?"
    r"(?:altay|devlet|eryaman|goksu|guzelkent|sehit-osman-avci|seker|seyh-samil|tunahan|yavuz-selim|yesilova)"
    r"(?:/|$)")


def es_sozlugu(kuyruk_kayitlari):
    """s → adaş eşlerin yolları ({"/mahalleler/<es>", …}); kuyruğun "es" alanından."""
    es = collections.defaultdict(set)
    for r in kuyruk_kayitlari:
        for e in (r.get("es") or []):
            es[r["s"]].add(f"/mahalleler/{e}")
    return dict(es)


# anlik-goruntu-uret.py'de birebir kopyası var (geri doldurma); burası değişirse orası da.
def sinif(r, es):
    u = (r.get("u") or "")
    if not r.get("sira"):
        return "yok"
    # 31.08: bazı kayıtlarda u alanı URL değil SERP kırıntısı ("cite:… › …")
    # ve sonu "..." ile kesik — hangi sayfanın sıralandığı BİLİNMİYOR.
    # Bunlar "komşu sayfa" diye sınıflanırsa yanlış teşhis üretir.
    if u.startswith("cite:") or "…" in u or "..." in u:
        return "belirsiz"
    if "/adalar/" in u:
        return "ada"
    if re.fullmatch(r"/mahalleler/[^/]+/?", u):
        return "mahalle"
    if "/mahalleler/" not in u:
        return "dis"
    yol = u.rstrip("/")
    if yol == f"/mahalleler/{r['s']}" or yol in es.get(r["s"], ()):
        # 08.10: u başlıktan çözülmüş (ekle-uule.py) ve kırıntı eski şemayı gösteriyor
        if r.get("kanal") == "uule-eryaman" and any(ESKI_CITE.search(x) for x in (r.get("ilk3") or [])):
            return "belirsiz"
        return "dogru"
    # eski slug = mahalle bölümünde "-mahallesi" eki yok (26.07 taşımasından kalma)
    m = re.match(r"/mahalleler/([^/]+)/", u)
    if m and not m.group(1).endswith("-mahallesi"):
        return "eski"
    return "baska_site"


def ana():
    kuyruk_kayitlari = json.load(open(f"{KOK}/kuyruk-site-emlakci.json", encoding="utf-8"))
    kuyruk = {r["s"] for r in kuyruk_kayitlari}
    ES = es_sozlugu(kuyruk_kayitlari)
    gecmis = collections.defaultdict(list)     # s → dosya sırasıyla tüm ölçümler
    for L in open(f"{KOK}/sonuclar-site-emlakci.jsonl", encoding="utf-8"):
        L = L.strip()
        if not L:
            continue
        r = json.loads(L)
        if r.get("s") in kuyruk:
            gecmis[r["s"]].append(r)
    son = {s: v[-1] for s, v in gecmis.items()}   # s bazında SON satır geçerli

    hepsi = collections.Counter()
    ilk3 = collections.Counter()
    mahalle_yanlis = collections.Counter()
    yas = collections.defaultdict(lambda: {"kayit": 0, "ilk3": 0, "ilk3_dogru": 0})
    for r in son.values():
        k = sinif(r, ES)
        hepsi[k] += 1
        y = yas[(r.get("d") or "")[:7]]
        y["kayit"] += 1
        if r.get("sira") and r["sira"] <= 3:
            ilk3[k] += 1
            y["ilk3"] += 1
            y["ilk3_dogru"] += k == "dogru"
        if k in ("ada", "mahalle", "eski", "baska_site"):
            mahalle_yanlis[r["s"].split("/")[0]] += 1

    # Seçici yeniden ölçüm göstergesi: en taze ay kovasında yeniden ölçülen sorguların
    # ÖNCEKİ sınıfı, kuyruğun o kovadan önceki genel durumuyla kıyaslanır. İkisi çok
    # ayrışıyorsa (08.10: 209'un 37'si önceden doğruydu, kuyrukta 509'un 328'i) tur
    # yalnız sorunluları yeniden ölçmüştür ve karışık oran tek yönlü hareket eder.
    kova = max(yas) if yas else None
    secilmis = None
    if kova:
        esik = f"{kova}-01"
        yeniden = onceden_dogru = onceki_yok = kuyruk_dogru = kuyruk_toplam = 0
        for s, v in gecmis.items():
            onceki = [x for x in v if (x.get("d") or "") < esik]
            onceki_sinif = sinif(onceki[-1], ES) if onceki else None
            if onceki:
                kuyruk_toplam += 1
                kuyruk_dogru += onceki_sinif == "dogru"
            if (v[-1].get("d") or "") >= esik:
                yeniden += 1
                onceden_dogru += onceki_sinif == "dogru"
                onceki_yok += onceki_sinif is None
        secilmis = {"yeniden_olculen": yeniden, "onceden_dogru": onceden_dogru,
                    "kuyruk_onceden_dogru": kuyruk_dogru, "kuyruk_toplam": kuyruk_toplam,
                    "kova": kova, "onceki_olcumu_yok": onceki_yok}

    n3 = sum(ilk3.values())
    cikti = {
        "guncelleme": datetime.date.today().isoformat(),
        "toplam": sum(hepsi.values()),
        "hepsi": [{"k": k, "ad": SINIF_AD[k], "n": v} for k, v in hepsi.most_common()],
        "ilk3_toplam": n3,
        "ilk3": [{"k": k, "ad": SINIF_AD[k], "n": v} for k, v in ilk3.most_common()],
        "ilk3_dogru": ilk3.get("dogru", 0),
        "yanlis_mahalle": mahalle_yanlis.most_common(),
        "olcum_yasi": {k: yas[k] for k in sorted(yas)},
        "secilmis_yeniden_olcum": secilmis,
        "uulesiz_kayit": sum(1 for r in son.values() if r.get("kanal") != "uule-eryaman"),
    }
    json.dump(cikti, open(f"{KOK}/dogru-sayfa.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"ölçülen {cikti['toplam']} sorgu · ilk 3'te {n3}")
    print(f"ilk 3'ün {cikti['ilk3_dogru']}'ü doğru sayfa "
          f"(%{round(cikti['ilk3_dogru']*100/n3) if n3 else 0}) — gerisi başka sayfamız ya da doğrulanamayan adres")
    for x in cikti["hepsi"]:
        print(f"  {x['n']:4}  {x['ad']}")
    print("ölçüm yaşı (son ölçümün ayı: kayıt / ilk 3 / ilk 3'te doğru): " +
          " · ".join(f"{k} {v['kayit']}/{v['ilk3']}/{v['ilk3_dogru']}" for k, v in cikti["olcum_yasi"].items()))
    if secilmis:
        print(f"seçici yeniden ölçüm ({secilmis['kova']}): yeniden ölçülen {secilmis['yeniden_olculen']} sorgudan "
              f"{secilmis['onceden_dogru']} tanesi önceden doğruydu; kuyruk genelinde "
              f"{secilmis['kuyruk_toplam']} sorgudan {secilmis['kuyruk_onceden_dogru']}")
    print(f"son ölçümü Eryaman konumlu (uule) olmayan: {cikti['uulesiz_kayit']}")


if __name__ == "__main__":
    ana()
