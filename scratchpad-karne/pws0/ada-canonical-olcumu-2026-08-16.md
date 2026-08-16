# Ada sayfası canonical'ı: 200 sayfalık GSC ölçümü (16.08.2026)

Yöntem: `content/siteler` altındaki 773 **tek siteli** ada rotasından mahalle
dengeli 200 örnek; Search Console URL Inspection API ile `userCanonical`,
`googleCanonical`, `coverageState`, `lastCrawlTime`.
Ham çıktı: `/private/tmp/.../scratchpad/ada-kanonik.txt` · üretici:
`scratchpad/kanonik.mjs`, `scratchpad/ada-liste.mjs`.

## Sonuç: 03.08 canonical planı ÇÜRÜDÜ

03.08'de ada sayfalarının canonical'ı site sayfasına çevrildi (ce068bd). Plan:
"Google sayfayı bir kez tarasın, canonical'ı görsün, ada sayfasını site
sayfasına katlasın." Sitemap'e alınmalarının tek gerekçesi buydu.

Ölçüm:

| | adet |
|---|---:|
| 03.08 sonrası taranmış (yani yeni canonical'ı GÖRMÜŞ) | **34** |
| bunlarda bizim canonical'ımız doğru okunmuş | 34 / 34 |
| **Google canonical'ı KABUL etti** ("Alternate page with proper canonical tag") | **2** |
| **Google canonical'ı REDDETTİ** (kendi adresini kanonik seçti, "Submitted and indexed") | **32** |

**Kabul oranı %6.** Yani canonical bu sayfalarda çalışmıyor. Sebep teknik değil
mantıksal: canonical yalnızca **birbirinin kopyası** sayfalar arasında dinlenir.
Ada sayfası (tapu niteliği, blok künyesi, komşu adalar, harita) site sayfasının
kopyası değil — Google haklı olarak iki ayrı sayfa görüyor ve ipucunu eliyor.

Bu, 32 ayrı sayfada tekrarlanmış bir sonuç; tek vakalık tesadüf değil.

## İkinci bulgu: tarama zaten gelmiyor

| son tarama | adet |
|---|---:|
| hiç taranmamış | **72** |
| 2026-07 | 92 |
| 2026-08 | 36 |

200 ada sayfasının **166'sı** 03.08 değişikliğini hiç görmemiş. Sitemap'teki
`changeFrequency: "yearly"` + `priority: 0.2` ile Google'a zaten "buraya
uğrama" diyoruz — ama bloğun kendi gerekçesi "bir kez taransın". Çelişki.

## Üçüncü bulgu: dizin durumu

| coverageState | adet |
|---|---:|
| Submitted and indexed | **115** |
| Discovered - currently not indexed | 43 |
| URL is unknown to Google | 29 |
| Excluded by 'noindex' tag | 11 |
| Alternate page with proper canonical tag | 2 |

**115 ada sayfası kendi başına dizinde** ve site sayfasıyla yarışabilecek
durumda. Tunahan'daki 7 kanibalizasyon vakası bunun görünen yüzü.

## Ama: "ada sayfasını sustur" refleksi üç sitede zarar verir

Tunahan denetimi (aynı gün):

| site sayfası | Google'daki durumu | SERP'te ne çıkıyor |
|---|---|---|
| ilgazlar-sitesi | **URL is unknown to Google** | ada sayfası, sıra 7 |
| camli-klima-bloklari | **Discovered - not indexed** | ESKİ adres, sıra 3 |
| okyanus-plaza | **Discovered - not indexed** | başka sitenin sayfası, sıra 6 |

Bu üçünde ada sayfası site sayfasını yemiyor — **site sayfası dizinde yok**.
Ada sayfası susturulursa Eryaman'da o siteler için görünen tek sayfamız da
kaybolur. Sıralama: önce site sayfası dizine girsin, sonra ada sayfası sussun.
