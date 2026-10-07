# -*- coding: utf-8 -*-
"""Hatırlanırlık üreticisi — "ev sahibi karar anında bizi hatırlıyor mu" sorusunun sayısal vekilleri.

NEDEN (07.10.2026 araştırması, SIP-DIYE-PLAN-07-10.md): sıra tarafında tavan yakın
("eryaman emlakçı" kutu #1 / organik #1-2); "hafızalara kazınma" arama DIŞI bir iş ve
bugüne dek hiçbir yerde seri olarak tutulmuyordu. Dört vekil, hepsi AYLIK okunur
(n küçük; +%25 altı fark yorumlanmaz, mevsim kıyası Ekim 2027):

  1. GSC marka sorgusu gösterimi  — "şirin gayrimenkul|emlak…" (site adları hariç:
     "Şirin 91 Sitesi", "Şirinköy" marka DEĞİL). Sorgu boyutu gizlilik süzgecinden
     geçer; mutlak değil seri okunur.
     08.10: seri ikiye ayrıldı. ÇEKİRDEK = adımızı arayan ("şirin gayrimenkul", "şirin
     emlak"…); DOĞRULAMA = adımızın yanında "yorum" ya da "şikayet" geçen sorgu. Neden:
     14–28.09'da 6 güne sıkışmış tek bir "… yorumları" sorgusu 37 gösterim getirdi ve 28
     günlük toplamı 154 → 177 (+%15) gösterdi; çekirdek aynı sürede 154 → 140'tı.
     Doğrulama araması ATILMAZ (bizi sınayan gerçek bir ev sahibi de olabilir), ayrı durur.
  2. GA4 Direct oturumu, yalnız MOBİL — masaüstü Direct'in ~%60'ı kendi/izleme trafiği
     şüphesi taşıyor (04.10 denetimi: /ev-degerleme'ye her gün inen 1024x10000 tarayıcı).
     08.10: mobil Direct de ikiye ayrıldı. ANA = açılış sayfası "/" (sorgu dizgisi
     sayılmaz: "/?ved=…" de ana sayfadır); DERİN = başka her sayfa. "Adresi yazarak ya da
     kayıtlı bağdan gelen" tanımının karşılığı yalnız ANA'dır; derin sayfaya düşen
     oturumların çoğu etkileşimsiz. DİKKAT: GBP bağı UTM'sizken profil düğmesinden
     gelenler de ANA'ya düşer. Bu karışımın boyu haftalık seriden hesaplanır
     (gbp_utm.direct_karisim) ve uyarilar'a rakamıyla yazılır; elle rakam girilmez.
  3. GBP yorum sayısı ve temposu (Şirin + Efor) — gbp-yorum-serisi.jsonl (elle değil:
     kutu kartı okumalarından; bolge-tur.mjs 07.10'dan beri `hk` alanına yazar).
  4. GBP Performans (marka terimli aramalar, çağrı, yol tarifi, web tıkı) —
     gbp-performans.jsonl; panel Özgün'de, ayda bir ekran görüntüsünden işlenir.
     Dosya boşsa bölüm "henüz kayıt yok" der, rakam uydurulmaz.
  + kanal #1 görünürlüğü: GA4 "Organic Search/…" değil, GBP bağının UTM izi
    (medium=gbp) — gsc-q.mjs ile "/?utm_source=google&utm_medium=gbp" sayfa gösterimi.

Girdi : gsc-q.mjs (date,query + marka süzgeci; date + GBP sayfa süzgeci),
        ga4-q.mjs kanal | acilis | gbp (bu klasör; yalnız canlı alan adı),
        gbp-yorum-serisi.jsonl, gbp-performans.jsonl, sonuclar-bolge.jsonl (hk alanı olan kayıtlar)
Çıktı : hatirlanirlik.json — karne-html.py okur.
Kullanım: python3 hatirlanirlik-uret.py            (API)
          python3 hatirlanirlik-uret.py --yerel    (KARNE_SCRATCH'teki ham TSV'ler)
"""
import datetime as dt
import json
import os
import re
import subprocess
import sys

