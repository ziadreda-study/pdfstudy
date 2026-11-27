export default function start(){

(function(){
const $=s=>document.querySelector(s);
const __T=x=>(window.I18N&&window.I18N.t)?window.I18N.t(x):x,__L=()=>window.I18N?window.I18N.lang():'ar',__D=()=>window.I18N?window.I18N.dir():'rtl';
pdfjsLib.GlobalWorkerOptions.workerSrc='inline-worker.js';
const st=(m,bad)=>{try{window.__setStatus&&window.__setStatus(m,bad)}catch(e){}};
const main=$('#main');
let pdf=null,pdfBytes=null,fileName='file.pdf',pages=[],scale=1.2,tool='hand',color='#e03131',size=3;
let ann={},hist=[],hpos=-1,key='';let notes={},cards={},focusI=0,savedScale=1,REC=null;const ptrs=new Set();let cancelers=[];function cancelAll(){cancelers.forEach(f=>{try{f()}catch(e){}})}
['pointerdown'].forEach(t=>document.addEventListener(t,e=>{if(e.pointerType=='touch'){ptrs.add(e.pointerId);if(ptrs.size>1)cancelAll()}},true));
['pointerup','pointercancel'].forEach(t=>document.addEventListener(t,e=>{ptrs.delete(e.pointerId);0},true));
const colors=['#e03131','#1971c2','#2f9e44','#000000','#f08c00','#ffe066','#ff8cc8'];
const toast=m=>{const t=$('#toast');t.textContent=m;t.style.display='block';clearTimeout(toast.t);toast.t=setTimeout(()=>t.style.display='none',2600)};
// swatches
colors.forEach(c=>{const b=document.createElement('button');b.className='sw';b.style.background=c;b.onclick=()=>setTxtColor(c);$('#sw').appendChild(b)});
function mark(){document.querySelectorAll('.sw').forEach(b=>b.classList.toggle('on',rgb2hex(b.style.background)==color.toLowerCase()))}
function rgb2hex(s){const m=s.match(/\d+/g);return m?'#'+m.slice(0,3).map(x=>(+x).toString(16).padStart(2,'0')).join(''):s}
$('#color').oninput=e=>{if(sel&&sel.o)setTxtColor(e.target.value);else{color=e.target.value;mark()}};
$('#size').oninput=e=>size=+e.target.value;
document.querySelectorAll('[data-tool]').forEach(b=>b.onclick=()=>setTool(b.dataset.tool));
function setTool(t){const chg=(t!=tool);tool=t;if(chg&&t!='text')clearSel();document.querySelectorAll('[data-tool]').forEach(b=>b.classList.toggle('on',b.dataset.tool==t));
 document.querySelectorAll('canvas.ov').forEach(c=>{const hh=t=='hand'||t=='explain';c.style.touchAction=hh?'auto':'none';c.style.pointerEvents=hh?'none':'auto';c.style.cursor=t=='text'?'text':'crosshair'});}
mark();
// open
let virtual=false,textCache={},bms=new Set();
function unsup(ext){const m='📄 الملف ده ('+(ext?'.'+ext:'من غير امتداد')+') مش بيتفتح هنا. افتحه ببرنامجه واحفظه PDF أو PowerPoint (pptx) أو Word (docx) أو صورة، وبعدين اختاره تاني.';st(m,true);toast('النوع ده مش مدعوم، احفظه PDF أو pptx أو docx')}
function openFile(f){if(!f)return;fileName=f.name;toast('بيفتح الملف...');st('1/4 قراءة الملف: '+f.name+' ('+Math.round(f.size/1024)+' KB)');
 const ext=(f.name.split('.').pop()||'').toLowerCase();
 const run=async buf=>{try{
  if(ext=='pdf'||f.type=='application/pdf')await loadBytes(buf);
  else if(ext=='pptx')await loadVirtual(await pptxPages(buf));
  else if(ext=='docx')await loadVirtual(await docxPages(buf));
  else if(/^(txt|md|csv|json|log|text)$/.test(ext))await loadVirtual(textPages(new TextDecoder().decode(buf)));
  else if(f.type.startsWith('image/')||/^(png|jpe?g|webp|gif|bmp)$/.test(ext))await loadVirtual([await imagePage(f)]);
  else if(ext=='ppt')await loadVirtual(pptLegacyPages(buf));
  else if(ext=='doc')await loadVirtual(textPages(docLegacyText(buf)));
  else if(/^(xls|xlsx|odp|odt|rtf)$/.test(ext)){unsup(ext)}
  else{const u=new Uint8Array(buf.slice?buf.slice(0,4):buf),m=String.fromCharCode(...u);
   if(m=='%PDF')await loadBytes(buf);
   else if(m.slice(0,2)=='PK'){try{await loadVirtual(await pptxPages(buf))}catch(e1){try{await loadVirtual(await docxPages(buf))}catch(e2){unsup(ext)}}}
   else if(u[0]==0xD0&&u[1]==0xCF){try{await loadVirtual(pptLegacyPages(buf))}catch(a){try{await loadVirtual(textPages(docLegacyText(buf)))}catch(b){unsup(ext)}}}
   else unsup(ext)}
 }catch(err){st('فشل: '+(err&&err.message||err),true);toast('حصل خطأ: '+(err&&err.message||err))}};
 const viaReader=()=>{const r=new FileReader();r.onerror=()=>{st('مقدرتش أقرأ الملف: '+(r.error&&r.error.name),true)};r.onload=()=>run(r.result);r.readAsArrayBuffer(f)};
 try{f.arrayBuffer().then(run,e=>{st('arrayBuffer فشل ('+(e&&e.name)+')، بجرب طريقة تانية...',true);viaReader()})}catch(e){viaReader()}}
let lastPick=null;
function onPick(e){const inp=e.target,f=inp.files&&inp.files[0];if(!f){toast('مفيش ملف اتختار');return}
 if(lastPick===f)return;lastPick=f;toast('اتختار: '+f.name+' ('+Math.round(f.size/1024)+' KB)');openFile(f)}
['#file','#file2'].forEach(s=>{$(s).addEventListener('change',onPick);$(s).addEventListener('input',onPick);$(s).addEventListener('click',()=>{lastPick=null;toast('بيفتح اختيار الملفات...')})})
document.addEventListener('dragover',e=>{e.preventDefault();document.body.classList.add('dragover')});
document.addEventListener('dragleave',()=>document.body.classList.remove('dragover'));
document.addEventListener('drop',e=>{e.preventDefault();document.body.classList.remove('dragover');openFile(e.dataTransfer.files[0])});
async function loadBytes(buf){
 virtual=false;st('2/4 تم قراءة '+buf.byteLength+' بايت، بفتح الـPDF...');pdfBytes=new Uint8Array(buf.slice(0));
 try{pdf=await pdfjsLib.getDocument({data:new Uint8Array(buf.slice(0)),isEvalSupported:false}).promise}catch(e){st('فشل فتح الـPDF: '+(e&&(e.name+' '+e.message)||e),true);toast('الملف ده مش PDF سليم أو متشفّر');return}
 await finishLoad(pdfBytes.length);
}
async function loadVirtual(pgs){if(!pgs.length){toast('مفيش محتوى في الملف');return}virtual=true;pdfBytes=null;pdf={numPages:pgs.length,getPage:async i=>pgs[i-1]};await finishLoad(pgs.length)}
async function finishLoad(sz){
 clearSel();key='pdfstudy:'+fileName+':'+sz;ann={};textCache={};bms=new Set();
 try{const s=localStorage.getItem(key);if(s)ann=JSON.parse(s)}catch(e){}
 hist=[JSON.stringify(ann)];hpos=0;notes={};try{notes=JSON.parse(localStorage.getItem(key+':notes')||'{}')}catch(e){}loadCards();focusI=0;main.classList.remove('focus');$('#xbtn').style.display='none';
 st('3/4 فتح الـPDF تمام ('+pdf.numPages+' صفحة)، برسم الصفحات...');await build(true);st('4/4 تم ✓ '+fileName+' · '+pdf.numPages+' صفحة');
 $('#info').textContent=fileName+' · '+pdf.numPages+' صفحة';$('#pt').textContent='/'+pdf.numPages;$('#pn').max=pdf.numPages;$('#pn').value=1;
}

async function build(fit){
 main.innerHTML='';pages=[];cancelers=[];
 const p1=await pdf.getPage(focusI||1);
 if(fit){const mm=document.getElementById('main');lastW=mm.clientWidth;const v1=p1.getViewport({scale:1});let sc=((mm.clientWidth||innerWidth)-24)/v1.width;if((focusI||document.getElementById('wrap').classList.contains('land'))&&mm.clientHeight>120)sc=Math.min(sc,(mm.clientHeight-28)/v1.height);scale=Math.min(2,Math.max(.15,sc))}
 zlabel();
 const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){const pg=pages[+e.target.dataset.i];if(!pg.done){pg.done=true;renderPage(pg)}}}),{rootMargin:'800px'});
 for(let i=1;i<=pdf.numPages;i++){
  const page=await pdf.getPage(i),vp=page.getViewport({scale});
  const div=document.createElement('div');div.className='page';div.dataset.i=i-1;div.style.width=vp.width+'px';div.style.height=vp.height+'px';
  main.appendChild(div);
  pages.push({i,page,div,vp,done:false});io.observe(div);
 }
 pages.forEach(renderNotes);if(focusI&&pages[focusI-1])pages[focusI-1].div.classList.add('foc');
 if(sel){const sp=pages[sel.i-1];if(sp&&sp.ov)showBar(sp,sel.o);else if(!sp)clearSel()}
 setTool(tool);
}
function zlabel(){$('#zv').textContent=Math.round(scale/1.2*100)+'%'}
async function renderPage(pg){
 const {page,div,vp}=pg,dpr=Math.min(2,window.devicePixelRatio||1);
 const c=document.createElement('canvas');c.width=vp.width*dpr;c.height=vp.height*dpr;c.style.width=vp.width+'px';c.style.height=vp.height+'px';
 div.appendChild(c);
 try{await page.render({canvasContext:c.getContext('2d'),viewport:page.getViewport({scale:scale*dpr})}).promise}catch(e){st('فشل رسم صفحة '+pg.i+': '+(e&&e.message||e),true);throw e}
 const o=document.createElement('canvas');o.className='ov';o.width=vp.width*dpr;o.height=vp.height*dpr;o.style.width=vp.width+'px';o.style.height=vp.height+'px';
 div.appendChild(o);buildTL(pg,o);pg.ov=o;pg.dpr=dpr;attach(pg);redraw(pg);setTool(tool);if(sel&&sel.i==pg.i)showBar(pg,sel.o);
}
// drawing model: coords in PDF-point units (scale 1)
function list(i){return ann[i]=ann[i]||[]}

// ===== v7: advanced text objects (select, move, resize, color, edit) =====
let sel=null,bar=null,lastTapT=0,lastTapO=null;
function tFs(o){return o.fs||14}
function tLines(o){return String(o.v==null?'':o.v).split('\n')}
function tWidth(o){const c=mc;c.font=(o.b?'bold ':'')+tFs(o)+'px '+FF;let w=0;tLines(o).forEach(l=>{c.direction=RTL(l)?'rtl':'ltr';w=Math.max(w,c.measureText(l).width)});return Math.max(w,tFs(o)*.6)}
function tHeight(o){return tLines(o).length*tFs(o)*1.25}
function tBox(o){return[o.x,o.y,o.x+tWidth(o),o.y+tHeight(o)]}
function tPad(){return 8/scale}
function tCorners(o){const b=tBox(o),p=tPad();return[[b[0]-p,b[1]-p],[b[2]+p,b[1]-p],[b[0]-p,b[3]+p],[b[2]+p,b[3]+p]]}
function tHandleAt(o,x,y){const c=tCorners(o),t=Math.max(11,22/scale);for(let i=0;i<4;i++)if(Math.abs(x-c[i][0])<=t&&Math.abs(y-c[i][1])<=t)return i;return -1}
function tAt(pg,x,y){const L=list(pg.i-1),p=4/scale;for(let i=L.length-1;i>=0;i--){const a=L[i];if(a.t!='text')continue;const b=tBox(a);if(x>=b[0]-p&&x<=b[2]+p&&y>=b[1]-p&&y<=b[3]+p)return a}return null}
function hideBar(){if(bar){bar.remove();bar=null}}
function clearSel(){if(sel){sel=null;hideBar();pages.forEach(redraw)}}
function selPageOf(){return sel?pages[sel.i-1]:null}
function drawSel(ctx,pg,o,k){const b=tBox(o),p=tPad(),c=tCorners(o);
 ctx.save();ctx.setLineDash([7*pg.dpr,5*pg.dpr]);ctx.lineWidth=1.6*pg.dpr;ctx.strokeStyle='#7d8bff';
 ctx.strokeRect((b[0]-p)*k,(b[1]-p)*k,(b[2]-b[0]+2*p)*k,(b[3]-b[1]+2*p)*k);ctx.setLineDash([]);
 const hs=6.5/scale;c.forEach(q=>{ctx.beginPath();ctx.fillStyle='#fff';ctx.strokeStyle='#7d8bff';ctx.lineWidth=2*pg.dpr;
  if(ctx.roundRect)ctx.roundRect((q[0]-hs)*k,(q[1]-hs)*k,2*hs*k,2*hs*k,3*pg.dpr);else ctx.rect((q[0]-hs)*k,(q[1]-hs)*k,2*hs*k,2*hs*k);ctx.fill();ctx.stroke()});
 ctx.restore()}
