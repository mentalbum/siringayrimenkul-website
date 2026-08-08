#!/usr/bin/env python3
"""Analiz sonucundan teslim edilebilir dosyalar üret."""
import json, os, csv, re, collections

S = os.path.dirname(os.path.abspath(__file__))
d = json.load(open(os.path.join(S, "analiz2.json"), encoding="utf-8"))
ev = d["evren"]

# 1) Tam CSV — Excel'de süzülebilir
with open(os.path.join(S, "eryaman-arama-sorgulari-TAM.csv"), "w", newline="", encoding="utf-8-sig") as f:
    w = csv.writer(f)
    w.writerow(["sorgu", "niyet", "skor", "google_ilk_pozisyon", "google_relevance",
                "kac_kokte_onerildi"])
    for r in ev:
        w.writerow([r["sorgu"], r["niyet"], r["skor"], r["en_iyi_poz"], r["max_rel"], r["kok"]])

# 2) Keyword Planner'a yüklenecek liste: Google'ın yüksek-güven işaretlediği + üst sıra
#    (Planner 1000 satıra kadar alıyor; gürültüyü baştan atıyoruz)
DISLA = re.compile(r"taksi|kebap|hamburger|lahmacun|yemek|çilingir|dekorasyon|temizlik|temizliği|"
                   r"korniş|iş ilan|kyk|yurdu|hava durumu|\bhava\b|hastane|noter|pazar|çarşı|"
                   r"sağlık ocağı|park|nöbetçi|eczane|berber|kuaför|dövme|diş|cafe|kahve|"
                   r"araç|otomobil|oto |apart|günlük", re.I)
sec = [r for r in ev
       if not DISLA.search(r["sorgu"])
       and (r["max_rel"] >= 600 or r["en_iyi_poz"] <= 3)
       and r["niyet"] != "EMLAK VERGİSİ / resmi işlem"]
sec.sort(key=lambda r: -r["skor"])
sec = sec[:900]
with open(os.path.join(S, "keyword-planner-yukle.csv"), "w", newline="", encoding="utf-8-sig") as f:
    w = csv.writer(f)
    w.writerow(["Keyword"])
    for r in sec:
        w.writerow([r["sorgu"]])

# 3) Tema özeti
gr = collections.Counter(r["niyet"] for r in ev)
print("Toplam tekil sorgu:", len(ev))
for k, v in gr.most_common():
    print(f"  {v:>5}  %{100*v/len(ev):>4.1f}  {k}")
print("\nKeyword Planner listesi:", len(sec), "sorgu")

# 4) Niteleyici sayımları (raporda kullanılacak)
def say(rx):
    p = re.compile(rx, re.I)
    return sum(1 for r in ev if p.search(r["sorgu"]))
print("\nNiteleyici sayımları (tekil sorgu içinde):")
for ad, rx in [
    ("sahibinden", r"sahibinden"), ("eşyalı", r"eşyalı|esyali"),
    ("günlük kiralık", r"günlük"), ("etap", r"\betap"),
    ("2+1 / 2 1", r"2\s*\+?\s*1"), ("3+1 / 3 1", r"3\s*\+?\s*1"),
    ("1+1 / 1 1", r"1\s*\+?\s*1"), ("4+1 / 4 1", r"4\s*\+?\s*1"),
    ("kentsel dönüşüm", r"kentsel dönüşüm"), ("site adı arama", r"site (isim|ad)|siteleri|sitesi"),
    ("rezidans", r"rezidans|residence"), ("okul", r"okul|anaokul|lise|üniversite"),
    ("metro/ulaşım", r"metro|otobüs|ulaşım|yht|tren"),
    ("yeni batı", r"yeni ?batı"), ("susuz", r"susuz"), ("göksu", r"göksu|goksu"),
    ("villa", r"villa"), ("dükkan/işyeri", r"dükkan|iş ?yeri|isyeri"),
    ("arsa", r"arsa|arazi"), ("fiyat", r"fiyat|kaç (tl|para|lira)|ne kadar"),
]:
    print(f"  {say(rx):>5}  {ad}")
