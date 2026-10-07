# -*- coding: utf-8 -*-
"""Hatırlanırlık üreticisi — "ev sahibi karar anında bizi hatırlıyor mu" sorusunun sayısal vekilleri.

NEDEN (07.10.2026 araştırması, SIP-DIYE-PLAN-07-10.md): sıra tarafında tavan yakın
("eryaman emlakçı" kutu #1 / organik #1-2); "hafızalara kazınma" arama DIŞI bir iş ve
bugüne dek hiçbir yerde seri olarak tutulmuyordu. Dört vekil, hepsi AYLIK okunur
(n küçük; +%25 altı fark yorumlanmaz, mevsim kıyası Ekim 2027):

  1. GSC marka sorgusu gösterimi  — "şirin gayrimenkul|emlak…" (site adları hariç:
     "Şirin 91 Sitesi", "Şirinköy" marka DEĞİL). Sorgu boyutu gizlilik süzgecinden
     geçer; mutlak değil seri okunur.
  2. GA4 Direct oturumu, yalnız MOBİL — masaüstü Direct'in ~%60'ı kendi/izleme trafiği
     şüphesi taşıyor (04.10 denetimi: /ev-degerleme'ye her gün inen 1024x10000 tarayıcı).
  3. GBP yorum sayısı ve temposu (Şirin + Efor) — gbp-yorum-serisi.jsonl (elle değil:
     kutu kartı okumalarından; bolge-tur.mjs 07.10'dan beri `hk` alanına yazar).
  4. GBP Performans (marka terimli aramalar, çağrı, yol tarifi, web tıkı) —
     gbp-performans.jsonl; panel Özgün'de, ayda bir ekran görüntüsünden işlenir.
     Dosya boşsa bölüm "henüz kayıt yok" der, rakam uydurulmaz.
  + kanal #1 görünürlüğü: GA4 "Organic Search/…" değil, GBP bağının UTM izi
    (medium=gbp) — gsc-q.mjs ile "/?utm_source=google&utm_medium=gbp" sayfa gösterimi.

Girdi : gsc-q.mjs, ga4-q.mjs (bu klasör), gbp-yorum-serisi.jsonl, gbp-performans.jsonl,
        sonuclar-bolge.jsonl (hk alanı olan kayıtlar)
Çıktı : hatirlanirlik.json — karne-html.py okur.
Kullanım: python3 hatirlanirlik-uret.py            (API)
          python3 hatirlanirlik-uret.py --yerel    (KARNE_SCRATCH'teki ham TSV'ler)
"""
import datetime as dt
import json
import os
import subprocess
import sys

KOK = os.path.dirname(os.path.abspath(__file__))
S = os.environ.get("KARNE_SCRATCH", "")
YEREL = "--yerel" in sys.argv
MARKA = "query::includingRegex::(ş|s)irin\\s*(gayrimenkul|emlak|group)"
GBP_SAYFA = "page::contains::utm_medium=gbp"
HAFTA = 14  # kaç ISO haftası geriye


def calistir(argv, onbellek):
    """node betiğini çağırır; KARNE_SCRATCH varsa ham çıktıyı oraya bırakır, --yerel ise oradan okur."""
    yol = f"{S}/{onbellek}" if S else ""
    if YEREL:
        if not yol or not os.path.exists(yol):
            sys.exit(f"--yerel istendi ama {onbellek} yok (KARNE_SCRATCH)")
        return open(yol, encoding="utf-8").read()
    r = subprocess.run(["node"] + argv, capture_output=True, text=True, cwd=KOK)
    if r.returncode != 0:
        sys.exit(f"{argv[0]} başarısız: {r.stderr.strip()[:300]}")
    if yol:
        open(yol, "w", encoding="utf-8").write(r.stdout)
    return r.stdout


def hafta_basi(d):
    return d - dt.timedelta(days=d.weekday())


bugun = dt.date.today()
bas = hafta_basi(bugun) - dt.timedelta(weeks=HAFTA)

# --- 1) GSC marka gösterimi (günlük → haftalık / 28 günlük) -------------------
gsc = {}
for L in calistir(["gsc-q.mjs", bas.isoformat(), bugun.isoformat(), "date", MARKA], "hat-gsc-marka.tsv").splitlines():
    p = L.split("\t")
    if len(p) >= 4:
        gsc[p[3]] = (int(p[0]), int(p[1]))
gsc_gbp = {}
for L in calistir(["gsc-q.mjs", bas.isoformat(), bugun.isoformat(), "date", GBP_SAYFA], "hat-gsc-gbp.tsv").splitlines():
    p = L.split("\t")
    if len(p) >= 4:
        gsc_gbp[p[3]] = (int(p[0]), int(p[1]))
son_gsc = max(gsc) if gsc else None

# --- 2) GA4 kanal × cihaz (günlük) -------------------------------------------
ga = {}
for L in calistir(["ga4-q.mjs", bas.isoformat(), (bugun - dt.timedelta(days=1)).isoformat(), "kanal"], "hat-ga4-kanal.tsv").splitlines():
    p = L.split("\t")
    if len(p) >= 4:
        ga.setdefault(p[0], {})[(p[1], p[2])] = int(p[3])