function setTxtColor(c){color=c;const ci=$('#color');if(ci)ci.value=c;mark();
 if(sel&&sel.o){sel.o.c=c;commit();const pg=selPageOf();if(pg){redraw(pg);showBar(pg,sel.o)}}}
function scaleTxt(f){if(!sel||!sel.o)return;const o=sel.o;o.fs=Math.max(6,Math.min(200,tFs(o)*f));commit();const pg=selPageOf();if(pg){redraw(pg);showBar(pg,o)}}
function selectObj(pg,o){sel={i:pg.i,o};redraw(pg);showBar(pg,o)}
function placeBar(pg,o){if(!bar)return;const b=tBox(o),W=pg.div.clientWidth,H=pg.div.clientHeight;
 bar.style.top='-9999px';bar.style.left='0px';
 const bh=bar.offsetHeight||48,bw=bar.offsetWidth||0;
 let top=b[1]*scale-bh-22;if(top<4)top=b[3]*scale+14;if(top+bh>H-4)top=Math.max(4,H-bh-4);
 bar.style.top=Math.round(top)+'px';
 bar.style.left=Math.round(Math.max(2,Math.min(Math.max(2,W-bw-2),b[0]*scale)))+'px'}
function showBar(pg,o){hideBar();const b=document.createElement('div');b.className='txbar';b.dir='ltr';
 const mk=(txt,title,fn,cls)=>{const e=document.createElement('button');e.type='button';e.textContent=txt;if(title)e.title=title;if(cls)e.className=cls;
  e.onpointerdown=ev=>{ev.preventDefault();ev.stopPropagation()};e.onclick=ev=>{ev.preventDefault();ev.stopPropagation();fn()};b.appendChild(e);return e};
 colors.forEach(c=>{const q=document.createElement('button');q.type='button';q.className='sw2'+(String(o.c).toLowerCase()==c.toLowerCase()?' on':'');q.style.background=c;q.title='لون';
  q.onpointerdown=ev=>{ev.preventDefault();ev.stopPropagation()};q.onclick=ev=>{ev.preventDefault();ev.stopPropagation();setTxtColor(c)};b.appendChild(q)});
 mk('A−','تصغير الخط',()=>scaleTxt(1/1.15));
 mk('A+','تكبير الخط',()=>scaleTxt(1.15));
 mk('B','عريض',()=>{o.b=!o.b;commit();redraw(pg);showBar(pg,o)},o.b?'on':'');
 mk('✏️','تعديل النص',()=>editText(pg,o));
 mk('⧉','تكرار',()=>{const c={t:'text',c:o.c,x:o.x+10,y:o.y+10,fs:o.fs,v:o.v};if(o.b)c.b=1;list(pg.i-1).push(c);commit();redraw(pg);selectObj(pg,c)});
 mk('🗑','حذف',()=>{ann[pg.i-1]=list(pg.i-1).filter(z=>z!==o);clearSel();commit()},'del');
 mk('✓','تم',()=>clearSel(),'ok');
 pg.div.appendChild(b);bar=b;placeBar(pg,o)}
function drawObj(ctx,o,k){ // k = pixels per unit
 ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
 if(o.t=='pen'||o.t=='hl'){
  ctx.strokeStyle=o.c;ctx.lineWidth=o.s*k*(o.t=='hl'?4:1);ctx.globalAlpha=o.t=='hl'?.35:1;
  const p=o.p;ctx.beginPath();ctx.moveTo(p[0]*k,p[1]*k);
  if(p.length==2)ctx.lineTo(p[0]*k+.01,p[1]*k);
  for(let j=2;j<p.length-2;j+=2){ctx.quadraticCurveTo(p[j]*k,p[j+1]*k,(p[j]+p[j+2])/2*k,(p[j+1]+p[j+3])/2*k)}
  if(p.length>=4)ctx.lineTo(p[p.length-2]*k,p[p.length-1]*k);
  ctx.stroke();
 }else if(o.t=='rect'){ctx.globalAlpha=.35;ctx.fillStyle=o.c;ctx.fillRect(o.x*k,o.y*k,o.w*k,o.h*k)}
 else if(o.t=='text'){ctx.fillStyle=o.c;ctx.font=(o.b?'bold ':'')+(tFs(o)*k)+'px '+FF;ctx.textBaseline='top';ctx.textAlign='left';
  tLines(o).forEach((ln,j)=>{ctx.direction=RTL(ln)?'rtl':'ltr';ctx.fillText(ln,o.x*k,(o.y+j*tFs(o)*1.25)*k)})}
 ctx.restore();
}
function redraw(pg,extra){
 if(!pg.ov)return;const ctx=pg.ov.getContext('2d');ctx.clearRect(0,0,pg.ov.width,pg.ov.height);
 const k=scale*pg.dpr;list(pg.i-1).forEach(o=>drawObj(ctx,o,k));if(extra)drawObj(ctx,extra,k);
 if(sel&&sel.i==pg.i)drawSel(ctx,pg,sel.o,k);
}
function bbox(o,ctx){
 if(o.t=='rect')return[o.x,o.y,o.x+o.w,o.y+o.h];
 if(o.t=='text')return tBox(o);
 let a=1e9,b=1e9,c=-1e9,d=-1e9;for(let j=0;j<o.p.length;j+=2){a=Math.min(a,o.p[j]);c=Math.max(c,o.p[j]);b=Math.min(b,o.p[j+1]);d=Math.max(d,o.p[j+1])}return[a,b,c,d]}
function hit(o,x,y,r){
 if(o.t=='pen'||o.t=='hl'){const w=r+o.s*(o.t=='hl'?2:.5);for(let j=0;j<o.p.length;j+=2){if(Math.hypot(o.p[j]-x,o.p[j+1]-y)<w)return true}
  for(let j=0;j<o.p.length-2;j+=2){const mx=(o.p[j]+o.p[j+2])/2,my=(o.p[j+1]+o.p[j+3])/2;if(Math.hypot(mx-x,my-y)<w)return true}return false}
 const b=bbox(o);return x>=b[0]-r&&x<=b[2]+r&&y>=b[1]-r&&y<=b[3]+r}
function commit(){const s=JSON.stringify(ann);hist=hist.slice(0,hpos+1);hist.push(s);hpos=hist.length-1;persist()}
function persist(){try{localStorage.setItem(key,JSON.stringify(ann))}catch(e){}}
function restore(){clearSel();ann=JSON.parse(hist[hpos]);pages.forEach(redraw);persist()}
$('#undo').onclick=()=>{if(hpos>0){hpos--;restore()}};
$('#redo').onclick=()=>{if(hpos<hist.length-1){hpos++;restore()}};
function attach(pg){
 const o=pg.ov;let cur=null,drag=false,changed=false,mv=null;
 cancelers.push(()=>{if(drag||cur||mv){const ch=changed;if(mv&&mv.k=='resize'){mv.o.fs=mv.fs0;mv.o.x=mv.x0;mv.o.y=mv.y0}
  cur=null;mv=null;drag=false;changed=false;redraw(pg);if(ch)commit()}});
 const pos=e=>{const r=o.getBoundingClientRect();return[(e.clientX-r.left)/scale,(e.clientY-r.top)/scale]};
 o.addEventListener('pointerdown',e=>{
  if(tool=='hand')return;e.preventDefault();if(ptrs.size>1||pinching){cancelAll();return}const [x,y]=pos(e);
  if(tool=='text'){
   if(sel&&sel.i==pg.i){
    const h=tHandleAt(sel.o,x,y);
    if(h>=0){const oo=sel.o,cs=tCorners(oo),ai=3-h,A=cs[ai];
     o.setPointerCapture(e.pointerId);drag=true;changed=false;
     mv={k:'resize',o:oo,fs0:oo.fs,x0:oo.x,y0:oo.y,ax:A[0],ay:A[1],right:(ai==1||ai==3),bottom:(ai==2||ai==3),d0:Math.max(6,Math.hypot(x-A[0],y-A[1]))};
     return}
   }
   const hit=tAt(pg,x,y);
   if(hit){const now=Date.now();
    if(lastTapO===hit&&now-lastTapT<420){lastTapO=null;lastTapT=0;editText(pg,hit);return}
    lastTapT=now;lastTapO=hit;selectObj(pg,hit);
    o.setPointerCapture(e.pointerId);drag=true;changed=false;mv={k:'move',o:hit,x0:hit.x,y0:hit.y,px:x,py:y};return}
   clearSel();startText(pg,x,y);return}
  o.setPointerCapture(e.pointerId);drag=true;changed=false;
  if(tool=='pen'||tool=='hl')cur={t:tool,c:color,s:size,p:[x,y]};
  else if(tool=='rect')cur={t:'rect',c:color,x,y,w:0,h:0,x0:x,y0:y};
  else if(tool=='eraser')eraseAt(x,y);
 });
 o.addEventListener('pointermove',e=>{
  if(!drag)return;e.preventDefault();if(ptrs.size>1||pinching){cancelAll();return}const [x,y]=pos(e);
  if(mv){const oo=mv.o;
   if(mv.k=='resize'){const d=Math.hypot(x-mv.ax,y-mv.ay),f=Math.max(.12,Math.min(14,d/mv.d0));
    oo.fs=Math.max(6,Math.min(200,mv.fs0*f));const w=tWidth(oo),h=tHeight(oo);
    oo.x=mv.right?mv.ax-w:mv.ax;oo.y=mv.bottom?mv.ay-h:mv.ay}
   else{const W=pg.vp.width,H=pg.vp.height,w=tWidth(oo),h=tHeight(oo);
    oo.x=Math.max(-w+12,Math.min(W-12,mv.x0+(x-mv.px)));oo.y=Math.max(-h+12,Math.min(H-12,mv.y0+(y-mv.py)))}
   changed=true;redraw(pg);placeBar(pg,oo);return}
  if(tool=='eraser'){eraseAt(x,y);return}
  if(cur.t=='rect'){cur.x=Math.min(x,cur.x0);cur.y=Math.min(y,cur.y0);cur.w=Math.abs(x-cur.x0);cur.h=Math.abs(y-cur.y0)}
  else{const p=cur.p,dx=x-p[p.length-2],dy=y-p[p.length-1];if(dx*dx+dy*dy>.3)p.push(x,y)}
  redraw(pg,cur);
 });
 const up=e=>{if(!drag)return;drag=false;
  if(mv){const m=mv;mv=null;
   if(m.k=='move'&&Math.abs(m.o.x-m.x0)<.5&&Math.abs(m.o.y-m.y0)<.5)redraw(pg);else commit();
   if(sel&&sel.i==pg.i)placeBar(pg,sel.o);return}
  if(cur){if(cur.t!='rect'||(cur.w>2&&cur.h>2)){delete cur.x0;delete cur.y0;list(pg.i-1).push(cur);commit()}cur=null;redraw(pg)}
  else if(changed)commit()};
 o.addEventListener('pointerup',up);o.addEventListener('pointercancel',up);
 function eraseAt(x,y){const L=list(pg.i-1),n=L.length;ann[pg.i-1]=L.filter(a=>!hit(a,x,y,6));if(ann[pg.i-1].length!=n){changed=true;if(sel&&!ann[pg.i-1].includes(sel.o))clearSel();redraw(pg)}}
}
function startText(pg,x,y,ed){
 const ta=document.createElement('textarea');ta.className='tx';ta.dir='auto';
 const fs=ed?tFs(ed):Math.max(10,size*2+8);
 ta.style.left=(ed?ed.x:x)*scale+'px';ta.style.top=(ed?ed.y:y)*scale+'px';
 ta.style.fontSize=fs*scale+'px';ta.style.color=ed?ed.c:color;ta.style.lineHeight='1.25';
 if(ed){ta.value=ed.v;ta.style.fontWeight=ed.b?'700':'400';ta.style.minWidth=Math.max(140,Math.min(pg.vp.width*scale-16,tWidth(ed)*scale+30))+'px'}
 pg.div.appendChild(ta);
 const fit=()=>{ta.style.height='auto';ta.style.height=Math.max(38,ta.scrollHeight)+'px'};ta.addEventListener('input',fit);setTimeout(fit,0);
 ta.focus();try{ta.setSelectionRange(ta.value.length,ta.value.length)}catch(e){}
 let done=false;
 const fin=()=>{if(done)return;done=true;const v=ta.value.replace(/\s+$/,'');ta.remove();
  if(ed){if(v){ed.v=v;commit();redraw(pg);selectObj(pg,ed)}else{ann[pg.i-1]=list(pg.i-1).filter(z=>z!==ed);clearSel();commit()}}
  else if(v){const o={t:'text',c:color,x,y,fs,v};list(pg.i-1).push(o);commit();redraw(pg);selectObj(pg,o)}};
 ta.onblur=fin;
 ta.onkeydown=e=>{if(e.key=='Escape'){ta.value=ed?ed.v:'';ta.blur()}else if(e.key=='Enter'&&(e.ctrlKey||e.metaKey))ta.blur()};
 toast(__T(ed?'عدّل النص، وبعدين اضغط برّه':'اكتب النص، وبعدين اضغط عليه تاني عشان تحركه أو تعدله'));
}
function editText(pg,o){hideBar();startText(pg,o.x,o.y,o)}
// zoom
async function zoom(f){if(!pdf)return;const W=document.getElementById('main'),y=W.scrollTop/Math.max(1,W.scrollHeight);scale=Math.min(4,Math.max(.4,scale*f));await build(false);W.scrollTop=y*W.scrollHeight}
$('#zin').onclick=()=>zoom(1.2);$('#zout').onclick=()=>zoom(1/1.2);
$('#fit').onclick=async()=>{if(!pdf)return;await build(true)};
// save

