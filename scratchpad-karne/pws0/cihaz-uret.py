#!/usr/bin/env python3
"""Cihaz kırılımı — arayan telefondan mı geliyor, masaüstünden mi?

Karne 02.09'a kadar cihaz ayrımı göstermiyordu. Emlak arayan kişi çoğunlukla
telefondadır; telefon TO'su masaüstünden ayrışıyorsa "TO düşük" cümlesi tek
başına yanıltır (snippet telefonda daha erken kesilir, harita kutusu telefon
ekranında daha çok yer kaplar vb.). Bu betik MÜLK düzeyinde cihaz başına
gösterim / tık / TO / konum basar, önceki 28 günle kıyaslar ve mobil payı verir.

Sayfa süzgeci bilerek YOK: page×device çekimi gösterimlerin bir bölümünü
kapsıyor (GSC sayfa boyutunda anonim/kırpılmış satırları düşürüyor; kapsam
oranı her turda ÖLÇÜLÜR ve JSON'a yazılır — 01.09'da ~%41, 02.09'da %45).
Mülk düzeyi cihaz kırılımı tam sayıma yakındır. Bedeli: 27.08'de siteden
kaldırılan Yenimahalle sayfalarının kalıntı gösterimi de toplamın içinde.
Bu yüzden page×device alt kümesinden iki kontrol rakamı daha üretilir:
alt küme içindeki Yenimahalle payı ve Yenimahalle HARİÇ telefon payı —
tam sayımdaki telefon payıyla aynı yönde mi diye.

Ek gözlem satırı: 08.08 başlık değişikliği öncesi (27.07–07.08) ve sonrası
(10.08–31.08) cihaz başına TO. Pencereler eşit değil, arada başka işler de
var (26.07 URL taşıması hemen önce, 27.08 Yenimahalle kaldırması sonrası
pencerenin içinde) — nedensellik iddiası DEĞİL, gözlem.

Pencere: GSC'nin son VERİ günü bulunur (bugün−2 değil; o gün henüz boş
olabiliyor), son 28 gün o güne kadar, önceki 28 gün onun hemen öncesi.

Girdi : GSC API, gsc-q.mjs ile canlı çekim (KARNE_SCRATCH/gsc-q.mjs ya da GSC_Q).
Çıktı : cihaz.json — karne-html.py okur.
"""
import json, os, re, subprocess, sys, datetime as dt

S = os.environ.get("KARNE_SCRATCH", "")
KOK = os.path.dirname(os.path.abspath(__file__))
_aday = [os.environ.get("GSC_Q", ""), f"{S}/gsc-q.mjs" if S else "", f"{KOK}/gsc-q.mjs"]
GSCQ = next((a for a in _aday if a and os.path.exists(a)), None)
if not GSCQ:
    sys.exit("gsc-q.mjs bulunamadı: KARNE_SCRATCH içinde olmalı ya da GSC_Q ile yolunu ver")

AD = {"MOBILE": "Telefon", "DESKTOP": "Masaüstü", "TABLET": "Tablet"}
SIRA = ["MOBILE", "DESKTOP", "TABLET"]
GUN = 28
# 08.08 başlık değişikliği gözlem pencereleri (görev tanımı)
ON_BAS, ON_BIT = dt.date(2026, 7, 27), dt.date(2026, 8, 7)
SON_BAS, SON_BIT_HEDEF = dt.date(2026, 8, 10), dt.date(2026, 8, 31)


def tr_sayi(n, ondalik=0):
    if n is None:
        return "—"
    t = f"{n:,.{ondalik}f}"
    return t.replace(",", "\x00").replace(".", ",").replace("\x00", ".")


def gsc(bas, bit, dims):
    """gsc-q.mjs çağrısı → [(gösterim, tık, konum, [boyutlar…])]. Hata = betik durur, rakam uydurulmaz."""
    r = subprocess.run(["node", GSCQ, str(bas), str(bit), dims], capture_output=True, text=True)
    if r.returncode != 0:
        sys.exit(f"GSC çekimi başarısız ({bas}–{bit}, {dims}): {r.stderr.strip()[:300]}")
    satir = []
    for L in r.stdout.splitlines():
        p = L.split("\t")
        if len(p) < 4:
            continue
        try:
            satir.append((int(p[0]), int(p[1]), float(p[2]), p[3:]))
        except ValueError:
            continue
    return satir


