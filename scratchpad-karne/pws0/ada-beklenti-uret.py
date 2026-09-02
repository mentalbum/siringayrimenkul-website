#!/usr/bin/env python3
"""Ada sayfaları KAÇ tık getiriyor — aynı konumdaki site sayfası kadar mı?

31.08 karnesi ada sayfalarının sayfa başına on üçte bir tık getirdiğini
gösterdi; ama bu "ada sayfaları kötü" mü demek, yoksa "ada sayfaları alt
sıralarda görünüyor" mu? İkisi ayrı şey. Bu betik konumu sabitler: ada
sayfasının gösterim aldığı her sorgu satırı için "aynı konum bandında ada
OLMAYAN sayfalarımız yüzde kaç tıklanıyor" eğrisinden BEKLENEN tık hesaplar
ve gerçekle kıyaslar. Beklenenin altındaysa sorun sayfada, değilse konumda.

İkinci soru: ada sayfası ile site sayfası AYNI sorguda yan yana çıkıyor mu?
Çıkıyorsa gösterimin ne kadarı ada sayfasına gidiyor? PR #87 (31.08, sitemap
tazelik sinyali) sonrası bu payın düşmesi bekleniyor; bu çalıştırma 01.09
tabanını kaydeder, 14.09 ve 28.09 çalıştırmaları tabanla kıyaslanır.

Yöntem
  • Sayfa×sorgu dökümü, son 28 gün (gsc-q.mjs dims=page,query). Yenimahalle
    (ata/susuz/cumhuriyet) 27.08'de siteden kaldırıldı — dışarıda.
  • Aile: ada (/adalar/), site, mahalle, etap, diğer (ana sayfa, yazılar, araçlar).
  • Konum bandı, satırın 28 günlük ortalama konumundan: 1-3, 4-5, 6-7, 8-10, 10+
    (yarımdan yukarı yuvarlanır: 3,5'e kadar 1-3, 5,5'e kadar 4-5 …).
  • Eğri: ada HARİÇ satırlardan band başına tık/gösterim. Ada satırının beklenen
    tıkı = gösterim × bandın eğri TO'su. Sapmalar ada hariç toplamda sıfıra toplanır
    (eğri o satırlardan kurulu) — o yüzden yalnız ada satırı okunur.
  • Ortak sorgu: aynı sorguda hem ada hem site sayfamız gösterim almış.

Girdi : <KARNE_SCRATCH>/gsc-q.mjs ile çekilir → sayfa-sorgu28.tsv, sayfa-toplam28.tsv
        (--yerel: dosyalar çekilmez, mevcut olanlar okunur)
Çıktı : ada-beklenti.json (karne okur), ada-beklenti-gecmis.jsonl (tarihli taban+kıyas)
"""
import collections
import datetime
import json
import os
import re
import subprocess
import sys

S = os.environ.get("KARNE_SCRATCH", "")
KOK = os.path.dirname(os.path.abspath(__file__))
if not S or not os.path.isdir(S):
    sys.exit("KARNE_SCRATCH ayarla (içinde gsc-q.mjs olmalı)")

YEREL = "--yerel" in sys.argv
GUN = 28
DOKUM = f"{S}/sayfa-sorgu28.tsv"
TOPLAM = f"{S}/sayfa-toplam28.tsv"
DONEM_DOSYA = f"{S}/sayfa-sorgu28.donem.json"
GECMIS = f"{KOK}/ada-beklenti-gecmis.jsonl"
CIKTI = f"{KOK}/ada-beklenti.json"
SATIR_SINIRI = 5000  # gsc-q.mjs rowLimit — dolarsa döküm kesiktir