function showSave(bytes,name){
 const blob=new Blob([bytes],{type:'application/pdf'}),url=URL.createObjectURL(blob);
 let m=document.getElementById('savebox');if(m)m.remove();
 m=document.createElement('div');m.id='savebox';
 m.style.cssText='position:absolute;left:0;right:0;bottom:0;max-height:85%;overflow:auto;z-index:30;background:#1e1f22;border-top:2px solid #5865f2;padding:14px;display:flex;flex-direction:column;gap:10px;align-items:stretch;text-align:center;direction:rtl';
 const b=(t,c)=>{const e=document.createElement('button');e.textContent=t;e.style.cssText='background:'+c+';color:#fff;border:0;border-radius:8px;padding:14px;font-size:17px;font-family:inherit;cursor:pointer';return e};
 const t=document.createElement('div');t.textContent='الملف جاهز: '+name;t.style.cssText='font-size:15px;word-break:break-all';
 m.appendChild(t);
 const file=new File([blob],name,{type:'application/pdf'});
 if(navigator.canShare&&navigator.canShare({files:[file]})){
  const s=b('📤 احفظ / شارك الملف (Drive, ملفات, واتساب...)','#5865f2');
  s.onclick=async()=>{try{await navigator.share({files:[file],title:name})}catch(e){if(e.name!=='AbortError')toast('المشاركة مش شغالة، جرب زرار التحميل')}};
  m.appendChild(s);
 }
 const d=b('⬇️ نزّل الملف','#2f9e44');
 d.onclick=()=>{
  let b64='';const CH=0x8000;for(let k=0;k<bytes.length;k+=CH)b64+=String.fromCharCode.apply(null,bytes.subarray(k,k+CH));b64=btoa(b64);
  const esc=name.replace(/[<>&"]/g,'');
  const html='<!doctype html><html lang="'+__L()+'" dir="'+__D()+'"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+esc+'</title><body style="font-family:sans-serif;background:#1e1f22;color:#fff;text-align:center;padding:30px 16px"><h2>'+__T('الملف جاهز ✅')+'</h2><p style="word-break:break-all;direction:ltr">'+esc+'</p><a id="a" style="display:block;background:#2f9e44;color:#fff;border-radius:10px;padding:18px;font-size:20px;text-decoration:none;margin:20px 0">'+__T('⬇️ نزّل الملف')+'</a><p style="opacity:.7;line-height:1.7">'+__T('لو التحميل ما بدأش دوس الزرار. بعد التحميل ارجع لصفحة المذاكرة.')+'</p><script>var s=atob("'+b64+'"),u=new Uint8Array(s.length);for(var i=0;i<s.length;i++)u[i]=s.charCodeAt(i);var a=document.getElementById("a");a.href=URL.createObjectURL(new Blob([u],{type:"application/pdf"}));a.download="'+esc+'";<\/script></body></html>';
  const hu=URL.createObjectURL(new Blob([html],{type:'text/html'}));
  try{window.open(hu,'_blank')}catch(e){toast('المتصفح منع فتح التبويب')}
 };
 m.appendChild(d);
 const c=b('إغلاق','#383a40');c.onclick=()=>m.remove();m.appendChild(c);
 document.getElementById('shell').appendChild(m);
}
$('#save').onclick=save;
async function save(){
 if(!pdf){toast('افتح PDF الأول');return}
 toast('بجهّز الملف...');
 try{
  if(virtual){const doc=await PDFLib.PDFDocument.create();
   for(let i=0;i<pdf.numPages;i++){const pg=await pdf.getPage(i+1),vp1=pg.getViewport({scale:1}),k=Math.min(3,1800/vp1.width);
    const c=document.createElement('canvas');c.width=Math.round(vp1.width*k);c.height=Math.round(vp1.height*k);const ctx=c.getContext('2d');
    await pg.render({canvasContext:ctx,viewport:pg.getViewport({scale:k})}).promise;ctx.setTransform(1,0,0,1,0,0);(ann[i]||[]).forEach(o=>drawObj(ctx,o,k));(notes[i]||[]).forEach(n=>drawNote(ctx,n,k));
    const jb=await new Promise(r=>c.toBlob(r,'image/jpeg',.88));const img=await doc.embedJpg(new Uint8Array(await jb.arrayBuffer()));
    const p=doc.addPage([vp1.width,vp1.height]);p.drawImage(img,{x:0,y:0,width:vp1.width,height:vp1.height})}
   showSave(await doc.save(),fileName.replace(/\.[^.]+$/,'')+'-study.pdf');return}
  const doc=await PDFLib.PDFDocument.load(pdfBytes,{ignoreEncryption:true});const ps=doc.getPages();let n=0;
  for(let i=0;i<ps.length;i++){
   const L=ann[i]||[],NL=notes[i]||[];if(!L.length&&!NL.length)continue;
   const sz=ps[i].getSize(),vp=(await pdf.getPage(i+1)).getViewport({scale:1});
   const k=Math.min(3,2400/vp.width*1); // px per unit
   const c=document.createElement('canvas');c.width=Math.round(vp.width*k);c.height=Math.round(vp.height*k);
   const ctx=c.getContext('2d');L.forEach(o=>drawObj(ctx,o,k));NL.forEach(n=>drawNote(ctx,n,k));
   const png=await new Promise(r=>c.toBlob(r,'image/png'));
   const img=await doc.embedPng(new Uint8Array(await png.arrayBuffer()));
   const rot=((ps[i].getRotation().angle%360)+360)%360;
   if(rot==0)ps[i].drawImage(img,{x:0,y:0,width:sz.width,height:sz.height});
   else{ // rotated pages: draw in view space via transform
    const w=sz.width,h=sz.height,rad=rot*Math.PI/180;
    const vw=rot%180?h:w,vh=rot%180?w:h;
    const ox=rot==90?0:rot==180?w:rot==270?w:0,oy=rot==90?h:rot==180?h:rot==270?0:0;
    ps[i].drawImage(img,{x:ox,y:oy,width:vw,height:vh,rotate:PDFLib.degrees(-rot)});
   }
   n++;
  }
  const out=await doc.save();
  const name=fileName.replace(/\.pdf$/i,'')+'-annotated.pdf';
  showSave(out,name);
  if(!n)toast('مفيش تعديلات على الملف');
 }catch(e){console.error(e);toast('حصل خطأ في الحفظ: '+e.message)}
}

// ===== other file types =====
const RTL=s=>/[\u0590-\u08FF]/.test(s);
const FF='"Segoe UI",Tahoma,Arial,sans-serif';
const mc=document.createElement('canvas').getContext('2d');
function wrap(text,maxW,font){mc.font=font;const out=[];String(text).split('\n').forEach(par=>{let cur='';par.split(/\s+/).filter(x=>x).forEach(x=>{const t=cur?cur+' '+x:x;if(mc.measureText(t).width>maxW&&cur){out.push(cur);cur=x}else cur=t});out.push(cur)});return out}
function drawLines(ctx,lines,x0,y,fs,lh,maxW,color,bold){ctx.fillStyle=color;ctx.font=(bold?'bold ':'')+fs+'px '+FF;ctx.textBaseline='top';
 lines.forEach(l=>{const r=RTL(l);ctx.direction=r?'rtl':'ltr';ctx.textAlign=r?'right':'left';ctx.fillText(l,r?x0+maxW:x0,y);if(REC){const w=ctx.measureText(l).width;REC.push({s:l,x:r?x0+maxW-w:x0,y:y,w:w,h:fs})}y+=lh});return y}
async function unzip(buf){const u=new Uint8Array(buf),dv=new DataView(buf);let e=u.length-22;while(e>=0&&dv.getUint32(e,true)!==0x06054b50)e--;if(e<0)throw Error('الملف مش zip سليم');
 const n=dv.getUint16(e+10,true);let p=dv.getUint32(e+16,true);const files={};
 for(let i=0;i<n;i++){const method=dv.getUint16(p+10,true),csz=dv.getUint32(p+20,true),nl=dv.getUint16(p+28,true),el=dv.getUint16(p+30,true),cl=dv.getUint16(p+32,true),lo=dv.getUint32(p+42,true);files[new TextDecoder().decode(u.subarray(p+46,p+46+nl))]={method,csz,lo};p+=46+nl+el+cl}
 return{names:Object.keys(files),async get(name){const f=files[name];if(!f)return null;const s=f.lo+30+dv.getUint16(f.lo+26,true)+dv.getUint16(f.lo+28,true),d=u.subarray(s,s+f.csz);if(f.method==0)return d;
  return new Uint8Array(await new Response(new Blob([d]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer())}}}
function xmlParas(bytes,pTag,tTag){const doc=new DOMParser().parseFromString(new TextDecoder().decode(bytes),'application/xml');
 return[...doc.getElementsByTagName(pTag)].map(p=>[...p.getElementsByTagName(tTag)].map(t=>t.textContent).join('')).filter(s=>s.trim())}
function slidePage(paras,notes){const W=960,H=540,body=paras.slice(1),title=paras[0]||'',text=paras.join('\n')+(notes.length?'\n\n['+__T('ملاحظات المتحدث')+']\n'+notes.join('\n'):'');
 return{text,getViewport:({scale})=>({width:W*scale,height:H*scale}),render({canvasContext:ctx,viewport}){REC=this.boxes=[];const kk=viewport.width/W;ctx.setTransform(kk,0,0,kk,0,0);
  ctx.fillStyle='#fff';ctx.fillRect(0,0,W,H);ctx.fillStyle='#5865f2';ctx.fillRect(0,0,W,12);
  const mw=W-100;const tl=wrap(title,mw,'bold 38px '+FF).slice(0,3);let y=drawLines(ctx,tl,50,40,38,46,mw,'#1a1b3a',true)+14;
  let fs=28,ls;for(;fs>=12;fs-=2){ls=body.map(b=>wrap('• '+b,mw-10,fs+'px '+FF));if(ls.reduce((s,l)=>s+l.length,0)*fs*1.35+body.length*fs*.4<H-y-30)break}
  body.forEach((b,i)=>{y=drawLines(ctx,ls[i],55,y,fs,fs*1.35,mw-10,'#222')+fs*.4});
  return{promise:Promise.resolve()}}}}
async function pptxPages(buf){const z=await unzip(buf);const num=n=>+(n.match(/(\d+)\.xml$/)||[0,0])[1];
 const sl=z.names.filter(n=>/^ppt\/slides\/slide\d+\.xml$/.test(n)).sort((a,b)=>num(a)-num(b));if(!sl.length)throw Error('مفيش شرايح في الملف');
 const out=[];for(const n of sl){const paras=xmlParas(await z.get(n),'a:p','a:t');const nb=await z.get('ppt/notesSlides/notesSlide'+num(n)+'.xml');
  const notes=nb?xmlParas(nb,'a:p','a:t').filter(s=>!/^\d+$/.test(s.trim())):[];out.push(slidePage(paras.length?paras:[__T('(شريحة بدون نص)')],notes))}
 toast('PowerPoint: بيتعرض النص بس، الصور والأشكال مش بتظهر');return out}
function textPages(txt){const W=595,H=842,M=40,mw=W-2*M,fs=15,lh=22,per=Math.floor((H-2*M)/lh),pgs=[];let cur=[];
 const lines=[];txt.split('\n').forEach(p=>{if(!p.trim())lines.push('');else wrap(p,mw,fs+'px '+FF).forEach(l=>lines.push(l))});
 lines.forEach(l=>{cur.push(l);if(cur.length>=per){pgs.push(cur);cur=[]}});if(cur.length||!pgs.length)pgs.push(cur);
 return pgs.map(L=>({text:L.join('\n'),getViewport:({scale})=>({width:W*scale,height:H*scale}),render({canvasContext:ctx,viewport}){REC=this.boxes=[];const kk=viewport.width/W;ctx.setTransform(kk,0,0,kk,0,0);ctx.fillStyle='#fff';ctx.fillRect(0,0,W,H);drawLines(ctx,L,M,M,fs,lh,mw,'#111');return{promise:Promise.resolve()}}}))}
function oleRead(buf){const u=new Uint8Array(buf),dv=new DataView(buf);
 if(u.length<512||dv.getUint32(0,true)!=0xE011CFD0||dv.getUint32(4,true)!=0xE11AB1A1)throw Error('مش ملف أوفيس قديم سليم');
 const ss=1<<dv.getUint16(30,true),ms=1<<dv.getUint16(32,true),cut=dv.getUint32(56,true);
 const sec=i=>{const o=(i+1)*ss;return u.subarray(o,o+ss)};
 const fatIds=[];for(let i=0;i<109;i++){const v=dv.getInt32(76+i*4,true);if(v>=0)fatIds.push(v)}
 let dif=dv.getInt32(68,true),nd=dv.getUint32(72,true);while(dif>=0&&nd-->0){const o=(dif+1)*ss;for(let i=0;i<ss/4-1;i++){const v=dv.getInt32(o+i*4,true);if(v>=0)fatIds.push(v)}dif=dv.getInt32(o+ss-4,true)}
 const fat=[];for(const id of fatIds){const o=(id+1)*ss;for(let i=0;i<ss/4;i++)fat.push(dv.getInt32(o+i*4,true))}
 const chain=(s,tbl)=>{const r=[];let n=0;while(s>=0&&s<tbl.length&&n++<1e6){r.push(s);s=tbl[s]}return r};
 const read=(s,size)=>{const c=chain(s,fat),out=new Uint8Array(c.length*ss);c.forEach((x,i)=>out.set(sec(x),i*ss));return size==null?out:out.subarray(0,size)};
 const dir=read(dv.getInt32(48,true));const ddv=new DataView(dir.buffer,dir.byteOffset,dir.byteLength);
 const ents=[];for(let o=0;o+128<=dir.length;o+=128){const nl=ddv.getUint16(o+64,true);if(!nl)continue;let nm='';for(let i=0;i<nl/2-1;i++)nm+=String.fromCharCode(ddv.getUint16(o+i*2,true));ents.push({name:nm,type:dir[o+66],start:ddv.getInt32(o+116,true),size:ddv.getUint32(o+120,true)})}
 const root=ents.find(e=>e.type==5);let mini=null,mfat=null;
 const getMini=()=>{if(mini)return;mini=read(root.start,root.size);const mf=read(dv.getInt32(60,true));const m=new DataView(mf.buffer,mf.byteOffset,mf.byteLength);mfat=[];for(let i=0;i<mf.length/4;i++)mfat.push(m.getInt32(i*4,true))};
 return{get(name){const e=ents.find(x=>x.name==name&&x.type==2);if(!e)return null;
  if(e.size<cut){getMini();const c=chain(e.start,mfat),out=new Uint8Array(c.length*ms);c.forEach((x,i)=>out.set(mini.subarray(x*ms,x*ms+ms),i*ms));return out.subarray(0,e.size)}
  return read(e.start,e.size)}}}
function pptLegacyPages(buf){const ole=oleRead(buf);const d=ole.get('PowerPoint Document');if(!d)throw Error('مش لاقي شرايح في الملف');
 const dv=new DataView(d.buffer,d.byteOffset,d.byteLength);const pages=[];let cur=null;
 const u16=b=>new TextDecoder('utf-16le').decode(b),l1=b=>new TextDecoder('windows-1252').decode(b);
 const walk=(s,e,inList)=>{let o=s;while(o+8<=e){const vi=dv.getUint16(o,true),t=dv.getUint16(o+2,true),len=dv.getUint32(o+4,true),ver=vi&15,ins=vi>>4;const be=Math.min(o+8+len,e);
  if(ver==15){walk(o+8,be,t==0x0FF0?ins==0:inList)}
  else if(inList){if(t==0x03F3){cur=[];pages.push(cur)}
   else if(cur&&(t==0x0FA0||t==0x0FA8)){const txt=(t==0x0FA0?u16(d.subarray(o+8,be)):l1(d.subarray(o+8,be)));txt.split(/[\r\n\v\u000b]+/).forEach(p=>{if(p.trim())cur.push(p.trim())})}}
  o=be}};
 walk(0,d.length,false);
 if(!pages.some(p=>p.length)){pages.length=0;let on=false;
  const w2=(s,e)=>{let o=s;while(o+8<=e){const vi=dv.getUint16(o,true),t=dv.getUint16(o+2,true),len=dv.getUint32(o+4,true),ver=vi&15;const be=Math.min(o+8+len,e);
   if(ver==15){if(t==0x03EE){cur=[];pages.push(cur);on=true;w2(o+8,be);on=false}else if(t==0x03F0||t==0x03F8){}else w2(o+8,be)}
   else if(on&&cur&&(t==0x0FA0||t==0x0FA8)){const txt=(t==0x0FA0?u16(d.subarray(o+8,be)):l1(d.subarray(o+8,be)));txt.split(/[\r\n\v]+/).forEach(p=>{if(p.trim())cur.push(p.trim())})}
   o=be}};
  w2(0,d.length)}
 if(!pages.length)throw Error('مقدرتش أطلّع نص من الملف ده');
 toast('PowerPoint قديم (ppt): بيتعرض النص بس، الصور والأشكال مش بتظهر');
 return pages.map(p=>slidePage(p.length?p:[__T('(شريحة بدون نص)')],[]))}
function docLegacyText(buf){const ole=oleRead(buf);const w=ole.get('WordDocument');if(!w)throw Error('مش لاقي نص في الملف');
 const dv=new DataView(w.buffer,w.byteOffset,w.byteLength);if(dv.getUint16(0,true)!=0xA5EC)throw Error('ملف Word قديم جدًا أو مش سليم');
 const flags=dv.getUint16(10,true);if(flags&0x100)throw Error('الملف مشفّر');
 const tb=ole.get((flags&0x200)?'1Table':'0Table');if(!tb)throw Error('مقدرتش أقرأ الملف');
 const ccp=dv.getInt32(76,true),fcClx=dv.getUint32(418,true),lcb=dv.getUint32(422,true);
 const t=new DataView(tb.buffer,tb.byteOffset,tb.byteLength);let o=fcClx;const end=fcClx+lcb;
 while(o<end&&tb[o]==1){o+=3+t.getUint16(o+1,true)}
 if(tb[o]!=2)throw Error('مقدرتش أطلّع نص من الملف ده');
 const plen=t.getUint32(o+1,true);o+=5;const n=((plen-4)/12)|0;let out='';
 for(let i=0;i<n;i++){const cs=t.getUint32(o+i*4,true),ce=t.getUint32(o+(i+1)*4,true);const pcd=o+(n+1)*4+i*8;let fc=t.getUint32(pcd+2,true);const cnt=Math.min(ce,ccp)-cs;if(cnt<=0)continue;
  if(fc&0x40000000){fc=(fc&0x3FFFFFFF)/2;out+=new TextDecoder('windows-1252').decode(w.subarray(fc,fc+cnt))}
  else out+=new TextDecoder('utf-16le').decode(w.subarray(fc,fc+cnt*2))}
 out=out.replace(/\r\n?/g,'\n').replace(/[\u0001\u0008\u0013\u0014\u0015]/g,'').replace(/\u0007/g,' ').replace(/\f/g,'\n');
 if(!out.trim())throw Error('مفيش نص في الملف');
 toast('Word قديم (doc): بيتعرض النص بس');return out}
async function docxPages(buf){const z=await unzip(buf);const b=await z.get('word/document.xml');if(!b)throw Error('ملف docx غير سليم');return textPages(xmlParas(b,'w:p','w:t').join('\n'))}
async function imagePage(f){const bm=await createImageBitmap(f);const s=Math.min(1,1400/Math.max(bm.width,bm.height)),W=Math.round(bm.width*s),H=Math.round(bm.height*s);
 return{text:'',getViewport:({scale})=>({width:W*scale,height:H*scale}),render({canvasContext:ctx,viewport}){REC=this.boxes=[];const kk=viewport.width/W;ctx.setTransform(kk,0,0,kk,0,0);ctx.drawImage(bm,0,0,W,H);return{promise:Promise.resolve()}}}}
// ===== study tools =====
const W_=document.getElementById('main');
function curPage(){if(focusI)return focusI;if(!pages.length)return 1;let c=1;const st=W_.scrollTop+20;pages.forEach(p=>{if(p.div.offsetTop<=st+W_.clientHeight*.3)c=p.i});return c}
function goTo(n){n=Math.max(1,Math.min(pdf?pdf.numPages:1,n|0));if(focusI){showFocus(n);return}const p=pages[n-1];if(p)W_.scrollTo({top:p.div.offsetTop-10,behavior:'smooth'});$('#pn').value=n}
$('#prev').onclick=()=>goTo(curPage()-1);$('#next').onclick=()=>goTo(curPage()+1);
$('#pn').onchange=e=>goTo(+e.target.value);
W_.addEventListener('scroll',()=>{if(pages.length&&document.activeElement!==$('#pn'))$('#pn').value=curPage()},{passive:true});

function privNote(s,full,short){const g=document.createElement('div');g.style.cssText='font-size:12px;color:var(--mute);margin:4px 0';g.textContent='ℹ️ '+short;s.appendChild(g);
 let seen=false;try{seen=localStorage.getItem('privSeen')=='1'}catch(e){}
 if(seen)return;const o=document.createElement('div');o.style.cssText='font-size:14px;line-height:1.7;background:#2a2c36;border:1px solid var(--line);color:var(--ink);border-radius:10px;padding:10px;margin:6px 0';o.textContent=full.replace(/^⚠️ تنبيه خصوصية: /,'');
 o.style.position='relative';o.style.padding='10px 34px 10px 10px';const b=document.createElement('button');b.textContent='✕';b.setAttribute('aria-label','إغلاق');b.style.cssText='position:absolute;right:4px;top:4px;width:28px;height:28px;border:0;background:transparent;color:#fff;opacity:.5;font-size:16px;line-height:1;padding:0;border-radius:14px';
 b.onclick=()=>{try{localStorage.setItem('privSeen','1')}catch(e){}o.remove()};o.appendChild(b);s.appendChild(o)}

function speak(t,slow){try{const ss=window.speechSynthesis;if(!ss||typeof SpeechSynthesisUtterance=='undefined'){toast('النطق مش شغال في المتصفح ده');return}
 t=(t||'').replace(/\s+/g,' ').trim().slice(0,400);if(!t)return;ss.cancel();const u=new SpeechSynthesisUtterance(t);u.lang='en-US';u.rate=slow?0.55:0.9;
 const vs=ss.getVoices()||[];const v=vs.find(x=>x.lang=='en-US'&&/google/i.test(x.name))||vs.find(x=>x.lang=='en-US')||vs.find(x=>/^en/i.test(x.lang));if(v)u.voice=v;
 u.onerror=e=>toast('النطق مش شغال: '+(e&&e.error||''));ss.speak(u);toast(slow?'🐢 بنطق ببطء...':'🔊 بنطق...')}catch(e){toast('النطق مش شغال في المتصفح ده')}}
function sheet(build){let s=document.getElementById('sheet');if(!s){s=document.createElement('div');s.id='sheet';document.getElementById('shell').appendChild(s)}
 s.innerHTML='';s.style.display='block';const mk=(t,cls,fn)=>{const b=document.createElement('button');b.className='sb '+(cls||'');b.textContent=t;b.onclick=fn;s.appendChild(b);return b};
 build(s,mk);mk('إغلاق','g',()=>s.style.display='none')}
async function pageText(i){if(textCache[i]!=null)return textCache[i];const pg=await pdf.getPage(i);let t='';
 if(pg.text!=null)t=pg.text;else{const tc=await pg.getTextContent();t=tc.items.map(x=>x.str+(x.hasEOL?'\n':' ')).join('')}
 return textCache[i]=t}
$('#night').onclick=()=>{document.body.classList.toggle('night');$('#night').classList.toggle('on')};
$('#bm').onclick=()=>{if(!pdf)return;const c=curPage();if(bms.has(c)){bms.delete(c);toast('اتشالت العلامة من صفحة '+c)}else{bms.add(c);toast('⭐ علّمت صفحة '+c)}};
$('#bml').onclick=()=>{if(!pdf)return;sheet((s,mk)=>{const h=document.createElement('h3');h.textContent='الصفحات المعلّمة';s.appendChild(h);
 if(!bms.size){const p=document.createElement('div');p.textContent='مفيش علامات. اضغط ⭐ علّم وانت واقف على الصفحة.';s.appendChild(p)}
 [...bms].sort((a,b)=>a-b).forEach(n=>mk('صفحة '+n,'g',()=>{s.style.display='none';goTo(n)}))})};
$('#srch').onclick=()=>{if(!pdf){toast('افتح ملف الأول');return}sheet((s,mk)=>{const h=document.createElement('h3');h.textContent='بحث في الملف';s.appendChild(h);
 const inp=document.createElement('input');inp.type='text';inp.placeholder='اكتب كلمة...';inp.dir='auto';s.appendChild(inp);const box=document.createElement('div');s.appendChild(box);
 const go=async()=>{const q=inp.value.trim().toLowerCase();box.innerHTML='';if(!q)return;let n=0;
  for(let i=1;i<=pdf.numPages&&n<40;i++){const t=await pageText(i),k=t.toLowerCase().indexOf(q);if(k>=0){n++;const d=document.createElement('div');d.className='res';d.textContent='صفحة '+i+': …'+t.slice(Math.max(0,k-30),k+60).replace(/\s+/g,' ')+'…';d.onclick=()=>{s.style.display='none';goTo(i)};box.appendChild(d)}}
  if(!n)box.textContent='مفيش نتايج (لو الـPDF صور ممسوحة مفيهوش نص يتبحث فيه)'};
 inp.onkeydown=e=>{if(e.key=='Enter')go()};mk('ابحث','',go)})};
let tt=null,tend=0;
$('#tmr').onclick=()=>sheet((s,mk)=>{const h=document.createElement('h3');h.textContent='تايمر مذاكرة';s.appendChild(h);
 const go=min=>{clearInterval(tt);tend=Date.now()+min*60000;const b=document.getElementById('tbadge')||document.getElementById('shell').appendChild(Object.assign(document.createElement('div'),{id:'tbadge'}));b.style.display='block';
  tt=setInterval(()=>{const l=tend-Date.now();if(l<=0){clearInterval(tt);b.textContent='⏰ خلص الوقت! خد راحة';toast('⏰ خلص التايمر');navigator.vibrate&&navigator.vibrate([300,150,300]);setTimeout(()=>b.style.display='none',15000)}else b.textContent='⏱ '+Math.floor(l/60000)+':'+String(Math.floor(l/1000)%60).padStart(2,'0')},500);s.style.display='none'};
 mk('مذاكرة 25 دقيقة','',()=>go(25));mk('راحة 5 دقايق','g',()=>go(5));mk('مذاكرة 50 دقيقة','g',()=>go(50));
 mk('إيقاف التايمر','g',()=>{clearInterval(tt);const b=document.getElementById('tbadge');if(b)b.style.display='none';s.style.display='none'})});
async function pageBlob(i){const pg=await pdf.getPage(i),k=1.6,v=pg.getViewport({scale:k}),c=document.createElement('canvas');c.width=v.width;c.height=v.height;const ctx=c.getContext('2d');
 ctx.fillStyle='#fff';ctx.fillRect(0,0,c.width,c.height);await pg.render({canvasContext:ctx,viewport:v}).promise;ctx.setTransform(1,0,0,1,0,0);(ann[i-1]||[]).forEach(o=>drawObj(ctx,o,k));(notes[i-1]||[]).forEach(n=>drawNote(ctx,n,k));
 return new Promise(r=>c.toBlob(r,'image/jpeg',.85))}
async function explain(i,sel){const txt=sel||await pageText(i);const blob=await pageBlob(i);const file=new File([blob],'slide-'+i+'.jpg',{type:'image/jpeg'});
 sheet((s,mk)=>{const h=document.createElement('h3');h.textContent='💬 اسألني - صفحة '+i;s.appendChild(h);
  const p=document.createElement('div');p.style.cssText='font-size:14px;line-height:1.7;opacity:.9';p.textContent='الشرح بالذكاء الاصطناعي بيتم في شات واتساب مع المساعد، مش جوه الصفحة. ابعت الصورة دي له واكتب "اشرحلي الشريحة دي بالعربي".';s.appendChild(p);
  const im=document.createElement('img');im.src=URL.createObjectURL(blob);s.appendChild(im);
  if(navigator.canShare&&navigator.canShare({files:[file]}))mk('📤 ابعت الشريحة للمساعد (شير)','',async()=>{try{await navigator.share({files:[file],text:(sel?'اسألني عن الجزء ده: '+sel:'اسألني: اشرحلي الصفحة دي بالعربي')})}catch(e){if(e.name!=='AbortError')toast('الشير مش شغال، اضغط مطولاً على الصورة واحفظها')}});
  else{const q=document.createElement('div');q.style.cssText='font-size:14px';q.textContent='الشير مش متاح هنا: اضغط مطولاً على الصورة واحفظها، وابعتها في الواتساب.';s.appendChild(q)}
  if(txt.trim()){const l=document.createElement('div');l.textContent='نص الصفحة (تقدر تعمله تحديد ونسخ):';l.style.marginTop='8px';s.appendChild(l);const ta=document.createElement('textarea');ta.readOnly=true;ta.value=txt;ta.dir='auto';s.appendChild(ta)}})}

let ocrW=null,ocrLang='';
async function ensureTess(){if(window.Tesseract)return;await new Promise((res,rej)=>{const s=document.createElement('script');s.src=new URL('tesseract.min.js',document.baseURI).href;s.onload=res;s.onerror=()=>rej(new Error('tesseract load failed'));document.head.appendChild(s)});}
async function ocrPage(i,lang){const L=lang||'eng';
 sheet((s,mk)=>{const h=document.createElement('h3');h.textContent='🔍 قراءة نص الصفحة '+i+' (على الموبايل)';s.appendChild(h);
  const p=document.createElement('div');p.style.cssText='font-size:14px;line-height:1.7';p.textContent='جاري التحضير...';s.appendChild(p);
  (async()=>{try{
   if(!ocrW||ocrLang!=L){if(ocrW){try{await ocrW.terminate()}catch(e){}ocrW=null}
    await ensureTess();ocrW=await Tesseract.createWorker(L,1,{workerPath:'./worker.min.js',corePath:'./',langPath:'./',gzip:true,logger:m=>{if(m.status)p.textContent=m.status+(m.progress!=null?' '+Math.round(m.progress*100)+'%':'')}});ocrLang=L}
   const pg=await pdf.getPage(i),v=pg.getViewport({scale:Math.min(3,2200/pg.getViewport({scale:1}).width)}),c=document.createElement('canvas');c.width=v.width;c.height=v.height;const ctx=c.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,c.width,c.height);await pg.render({canvasContext:ctx,viewport:v}).promise;
   p.textContent='بيقرأ النص...';const r=await ocrW.recognize(c);const txt=(r.data.text||'').trim();
   p.textContent=txt?'النص اللي اتقرأ (راجعه، الدقة بتقل مع الصور الوحشة والخط اليدوي):':'ماقدرتش ألاقي نص في الصفحة دي.';
   const ta=document.createElement('textarea');ta.dir='auto';ta.value=txt;ta.style.minHeight='140px';s.insertBefore(ta,s.lastChild);
   const row=document.createElement('div');row.style.cssText='display:flex;gap:6px;flex-wrap:wrap;margin:6px 0';
   [['📋 نسخ',()=>copyText(ta.value)],['🌐 ترجم',()=>openTrans(ta.value,false)],['🤖 اسأل شات',()=>askChat(ta.value)],['🔊 نطق',()=>speak(ta.value,false)],['🐢 بطيء',()=>speak(ta.value,true)]].forEach(x=>{const b=document.createElement('button');b.textContent=x[0];b.style.cssText='border-radius:12px;padding:9px 12px;font-family:inherit;font-size:14px;border:1px solid var(--line);color:#fff;background:var(--panel2)';b.onclick=x[1];row.appendChild(b)});
   s.insertBefore(row,ta)
  }catch(e){p.textContent='القراءة فشلت: '+(e&&e.message||e)}})();
  [['English','eng'],['عربي','ara'],['عربي + English','ara+eng']].forEach(x=>mk('🔁 '+x[0],'g',()=>ocrPage(i,x[1])))})}
async function readPageImg(i){if(window.__OCR)return ocrPage(i,'eng');const blob=await pageBlob(i);const file=new File([blob],'page-'+i+'.jpg',{type:'image/jpeg'});
 sheet((s,mk)=>{const h=document.createElement('h3');h.textContent='📷 اقرأ الصفحة - صفحة '+i;s.appendChild(h);
  const p=document.createElement('div');p.style.cssText='font-size:14px;line-height:1.7;opacity:.9';p.textContent='لو الصفحة مش بتتحدد (سكان أو ملف مقفول): ابعت صورتها للمساعد في الشات وهو يقرأ النص ويرجعهولك كنص. القراءة مش على الموبايل، بتتم في الشات، ومفيش خدمة تانية بتستلم الصورة.';s.appendChild(p);
  const im=document.createElement('img');im.src=URL.createObjectURL(blob);s.appendChild(im);
  const msg='اقرأ النص اللي في الصورة دي واكتبهولي كنص زي ما هو (إنجليزي وعربي)';
  if(navigator.canShare&&navigator.canShare({files:[file]}))mk('📤 ابعت الصفحة للمساعد عشان يقرأها','',async()=>{try{await navigator.share({files:[file],text:msg})}catch(e){if(e.name!=='AbortError')toast('الشير مش شغال، اضغط مطولاً على الصورة واحفظها وابعتها')}});
  else{const q=document.createElement('div');q.style.cssText='font-size:14px';q.textContent='الشير مش متاح هنا: اضغط مطولاً على الصورة واحفظها، وابعتها في الواتساب واكتب: '+msg;s.appendChild(q)}})}
$('#readpg').onclick=()=>{if(!pdf){toast('افتح ملف الأول');return}readPageImg(curPage())};

// ===== drawer, navigation, translation =====
const dock=$('#dock');let refitT=null;
let lastW=0;
function setDrawer(open){dock.classList.toggle('open',open);$('#body').classList.toggle('dopen',open);$('#drawerBtn').classList.toggle('on',open)}
try{new ResizeObserver(()=>{clearTimeout(refitT);refitT=setTimeout(async()=>{const w=W_.clientWidth;if(!pdf||!pages.length||!w||Math.abs(w-lastW)<20)return;lastW=w;const cp=curPage();await build(true);if(focusI){showFocus(focusI);return}const p=pages[cp-1];if(p)W_.scrollTop=p.div.offsetTop-10},250)}).observe(W_)}catch(e){}
$('#drawerBtn').onclick=()=>setDrawer(!dock.classList.contains('open'));
(()=>{const h=$('#handle');let x0=null,moved=false,id=null;
 h.addEventListener('pointerdown',e=>{x0=e.clientX;moved=false;id=e.pointerId;try{h.setPointerCapture(e.pointerId)}catch(x){}});
 h.addEventListener('pointermove',e=>{if(x0==null||e.pointerId!==id)return;const dx=e.clientX-x0;if(Math.abs(dx)>10&&!moved){moved=true;setDrawer(dx<0)}});
 h.addEventListener('pointerup',e=>{if(x0!=null&&!moved)setDrawer(!dock.classList.contains('open'));x0=null});
 h.addEventListener('pointercancel',()=>{x0=null});
 h.addEventListener('click',e=>e.preventDefault());
 const dr=$('#drawer');{let px=null,py=0,pid=null;dr.addEventListener('pointerdown',e=>{if(e.target.closest('input'))return;px=e.clientX;py=e.clientY;pid=e.pointerId});dr.addEventListener('pointermove',e=>{if(px==null||e.pointerId!==pid)return;const dx=e.clientX-px,dy=e.clientY-py;if(dx>50&&Math.abs(dx)>Math.abs(dy)*1.5){px=null;setDrawer(false)}});const endp=()=>{px=null};dr.addEventListener('pointerup',endp);dr.addEventListener('pointercancel',endp)}let sx=null;dr.addEventListener('touchstart',e=>{sx=e.touches[0].clientX},{passive:true});
 dr.addEventListener('touchend',e=>{if(sx!=null&&e.changedTouches[0].clientX-sx>70)setDrawer(false);sx=null},{passive:true})})();
($('#snap')||{}).onclick=()=>{main.classList.toggle('snap');toast(main.classList.contains('snap')?'وضع صفحة صفحة: شغال':'وضع صفحة صفحة: واقف')};
// swipe between pages
(()=>{let sx=0,sy=0,st0=0;main.addEventListener('touchstart',e=>{if(e.touches.length!=1)return;sx=e.touches[0].clientX;sy=e.touches[0].clientY;st0=Date.now()},{passive:true});
 main.addEventListener('touchend',e=>{if(tool!='hand')return;if(e.target.closest&&e.target.closest('.note'))return;if(!pages.length||e.changedTouches.length!=1)return;const dx=e.changedTouches[0].clientX-sx,dy=e.changedTouches[0].clientY-sy;
  if(Date.now()-st0<600&&Math.abs(dx)>70&&Math.abs(dy)<40&&main.scrollWidth<=main.clientWidth+6)goTo(curPage()+(dx<0?1:-1))},{passive:true})})();
addEventListener('keydown',e=>{if(e.target.tagName=='TEXTAREA'||e.target.tagName=='INPUT')return;if(e.key=='ArrowRight'||e.key=='PageDown')goTo(curPage()+1);else if(e.key=='ArrowLeft'||e.key=='PageUp')goTo(curPage()-1)});
// thumbnails
$('#thumbs').onclick=()=>{if(!pdf){toast('افتح ملف الأول');return}sheet((s,mk)=>{const h=document.createElement('h3');h.textContent='اختار صفحة ('+pdf.numPages+')';s.appendChild(h);const g=document.createElement('div');g.className='tg';s.appendChild(g);let dead=false;
 const cells=[];for(let i=1;i<=pdf.numPages;i++){const d=document.createElement('div');const c=document.createElement('canvas');c.width=120;c.height=160;d.appendChild(c);const l=document.createElement('div');l.textContent=i;d.appendChild(l);d.onclick=()=>{dead=true;s.style.display='none';goTo(i)};g.appendChild(d);cells.push(c)}
 (async()=>{for(let i=1;i<=pdf.numPages&&!dead&&i<=120;i++){try{const pg=await pdf.getPage(i),v1=pg.getViewport({scale:1}),k=120/v1.width,v=pg.getViewport({scale:k}),c=cells[i-1];c.width=v.width;c.height=v.height;const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);await pg.render({canvasContext:x,viewport:v}).promise}catch(e){}}})()})};
// translation
const enc=encodeURIComponent;
async function jget(url){const c=new AbortController(),t=setTimeout(()=>c.abort(),15000);try{const r=await fetch(url,{signal:c.signal});if(!r.ok)throw Error('HTTP '+r.status);return await r.json()}finally{clearTimeout(t)}}
async function gtr(q){const j=await jget('https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl='+__L()+'&dt=t&q='+enc(q));return j[0].map(x=>x[0]).join('')}
async function mtr(q){const j=await jget('https://api.mymemory.translated.net/get?q='+enc(q)+'&langpair=en|'+__L());if(j.responseStatus!=200)throw Error(j.responseDetails||'mymemory');return j.responseData.translatedText}
let engine='google';
async function trChunk(q){if(engine=='google'){try{return await gtr(q)}catch(e){return await mtr(q.slice(0,480))}}
 try{return await mtr(q.slice(0,480))}catch(e){return await gtr(q)}}
function chunk(t,max){const out=[];let cur='';(t.replace(/\s+\n/g,'\n').match(/[^.!?؟\n]+[.!?؟]*\s*|\n+/g)||[t]).forEach(x=>{if((cur+x).length>max&&cur.trim()){out.push(cur.trim());cur=''}cur+=x;while(cur.length>max){out.push(cur.slice(0,max));cur=cur.slice(max)}});if(cur.trim())out.push(cur.trim());return out}
async function openTrans(pre,auto){if(!pdf){toast('افتح ملف الأول');return}const p=curPage();const txt=pre!=null?pre:(await pageText(p)).replace(/[ \t]+/g,' ').trim();
 sheet((s,mk)=>{const h=document.createElement('h3');h.textContent='🌐 ترجمة للعربي (صفحة '+p+')';s.appendChild(h);
  const n=document.createElement('div');n.style.cssText='font-size:13px;color:var(--mute);line-height:1.7';n.textContent='ترجمة آلية مجانية. المصطلحات العلمية والطبية بتظهر جنب النص الإنجليزي الأصلي عشان تراجعها. اختار جزء من النص واضغط "ترجم المحدد"، أو ترجم الصفحة كلها.';s.appendChild(n);
  privNote(s,'⚠️ تنبيه خصوصية: النص اللي في الصندوق ده بيتبعت لخدمة Google Translate (أو MyMemory لو اخترتها) عشان يتترجم. باقي الملف مابيتبعتش. متضغطش "ترجم" لو النص حساس.','النص اللي في الصندوق بيتبعت لخدمة ترجمة خارجية.');const ta=document.createElement('textarea');ta.value=txt.slice(0,8000);ta.dir='auto';ta.placeholder='مفيش نص في الصفحة دي (ممكن تكون صورة). اكتب أو الصق النص هنا.';s.appendChild(ta);
  const out=document.createElement('div');
  const run=async src=>{src=src.trim();out.innerHTML='';if(!src){out.textContent='مفيش نص للترجمة';return}const cs=chunk(src,450);const st0=document.createElement('div');st0.style.color='var(--mute)';out.appendChild(st0);
   for(let i=0;i<cs.length;i++){st0.textContent='بترجم '+(i+1)+' من '+cs.length+'...';try{const ar=await trChunk(cs[i]);const e=document.createElement('div');e.className='en';e.textContent=cs[i];const r=document.createElement('div');r.className='ar';r.textContent=ar;out.insertBefore(e,st0);out.insertBefore(r,st0)}
    catch(err){st0.style.color='#ff8a8a';st0.textContent='فشلت الترجمة: '+(err&&err.message||err)+'. الخدمة المجانية ممكن تكون واقفة أو مفيش نت. جرب "المحرك التاني" أو ابعت النص للمساعد.';return}}
   st0.remove()};
  mk('ترجم المحدد','',()=>{const a=ta.selectionStart,b=ta.selectionEnd;run(a!=b?ta.value.slice(a,b):ta.value)});
  mk('ترجم النص كله','g',()=>run(ta.value));
  const eb=mk('المحرك: '+(engine=='google'?'Google':'MyMemory (فيه ذاكرة ترجمة طبية)'),'g',()=>{engine=engine=='google'?'mymemory':'google';eb.textContent='المحرك: '+(engine=='google'?'Google':'MyMemory (فيه ذاكرة ترجمة طبية)')});
  s.appendChild(out);})}
$('#trans').onclick=()=>openTrans(null,false);
// ===== v7: install app button (desktop + Android) =====
let bip=null;
addEventListener('beforeinstallprompt',e=>{e.preventDefault();bip=e});
(function(){const dl=$('#drawer');if(!dl)return;
 const g=document.createElement('div');g.className='grid one';
 const b=document.createElement('button');b.id='install';b.className='tb acc';b.innerHTML='<i>⬇️</i><b>ثبّت التطبيق</b>';
 b.onclick=async()=>{
  const inst=matchMedia('(display-mode: standalone)').matches||matchMedia('(display-mode: fullscreen)').matches||navigator.standalone;
  if(inst){toast(__T('التطبيق متثبّت خلاص ✓'));return}
  if(bip){try{bip.prompt();const r=await bip.userChoice;bip=null;toast(r&&r.outcome=='accepted'?__T('اتثبّت ✓ دور عليه في قائمة البرامج'):__T('تقدر تثبّته من قائمة المتصفح'))}catch(e){bip=null;toast(__T('تقدر تثبّته من قائمة المتصفح'))}return}
  sheet((s,mk)=>{const h=document.createElement('h3');h.textContent=__T('ثبّت التطبيق على جهازك');s.appendChild(h);
   const p=document.createElement('div');p.style.cssText='font-size:14px;line-height:1.9;text-align:start';p.textContent=__T('على الكمبيوتر (Chrome أو Edge): دوس أيقونة التثبيت (⊕) في شريط العنوان، أو من القائمة ⋮ ← «تثبيت التطبيق». على الأندرويد: من القائمة ⋮ ← «إضافة إلى الشاشة الرئيسية».');s.appendChild(p)})};
 const inf=dl.querySelector('.infolink');if(inf)dl.insertBefore(g,inf);else dl.appendChild(g);g.appendChild(b)})();
addEventListener('keydown',e=>{
 if(e.target.tagName=='TEXTAREA'||e.target.tagName=='INPUT')return;
 if(sel&&sel.o&&(e.key=='Backspace'||e.key=='Delete')){e.preventDefault();const o=sel.o;ann[sel.i-1]=list(sel.i-1).filter(z=>z!==o);clearSel();commit();return}
 if(sel&&sel.o&&/^Arrow(Left|Right|Up|Down)$/.test(e.key)){e.preventDefault();const o=sel.o,d=e.shiftKey?10:1;
  if(e.key=='ArrowLeft')o.x-=d;else if(e.key=='ArrowRight')o.x+=d;else if(e.key=='ArrowUp')o.y-=d;else o.y+=d;
  commit();const sp=selPageOf();if(sp){redraw(sp);placeBar(sp,o)}return}
 if((e.ctrlKey||e.metaKey)&&e.key=='s'){e.preventDefault();save()}
 else if((e.ctrlKey||e.metaKey)&&e.key=='z'){e.preventDefault();$('#undo').click()}
 else if((e.ctrlKey||e.metaKey)&&(e.key=='y'||e.key=='Z')){e.preventDefault();$('#redo').click()}
 else if(!e.ctrlKey&&!e.metaKey){const m={h:'hand',p:'pen',l:'hl',r:'rect',t:'text',e:'eraser'}[e.key.toLowerCase()];if(m)setTool(m)}
});

// two-finger pinch zoom (all tools): cancels any stroke, never draws
let pinching=false;
(()=>{let d0=0,r=1;const dist=t=>Math.hypot(t[0].clientX-t[1].clientX,t[0].clientY-t[1].clientY);
 const pv=v=>document.querySelectorAll('#main .page').forEach(p=>{p.style.transformOrigin='50% 0';p.style.transform=v?'scale('+v+')':''});
 main.addEventListener('touchstart',e=>{if(e.touches.length>=2&&pdf){pinching=true;cancelAll();d0=dist(e.touches);r=1}},{passive:true,capture:true});
 main.addEventListener('touchmove',e=>{if(!pinching||e.touches.length<2)return;if(e.cancelable)e.preventDefault();r=Math.max(.3,Math.min(4,dist(e.touches)/Math.max(1,d0)));pv(r)},{passive:false,capture:true});
 const end=e=>{if(!pinching||e.touches.length>=2)return;pinching=false;pv(0);const f=r;r=1;if(Math.abs(f-1)>.06)zoom(f)};
 main.addEventListener('touchend',end,{capture:true});main.addEventListener('touchcancel',end,{capture:true})})();
// ===== v3: text layer, selection popup, focus mode, notes, cards =====
const shell=document.getElementById('shell');
async function pageItems(page){
 if(page.getTextContent){if(page._items)return page._items;const v=page.getViewport({scale:1});const tc=await page.getTextContent();
  page._items=tc.items.filter(x=>x.str&&x.str.trim()).map(x=>{const h=Math.abs(x.transform[3])||x.height||10;return{s:x.str,x:x.transform[4],y:v.height-x.transform[5]-h*.88,w:x.width,h}});return page._items}
 return page.boxes||[]}
async function buildTL(pg,before){try{const items=await pageItems(pg.page);if(!items.length)return;const tl=document.createElement('div');tl.className='tl';const k=scale;
 items.forEach(it=>{const sp=document.createElement('span');sp.textContent=it.s;const fs=Math.max(4,it.h*k);sp.style.left=it.x*k+'px';sp.style.top=it.y*k+'px';sp.style.fontSize=fs+'px';
  mc.font=fs+'px sans-serif';const mw=mc.measureText(it.s).width;if(mw>0&&it.w>0)sp.style.transform='scaleX('+(it.w*k/mw)+')';tl.appendChild(sp)});
 pg.div.insertBefore(tl,before);pg.tl=tl}catch(e){}}
// selection popup
const pop=document.createElement('div');pop.id='selpop';
[['copy','📋 نسخ'],['tr','🌐 ترجم'],['exp','📖 شرح'],['chat','🤖 اسأل شات'],['say','🔊 نطق'],['slow','🐢 نطق بطيء']].forEach(a=>{const b=document.createElement('button');b.dataset.a=a[0];b.textContent=a[1];pop.appendChild(b)});shell.appendChild(pop);
let selTxt='',selPg=1,selT=null;
function selText(){const s=getSelection();if(!s||s.isCollapsed||!s.anchorNode)return'';const n=s.anchorNode.nodeType==1?s.anchorNode:s.anchorNode.parentElement;if(!n||!n.closest||!n.closest('.tl'))return'';return s.toString().replace(/\s+/g,' ').trim()}
document.addEventListener('selectionchange',()=>{clearTimeout(selT);selT=setTimeout(()=>{const t=selText();if(!t){pop.style.display='none';return}selTxt=t;const s=getSelection(),r=s.getRangeAt(0).getBoundingClientRect(),sr=shell.getBoundingClientRect();
 const pe=(s.anchorNode.nodeType==1?s.anchorNode:s.anchorNode.parentElement).closest('.page');selPg=pe?+pe.dataset.i+1:curPage();
 pop.style.display='flex';const w=pop.offsetWidth||240;let left=r.left-sr.left+r.width/2-w/2;left=Math.max(4,Math.min(sr.width-w-4,left));const ph=pop.offsetHeight||44;let top=r.bottom-sr.top+46;if(top+ph>sr.height-4){top=r.top-sr.top-54-ph-8;if(top<4)top=Math.max(4,sr.height-ph-4)}pop.style.left=left+'px';pop.style.top=top+'px'},300)});
pop.addEventListener('pointerdown',e=>e.preventDefault());pop.addEventListener('mousedown',e=>e.preventDefault());
function copyText(t){let ok=false;try{const ta=document.createElement('textarea');ta.value=t;ta.style.cssText='position:fixed;top:0;left:0;opacity:0';document.body.appendChild(ta);ta.select();ok=document.execCommand('copy');ta.remove()}catch(e){}
 if(ok)toast('اتنسخ ✓');else if(navigator.clipboard)navigator.clipboard.writeText(t).then(()=>toast('اتنسخ ✓'),()=>toast('النسخ مش متاح هنا، استخدم زرار نسخ الأندرويد'));else toast('النسخ مش متاح هنا')}
function explainSel(t){const msg='اشرحلي الجزء ده من الملف بالعربي المصري البسيط، شرح دقيق ومطابق للنص، وسيب المصطلحات العلمية والطبية بالإنجليزي زي ما هي:\n\n'+t;
 const fallback=()=>{copyText(msg);try{window.open('https://wa.me/?text='+encodeURIComponent(msg),'_blank')}catch(e){}toast('اتنسخ، والصقه في شات المساعد وابعته')};
 if(navigator.share){navigator.share({text:msg}).catch(e=>{if(e&&e.name=='AbortError')return;fallback()});return}
 fallback()}
pop.onclick=e=>{const a=e.target.dataset&&e.target.dataset.a;if(!a)return;const t=selTxt,p=selPg;pop.style.display='none';try{getSelection().removeAllRanges()}catch(x){}
 if(a=='copy')copyText(t);else if(a=='tr')openTrans(t,false);else if(a=='exp')explainSel(t);else if(a=='chat')askChat(t);else if(a=='say'||a=='slow')speak(t,a=='slow')};
// focus mode
const xb=document.createElement('button');xb.id='xbtn';xb.textContent='✕';xb.style.display='none';xb.setAttribute('aria-label','رجوع للـPDF كله');$('#body').appendChild(xb);
function showFocus(i){focusI=i;pages.forEach(p=>p.div.classList.toggle('foc',p.i==i));main.scrollTop=0;main.scrollLeft=0;$('#pn').value=i}
async function enterFocus(i){if(!pdf||focusI)return;focusI=i;savedScale=scale;main.classList.add('focus');xb.style.display='flex';await build(true);showFocus(i);toast('صفحة '+i+' لوحدها. ✕ فوق يمين للرجوع')}
async function exitFocus(){if(!focusI)return;const i=focusI;focusI=0;main.classList.remove('focus');xb.style.display='none';scale=savedScale;await build(false);const p=pages[i-1];if(p)main.scrollTop=p.div.offsetTop-10;$('#pn').value=i}
xb.onclick=exitFocus;
($('#focusBtn')||{}).onclick=()=>{if(!pdf){toast('افتح ملف الأول');return}if(focusI)exitFocus();else enterFocus(curPage())};
(()=>{let lt=0,lx=0,ly=0;
 main.addEventListener('touchend',e=>{if(tool!='hand'||focusI||e.changedTouches.length!=1)return;const d=e.target.closest&&e.target.closest('.page');if(!d||e.target.closest('.note'))return;const t=e.changedTouches[0],now=Date.now();
  if(now-lt<380&&Math.hypot(t.clientX-lx,t.clientY-ly)<35){lt=0;e.preventDefault();try{getSelection().removeAllRanges()}catch(x){}enterFocus(+d.dataset.i+1)}else{lt=now;lx=t.clientX;ly=t.clientY}},{passive:false});
 main.addEventListener('dblclick',e=>{if(tool!='hand'||focusI)return;const d=e.target.closest&&e.target.closest('.page');if(d&&!e.target.closest('.note'))enterFocus(+d.dataset.i+1)})})();

// sticky notes
function savNotes(){try{localStorage.setItem(key+':notes',JSON.stringify(notes))}catch(e){}}
function renderNotes(pg){(notes[pg.i-1]||[]).forEach(n=>mkNote(pg,n))}
function mkNote(pg,n){const el=document.createElement('div');el.className='note';
 const hd=document.createElement('div');hd.className='nh';const dg=document.createElement('span');dg.className='nd';dg.textContent='✥ اسحب';
 const mb=document.createElement('button');const del=document.createElement('button');del.textContent='🗑';const sm=document.createElement('button'),bg=document.createElement('button');sm.textContent='−';bg.textContent='+';sm.title='أصغر';bg.title='أكبر';hd.append(dg,sm,bg,mb,del);
 const ta=document.createElement('textarea');ta.className='nt';ta.dir='auto';ta.value=n.t||'';ta.placeholder='';
 const cv=document.createElement('canvas');cv.className='ni';const gr=document.createElement('div');gr.className='ng';el.append(hd,ta,cv,gr);pg.div.appendChild(el);
 function ink(){const k=scale,w=Math.max(1,Math.round(n.w*k)),h=Math.max(1,Math.round(n.h*k));if(cv.width!=w)cv.width=w;if(cv.height!=h)cv.height=h;const c=cv.getContext('2d');c.clearRect(0,0,w,h);c.strokeStyle='#1c3d99';c.lineWidth=Math.max(1.5,2*k);c.lineCap='round';c.lineJoin='round';
  (n.ink||[]).concat(cur?[cur]:[]).forEach(p=>{c.beginPath();c.moveTo(p[0]*k,p[1]*k);if(p.length==2)c.lineTo(p[0]*k+.1,p[1]*k);for(let j=2;j<p.length;j+=2)c.lineTo(p[j]*k,p[j+1]*k);c.stroke()})}
 let cur=null;
 function mbt(){const m=n.m=='ink',cp=n.w*scale<260;mb.textContent=m?(cp?'⌨️':'⌨️ كيبورد'):(cp?'✍️':'✍️ بإيدك')}
 function hs(){const pw=n.w*scale,s=Math.min(1.3,Math.max(.85,pw/250));hd.style.right='auto';hd.style.width=(pw/s)+'px';hd.style.transformOrigin='0 100%';hd.style.transform='scale('+s+')';dg.textContent=pw<200?'✥':'✥ اسحب';mbt()}
 function mode(){const m=n.m=='ink';cv.style.pointerEvents=m?'auto':'none';ta.style.pointerEvents=m?'none':'auto';mbt()}
 function lay(){const k=scale,FS=n.fs||15,L=(n.lh||24)*k;el.style.left=n.x*k+'px';el.style.top=n.y*k+'px';el.style.width=n.w*k+'px';el.style.height=n.h*k+'px';ta.style.lineHeight=L+'px';ta.style.fontSize=FS*k+'px';ta.style.paddingTop=4*k+'px';
  el.style.backgroundImage='repeating-linear-gradient(to bottom,transparent 0,transparent '+(L-1)+'px,#9db8d6 '+(L-1)+'px,#9db8d6 '+L+'px)';el.style.backgroundPosition='0 '+4*k+'px';hs();ink()}
 lay();mode();
 mb.onclick=()=>{n.m=n.m=='ink'?'kb':'ink';mode();savNotes();if(n.m!='ink')ta.focus()};
 const zoom=f=>{const w=n.w*f,h=n.h*f;if(w*scale<170||h*scale<100||w>3000||h>4000)return;n.w=w;n.h=h;n.fs=(n.fs||15)*f;n.lh=(n.lh||24)*f;(n.ink||[]).forEach(p=>{for(let j=0;j<p.length;j++)p[j]*=f});lay();savNotes()};sm.onclick=()=>zoom(1/1.2);bg.onclick=()=>zoom(1.2);
 del.onclick=()=>{notes[pg.i-1]=(notes[pg.i-1]||[]).filter(x=>x!==n);el.remove();savNotes()};
 ta.oninput=()=>{n.t=ta.value;savNotes()};
 const P=e=>{const r=cv.getBoundingClientRect();return[(e.clientX-r.left)/scale,(e.clientY-r.top)/scale]};
 cv.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();cv.setPointerCapture(e.pointerId);cur=P(e)});
 cv.addEventListener('pointermove',e=>{if(!cur)return;e.preventDefault();const [x,y]=P(e);cur.push(x,y);ink()});
 const up=()=>{if(!cur)return;n.ink=(n.ink||[]);n.ink.push(cur);cur=null;ink();savNotes()};cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
 const drag=(h,fn)=>{let x0=null,y0=0;h.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();h.setPointerCapture(e.pointerId);x0=e.clientX;y0=e.clientY});
  h.addEventListener('pointermove',e=>{if(x0==null)return;fn((e.clientX-x0)/scale,(e.clientY-y0)/scale);x0=e.clientX;y0=e.clientY;lay()});
  const u=()=>{if(x0!=null){x0=null;savNotes()}};h.addEventListener('pointerup',u);h.addEventListener('pointercancel',u)};
 drag(dg,(dx,dy)=>{n.x=Math.max(0,n.x+dx);n.y=Math.max(30/scale,n.y+dy)});
 drag(gr,(dx,dy)=>{n.w=Math.max(170/scale,n.w+dx);n.h=Math.max(100/scale,n.h+dy)});
 el._focus=()=>ta.focus()}