KOK = os.path.dirname(os.path.abspath(__file__))
S = os.environ.get("KARNE_SCRATCH", "")
YEREL = "--yerel" in sys.argv
MARKA = "query::includingRegex::(ş|s)irin\\s*(gayrimenkul|emlak|group)"
# Marka sorgusunun yanında bunlar geçiyorsa "doğrulama" araması sayılır (çekirdekten ayrı seri).
DOGRULAMA = re.compile(r"yorum|[şs]ik[aâ]yet")
GBP_SAYFA = "page::contains::utm_medium=gbp"
HAFTA = 14  # kaç ISO haftası geriye
PENCERE_GUN = 28
N_KUCUK = 30  # 28 günlük sayı bunun altındaysa yüzde fark yorumlanmaz (08.10 denetimi; karne aynı eşiği kullanır)


def calistir(argv, onbellek, zorunlu=True):
    """node betiğini çağırır; KARNE_SCRATCH varsa ham çıktıyı oraya bırakır, --yerel ise oradan okur.

    zorunlu=False: betik düşerse (ya da --yerel'de dosya yoksa) None döner ve üretici devam eder;
    yardımcı seriler (GA4 medium=gbp) için. Ana seriler zorunludur: eksikse rakam basılmaz, durulur.
    """
    yol = f"{S}/{onbellek}" if S else ""
    if YEREL:
        if not yol or not os.path.exists(yol):
            if not zorunlu:
                return None
            sys.exit(f"--yerel istendi ama {onbellek} yok (KARNE_SCRATCH)")
        return open(yol, encoding="utf-8").read()
    r = subprocess.run(["node"] + argv, capture_output=True, text=True, cwd=KOK)
    if r.returncode != 0:
        if not zorunlu:
            print(f"uyarı: {' '.join(argv[:1] + argv[3:4])} başarısız, o seri atlandı: {r.stderr.strip()[:200]}", file=sys.stderr)
            return None
        sys.exit(f"{argv[0]} başarısız: {r.stderr.strip()[:300]}")
    if yol:
        open(yol, "w", encoding="utf-8").write(r.stdout)
    return r.stdout


def hafta_basi(d):
    return d - dt.timedelta(days=d.weekday())


bugun = dt.date.today()
dun = bugun - dt.timedelta(days=1)
bas = hafta_basi(bugun) - dt.timedelta(weeks=HAFTA)

# --- 1) GSC marka gösterimi (günlük → haftalık / 28 günlük) -------------------
# date,query boyutuyla çekilir: aynı güne birden çok sorgu satırı gelir, o yüzden güne ATANMAZ, TOPLANIR.
# Toplam, yalnız date boyutuyla çekilenle aynıdır (08.10'da iki yoldan 177/12 çıktı): sorgu süzgeci
# gizlenen sorguları zaten dışarıda bırakıyor, boyut eklemek veri kaybettirmiyor.
# Önbellek adı bilerek yeni: eski "hat-gsc-marka.tsv" 4 sütunluydu, --yerel kipinde yanlış okunmasın.
gsc, gsc_dog = {}, {}   # gün → (gösterim, tık): çekirdek / doğrulama
sorgu_gun = {}          # sorgu → {gün: gösterim}
for L in calistir(["gsc-q.mjs", bas.isoformat(), bugun.isoformat(), "date,query", MARKA], "hat-gsc-marka-sorgu.tsv").splitlines():
    p = L.split("\t")
    if len(p) >= 5:
        gun_, sorgu = p[3], p[4]
        hedef = gsc_dog if DOGRULAMA.search(sorgu.lower()) else gsc
        g0, t0 = hedef.get(gun_, (0, 0))
        hedef[gun_] = (g0 + int(p[0]), t0 + int(p[1]))
        sg = sorgu_gun.setdefault(sorgu, {})
        sg[gun_] = sg.get(gun_, 0) + int(p[0])
