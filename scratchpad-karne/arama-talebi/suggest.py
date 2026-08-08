#!/usr/bin/env python3
"""Google Autocomplete (Suggest) kazıyıcı — Eryaman emlak sorgu evreni.

Google'ın kendi arama loglarından türeyen öneriler + relevance skorları.
Kişiselleştirme yok (çerez yok), hl=tr&gl=tr sabit.
"""
import json, sys, time, urllib.parse, urllib.request, random, os

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "sonuclar.jsonl")
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"

TOHUMLAR = [
    "eryaman emlak", "eryaman emlakçı", "eryaman emlakçısı", "eryaman gayrimenkul",
    "eryaman satılık", "eryaman kiralık", "eryaman satılık daire", "eryaman kiralık daire",
    "eryaman satılık ev", "eryaman kiralık ev", "eryaman ev", "eryaman daire",
    "eryaman ev fiyatları", "eryaman kira", "eryaman kira fiyatları",
    "eryaman satılık dükkan", "eryaman kiralık dükkan", "eryaman satılık arsa",
    "eryaman kiralık iş yeri", "eryaman satılık villa", "eryaman rezidans",
    "eryaman oturmak", "eryaman yaşamak", "eryaman nasıl bir yer",
    "eryaman en iyi", "eryaman hangi etap", "eryaman etap",
    "eryaman 1. etap", "eryaman 2. etap", "eryaman 3. etap", "eryaman 4. etap",
    "eryaman 5. etap", "eryaman 6. etap", "eryaman 7. etap",
    "eryaman site", "eryaman siteleri", "eryaman konut",
    "eryaman metrekare", "eryaman m2 fiyatları", "eryaman değer",
    "eryaman yatırım", "eryaman tapu", "eryaman kentsel dönüşüm",
    "etimesgut emlak", "etimesgut emlakçı", "etimesgut satılık daire", "etimesgut kiralık daire",
    "yeni batı emlak", "yeni batı satılık", "yeni batı kiralık",
    "eryaman ankara ev", "ankara eryaman satılık", "ankara eryaman kiralık",
    "eryaman emlak ofisi", "eryaman emlak ofisleri", "eryaman emlak danışmanı",
    "eryaman komisyon", "emlak komisyon oranı eryaman",
    "eryaman evimi satmak", "eryaman ev satmak", "eryaman ev kiraya vermek",
    "eryaman ev nasıl satılır", "eryaman ev değerleme",
    "eryaman güvenilir emlakçı", "eryaman en iyi emlakçı",
    # Yenimahalle grubu (ayrı bölge, memory: Ata/Susuz/Cumhuriyet)
    "susuz mahallesi satılık", "ata mahallesi satılık", "cumhuriyet mahallesi ankara satılık",
    # semtler / komşu
    "elvankent emlak", "elvankent satılık daire", "govenlik satılık",
    "batıkent emlak", "sincan emlak",
]

# genişletme ekleri
HARFLER = list("abcçdefgğhıijklmnoöprsştuüvyz")
RAKAMLAR = list("0123456789")
SORULAR = ["ne kadar", "nasıl", "nerede", "kaç", "hangi", "kim", "neden", "ne zaman",
           "en", "mi", "var mı", "için", "ile", "fiyat", "ucuz", "yorum", "tavsiye",
           "2026", "sahibinden"]

def cek(q, tries=3):
    url = ("https://suggestqueries.google.com/complete/search?"
           + urllib.parse.urlencode({"client": "chrome", "hl": "tr", "gl": "tr", "q": q}))
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA,
                                                       "Accept-Language": "tr-TR,tr;q=0.9"})
            with urllib.request.urlopen(req, timeout=15) as r:
                raw = r.read()
            data = json.loads(raw.decode("utf-8", errors="replace"))
            oneriler = data[1]
            meta = data[4] if len(data) > 4 and isinstance(data[4], dict) else {}
            rel = meta.get("google:suggestrelevance", [])
            tipler = meta.get("google:suggesttype", [])
            out = []
            for j, s in enumerate(oneriler):
                out.append({
                    "sorgu": s,
                    "relevance": rel[j] if j < len(rel) else None,
                    "tip": tipler[j] if j < len(tipler) else None,
                })
            return out
        except Exception as e:
            if i == tries - 1:
                print(f"  HATA {q!r}: {e}", file=sys.stderr)
                return None
            time.sleep(2 + i * 3)

def main():
    istekler = []
    for t in TOHUMLAR:
        istekler.append(t)
        for h in HARFLER + RAKAMLAR:
            istekler.append(f"{t} {h}")
        for s in SORULAR:
            istekler.append(f"{t} {s}")
    # tekilleştir, sırayı koru
    gorulen, kuyruk = set(), []
    for q in istekler:
        if q not in gorulen:
            gorulen.add(q); kuyruk.append(q)

    print(f"{len(kuyruk)} istek kuyrukta", file=sys.stderr)
    yazildi = 0
    with open(OUT, "w", encoding="utf-8") as f:
        for i, q in enumerate(kuyruk, 1):
            r = cek(q)
            if r:
                f.write(json.dumps({"kok": q, "oneriler": r}, ensure_ascii=False) + "\n")
                f.flush()
                yazildi += 1
            if i % 100 == 0:
                print(f"  {i}/{len(kuyruk)} ({yazildi} başarılı)", file=sys.stderr)
            time.sleep(random.uniform(0.35, 0.8))
    print(f"BİTTİ: {yazildi}/{len(kuyruk)} → {OUT}", file=sys.stderr)

if __name__ == "__main__":
    main()
