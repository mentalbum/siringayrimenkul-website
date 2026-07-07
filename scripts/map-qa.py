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
        mb_path = os.path.join(MAHALLELER, f"{mslug}-boundary.geojson")
        mb_rings = rings(json.load(open(mb_path))["geometry"]) if os.path.exists(mb_path) else []

        for sfile in sorted(glob.glob(os.path.join(SITELER, mslug, "*.json"))):
            slug = os.path.basename(sfile)[:-5]
            bpath = sfile[:-5] + "-boundary.geojson"
            if not os.path.exists(bpath):
                continue
            total += 1
            s = json.load(open(sfile))
            b = json.load(open(bpath))
            for ada in b.get("properties", {}).get("adalar", []):
                parsel_owners.setdefault(f"{mslug}:{ada}", []).append(slug)
            rs = rings(b["geometry"])
            if not rs:
                anomalies.append((mslug, s["isim"], "geometri yok")); continue
            clng, clat = centroid(rs[0])
            if mb_rings and not any(point_in_ring(clng, clat, r) for r in mb_rings):
                anomalies.append((mslug, s["isim"], "parsel merkezi mahalle sınırı DIŞINDA"))
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