def oran(tik, gos, ondalik=2):
    return round(tik * 100 / gos, ondalik) if gos else None


def cihaz_tablo(bas, bit):
    """Cihaz → {gos, tik, to, poz}; toplam gösterim ağırlıklı konumla."""
    t = {}
    for g, c, poz, keys in gsc(bas, bit, "device"):
        t[keys[0]] = {"gos": g, "tik": c, "to": oran(c, g), "poz": round(poz, 2)}
    G = sum(v["gos"] for v in t.values()); C = sum(v["tik"] for v in t.values())
    P = sum(v["poz"] * v["gos"] for v in t.values())
    toplam = {"gos": G, "tik": C, "to": oran(C, G), "poz": round(P / G, 2) if G else None}
    return t, toplam


def gunluk(t, gun):
    """Eşit olmayan pencereler için gün başına gösterim/tık (ham %-artış yanıltır)."""
    if not t:
        return None
    return {**t, "gos_gun": round(t["gos"] / gun, 1), "tik_gun": round(t["tik"] / gun, 1)}


def gozlem_fark(once, sonra):
    """Gözlem satırı farkı: yalnız TO puanı, konum ve gün başına oranların değişimi."""
    if not once or not sonra:
        return None
    def yuzde(a, b):
        return round((a - b) * 100 / b, 1) if b else None
    return {
        "to_puan": round(sonra["to"] - once["to"], 2) if sonra["to"] is not None and once["to"] is not None else None,
        "poz": round(sonra["poz"] - once["poz"], 2) if sonra["poz"] is not None and once["poz"] is not None else None,
        "gos_gun_yuzde": yuzde(sonra["gos_gun"], once["gos_gun"]),
        "tik_gun_yuzde": yuzde(sonra["tik_gun"], once["tik_gun"]),
    }


def fark(simdi, once):
    """Dönem farkı: gösterim/tık yüzde, TO ve konum puan. Önceki yoksa None."""
    if not simdi or not once:
        return None
    def yuzde(a, b):
        return round((a - b) * 100 / b, 1) if b else None
    return {
        "gos_yuzde": yuzde(simdi["gos"], once["gos"]),
        "tik_yuzde": yuzde(simdi["tik"], once["tik"]),
        "to_puan": round(simdi["to"] - once["to"], 2) if simdi["to"] is not None and once["to"] is not None else None,
        "poz": round(simdi["poz"] - once["poz"], 2) if simdi["poz"] is not None and once["poz"] is not None else None,
    }


# --- 1) GSC'nin son veri günü ---------------------------------------------
bugun = dt.date.today()
gunler = gsc(bugun - dt.timedelta(days=10), bugun, "date")
if not gunler:
    sys.exit("GSC son 10 günde hiç satır döndürmedi; pencere kurulamadı")
SON_VERI = max(dt.date.fromisoformat(r[3][0]) for r in gunler)

bit = SON_VERI
bas = bit - dt.timedelta(days=GUN - 1)
o_bit = bas - dt.timedelta(days=1)
o_bas = o_bit - dt.timedelta(days=GUN - 1)

# GSC mülkünün verisi 25.06'da başlıyor (karne 31.08 düzeltmesi): önceki pencere
# mülkün ilk ayına değiyorsa dönem farkı büyümeyi değil rampayı ölçer.
MULK_BAS = dt.date(2026, 6, 25)
rampa = o_bas < MULK_BAS + dt.timedelta(days=GUN)

# --- 2) Son 28 gün ve önceki 28 gün, cihaz başına ---------------------------
simdi, simdi_t = cihaz_tablo(bas, bit)
once, once_t = cihaz_tablo(o_bas, o_bit)

