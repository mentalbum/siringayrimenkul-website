// Kompakt SERP çıkarıcısı — ekle-deney-kompakt.py'nin girdisi (javascript_tool ile TEK ifade).
// Neden var: uzun SERP listelerinde araç çıktısı kesiliyordu (deney-okuma-0410-gsc.md, 06.10);
// bu biçim yalnız n + ilk3 + BİZİM sonuçlarımızı taşır.
// Kaynak notu (08.10): 06.10'da kullanılan özgün JS depoya konmamıştı ve oturum kayıtlarında
// bulunamadı. Bu dosya serp-cikarici-0710.js'in çıkarım mantığından TÜRETİLDİ (aynı seçiciler,
// aynı cite/href sırası) ve gerçek SERP'te henüz denenmedi; ilk kullanımda bir sorguda
// serp-cikarici-0710.js çıktısıyla (sira, n) karşılaştır.
// Çıktı: {"n":10,"ilk3":["host/yol",…],"biz":[[sıra,"/yol","tam başlık"],…],"u_kaynak":"href"|"cite"|null}
//   biz[i][2] = Google'ın gösterdiği h3'ün TAMAMI (kesilmez; 'bas' 25 karakter kesmesini ekleyici yapar).
//   biz[i][1] = bağ gerçek adresse (google dışı href) gerçek yol. Bağ şifreliyse (/goto?url=…) yol
//               bilinmez: "cite:<kırıntı>" yazılır ve dogru-sayfa.py bunu "adresi doğrulanamayan" sayar.
//               Şifreli bağ kanalında site sorgusu için bu dosyayı DEĞİL serp-cikarici-0710.js +
//               ekle-uule.py'yi kullan (o ikili sayfayı tam başlıktan çözer).
(()=>{const A=[...document.querySelectorAll('#rso a')].filter(a=>a.querySelector('h3'));const T=[];const G=new Set();
for(const a of A){const c=a.closest('[data-hveid],div.MjjYud,div.g')||a.parentElement;const cs=c?[...c.querySelectorAll('cite')]:[];const cite=cs.find(e=>/^https?:\/\//.test(e.innerText.trim()))||cs[0]||null;
let ct=cite?cite.innerText.trim():'';let d='',p='',ks='',h=null;
try{const u=new URL(a.href);if(/^https?:$/.test(u.protocol)&&!/google\./.test(u.hostname))h=u}catch(e){}
if(/^https?:\/\//.test(ct)){const parts=ct.split('›').map(s=>s.trim());try{d=new URL(parts[0]).hostname.replace('www.','');}catch(e){d=parts[0]}if(h){p=h.pathname;ks='href'}else{p='/'+parts.slice(1).filter(s=>s!=='...'&&s!=='…').join('/');ks='cite'}}
else if(h){d=h.hostname.replace('www.','');p=h.pathname;ks='href'}else{d='?'+ct.slice(0,30)}
const t=a.querySelector('h3').innerText;const k=d+p+t;if(!G.has(k)){G.add(k);T.push({d,p,t,ct,ks})}}
const B=[];T.forEach((x,i)=>{if(x.d==='siringayrimenkul.com')B.push([i+1,x.ks==='href'?x.p:'cite:'+x.ct.slice(0,90),x.t])});
return JSON.stringify({n:T.length,ilk3:T.slice(0,3).map(x=>(x.d+x.p).slice(0,80)),biz:B,u_kaynak:B.length?T[B[0][0]-1].ks:null})})()