gsc_gbp = {}
for L in calistir(["gsc-q.mjs", bas.isoformat(), bugun.isoformat(), "date", GBP_SAYFA], "hat-gsc-gbp.tsv").splitlines():
    p = L.split("\t")
    if len(p) >= 4:
        gsc_gbp[p[3]] = (int(p[0]), int(p[1]))
# Son veri günü iki serinin birleşiminden: son gün yalnız doğrulama sorgusu görünmüşse de pencere oraya uzanır.
_gsc_gunler = set(gsc) | set(gsc_dog)
son_gsc = max(_gsc_gunler) if _gsc_gunler else None

# --- 2) GA4 kanal × cihaz (günlük) -------------------------------------------
ga = {}
for L in calistir(["ga4-q.mjs", bas.isoformat(), dun.isoformat(), "kanal"], "hat-ga4-kanal.tsv").splitlines():
    p = L.split("\t")
    if len(p) >= 4:
        ga.setdefault(p[0], {})[(p[1], p[2])] = int(p[3])


def ga_topla(gun, kanal, cihaz=None):
    return sum(v for (k, c), v in ga.get(gun, {}).items() if k == kanal and (cihaz is None or c == cihaz))


# --- 2b) GA4 mobil Direct'in açılış sayfası (günlük): ana sayfa / derin sayfa ---
acilis = {}  # gün → {"ana": [oturum, etkileşimli], "derin": [oturum, etkileşimli]}
for L in calistir(["ga4-q.mjs", bas.isoformat(), dun.isoformat(), "acilis"], "hat-ga4-acilis.tsv").splitlines():
    p = L.split("\t")
    if len(p) >= 4:
        tur = "ana" if p[1].split("?", 1)[0] == "/" else "derin"   # "/?ved=…" de ana sayfadır
        a = acilis.setdefault(p[0], {"ana": [0, 0], "derin": [0, 0]})[tur]
        a[0] += int(p[2])
        a[1] += int(p[3])


def acilis_topla(gun, tur, i=0):
    """i=0 oturum, i=1 etkileşimli oturum."""
    return acilis.get(gun, {}).get(tur, [0, 0])[i]


# --- 2c) GA4 medium=gbp oturumu (günlük × cihaz) — GBP bağı UTM'liyken dolar; yardımcı seri ---
gbp_ga = None  # gün → {cihaz: oturum}; None = çekilemedi (rakamı basılmaz)
_ham = calistir(["ga4-q.mjs", bas.isoformat(), dun.isoformat(), "gbp"], "hat-ga4-gbp.tsv", zorunlu=False)
if _ham is not None:
    gbp_ga = {}
    for L in _ham.splitlines():
        p = L.split("\t")
        if len(p) >= 3:
            c = gbp_ga.setdefault(p[0], {})
            c[p[1]] = c.get(p[1], 0) + int(p[2])


def utm_durumu(gunler):
    """Haftada GBP bağı UTM'li miydi? Kanıt = o gün GSC'de UTM'li adres gösterim aldı ya da GA4'te
    medium=gbp oturumu var. 'var' (6-7 gün kanıt), 'yok' (hiç), 'gecis' (hafta ortasında değişmiş)."""
    n = sum(1 for g in gunler if gsc_gbp.get(g, (0, 0))[0] > 0 or sum((gbp_ga or {}).get(g, {}).values()) > 0)
    return "var" if n >= 6 else "yok" if n == 0 else "gecis"


