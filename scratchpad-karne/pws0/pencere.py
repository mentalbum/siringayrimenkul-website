# -*- coding: utf-8 -*-
"""Tarih penceresi — karnedeki her GSC/GA4 üreticisi pencereyi buradan okur/yazar.

TEK KURAL (02.09 denetimi):
  son veri günü = GSC'nin date boyutunda satır döndürdüğü EN SON gün (bugün−2 ya da
                  bugün−3 diye VARSAYILMAZ; scripts/gsc-api.mjs sorar);
  pencere       = son veri günü dahil geriye N VERİ günü (satırı olan gün sayılır).

Neden: gsc-api.mjs eskiden bitişi bugün−2 sayıp başlangıcı bitiş−gün alıyordu (28
istenince 29 takvim günü) ve toISOString() UTC olduğundan Türkiye'de 00:00–03:00
arası bir gün daha kayıyordu. 02.09'da üç üretici üç ayrı pencerede çıktı:
sorgular28.tsv 02.08–30.08 (29 veri günü), sayfalar28.tsv 01.08–28.08,
sayfa-toplam28.tsv 03.08–30.08. Karne hepsine "son 28 gün" diyordu.

gsc-api.mjs sorgular/sayfalar TSV'nin İLK satırına şunu yazar:
    # pencere<TAB>2026-08-03<TAB>2026-08-30<TAB>28
Bu modül o satırı okur; her üreticinin JSON'una "pencere": {"bas","bit","gun"} girer.
Karne (karne-html.py) pencere satırını bu alandan basar — elle tarih yazılmaz.
"""
import datetime


def pencere_oku(yol):
    """TSV'nin ilk satırındaki '# pencere' başlığını {"bas","bit","gun"} olarak döndürür.

    Başlık yoksa None: dosya eski gsc-api.mjs ile ya da gsc-q.mjs ile çekilmiştir,
    penceresi BİLİNMİYOR. Üretici bunu ölçülmedi sayar; 28 varsaymaz.
    """
    with open(yol, encoding="utf-8") as f:
        p = f.readline().rstrip("\n").split("\t")
    if len(p) >= 4 and p[0] == "# pencere":
        return {"bas": p[1], "bit": p[2], "gun": int(p[3])}
    return None


def pencere_zorunlu(yol):
    """pencere_oku, ama başlık yoksa betiği durdurur — pencere bilinmeden rakam basılmaz."""
    p = pencere_oku(yol)
    if p is None:
        raise SystemExit(f"{yol}: ilk satırda '# pencere' başlığı yok — dosyayı güncel "
                         f"scripts/gsc-api.mjs ile yeniden çek (sorgular/sayfalar komutu başlığı yazar)")
    return p


def ga4_pencere(gun):
    """GA4'ün penceresi GSC'den FARKLI ve bu bilerek ayrı tutulur.

    ga4-api.mjs dateRanges '{gun}daysAgo'–'yesterday' ister: GA4 dünü verir (gecikmesi
    ~1 gün), GSC ise 2-3 gün geriden gelir. İkisi aynı takvim aralığına ZORLANMAZ —
    zorlansa GSC'nin son iki günü boş kalır ya da GA4'ün son iki günü atılır.
    Karne iki pencereyi ayrı basar; "aynı 28 gün" demez.
    Göreli tarihler mülkün saat diliminde (Europe/Istanbul) çözülür; yerel bugün alınır.
    """
    bugun = datetime.date.today()
    return {"bas": (bugun - datetime.timedelta(days=gun)).isoformat(),
            "bit": (bugun - datetime.timedelta(days=1)).isoformat(),
            "gun": gun, "kaynak": "GA4: {gun}daysAgo–yesterday".format(gun=gun)}


if __name__ == "__main__":
    import sys
    for y in sys.argv[1:]:
        print(y, pencere_oku(y))
