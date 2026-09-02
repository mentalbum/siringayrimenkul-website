#!/usr/bin/env python3
"""Hedef sorgular — 17 "… emlakçı" sorgusunun EN TAZE ölçümü, tek JSON'da.

Özgün'ün hedefi (hedef-sorgular.md): 5 etap + 11 Eryaman mahallesi = 16 sorguda
organik 1. sıra. Çatı sorgu "eryaman emlakçı" o listede ayrı tutuluyor; karne
onu da izlediği için burada 17 satır var (16 hedef + çatı). Ata/Susuz/Cumhuriyet
27.08'de siteden kaldırıldı — bu betik onları hiç okumaz.

Ölçümler iki dosyaya dağınık yazılmış: sonuclar-emlakci.jsonl (sorgu bazlı) ve
sonuclar-site-emlakci.jsonl (mahalle/etap turlarında s anahtarıyla). İkisi de
append-only; aynı sorgunun kaydı iki dosyada da olabilir, yazımı da farklı
olabilir ("Tunahan Mahallesi" / "Tunahan mahallesi"). Eşleştirme tranahtar.anahtar()
ile: Python'un .lower()'ı Türkçe İ'de bozuluyor, ayrıca anahtar() ı→i çevirdiği
için KARŞILAŞTIRMANIN İKİ TARAFI DA anahtar()'dan geçmeli ("emlakçı" ≠ "emlakçi").

Harita kutusu alanı "h" iki ayrı anlamda yazılmış (02.09'da ölçüldü, 109 kaydın
105'i eski anlamda, 4 istisna hepsi 02.09 kaydı):
  - eski kayıtlar (≤31.08): h = kutuda KAÇINCIYIZ (0 = kutuda değiliz)
  - 01–02.09 'normal' kanal kayıtları (isgal alanı taşıyanlar): h = kutu VAR MI
Bu yüzden kutudaki sıra önce hl/hp listesindeki adımızdan, sonra nottan okunur;
h'ye ancak eski biçimde ve liste yoksa güvenilir. hl ilk 3 adı tutar: 4. ve
sonrası listede görünmez, o durumda eski biçim h devreye girer.

İşgal (1. sayfada bize ait sonuç sayısı) kayıtta yoksa aynı gün için
isgal-GGAA.json'dan alınır; o da yoksa null = ölçülmedi.

Girdi : sonuclar-emlakci.jsonl, sonuclar-site-emlakci.jsonl, isgal-*.json (hepsi KOK)
Çıktı : hedef-sorgular.json — karne-html.py okuyacak. Elle rakam yok, her turda
        yeniden çalıştırılır.
"""
import json, os, re, sys, glob, datetime

KOK = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, KOK)
from tranahtar import anahtar  # noqa: E402

BUGUN = datetime.date.today()

# ---------------- hedef listesi ----------------
MAHALLELER = [
    ("Eryaman", "eryaman-mahallesi"),
    ("Tunahan", "tunahan-mahallesi"),
    ("Altay", "altay-mahallesi"),
    ("Devlet", "devlet-mahallesi"),
    ("Göksu", "goksu-mahallesi"),
    ("Güzelkent", "guzelkent-mahallesi"),
    ("Şehit Osman Avcı", "sehit-osman-avci-mahallesi"),
    ("Şeker", "seker-mahallesi"),
    ("Şeyh Şamil", "seyh-samil-mahallesi"),
    ("Yavuz Selim", "yavuz-selim-mahallesi"),
    ("Yeşilova", "yesilova-mahallesi"),
]
ETAP_SAYFA = {  # hedef-sorgular.md'deki sayfa karşılıkları
    1: "altay-mahallesi/etaplar/1",
    2: "sehit-osman-avci-mahallesi/etaplar/2",
    3: "seyh-samil-mahallesi/etaplar/3",
    4: "tunahan-mahallesi/etaplar/4",
    5: "tunahan-mahallesi/etaplar/5",
}
YENIMAHALLE = ("ata-mahallesi", "susuz-mahallesi", "cumhuriyet-mahallesi")

HEDEFLER = [{"sorgu": "eryaman emlakçı", "aile": "cati", "s": None, "beklenen": "/"}]
HEDEFLER += [{"sorgu": f"Eryaman {n}. Etap emlakçı", "aile": "etap", "s": ETAP_SAYFA[n],
              "beklenen": f"/mahalleler/{ETAP_SAYFA[n]}"} for n in range(1, 6)]
