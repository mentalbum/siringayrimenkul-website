#!/usr/bin/env python3
"""Haritalı tüm sitelerin toplu kalite denetimi.

Kullanım: python3 scripts/map-qa.py

Kontroller:
  ANOMALİ (gözden geçir):
    - Parsel merkezi mahalle sınırının dışında
    - Parsel merkezi mahalle merkezinden >4 km
    - Google Maps pini (site.koordinat) parsel merkezinden >350 m uzak
  BİLGİ (illa hata değil):
    - Aynı ada/parsel birden çok siteye atanmış (paylaşımlı parsel — Devlet'in
      kooperatif parselleri gibi kasıtlı olabilir; yeni eklenenlerde çakışma
      da olabilir, ona göre bak).
"""
import json, os, glob, math

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITELER = os.path.join(REPO, "content", "siteler")
MAHALLELER = os.path.join(REPO, "content", "mahalleler")

# Mahalle sınırı dışında kalan ama BİLEREK o mahallede tutulan parseller.
# content/mahalleler/*-boundary.geojson OSM kaynaklı ve kaba: ilçe/mahalle
# sınırı yer yer parsellerin içinden geçiyor. Hakem OSM çizgisi değil, TKGM
# (ilçe) + KEOS numarataj/mahalle kaydı (bellek kuralı: "pin değil
# numarataj"). Buraya yalnız o teyitle girilir; gerekçe yanında yazılır.
# 20.10.2026: map-qa 26.07 slug taşımasından beri bu kontrolü hiç çalıştır-
# mamıştı (dosya adı '<slug>-boundary.geojson' aranıyordu, gerçek ad
# 'goksu-boundary.geojson'); yol artık mahalle JSON'undaki sinirGeoJSON'dan
# kuruluyor. Kontrol açılınca dışarıda görünen 7 kayıt aşağıda.
SINIR_DISI_BILINEN = {
    # 20.10 KEOS turu öncesi var olan kayıtlar — OSM sınırı parseli dışarıda
    # bırakıyor, KEOS mahalle kaydı/komşuluk kayıtları o mahallede tutuyor.
    "eryaman-mahallesi/maximum-konutlari",
    "eryaman-mahallesi/turk-konut-calisanlar-sitesi",
    "goksu-mahallesi/ma1-tower",
    "goksu-mahallesi/maybak-konutlari",
    "sehit-osman-avci-mahallesi/izo-ser-residence",
    "seyh-samil-mahallesi/ozahikent-sitesi",   # 9. halka sınır çizgisinin üstünde
    # 20.10: TKGM ilçe=Etimesgut (Susuz Yenimahalle'de); OSM Göksu çizgisi
    # parseli ikiye bölüyor. Gerekçe: pws0/KAPSAM-BELIRSIZ-2010.md.
    "goksu-mahallesi/cag-life-sitesi",
}


def rings(geom):
    t, c = geom["type"], geom["coordinates"]
    if t == "Polygon":
        return [c[0]]
    if t == "MultiPolygon":
        return [poly[0] for poly in c]
    return []


def centroid(ring):
    a = cx = cy = 0.0
    for i in range(len(ring) - 1):
        x0, y0 = ring[i]; x1, y1 = ring[i + 1]
        cr = x0 * y1 - x1 * y0
        a += cr; cx += (x0 + x1) * cr; cy += (y0 + y1) * cr
    if a == 0:
        xs = [p[0] for p in ring]; ys = [p[1] for p in ring]
        return sum(xs) / len(xs), sum(ys) / len(ys)
    a *= 0.5
    return cx / (6 * a), cy / (6 * a)


def point_in_ring(x, y, ring):
    inside = False; n = len(ring); j = n - 1
    for i in range(n):
        xi, yi = ring[i]; xj, yj = ring[j]
        if ((yi > y) != (yj > y)) and (x < (xj - xi) * (y - yi) / (yj - yi) + xi):
            inside = not inside
        j = i
    return inside


def haversine(lat1, lng1, lat2, lng2):
    R = 6371000; p = math.pi / 180
    dlat = (lat2 - lat1) * p; dlng = (lng2 - lng1) * p
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(lat1 * p) * math.cos(lat2 * p) * math.sin(dlng / 2) ** 2)
    return 2 * R * math.asin(math.sqrt(a))