$('#note').onclick=()=>{if(!pdf){toast('افتح ملف الأول');return}const i=curPage(),pg=pages[i-1];if(!pg)return;const k=scale,uw=pg.vp.width/k,uh=pg.vp.height/k;
 const fs=Math.round(Math.min(40,Math.max(13,17/k)));const n={x:0,y:0,w:Math.max(160,uw*.72),h:Math.max(150,uh*.4),fs:fs,lh:Math.round(fs*1.6),t:'',ink:[],m:'kb'};n.h=Math.min(n.h,uh-20);n.x=Math.max(0,(uw-n.w)/2);n.y=Math.min(Math.max(34/k,(main.scrollTop-pg.div.offsetTop)/k+40),Math.max(34/k,uh-n.h-10));
 (notes[i-1]=notes[i-1]||[]).push(n);mkNote(pg,n);savNotes();const els=pg.div.querySelectorAll('.note');const last=els[els.length-1];if(last&&last._focus)last._focus();toast('📝 نوتة اتحطت على صفحة '+i+'. اسحبها من فوق')};
function drawNote(ctx,n,k){ctx.save();ctx.fillStyle='#fff7a8';ctx.fillRect(n.x*k,n.y*k,n.w*k,n.h*k);ctx.strokeStyle='#9db8d6';ctx.lineWidth=Math.max(1,k*.8);ctx.beginPath();
 const FS=n.fs||15,LH=n.lh||24;for(let y=4+LH;y<n.h;y+=LH){ctx.moveTo(n.x*k,(n.y+y)*k);ctx.lineTo((n.x+n.w)*k,(n.y+y)*k)}ctx.stroke();
 const ls=wrap(n.t||'',n.w-14,FS+'px '+FF);ctx.fillStyle='#222';ctx.font=(FS*k)+'px '+FF;ctx.textBaseline='alphabetic';
 ls.forEach((l,j)=>{const r=RTL(l);ctx.direction=r?'rtl':'ltr';ctx.textAlign=r?'right':'left';ctx.fillText(l,(r?n.x+n.w-7:n.x+7)*k,(n.y+4+LH*j+LH*.76)*k)});
 ctx.strokeStyle='#1c3d99';ctx.lineWidth=Math.max(1.5,2*k);ctx.lineCap='round';(n.ink||[]).forEach(p=>{ctx.beginPath();ctx.moveTo((n.x+p[0])*k,(n.y+p[1])*k);if(p.length==2)ctx.lineTo((n.x+p[0])*k+.1,(n.y+p[1])*k);for(let j=2;j<p.length;j+=2)ctx.lineTo((n.x+p[j])*k,(n.y+p[j+1])*k);ctx.stroke()});ctx.restore()}
