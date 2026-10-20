#!/bin/zsh
# Karne boru hattı (sıra: karne-html.py docstring). Kullanım: KARNE_SCRATCH=<scratchpad> zsh karne-kos.sh
# 20.10: oturum scratchpad'i silindiği için depoya alındı. gorunmez-teshis ve mudahale-defteri adımları
# gorunmez-denetim.tsv / istek-sonuc.tsv yoksa başarısız olur (çıktıları önceki sürümde kalır; karne boş bırakmaz).
set -o pipefail
cd "$(dirname "$0")"
: "${KARNE_SCRATCH:?KARNE_SCRATCH gerekli}"
export KARNE_SCRATCH
cp gsc-q.mjs "$KARNE_SCRATCH/gsc-q.mjs"
BAS=$(python3 -c "import datetime;print(datetime.date.today()-datetime.timedelta(days=28))")
BIT=$(python3 -c "import datetime;print(datetime.date.today()-datetime.timedelta(days=1))")
L=$KARNE_SCRATCH/karne-kos.log; : > "$L"
adim(){ echo "── $*" >> "$L"; "$@" >> "$L" 2>&1; echo "   çıkış $?" >> "$L"; }
node ../../scripts/gsc-api.mjs sorgular 28 > "$KARNE_SCRATCH/sorgular28.tsv"
node ../../scripts/gsc-api.mjs sayfalar 28 > "$KARNE_SCRATCH/sayfalar28.tsv"
node ../../scripts/ga4-api.mjs ozet 28 > "$KARNE_SCRATCH/ga4-ozet28.json"
node ../../scripts/ga4-api.mjs aile 28 > "$KARNE_SCRATCH/ga4-aile28.json"
node ../../scripts/ga4-api.mjs olaylar 28 > "$KARNE_SCRATCH/ga4-olaylar28.tsv"
node ga4-temas.mjs "$BAS" "$BIT" > "$KARNE_SCRATCH/ga4-temas28.json"
echo "ham çekim: $(head -1 "$KARNE_SCRATCH/sorgular28.tsv")" >> "$L"
for b in sonuc-ozeti-uret.py dogru-sayfa.py yansiz-ornek-uret.py sayfa-turu-verimi.py ada-beklenti-uret.py sorgu-sinifi-to.py hatirlanirlik-uret.py tik-sonrasi-uret.py veri-sagligi.py gorunmez-teshis-uret.py dizin-adaylari-uret.py hedef-sorgular-uret.py eryaman-emlakci-uret.py cihaz-uret.py mudahale-defteri-uret.py; do adim python3 $b; done
adim python3 anlik-goruntu-uret.py --yalniz-anlik
adim python3 yonetici-ozeti-uret.py
adim python3 is-takvimi-uret.py
adim python3 karne-html.py
echo "BITTI $(date '+%H:%M:%S')" >> "$L"