HEDEFLER += [{"sorgu": f"{ad} Mahallesi emlakçı", "aile": "mahalle", "s": slug,
              "beklenen": f"/mahalleler/{slug}"} for ad, slug in MAHALLELER]
AILE_AD = {"cati": "Çatı sorgu", "etap": "Etap ailesi", "mahalle": "Mahalle ailesi"}


# ---------------- kayıtları oku ----------------
def oku(dosya):
    yol = f"{KOK}/{dosya}"
    if not os.path.exists(yol):
        sys.exit(f"{dosya} yok")
    out = []
    for i, L in enumerate(open(yol)):
        L = L.strip()
        if not L:
            continue
        try:
            r = json.loads(L)
        except json.JSONDecodeError:
            continue
        if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", str(r.get("d"))):
            continue
        r["_kaynak"] = dosya
        out.append(r)
    return out


KAYITLAR = oku("sonuclar-emlakci.jsonl") + oku("sonuclar-site-emlakci.jsonl")
for i, r in enumerate(KAYITLAR):
    r["_sira_no"] = i

# işgal dosyaları: (tarih, anahtar(q)) -> {isgal, harita}
ISGAL_DOSYA = {}
for f in sorted(glob.glob(f"{KOK}/isgal-*.json")):
    try:
        j = json.load(open(f))
    except (json.JSONDecodeError, OSError):
        continue
    for o in j.get("olcumler", []):
        ISGAL_DOSYA[(j.get("tarih"), anahtar(o.get("q", "")))] = o


def eslesir(r, h):
    """Kayıt bu hedefe ait mi? Önce sorgu metni, sonra tur dosyasındaki s anahtarı."""
    qk = anahtar(r.get("q", ""))
    if qk == anahtar(h["sorgu"]):
        return "q"
    s = r.get("s") or ""
    if h["s"] and s == h["s"] and "emlakç" in qk:
        # aynı sayfanın "… emlakçı" ölçümü ama sorgu yazımı listeden sapmış
        if h["aile"] == "etap" and "etap" in qk:
            return "s"
        if h["aile"] == "mahalle" and "mahalle" in qk:
            return "s"
    return None


def taze_once(r):
    """Aynı gün birden çok kayıt varsa bilgisi çok olan (isgal/hl) sonra gelsin."""
    return (r["d"], 1 if "isgal" in r else 0, 1 if ("hl" in r or "hp" in r) else 0, r["_sira_no"])


# ---------------- harita kutusu ----------------
_BIZ = ("şirin", "sirin")


def _biz_mi(ad):
    a = anahtar(ad)
    return any(b in a for b in _BIZ)


_GECIS = re.compile(r"harita(?: kutusu)?\s*(\d)\s*→\s*(\d)")
_KONUM = [re.compile(p) for p in (
    r"kutuda (\d)\b", r"harita kutusu(?:na|nda)? (\d)\b", r"harita #(\d)",
    r"harita (\d)\b", r"kutuya #?(\d)")]
_KUTU_YOK = re.compile(r"harita kutusu (?:yok|hiç çikmiyor)|\bkutu yok|tek işletme karti")
_DISARIDA = re.compile(r"kutuda yok|kutusunda yokuz|biz yokuz|ilk 3'ten düştük|kutudan düştük")


def kutu_durumu(r):
    """(kutu_var, kutuda) — kutu_var: True/False/None; kutuda: 1.. / 0 = kutuda değiliz /
    None = kutu yok ya da bilinmiyor."""
    L = r.get("hl") if "hl" in r else (r.get("hp") if "hp" in r else None)
    h = r.get("h")
    yeni_bicim = "isgal" in r or r.get("kanal") == "normal"
    nk = anahtar(r.get("not") or "")

    not_konum = None
    m = _GECIS.search(nk)
    if m:
        not_konum = int(m.group(2))
    else:
        for p in _KONUM:
            m = p.search(nk)
            if m:
                not_konum = int(m.group(1))
                break
    not_kutu_yok = bool(_KUTU_YOK.search(nk))
    not_disarida = bool(_DISARIDA.search(nk))

    if isinstance(L, list):
        if not L:
            return False, None
        for i, ad in enumerate(L):
            if _biz_mi(ad):
                return True, i + 1
        if not yeni_bicim and isinstance(h, int) and h > len(L):
            return True, h  # liste ilk 3'ü tutuyor, biz daha gerideyiz
        if not_konum:
            return True, not_konum
        return True, 0
    if not_kutu_yok:
        return False, None
    if not_konum:
        return True, not_konum
    if not_disarida:
        return True, 0
    if isinstance(h, int):
        if yeni_bicim:
            return (True, None) if h else (False, None)
        return (True, h) if h else (None, 0)
    return None, None