// flashcards from highlights
const ckey=()=>key+':cards';
function loadCards(){cards={};try{cards=JSON.parse(localStorage.getItem(ckey())||'{}')}catch(e){}}
function saveCards(){try{localStorage.setItem(ckey(),JSON.stringify(cards))}catch(e){}}
function itemHit(o,it){const r=(o.s||3)*(o.t=='hl'?2:.5)+1;
 if(o.t=='rect')return o.x<it.x+it.w&&o.x+o.w>it.x&&o.y<it.y+it.h&&o.y+o.h>it.y;
 const p=o.p,pts=[];for(let j=0;j<p.length;j+=2){pts.push([p[j],p[j+1]]);if(j+3<p.length)pts.push([(p[j]+p[j+2])/2,(p[j+1]+p[j+3])/2])}
 return pts.some(q=>q[0]>=it.x-r&&q[0]<=it.x+it.w+r&&q[1]>=it.y-r&&q[1]<=it.y+it.h+r)}
async function genCards(){const live={};let made=0;
 for(const k of Object.keys(ann)){const i=+k+1;const hl=(ann[k]||[]).filter(o=>o.t=='hl'||o.t=='rect');if(!hl.length||i>pdf.numPages)continue;
  const pg=await pdf.getPage(i);const items=await pageItems(pg);const full=(await pageText(i)).replace(/\s+/g,' ').trim();const sents=full.split(/(?<=[.!?؟])\s+/);
  for(const o of hl){let hit=items.filter(it=>itemHit(o,it));hit.sort((a,b)=>Math.abs(a.y-b.y)<a.h*.5?a.x-b.x:a.y-b.y);let t=hit.map(x=>x.s.trim()).join(' ').replace(/\s+/g,' ').trim();
   if(!t){if(virtual||!items.length){t=(full.split(/(?<=[.!?؟])\s+/)[0]||'').slice(0,160)}if(!t)continue}
   const id=i+'|'+t.slice(0,80);if(live[id])continue;
   const se=sents.find(x=>x.toLowerCase().includes(t.toLowerCase().slice(0,25)));let front;
   if(se&&t.length<60&&se.length>t.length+8){const re=se.toLowerCase().indexOf(t.toLowerCase());front=re>=0?se.slice(0,re)+' ______ '+se.slice(re+t.length):'صفحة '+i+': '+se.slice(0,120)+'... (الجزء الناقص؟)'}
   else front='صفحة '+i+': اتذكر الجزء اللي بيبدأ بـ "'+t.split(' ').slice(0,4).join(' ')+'..."';
   live[id]=cards[id]||{id,pg:i,front,back:t,box:0,due:0};if(!cards[id])made++}}
 cards=live;saveCards();return made}
