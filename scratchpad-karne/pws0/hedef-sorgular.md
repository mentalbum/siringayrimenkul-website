# HEDEF SORGU LİSTESİ — Özgün'ün 2026-08-10 talimatı

**Hedef: 19 sorgunun HEPSİNDE organik 1. sıra.** Her sorgunun kendine ait bir
sayfası olacak (hepsinin var, aşağıda karşılıkları yazılı — YENİ SAYFA AÇILMAZ,
ikinci sayfa kendi sayfamızla rekabet eder).

Ölçüm kuralı: `pws=0&gl=tr&hl=tr`, uygulama içi tarayıcı, tek sekme.
Bkz. [[feedback-olcum-kisisellestirmesiz]] ve `PROTOKOL-gece.md`.

## Etap ailesi (5)

| Sorgu | Sayfa |
|---|---|
| Eryaman 1. Etap emlakçı | /mahalleler/altay-mahallesi/etaplar/1 |
| Eryaman 2. Etap emlakçı | /mahalleler/sehit-osman-avci-mahallesi/etaplar/2 |
| Eryaman 3. Etap emlakçı | /mahalleler/seyh-samil-mahallesi/etaplar/3 |
| Eryaman 4. Etap emlakçı | /mahalleler/tunahan-mahallesi/etaplar/4 |
| Eryaman 5. Etap emlakçı | /mahalleler/tunahan-mahallesi/etaplar/5 |

## Mahalle ailesi (14)

Eryaman'ın 11 mahallesi + Yenimahalle grubunun 3'ü. **UYARI:** Ata, Cumhuriyet
ve Susuz Eryaman DEĞİL, Yenimahalle'dir — başlıkta "Eryaman" yazılmaz
(bkz. [[feedback-yenimahalleye-eryaman-deme]], lib/bolge.ts). Özgün'ün
listesinde de bunlar "Ankara …" önekiyle yazılmış, tutarlı.

| Sorgu | Sayfa |
|---|---|
| Altay mahallesi emlakçı | /mahalleler/altay-mahallesi |
| Devlet mahallesi emlakçı | /mahalleler/devlet-mahallesi |
| Eryaman mahallesi emlakçı | /mahalleler/eryaman-mahallesi |
| Göksu mahallesi emlakçı | /mahalleler/goksu-mahallesi |
| Güzelkent mahallesi emlakçı | /mahalleler/guzelkent-mahallesi |
| Şehit Osman Avcı mahallesi emlakçı | /mahalleler/sehit-osman-avci-mahallesi |
| Şeker mahallesi emlakçı | /mahalleler/seker-mahallesi |
| Şeyh Şamil mahallesi emlakçı | /mahalleler/seyh-samil-mahallesi |
| Tunahan mahallesi emlakçı | /mahalleler/tunahan-mahallesi |
| Yavuz Selim mahallesi emlakçı | /mahalleler/yavuz-selim-mahallesi |
| Yeşilova mahallesi emlakçı | /mahalleler/yesilova-mahallesi |
| Ankara Ata mahallesi emlakçı | /mahalleler/ata-mahallesi |
| Ankara Cumhuriyet mahallesi emlakçı | /mahalleler/cumhuriyet-mahallesi |
| Ankara Susuz mahallesi emlakçı | /mahalleler/susuz-mahallesi |

14 mahallenin 14'ü de `durum: yayinda` (2026-08-10'da doğrulandı) — noindex olan yok.

## BAŞLANGIÇ DURUMU (etap: 2026-08-10 02:47 · mahalle: 2026-08-09 07:14)

### Etap — güçlü aile
| Sorgu | Organik | Harita |
|---|---|---|
| 1. Etap | **1.** (ana sayfa) | **1.** |
| 2. Etap | 02:47'de 2. → **11:41'de ilk 10'da YOK** (çok oynak) | 2. |
| 3. Etap | **1.** (sahibinden mağazası) | YOK |
| 4. Etap | **1.** (ana sayfa) | **1.** |
| 5. Etap | **1.** (sahibinden mağazası) | **1.** |