# --- haftalık seri -------------------------------------------------------------
haftalar = []
h = bas
while h <= hafta_basi(bugun):
    gunler = [(h + dt.timedelta(days=i)).isoformat() for i in range(7)]
    tam = (h + dt.timedelta(days=6)) < bugun  # hafta kapandı mı
    gsc_tam = son_gsc is not None and gunler[-1] <= son_gsc
    haftalar.append({
        "bas": h.isoformat(), "tam": tam,
        "marka_gos": sum(gsc.get(g, (0, 0))[0] for g in gunler) if gsc_tam else None,
        "marka_tik": sum(gsc.get(g, (0, 0))[1] for g in gunler) if gsc_tam else None,
        "marka_dogrulama": sum(gsc_dog.get(g, (0, 0))[0] for g in gunler) if gsc_tam else None,
        "gbp_sayfa_gos": sum(gsc_gbp.get(g, (0, 0))[0] for g in gunler) if gsc_tam else None,
        "direct_mobil": sum(ga_topla(g, "Direct", "mobile") for g in gunler) if tam else None,
        "direct_mobil_ana": sum(acilis_topla(g, "ana") for g in gunler) if tam else None,
        "direct_mobil_derin": sum(acilis_topla(g, "derin") for g in gunler) if tam else None,
        "direct_masaustu": sum(ga_topla(g, "Direct", "desktop") for g in gunler) if tam else None,
        "sosyal": sum(ga_topla(g, "Organic Social") for g in gunler) if tam else None,
        "ai": sum(ga_topla(g, "AI Assistant") for g in gunler) if tam else None,
        # GBP bağı UTM'liyken profilden gelen mobil oturum (GA4 medium=gbp); seri çekilemediyse None
        "gbp_mobil": sum(gbp_ga.get(g, {}).get("mobile", 0) for g in gunler) if (tam and gbp_ga is not None) else None,
        # yalnız iki kaynağın da kapandığı haftada: "var" | "yok" | "gecis"
        "utm": utm_durumu(gunler) if (tam and gsc_tam) else None,
    })
    h += dt.timedelta(weeks=1)


def pencere28(bitis, kaynak, sec):
    """bitis dahil geriye 28 gün toplamı."""
    gunler = [(bitis - dt.timedelta(days=i)).isoformat() for i in range(28)]
    return sum(sec(kaynak, g) for g in gunler)


ozet = {}
marka_sorgu = []
if son_gsc:
    b = dt.date.fromisoformat(son_gsc)
    simdi = pencere28(b, gsc, lambda k, g: k.get(g, (0, 0))[0])
    once = pencere28(b - dt.timedelta(days=28), gsc, lambda k, g: k.get(g, (0, 0))[0])
    # 08.10'dan beri ÇEKİRDEK (yorum/şikayet sorguları hariç); doğrulama ayrı alanda.
    ozet["marka_gos_28"] = {"simdi": simdi, "onceki": once, "bit": son_gsc}
    ozet["marka_tik_28"] = {"simdi": pencere28(b, gsc, lambda k, g: k.get(g, (0, 0))[1]),
                            "onceki": pencere28(b - dt.timedelta(days=28), gsc, lambda k, g: k.get(g, (0, 0))[1])}
    ozet["marka_dogrulama_gos_28"] = {"simdi": pencere28(b, gsc_dog, lambda k, g: k.get(g, (0, 0))[0]),
                                      "onceki": pencere28(b - dt.timedelta(days=28), gsc_dog, lambda k, g: k.get(g, (0, 0))[0])}
    ozet["gbp_sayfa_gos_28"] = {"simdi": pencere28(b, gsc_gbp, lambda k, g: k.get(g, (0, 0))[0]),
                                "onceki": pencere28(b - dt.timedelta(days=28), gsc_gbp, lambda k, g: k.get(g, (0, 0))[0])}
    # Hangi sorgu hangi seriye girdi (süzgecin ne yakaladığı görünsün): iki pencerede gösterim.
    for sorgu, gunluk_ in sorgu_gun.items():
        s_ = pencere28(b, gunluk_, lambda k, g: k.get(g, 0))
        o_ = pencere28(b - dt.timedelta(days=28), gunluk_, lambda k, g: k.get(g, 0))
        if s_ or o_:
            marka_sorgu.append({"sorgu": sorgu, "sinif": "dogrulama" if DOGRULAMA.search(sorgu.lower()) else "cekirdek",
                                "simdi": s_, "onceki": o_})
    marka_sorgu.sort(key=lambda x: (-x["simdi"], -x["onceki"], x["sorgu"]))
