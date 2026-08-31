"""Türkçe sorgu anahtarı — Python'un .lower()'ı Türkçe İ'de bozuluyor.

'İ'.lower() iki karakter üretir: 'i' + U+0307 (birleşik nokta). Yani
"İlgazlar Sitesi emlakçı" ile "ilgazlar sitesi emlakçı" FARKLI anahtar olur ve
aynı sorgunun iki ölçümü ayrı satır sayılır. 31.08'de sonuclar-site-emlakci
dosyasında tam olarak bu vaka bulundu (İlgazlar). Google harf duyarsız
aradığından bu bir veri hatasıdır, üslup meselesi değil.

Ayrıca 'I'.lower() Python'da 'i' verir; Türkçede doğrusu 'ı'dır. SERP anahtarı
için ikisini de aynı kovaya atmak yeterli — amaç eşleştirme, gösterim değil.
"""
import unicodedata

_ESLE = str.maketrans({"I": "i", "İ": "i", "ı": "i", "̇": ""})


def anahtar(s: str) -> str:
    """Aynı sorgunun her yazımını tek anahtara indirger."""
    if not s:
        return ""
    d = unicodedata.normalize("NFC", s.strip())
    return unicodedata.normalize("NFC", d.translate(_ESLE).lower().translate(_ESLE))


if __name__ == "__main__":
    ornek = ["İlgazlar Sitesi emlakçı", "ilgazlar sitesi emlakçı",
             "İLGAZLAR SİTESİ EMLAKÇI", "Şeker Mahallesi emlakçı",
             "ŞEKER MAHALLESİ EMLAKÇI"]
    for o in ornek:
        print(f"{o:32} → {anahtar(o)!r}")
    assert anahtar(ornek[0]) == anahtar(ornek[1]) == anahtar(ornek[2])
    assert anahtar(ornek[3]) == anahtar(ornek[4])
    print("geçti")