cihazlar = []
for k in SIRA + [k for k in simdi if k not in SIRA]:
    if k not in simdi and k not in once:
        continue
    s = simdi.get(k); o = once.get(k)
    cihazlar.append({
        "k": k, "ad": AD.get(k, k),
        **(s or {"gos": 0, "tik": 0, "to": None, "poz": None}),
        "gos_pay": oran(s["gos"], simdi_t["gos"], 1) if s else 0,
        "tik_pay": oran(s["tik"], simdi_t["tik"], 1) if s else 0,
        "onceki": o,
        "onceki_gos_pay": oran(o["gos"], once_t["gos"], 1) if o else None,
        "fark": fark(s, o),
    })

m, mo = simdi.get("MOBILE"), once.get("MOBILE")
mobil_pay = {
    "gos": oran(m["gos"], simdi_t["gos"], 1) if m else None,
    "tik": oran(m["tik"], simdi_t["tik"], 1) if m else None,
    "onceki_gos": oran(mo["gos"], once_t["gos"], 1) if mo else None,
    "onceki_tik": oran(mo["tik"], once_t["tik"], 1) if mo else None,
}

# --- 2b) sayfa×cihaz alt kümesi: kapsam + Yenimahalle kalıntısı --------------
# 27.08'de siteden kaldırılan Yenimahalle sayfaları (mahalle, site, ada, eski adres)
YM = re.compile(r"/mahalleler/(ata|susuz|cumhuriyet)(-mahallesi)?(/|$)")
pd = gsc(bas, bit, "page,device")
_bos = lambda: {k: {"gos": 0, "tik": 0} for k in SIRA}
ym_c, ery_c = _bos(), _bos()
kap_g = kap_c = 0
for g, c, poz, keys in pd:
    sayfa, dev = keys[0], keys[1]
    kap_g += g; kap_c += c
    hedef = ym_c if YM.search(sayfa) else ery_c
    hedef.setdefault(dev, {"gos": 0, "tik": 0})
    hedef[dev]["gos"] += g; hedef[dev]["tik"] += c
kapsam = {"satir": len(pd), "kesik": len(pd) >= 5000, "gos": kap_g, "tik": kap_c,
          "gos_pay": oran(kap_g, simdi_t["gos"], 0), "tik_pay": oran(kap_c, simdi_t["tik"], 0)}
ym_g = sum(v["gos"] for v in ym_c.values()); ym_t = sum(v["tik"] for v in ym_c.values())
ery_g = sum(v["gos"] for v in ery_c.values()); ery_t = sum(v["tik"] for v in ery_c.values())
yenimahalle = {
    "kapsam_ici_gos": ym_g, "kapsam_ici_tik": ym_t,
    "kapsam_ici_gos_pay": oran(ym_g, kap_g, 1), "kapsam_ici_tik_pay": oran(ym_t, kap_c, 1),
    "eryaman_gos": ery_g, "eryaman_tik": ery_t,
    "eryaman_telefon_gos_pay": oran(ery_c["MOBILE"]["gos"], ery_g, 1),
    "eryaman_telefon_tik_pay": oran(ery_c["MOBILE"]["tik"], ery_t, 1),
    "eryaman_telefon_to": oran(ery_c["MOBILE"]["tik"], ery_c["MOBILE"]["gos"]),
    "eryaman_masaustu_to": oran(ery_c["DESKTOP"]["tik"], ery_c["DESKTOP"]["gos"]),
    "yenimahalle_telefon_gos_pay": oran(ym_c["MOBILE"]["gos"], ym_g, 1),
}

# --- 3) 08.08 başlık değişikliği: öncesi / sonrası, gözlem satırı ------------
SON_BIT = min(SON_BIT_HEDEF, SON_VERI)
ON_GUN, SON_GUN = (ON_BIT - ON_BAS).days + 1, (SON_BIT - SON_BAS).days + 1
on_c, on_t = cihaz_tablo(ON_BAS, ON_BIT)
so_c, so_t = cihaz_tablo(SON_BAS, SON_BIT)
on_t, so_t = gunluk(on_t, ON_GUN), gunluk(so_t, SON_GUN)
gozlem_cihaz = []
for k in ("MOBILE", "DESKTOP"):
    a, b = gunluk(on_c.get(k), ON_GUN), gunluk(so_c.get(k), SON_GUN)
    gozlem_cihaz.append({"k": k, "ad": AD[k], "oncesi": a, "sonrasi": b, "fark": gozlem_fark(a, b)})