ozet["direct_mobil_28"] = {"simdi": pencere28(dun, ga, lambda k, g: ga_topla(g, "Direct", "mobile")),
                           "onceki": pencere28(dun - dt.timedelta(days=28), ga, lambda k, g: ga_topla(g, "Direct", "mobile")),
                           "bit": dun.isoformat()}
# ana + derin = direct_mobil_28 (aynı süzgeç, yalnız açılış sayfasına göre bölünmüş). etk_* = etkileşimli oturum.
for _tur in ("ana", "derin"):
    ozet[f"direct_mobil_{_tur}_28"] = {
        "simdi": pencere28(dun, acilis, lambda k, g, t=_tur: acilis_topla(g, t)),
        "onceki": pencere28(dun - dt.timedelta(days=28), acilis, lambda k, g, t=_tur: acilis_topla(g, t)),
        "bit": dun.isoformat(),
        "etk_simdi": pencere28(dun, acilis, lambda k, g, t=_tur: acilis_topla(g, t, 1)),
        "etk_onceki": pencere28(dun - dt.timedelta(days=28), acilis, lambda k, g, t=_tur: acilis_topla(g, t, 1))}
ozet["direct_masaustu_28"] = {"simdi": pencere28(dun, ga, lambda k, g: ga_topla(g, "Direct", "desktop")),
                              "onceki": pencere28(dun - dt.timedelta(days=28), ga, lambda k, g: ga_topla(g, "Direct", "desktop"))}

# --- GBP bağı UTM'li / UTM'siz haftalarda mobil Direct ana sayfa (karışımın boyu) ---
# UTM'sizken profil düğmesinden gelen tık GA4'te Direct + ana sayfa olarak görünür; UTM geri
# konduğu gün bu rakam düşer ve "hatırlanırlık geriledi" diye okunmamalıdır. Rakamlar haftalık
# seriden türer: UTM'li = 'var' haftalar; UTM'siz = serideki ilk UTM izinden SONRAKİ 'yok' haftalar
# (UTM hiç konmamış ilk haftalar kıyasa girmez). İki grupta da en az 2 hafta yoksa rakam yazılmaz.


def tr_gun(iso):
    return f"{iso[8:10]}.{iso[5:7]}"


def hafta_grubu(hs):
    ana = [x["direct_mobil_ana"] for x in hs]
    son = (dt.date.fromisoformat(hs[-1]["bas"]) + dt.timedelta(days=6)).isoformat()
    ardisik = all((dt.date.fromisoformat(b_["bas"]) - dt.date.fromisoformat(a_["bas"])).days == 7 for a_, b_ in zip(hs, hs[1:]))
    g = {"hafta": len(hs), "bas": hs[0]["bas"], "bit": son, "ardisik": ardisik,
         "ana_min": min(ana), "ana_max": max(ana), "ana_ort": round(sum(ana) / len(ana), 1)}
    gm = [x["gbp_mobil"] for x in hs if x.get("gbp_mobil") is not None]
    if gm:
        g["gbp_mobil_min"], g["gbp_mobil_max"] = min(gm), max(gm)
    return g


_siniflanan = [x for x in haftalar if x.get("utm") and x.get("direct_mobil_ana") is not None]
_ilk_iz = next((i for i, x in enumerate(_siniflanan) if x["utm"] != "yok"), None)
_utmli = [x for x in _siniflanan if x["utm"] == "var"]
_utmsiz = [x for i, x in enumerate(_siniflanan) if x["utm"] == "yok" and _ilk_iz is not None and i > _ilk_iz]
karisim = None
if len(_utmli) >= 2 and len(_utmsiz) >= 2:
    karisim = {"utmli": hafta_grubu(_utmli), "utmsiz": hafta_grubu(_utmsiz)}
    # UTM geri konunca beklenen 28 günlük ana sayfa mobil Direct = UTM'li haftaların ortalaması × 4
    karisim["beklenen_ana_28"] = round(sum(x["direct_mobil_ana"] for x in _utmli) * (PENCERE_GUN / 7) / len(_utmli))