def ga_topla(gun, kanal, cihaz=None):
    return sum(v for (k, c), v in ga.get(gun, {}).items() if k == kanal and (cihaz is None or c == cihaz))


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
        "gbp_sayfa_gos": sum(gsc_gbp.get(g, (0, 0))[0] for g in gunler) if gsc_tam else None,
        "direct_mobil": sum(ga_topla(g, "Direct", "mobile") for g in gunler) if tam else None,
        "direct_masaustu": sum(ga_topla(g, "Direct", "desktop") for g in gunler) if tam else None,
        "sosyal": sum(ga_topla(g, "Organic Social") for g in gunler) if tam else None,
        "ai": sum(ga_topla(g, "AI Assistant") for g in gunler) if tam else None,
    })
    h += dt.timedelta(weeks=1)


def pencere28(bitis, kaynak, sec):
    """bitis dahil geriye 28 gün toplamı."""
    gunler = [(bitis - dt.timedelta(days=i)).isoformat() for i in range(28)]
    return sum(sec(kaynak, g) for g in gunler)


ozet = {}
if son_gsc:
    b = dt.date.fromisoformat(son_gsc)
    simdi = pencere28(b, gsc, lambda k, g: k.get(g, (0, 0))[0])
    once = pencere28(b - dt.timedelta(days=28), gsc, lambda k, g: k.get(g, (0, 0))[0])
    ozet["marka_gos_28"] = {"simdi": simdi, "onceki": once, "bit": son_gsc}
    ozet["marka_tik_28"] = {"simdi": pencere28(b, gsc, lambda k, g: k.get(g, (0, 0))[1]),
                            "onceki": pencere28(b - dt.timedelta(days=28), gsc, lambda k, g: k.get(g, (0, 0))[1])}
    ozet["gbp_sayfa_gos_28"] = {"simdi": pencere28(b, gsc_gbp, lambda k, g: k.get(g, (0, 0))[0]),
                                "onceki": pencere28(b - dt.timedelta(days=28), gsc_gbp, lambda k, g: k.get(g, (0, 0))[0])}
dun = bugun - dt.timedelta(days=1)
ozet["direct_mobil_28"] = {"simdi": pencere28(dun, ga, lambda k, g: ga_topla(g, "Direct", "mobile")),
                           "onceki": pencere28(dun - dt.timedelta(days=28), ga, lambda k, g: ga_topla(g, "Direct", "mobile")),
                           "bit": dun.isoformat()}
ozet["direct_masaustu_28"] = {"simdi": pencere28(dun, ga, lambda k, g: ga_topla(g, "Direct", "desktop")),
                              "onceki": pencere28(dun - dt.timedelta(days=28), ga, lambda k, g: ga_topla(g, "Direct", "desktop"))}

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

cikti = {
    "guncelleme": bugun.isoformat(),
    "kaynak": "GSC (gsc-q.mjs, marka sorgu süzgeci) + GA4 (ga4-q.mjs kanal) + gbp-yorum-serisi.jsonl + gbp-performans.jsonl",
    "marka_suzgec": MARKA.split("::", 2)[2],
    "son_gsc_gunu": son_gsc,
    "ozet": ozet,
    "haftalar": haftalar,
    "yorum": {"seri": yorum, "tempo": tempo, "son": yorum[-1] if yorum else None,
              "efor_son": efor_son,
              "fark": (yorum[-1]["sirin"] - efor_son["efor"]) if yorum and efor_son and efor_son["d"] == yorum[-1]["d"] else None},
    "gbp_performans": gbp,
    "gbp_utm": {"son_gosterim_gunu": son_gbp_gun,
                "aciklama": "GBP 'Web sitesi' bağı UTM'liyken GSC'de /?utm_source=google&utm_medium=gbp sayfası gösterim alır; "
                            "seri sıfırsa bağ UTM'siz demektir (kanal #1 GA4'te ölçülemez)."},
    "uyarilar": [
        "Sorgu boyutu GSC gizlilik süzgecinden geçer: marka gösterimi alt sınırdır, seri olarak okunur.",
        "+%25 altı fark yorumlanmaz (n küçük); mevsim kıyası için Ekim 2027 gerekir.",
        "Masaüstü Direct'te izleme/kendi trafiği şüphesi var; hatırlanırlık vekili yalnız MOBİL Direct.",
    ],
}
json.dump(cikti, open(os.path.join(KOK, "hatirlanirlik.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
o = ozet
print(f"marka gösterim 28g: {o.get('marka_gos_28', {}).get('simdi')} (önceki {o.get('marka_gos_28', {}).get('onceki')}) · "
      f"mobil Direct 28g: {o['direct_mobil_28']['simdi']} (önceki {o['direct_mobil_28']['onceki']}) · "
      f"yorum: {yorum[-1]['sirin'] if yorum else '—'} · son tempo {tempo[-1]['aylik'] if tempo else '—'}/ay · "
      f"GBP UTM izi son gün: {son_gbp_gun or 'yok'} · GBP performans kaydı: {len(gbp)}")
