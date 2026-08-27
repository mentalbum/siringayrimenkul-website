# BULUNABİLİRLİK PROGRAMI — mahalle mahalle temas oranı (27.08.2026)

Özgün'ün sorusu: "X mahallesinde evi olan, emlakçı arayan 100 ev sahibinden
kaçı bizi buluyor / bizimle iletişime geçiyor — ve nasıl artar?"
Tam rapor (tablo + model): Claude artifact "Bulunabilirlik Karnesi"
https://claude.ai/code/artifact/1c76db5f-2bbd-43b3-9860-888f258b7b0d

## ANA BULGU (analizin temeli — sonraki oturumlar buna göre çalışsın)

Emlakçı arayan ev sahibi MAHALLE ADI YAZMIYOR. İki bağımsız 28 günlük GSC
penceresinde coğrafi emlakçı-niyetli gösterimin %87'si "eryaman" ailesi
(396 gös), %13'ü etimesgut/ankara (62), "mahalle+emlakçı" = 0, "etap+emlakçı"
= 0, "site adı+emlakçı" = 0. 6 mahalle sorgusunda ilk 10'da olmamıza rağmen
28 günde tek gösterim yok → bu sınıf gerçekten hacimsiz.
SONUÇ: 11 mahallenin savaşı tek SERP'te ("eryaman emlakçı": harita 1,
organik 2, mağaza 5). Mahalleler arası fark: (a) arayanın KONUMUNA göre
harita kutusu bileşimi, (b) site-adı yan kanalının sağlığı.

## Öncelik sırası (ilk 4 Özgün'ün, devamı mesafeyle)

Tunahan → Güzelkent → Şeyh Şamil → Yavuz Selim → Devlet → Eryaman → Göksu
→ Altay → Yeşilova → Şehit Osman Avcı → Şeker

## Bugünkü oranlar (Google'da emlakçı arayan ev sahipleri içinde, model)

| Mahalle | Bulabilme | Temas/100 | Site-adı ilk3 | Not |
|---|---|---|---|---|
| Tunahan | ~%80 | 15–20 | %86 | mahalle sorgusunda da harita 1 |
| Güzelkent | ~%76 | 13–18 | %54 | 36 site sorgusu ilk 10 dışı — EN KÖTÜ |
| Şeyh Şamil | ~%76 | 13–18 | %55 | 23 dışarıda |
| Yavuz Selim | ~%75 | 13–18 | %57 | 22 dışarıda |
| Devlet | ~%76 | 13–18 | %46 | mahalle sorgusunda harita 3 (yorum etkisi?) |
| Eryaman | ~%78 | 13–18 | %64 | org 3 + harita 1 |
| Göksu | ~%70 | 10–15 | %44 | 32 dışarıda — dizin önceliği |
| Altay | ~%68 | 10–15 | %72 | |
| Yeşilova | ~%68 | 10–15 | %64 | |
| Şehit Osman Avcı | ~%62 | 8–13 | %64 | dış halka — kutu varsayımı ölçülecek |
| Şeker | ~%60 | 8–13 | %63 | dış halka |

Dış/orta halka rakamları VARSAYIMLI (arayan konumuna göre kutu bileşimi
ölçülmedi); iç halka pws=0 ölçümlerine dayalı. Google dışı yollar
(doğrudan sahibinden, tavsiye) bu yüzdelerin DIŞINDA.

## Program (sıralı)

1. **28.08 kota açılınca İLK İŞ: bölge turu** — `bolge-tur.mjs`, 7 nokta ×
   "eryaman emlakçı"+"emlakçı" (uule). Dış halka kutu gerçeğini ölçer,
   tablodaki aralıkları sayıya çevirir. ~14 sorgu. (BOLGE-TURU.md talimat.)
2. **Yorum kampanyası sırası**: Güzelkent → Şeyh Şamil → YS → Devlet…
   (mahalle adı geçen yorum kuralı mevcut; Devlet'in 21.08 kutu girişi
   mekanizmanın çalıştığına işaret).
3. **Dizin damlası önceliği**: Güzelkent (23 dizinsiz+32 bayat) ve Göksu
   (32 ilk-10-dışı) öne — site-adı yan kanalı en kötü ikisi.
4. **GBP Insights aylık kayıt**: arama görünümü / çağrı / yol tarifi —
   temas oranının gerçek ölçeri; ilk kayıt Özgün'ün panelinden alınacak.
5. **5 Eylül sonrası**: "eryaman emlakçı" organik 2→1 title denemesi
   (başlıklar o tarihe kadar donuk, 08.08 kararı).
6. **İlçe katmanı** (%13 pay, "etimesgut emlakçı" ilk 10 dışı): mahalle
   programı bitince ayrı değerlendirilir.

3 aylık hedef: Tunahan temas 15–20 → 25–30; dış halka bulabilme %60 → %75+.