def main():
    anomalies = []
    parsel_owners = {}   # "mahalle:46659/2" -> [site slugs]
    total = 0

    for mfile in sorted(glob.glob(os.path.join(MAHALLELER, "*.json"))):
        m = json.load(open(mfile)); mslug = m["slug"]
        mc = m.get("merkezKoordinat", {})
        mlat, mlng = mc.get("lat"), mc.get("lng")
        # Sınır dosyasının adı slug'dan türetilmez ('goksu-mahallesi' →
        # 'goksu-boundary.geojson'); mahalle JSON'u söyler.
        mb_path = os.path.join(REPO, "content", m.get("sinirGeoJSON", ""))
        if m.get("sinirGeoJSON") and os.path.exists(mb_path):
            mb_rings = rings(json.load(open(mb_path))["geometry"])
        else:
            mb_rings = []
            print(f"UYARI: {mslug} mahalle sınırı yok ({m.get('sinirGeoJSON')}) — sınır kontrolü atlandı")

        for sfile in sorted(glob.glob(os.path.join(SITELER, mslug, "*.json"))):
            slug = os.path.basename(sfile)[:-5]
            bpath = sfile[:-5] + "-boundary.geojson"
            if not os.path.exists(bpath):
                continue
            total += 1
            s = json.load(open(sfile))
            b = json.load(open(bpath))
            b_adalar = list(b.get("properties", {}).get("adalar", []))
            for ada in b_adalar:
                parsel_owners.setdefault(f"{mslug}:{ada}", []).append(slug)
            rs = rings(b["geometry"])
            if not rs:
                anomalies.append((mslug, s["isim"], "geometri yok")); continue
            # Künye JSON'u ile sınır dosyası AYNI parselleri saymalı (2026-08-12
            # süpürmesi: 8 kayıtta JSON düzeltilmiş, geojson eski parselde kalmıştı —
            # Karma Modern reddedilen 46656/5'i, Güzel Ev komşusunun parselini çiziyordu).
            # Sınır dosyasının adalar listesi halka sayısıyla da hizalı olmalı: harita
            # etiketleri halka sırasından okunur.
            j_adalar = {f"{a['no']}/{a.get('parsel') or '1'}" for a in s.get("adalar") or []}
            if j_adalar != set(b_adalar):
                anomalies.append((mslug, s["isim"],
                                  f"JSON {sorted(j_adalar)} ≠ geojson {sorted(b_adalar)}"))
            if len(rs) != len(b_adalar):
                anomalies.append((mslug, s["isim"], f"{len(rs)} halka, {len(b_adalar)} etiket"))
            clng, clat = centroid(rs[0])
            # Her halkanın merkezi ayrı sınanır (çok parselli kayıtlarda tek bir
            # halka yanlış mahalleye kayabilir); bilinen sınır-üstü kayıtlar
            # SINIR_DISI_BILINEN ile susturulur, listeden çıkınca yeniden ötmeye başlar.
            if mb_rings and f"{mslug}/{slug}" not in SINIR_DISI_BILINEN:
                disarida = [
                    i for i, r in enumerate(rs)
                    if not any(point_in_ring(*centroid(r), mr) for mr in mb_rings)
                ]
                if disarida:
                    etiket = ", ".join(b_adalar[i] if i < len(b_adalar) else f"halka {i}" for i in disarida)
                    anomalies.append((mslug, s["isim"], f"parsel merkezi mahalle sınırı DIŞINDA ({etiket})"))
            if mlat:
                d = haversine(mlat, mlng, clat, clng)
                if d > 4000:
                    anomalies.append((mslug, s["isim"], f"mahalle merkezine {d/1000:.1f} km"))
            k = s.get("koordinat", {})
            if k.get("lat"):
                pd = haversine(k["lat"], k["lng"], clat, clng)
                if pd > 350:
                    anomalies.append((mslug, s["isim"], f"Maps pini parselden {pd:.0f} m uzak"))

    shared = {k: v for k, v in parsel_owners.items() if len(v) > 1}
    print(f"Haritalı site: {total}")
    print(f"ANOMALİ: {len(anomalies)}")
    for mslug, isim, r in anomalies:
        print(f"  [{mslug}] {isim} — {r}")
    print(f"\nPAYLAŞIMLI PARSEL (bilgi, {len(shared)}):")
    for k, v in sorted(shared.items()):
        print(f"  {k} -> {', '.join(v)}")


if __name__ == "__main__":
    main()
