// pws=0 SERP çıkarıcısı — 07.10.2026 sürümü (uygulama içi tarayıcı, javascript_tool ile TEK ifade).
// Neden yeni sürüm: Google organik bağları `/goto?url=CAES…` (şifreli) oldu; eski çıkarıcı
// (`#rso a[href^="http"]` + hostname) n=0 döndürüyor. Alan adı artık <cite> metninden okunur.
// Sınır: yol (p) cite kırıntısından güvenilir ÇIKMAZ ("› Mahalleler" gibi şema etiketleri gelir);
// bizim sonuçlarda sayfa, `biz` dizisindeki tam h3 başlığından (5. eleman) çözülür ve
// hedef-ekle.py'ye düzeltilmiş `u` ile verilir. Harita kutusu adları `.dbg0pd` (07.10'da geçerli).
// Kullanım: navigate → wait 4 → javascript_exec(bu dosyanın içeriği) ; çıktı JSON string.
(()=>{const N=[...document.querySelectorAll('.dbg0pd')].map(e=>e.innerText.trim()).filter(Boolean);
const A=[...document.querySelectorAll('#rso a')].filter(a=>a.querySelector('h3'));const T=[];const G=new Set();
for(const a of A){const c=a.closest('[data-hveid],div.MjjYud,div.g')||a.parentElement;const cite=c?c.querySelector('cite'):null;
let ct=cite?cite.innerText.trim():'';let d='',p='';
if(/^https?:\/\//.test(ct)){const parts=ct.split('›').map(s=>s.trim());try{d=new URL(parts[0]).hostname.replace('www.','');}catch(e){d=parts[0]}p='/'+parts.slice(1).filter(s=>s!=='...').join('/');}
else{try{const u=new URL(a.href);if(!/google\./.test(u.hostname)){d=u.hostname.replace('www.','');p=u.pathname}else{d='?'+ct.slice(0,30)}}catch(e){d='?'}}
const t=a.querySelector('h3').innerText;const k=d+p+t;if(!G.has(k)){G.add(k);T.push({d,p,t,ct})}}
const B=[];T.forEach((x,i)=>{if(x.d==='siringayrimenkul.com')B.push([i+1,x.p,x.t.slice(0,25),x.ct.slice(0,90),x.t])});
const loc=(document.body.innerText.match(/\n([^\n]{3,40})\n\s*∙\s*Bölge seç/)||[])[1]||'';
return JSON.stringify({q:(new URL(location.href)).searchParams.get('q'),sira:B.length?B[0][0]:0,u:B.length?B[0][1]:null,bas:B.length?B[0][2]:null,isgal:B.length,isgal_sira:B.map(b=>b[0]),biz:B,n:T.length,hp:N.length>0,hl:N.slice(0,6),ilk3:T.slice(0,3).map(x=>(x.d+x.p).slice(0,80)),loc,t:document.title.slice(0,60)})})()
