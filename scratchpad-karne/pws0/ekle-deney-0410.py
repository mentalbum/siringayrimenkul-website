# Kullanım: python3 ekle.py '<slug>' '<q>' '<kol>' '<json: {"n":..,"sonuc":[[host+path,baslik],...]}>'
import json,sys,datetime,re
s,q,kol,ham=sys.argv[1],sys.argv[2],sys.argv[3],json.loads(sys.argv[4])
mah=s.split('/')[0]; kendi='/mahalleler/'+s; ilk=[]; sira=None; u=None; bas=None; isgal=[]
for i,(hp,b) in enumerate(ham.get('sonuc',[]),1):
    ilk.append(hp[:80])
    if hp.startswith('siringayrimenkul.com') or hp.startswith('www.siringayrimenkul.com'):
        path=re.sub(r'^(www\.)?siringayrimenkul\.com','',hp)
        isgal.append(i)
        if sira is None: sira=i; u=path; bas=(b or '')[:25]
rec={"d":datetime.date.today().isoformat(),"kanal":"deney-0410","tur":"site","mah":mah,"s":s,"q":q,"sira":sira or 0,"u":u,"bas":bas,"ilk3":ilk[:3],"isgal":len(isgal),"isgal_sira":isgal,"n":ham.get('n',0),"hl":[],"s2sira":None,"s2u":None,"not":kol}
open('/Users/ozgun/websitem/scratchpad-karne/pws0/sonuclar-site-emlakci.jsonl','a').write(json.dumps(rec,ensure_ascii=False)+'\n')
print(f"{s} → sira {rec['sira']} u {u} n {rec['n']}")