def aralik(g, alan):
    """'1–3 (ortalama 2)' — haftalık en düşük–en yüksek; ortalama varsa Türkçe ondalıkla."""
    lo, hi = g[f"{alan}_min"], g[f"{alan}_max"]
    m = f"{lo}–{hi}" if lo != hi else f"{lo}"
    ort = g.get(f"{alan}_ort")
    return m if ort is None else f"{m} (ortalama {f'{ort:g}'.replace('.', ',')})"


def donem(g):
    return f"{tr_gun(g['bas'])}–{tr_gun(g['bit'])}" if g["ardisik"] else f"{g['hafta']} hafta"


# Bağ ŞU AN UTM'li mi: son 7 günde iz (GSC'de UTM'li adres gösterimi ya da GA4'te medium=gbp oturumu) var mı.
_iz = sorted({g for g, v in gsc_gbp.items() if v[0] > 0} | {g for g, c in (gbp_ga or {}).items() if sum(c.values()) > 0})
son_utm_izi = _iz[-1] if _iz else None
utm_simdi = bool(son_utm_izi) and (dun - dt.date.fromisoformat(son_utm_izi)).days < 7

_olcu = ""
if karisim:
    _l, _s = karisim["utmli"], karisim["utmsiz"]
    _olcu = (f"UTM'li haftalarda ({donem(_l)}) ana sayfaya doğrudan gelen mobil oturum haftada {aralik(_l, 'ana')}, "
             f"UTM'siz haftalarda ({donem(_s)}) haftada {aralik(_s, 'ana')}"
             + (f"; UTM'li haftalarda profilden gelen mobil oturum (medium=gbp) haftada {aralik(_l, 'gbp_mobil')}"
                if "gbp_mobil_min" in _l else "") + ". ")
if utm_simdi:
    # Bağ UTM'li: uyarı artık "geri konunca ne olur" değil, "eski pencereyle kıyaslama" der.
    utm_uyari = (f"GBP bağı UTM'li (son iz {tr_gun(son_utm_izi)}): profil düğmesinden gelenler ayrı sayılıyor. "
                 f"UTM'sizken bu tıklar mobil Direct ana sayfaya karışıyordu. {_olcu}"
                 f"UTM'siz günleri içeren pencereyle kıyas yapılmaz; ilk geçerli kıyas UTM'nin geri konduğu "
                 f"günden {2 * PENCERE_GUN} gün sonradır.")
elif karisim:
    utm_uyari = (f"GBP bağı UTM'sizken profil düğmesinden gelenler mobil Direct ana sayfaya karışır. {_olcu}"
                 f"UTM geri konunca ana sayfa mobil Direct {PENCERE_GUN} günde yaklaşık "
                 f"{karisim['beklenen_ana_28']} beklenir; ilk geçerli kıyas UTM tarihinden {2 * PENCERE_GUN} gün sonra yapılır.")
else:
    utm_uyari = (f"GBP bağı UTM'sizken profil düğmesinden gelenler mobil Direct ana sayfaya karışır. "
                 f"UTM geri konduğu gün seride kırık beklenir; ilk geçerli kıyas UTM tarihinden "
                 f"{2 * PENCERE_GUN} gün sonra yapılır.")

# --- 3) yorum serisi -----------------------------------------------------------
yorum = []
yol = os.path.join(KOK, "gbp-yorum-serisi.jsonl")
if os.path.exists(yol):
    for L in open(yol, encoding="utf-8"):
        if L.strip():
            yorum.append(json.loads(L))
