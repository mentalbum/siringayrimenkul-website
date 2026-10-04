# PR #90 (başlıkta mahalle) — GSC tabanlı okuma, 04.10.2026

Yöntem: GSC sorgu×sayfa (API), iki dönem: ÖNCE 06.08–02.09, SONRA 10.09–02.10 (merge 06.09,
yeniden tarama payı için 4 gün atlandı). Her site için adının çekirdeği geçen, "emlak" geçmeyen
sorgular (yalın ad + alıcı/kiracı niyeti — gerçek talep); "doğru sayfa" = aynı adlı site
sayfalarımız (ad ikizleri dahil). Ölçüt: sorgu kümesinde en çok gösterim alan sayfamız doğru mu.
Yalnız iki dönemde de ≥5 gösterimi olan siteler. Ham: scratchpad denetim-0410/deney-gsc-okuma.json.

| | Deney (272 site) | Kontrol (27 site) |
|---|---|---|
| Tepe sayfa doğru oranı | %66,9 → **%76,1** (+9,2) | %66,7 → %66,7 (0) |
| Önce yanlış olanların düzelme oranı | **47/90 = %52** | 2/9 = %22 |
| Önce doğru olanların bozulma oranı | 22/182 = %12 | 2/18 = %11 |
| Gösterim-ağırlıklı doğru sayfa payı | %31,9 → %39,5 | %21,3 → %34,7 (2 siteye bağlı) |

Fisher (düzelme): p ≈ 0,16 — kontrol kolu küçük (9 yanlış), tek başına kesin değil; yön ve
büyüklük müdahale lehine, bozulma iki kolda aynı (zarar yok). GSC TO okuması (04.10 denetimi):
deney/kontrol tık kaybı aynı → başlık tıklamaya zarar vermedi.
Kontrolde düzelen: arslanlar-sitesi, neva-panora-konutlari. Hâlâ yanlış: cumhuriyet-sitesi,
kent-konaklari, gercek-92, kosk, bulvar-312, yildiz-eryaman, palmiye-evleri.

Karar önerisi: 05.10 sonrası lib/baslik-kontrol-kolu.ts silinir (45 sayfa da yeni kurala geçer).
SERP taraması (aynı araçla 06.09 tabanıyla kıyas) ek okuma olarak: kontrol 45 + deney'de tabanda
yanlış/dışı olan sayfalar.

## SERP taraması 04.10 (aynı araç, pws=0, Özgün'ün Chrome'u) — kontrol kolu 41/45

Taban 06.09 → 04.10: doğru 28→27, yanlış 8→8, dışı 5→6. Geçişler: yanlış→doğru 2 (Postakent,
Özenkent 2), doğru→yanlış 2 (Bulvar 312, Neva Panora), doğru→dışı 4, dışı→doğru 3. Kontrol kolu
dört haftada YERİNDE SAYDI — doğal taban. 5 sayfada hâlâ eski adres (/mahalleler/<slug> -mahallesi'siz)
çıkıyor: yeni-huzur-bahcesi, gercek-92, inci-life, sitekonut, kur-sitesi.
reCAPTCHA 41. sorguda (toplam 44 sorgu); deney kolu (174 sorgu: tabanda yanlış/dışı olanlar) ölçülmedi —
kuyruk: deney-kuyruk-0410.json (kayıt betiği ekle-deney-0410.py; ölçülenler sonuclar-site-emlakci.jsonl kanal=deney-0410). Ertesi gece devam.
