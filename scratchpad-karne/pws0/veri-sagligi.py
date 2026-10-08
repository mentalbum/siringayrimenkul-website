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
import os, json, re, collections, datetime, sys

KOK = os.path.dirname(os.path.abspath(__file__))
ICERIK = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "content", "siteler")  # 07.10: sabit ana-checkout yolu worktree'de bayat envanter okuyordu
BUGUN = datetime.date.today().isoformat()
YM = {"ata-mahallesi", "susuz-mahallesi", "cumhuriyet-mahallesi"}
# Karne başlığının ve yönetici özetinin taban aldığı 11 mahalle turu — karne-html.py ve
# yonetici-ozeti-uret.py TURLAR ile birebir tutulur.
TURLAR = [
    "tur-tunahan-2708.json", "tur-altay-2708.json", "tur-devlet-2708.json",
    "tur-eryaman-2708.json", "tur-goksu-2808.json", "tur-guzelkent-2808.json",
    "tur-sehit-osman-avci-2908.json", "tur-seker-2908.json", "tur-yesilova-2908.json",
    "tur-yavuz-selim-2908.json", "tur-seyh-samil-2908.json",
]


# --- Karne metninde elle yazılmış rakam süzgeci (denetim 6c) ---
# 08.10 (ek-4 f): veri rakamı OLMAYAN kalıplar ayıklanır. O gün 17 uyarının 14'ü yanlış alarmdı:
# tarih (27.08), etiket (İlk 10, Organik 1, pws=0), madde numarası ((1)) ve BULGULAR'daki özel
# adlar (Umut 19 Emlak, Uyum 90). Kalan 3'ü eşik değeriydi ("7 günden eski", "Konumu 5 ve üstü");
# eşikler AYIKLANMAZ: metne elle yazılmış sayıdır, koddaki eşik değişirse sessizce yanlışa düşer.
# 08.10 onarım: ilk sürümün maskeleri gerçek veri rakamını da yutuyordu ("ilk 388 sorgu",
# "Organik 12 tık", "Oran 12.50 puan", BULGULAR'da "Devlet 7, Göksu 36." — 31.08'de bulunan
# 14 rakam tam bu son kalıptaydı). Maskeler daraltıldı:
#   tarih    : gün 1-31, ay 01-12 ("12.50" tarih değildir)
#   İlk N    : yalnız etiket değerleri (3, 5, 10, 20), ardından rakam gelmiyorsa
#   Organik N: tek hane ve ardından "tık" / "gösterim" gelmiyorsa (sıra etiketi)
#   özel ad  : BULGULAR'da sayıdan sonra büyük harfli sözcük geliyorsa ("Umut 19 Emlak") ya da
#              ad envanterdeki bir site adının "… <sayı>" başıysa ("Uyum 90"); virgül ve nokta
#              ad sayılmaz.
_TARIH_RE = re.compile(r"(?<![\w.,])(?:0?[1-9]|[12]\d|3[01])\.(?:0[1-9]|1[0-2])(?![\d.])")
_ILK_ETIKET_RE = re.compile(r"\b[İi]lk (?:3|5|10|20)(?!\d)")
_ORGANIK_ETIKET_RE = re.compile(r"\bOrganik \d(?!\d)(?!\s*(?:tık|gösterim))")
_PWS_RE = re.compile(r"\bpws=\d")
_MADDE_NO_RE = re.compile(r"\(\d\)")
_OZEL_AD_BUYUK_RE = re.compile(r"[A-ZÇĞİÖŞÜ][^\s,()\"]* \d+(?= [A-ZÇĞİÖŞÜ])")
_CIPLAK_RE = re.compile(r"(?<![\w#-])\d{1,4}(?:\.\d{3})*(?![\w%.-])")
_AD_BASI_RE = re.compile(r"^(.*[^\W\d_][^\s]* \d+)(?!\d)")   # en az bir sözcük + sayı ile biten en uzun baş


def sayili_site_adlari(icerik=None):
    """Envanterdeki site adlarının sayıyla biten başları: "Uyum 90 Sitesi" → "Uyum 90",
    "Elit Yaşam Konutları 2" → kendisi. BULGULAR metninde bunlar özel addır, veri rakamı
    değil. Sayıyla başlayan adlar ("75. Yıl Sitesi") alınmaz. Envanter okunamazsa boş küme."""
    adlar = set()
    for dp, _dn, fn in os.walk(icerik or ICERIK):
        for f in fn:
            if not f.endswith(".json"):
                continue
            try:
                ad = json.load(open(os.path.join(dp, f), encoding="utf-8")).get("isim") or ""
            except (OSError, ValueError, AttributeError):
                continue
            m = _AD_BASI_RE.match(ad)
            if m:
                adlar.add(m.group(1))
    return adlar


