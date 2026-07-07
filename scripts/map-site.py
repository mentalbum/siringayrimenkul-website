#!/usr/bin/env python3
"""Bir siteyi TKGM parseliyle haritalar — doğrulama kapısıyla.

Kullanım:
    python3 scripts/map-site.py <mahalle-slug> <site-slug> <lat> <lng> [--force]

<lat>/<lng> sitenin Google Maps pinidir. Script:
  1. TKGM CBS API'sinden parseli çeker (pin yol/boşluğa düşerse birkaç küçük
     offset dener — 404/500'de otomatik).
  2. DOĞRULAMA KAPISI (yazmadan önce):
       a) Çakışma: bu ada/parsel repoda BAŞKA bir siteye atanmış mı?
       b) Sınır: parsel merkezi mahalle sınırının içinde mi?
       c) Kadastro mahallesi (bilgi amaçlı — idari mahalleden farklı olabilir).
     (a) veya (b) başarısızsa DOSYAYI YAZMAZ, "FLAG" basıp çıkar (kod 2).
     Elle doğruladıysan --force ile geç.
  3. Geçerse: <slug>-boundary.geojson + site json'unu yazar.

Not: Çıktı makine-okur — "OK ..." başarı, "FLAG ..." elle bakılmalı,
"SORUN ..." teknik hata.
"""
import json, os, sys, math, glob, urllib.request

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITELER = os.path.join(REPO, "content", "siteler")
MAHALLELER = os.path.join(REPO, "content", "mahalleler")
KAYNAK = ("TKGM Parsel Sorgu (CBS) verisine dayalıdır; bilgilendirme amaçlıdır, "
          "resmi kadastro belgesi yerine geçmez.")
# 404/500'de denenecek küçük kaymalar (~20-30 m): merkez, K, G, D, B, çaprazlar.
OFFSETS = [(0, 0), (0.0002, 0), (-0.0002, 0), (0, 0.00025), (0, -0.00025),
           (0.0002, 0.00025), (-0.0002, -0.00025)]


def tkgm(lat, lng):
    url = f"https://cbsapi.tkgm.gov.tr/megsiswebapi.v3/api/parsel/{lat}/{lng}"
    try:
        with urllib.request.urlopen(url, timeout=20) as r:
            d = json.loads(r.read().decode())
        return d if isinstance(d, dict) and d.get("type") == "Feature" else None
    except Exception:
        return None


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
    inside = False
    n = len(ring)
    j = n - 1
    for i in range(n):
        xi, yi = ring[i]; xj, yj = ring[j]
        if ((yi > y) != (yj > y)) and (x < (xj - xi) * (y - yi) / (yj - yi) + xi):
            inside = not inside
        j = i
    return inside


def existing_parsel_owner(ada_parsel, mahalle, self_slug):
    """ada_parsel'i (örn '46659/2') zaten kullanan BAŞKA site slug'ı varsa döner."""
    for bpath in glob.glob(os.path.join(SITELER, "*", "*-boundary.geojson")):
        slug = os.path.basename(bpath)[:-len("-boundary.geojson")]
        m = os.path.basename(os.path.dirname(bpath))
        if m == mahalle and slug == self_slug:
            continue
        try:
            adalar = json.load(open(bpath)).get("properties", {}).get("adalar", [])
        except Exception:
            continue
        if ada_parsel in adalar:
            return f"{m}/{slug}"
    return None


def main():
    args = [a for a in sys.argv[1:] if a != "--force"]
    force = "--force" in sys.argv
    if len(args) != 4:
        print("KULLANIM: map-site.py <mahalle> <slug> <lat> <lng> [--force]")
        sys.exit(1)
    mahalle, slug, lat, lng = args
    site_path = os.path.join(SITELER, mahalle, f"{slug}.json")
    if not os.path.exists(site_path):
        print(f"SORUN: site json yok: {site_path}"); sys.exit(1)
    site = json.load(open(site_path))

    tk = None
    used = (lat, lng)
    for dlat, dlng in OFFSETS:
        tk = tkgm(float(lat) + dlat, float(lng) + dlng)
        if tk:
            used = (float(lat) + dlat, float(lng) + dlng)
            break
    if not tk:
        print("FLAG: parsel bulunamadı (offset'ler de tutmadı) — pin yeniden bakılmalı")
        sys.exit(2)

    p = tk["properties"]
    ada_parsel = f"{p['adaNo']}/{p['parselNo']}"
    geom = tk["geometry"]
    if geom["type"] == "Polygon":
        geom = {"type": "MultiPolygon", "coordinates": [geom["coordinates"]]}

    # --- DOĞRULAMA KAPISI ---
    problems = []
    owner = existing_parsel_owner(ada_parsel, mahalle, slug)
    if owner:
        problems.append(f"ÇAKIŞMA: {ada_parsel} zaten {owner}'a atanmış (duplicate/parça?)")

    clng, clat = centroid(rings(geom)[0])
    mb_path = os.path.join(MAHALLELER, f"{mahalle}-boundary.geojson")
    if os.path.exists(mb_path):
        mb = json.load(open(mb_path))
        inside = any(point_in_ring(clng, clat, r) for r in rings(mb["geometry"]))
        if not inside:
            problems.append(f"SINIR DIŞI: parsel merkezi {mahalle} sınırının dışında "
                            f"(kadastro: {p['mahalleAd']})")

    if problems and not force:
        for pr in problems:
            print(f"FLAG: {pr}")
        print(f"  (bilgi: {site['isim']} -> {ada_parsel} | kadastro {p['mahalleAd']} | "
              f"alan {p['alan']}) — elle doğruladıysan --force ile geç")
        sys.exit(2)

    # --- YAZ ---
    boundary = {
        "type": "Feature",
        "properties": {"isim": site["isim"], "kaynak": KAYNAK, "adalar": [ada_parsel]},
        "geometry": geom,
    }
    bpath = os.path.join(SITELER, mahalle, f"{slug}-boundary.geojson")
    with open(bpath, "w") as f:
        json.dump(boundary, f, ensure_ascii=False, indent=1); f.write("\n")

    yeni = {
        "isim": site["isim"], "slug": site["slug"], "mahalleSlug": site["mahalleSlug"],
        "koordinat": {"lat": used[0], "lng": used[1]},
        "sinirGeoJSON": f"siteler/{mahalle}/{slug}-boundary.geojson",
        "aciklama": site["aciklama"],
        "adalar": [{"no": p["adaNo"], "parsel": p["parselNo"]}],
    }
    for k, v in site.items():
        if k not in yeni:
            yeni[k] = v
    with open(site_path, "w") as f:
        json.dump(yeni, f, ensure_ascii=False, indent=2); f.write("\n")

    nitelik = p["nitelik"][:42].replace("\n", " ").replace("\r", " ")
    flag = "  ✓ mahalle içinde · ✓ çakışma yok" + ("  (FORCE)" if force and problems else "")
    print(f"OK {site['isim']} -> {ada_parsel} | kadastro: {p['mahalleAd']} | "
          f"alan: {p['alan']} | {nitelik}\n{flag}")


if __name__ == "__main__":
    main()
