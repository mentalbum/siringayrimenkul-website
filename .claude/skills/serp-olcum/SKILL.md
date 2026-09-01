---
name: serp-olcum
description: Kişiselleştirmesiz Google sıra ölçümü (pws=0) — siringayrimenkul.com hedef sorguları, site-emlakçı turu ve karne üretimi. Özgün "kaçıncı sıradayız", "sıra ölç", "aratma yap", "karne çıkar" dediğinde veya herhangi bir Google SERP ölçümü/rakip sıra kontrolü yapılacağında MUTLAKA önce bu beceriyi kullan — protokol, kuyruk dosyaları ve kanal sınırı burada.
---

# SERP sıra ölçümü

Tam protokol depoda: `scratchpad-karne/pws0/PROTOKOL-gece.md` — ÖNCE ONU OKU.
Bu beceri sadece kritik kuralların özeti ve dosya haritasıdır.

## Değişmez kurallar

- Her aramada `pws=0&gl=tr&hl=tr` (Özgün'ün Chrome'u kişiselleştirilmiş; bunsuz
  ölçüm geçersiz). Harita kutusu organikten AYRI raporlanır.
- reCAPTCHA görülürse ÇÖZMEDEN anında dur; o ölçümü diske yazma. Engel günlük
  toplam sorgudan gelir (~370/gün kanal sınırı), tempodan değil.
- `num=20` parametresi ölü — ilk ~10 sonuç görünür; 10 dışı "ilk 10'da yok" yazılır.
- Ölçüm sonuçları JSONL dosyalarına eklenir; aynı sorgu tekrar ölçülürse SON
  ölçüm geçerli sayılır (karne betikleri böyle okur).

## Dosya haritası (`scratchpad-karne/pws0/`)

| İş | Kuyruk | Sonuç | Karne |
|---|---|---|---|
| 19 hedef sorgu (etap+mahalle emlakçı) | `hedef-sorgular.md` | `sonuclar-emlakci.jsonl` | `sirada-emlakci.py` |
| Site-emlakçı turu (706 sorgu) | `kuyruk-site-emlakci.json` | `sonuclar-site-emlakci.jsonl` | `karne-site-emlakci.py` (`--md` → `ilk3-disi-siteler.md`) |
| Yalın site adı | `kuyruk-yalin-ad.json` | `sonuclar-yalin.jsonl` | `karne.mjs` |
| Harita kutusu | `kuyruk-harita.json` | `sonuclar-harita.jsonl` | `harita-kutusu-bulgular.md` |
| Bölge turu (uule, 7 nokta × 2 sorgu) | `bolge-tur.mjs --listele` | `sonuclar-bolge.jsonl` | `karne-bolge.py` (talimat: `BOLGE-TURU.md`) |

Gecelik tur cron'u 02:34'te çalışır; öncelik sırası PROTOKOL-gece.md'de.

## Raporlama

Karneyi betikle üret, elle sayma. Özgün'e özet verirken: ilk 3'te olan /
4-10 arası / ilk 10 dışı sayıları + "Evinizi Satalım, Kiraya Verelim" ekinin
kaç sonuçta göründüğü. Başlık değişikliği önerme — title'lar 5 Eylül'e kadar
donuk (08.08 kararı).

## Yedek kanal: uygulama-içi tarayıcı (28.08 doğrulandı)