### Mahalle — ZAYIF aile, asıl iş burada
| Sorgu | Organik | Harita |
|---|---|---|
| Şeyh Şamil | 3. | YOK |
| Eryaman Mahallesi | 4. (ana sayfa) | **1.** |
| Yavuz Selim | 4. | YOK |
| Devlet | 5. | YOK |
| Tunahan | YOK | **1.** |
| Altay · Ata · Cumhuriyet · Göksu · Güzelkent · Şehit Osman Avcı · Şeker · Susuz · Yeşilova | **YOK** | YOK |

**14 mahalle sorgusunun yalnız 4'ünde ilk 10'dayız, hiçbirinde 1. değiliz.**

## ⚠ TALEP ÖLÇÜMÜ (GSC, son 3 ay — 2026-08-10'da çekildi)

Bu listeyi kovalamadan önce bilinmesi gereken rakam. GSC Performans, sorgu filtresi:

| Filtre | Sorgu | Gösterim | Tık |
|---|---|---|---|
| "mahalle" geçen | 87 | 491 | 7 |
| ↳ içinde "emlak" de geçen | **1** | **1** | **0** |
| "etap" geçen | 14 | 36 | 1 |
| ↳ içinde "emlak" de geçen | **0** | **0** | **0** |

**19 hedef sorgunun tamamı 3 ayda toplam 1 gösterim üretti** — "cumhuriyet
mahallesi emlakçı", 1 gösterim, **konum 1**.

Metodolojik uyarı: GSC gösterimi ancak SIRALADIĞIMIZDA kaydeder, yani hiç
çıkmadığımız sorguda "talep yok" ile "biz görünmüyoruz" ayrışmaz. AMA Şeyh Şamil
(3.), Eryaman Mah. (4.), Yavuz Selim (4.), Devlet (5.) sorgularında ölçülmüş
şekilde ilk 5'teyiz ve 90 günde SIFIR gösterim aldık — bu sorgularda talebin
gerçekten yok denecek kadar az olduğunun sağlam kanıtı.

**Gerçek talep aynı kovalarda başka yerde:**
- `eryaman mahalleleri` — **70 gösterim, konum 9,3** (1. sayfanın dibi)
- `inci park evleri satılık şeyh şamil mahallesi` — 36 gös, poz 5,5
- `tuana evleri yenimahalle` — 36 gös, poz 12,4
- `havuzkent sitesi eryaman yenimahalle` — 32 gös, poz 11,2
- `palmiye evleri ata mahallesi` — 29 gös, poz 8,3
- `eryaman 5 etap özar sitesi satılık` — 9 gös, poz 7,4

Yani talep **"site adı + yer (+ satılık)"** biçiminde; "<yer> emlakçı" biçiminde
değil. [[project-sorgu-sinifi-dagilimi]] ile birebir uyumlu (talebin %64'ü yalın
site adı, "emlakçı" sınıfı %2).

**Karar Özgün'ün:** liste takipte kalsın (ölçmesi bedava), ama emek talebin
olduğu yere mi gitsin — 2026-08-10'da soruldu.

## AÇIK BULGULAR

1. **ESKİ URL indekste:** "Şeyh Şamil Mahallesi emlakçı" sorgusunda sıralayan
   adres `/mahalleler/seyh-samil` — yani `-mahallesi` ekinden ÖNCEKİ şema.
   Aynı sorun "Öz Gimat Sitesi emlakçı"da da görüldü (`/mahalleler/devlet/...`).
   Yönlendirme çalışıyor ama Google eski adresi tutuyor.
2. **Ana sayfa yamyamlığı:** Eryaman Mahallesi ve 1./4. Etap sorgularında
   sıralayan sayfa ana sayfa, hedef sayfa değil.
3. **Sorgu oynaklığı:** 2. Etap 9 saatte 2. sıradan ilk 10 dışına düştü. Tek
   ölçümle "kazandık/kaybettik" denmeyecek; en az 3 günün eğilimine bakılacak.
4. **Harita kutusu ayrı savaş:** kutuya girmeyi GBP kaydının adı/adresi
   belirliyor (34 ölçüm, p=0,000028) — sayfa işiyle çözülmez.
   Bkz. [[project-harita-kutusu-ad-eslesmesi]].