# ---------------- sayfa ----------------
def sayfa_turu(u):
    if not u:
        return None
    if u == "/" or "(ana sayfa)" in u:
        return "ana sayfa"
    if u.startswith("cite:"):
        uk = anahtar(u)
        if "etaplar" in uk:
            return "etap sayfası (kırıntı)"
        if "mahalleler" in uk:
            return "mahalle bölümü (kırıntı, hangi sayfa belirsiz)"
        return "kırıntı (sayfa belirsiz)"
    if "/adalar/" in u:
        return "ada sayfası"
    if re.fullmatch(r"/mahalleler/[^/]+/etaplar/\d+/?", u):
        return "etap sayfası"
    if re.fullmatch(r"/mahalleler/[^/]+/?", u):
        return "mahalle sayfası"
    if re.fullmatch(r"/mahalleler/[^/]+/[^/]+/?", u):
        return "site sayfası"
    return "başka sayfa"


def dogru_sayfa(u, beklenen):
    if not u:
        return None
    if u == "/" or "(ana sayfa)" in u:
        return beklenen == "/"
    if u.startswith("cite:"):
        return None
    return u.rstrip("/") == beklenen.rstrip("/")


def sira_etiketi(sira):
    if not sira:
        return "ilk 10 dışı"
    return "ilk 3" if sira <= 3 else "4–10"


def yon(onceki, simdi):
    o, s = onceki or 0, simdi or 0
    if not o and not s:
        return "dışarıda kaldı"
    if not o:
        return "ilk 10'a girdi"
    if not s:
        return "ilk 10'dan çıktı"
    if s < o:
        return "yükseldi"
    if s > o:
        return "geriledi"
    return "aynı"


def kutu_yon(onceki, simdi):
    o, s = onceki or 0, simdi or 0
    if not o and not s:
        return "kutu dışında kaldı"
    if not o:
        return "kutuya girdi"
    if not s:
        return "kutudan çıktı"
    if s < o:
        return "kutuda yükseldi"
    if s > o:
        return "kutuda geriledi"
    return "kutuda aynı"


def isgal_bul(r):
    if isinstance(r.get("isgal"), int):
        return r["isgal"], "kayıt"
    o = ISGAL_DOSYA.get((r["d"], anahtar(r.get("q", ""))))
    if o and isinstance(o.get("isgal"), int):
        return o["isgal"], "isgal dosyası"
    return None, None


def isgal_dosyasi_daha_taze(sorgu, tarih):
    """isgal-GGAA.json'da jsonl kaydından SONRAKİ bir işgal/harita ölçümü varsa onu döndür.
    Organik sıra oradan çıkmaz (siralar listesi mağaza/sosyal dahil), o yüzden satırı
    değiştirmez; yalnız 'daha taze ölçüm var' bilgisi olarak taşınır."""
    k = anahtar(sorgu)
    adaylar = [(t, o) for (t, qk), o in ISGAL_DOSYA.items() if qk == k and t and t > tarih]
    if not adaylar:
        return None
    t, o = max(adaylar, key=lambda x: x[0])
    return {"tarih": t, "isgal": o.get("isgal"), "harita": o.get("harita"),
            "siralar": o.get("siralar")}