function showCards(){const now=Date.now(),all=Object.values(cards),due=all.filter(c=>c.due<=now).sort((a,b)=>a.due-b.due);
 sheet((s,mk)=>{const h=document.createElement('h3');h.textContent='🃏 فلاش كاردز من الهايلايتس';s.appendChild(h);const p=document.createElement('div');p.style.cssText='font-size:15px;line-height:1.8';
  if(!all.length){p.textContent='مفيش كروت لسه. اختار قلم الهايلايت 🖍️ وظلّل على كلام مهم في الصفحة، وبعدين ارجع هنا.'}else p.textContent='عندك '+all.length+' كارت، منهم '+due.length+' مستحقين دلوقتي للمراجعة (تكرار متباعد).';
  s.appendChild(p);if(due.length)mk('ابدأ المراجعة ('+due.length+')','',()=>step(due.slice(),false))})}
function step(q,rev){sheet((s,mk)=>{if(!q.length){const h=document.createElement('h3');h.textContent='خلصت كل الكروت المستحقة 🎉';s.appendChild(h);return}
 const c=q[0];const h=document.createElement('div');h.style.cssText='color:var(--mute);font-size:13px';h.textContent='باقي '+q.length+' · صفحة '+c.pg;s.appendChild(h);
 const f=document.createElement('div');f.style.cssText='font-size:19px;line-height:1.9;padding:14px 4px;border-bottom:1px solid var(--line)';f.dir='auto';f.textContent=c.front;s.appendChild(f);
 if(!rev){mk('اظهر الإجابة','',()=>step(q,true));return}
 const a=document.createElement('div');a.style.cssText='font-size:19px;line-height:1.9;padding:14px 4px;color:#8be59b';a.dir='auto';a.textContent=c.back;s.appendChild(a);
 const days=[0,1,2,4,7,15,30],done=bx=>{c.box=bx;c.due=bx==0?Date.now()+60000:Date.now()+days[bx]*864e5;saveCards();q.shift();if(bx==0)q.push(c);step(q,false)};
 mk('😣 لسه مش حافظها','g',()=>done(0));mk('🙂 تمام','',()=>done(Math.min(6,c.box+1)));mk('😎 سهلة','g',()=>done(Math.min(6,c.box+2)))})}
