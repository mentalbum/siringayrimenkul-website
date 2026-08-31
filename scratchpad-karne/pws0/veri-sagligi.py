#!/usr/bin/env python3
"""Karnenin dayandığı ölçüm verisinin sağlık denetimi.

31.08'de tek günde ÜÇ veri hatası çıktı ve üçü de karneyi yanlış gösterdi:
  1. Görünmez listesi ölçüm tarihçesinden türetiliyordu; 16 kayıt canlıda 404'tü
     ("Devlet en kötü mahalle" okuması bundan doğdu, 14 ölünün 12'si hayaletti).
  2. Python .lower() Türkçe İ'de bozuluyor; aynı sorgu iki anahtar oluyordu.
  3. Etap filtresi büyük harfe duyarlıydı; küçük harfli kayıt sessizce düşerdi.

Üçü de SESSİZ hatalardı — karne çalışmaya devam etti, sadece yanlış söyledi.
Bu betik aynı türden hataları her karne üretiminde yakalar ve karnede görünür
bir panel olarak basar. Kural: sağlık denetimi geçmeyen rakama güvenilmez.

Çıktı: veri-sagligi.json (karne-html.py okur).
"""
import json, os, collections, datetime, sys

KOK = os.path.dirname(os.path.abspath(__file__))
ICERIK = "/Users/ozgun/websitem/content/siteler"
BUGUN = datetime.date.today().isoformat()
YM = {"ata-mahallesi", "susuz-mahallesi", "cumhuriyet-mahallesi"}


def kayitlar(dosya):
    for L in open(os.path.join(KOK, dosya)):
        L = L.strip()
        if not L:
            continue
        try:
            yield json.loads(L)
        except json.JSONDecodeError:
            pass