def elle_rakam_var(satir, bulgular_icinde=False, site_adlari=()):
    """karne-html.py'nin bir satırında f-string ifadesi dışında, metnin içinde duran sayı var mı?"""
    metin = re.sub(r"\{[^}]*\}", "", satir)            # f-string ifadesi
    metin = re.sub(r'style="[^"]*"', "", metin)        # style="margin:10px 0 0" karne metni değil
    for desen in (_TARIH_RE, _ILK_ETIKET_RE, _ORGANIK_ETIKET_RE, _PWS_RE, _MADDE_NO_RE):
        metin = desen.sub("", metin)
    if bulgular_icinde:
        for ad in sorted(site_adlari, key=len, reverse=True):
            metin = re.sub(r"(?<!\w)" + re.escape(ad) + r"(?!\d)", "", metin)
        metin = _OZEL_AD_BUYUK_RE.sub("", metin)
    return bool(_CIPLAK_RE.search(metin))


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

    # bilgi=True: bulgu değil, sayım. Hiçbir rakamı etkilemez; okuyucu (karne-html.py) bunu uyarı
    # listesine KOYMAMALI, nötr satır olarak basmalı. "temiz" yine adet == 0 demektir (anlamı
    # bozulmasın diye bilgi satırı temiz sayılmaz); ayrım yalnız bu anahtardan yapılır.
    def ekle(ad, adet, aciklama, ornek=None, agir=False, bilgi=False):
        bulgular.append({"ad": ad, "adet": adet, "aciklama": aciklama,
                         "ornek": ornek, "agir": agir, "temiz": adet == 0, "bilgi": bilgi})

    # 1) Hayalet anahtar: sayfa artık yok
    # 08.10 (ek-4 f): eskiden TÜM tarihçe sayılıyordu. 21 kaydın 21'i de kuyruk dışıydı
    # (hiçbir rakama girmiyordu) ama "ağır bulgu 1" kalıcı kalıyordu. Ağır olan, RAKAMA
    # GİREN hayalettir: ölçüm kuyruğunda ya da karne başlığının taban aldığı tur
    # dosyalarında durup sitede dosyası olmayan kayıt (08.10'da 2 taneydi, ikisi de tur
    # dosyasında: 4-devlet-mahallesi-sitesi ve guzelkent/kurtulus-sitesi; aynı gün çıkarıldı).
    # Tarihçede kalan eskiler ayrı bir bilgi satırıdır.
    def sayfa_mi(s):
        return bool(s) and s.count("/") == 1 and s.split("/")[0] not in YM

    def dosyasi_var(s):
        return os.path.exists(f"{ICERIK}/{s}.json")

    tur_s, tur_okunamayan = set(), []
    for f in TURLAR:
        try:
            tur_s |= {k["s"] for k in json.load(open(os.path.join(KOK, f), encoding="utf-8"))}
        except (OSError, json.JSONDecodeError, KeyError, TypeError):
            tur_okunamayan.append(f)
    tur_site = {s for s in tur_s if sayfa_mi(s)}
    kuyruk_site = {s for s in kuyruk if sayfa_mi(s)}
    aktif = kuyruk_site | tur_site
    hayalet = sorted(s for s in aktif if not dosyasi_var(s))
    ekle("Karşılığı olmayan sayfa kaydı (kuyruk ve tur dosyaları)", len(hayalet),
         "Ölçüm kuyruğunda ya da mahalle tur dosyalarında duran ama sitede dosyası olmayan "
         "kayıt. Bunlar karnenin rakamlarına girer, canlıda 404 verir ve 'dizin dışı' "
         "sanılıp kota harcanmasına yol açar.",
         [f"{s} ({'kuyruk' if s in kuyruk_site else 'tur dosyası'})" for s in hayalet[:4]], agir=True)
    tarihce = sorted(s for s in {r["s"] for r in ham if sayfa_mi(r.get("s"))} - aktif
                     if not dosyasi_var(s))
    ekle("Tarihçede kalan eski sayfa kaydı (bilgi)", len(tarihce),
         "Ölçüm tarihçesinde duran, sitede dosyası olmayan ve artık ne kuyrukta ne tur "
         "dosyalarında bulunan kayıt. Hiçbir karne rakamına girmez; yalnız bilgi.",
         tarihce[:4], bilgi=True)
    # Kuyruk ile tur dosyaları aynı tabanı vermeli: karne başlığı tur dosyalarından,
    # 'doğru sayfa' bölümü kuyruktan sayar (08.10'a kadar 504'e 509 çıkıyordu).
    taban_farki = sorted(kuyruk_site ^ tur_site)
    ekle("Kuyruk ile tur dosyaları arasında fark", len(taban_farki) + len(tur_okunamayan),
         "Ölçüm kuyruğunda olup hiçbir mahalle tur dosyasında olmayan (ya da tersi) sayfa. "
         "Fark varsa karnenin iki tepe rakamı ayrı toplamdan hesaplanır.",
         [f"{s} ({'yalnız kuyrukta' if s in kuyruk_site else 'yalnız tur dosyasında'})"
          for s in taban_farki[:4]] + [f"{f} okunamadı" for f in tur_okunamayan[:2]])

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
    ekle("Kuyrukta olup ölçülmemiş", len(hic),
         "Ölçüm kuyruğunda olup bir kez bile sıraya bakılmamış sayfa.",
         hic[:4])

    # 31.08 — DENETİMİN KÖR NOKTASI: yukarıdaki kontrolün paydası kuyruğun
    # KENDİSİ olduğu için envanteri hiç göremiyordu ve hep "temiz" diyordu.
    # Oysa content/siteler'de 522 kayıt var, kuyrukta 504. Farkın bir kısmı
    # meşru (adaşlar kuyruğun "es" alanında aynı sorguyu paylaşıyor), kalanı
    # gerçek boşluk: o sayfaların sırası HİÇ bilinmiyor ama karne %100 kapsama
    # iddia ediyor. Kök neden iki desen: (1) Yenimahalle kaldırılınca birincil
    # sorgusu giden Eryaman ikizleri öksüz kaldı, (2) kuyruk donduktan sonra
    # eklenen sayfalar. Mahalle çıkarılırken "es" ikizleri birincile terfi etmeli.
    envanter = set()
    for dp, _dn, fn in os.walk(ICERIK):
        for f in fn:
            if f.endswith(".json"):
                envanter.add(f"{os.path.basename(dp)}/{f[:-5]}")
    es_kapsam = set()
    try:
        for r in json.load(open(os.path.join(KOK, "kuyruk-site-emlakci.json"))):
            for e in (r.get("es") or []):
                es_kapsam.add(e)
    except Exception:
        pass
    disarida = sorted(envanter - kuyruk - es_kapsam
                      - {s_ for s_ in envanter if s_.split("/")[0] in YM})
    ekle("Envanterde var, kuyrukta YOK", len(disarida),
         "Sitede sayfası olan ama ölçüm kuyruğunda hiç yer almayan kayıt — adaş "
         "paylaşımı da hesaba katıldı. Bu sayfaların sırası hiç bilinmiyor, yani "
         "karnenin kapsama iddiası olduğundan iyi görünüyor.",
         disarida[:5], agir=True)

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
         "hangi sayfamız tutuyor' bölümündeki sayı yalnız güncel kuyruğu kapsar, "
         "bu yüzden daha küçük olabilir.",
         [f"{r['s']} ({r['d']})" for r in kirinti[:4]])

    # 6c) KARNE METNİNDE ÇIPLAK RAKAM. karne-html.py'nin kendi docstring'i
    # "elle rakam girilmez" diyor, karne de kendi hakkında "her rakam ölçüm
    # dosyalarından üretiliyor" yazıyor. 31.08 denetimi bu iddiayı yalanlayan
    # 14 rakam buldu (zayıf halkalar + BULGULAR sözlüğü) ve hepsi tabloyla
    # çelişiyordu. Bu denetim olmadan aynı çelişki bir sonraki turda geri gelir.
    kh = os.path.join(KOK, "karne-html.py")
    ciplak = []
    if os.path.exists(kh):
        site_adlari = sayili_site_adlari()
        icinde_bulgular = False
        for no, satir in enumerate(open(kh), 1):
            if satir.startswith("BULGULAR"):
                icinde_bulgular = True
            elif icinde_bulgular and satir.startswith("}"):
                icinde_bulgular = False
            if not (icinde_bulgular or "<li>" in satir or "<p class" in satir):
                continue
            if satir.lstrip().startswith("#"):
                continue
            # f-string ifadesi olmayan, metnin içinde duran sayı (maskeler: elle_rakam_var)
            if elle_rakam_var(satir, icinde_bulgular, site_adlari):
                ciplak.append(f"satır {no}: {satir.strip()[:70]}")
    ekle("Karne metninde elle yazılmış rakam", len(ciplak),
         "Karne 'her rakam ölçümden üretiliyor' diyor; bu satırlar sabit sayı içeriyor "
         "ve veri değişince sessizce yanlışa düşerler. Tabloyla çelişen 14 rakam "
         "31.08'de tam olarak böyle oluşmuştu. Tarihler, 'İlk 10' gibi etiketler, madde "
         "numaraları ve özel adlar (site ve işletme adındaki sayı) sayılmaz; kalanlar elle "
         "yazılmış sayı ya da eşiktir.",
         ciplak[:4])

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
        im = "TEMİZ" if b["temiz"] else ("AĞIR" if b["agir"] else ("bilgi" if b.get("bilgi") else "uyarı"))
        print(f"  [{im:5}] {b['adet']:4}  {b['ad']}")
        if b["ornek"] and not b["temiz"]:
            for o in b["ornek"]:
                print(f"            → {o}")
    sys.exit(0 if c["temiz_mi"] else 0)