const _cardsBtn=$('#cards');if(_cardsBtn)_cardsBtn.onclick=async()=>{if(!pdf){toast('افتح ملف الأول');return}toast('بجهّز الكروت...');try{await genCards()}catch(e){toast('خطأ في الكروت: '+(e&&e.message||e))}showCards()};


// ===== ask ChatGPT (opens chatgpt.com in a new tab; nothing is sent until he taps the link) =====
const PROMPTS=[['اشرح بالعربي','اشرحلي الكلام ده بالعربي ببساطة مع شرح المصطلحات العلمية والطبية (واكتب المصطلح بالإنجليزي جنب العربي):'],['لخّص','لخّصلي الكلام ده بالعربي في نقط مرتبة:'],['أسئلة امتحان','اعملي من الكلام ده 5 أسئلة امتحان بالإجابات (بالعربي والمصطلحات بالإنجليزي):']];
async function askChat(sel){if(!pdf){toast('افتح ملف الأول');return}let txt=sel;if(!txt){txt=(await pageText(curPage())).replace(/[ \t]+/g,' ').trim()}
 sheet((s,mk)=>{const h=document.createElement('h3');h.textContent='🤖 اسأل شات';s.appendChild(h);
  privNote(s,'⚠️ تنبيه خصوصية: لما تضغط "افتح ChatGPT" النص اللي في الصندوق بيتبعت لـ ChatGPT (OpenAI) في تبويب جديد، وهو خدمة خارجية ممكن تطلب تسجيل دخول. باقي الملف مابيتبعتش. متضغطش لو النص حساس.','النص اللي في الصندوق بيتبعت لـ ChatGPT.');
  let pi=0;const ta=document.createElement('textarea');ta.dir='auto';ta.value=txt.slice(0,1500);
  const chips=document.createElement('div');chips.style.cssText='display:flex;gap:6px;flex-wrap:wrap;margin:6px 0';
  const a=document.createElement('a');a.className='sb';a.target='_blank';a.rel='noopener noreferrer';a.textContent='🔗 افتح ChatGPT';a.style.cssText='display:block;text-align:center;text-decoration:none;box-sizing:border-box;background:var(--acc);color:#fff;border-radius:12px;padding:13px;font-size:16px;font-weight:700;margin:6px 0';
  const upd=()=>{const q=PROMPTS[pi][1]+'\n\n'+ta.value.slice(0,1500);a.href='https://chatgpt.com/?q='+encodeURIComponent(q)};
  PROMPTS.forEach((pr,i)=>{const c=document.createElement('button');c.textContent=pr[0];c.style.cssText='border-radius:16px;padding:7px 12px;font-family:inherit;font-size:14px;border:1px solid var(--line);color:#fff;background:'+(i==0?'var(--acc)':'var(--panel2)');c.onclick=()=>{pi=i;[...chips.children].forEach((x,j)=>x.style.background=j==i?'var(--acc)':'var(--panel2)');upd()};chips.appendChild(c)});
  s.appendChild(chips);s.appendChild(ta);ta.oninput=upd;upd();s.appendChild(a);
  mk('📋 انسخ النص والتعليمات','g',()=>copyText(PROMPTS[pi][1]+'\n\n'+ta.value));
  const n=document.createElement('div');n.style.cssText='font-size:12px;color:var(--mute);margin-top:4px';n.textContent='لو التبويب ماتفتحش: انسخ النص وافتح ChatGPT وألصقه بنفسك. الحد الأقصى 1500 حرف.';s.appendChild(n)})}
$('#askchat').onclick=()=>askChat('');
$('#fsbtn').onclick=async()=>{try{if(document.fullscreenElement){await document.exitFullscreen();return}const e=document.getElementById('shell');if(!e.requestFullscreen)throw 0;await e.requestFullscreen();toast('ملء الشاشة ✓')}catch(x){toast('المتصفح مانعها هنا. اسحب الصفحة لفوق بإيدك عشان الهيدر يختفي')}};

addEventListener('beforeunload',e=>{if(hpos>0){e.preventDefault();e.returnValue=''}});
})();

}