# bolge-tur.mjs 07.10'dan beri kutu kartını `hk` alanına yazıyor: aynı güne ait en yüksek okuma eklenir
bolge = os.path.join(KOK, "sonuclar-bolge.jsonl")
if os.path.exists(bolge):
    gunluk = {}
    for L in open(bolge, encoding="utf-8"):
        if not L.strip():
            continue
        try:
            r = json.loads(L)
        except ValueError:
            continue
        for kart in r.get("hk") or []:
            ad = (kart.get("ad") or "").lower()
            if not kart.get("yorum"):
                continue
            kim = "sirin" if "şirin" in ad else "efor" if "efor gayr" in ad else None
            if kim:
                g = gunluk.setdefault(r.get("d"), {})
                g[kim] = max(g.get(kim, 0), kart["yorum"])
    bilinen = {y["d"] for y in yorum}
    for d, g in sorted(gunluk.items()):
        if d and d not in bilinen and g.get("sirin"):
            yorum.append({"d": d, "sirin": g.get("sirin"), "efor": g.get("efor"), "kaynak": "bolge-tur hk"})
yorum.sort(key=lambda y: y["d"])
tempo = []
for a, b_ in zip(yorum, yorum[1:]):
    gun = (dt.date.fromisoformat(b_["d"]) - dt.date.fromisoformat(a["d"])).days
    if gun > 0:
        tempo.append({"bas": a["d"], "bit": b_["d"], "gun": gun, "yeni": b_["sirin"] - a["sirin"],
                      "aylik": round((b_["sirin"] - a["sirin"]) * 30 / gun, 1)})
efor_son = next((y for y in reversed(yorum) if y.get("efor")), None)

# --- 4) GBP Performans (panel, ayda bir) ---------------------------------------
gbp = []
yol = os.path.join(KOK, "gbp-performans.jsonl")
if os.path.exists(yol):
    for L in open(yol, encoding="utf-8"):
        if L.strip():
            gbp.append(json.loads(L))

# --- kanal #1 görünür mü: medium=gbp izi ---------------------------------------
son_gbp_gun = max((g for g, v in gsc_gbp.items() if v[0] > 0), default=None)
son_gbp_oturum = max((g for g, c in (gbp_ga or {}).items() if sum(c.values()) > 0), default=None)

# --- uyarılar: rakam taşıyan her cümle yukarıdaki seriden kurulur ---------------
uyarilar = [
    "Sorgu boyutu GSC gizlilik süzgecinden geçer: marka gösterimi alt sınırdır, seri olarak okunur.",
    "+%25 altı fark yorumlanmaz (n küçük); mevsim kıyası için Ekim 2027 gerekir.",
    "Masaüstü Direct'te izleme/kendi trafiği şüphesi var; vekil yalnız MOBİL Direct'in ana sayfaya inen kısmı. "
    "Site sayfasına doğrudan düşen oturumlar ayrı tutulur.",
    utm_uyari,
]
if not utm_simdi and not gbp:
    # Bağ UTM'siz + panel kaydı yok: profil düğmesi tıkını Direct'ten ayıracak hiçbir kaynak yok.
    uyarilar.append("GBP bağı UTM'siz ve GBP Performans kaydı yokken mobil Direct hatırlanırlık vekili olarak "
                    "okunmaz; yalnız taban kaydıdır.")
_dog = ozet.get("marka_dogrulama_gos_28")
if _dog and (_dog["simdi"] or _dog["onceki"]):
    uyarilar.append(f"Adımızın yanında 'yorum' ya da 'şikayet' geçen aramalar çekirdek markadan ayrı sayılır: "
                    f"son {PENCERE_GUN} günde {_dog['simdi']} gösterim (önceki {_dog['onceki']}).")
_ana, _derin, _top = ozet["direct_mobil_ana_28"], ozet["direct_mobil_derin_28"], ozet["direct_mobil_28"]
if min(_ana["simdi"], _ana["onceki"]) < N_KUCUK:
    uyarilar.append(f"Ana sayfaya doğrudan gelen mobil oturum {PENCERE_GUN} günde {_ana['simdi']} (önceki {_ana['onceki']}); "
                    f"sayı {N_KUCUK} eşiğinin altındayken yüzde fark yorumlanmaz.")