# 27.08'de siteden kaldırılan Yenimahalle sayfaları: mahalle sayfası, site, ada,
# eski (-mahallesi eksiz) adres — hepsi. sayfa-turu-verimi.py'deki desenden farkı
# sondaki (/|$): mahalle sayfasının kendisi de dışarıda kalsın.
YM = re.compile(r"/mahalleler/(ata|susuz|cumhuriyet)(-mahallesi)?(/|$)")
BANTLAR = ["1-3", "4-5", "6-7", "8-10", "10+"]
AILE_AD = {"ada": "Ada sayfaları", "site": "Site sayfaları", "mahalle": "Mahalle sayfaları",
           "etap": "Etap sayfaları", "diğer": "Diğer (ana sayfa, yazılar, araçlar)"}


def aile(u):
    yol = u.split("?")[0].replace("https://www.siringayrimenkul.com", "")
    if "/adalar/" in yol:
        return "ada"
    if re.search(r"/mahalleler/[^/]+/etaplar/", yol):
        return "etap"
    if re.fullmatch(r"/mahalleler/[^/]+/[^/]+/?", yol):
        return "site"
    if re.fullmatch(r"/mahalleler/[^/]+/?", yol):
        return "mahalle"
    return "diğer"


def bant(poz):
    if poz <= 3.5:
        return "1-3"
    if poz <= 5.5:
        return "4-5"
    if poz <= 7.5:
        return "6-7"
    if poz <= 10.5:
        return "8-10"
    return "10+"


def to(tik, gos, ondalik=2):
    return round(tik * 100 / gos, ondalik) if gos else None


# --- 1. veri çek --------------------------------------------------------------
def cek(dims, hedef):
    bitis = datetime.date.today() - datetime.timedelta(days=2)   # GSC ~2 gün geriden gelir
    baslangic = bitis - datetime.timedelta(days=GUN)              # gsc-api.mjs ile aynı pencere
    r = subprocess.run(["node", f"{S}/gsc-q.mjs", baslangic.isoformat(), bitis.isoformat(), dims],
                       capture_output=True, text=True)
    if r.returncode != 0:
        sys.exit(f"gsc-q.mjs {dims} başarısız: {r.stderr.strip()[:400]}")
    open(hedef, "w").write(r.stdout)
    return {"bas": baslangic.isoformat(), "bit": bitis.isoformat(), "gun": GUN}


if YEREL:
    for f in (DOKUM,):
        if not os.path.exists(f):
            sys.exit(f"--yerel istendi ama {f} yok")
    donem = json.load(open(DONEM_DOSYA)) if os.path.exists(DONEM_DOSYA) else None
else:
    donem = cek("page,query", DOKUM)
    cek("page", TOPLAM)
    # İstenen pencere bugün−2'de biter ama GSC 2-3 gün geriden gelir: son günler boş
    # olabilir. Veri olan günleri say ki karne "03.08–31.08, 28 gün" gibi kendi içinde
    # çelişen bir pencere basmasın (02.09 denetimi: 29 takvim günü, 28 veri günü).
    _g = subprocess.run(["node", f"{S}/gsc-q.mjs", donem["bas"], donem["bit"], "date"],
                        capture_output=True, text=True)
    _gunler = sorted(L.split("\t")[3] for L in _g.stdout.splitlines() if L.count("\t") >= 3) if _g.returncode == 0 else []
    if _gunler:
        donem.update({"istenen_bas": donem["bas"], "istenen_bit": donem["bit"],
                      "bas": _gunler[0], "bit": _gunler[-1], "veri_gun": len(_gunler)})
    json.dump(donem, open(DONEM_DOSYA, "w"))


def oku(dosya, n_boyut):
    for L in open(dosya):
        p = L.rstrip("\n").split("\t")
        if len(p) < 3 + n_boyut:
            continue
        try:
            yield int(p[0]), int(p[1]), float(p[2]), p[3:]
        except ValueError:
            continue


