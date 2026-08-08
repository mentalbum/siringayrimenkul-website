#!/usr/bin/env python3
"""Autocomplete sonuçları → popülerlik sinyali, tohum yanlılığı düzeltilmiş.

İki ayrı ölçüt:
  A) SAF SIRA: sadece tohum köklerden (harf/ek eklenmemiş) gelen öneriler.
     Google'ın bu sırası doğrudan popülerlik sırasıdır.
  B) EVREN: tüm genişletmelerden çıkan sorgu havuzu — hacim iddiası yok,
     "hangi temalar/nitelemeler var" haritası.
"""
import json, re, sys, os, collections, math

S = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, S)
from suggest import TOHUMLAR

YER = re.compile(r"eryaman|etimesgut|elvankent|yeni ?batı|susuz|göksu|goksu|govenlik", re.I)
GURULTU = re.compile(r"esenyurt|beylikdüzü|beylikduzu|başakşehir|basaksehir|"
                     r"\bistanbul\b|\bizmir\b|\bbursa\b|antalya|tuzla|ispartakule|"
                     r"kayaşehir|kayasehir|emlak konut", re.I)

NIYET = [
    ("EV SAHİBİ — satmak / kiraya vermek / değerleme",
     re.compile(r"(satmak|nasıl satılır|satılır mı|kiraya ver|değerleme|değeri ne|kaç para eder|"
                r"ekspertiz|komisyon|yetki belge|vekalet|satış vaadi|tapu devri|"
                r"evimi|dairemi|evini sat)", re.I)),
    ("EMLAKÇI / OFİS arayan",
     re.compile(r"emlak[çc][ıi]|emlak ofis|emlak büro|emlak firma|gayrimenkul (ofis|firma|şirket|danışman)|"
                r"danışman|en iyi emlak|güvenilir emlak|emlak yorum|şikayet|emlakçılar|emlak ofisleri", re.I)),
    ("SATILIK mülk arayan",
     re.compile(r"satılık|satilik|satın al", re.I)),
    ("KİRALIK mülk arayan",
     re.compile(r"kiralık|kiralik|kira(sı|lar|lık)?\b", re.I)),
    ("FİYAT / piyasa araştırması",
     re.compile(r"fiyat|kaç (tl|lira|para)|\bm2\b|metrekare|ne kadar|ucuz|pahalı|artış|yatırım|"
                r"değer(i|li|lenme)?\b|ortalama", re.I)),
    ("SİTE / proje / etap adı",
     re.compile(r"\b(sitesi|siteleri|etap|rezidans|residence|konutları|toplu konut|blok|kooperatif)\b", re.I)),
    ("SEMT / yaşam araştırması",
     re.compile(r"nasıl bir yer|yaşamak|oturmak|nerede|hangi (ilçe|semt|mahalle)|ulaşım|metro|okul|"
                r"hastane|güvenli mi|iyi mi|taşınmak|neresi|hangi ilde", re.I)),
    ("TİCARİ (dükkan / iş yeri / arsa)",
     re.compile(r"dükkan|dukkan|iş ?yeri|isyeri|arsa|arazi|depo|fabrika|mağaza|ofis kat", re.I)),
    ("EMLAK VERGİSİ / resmi işlem",
     re.compile(r"emlak vergisi|vergi (öde|borc|borç|sorgula|muafiyet)|belediye|beyan", re.I)),
]
def niyet(q):
    for ad, rx in NIYET:
        if rx.search(q): return ad
    return "Diğer"

def yukle():
    kayitlar = []
    for p in ("sonuclar.jsonl", "sonuclar2.jsonl", "sonuclar3.jsonl"):
        fp = os.path.join(S, p)
        if not os.path.exists(fp): continue
        for l in open(fp, encoding="utf-8"):
            try: kayitlar.append(json.loads(l))
            except Exception: pass
    # aynı kök iki dosyada varsa tekilleştir
    g, out = set(), []
    for k in kayitlar:
        if k["kok"] in g: continue
        g.add(k["kok"]); out.append(k)
    return out

def alakali(q):
    return bool(YER.search(q)) and not GURULTU.search(q)

