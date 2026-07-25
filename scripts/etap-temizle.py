#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Site kayıtlarındaki doğrulanmamış ETAP iddialarını metinlerden temizler.

Neden: adalar[].etap alanı iç gruplama verisi; "bu site N. Etap'tadır" ise
Özgün'ün doğrulaması gereken bir iddia. Açıklama ve özellik metinlerine
otomatik yazılmış etap ifadeleri kaldırılıyor.

KORUNAN: "4. Etap Çarşısı" gibi yer adları — ofis adresi de "4. Etap Çarşı"
(bkz. lib/site-config.ts). Bunlar iddia değil, mevkinin adı.

Kullanım:  python3 scripts/etap-temizle.py [--uygula]
--uygula verilmezse hiçbir dosyaya dokunmaz, yalnız önce/sonra listeler.
"""
import json, glob, re, sys, os

KOK = os.path.join(os.path.dirname(__file__), "..")
UYGULA = "--uygula" in sys.argv

# Yer adı olarak geçen ve korunacak kalıplar (önce maskelenir, sonra geri konur).
KORUNAN = [
    r"\d+\.\s*Etap\s*Çarşı(?:sı|sında|sının|ya|na)?",
]

# (desen, yerine) — sırayla uygulanır. Cümle akıcı kalacak biçimde yazıldı.
KURALLAR = [
    # "Eryaman N. Etap kooperatif kuşağında/kuşağının" -> "Eryaman'ın kooperatif kuşağında"
    (r"Eryaman\s+\d+\.\s*Etap\s+kooperatif\s+kuşağı(n[ıiu]n|nda|nın)?", r"Eryaman'ın kooperatif kuşağı\1"),
    # "X Mahallesi'nde Eryaman N. Etap bölgesinde" -> "X Mahallesi'nde"
    # (mahalle adı zaten söylenmişken "Eryaman'da" eklemek tekrar olur)
    (r"(Mahallesi'nde)\s+Eryaman'?(?:ın)?\s+\d+\.\s*Etap\s+bölgesindeki", r"\1ki"),
    (r"(Mahallesi'nde)\s+Eryaman'?(?:ın)?\s+\d+\.\s*Etap\s+(?:bölgesinde|dokusunda)", r"\1"),
    # Mahalle adı geçmiyorsa "Eryaman'da" kalsın.
    (r"Eryaman'?(?:ın)?\s+\d+\.\s*Etap\s+bölgesinde(ki)?", r"Eryaman'da\1"),
    (r"Eryaman\s+\d+\.\s*Etap\s+dokusunda", "Eryaman'da"),
    # "Eryaman'ın ilk yapılaşma bölgesi olan N. Etap'ta" -> "Eryaman'ın ilk yapılaşma bölgesinde"
    (r"Eryaman'ın\s+ilk\s+yapılaşma\s+bölgesi\s+olan\s+\d+\.\s*Etap'ta", "Eryaman'ın ilk yapılaşma bölgesinde"),
    # "— Eryaman'ın N. Etap olarak bilinen en eski yerleşim kuşağında —"
    (r"Eryaman'ın\s+\d+\.\s*Etap\s+olarak\s+bilinen\s+en\s+eski\s+yerleşim\s+kuşağında",
     "Eryaman'ın en eski yerleşim kuşağında"),
    # "halk arasında Eryaman N. Etap olarak anılan kesimde" -> "mahallenin bu kesiminde"
    (r"halk\s+arasında\s+Eryaman\s+\d+\.\s*Etap\s+olarak\s+anılan\s+kesimde", "mahallenin bu kesiminde"),
    # "Eryaman N. Etap Soyak Blokları içinde" -> "Soyak Blokları içinde"
    # "Tunahan'daki 5. Etap Age Sitesi" -> "Tunahan'daki Age Sitesi"
    # (Eryaman opsiyonel; ayırt edici notlarda mahalle adı zaten ayrımı yapıyor.)
    (r"(?:Eryaman\s+)?\d+\.\s*Etap\s+(?=[A-ZÇĞİÖŞÜ])", ""),
    # "Mahallesi'nin N. Etap dokusunda" -> "Mahallesi'nde"
    (r"Mahallesi'nin\s+\d+\.\s*Etap\s+dokusunda", "Mahallesi'nde"),
    # İyelik ekli kullanımlar: "N. Etap'ın ..." -> "bölgenin ..."
    (r"\b\d+\.\s*Etap'ın\b", "bölgenin"),
    (r"\b\d+\.\s*Etap'ta(ki)?\b", r"bölgede\1"),
    (r"\b\d+\.\s*Etap'a\b", "bölgeye"),
    (r"\b\d+\.\s*Etap\s+aksı(n[ıiu]n|nda)?\b", r"bölge aksı\1"),
    (r"\b\d+\.\s*Etap\s+kooperatifleri\b", "bölge kooperatifleri"),
    (r"\b\d+\.\s*Etap\s+dokusu(n[ua])?\b", r"bölge dokusu\1"),
    (r"\b\d+\.\s*Etap\s+kooperatif\s+dokusunun\b", "bölgenin kooperatif dokusunun"),
    # Ayırt edici notlarda etap gereksiz; mahalle adı zaten ayırt ediyor.
    (r"(?:Eryaman\s+)?\d+\.\s*Etap(?:'ta|'taki)?,?\s+(?=[A-ZÇĞİÖŞÜ][a-zçğıöşü]+\s+Mahallesi)", ""),
    # Kalan yalın "Eryaman N. Etap" / "N. Etap"
    (r"Eryaman\s+\d+\.\s*Etap\b", "Eryaman"),
    (r"\b\d+\.\s*Etap\b", "bölge"),
]

# Özellik maddeleri: etap içerenler tamamen atılır ya da sadeleştirilir.
OZELLIK_KURALLARI = [
    (r"^Eryaman\s+\d+\.\s*Etap\s+kooperatif\s+kuşağı.*$", None),          # tamamen sil
    (r"^Eryaman\s+\d+\.\s*Etap$", None),
    (r"^\d+\.\s*Etap\s+kooperatif\s+kuşağı$", None),
    (r"^\d+\.\s*Etap\s+—\s+.*$", None),
    (r"^Eryaman\s+\d+\.\s*Etap\s+—\s+(.*)$", r"\1"),
    (r"^Eryaman\s+\d+\.\s*Etap\s+dokusu,\s*(.*)$", r"\1"),
]


def maskele(s):
    saklanan = []
    def _m(m):
        saklanan.append(m.group(0))
        return f"\x00{len(saklanan)-1}\x00"
    for d in KORUNAN:
        s = re.sub(d, _m, s)
    return s, saklanan


def coz(s, saklanan):
    for i, v in enumerate(saklanan):
        s = s.replace(f"\x00{i}\x00", v)
    return s


def temizle_metin(s):
    s, saklanan = maskele(s)
    for desen, yerine in KURALLAR:
        s = re.sub(desen, yerine, s)
    s = coz(s, saklanan)
    # Dönüşümlerin bıraktığı çift boşluk / boşluk-noktalama artıklarını topla.
    s = re.sub(r"\s{2,}", " ", s)
    s = re.sub(r"\s+([,.;:])", r"\1", s)
    s = re.sub(r"\(\s+", "(", s)
    s = re.sub(r",\s*,", ",", s)
    s = re.sub(r"\s+—\s+—\s+", " — ", s)
    # "1. Etap'ın ..." cümle başındaysa yerine gelen "bölgenin" küçük kalıyor;
    # cümle başlarını yeniden büyüt.
    # Nokta+parantez kapanışı da cümle sonudur ("… ayrı bir yerleşimdir.) Ana …"),
    # ama yalın parantez kapanışı değildir ("(86 dönüm) bir alana …").
    s = re.sub(r"(^|[.!?]\)?\s+)([a-zçğıöşü])", lambda m: m.group(1) + m.group(2).upper(), s)
    return s.strip()


def temizle_ozellik(o):
    if not re.search(r"\d+\.\s*Etap", o):
        return o
    korunan_mu = any(re.search(d, o) for d in KORUNAN)
    if korunan_mu:
        return temizle_metin(o)
    for desen, yerine in OZELLIK_KURALLARI:
        m = re.match(desen, o)
        if m:
            if yerine is None:
                return None
            y = re.sub(desen, yerine, o)
            return y[:1].upper() + y[1:] if y else None
    y = temizle_metin(o)
    return y[:1].upper() + y[1:] if y else None


def main():
    degisen = 0
    for yol in sorted(glob.glob(os.path.join(KOK, "content/siteler/*/*.json"))):
        if "boundary" in yol:
            continue
        with open(yol, encoding="utf-8") as fh:
            d = json.load(fh)
        eski_ac = d.get("aciklama", "")
        eski_oz = list(d.get("ozellikler", []))
        if not re.search(r"\d+\.\s*Etap", eski_ac + " " + " ".join(eski_oz)):
            continue

        yeni_ac = temizle_metin(eski_ac)
        yeni_oz = [x for x in (temizle_ozellik(o) for o in eski_oz) if x]

        if yeni_ac == eski_ac and yeni_oz == eski_oz:
            continue
        degisen += 1
        kisa = os.path.relpath(yol, KOK)
        print(f"\n### {d['isim']}  ({kisa})")
        if yeni_ac != eski_ac:
            for a, b in zip(
                re.findall(r"[^.!?]*[.!?]", eski_ac), re.findall(r"[^.!?]*[.!?]", yeni_ac)
            ):
                if a.strip() != b.strip():
                    print(f"  - {a.strip()}")
                    print(f"  + {b.strip()}")
        for o in eski_oz:
            y = temizle_ozellik(o)
            if y != o:
                print(f"  - [özellik] {o}")
                print(f"  + [özellik] {y if y else '(silindi)'}")

        if UYGULA:
            d["aciklama"] = yeni_ac
            d["ozellikler"] = yeni_oz
            with open(yol, "w", encoding="utf-8") as fh:
                json.dump(d, fh, ensure_ascii=False, indent=2)
                fh.write("\n")

    print(f"\n{'UYGULANDI' if UYGULA else 'ÖN İZLEME'} — {degisen} kayıt")


if __name__ == "__main__":
    main()
