// pws=0 SERP çıkarıcısı — 07.10.2026 sürümü (uygulama içi tarayıcı, javascript_tool ile TEK ifade).
// Neden yeni sürüm: Google organik bağları `/goto?url=CAES…` (şifreli) oldu; eski çıkarıcı
// (`#rso a[href^="http"]` + hostname) n=0 döndürüyor. Alan adı artık <cite> metninden okunur.
// Sınır: yol (p) cite kırıntısından güvenilir ÇIKMAZ ("› Mahalleler" gibi şema etiketleri gelir);
// bizim sonuçlarda sayfa, `biz` dizisindeki tam h3 başlığından (5. eleman) çözülür ve
// hedef-ekle.py'ye düzeltilmiş `u` ile verilir. Harita kutusu adları `.dbg0pd` (07.10'da geçerli).
// Kullanım: navigate → wait 4 → javascript_exec(bu dosyanın içeriği) ; çıktı JSON string.
//
// 08.10 ekleri (karne incelemesi: ana-2, ye-2, ek-4). `biz` satır düzeni DEĞİŞMEDİ:
//   biz[i] = [sıra, yol, başlık25, cite90, tamBaşlık]   (5 eleman; [4] = Google'ın gösterdiği h3'ün tamamı)
// Yeni alanlar tepe düzeyde; eski `bas` 25 karakter olarak kalır:
//   bas_tam     : ilk sonucumuzun başlığının TAMAMI (= biz[0][4]). Başlık deneyi 2 okuması buna bakar.
//   kap         : ilk sonucumuzun sonuç kutusu metni (site adı satırı + cite + başlık + kesit), en çok 300
//                 karakter. Kayda yalnız hedef sorgularda geçer (hedef-ekle.py). Kutu div.MjjYud; o sınıf
//                 yoksa aynı sonucun içinde kalan en geniş üst öğe. kap boş ya da yalnız başlık + cite
//                 geliyorsa kapsayıcı bir üst öğeye alınmalı (ilk ölçümde gözle doğrula).
//   u_kaynak    : ilk sonucumuzun yolu nereden okundu: "href" (gerçek bağ, güvenilir) ya da "cite" (kırıntı,
//                 güvenilmez; ekle-uule.py sayfayı tam başlıktan çözer).
//   biz_k       : aynı bilgi, `biz` satırlarıyla aynı sırada.
//   isgal_diger : sitemiz DIŞINDAKİ varlıklarımızın sıraları, [[sıra, "sahibinden"|"instagram"|"tiktok"|"facebook"], …].
//                 Eşleşme tam ana makine + yol: eryamansiringayrimenkul.sahibinden.com,
//                 instagram.com/eryamansiringayrimenkul, tiktok.com/@siringayrimenkul,
//                 facebook.com/eryamanemlakci, facebook.com/…61585267540417. "eryamanemlakci" Instagram ve
//                 TikTok'ta BİZİM DEĞİL, sayılmaz. `isgal` yeniden tanımlanmadı (yalnız siringayrimenkul.com).
//                 Bağ şifreli ve cite adres taşımıyorsa (sosyal sonuçta cite "70+ takipçi" geliyor) kutunun
//                 içinde metni TAM olarak "Instagram · <kullanıcı adı>" olan öğeye bakılır. Bu yedek yol
//                 gerçek SERP'te DENENMEDİ; ilk turda elle doğrula.
// Yol: bağ gerçek adresse (google dışı href) yol oradan alınır; değilse cite kırıntısından (07.10 davranışı).
(()=>{const N=[...document.querySelectorAll('.dbg0pd')].map(e=>e.innerText.trim()).filter(Boolean);
const R=document.querySelector('#rso');const A=[...document.querySelectorAll('#rso a')].filter(a=>a.querySelector('h3'));const T=[];const G=new Set();
for(const a of A){const c=a.closest('[data-hveid],div.MjjYud,div.g')||a.parentElement;const cs=c?[...c.querySelectorAll('cite')]:[];const cite=cs.find(e=>/^https?:\/\//.test(e.innerText.trim()))||cs[0]||null;
let ct=cite?cite.innerText.trim():'';let d='',p='',ks='',h=null;
try{const u=new URL(a.href);if(/^https?:$/.test(u.protocol)&&!/google\./.test(u.hostname))h=u}catch(e){}
if(/^https?:\/\//.test(ct)){const parts=ct.split('›').map(s=>s.trim());try{d=new URL(parts[0]).hostname.replace('www.','');}catch(e){d=parts[0]}if(h){p=h.pathname;ks='href'}else{p='/'+parts.slice(1).filter(s=>s!=='...'&&s!=='…').join('/');ks='cite'}}
else if(h){d=h.hostname.replace('www.','');p=h.pathname;ks='href'}else{d='?'+ct.slice(0,30)}
let K=a.closest('div.MjjYud');if(!K){K=c;while(K&&R&&K.parentElement&&K.parentElement!==R&&R.contains(K.parentElement)&&K.parentElement.querySelectorAll('h3').length===K.querySelectorAll('h3').length)K=K.parentElement}
const t=a.querySelector('h3').innerText;const k=d+p+t;if(!G.has(k)){G.add(k);T.push({d,p,t,ct,ks,K,q:h?h.search:''})}}
const B=[];T.forEach((x,i)=>{if(x.d==='siringayrimenkul.com')B.push([i+1,x.p,x.t.slice(0,25),x.ct.slice(0,90),x.t])});
const VAR=x=>{const m=x.d.replace(/^(m|tr-tr|mobile)\./,'');const s=(x.p.split('/')[1]||'').toLowerCase();
if(m==='eryamansiringayrimenkul.sahibinden.com')return 'sahibinden';if(m==='instagram.com'&&s==='eryamansiringayrimenkul')return 'instagram';if(m==='tiktok.com'&&s==='@siringayrimenkul')return 'tiktok';
if(m==='facebook.com'&&(s==='eryamanemlakci'||/(^|[^0-9])61585267540417([^0-9]|$)/.test(x.p+x.q)))return 'facebook';
if(x.d[0]==='?'&&x.K){for(const e of x.K.querySelectorAll('span,div,cite')){if(e.children.length)continue;const y=(e.innerText||'').trim().match(/^(Instagram|TikTok|Facebook)\s*·\s*@?([\w.]+)$/i);if(y){const pl=y[1].toLowerCase(),hd=y[2].toLowerCase();return (pl==='instagram'&&hd==='eryamansiringayrimenkul')||(pl==='tiktok'&&hd==='siringayrimenkul')||(pl==='facebook'&&hd==='eryamanemlakci')?pl:null}}}return null};
const D=T.map((x,i)=>[i+1,VAR(x)]).filter(y=>y[1]);const F=B.length?T[B[0][0]-1]:null;
const loc=(document.body.innerText.match(/\n([^\n]{3,40})\n\s*∙\s*Bölge seç/)||[])[1]||'';
return JSON.stringify({q:(new URL(location.href)).searchParams.get('q'),sira:B.length?B[0][0]:0,u:B.length?B[0][1]:null,bas:B.length?B[0][2]:null,bas_tam:B.length?B[0][4]:null,u_kaynak:F?F.ks:null,isgal:B.length,isgal_sira:B.map(b=>b[0]),isgal_diger:D,biz:B,biz_k:B.map(b=>T[b[0]-1].ks),kap:F&&F.K?(F.K.innerText||'').replace(/\s+/g,' ').trim().slice(0,300):null,n:T.length,hp:N.length>0,hl:N.slice(0,6),ilk3:T.slice(0,3).map(x=>(x.d+x.p).slice(0,80)),loc,t:document.title.slice(0,60)})})()