def main():
    kayitlar = yukle()
    tohum_set = set(TOHUMLAR)

    # ---------- A) SAF SIRA ----------
    saf = collections.defaultdict(lambda: {"gorulme":0, "en_iyi_poz":99, "max_rel":0, "kokler":[]})
    for k in kayitlar:
        if k["kok"] not in tohum_set: continue
        for i, o in enumerate(k["oneriler"]):
            q = o["sorgu"].strip().lower()
            if not alakali(q): continue
            d = saf[q]
            d["gorulme"] += 1
            d["en_iyi_poz"] = min(d["en_iyi_poz"], i)
            d["max_rel"] = max(d["max_rel"], o.get("relevance") or 0)
            d["kokler"].append(f"{k['kok']}#{i}")
    saf_l = [{"sorgu":q, "en_iyi_poz":d["en_iyi_poz"], "gorulme":d["gorulme"],
              "max_rel":d["max_rel"], "niyet":niyet(q),
              "skor": round(d["gorulme"] / (1 + d["en_iyi_poz"]) * (1 + d["max_rel"]/1300), 2),
              "kokler": d["kokler"][:6]}
             for q, d in saf.items()]
    saf_l.sort(key=lambda r: -r["skor"])

    # ---------- B) EVREN ----------
    ev = collections.defaultdict(lambda: {"gorulme":0, "en_iyi_poz":99, "max_rel":0, "kok_sayisi":set()})
    for k in kayitlar:
        kok_kelime = len(k["kok"].split())
        for i, o in enumerate(k["oneriler"]):
            q = o["sorgu"].strip().lower()
            if not alakali(q): continue
            d = ev[q]
            d["gorulme"] += 1
            d["en_iyi_poz"] = min(d["en_iyi_poz"], i)
            d["max_rel"] = max(d["max_rel"], o.get("relevance") or 0)
            d["kok_sayisi"].add(k["kok"])
    ev_l = [{"sorgu":q, "gorulme":d["gorulme"], "en_iyi_poz":d["en_iyi_poz"],
             "max_rel":d["max_rel"], "kok":len(d["kok_sayisi"]), "niyet":niyet(q)}
            for q, d in ev.items()]
    # yaygınlık log-bastırmalı, üst-sıra ağırlıklı
    for r in ev_l:
        r["skor"] = round(math.log1p(r["kok"]) * (1/(1+r["en_iyi_poz"])) * (1 + r["max_rel"]/1300), 3)
    ev_l.sort(key=lambda r: -r["skor"])

    json.dump({"saf": saf_l, "evren": ev_l}, open(os.path.join(S,"analiz2.json"),"w",encoding="utf-8"),
              ensure_ascii=False, indent=1)

    print(f"# {len(kayitlar)} kök sorgu tarandı → {len(ev)} tekil Eryaman/çevre sorgusu\n")
    print(f"# Tohum köklerden gelen saf öneri: {len(saf_l)}\n")

    print("="*90)
    print("A) SAF SIRA — Google'ın tohum sorgularda en üste koyduğu aramalar")
    print("   (poz=0 → Google'ın o kök için 1. önerisi; en güvenilir popülerlik sinyali)")
    print("="*90)
    print(f"{'#':>3} {'skor':>6} {'poz':>4} {'rel':>5}  sorgu")
    for i, r in enumerate(saf_l[:70], 1):
        print(f"{i:>3} {r['skor']:>6} {r['en_iyi_poz']:>4} {r['max_rel']:>5}  {r['sorgu']}")

    print("\n\n" + "="*90)
    print("A2) ELİT — Google relevance >= 1250 VE ilk 3 öneride (en yüksek güven)")
    print("="*90)
    elit = [r for r in ev_l if r["max_rel"] >= 1250 and r["en_iyi_poz"] <= 2]
    elit.sort(key=lambda r: (r["en_iyi_poz"], -r["max_rel"]))
    print(f"   {len(elit)} sorgu")
    gr_e = collections.defaultdict(list)
    for r in elit: gr_e[r["niyet"]].append(r)
    for ad, _ in NIYET:
        lst = gr_e.get(ad, [])
        if not lst: continue
        print(f"\n  ## {ad}  ({len(lst)})")
        for r in lst[:25]:
            print(f"     poz{r['en_iyi_poz']} rel{r['max_rel']}  {r['sorgu']}")
    if gr_e.get("Diğer"):
        print(f"\n  ## Diğer ({len(gr_e['Diğer'])})")
        for r in gr_e["Diğer"][:12]: print(f"     poz{r['en_iyi_poz']} rel{r['max_rel']}  {r['sorgu']}")

    print("\n\n" + "="*90)
    print("B) NİYET KIRILIMI (tüm evren)")
    print("="*90)
    gr = collections.defaultdict(list)
    for r in ev_l: gr[r["niyet"]].append(r)
    toplam = len(ev_l)
    for ad, _ in NIYET:
        lst = gr.get(ad, [])
        if not lst: continue
        print(f"\n### {ad}  —  {len(lst)} sorgu (%{100*len(lst)/toplam:.1f})")
        for r in lst[:20]:
            print(f"     {r['skor']:>6}  {r['sorgu']}")
    if gr.get("Diğer"):
        print(f"\n### Diğer — {len(gr['Diğer'])} sorgu")
        for r in gr["Diğer"][:15]: print(f"     {r['skor']:>6}  {r['sorgu']}")

    print("\n\n" + "="*90)
    print("C) SIK GEÇEN NİTELEYİCİLER")
    print("="*90)
    dur = set("eryaman ankara etimesgut elvankent ile için bir bu mahallesi".split())
    kf = collections.Counter()
    for r in ev_l:
        for w in re.findall(r"[a-zçğıöşü0-9\+]+", r["sorgu"]):
            if w not in dur and len(w) > 2: kf[w] += 1
    kols = kf.most_common(60)
    for i in range(0, len(kols), 3):
        print("   " + "".join(f"{c:>5} {w:<22}" for w, c in kols[i:i+3]))

if __name__ == "__main__":
    main()