# --- 2. döküm → aile × band ---------------------------------------------------
satirlar = []          # (aile, band, gos, tik, poz, sayfa, sorgu)
ham_satir = 0
ym_satir = 0
for g, c, poz, (sayfa, sorgu) in oku(DOKUM, 2):
    ham_satir += 1
    if YM.search(sayfa):
        ym_satir += 1
        continue
    satirlar.append((aile(sayfa), bant(poz), g, c, poz, sayfa, sorgu.lower()))
kesik = ham_satir >= SATIR_SINIRI

ab = collections.defaultdict(lambda: [0, 0, 0])   # (aile, band) → [gos, tik, satır]
for a, b, g, c, *_ in satirlar:
    ab[(a, b)][0] += g
    ab[(a, b)][1] += c
    ab[(a, b)][2] += 1

# --- 3. eğriler ---------------------------------------------------------------
def egri_kur(aileler):
    """Verilen ailelerin satırlarından band başına TO (yüzde). Gösterimi olmayan band → None."""
    e = {}
    for b in BANTLAR:
        g = sum(ab[(a, b)][0] for a in aileler)
        c = sum(ab[(a, b)][1] for a in aileler)
        e[b] = {"gos": g, "tik": c, "to": to(c, g), "to_ham": (c * 100 / g) if g else None}
    return e


ADA_HARIC = [a for a in AILE_AD if a != "ada"]
egri = egri_kur(ADA_HARIC)      # asıl eğri: ada hariç tüm sayfalarımız
egri_site = egri_kur(["site"])  # ikinci bakış: yalnız site sayfaları


def beklenen(aile_adi, e):
    """Ailenin band bandına beklenen tıkı; eğrisi olmayan banttaki gösterim 'ölçülmedi'."""
    bantlar, top_b, top_g, top_c, olculmedi = [], 0.0, 0, 0, 0
    for b in BANTLAR:
        g, c, n = ab[(aile_adi, b)]
        t = e[b]["to_ham"]
        bk = round(g * t / 100, 1) if (t is not None and g) else None
        if bk is None and g:
            olculmedi += g
        bantlar.append({"bant": b, "satir": n, "gos": g, "tik": c, "to": to(c, g),
                        "egri_to": e[b]["to"], "beklenen": bk,
                        "fark": round(c - bk, 1) if bk is not None else None})
        top_g += g
        top_c += c
        top_b += bk or 0
    return {"gos": top_g, "tik": top_c, "to": to(top_c, top_g), "beklenen": round(top_b, 1),
            "fark": round(top_c - top_b, 1),
            "oran": round(top_c / top_b, 2) if top_b else None,
            "olculmeyen_gos": olculmedi, "bantlar": bantlar}


ada = beklenen("ada", egri)
ada_site_egrisi = beklenen("ada", egri_site)
kontrol = {"gos": sum(egri[b]["gos"] for b in BANTLAR), "tik": sum(egri[b]["tik"] for b in BANTLAR)}
kontrol["beklenen"] = round(sum(egri[b]["gos"] * (egri[b]["to_ham"] or 0) / 100 for b in BANTLAR), 1)
kontrol["fark"] = round(kontrol["tik"] - kontrol["beklenen"], 1)   # tanım gereği ≈ 0

aile_ozet = []
for a in AILE_AD:
    g = sum(ab[(a, b)][0] for b in BANTLAR)
    c = sum(ab[(a, b)][1] for b in BANTLAR)
    n = sum(ab[(a, b)][2] for b in BANTLAR)
    pg = sum(sum(x[4] * x[2] for x in satirlar if x[0] == a and x[1] == b) for b in BANTLAR)
    aile_ozet.append({"aile": a, "ad": AILE_AD[a], "satir": n, "gos": g, "tik": c, "to": to(c, g),
                      "poz": round(pg / g, 1) if g else None,
                      "bant_pay": {b: round(ab[(a, b)][0] * 100 / g, 1) if g else None for b in BANTLAR}})

