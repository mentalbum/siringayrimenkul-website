#!/bin/zsh
# 07.09 sabah rutini (kurul çürütmesi 05.09 + PLAN-06-09.md):
#  1) deney kollarının API okuması (kota yakmaz) → commit   2) PR #90 merge (yalnız page.tsx + kontrol kolu)
# Kullanım: KARNE_SCRATCH=<scratchpad> zsh scratchpad-karne/pws0/sabah-0709.sh
set -e
cd "$(dirname "$0")/../.."
S=${KARNE_SCRATCH:?KARNE_SCRATCH gerekli}
python3 - <<'PY' > "$S/deney-kollar-urller.txt"
import json
k=json.load(open('scratchpad-karne/pws0/tarama-deneyi-kollar.json'))
urls=[]
for kol in ('deney','kontrol','genisletme'):
    for u in k.get(kol,[]): urls.append(u if u.startswith('http') else 'https://www.siringayrimenkul.com'+u)
print('\n'.join(dict.fromkeys(urls)))
PY
echo "deney kolu URL: $(wc -l < "$S/deney-kollar-urller.txt")"
node scripts/gsc-api.mjs denetle-dosya "$S/deney-kollar-urller.txt" scratchpad-karne/pws0/deney-kollar-okuma-0709.tsv
git add scratchpad-karne/pws0/deney-kollar-okuma-0709.tsv
git commit -qm "Tarama deneyi kollari 07.09 sabah API okumasi (merge oncesi anlik goruntu)" && git push -q
echo "--- PR #90 ---"; gh pr checks 90 | head -3
gh pr merge 90 --merge --delete-branch
git pull -q --ff-only && git log --oneline -1
