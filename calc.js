/* مذاكرتك - floating scientific calculator. Offline, 6 languages, draggable (touch+mouse). */
(function(){
'use strict';
var T={
 ar:{t:'آلة حاسبة علمية',open:'حاسبة',err:'خطأ',deg:'درجة',rad:'راد'},
 en:{t:'Scientific calculator',open:'Calculator',err:'Error',deg:'DEG',rad:'RAD'},
 fr:{t:'Calculatrice scientifique',open:'Calculatrice',err:'Erreur',deg:'DEG',rad:'RAD'},
 es:{t:'Calculadora científica',open:'Calculadora',err:'Error',deg:'DEG',rad:'RAD'},
 de:{t:'Wissenschaftlicher Rechner',open:'Rechner',err:'Fehler',deg:'DEG',rad:'RAD'},
 it:{t:'Calcolatrice scientifica',open:'Calcolatrice',err:'Errore',deg:'DEG',rad:'RAD'}};
var lang=(window.__FORCE_LANG||document.documentElement.lang||localStorage.getItem('pdfstudy:lang')||'ar');
var L=T[lang]||T.en;

/* ---- expression parser (no eval) ---- */
function fact(n){if(n<0||n%1!==0)throw 0;if(n>170)throw 0;var r=1;for(var i=2;i<=n;i++)r*=i;return r;}
function parse(s,deg,ans,mem){
 var i=0;
 function pk(){while(s[i]===' ')i++;return s[i];}
 function eat(c){if(s[i]===c){i++;return true;}return false;}
 function expr(){var v=term();for(;;){if(eat('+'))v+=term();else if(eat('-'))v-=term();else return v;}}
 function term(){var v=unary();for(;;){if(eat('*'))v*=unary();else if(eat('/'))v/=unary();else if(eat('%'))v=v/100*unary();else return v;}}
 function unary(){if(eat('-'))return -unary();if(eat('+'))return unary();return pow();}
 function pow(){var b=post();if(eat('^')){var e=unary();return Math.pow(b,e);}return b;}
 function post(){var v=prim();for(;;){if(eat('!')){v=fact(v);}else if(eat('%')){v=v/100;}else return v;}}
 function word(w){if(s.substr(i,w.length)===w){i+=w.length;return true;}return false;}
 function prim(){
  var c=pk();
  if(eat('(')){var v=expr();if(!eat(')'))throw 0;return v;}
  if(word('sin')){return trig(Math.sin);}
  if(word('cos')){return trig(Math.cos);}
  if(word('tan')){return trig(Math.tan);}
  if(word('ln')){var a=prim();if(a<=0)throw 0;return Math.log(a);}
  if(word('log')){var b=prim();if(b<=0)throw 0;return Math.log10(b);}
  if(word('sqrt')||eat('\u221a')){var d=prim();if(d<0)throw 0;return Math.sqrt(d);}
  if(word('Ans'))return ans;
  if(word('M'))return mem;
  if(eat('\u03c0'))return Math.PI;
  if(c==='e'&&!/[0-9.]/.test(s[i+1]||'')){i++;return Math.E;}
  var m=/^[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?/.exec(s.substr(i));
  if(m){i+=m[0].length;return parseFloat(m[0]);}
  throw 0;}
 function trig(f){var a=prim();return f(deg?a*Math.PI/180:a);}
 var r=expr();pk();if(i<s.length)throw 0;
 if(typeof r!=='number'||!isFinite(r)||isNaN(r))throw 0;
 return r;}

/* ---- UI ---- */
var expr='',ans=0,mem=0,deg=true,justEq=false;
var win=document.createElement('div');win.id='calcWin';win.className='hidden';
win.innerHTML='<div id="calcHead"><b>'+L.t+'</b><button id="calcX" aria-label="close">\u2715</button></div>'+
 '<div id="calcScr"><div id="calcExpr"></div><div id="calcRes">0</div></div><div id="calcPad"></div>';
document.body.appendChild(win);
var pad=win.querySelector('#calcPad'),exEl=win.querySelector('#calcExpr'),resEl=win.querySelector('#calcRes');
var keys=[
 [{k:'MC',c:'mem'},{k:'MR',c:'mem'},{k:'M+',c:'mem'},{k:'M-',c:'mem'},{k:'DRG',c:'dg'}],
 [{k:'(',c:'fn'},{k:')',c:'fn'},{k:'%',c:'fn'},{k:'\u232b',c:'fn'},{k:'C',c:'op'}],
 [{k:'sin',c:'fn'},{k:'cos',c:'fn'},{k:'tan',c:'fn'},{k:'ln',c:'fn'},{k:'log',c:'fn'}],
 [{k:'\u03c0',c:'fn'},{k:'e',c:'fn'},{k:'x!',c:'fn'},{k:'x\u00b2',c:'fn'},{k:'\u221a',c:'fn'}],
 [{k:'7'},{k:'8'},{k:'9'},{k:'\u00f7',c:'op'},{k:'x^y',c:'fn'}],
 [{k:'4'},{k:'5'},{k:'6'},{k:'\u00d7',c:'op'},{k:'Ans',c:'fn'}],
 [{k:'1'},{k:'2'},{k:'3'},{k:'\u2212',c:'op'},{k:'=',c:'eq'}],
 [{k:'0'},{k:'.'},{k:'\u00b1',c:'fn'},{k:'+',c:'op'}]];
keys.forEach(function(row){row.forEach(function(o){
 var b=document.createElement('button');b.textContent=o.k==='DRG'?L.deg:o.k;
 if(o.c)b.className=o.c;if(o.k==='DRG')b.id='calcDrg';
 b.addEventListener('click',function(){press(o.k);});pad.appendChild(b);});});

function show(res,err){exEl.textContent=expr;resEl.textContent=res;resEl.className=err?'err':'';}
function press(k){
 if(k==='C'){expr='';show('0');justEq=false;return;}
 if(k==='\u232b'){expr=expr.slice(0,-1);show(expr||'0');return;}
 if(k==='DRG'){deg=!deg;win.querySelector('#calcDrg').textContent=deg?L.deg:L.rad;return;}
 if(k==='MC'){mem=0;return;}
 if(k==='MR'){ins('M');return;}
 if(k==='M+'){try{mem+=parse(expr||'0',deg,ans,mem);}catch(e){}return;}
 if(k==='M-'){try{mem-=parse(expr||'0',deg,ans,mem);}catch(e){}return;}
 if(k==='='){try{var r=parse(expr,deg,ans,mem);ans=r;
   show(String(Math.round(r*1e10)/1e10));expr='';justEq=true;}
  catch(e){show(L.err,true);expr='';}return;}
 var map={'\u00f7':'/','\u00d7':'*','\u2212':'-','x^y':'^','x\u00b2':'^2','x!':'!','\u00b1':'-'};
 var v=map[k]||k;
 if(/^(sin|cos|tan|ln|log|\u221a)$/.test(k))v=k==='\u221a'?'\u221a(':k+'(';
 if(k==='Ans'){v='Ans';}
 ins(v);}
function ins(v){if(justEq){expr='';justEq=false;}expr+=v;show(expr);}
win.querySelector('#calcX').addEventListener('click',function(){win.classList.add('hidden');});

/* keyboard */
document.addEventListener('keydown',function(e){
 if(win.classList.contains('hidden'))return;
 if(e.target&&/INPUT|TEXTAREA/.test(e.target.tagName))return;
 var k=e.key;
 if(/^[0-9.]$/.test(k))ins(k);
 else if(k==='+'||k==='-')ins(k);
 else if(k==='*')ins('*');
 else if(k==='/'){e.preventDefault();ins('/');}
 else if(k==='('||k===')'||k==='^'||k==='!'||k==='%')ins(k);
 else if(k==='Enter'||k==='='){e.preventDefault();press('=');}
 else if(k==='Backspace')press('\u232b');
 else if(k==='Escape')win.classList.add('hidden');});

/* drag (touch + mouse via pointer events) */
var head=win.querySelector('#calcHead'),drag=null;
head.addEventListener('pointerdown',function(e){
 if(e.target.id==='calcX')return;
 drag={dx:e.clientX-win.offsetLeft,dy:e.clientY-win.offsetTop};
 head.setPointerCapture(e.pointerId);});
head.addEventListener('pointermove',function(e){
 if(!drag)return;
 var x=Math.max(0,Math.min(window.innerWidth-win.offsetWidth,e.clientX-drag.dx));
 var y=Math.max(0,Math.min(window.innerHeight-60,e.clientY-drag.dy));
 win.style.left=x+'px';win.style.top=y+'px';win.style.right='auto';});
head.addEventListener('pointerup',function(){drag=null;});
head.addEventListener('pointercancel',function(){drag=null;});

function place(){var w=Math.min(300,window.innerWidth-12);
 win.style.left=Math.max(6,(window.innerWidth-w)/2)+'px';
 win.style.top=Math.max(50,window.innerHeight*0.12)+'px';}
place();

/* open from the tools drawer */
function addBtn(){
 var tr=document.getElementById('trans');
 if(!tr||document.getElementById('calcOpen'))return;
 var b=document.createElement('button');b.id='calcOpen';b.className='tb';
 b.innerHTML='<i>\ud83e\uddee</i><b>'+L.open+'</b>';
 b.addEventListener('click',function(){
  win.classList.toggle('hidden');
  var dock=document.getElementById('dock');
  if(dock&&dock.classList.contains('open')&&!win.classList.contains('hidden'))document.getElementById('drawerBtn').click();});
 tr.parentNode.appendChild(b);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',addBtn);else addBtn();
window.__calcOpen=function(){win.classList.remove('hidden');};
})();