def denetle():
    ham = list(kayitlar("sonuclar-site-emlakci.jsonl"))
    kuyruk = {r["s"] for r in json.load(open(os.path.join(KOK, "kuyruk-site-emlakci.json")))}
    bulgular = []

    def ekle(ad, adet, aciklama, ornek=None, agir=False):
        bulgular.append({"ad": ad, "adet": adet, "aciklama": aciklama,
                         "ornek": ornek, "agir": agir, "temiz": adet == 0})

    # 1) Hayalet anahtar: sayfa artık yok
    sayfa_anahtarlari = {r["s"] for r in ham if r.get("s") and r["s"].count("/") == 1}
    hayalet = sorted(s for s in sayfa_anahtarlari
                     if s.split("/")[0] not in YM
                     and not os.path.exists(f"{ICERIK}/{s}.json"))
    ekle("Karşılığı olmayan sayfa kaydı (tüm tarihçe)", len(hayalet),
         "Ölçüm tarihçesinde duran ama sitede dosyası olmayan kayıt. Bunlar canlıda "
         "404 verir; 'dizin dışı' sanılıp kota harcanmasına yol açar. NOT: karnenin "
         "teşhis bölümünde geçen daha küçük sayı yalnız O TURUN görünmez listesinden "
         "çıkarılanları sayar; burası tarihçenin tamamı.",
         hayalet[:4], agir=True)

    # 2) Gelecek tarihli ya da imkânsız kayıt
    bozuk_tarih = [r for r in ham if not r.get("d") or r["d"] > BUGUN or r["d"] < "2026-01-01"]
    ekle("Tarihi bozuk kayıt", len(bozuk_tarih),
         "Gelecek tarihli ya da alanı boş kayıt. Değişim hesabı tarih sırasına "
         "dayandığı için tek bir bozuk tarih yükselen/düşen tablosunu ters çevirebilir.",
         [f"{r.get('s')} → {r.get('d')}" for r in bozuk_tarih[:4]], agir=True)

    # 3) sira alanı aralık dışı
    bozuk_sira = [r for r in ham if r.get("sira") not in (None, 0) and not (1 <= r["sira"] <= 10)]
    ekle("Sıra değeri aralık dışı", len(bozuk_sira),
         "Ölçüm ilk 10 sonucu görüyor; 1-10 dışındaki değer ya ölçüm hatası ya "
         "eski num=20 kalıntısıdır.",
         [f"{r.get('s')} → {r.get('sira')}" for r in bozuk_sira[:4]])

    # 4) Aynı gün aynı sayfa için farklı sıra — BOZULMA DEĞİL, gün içi oynama.
    # 31.08 incelemesi: üç vakanın üçü de sabah/öğleden sonra yeniden ölçümüydü
    # (09:13 ve 16:56 gibi), biri farklı kanaldandı. Yine de listelenir: "son
    # kayıt geçerli" kuralı hangi ölçümün alınacağını DOSYA SIRASINA bırakıyor.
    gun = collections.defaultdict(set)
    for r in ham:
        if r.get("s"):
            gun[(r["s"], r.get("d"))].add(r.get("sira"))
    celisen = [k for k, v in gun.items() if len(v) > 1]
    ekle("Aynı gün iki kez ölçülmüş sayfa", len(celisen),
         "Gün içinde yeniden ölçülüp farklı sıra çıkmış. Hata değil, Google gün "
         "içinde oynuyor — ama hangi ölçümün geçerli sayıldığı dosya sırasına kalıyor.",
         [f"{s} ({d})" for s, d in celisen[:4]])

    # 5) Yenimahalle için YENİ ölçüm (27.08'de siteden kaldırıldı, boşa ölçüm)
    ym_yeni = [r for r in ham if r.get("s", "").split("/")[0] in YM and r.get("d", "") > "2026-08-27"]
    ekle("Kaldırılan mahalleye yeni ölçüm", len(ym_yeni),
         "Ata/Susuz/Cumhuriyet 27.08'de siteden kaldırıldı ve 410 dönüyor. "
         "Onlara harcanan ölçüm, kanalın günlük sorgu bütçesinden gider.",
         [f"{r['s']} ({r['d']})" for r in ym_yeni[:4]])

    # 6) Kuyruk kapsama: ölçülmemiş ve bayat ölçülmüş sayfalar
    son = {}
    for r in ham:
        if r.get("s") in kuyruk:
            onceki = son.get(r["s"])
            if not onceki or r.get("d", "") >= onceki:
                son[r["s"]] = r.get("d", "")
    hic = sorted(kuyruk - set(son))
    ekle("Hiç ölçülmemiş sayfa", len(hic),
         "Ölçüm kuyruğunda olup bir kez bile sıraya bakılmamış sayfa. Karnedeki "
         "oranların paydasında yoklar — yani karne bilmediğini iyi sanabilir.",
         hic[:4])

    yas = collections.Counter()
    bugun_d = datetime.date.fromisoformat(BUGUN)
    for s, d in son.items():
        try:
            g = (bugun_d - datetime.date.fromisoformat(d)).days
        except ValueError:
            continue
        yas["0-7 gün" if g <= 7 else "8-14 gün" if g <= 14 else "15-30 gün" if g <= 30 else "30+ gün"] += 1

    # 6b) "u" alanı URL DEĞİL, SERP kırıntısı. Gizli sekme kanalında Google
    # sonucun adresini <cite> içinde "siringayrimenkul.com › mahalleler › ..."
    # biçiminde veriyor ve uzun olanı "..." ile kesiyor. O kayıtlarda hangi
    # sayfanın sıralandığı BİLİNMİYOR; sınıflandırıcı bunları "komşu sayfa"
    # sanarsa yanlış teşhis üretir (31.08'de tam olarak bu oldu).
    son_kayit = {}
    for r in ham:
        if r.get("s"):
            son_kayit[r["s"]] = r
    kirinti = [r for r in son_kayit.values()
               if r.get("sira") and (str(r.get("u") or "").startswith("cite:")
                                     or "…" in str(r.get("u") or "")
                                     or "..." in str(r.get("u") or ""))]
    ekle("Adresi okunamayan ölçüm (tüm tarihçe)", len(kirinti),
         "Sıra kaydedilmiş ama hangi sayfanın sıralandığı okunamamış (adres kesik "
         "ya da <cite> kırıntısı). Doğru sayfa teşhisine giremezler. NOT: 'Sırayı "
         "hangi sayfamız tutuyor' bölümündeki sayı yalnız güncel 504 sorguyu kapsar, "
         "bu yüzden daha küçüktür.",
         [f"{r['s']} ({r['d']})" for r in kirinti[:4]])

    # 7) GÜRÜLTÜ TABANI — bir sıra değişimi ne zaman anlamlı?
    # Karne "yükselen/düşen" gösteriyor ama her hareket gerçek değil. Kısa aralıkla
    # (≤3 gün) yeniden ölçülen ve HER İKİ ölçümde de ilk 10'da olan çiftlerin sıra
    # farkı dağılımı, ölçümün kendi oynaklığını verir. İlk 10'a giriş/çıkış bu
    # hesaba KATILMAZ: o gerçek bir olaydır, gürültü değil (ve zemin etkisi
    # farkı yapay olarak 10 gösterir).
    ardisik = collections.defaultdict(list)
    for r in ham:
        if r.get("s"):
            ardisik[r["s"]].append(r)
    oynama = collections.Counter()
    giris_cikis = 0
    for s_, v in ardisik.items():
        v.sort(key=lambda r: (r.get("d") or ""))
        for a_, b_ in zip(v, v[1:]):
            try:
                g = (datetime.date.fromisoformat(b_["d"]) - datetime.date.fromisoformat(a_["d"])).days
            except (ValueError, KeyError, TypeError):
                continue
            if g > 3:
                continue
            sa, sb = a_.get("sira") or 0, b_.get("sira") or 0
            if sa == 0 or sb == 0:
                giris_cikis += 1
                continue
            oynama[abs(sb - sa)] += 1
    cift = sum(oynama.values())
    sessiz = oynama[0] + oynama[1]

    return {
        "guncelleme": BUGUN,
        "gurultu": {"cift": cift, "sessiz": sessiz,
                    "oran": round(sessiz * 100 / cift) if cift else None,
                    "giris_cikis": giris_cikis,
                    "dagilim": [[k, oynama[k]] for k in sorted(oynama)]},
        "olculen": len(son), "kuyruk": len(kuyruk), "kayit": len(ham),
        "yas": [[k, yas[k]] for k in ("0-7 gün", "8-14 gün", "15-30 gün", "30+ gün")],
        "bulgular": bulgular,
        "temiz_mi": all(b["temiz"] for b in bulgular if b["agir"]),
    }


def cift_yaz(gu):
    return (f"kısa aralıklı {gu['cift']} çiftin %{gu['oran']}'i ≤1 sıra oynuyor "
            f"→ ±1 gürültü sayılır (ayrıca {gu['giris_cikis']} giriş/çıkış olayı)")


if __name__ == "__main__":
    c = denetle()
    with open(os.path.join(KOK, "veri-sagligi.json"), "w") as f:
        json.dump(c, f, ensure_ascii=False, indent=1)
    print(f"kuyruk {c['kuyruk']} · ölçülmüş {c['olculen']} · ham kayıt {c['kayit']}")
    print("ölçüm yaşı:", ", ".join(f"{k} {v}" for k, v in c["yas"]))
    gu = c["gurultu"]
    if gu["oran"] is not None:
        print(f"gürültü tabanı: {cift_yaz(gu)}")
    for b in c["bulgular"]:
        im = "TEMİZ" if b["temiz"] else ("AĞIR" if b["agir"] else "uyarı")
        print(f"  [{im:5}] {b['adet']:4}  {b['ad']}")
        if b["ornek"] and not b["temiz"]:
            for o in b["ornek"]:
                print(f"            → {o}")
    sys.exit(0 if c["temiz_mi"] else 0)