Chrome eklentisi koptuğunda veya Chrome duvara çarptığında tur uygulama-içi
tarayıcıdan (Claude Browser pane, `mcp__Claude_Browser__*`) sürdürülebilir:
- İki kontrol sorgusu Chrome'la birebir tuttu (Şirin 91 #2, Atalay 0) — sıralar karşılaştırılabilir.
- DİKKAT: bu tarayıcıya Google şifreli `goto?url=` href'leri servis ediyor; alan adı
  `cite` öğesinden okunur (h3'ün en yakın atasındaki ilk cite). Görünüm dar açılır —
  önce `resize_window` 1280×900 yap, yoksa MOBİL SERP ölçersin (karşılaştırılamaz).
- Kayıtlara `"kanal":"app"` alanı ve `u` yerine `"cite:..."` öneki yazılır.
- Harita kutusu (.dbg0pd) bu DOM'da her zaman görünmüyor — mahalle sorgularını
  Chrome'dan ölç veya h değerine güvenme.
- Duvar IP bazlı: iki kanal aynı günlük sınırı paylaşır, kanal değiştirmek kotayı katlamaz.

## KANAL GERÇEĞİ (01.09 ölçüldü)

- Uygulama içi tarayıcıya (Claude Browser pane) **google.com izni yok** —
  `navigate` reddediliyor. Bu kanal SERP için kullanılamaz.
- Gizli pencereyi yalnız Özgün açabilir; açık değilse tur **oturumlu Chrome'da
  pws=0&gl=tr&hl=tr** ile yürür (30.08 kalibrasyonu: gizli pencereyle birebir).
  Kayıtlara `"kanal":"normal"` yazılır.
- Oturumlu DOM'da h3 bağlantı içinde ve href açık: `h.closest('a').href` tam
  yolu verir, `cite:` kırıntısı sorunu bu kanalda YOK. 01.09'da 28.08'in 38
  kırıntı kaydı bu kanalla yeniden ölçüldü; dördü ada/mahalle sayfası, beşi
  taşınma öncesi adres çıktı — kırıntı bunları "komşu sayfa" sanmıştı.
- Tempo: 4 sorgu/tur, sorgular arası 4 sn + 5 sn yükleme; 38 sorguda CAPTCHA yok.

## GİZLİ PENCERE KANALI (30.08 kuruldu — ARTIK VARSAYILAN)

Özgün eklentiye "Gizli modda çalışmasına izin ver" iznini verdi. Gizli pencere
Google oturumu taşımadığı için kişiselleştirme riski tümüyle kalkar.

**Kurulum:** Gizli pencereyi ÖZGÜN açar (Cmd+Shift+N) — eklentinin sekme açma
aracında gizli seçeneği yok. Gizli pencere ÖNDEYKEN `tabs_context_mcp
{createIfEmpty:true}` çağrılırsa yeni sekme O pencerede açılır.

**Gizli mi normal mi?** GSC adresine git; `accounts.google.com`'a düşüyorsa
gizlidir. (Google aramada "Oturum açın" görünmesi de aynı işareti verir.)

**DİKKAT — DOM FARKLI:** oturumsuz Google `h3`'ü bağlantının içine koymaz ve
href'leri şifreler. Standart ölçüm JS'i n:0 döndürür. Gizli/oturumsuz kanalda
alan adı CITE'tan okunur:

```js
(()=>{const T=[],G=new Set();
for(const h of document.querySelectorAll('#rso h3')){
  let c=null,p=h;for(let i=0;i<7&&p;i++){const f=p.querySelector&&p.querySelector('cite');if(f){c=f.innerText;break}p=p.parentElement}
  if(!c||G.has(c))continue;G.add(c);
  const d=c.replace(/^https?:\/\//,'').split(' › ')[0].replace('www.','').trim();
  T.push({d,c,t:h.innerText});}
const i=T.findIndex(x=>x.d==='siringayrimenkul.com');
return JSON.stringify({sira:i+1,cite:i>=0?T[i].c:null,bas:i>=0?T[i].t:null,
  ilk3u:T.slice(0,3).map(x=>x.d),n:T.length});})()
```

**Kalibrasyon (30.08):** Atalay Sitesi — oturumlu Chrome 3., gizli pencere 3.
(aynı gün, birebir). Daha önce uygulama-içi tarayıcıyla da iki kontrol tutmuştu.
Sonuç: `pws=0&gl=tr&hl=tr` zaten sapma üretmiyordu; gizli pencere ek güvence.

**Kayıtlara** `"kanal":"gizli"` alanı yazılır, `u` yerine `cite:` öneki kullanılır.

**PENCERE TUZAĞI:** MCP sekme grubu tek pencerede yaşar. Gizli penceredeyken
GSC işleri (dizin damlası) YAPILAMAZ — oturum yok. Damla zamanı geldiğinde
normal pencere öne alınmalı ve sekme grubu yeniden kurulmalıdır.

## İŞGAL ÖLÇÜTÜ (Özgün, 31.08 — ÖNCELİKLİ)

"Kendi sayfalarımız kendi sayfalarımızdan önde olabilir, önemli değil; amaç
1. arama sayfasını işgal etmek." Yani **"en iyi sıramız" tek ölçüt değildir**;
her sorguda ilk sayfada BİZE AİT kaç sonuç olduğu da ölçülür ve raporlanır.
Kendi kanallarımızın birbirini geçmesi RAPORDA SORUN OLARAK ANILMAZ.

Bize ait varlıklar (ölçüm koduna gömülü):
```js
const BIZ=[/siringayrimenkul\.com/,/eryamansiringayrimenkul\.sahibinden/,
 /instagram\.com\/eryamansiringayrimenkul/,/tiktok\.com\/@siringayrimenkul/,
 /facebook\.com.*61585267540417/];
```
Sonuç `isgal-GGAA.json`'a yazılır, karnede "1. sayfa işgali" tablosunda görünür.
İlk ölçüm (31.08, 9 sorgu): 86 organik sıranın 12'si bizim (%14).