if _ana["simdi"] + _derin["simdi"] != _top["simdi"]:
    uyarilar.append(f"Mobil Direct'in iki parçası toplamı tutmuyor: ana {_ana['simdi']} + derin {_derin['simdi']} ≠ "
                    f"{_top['simdi']}. İki GA4 çekimi farklı anda yapılmış olabilir; üretici yeniden koşulmalı.")

cikti = {
    "guncelleme": bugun.isoformat(),
    "kaynak": "GSC (gsc-q.mjs: date,query + marka sorgu süzgeci) + GA4 (ga4-q.mjs kanal, acilis, gbp; yalnız canlı alan adı) "
              "+ gbp-yorum-serisi.jsonl + gbp-performans.jsonl",
    "marka_suzgec": MARKA.split("::", 2)[2],
    "marka_dogrulama_suzgec": DOGRULAMA.pattern,
    "son_gsc_gunu": son_gsc,
    "ozet": ozet,
    # son 28 gün / önceki 28 gün, sorgu sorgu: hangi sorgu çekirdek, hangisi doğrulama sayıldı
    "marka_sorgu_28": marka_sorgu,
    "haftalar": haftalar,
    "yorum": {"seri": yorum, "tempo": tempo, "son": yorum[-1] if yorum else None,
              "efor_son": efor_son,
              "fark": (yorum[-1]["sirin"] - efor_son["efor"]) if yorum and efor_son and efor_son["d"] == yorum[-1]["d"] else None},
    "gbp_performans": gbp,
    "gbp_utm": {"son_gosterim_gunu": son_gbp_gun,
                # GA4'te medium=gbp ile gelen son oturumun günü (seri çekilemediyse ya da hiç yoksa null)
                "son_ga4_oturum_gunu": son_gbp_oturum,
                # bağ şu an UTM'li mi: iki kaynaktan birinde son 7 günde iz var mı
                "simdi": "var" if utm_simdi else "yok",
                "aciklama": "GBP 'Web sitesi' bağı UTM'liyken GSC'de /?utm_source=google&utm_medium=gbp sayfası gösterim alır; "
                            "seri sıfırsa bağ UTM'siz demektir (kanal #1 GA4'te ölçülemez).",
                # UTM'li / UTM'siz haftalarda mobil Direct ana sayfa (haftalık min–max, ortalama) ve UTM geri
                # konunca beklenen 28 günlük değer; iki grupta en az 2 hafta yoksa null (rakam basılmaz).
                "direct_karisim": karisim},
    "uyarilar": uyarilar,
}
json.dump(cikti, open(os.path.join(KOK, "hatirlanirlik.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
o = ozet
print(f"marka (çekirdek) gösterim 28g: {o.get('marka_gos_28', {}).get('simdi')} (önceki {o.get('marka_gos_28', {}).get('onceki')}) · "
      f"doğrulama: {o.get('marka_dogrulama_gos_28', {}).get('simdi')} (önceki {o.get('marka_dogrulama_gos_28', {}).get('onceki')}) · "
      f"bitiş {son_gsc or '—'}")
print(f"mobil Direct 28g: {_top['simdi']} (önceki {_top['onceki']}) = ana {_ana['simdi']} (önceki {_ana['onceki']}) + "
      f"derin {_derin['simdi']} (önceki {_derin['onceki']}) · bitiş {_top['bit']}")
print(f"yorum: {yorum[-1]['sirin'] if yorum else '—'} · son tempo {tempo[-1]['aylik'] if tempo else '—'}/ay · "
      f"GBP UTM izi son gün: {son_gbp_gun or 'yok'} · GBP performans kaydı: {len(gbp)}")
for u in uyarilar[3:]:
    print("uyarı:", u)
