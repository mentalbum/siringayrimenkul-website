#!/usr/bin/env python3
"""Site kayıtlarının görünür metinlerinde (aciklama + ozellikler) yasak dil denetimi.

Kullanım: python3 scripts/dil-qa.py   (HATA varsa çıkış kodu 1)

Neden var: 2026-08-07'de alıcı dili 28 kayıttan söküldü (a815239/c01b09f);
aynı gün iki ayrı zenginleştirme paketi yasak kalıbı yeniden sızdırdı
("alternatif arayan alıcı ve kiracılar", taşınan eski alıcı cümlesi).
İçerik yazan her oturum commit'ten önce bu betiği çalıştırmalı.

Kurallar (Özgün'ün kararları):
  HATA — düzeltilmeden commit edilmez:
    - "alıcı" kelimesi: hedef kitle ev sahibi; alıcı ancak süreç anlatımında
      karşı taraf olarak blog/araç sayfalarında geçebilir, site kayıtlarında hiç.
      (Kelime sınırı Türkçe harf duyarlı: "akılda kalıcı" eşleşmez.)
    - "krediye uygun" tarzı kredi iddiası: her dairenin kredi durumu farklı.
    - "ücretsiz değerleme/ekspertiz": değerleme bedava hizmet olarak sunulmaz.
    - TL/₺ tutarı: güncel piyasa fiyatı siteye yazılmaz (enflasyonda bayatlar).
    - "kule": 'yüksek katlı blok/yapı' denir; site ADINDA geçiyorsa serbest
      (kaydın kendi adı ya da bilinen komşu site adı, örn. Bulut Kule).
  UYARI — gözden geçir, her zaman hata değil:
    - Çıplak 5 haneli ada/parsel görünümlü sayı: görünür metne ada/parsel
      numarası yazılmaz (ada SAYFALARI istisna). Posta kodları ("posta kodu"
      bağlamı) ve adı ada numarası içeren kayıtlar (Kur Sitesi 46495 Ada) hariç.
"""
import glob
import json
import re
import sys

HARF = "a-zA-ZçğıöşüÇĞİÖŞÜ"
# Adında "kule" geçen komşu siteler metinde adlarıyla anılabilir; gerekirse genişlet.
BILINEN_KULE_ADLARI = ["bulut kule"]

HATA_KURALLARI = [
    ("alıcı dili", re.compile(rf"(?<![{HARF}])alıcı", re.I)),
    ("kredi iddiası", re.compile(r"krediye uygun|kredisi çıkar", re.I)),
    ("bedava değerleme", re.compile(r"ücretsiz (değerleme|ekspertiz)", re.I)),
    ("fiyat rakamı", re.compile(r"\d[\d.,]*\s*(?:TL\b|₺)")),
    ("kule", re.compile(rf"(?<![{HARF}])kule", re.I)),
]
ADA_GORUNUMU = re.compile(r"(?<![\d.,/])\d{5}(?:/\d+)?(?![\d.,])")


def baglam(metin, m, gen=45):
    return metin[max(0, m.start() - gen) : m.end() + gen].replace("\n", " ")


hata, uyari = [], []
for dosya in sorted(glob.glob("content/siteler/*/*.json")):
    kayit = json.load(open(dosya, encoding="utf-8"))
    isim = kayit.get("isim", "").lower()
    metin = kayit.get("aciklama", "") + " | " + " | ".join(kayit.get("ozellikler") or [])
    kisa = dosya.split("content/siteler/")[1]

    for ad, kural in HATA_KURALLARI:
        for m in kural.finditer(metin):
            if ad == "kule":
                if "kule" in isim:
                    continue
                cevre = metin[max(0, m.start() - 20) : m.end()].lower()
                if any(k in cevre for k in BILINEN_KULE_ADLARI):
                    continue
            hata.append((ad, kisa, baglam(metin, m)))

    for m in ADA_GORUNUMU.finditer(metin):
        if m.group().split("/")[0] in isim:
            continue
        # "posta kodu 06793" da "06793 posta koduyla" da meşru adres bilgisidir.
        if "posta kodu" in baglam(metin, m).lower():
            continue
        # Adı ada numarası taşıyan komşu site anılabilir: "Kur Sitesi 46496 Ada".
        if metin[m.end() : m.end() + 4] == " Ada" and "sitesi" in metin[max(0, m.start() - 20) : m.start()].lower():
            continue
        uyari.append(("çıplak ada/parsel no", kisa, baglam(metin, m)))

for etiket, liste in [("HATA", hata), ("UYARI", uyari)]:
    if liste:
        print(f"{etiket}: {len(liste)}")
        for ad, kisa, ctx in liste:
            print(f"  [{ad}] {kisa}\n      …{ctx}…")
print(f"Tarama: {len(glob.glob('content/siteler/*/*.json'))} kayıt — "
      f"{len(hata)} hata, {len(uyari)} uyarı")
sys.exit(1 if hata else 0)