# --- 4. ada + site aynı sorguda -----------------------------------------------
sorgu = collections.defaultdict(lambda: collections.defaultdict(lambda: [0, 0, 0.0]))  # q → aile → [gos, tik, poz×gos]
for a, b, g, c, poz, sayfa, q in satirlar:
    sorgu[q][a][0] += g
    sorgu[q][a][1] += c
    sorgu[q][a][2] += poz * g
ortak_q = [q for q, d in sorgu.items() if "ada" in d and "site" in d]
o_ada_g = sum(sorgu[q]["ada"][0] for q in ortak_q)
o_site_g = sum(sorgu[q]["site"][0] for q in ortak_q)
o_top_g = sum(sum(v[0] for v in sorgu[q].values()) for q in ortak_q)
o_ada_c = sum(sorgu[q]["ada"][1] for q in ortak_q)
o_site_c = sum(sorgu[q]["site"][1] for q in ortak_q)
ada_yalniz_q = [q for q, d in sorgu.items() if "ada" in d and "site" not in d]
# ada sayfası site sayfasının ÖNÜNDE (daha iyi ortalama konum) çıkan ortak sorgular
ada_onde_q = [q for q in ortak_q
              if sorgu[q]["ada"][2] / sorgu[q]["ada"][0] < sorgu[q]["site"][2] / sorgu[q]["site"][0]]
ornekler = sorted(ortak_q, key=lambda q: -(sorgu[q]["ada"][0] + sorgu[q]["site"][0]))[:12]
ortak = {
    "sorgu": len(ortak_q),
    "ada_gorunen_sorgu": len(ortak_q) + len(ada_yalniz_q),
    "ada_yalniz_sorgu": len(ada_yalniz_q),
    "ada_onde_sorgu": len(ada_onde_q),
    "ada_onde_gos": sum(sorgu[q]["ada"][0] for q in ada_onde_q),
    "ada_onde_tik": sum(sorgu[q]["ada"][1] for q in ada_onde_q),
    "ada_gos": o_ada_g, "site_gos": o_site_g, "toplam_gos": o_top_g,
    "ada_pay_ada_site": to(o_ada_g, o_ada_g + o_site_g, 1),   # ada / (ada+site)
    "ada_pay_toplam": to(o_ada_g, o_top_g, 1),               # ada / o sorgulardaki tüm gösterim
    "ada_tik": o_ada_c, "site_tik": o_site_c,
    "ada_to": to(o_ada_c, o_ada_g, 2), "site_to": to(o_site_c, o_site_g, 2),
    "ada_poz": round(sum(sorgu[q]["ada"][2] for q in ortak_q) / o_ada_g, 1) if o_ada_g else None,
    "site_poz": round(sum(sorgu[q]["site"][2] for q in ortak_q) / o_site_g, 1) if o_site_g else None,
    "ornekler": [{"q": q,
                  "ada_gos": sorgu[q]["ada"][0], "ada_tik": sorgu[q]["ada"][1],
                  "ada_poz": round(sorgu[q]["ada"][2] / sorgu[q]["ada"][0], 1),
                  "site_gos": sorgu[q]["site"][0], "site_tik": sorgu[q]["site"][1],
                  "site_poz": round(sorgu[q]["site"][2] / sorgu[q]["site"][0], 1)} for q in ornekler],
}

# --- 5. kapsam: sayfa×sorgu dökümü anonim sorguları içermez ----------------------
# Sayfa-yalnız toplamla kıyas: ada tıklarının yüzde kaçı dökümde görünüyor?
kapsam = None
if os.path.exists(TOPLAM):
    t_g = collections.Counter()
    t_c = collections.Counter()
    for g, c, poz, (sayfa,) in oku(TOPLAM, 1):
        if YM.search(sayfa):
            continue
        a = aile(sayfa)
        t_g[a] += g
        t_c[a] += c
    d_g = {r["aile"]: r["gos"] for r in aile_ozet}
    d_c = {r["aile"]: r["tik"] for r in aile_ozet}
    kapsam = {a: {"toplam_gos": t_g[a], "dokum_gos": d_g.get(a, 0), "gos_pay": to(d_g.get(a, 0), t_g[a], 0),
                  "toplam_tik": t_c[a], "dokum_tik": d_c.get(a, 0), "tik_pay": to(d_c.get(a, 0), t_c[a], 0)}
              for a in AILE_AD}

