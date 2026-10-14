#!/usr/bin/env python3
"""deney2-isaretle.py (15.10'da depoya alındı; scratchpad siliniyor)
tsv-isaretle.py <url_kuyruk> <kol> <deger>  — deney2-yeniden-tarama.tsv satırını işaretler.
kol: 'kendiliginden' → sira='-' ve ilk_tarama_yayin_sonrasi=deger ; 'istek' → istek_zamani=deger"""
import sys
P='/Users/ozgun/websitem/scratchpad-karne/pws0/deney2-yeniden-tarama.tsv'
u,kol,deger=sys.argv[1:4]
if kol not in ('kendiliginden','istek'): sys.exit(f"kol 'kendiliginden' ya da 'istek' olmalı, verilen: {kol} (15.10 dersi: yanlış kol adı istek zamanını ezdi)")
L=open(P,encoding='utf-8').read().split('\n'); hdr=None; n=0
for i,l in enumerate(L):
    if l.startswith('#') or not l.strip(): continue
    p=l.split('\t')
    if hdr is None: hdr=p; continue
    if p[hdr.index('url')]==u:
        if kol=='kendiliginden': p[hdr.index('sira')]='-'; p[hdr.index('ilk_tarama_yayin_sonrasi')]=deger; p[hdr.index('yayin_sonrasi_taranmis')]='evet'
        else: p[hdr.index('istek_zamani')]=deger
        L[i]='\t'.join(p); n+=1
open(P,'w',encoding='utf-8').write('\n'.join(L)); print('işaretlendi',n,u.split('/')[-1],kol,deger)