# ---------------- satırlar ----------------
def satir_kur(h):
    esl = [(eslesir(r, h), r) for r in KAYITLAR]
    adaylar = [(e, r) for e, r in esl if e]
    temel = {"sorgu": h["sorgu"], "aile": h["aile"], "aile_ad": AILE_AD[h["aile"]],
             "beklenen_sayfa": h["beklenen"]}
    if not adaylar:
        return {**temel, "olculdu": False, "sira": None, "sira_etiketi": "ölçülmedi",
                "olcum_sayisi": 0}
    adaylar.sort(key=lambda er: taze_once(er[1]))
    esl_tipi, r = adaylar[-1]
    oncekiler = [x for _, x in adaylar if x["d"] < r["d"]]
    onceki = oncekiler[-1] if oncekiler else None

    kutu_var, kutuda = kutu_durumu(r)
    if kutuda is None and kutu_var is None:
        o = ISGAL_DOSYA.get((r["d"], anahtar(r.get("q", ""))))
        if o and isinstance(o.get("harita"), int):
            kutu_var, kutuda = (True, o["harita"]) if o["harita"] else (None, 0)
    isgal, isgal_kaynak = isgal_bul(r)
    sira = r.get("sira") or 0
    u = r.get("u")

    satir = {
        **temel, "olculdu": True,
        "sira": sira, "sira_etiketi": sira_etiketi(sira),
        "u": u, "sayfa_turu": sayfa_turu(u), "dogru_sayfa": dogru_sayfa(u, h["beklenen"]),
        "kutu_var": kutu_var, "kutuda": kutuda,
        "isgal": isgal, "isgal_kaynak": isgal_kaynak,
        "n": r.get("n"),
        "tarih": r["d"], "yas_gun": (BUGUN - datetime.date.fromisoformat(r["d"])).days,
        "kanal": r.get("kanal"), "kaynak": r["_kaynak"], "eslesme": esl_tipi,
        "olcum_sayisi": len(adaylar),
        "not": r.get("not"),
        "onceki": None, "fark": None, "yon": None, "kanal_ayni": None,
    }
    if onceki:
        o_sira = onceki.get("sira") or 0
        o_kutu_var, o_kutuda = kutu_durumu(onceki)
        satir["onceki"] = {
            "tarih": onceki["d"], "sira": o_sira, "sira_etiketi": sira_etiketi(o_sira),
            "u": onceki.get("u"), "sayfa_turu": sayfa_turu(onceki.get("u")),
            "kutu_var": o_kutu_var, "kutuda": o_kutuda, "kanal": onceki.get("kanal"),
            "yas_gun": (BUGUN - datetime.date.fromisoformat(onceki["d"])).days,
        }
        satir["yon"] = yon(o_sira, sira)
        if o_sira and sira:
            satir["fark"] = o_sira - sira  # + = yükseliş (karne-html ile aynı işaret)
        # Kanal kaydı olmayan eski ölçüm (≤29.08, oturumlu Chrome / belirsiz) "normal"
        # sayılmaz: iki taraftan biri bilinmiyorsa kıyas BELİRSİZ (None) — karnede ‡.
        # 02.09 denetimi: 17 kıyasın 6'sı böyleydi ve hepsi "kanal değişti" sayılıyordu.
        if onceki.get("kanal") and r.get("kanal"):
            satir["kanal_ayni"] = onceki["kanal"] == r["kanal"]
        else:
            satir["kanal_ayni"] = None
        if o_kutuda is not None and kutuda is not None:
            satir["kutu_yon"] = kutu_yon(o_kutuda, kutuda)
        else:
            satir["kutu_yon"] = None
    satir["isgal_dosyasinda_daha_taze"] = isgal_dosyasi_daha_taze(h["sorgu"], r["d"])
    return satir


SATIRLAR = [satir_kur(h) for h in HEDEFLER]

# ---------------- özet ----------------
olc = [s for s in SATIRLAR if s["olculdu"]]


def say(f):
    return sum(1 for s in olc if f(s))


def aile_ozet(aile):
    v = [s for s in olc if s["aile"] == aile]
    return {"ad": AILE_AD[aile], "toplam": sum(1 for s in SATIRLAR if s["aile"] == aile),
            "olculen": len(v),
            "birinci": sum(1 for s in v if s["sira"] == 1),
            "ilk3": sum(1 for s in v if 1 <= s["sira"] <= 3),
            "ilk4_10": sum(1 for s in v if 4 <= s["sira"] <= 10),
            "disarida": sum(1 for s in v if not s["sira"]),
            "kutuda": sum(1 for s in v if s["kutuda"]),
            }