# --- 5b. sayfa düzeyi: tam kapsam, kaba konum ------------------------------------
# Döküm ada tıklarının küçük bir bölümünü görüyor (yukarıdaki kapsam). Sayfa-yalnız
# rapor anonim sorguları da içerir, ama konum sayfanın TÜM sorgulardaki ortalaması —
# bant daha kaba. Aynı eğri yöntemi burada da kurulur; iki bakış birlikte okunur.
sayfa_duzeyi = None
if os.path.exists(TOPLAM):
    pab = collections.defaultdict(lambda: [0, 0, 0])
    for g, c, poz, (sayfa,) in oku(TOPLAM, 1):
        if YM.search(sayfa):
            continue
        k = (aile(sayfa), bant(poz))
        pab[k][0] += g
        pab[k][1] += c
        pab[k][2] += 1

    def p_egri(aileler):
        e = {}
        for b in BANTLAR:
            g = sum(pab[(a, b)][0] for a in aileler)
            c = sum(pab[(a, b)][1] for a in aileler)
            e[b] = {"gos": g, "tik": c, "to": to(c, g), "to_ham": (c * 100 / g) if g else None}
        return e

    pe = p_egri(ADA_HARIC)
    bantlar, tb, tg, tc, olc = [], 0.0, 0, 0, 0
    for b in BANTLAR:
        g, c, n = pab[("ada", b)]
        th = pe[b]["to_ham"]
        bk = round(g * th / 100, 1) if (th is not None and g) else None
        if bk is None and g:
            olc += g
        bantlar.append({"bant": b, "sayfa": n, "gos": g, "tik": c, "to": to(c, g),
                        "egri_to": pe[b]["to"], "beklenen": bk,
                        "fark": round(c - bk, 1) if bk is not None else None})
        tg += g; tc += c; tb += bk or 0
    sayfa_duzeyi = {"egri": pe, "ada": {"sayfa": sum(pab[("ada", b)][2] for b in BANTLAR),
                    "gos": tg, "tik": tc, "to": to(tc, tg), "beklenen": round(tb, 1),
                    "fark": round(tc - tb, 1), "oran": round(tc / tb, 2) if tb else None,
                    "olculmeyen_gos": olc, "bantlar": bantlar}}

# --- 6. taban + geçmiş --------------------------------------------------------
bugun = datetime.date.today().isoformat()
kayit = {"tarih": bugun, "donem": donem,
         "ada_gos": ada["gos"], "ada_tik": ada["tik"], "ada_beklenen": ada["beklenen"], "ada_oran": ada["oran"],
         "ortak_sorgu": ortak["sorgu"], "ortak_ada_pay": ortak["ada_pay_ada_site"],
         "ortak_ada_gos": ortak["ada_gos"], "ortak_site_gos": ortak["site_gos"],
         "ortak_ada_tik": ortak["ada_tik"], "ortak_site_tik": ortak["site_tik"],
         "ortak_ada_onde_sorgu": ortak["ada_onde_sorgu"],
         "sayfa_ada_tik": sayfa_duzeyi["ada"]["tik"] if sayfa_duzeyi else None,
         "sayfa_ada_gos": sayfa_duzeyi["ada"]["gos"] if sayfa_duzeyi else None,
         "sayfa_ada_oran": sayfa_duzeyi["ada"]["oran"] if sayfa_duzeyi else None}
gecmis = []
if os.path.exists(GECMIS):
    gecmis = [json.loads(L) for L in open(GECMIS) if L.strip()]