gozlem_uyari = [
    f"Pencereler eşit uzunlukta değil: öncesi {ON_GUN} gün, sonrası {SON_GUN} gün — gösterim ve tık gün başına kıyaslanır.",
    "27.07 başlangıcı 26.07 mahalle URL taşımasının ertesi günü; 27.08 Yenimahalle kaldırması sonraki pencerenin içinde. "
    "TO farkı yalnız başlığa bağlanamaz — gözlem satırıdır, nedensellik iddiası değil.",
    "08–09.08 geçiş günleri iki pencerenin de dışında.",
]
if SON_BIT < SON_BIT_HEDEF:
    gozlem_uyari.append(f"Sonrası penceresi {SON_BIT.strftime('%d.%m')} ile bitiyor: GSC'de daha sonrası henüz yok.")

_kp_s = "ölçülmedi" if kapsam["gos_pay"] is None else f"%{tr_sayi(kapsam['gos_pay'])}"
_ym_s = ("ölçülmedi" if yenimahalle["kapsam_ici_gos_pay"] is None
         else f"%{tr_sayi(yenimahalle['kapsam_ici_gos_pay'], 1)}")
_ery_s = ("ölçülmedi" if yenimahalle["eryaman_telefon_gos_pay"] is None
          else f"%{tr_sayi(yenimahalle['eryaman_telefon_gos_pay'], 1)}")
uyarilar = [
    f"Mülk düzeyi, sayfa süzgeci yok: sayfa×cihaz çekimi bu dönemde gösterimin {_kp_s} kadarını kapsıyor "
    f"({tr_sayi(kapsam['satir'])} satır{', 5.000 satır sınırında kesik' if kapsam['kesik'] else ''}), bu tablo tam sayıma yakın.",
    f"27.08'de kaldırılan Yenimahalle sayfalarının kalıntı gösterimi toplamın içinde. Sayfa süzgeçli alt kümede "
    f"Yenimahalle payı {_ym_s}; Yenimahalle HARİÇ telefon payı {_ery_s} "
    f"(tam sayımda %{tr_sayi(mobil_pay['gos'], 1)}). Eryaman'a özgü tam sayım ölçülemez, alt küme yön gösterir.",
    f"GSC verisi {SON_VERI.strftime('%d.%m')} gününe kadar; son 28 gün {bas.strftime('%d.%m')}–{bit.strftime('%d.%m')}, "
    f"önceki 28 gün {o_bas.strftime('%d.%m')}–{o_bit.strftime('%d.%m')}.",
    *([f"Önceki 28 gün ({o_bas.strftime('%d.%m')}–{o_bit.strftime('%d.%m')}) mülkün ilk ayına değiyor (GSC verisi "
       f"{MULK_BAS.strftime('%d.%m')} günü başlıyor): dönem farkı büyümeyi değil mülkün rampasını ölçer, "
       "gösterim/tık artışını kanıt sayma."] if rampa else []),
    "Konum, gösterim ağırlıklı ortalama; cihazlar arası konum farkı SERP'in cihaza göre farklı dizilmesinden de gelir "
    "(harita kutusu, görsel şerit).",
]

cikti = {
    "guncelleme": bugun.isoformat(),
    "kaynak": "GSC Search Analytics API, mülk düzeyi, boyut=device (gsc-q.mjs)",
    "son_veri_gunu": SON_VERI.isoformat(),
    "gun": GUN,
    "donem": {"bas": bas.isoformat(), "bit": bit.isoformat()},
    "onceki_donem": {"bas": o_bas.isoformat(), "bit": o_bit.isoformat(), "rampa": rampa},
    "cihazlar": cihazlar,
    "toplam": simdi_t,
    "onceki_toplam": once_t,
    "toplam_fark": fark(simdi_t, once_t),
    "mobil_pay": mobil_pay,
    "kapsam": kapsam,
    "yenimahalle": yenimahalle,
    "baslik_gozlem": {
        "degisiklik": "2026-08-08",
        "oncesi": {"bas": ON_BAS.isoformat(), "bit": ON_BIT.isoformat(), "gun": ON_GUN, "toplam": on_t},
        "sonrasi": {"bas": SON_BAS.isoformat(), "bit": SON_BIT.isoformat(), "gun": SON_GUN, "toplam": so_t},
        "toplam_fark": gozlem_fark(on_t, so_t),
        "cihazlar": gozlem_cihaz,
        "uyari": gozlem_uyari,
    },
    "uyarilar": uyarilar,
}
json.dump(cikti, open(f"{KOK}/cihaz.json", "w"), ensure_ascii=False, indent=1)

