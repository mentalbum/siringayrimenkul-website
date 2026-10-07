#!/bin/zsh
# Başlık deneyi 2 — maruz kalma günlüğü (yalnız OKUMA; URL Denetimi API, 100 çağrı, yaklaşık 10 dakika).
#
# !!! İSTEK GÜNLERİNDE KOŞMA !!!
# Search Console arayüzünden dizin / yeniden tarama isteği gönderilen gün bu betik KOŞMAZ.
# Kural: toplu API denetimi ile arayüz isteği aynı güne konmaz (07.10'da ~140 denetimli günde ilk
# arayüz isteği hata verdi; ilişki kanıtlı değil, kural yürürlükte). İstek günlerinde tek adreslik
# bakış yeter ve sonucu elle deney2-yeniden-tarama.tsv'ye yazılır:
#     node scripts/gsc-api.mjs denetle <url>
# Bu betik son istekten sonraki İLK İSTEKSİZ günde bir kez koşar, sonra yalnız okuma günlerinden önce
# (04.11 ara okuma, 17.11 nihai okuma). Yanlışlıkla koşmasın diye onay değişkeni ister.
#
# Ne yapar: iki kolun (baslik-deneyi-0710.json: tedavi, kontrol) son tarama zamanını çeker ve
#   deney2-tarama-gunlugu.tsv'ye "gün<TAB>kol<TAB>url<TAB>sonTarama" satırları EKLER.
# Sayfanın "yeni başlığa maruz kalma başlangıcı" = sonTarama >= YAYIN olan İLK koşudaki sonTarama.
# İlk taban (08.10 00:5x) deney2-yeniden-tarama.tsv'nin son_tarama_0810 sütununda durur.
#
# Kullanım (depo kökünden ya da herhangi bir yerden):
#     DENEY2_ISTEK_GUNU_DEGIL=1 zsh scratchpad-karne/pws0/deney2-tarama-gunlugu.sh
# Ham API çıktıları depoya yazılmaz: KARNE_SCRATCH (yoksa $TMPDIR) altına gider.
set -e
PWS0=${0:A:h}                       # bu betiğin klasörü: scratchpad-karne/pws0
KOK=${KOK:-${PWS0:h:h}}             # depo kökü (scripts/gsc-api.mjs burada)
CIKTI=${CIKTI:-$PWS0}               # günlüğün yazılacağı klasör
YAYIN="2026-10-06T22:17"            # PR #105 merge 06.10 22:16:55Z; sonrası yeni başlığı görür
BUGUN=$(date +%F)

if [[ "$DENEY2_ISTEK_GUNU_DEGIL" != "1" ]]; then
  echo "DURDU: bu betik istek günlerinde koşmaz (100 API denetimi)." >&2
  echo "Bugün Search Console arayüzünden istek gönderilmediyse ve gönderilmeyecekse:" >&2
  echo "  DENEY2_ISTEK_GUNU_DEGIL=1 zsh $0" >&2
  exit 2
fi
if [[ -f $CIKTI/deney2-tarama-gunlugu.tsv ]] && grep -q "^$BUGUN	" $CIKTI/deney2-tarama-gunlugu.tsv; then
  echo "DURDU: $BUGUN için günlükte zaten kayıt var (günde bir koşu yeter)." >&2
  exit 2
fi

GECICI=${KARNE_SCRATCH:-${TMPDIR:-/tmp}}/deney2-tarama-$BUGUN
mkdir -p $GECICI
for KOL in tedavi kontrol; do
  # adres listesi tek kaynaktan: kolların tanımlı olduğu dosya
  python3 -c 'import json, sys
d = json.load(open(sys.argv[1], encoding="utf-8"))
print("\n".join("https://www.siringayrimenkul.com/mahalleler/" + s for s in d[sys.argv[2]]))' \
    $PWS0/baslik-deneyi-0710.json $KOL > $GECICI/$KOL.txt
  node $KOK/scripts/gsc-api.mjs denetle-dosya $GECICI/$KOL.txt $GECICI/$KOL.tsv >/dev/null 2>$GECICI/$KOL.log
  HATA=$(awk -F'\t' '$2=="HATA"' $GECICI/$KOL.tsv | wc -l | tr -d ' ')
  SATIR=$(awk -F'\t' '$2!="HATA" && $4!=""' $GECICI/$KOL.tsv | wc -l | tr -d ' ')
  if [[ "$HATA" != "0" || "$SATIR" != "50" ]]; then
    echo "UYARI: $KOL kolunda $SATIR/50 adres okundu, $HATA hata (ayrıntı: $GECICI/$KOL.log). Günlüğe yalnız okunanlar yazıldı." >&2
  fi
  awk -F'\t' -v d=$BUGUN -v k=$KOL '$2!="HATA" && $4!="" {print d"\t"k"\t"$1"\t"$4}' $GECICI/$KOL.tsv >> $CIKTI/deney2-tarama-gunlugu.tsv
done
awk -F'\t' -v d=$BUGUN -v y=$YAYIN '$1==d {n[$2]++; if ($4>=y) m[$2]++}
  END {for (k in n) print d, k, "yayın sonrası taranan:", m[k]+0 "/" n[k]}' $CIKTI/deney2-tarama-gunlugu.tsv