gecmis = [k for k in gecmis if k["tarih"] != bugun]     # aynı gün yeniden çalışırsa üstüne yaz
taban = next((k for k in gecmis if k.get("taban")), None)
if taban is None:
    # İlk kayıt taban olur: PR #87 (31.08) öncesi pencere → "01.09 tabanı".
    kayit["taban"] = True
    # Etiket tarihi kayıt tarihinden gelir (02.09 denetimi: "01.09 tabanı" elle yazılıydı,
    # kayıt 02.09'daydı). Pencere PR #87 (31.08) öncesi veri günlerini kapsar.
    kayit["etiket"] = f"{datetime.date.fromisoformat(bugun).strftime('%d.%m')} tabanı (PR #87 öncesi pencere)"
    taban = kayit
gecmis.append(kayit)
gecmis.sort(key=lambda k: k["tarih"])
with open(GECMIS, "w") as f:
    for k in gecmis:
        f.write(json.dumps(k, ensure_ascii=False) + "\n")


def kiyas(k):
    if k is taban or k.get("taban"):
        return None
    return {"tarih": k["tarih"],
            "ada_pay_puan": round(k["ortak_ada_pay"] - taban["ortak_ada_pay"], 1)
            if (k["ortak_ada_pay"] is not None and taban["ortak_ada_pay"] is not None) else None,
            "ada_tik_fark": k["ada_tik"] - taban["ada_tik"],
            "ortak_sorgu_fark": k["ortak_sorgu"] - taban["ortak_sorgu"],
            "ada_onde_fark": (k.get("ortak_ada_onde_sorgu") or 0) - (taban.get("ortak_ada_onde_sorgu") or 0),
            "sayfa_ada_tik_fark": (k["sayfa_ada_tik"] - taban["sayfa_ada_tik"])
            if (k.get("sayfa_ada_tik") is not None and taban.get("sayfa_ada_tik") is not None) else None,
            "ada_oran_fark": round(k["ada_oran"] - taban["ada_oran"], 2)
            if (k["ada_oran"] is not None and taban["ada_oran"] is not None) else None}


# --- 7. yaz -------------------------------------------------------------------
DIPNOTLAR = [
    "Beklenen tık eğrisi ada HARİÇ sayfalardan kurulu; o sayfaların sapmaları tanım gereği "
    "sıfıra toplanır. Bu yüzden tabloda yalnız ada satırı okunur — “site sayfaları beklenenin "
    "üstünde” denmez, öyle bir ölçüm yok.",
    ("Sayfa×sorgu dökümü Google'ın gizlediği (anonim) sorguları içermez; bu dönemde dökümde "
     f"görünen pay ada tıklarında %{kapsam['ada']['tik_pay']:.0f}, site tıklarında "
     f"%{kapsam['site']['tik_pay']:.0f}. Beklenti tablosu görünen bölümü ölçer; tam kapsamlı "
     "ikinci bakış (sayfa düzeyi, kaba konum) ayrıca verilir.")
    if kapsam and kapsam["ada"]["tik_pay"] is not None and kapsam["site"]["tik_pay"] is not None else
    "Sayfa×sorgu dökümü Google'ın gizlediği (anonim) sorguları içermez; kapsam oranı ölçülmedi.",
    "Konum bandı satırın 28 günlük ORTALAMA konumundan; 3,2 ortalama, 1 ile 6 arasında dağılmış "
    "günlerin ortalaması olabilir. Bandlar büyüklük sırası için güvenilirdir, ondalığı için değil.",
    "Aynı sorguda iki sayfamız da çıkınca ikisi de gösterim sayar; ada payı bu çift sayımın "
    "ta kendisi, bir hata değil.",
]
cikti = {
    "guncelleme": bugun, "donem": donem, "gun": GUN,
    "kesik": kesik, "dokum_satir": ham_satir, "yenimahalle_dusulen": ym_satir, "kullanilan_satir": len(satirlar),
    "bantlar": BANTLAR,
    "egri": egri, "egri_site": egri_site,
    "aileler": aile_ozet,
    "ada": ada,
    "ada_site_egrisi": ada_site_egrisi,
    "kontrol_ada_haric": kontrol,
    "ortak": ortak,
    "kapsam": kapsam,
    "sayfa_duzeyi": sayfa_duzeyi,
    "taban": taban,
    "kiyas": [k for k in (kiyas(x) for x in gecmis) if k],
    "dipnotlar": DIPNOTLAR,
}
json.dump(cikti, open(CIKTI, "w"), ensure_ascii=False, indent=1)


