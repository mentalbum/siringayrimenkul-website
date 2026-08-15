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

Gecelik tur cron'u 02:34'te çalışır; öncelik sırası PROTOKOL-gece.md'de.

## Raporlama

Karneyi betikle üret, elle sayma. Özgün'e özet verirken: ilk 3'te olan /
4-10 arası / ilk 10 dışı sayıları + "Evinizi Satalım, Kiraya Verelim" ekinin
kaç sonuçta göründüğü. Başlık değişikliği önerme — title'lar 5 Eylül'e kadar
donuk (08.08 kararı).
