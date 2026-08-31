#!/usr/bin/env python3
"""Sırayı KİM tutuyor? — "ilk 3'teyiz" demek "doğru sayfa çıkıyor" demek değil.

31.08 denetiminde ortaya çıktı: karne "%68'i ilk 3'te" diyordu ama o sıraların
üçte biri YANLIŞ sayfamızla kazanılmış. Site adını arayan kişi ada sayfasına,
mahalle sayfasına ya da taşınmadan önceki adrese düşüyor. Sıra tutuluyor,
ziyaretçi aradığını bulamıyor — bu ikisi ayrı ölçülmeli.

Girdi : kuyruk-site-emlakci.json (geçerli 504 sorgu) + sonuclar-site-emlakci.jsonl
Çıktı : dogru-sayfa.json
"""
import json, os, re, collections, datetime

KOK = os.path.dirname(os.path.abspath(__file__))

SINIF_AD = {
    "dogru": "Doğru site sayfası",
    "eski": "Taşınmadan önceki adres",
    "baska_site": "Başka bir site sayfamız",
    "ada": "Ada sayfamız",
    "mahalle": "Mahalle sayfamız",
    "belirsiz": "Ölçüm kırıntısı (okunamadı)",
    "dis": "Bize ait olmayan sonuç",
    "yok": "İlk 10′da yok",
}


def sinif(r):
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
    yol = f"/mahalleler/{r['s']}"
    if u.rstrip("/") == yol:
        return "dogru"
    # eski slug = mahalle bölümünde "-mahallesi" eki yok (26.07 taşımasından kalma)
    m = re.match(r"/mahalleler/([^/]+)/", u)
    if m and not m.group(1).endswith("-mahallesi"):
        return "eski"
    return "baska_site"


kuyruk = {r["s"] for r in json.load(open(f"{KOK}/kuyruk-site-emlakci.json"))}
son = {}
for L in open(f"{KOK}/sonuclar-site-emlakci.jsonl"):
    L = L.strip()
    if not L:
        continue
    r = json.loads(L)
    if r.get("s") in kuyruk:
        son[r["s"]] = r

hepsi = collections.Counter()
ilk3 = collections.Counter()
mahalle_yanlis = collections.Counter()
for r in son.values():
    k = sinif(r)
    hepsi[k] += 1
    if r.get("sira") and r["sira"] <= 3:
        ilk3[k] += 1
    if k in ("ada", "mahalle", "eski", "baska_site"):
        mahalle_yanlis[r["s"].split("/")[0]] += 1

n3 = sum(ilk3.values())
cikti = {
    "guncelleme": datetime.date.today().isoformat(),
    "toplam": sum(hepsi.values()),
    "hepsi": [{"k": k, "ad": SINIF_AD[k], "n": v} for k, v in hepsi.most_common()],
    "ilk3_toplam": n3,
    "ilk3": [{"k": k, "ad": SINIF_AD[k], "n": v} for k, v in ilk3.most_common()],
    "ilk3_dogru": ilk3.get("dogru", 0),
    "yanlis_mahalle": mahalle_yanlis.most_common(),
}
json.dump(cikti, open(f"{KOK}/dogru-sayfa.json", "w"), ensure_ascii=False, indent=1)
print(f"ölçülen {cikti['toplam']} sorgu · ilk 3'te {n3}")
print(f"ilk 3'ün {cikti['ilk3_dogru']}'ü doğru sayfa "
      f"(%{round(cikti['ilk3_dogru']*100/n3) if n3 else 0}) — gerisi başka sayfamız")
for x in cikti["hepsi"]:
    print(f"  {x['n']:4}  {x['ad']}")