# --- 8. bas -------------------------------------------------------------------
def s(n, o=0):
    if n is None:
        return "ölçülmedi"
    t = f"{n:,.{o}f}"
    return t.replace(",", "\x00").replace(".", ",").replace("\x00", ".")


print(f"Dönem {donem['bas'] if donem else '?'} → {donem['bit'] if donem else '?'} ({GUN} gün) · "
      f"döküm {s(ham_satir)} satır, Yenimahalle {s(ym_satir)} düşüldü, {s(len(satirlar))} kullanıldı"
      + ("  !! DÖKÜM 5.000 SATIRDA KESİK" if kesik else ""))
print(f"\n{'aile':38} {'satır':>6} {'gösterim':>9} {'tık':>5} {'TO':>7} {'konum':>6}   band payı (gösterim %)")
for r in aile_ozet:
    pay = " ".join(f"{b}:{s(r['bant_pay'][b], 0) if r['bant_pay'][b] is not None else '-'}" for b in BANTLAR)
    print(f"{r['ad']:38} {s(r['satir']):>6} {s(r['gos']):>9} {s(r['tik']):>5} {s(r['to'], 2):>6}% {s(r['poz'], 1):>6}   {pay}")

print(f"\nTO eğrisi (ada hariç)   " + "  ".join(f"{b}: %{s(egri[b]['to'], 2)}" for b in BANTLAR))
print(f"TO eğrisi (yalnız site) " + "  ".join(f"{b}: %{s(egri_site[b]['to'], 2)}" for b in BANTLAR))

print(f"\nADA SAYFALARI — band bandına gerçek / beklenen tık")
print(f"{'band':6} {'satır':>6} {'gösterim':>9} {'gerçek':>7} {'beklenen':>9} {'fark':>7} {'TO':>7} {'eğri':>7}")
for b in ada["bantlar"]:
    print(f"{b['bant']:6} {s(b['satir']):>6} {s(b['gos']):>9} {s(b['tik']):>7} {s(b['beklenen'], 1):>9} "
          f"{s(b['fark'], 1):>7} {s(b['to'], 2):>6}% {s(b['egri_to'], 2):>6}%")
print(f"{'TOPLAM':6} {'':>6} {s(ada['gos']):>9} {s(ada['tik']):>7} {s(ada['beklenen'], 1):>9} {s(ada['fark'], 1):>7} "
      f"{s(ada['to'], 2):>6}%")
print(f"→ ada sayfaları beklenenin {s(ada['oran'], 2)} katı tık getiriyor "
      f"(ada hariç eğri); yalnız site eğrisiyle {s(ada_site_egrisi['oran'], 2)} katı "
      f"(beklenen {s(ada_site_egrisi['beklenen'], 1)})")
if ada["olculmeyen_gos"]:
    print(f"   eğrisi olmayan bantta {s(ada['olculmeyen_gos'])} gösterim: beklenen ölçülmedi")
print(f"   kontrol — ada hariç: gerçek {s(kontrol['tik'])}, beklenen {s(kontrol['beklenen'], 1)}, "
      f"fark {s(kontrol['fark'], 1)} (tanım gereği sıfır; bu satırdan sonuç çıkarılmaz)")