en_bayat = max(olc, key=lambda s: s["yas_gun"]) if olc else None
en_taze = min(olc, key=lambda s: s["yas_gun"]) if olc else None
OZET = {
    "hedef_sayisi": len(SATIRLAR),
    "hedef_notu": "hedef-sorgular.md'deki 16 hedef (5 etap + 11 Eryaman mahallesi) + çatı sorgu "
                  "'eryaman emlakçı'. Ata/Susuz/Cumhuriyet 27.08'de siteden kaldırıldı, sayılmaz.",
    "olculen": len(olc), "olculmeyen": len(SATIRLAR) - len(olc),
    "birinci": say(lambda s: s["sira"] == 1),
    "ilk3": say(lambda s: 1 <= s["sira"] <= 3),
    "ilk4_10": say(lambda s: 4 <= s["sira"] <= 10),
    "disarida": say(lambda s: not s["sira"]),
    "kutuda": say(lambda s: s["kutuda"]),
    "kutuda_birinci": say(lambda s: s["kutuda"] == 1),
    "kutu_var_biz_yok": say(lambda s: s["kutu_var"] and s["kutuda"] == 0),
    "kutu_yok": say(lambda s: s["kutu_var"] is False),
    "kutu_bilinmiyor": say(lambda s: s["kutu_var"] is None),
    "ilk10_dogru_sayfa": say(lambda s: s["sira"] and s["dogru_sayfa"] is True),
    "ilk10_ana_sayfa_temsil": say(lambda s: s["sira"] and s["sayfa_turu"] == "ana sayfa"
                                  and s["beklenen_sayfa"] != "/"),
    "ilk10_sayfa_belirsiz": say(lambda s: s["sira"] and s["dogru_sayfa"] is None),
    "isgal_olculen": say(lambda s: s["isgal"] is not None),
    "isgal_toplam": sum(s["isgal"] for s in olc if s["isgal"] is not None),
    "yon": {k: say(lambda s, k=k: s["yon"] == k)
            for k in ("yükseldi", "geriledi", "aynı", "ilk 10'a girdi", "ilk 10'dan çıktı",
                      "dışarıda kaldı")},
    "onceki_yok": say(lambda s: s["onceki"] is None),
    "kanal_degisen_kiyas": say(lambda s: s["onceki"] and s["kanal_ayni"] is False),
    "kanal_belirsiz_kiyas": say(lambda s: s["onceki"] and s["kanal_ayni"] is None),
    "en_bayat": {"sorgu": en_bayat["sorgu"], "tarih": en_bayat["tarih"], "yas_gun": en_bayat["yas_gun"]}
    if en_bayat else None,
    "en_taze": {"sorgu": en_taze["sorgu"], "tarih": en_taze["tarih"], "yas_gun": en_taze["yas_gun"]}
    if en_taze else None,
    "yas_ortalama_gun": round(sum(s["yas_gun"] for s in olc) / len(olc), 1) if olc else None,
    "bayat_7gun": say(lambda s: s["yas_gun"] > 7),
    "aileler": {a: aile_ozet(a) for a in ("cati", "etap", "mahalle")},
}

UYARILAR = [
    "Organik sıra ilk 10 sonucu kapsar; 0 = ilk 10 dışı (num=20 ölü, 11. ve sonrası görünmüyor).",
    "Tek ölçüm karar verdirmez: 2. Etap 10.08'de 9 saatte 2. sıradan ilk 10 dışına düştü; "
    "yön için 3 günün eğilimine bakılır.",
    "'fark' yalnız iki ölçüm de ilk 10'daysa hesaplanır; giriş/çıkışlar 'yon' alanında. "
    "Kanal değişen kıyaslar (gizli → normal) 30.08 kalibrasyonunda birebir çıktı ama ±1 sıra gürültü sayılır. "
    "Önceki ölçümün kanal kaydı yoksa (≤29.08 oturumlu Chrome / belirsiz) kıyas 'belirsiz' sayılır, "
    "'kanal değişti' değil.",
    "Harita kutusu sırası hl listesindeki adımızdan okunur; liste ilk 3 adı tutar, 4. ve sonrası "
    "eski kayıtlarda h alanından gelir, yeni kayıtlarda bilinemez (null).",
    "'kutuda' 0 = kutu çıktı ama biz yokuz; null = kutu hiç çıkmadı ya da ölçülmedi ('kutu_var' ayırır).",
    "İşgal 31.08 ve 01–02.09 ölçümlerinde var; daha eski kayıtlarda ölçülmedi (null).",
    "Etap ve 'eryaman emlakçı' sorgularında sırayı çoğunlukla ANA SAYFA tutuyor (dogru_sayfa=false): "
    "sıra var, hedef sayfa görünmüyor — ikisi ayrı okunmalı.",
]

CIKTI = {
    "guncelleme": BUGUN.isoformat(),
    "kaynaklar": ["sonuclar-emlakci.jsonl", "sonuclar-site-emlakci.jsonl"] +
                 sorted(os.path.basename(f) for f in glob.glob(f"{KOK}/isgal-*.json")),
    "kayit_sayisi": len(KAYITLAR),
    "satirlar": SATIRLAR,
    "ozet": OZET,
    "uyarilar": UYARILAR,
}
json.dump(CIKTI, open(f"{KOK}/hedef-sorgular.json", "w"), ensure_ascii=False, indent=1)