# --- 4) Terminal özeti ------------------------------------------------------
print(f"GSC son veri günü {SON_VERI.strftime('%d.%m')} · son 28 gün {bas.strftime('%d.%m')}–{bit.strftime('%d.%m')} "
      f"· önceki {o_bas.strftime('%d.%m')}–{o_bit.strftime('%d.%m')}")
print(f"{'cihaz':10} {'gösterim':>9} {'pay':>6} {'tık':>5} {'pay':>6} {'TO':>7} {'konum':>6} │ {'önceki gös':>10} {'tık':>5} {'TO':>7} {'konum':>6}")
for c in cihazlar:
    o = c["onceki"] or {}
    print(f"{c['ad']:10} {tr_sayi(c['gos']):>9} {('%'+tr_sayi(c['gos_pay'],1)):>6} {tr_sayi(c['tik']):>5} "
          f"{('%'+tr_sayi(c['tik_pay'],1)):>6} {('%'+tr_sayi(c['to'],2)):>7} {tr_sayi(c['poz'],2):>6} │ "
          f"{tr_sayi(o.get('gos')):>10} {tr_sayi(o.get('tik')):>5} {('%'+tr_sayi(o.get('to'),2)) if o else '—':>7} {tr_sayi(o.get('poz'),2):>6}")
print(f"{'Toplam':10} {tr_sayi(simdi_t['gos']):>9} {'':6} {tr_sayi(simdi_t['tik']):>5} {'':6} "
      f"{('%'+tr_sayi(simdi_t['to'],2)):>7} {tr_sayi(simdi_t['poz'],2):>6} │ {tr_sayi(once_t['gos']):>10} "
      f"{tr_sayi(once_t['tik']):>5} {('%'+tr_sayi(once_t['to'],2)):>7} {tr_sayi(once_t['poz'],2):>6}")
print(f"mobil payı: gösterim %{tr_sayi(mobil_pay['gos'],1)} · tık %{tr_sayi(mobil_pay['tik'],1)} "
      f"(önceki dönem gösterim %{tr_sayi(mobil_pay['onceki_gos'],1)} · tık %{tr_sayi(mobil_pay['onceki_tik'],1)})")
print(f"sayfa×cihaz alt kümesi: kapsam {_kp_s} ({tr_sayi(kapsam['satir'])} satır) · Yenimahalle payı {_ym_s} · "
      f"Yenimahalle hariç telefon payı {_ery_s}")
print(f"\n08.08 başlık değişikliği — gözlem satırı ({ON_BAS.strftime('%d.%m')}–{ON_BIT.strftime('%d.%m')} vs "
      f"{SON_BAS.strftime('%d.%m')}–{SON_BIT.strftime('%d.%m')}):")
for g in gozlem_cihaz:
    a, b, f = g["oncesi"] or {}, g["sonrasi"] or {}, g["fark"] or {}
    print(f"  {g['ad']:9} TO %{tr_sayi(a.get('to'),2)} → %{tr_sayi(b.get('to'),2)} "
          f"({'+' if (f.get('to_puan') or 0) >= 0 else ''}{tr_sayi(f.get('to_puan'),2)} puan) · "
          f"konum {tr_sayi(a.get('poz'),2)} → {tr_sayi(b.get('poz'),2)} · "
          f"gösterim/gün {tr_sayi(a.get('gos_gun'))} → {tr_sayi(b.get('gos_gun'))} · tık/gün {tr_sayi(a.get('tik_gun'),1)} → {tr_sayi(b.get('tik_gun'),1)}")
for u in gozlem_uyari:
    print(f"  ! {u}")