print(f"\nADA + SİTE AYNI SORGUDA")
print(f"  ada sayfası görünen sorgu: {s(ortak['ada_gorunen_sorgu'])} · "
      f"bunların {s(ortak['sorgu'])} tanesinde site sayfamız da var, {s(ortak['ada_yalniz_sorgu'])} tanesinde yalnız ada")
print(f"  ortak sorguların {s(ortak['ada_onde_sorgu'])} tanesinde ada sayfası site sayfasının ÖNÜNDE "
      f"({s(ortak['ada_onde_gos'])} gösterim, {s(ortak['ada_onde_tik'])} tık)")
print(f"  ortak sorgularda gösterim: ada {s(ortak['ada_gos'])} · site {s(ortak['site_gos'])} · "
      f"ada payı %{s(ortak['ada_pay_ada_site'], 1)} (ada+site içinde), %{s(ortak['ada_pay_toplam'], 1)} (tüm sayfalar içinde)")
print(f"  ortak sorgularda tık: ada {s(ortak['ada_tik'])} (TO %{s(ortak['ada_to'], 2)}, konum {s(ortak['ada_poz'], 1)}) · "
      f"site {s(ortak['site_tik'])} (TO %{s(ortak['site_to'], 2)}, konum {s(ortak['site_poz'], 1)})")
for o in ortak["ornekler"][:8]:
    print(f"    {o['q'][:40]:40} ada {o['ada_gos']:>4} göst/{o['ada_tik']:>2} tık @{o['ada_poz']:>4} · "
          f"site {o['site_gos']:>4} göst/{o['site_tik']:>2} tık @{o['site_poz']:>4}")

if kapsam:
    print(f"\nKAPSAM (döküm / sayfa-yalnız rapor): " +
          " · ".join(f"{a} gösterim %{s(kapsam[a]['gos_pay'])} tık %{s(kapsam[a]['tik_pay'])}"
                     for a in ("ada", "site")))
if sayfa_duzeyi:
    sd = sayfa_duzeyi["ada"]
    print(f"\nİKİNCİ BAKIŞ — sayfa düzeyi (anonim sorgular dahil, konum sayfa ortalaması)")
    print(f"  eğri (ada hariç) " + "  ".join(f"{b}: %{s(sayfa_duzeyi['egri'][b]['to'], 2)}" for b in BANTLAR))
    print(f"  {'band':6} {'sayfa':>6} {'gösterim':>9} {'gerçek':>7} {'beklenen':>9} {'fark':>7} {'TO':>7} {'eğri':>7}")
    for b in sd["bantlar"]:
        print(f"  {b['bant']:6} {s(b['sayfa']):>6} {s(b['gos']):>9} {s(b['tik']):>7} {s(b['beklenen'], 1):>9} "
              f"{s(b['fark'], 1):>7} {s(b['to'], 2):>6}% {s(b['egri_to'], 2):>6}%")
    print(f"  {'TOPLAM':6} {s(sd['sayfa']):>6} {s(sd['gos']):>9} {s(sd['tik']):>7} {s(sd['beklenen'], 1):>9} "
          f"{s(sd['fark'], 1):>7} {s(sd['to'], 2):>6}%")
    print(f"  → sayfa düzeyinde ada sayfaları beklenenin {s(sd['oran'], 2)} katı")
print(f"\nTaban: {taban['tarih']} — {taban.get('etiket', '')} · ada tık {s(taban['ada_tik'])}, "
      f"ortak sorgu {s(taban['ortak_sorgu'])}, ada payı %{s(taban['ortak_ada_pay'], 1)}")
for k in cikti["kiyas"]:
    print(f"  {k['tarih']}: ada payı {k['ada_pay_puan']:+} puan · ada tık {k['ada_tik_fark']:+} · "
          f"ortak sorgu {k['ortak_sorgu_fark']:+} · ada önde {k['ada_onde_fark']:+} · oran {k['ada_oran_fark']:+}")
print(f"\nyazıldı: {CIKTI}")