# ---------------- ekran ----------------
def tr_sayi(n, ondalik=0):
    if n is None:
        return "—"
    t = f"{n:,.{ondalik}f}"
    return t.replace(",", "\x00").replace(".", ",").replace("\x00", ".")


def kutu_metni(s):
    if s["kutu_var"] is False:
        return "kutu yok"
    if s["kutuda"]:
        return f"kutuda {s['kutuda']}."
    if s["kutu_var"] and s["kutuda"] == 0:
        return "kutu var, biz yokuz"
    if s["kutu_var"] and s["kutuda"] is None:
        return "kutu var, sıra bilinmiyor"
    if s["kutuda"] == 0:
        return "kutuda değiliz (kutu ?)"
    return "ölçülmedi"


print(f"bugün {BUGUN.isoformat()} · {tr_sayi(len(KAYITLAR))} kayıt okundu · "
      f"{OZET['hedef_sayisi']} hedef sorgu, {OZET['olculen']} ölçülmüş")
print()
print(f"{'sorgu':36} {'sıra':>5}  {'sayfa':34} {'harita kutusu':24} {'işgal':>5}  {'tarih (yaş)':16} önceki → yön")
for s in SATIRLAR:
    if not s["olculdu"]:
        print(f"{s['sorgu']:36} {'—':>5}  ölçülmedi")
        continue
    sira = str(s["sira"]) if s["sira"] else "dışı"
    sayfa = (s["sayfa_turu"] or "—") + ("" if s["dogru_sayfa"] in (True, None) else " ≠ hedef")
    isg = "—" if s["isgal"] is None else str(s["isgal"])
    tarih = f"{s['tarih'][8:10]}.{s['tarih'][5:7]} ({s['yas_gun']} gün)"
    if s["onceki"]:
        o = s["onceki"]
        o_sira = str(o["sira"]) if o["sira"] else "dışı"
        fark = f" ({'+' if s['fark'] > 0 else ''}{s['fark']})" if s["fark"] else ""
        onc = f"{o['tarih'][8:10]}.{o['tarih'][5:7]} {o_sira} → {s['yon']}{fark}"
        if s["kanal_ayni"] is False:
            onc += " [kanal değişti]"
        elif s["kanal_ayni"] is None:
            onc += " [önceki kanal belirsiz]"
    else:
        onc = "önceki ölçüm yok"
    print(f"{s['sorgu']:36} {sira:>5}  {sayfa:34} {kutu_metni(s):24} {isg:>5}  {tarih:16} {onc}")

print()
o = OZET
print(f"ÖZET — organik: 1. sırada {o['birinci']} · ilk 3'te {o['ilk3']} · 4–10 arası {o['ilk4_10']} · "
      f"ilk 10 dışı {o['disarida']}  (ölçülen {o['olculen']}/{o['hedef_sayisi']})")
print(f"       harita kutusu: kutudayız {o['kutuda']} (1. sırada {o['kutuda_birinci']}) · "
      f"kutu var biz yokuz {o['kutu_var_biz_yok']} · kutu hiç yok {o['kutu_yok']} · bilinmiyor {o['kutu_bilinmiyor']}")
print(f"       ilk 10'daki sırayı doğru sayfa tutuyor: {o['ilk10_dogru_sayfa']} · ana sayfa temsil ediyor: "
      f"{o['ilk10_ana_sayfa_temsil']} · sayfa belirsiz (kırıntı): {o['ilk10_sayfa_belirsiz']}")
print(f"       yön: " + " · ".join(f"{k} {v}" for k, v in o["yon"].items()) +
      f" · kanal değişen kıyas {o['kanal_degisen_kiyas']} · kanalı belirsiz kıyas {o['kanal_belirsiz_kiyas']}")
if o["en_bayat"]:
    print(f"       en bayat ölçüm: {o['en_bayat']['sorgu']} — {o['en_bayat']['tarih']} "
          f"({o['en_bayat']['yas_gun']} gün) · 7 günden eski {o['bayat_7gun']} · ortalama yaş {tr_sayi(o['yas_ortalama_gun'], 1)} gün")
for a, v in o["aileler"].items():
    print(f"       {v['ad']:14} {v['olculen']}/{v['toplam']} ölçüldü · 1. {v['birinci']} · ilk 3 {v['ilk3']} · "
          f"4–10 {v['ilk4_10']} · dışı {v['disarida']} · kutuda {v['kutuda']}")
