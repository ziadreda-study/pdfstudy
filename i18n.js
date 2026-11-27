/* مذاكرتك i18n: ar,en,fr,es,de,it */
(function(){
const LANGS=['ar','en','fr','es','de','it'];
const NAMES={ar:'العربية',en:'English',fr:'Français',es:'Español',de:'Deutsch',it:'Italiano'};
const EN={},FR={},ES={},DE={},IT={};
const PATS=[];
let lang='ar';
try{lang=localStorage.getItem('pdfstudy:lang')||'ar'}catch(e){}
if(window.__FORCE_LANG&&LANGS.indexOf(window.__FORCE_LANG)>=0){lang=window.__FORCE_LANG;try{localStorage.setItem('pdfstudy:lang',lang)}catch(e){}}
if(LANGS.indexOf(lang)<0)lang='ar';
const MAP={en:EN,fr:FR,es:ES,de:DE,it:IT};
const dir=l=>(l||lang)=='ar'?'rtl':'ltr';
function t(s){if(lang=='ar')return s;const m=MAP[lang];if(m&&m[s]!=null)return m[s];if(EN[s]!=null)return EN[s];return s}
function tp(s){if(lang=='ar')return s;for(let i=0;i<PATS.length;i++){const m=s.match(PATS[i][0]);if(m)return PATS[i][1](m,lang,t)}return null}
function tr(s){const lead=(s.match(/^\s*/)||[''])[0],tail=(s.match(/\s*$/)||[''])[0],c=s.slice(lead.length,s.length-tail.length);
 if(!c)return s;let out=null;const m=MAP[lang];
 if(lang!='ar'){if(m&&m[c]!=null)out=m[c];else if(EN[c]!=null)out=EN[c];else out=tp(c)}
 return out==null?s:lead+out+tail}
const origT=new WeakMap(),origA=new WeakMap();
function textNode(n){if(lang=='ar'){if(origT.has(n))n.nodeValue=origT.get(n);return}
 if(!origT.has(n))origT.set(n,n.nodeValue);const v=tr(origT.get(n));if(v!==n.nodeValue)n.nodeValue=v}
const ATTRS=['title','placeholder','aria-label'];
function elAttrs(el){if(lang=='ar'){const o=origA.get(el);if(o)for(const a in o)el.setAttribute(a,o[a]);return}
 let o=origA.get(el);if(!o){o={};origA.set(el,o)}
 ATTRS.forEach(a=>{const v=el.getAttribute(a);if(v==null)return;
  if(o[a]==null)o[a]=v;const nv=tr(o[a]);if(nv!==v)el.setAttribute(a,nv)})}
function walk(root){const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let n;
 while(n=w.nextNode()){if(n.nodeValue&&n.nodeValue.trim())textNode(n)}
 if(root.querySelectorAll)root.querySelectorAll('[title],[placeholder],[aria-label]').forEach(elAttrs)}
function fixInline(){const st=document.getElementById('status');if(st)st.style.direction=dir();
 const sb=document.getElementById('savebox');if(sb)sb.style.direction=dir()}
function apply(){document.documentElement.lang=lang;document.documentElement.dir=dir();
 document.title=tr(document.title);walk(document.getElementById('root')||document.body);fixInline();markCur()}
let pending=false;
const mo=new MutationObserver(ms=>{if(lang=='ar')return;
 ms.forEach(m=>{if(m.type=='characterData')textNode(m.target);
  else if(m.type=='attributes')elAttrs(m.target);
  else m.addedNodes.forEach(n=>{if(n.nodeType==3)textNode(n);else if(n.nodeType==1){walk(n);elAttrs(n)}})});
 if(!pending){pending=true;setTimeout(()=>{pending=false;fixInline()},50)}});
/* globe picker, always visible in a corner */
let globe,panel;
function inSub(){return /\/(en|fr|es|de|it)\/[^/]*$/.test(location.pathname)||/\/(en|fr|es|de|it)\/$/.test(location.pathname)}
function appRoot(){const p=location.pathname;const m=p.match(/^(.*\/)(?:en|fr|es|de|it)\/[^/]*$/);if(m)return m[1];return p.replace(/[^/]*$/,'')}
function langUrl(l){const r=appRoot();return l=='ar'?r:r+l+'/'}
function markCur(){if(!globe)return;globe.textContent='🌐 '+(lang=='ar'?'ع':lang.toUpperCase());
 if(panel)[...panel.children].forEach(b=>b.classList.toggle('cur',b.dataset.l==lang))}
function buildGlobe(){if(document.getElementById('langGlobe'))return;
 globe=document.createElement('button');globe.id='langGlobe';globe.type='button';
 globe.setAttribute('aria-label','Language / اللغة');
 panel=document.createElement('div');panel.id='langPanel';
 LANGS.forEach(l=>{const b=document.createElement('button');b.type='button';b.dataset.l=l;
  b.textContent=NAMES[l];b.onclick=()=>{try{localStorage.setItem('pdfstudy:lang',l)}catch(e){}
   location.href=langUrl(l)};panel.appendChild(b)});
 document.body.appendChild(globe);document.body.appendChild(panel);
 globe.onclick=e=>{e.stopPropagation();panel.classList.toggle('open')};
 document.addEventListener('click',e=>{if(!panel.contains(e.target))panel.classList.remove('open')});
 markCur()}
window.I18N={t,lang:()=>lang,dir,LANGS,NAMES};
if(document.readyState=='loading')document.addEventListener('DOMContentLoaded',()=>{buildGlobe();apply();mo.observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:ATTRS})});
else{buildGlobe();apply();mo.observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:ATTRS})}
/* English */
Object.assign(EN,{
'جاري التحميل…':'Loading…',
'معلومات وخصوصية':'Info & privacy',
'السابق':'Previous','التالي':'Next','الأدوات':'Tools',
'اضغط الزرار واختار ملف: PDF أو PowerPoint (pptx) أو Word (docx) أو نص أو صورة.':'Tap the button and pick a file: PDF, PowerPoint (pptx), Word (docx), text or image.',
'هايلايت، رسم، كتابة، ممحاة، ترجمة للعربي، وبعدين احفظ نسخة عليها شخبطتك.':'Highlight, draw, write, erase, translate, then save a copy with your scribbles.',
'الملف مابيتبعتش لأي مكان، كله على جهازك.':'The file is never sent anywhere, everything stays on your device.',
'اختار ملف':'Choose a file','ملف وتنقل':'File & navigation','افتح ملف':'Open file','الصفحات':'Pages',
'أدوات':'Tools','قراءة':'Read','قلم':'Pen','هايلايت':'Highlight','مربع':'Box','نص':'Text','ممحاة':'Eraser','ترجم':'Translate',
'لون وسُمك':'Color & thickness','لون':'Color','السُمك':'Thickness','تراجع':'Undo','إعادة':'Redo',
'عرض':'View','تكبير':'Zoom in','تصغير':'Zoom out','عرض الصفحة':'Fit page','ليلي':'Night',
'مذاكرة':'Study','نوتة':'Note','اسألني':'Ask me','اقرأ الصفحة':'Read page','كروت':'Cards',
'ملء الشاشة':'Fullscreen','اسأل شات':'Ask Chat','بحث':'Search','علّم':'Mark','المعلّمة':'Marked','تايمر':'Timer',
'حفظ':'Save','احفظ PDF':'Save PDF',
'النوع ده مش مدعوم، احفظه PDF أو pptx أو docx':'This type is not supported, save it as PDF, pptx or docx',
'بيفتح الملف...':'Opening the file...','مفيش ملف اتختار':'No file chosen','بيفتح اختيار الملفات...':'Opening the file picker...',
'الملف ده مش PDF سليم أو متشفّر':'This file is not a valid PDF or it is encrypted','مفيش محتوى في الملف':'No content in this file',
'اكتب، وCtrl+Enter أو اضغط برّه عشان تثبّت':'Type, then Ctrl+Enter or tap outside to set it',
'📤 احفظ / شارك الملف (Drive, ملفات, واتساب...)':'📤 Save / share the file (Drive, Files, WhatsApp...)',
'المشاركة مش شغالة، جرب زرار التحميل':'Sharing is not working, try the download button',
'⬇️ نزّل الملف':'⬇️ Download the file','المتصفح منع فتح التبويب':'The browser blocked the new tab','إغلاق':'Close',
'افتح PDF الأول':'Open a PDF first','بجهّز الملف...':'Preparing the file...','مفيش تعديلات على الملف':'No edits on the file',
'مفيش شرايح في الملف':'No slides found in the file','(شريحة بدون نص)':'(slide with no text)','ملاحظات المتحدث':'Speaker notes',
'PowerPoint: بيتعرض النص بس، الصور والأشكال مش بتظهر':'PowerPoint: text only is shown, pictures and shapes do not appear',
'PowerPoint قديم (ppt): بيتعرض النص بس، الصور والأشكال مش بتظهر':'Old PowerPoint (ppt): text only is shown, pictures and shapes do not appear',
'Word قديم (doc): بيتعرض النص بس':'Old Word (doc): text only is shown',
'مش ملف أوفيس قديم سليم':'Not a valid old Office file','مش لاقي شرايح في الملف':'No slides found in the file',
'مقدرتش أطلّع نص من الملف ده':'Could not extract text from this file','مش لاقي نص في الملف':'No text found in the file',
'ملف Word قديم جدًا أو مش سليم':'Word file too old or invalid','الملف مشفّر':'The file is encrypted',
'مقدرتش أقرأ الملف':'Could not read the file','مفيش نص في الملف':'No text in the file','ملف docx غير سليم':'Invalid docx file',
'الملف مش zip سليم':'The file is not a valid zip'});
Object.assign(EN,{
'النطق مش شغال في المتصفح ده':'Speech does not work in this browser','🐢 بنطق ببطء...':'🐢 Speaking slowly...','🔊 بنطق...':'🔊 Speaking...',
'الصفحات المعلّمة':'Marked pages','مفيش علامات. اضغط ⭐ علّم وانت واقف على الصفحة.':'No marks. Tap ⭐ Mark while standing on the page.',
'افتح ملف الأول':'Open a file first','بحث في الملف':'Search in the file','اكتب كلمة...':'Type a word...',
'مفيش نتايج (لو الـPDF صور ممسوحة مفيهوش نص يتبحث فيه)':'No results (if the PDF is scanned images, there is no text to search)',
'ابحث':'Search','تايمر مذاكرة':'Study timer','⏰ خلص الوقت! خد راحة':'⏰ Time is up! Take a break','⏰ خلص التايمر':'⏰ Timer done',
'مذاكرة 25 دقيقة':'Study 25 minutes','راحة 5 دقايق':'Break 5 minutes','مذاكرة 50 دقيقة':'Study 50 minutes','إيقاف التايمر':'Stop the timer',
'الشرح بالذكاء الاصطناعي بيتم في شات واتساب مع المساعد، مش جوه الصفحة. ابعت الصورة دي له واكتب "اشرحلي الشريحة دي بالعربي".':'AI explaining happens in the WhatsApp chat with the assistant, not inside the page. Send it this image and write "explain this slide to me".',
'📤 ابعت الشريحة للمساعد (شير)':'📤 Send the slide to the assistant (share)',
'الشير مش شغال، اضغط مطولاً على الصورة واحفظها':'Sharing is not working, long-press the image and save it',
'الشير مش متاح هنا: اضغط مطولاً على الصورة واحفظها، وابعتها في الواتساب.':'Sharing is not available here: long-press the image, save it and send it on WhatsApp.',
'نص الصفحة (تقدر تعمله تحديد ونسخ):':'Page text (you can select and copy it):',
'جاري التحضير...':'Preparing...','بيقرأ النص...':'Reading the text...',
'النص اللي اتقرأ (راجعه، الدقة بتقل مع الصور الوحشة والخط اليدوي):':'The recognized text (review it - accuracy drops with bad images and handwriting):',
'ماقدرتش ألاقي نص في الصفحة دي.':'Could not find text on this page.',
'📋 نسخ':'📋 Copy','🌐 ترجم':'🌐 Translate','🤖 اسأل شات':'🤖 Ask Chat','🔊 نطق':'🔊 Speak','🐢 بطيء':'🐢 Slow',
'عربي':'Arabic','عربي + English':'Arabic + English',
'لو الصفحة مش بتتحدد (سكان أو ملف مقفول): ابعت صورتها للمساعد في الشات وهو يقرأ النص ويرجعهولك كنص. القراءة مش على الموبايل، بتتم في الشات، ومفيش خدمة تانية بتستلم الصورة.':'If the page cannot be selected (scan or locked file): send its image to the assistant in the chat and it will read the text and send it back. Reading is not done on the phone, it happens in the chat, and no other service receives the image.',
'📤 ابعت الصفحة للمساعد عشان يقرأها':'📤 Send the page to the assistant to read it'});
Object.assign(EN,{
'ترجمة آلية مجانية. المصطلحات العلمية والطبية بتظهر جنب النص الإنجليزي الأصلي عشان تراجعها. اختار جزء من النص واضغط "ترجم المحدد"، أو ترجم الصفحة كلها.':'Free machine translation. Scientific and medical terms appear next to the original text so you can review them. Select part of the text and tap "Translate selection", or translate the whole page.',
'النص اللي في الصندوق ده بيتبعت لخدمة Google Translate (أو MyMemory لو اخترتها) عشان يتترجم. باقي الملف مابيتبعتش. متضغطش "ترجم" لو النص حساس.':'The text in this box is sent to Google Translate (or MyMemory if you pick it) to be translated. The rest of the file is never sent. Do not tap "Translate" if the text is sensitive.',
'ℹ️ النص اللي في الصندوق بيتبعت لخدمة ترجمة خارجية.':'ℹ️ The text in the box is sent to an external translation service.',
'لما تضغط "افتح ChatGPT" النص اللي في الصندوق بيتبعت لـ ChatGPT (OpenAI) في تبويب جديد، وهو خدمة خارجية ممكن تطلب تسجيل دخول. باقي الملف مابيتبعتش. متضغطش لو النص حساس.':'When you tap "Open ChatGPT" the text in the box is sent to ChatGPT (OpenAI) in a new tab, an external service that may ask you to sign in. The rest of the file is never sent. Do not tap it if the text is sensitive.',
'ℹ️ النص اللي في الصندوق بيتبعت لـ ChatGPT.':'ℹ️ The text in the box is sent to ChatGPT.',
'مفيش نص في الصفحة دي (ممكن تكون صورة). اكتب أو الصق النص هنا.':'No text on this page (it may be an image). Type or paste the text here.',
'مفيش نص للترجمة':'No text to translate','ترجم المحدد':'Translate selection','ترجم النص كله':'Translate all text',
'المحرك: Google':'Engine: Google','المحرك: MyMemory (فيه ذاكرة ترجمة طبية)':'Engine: MyMemory (has medical translation memory)',
'💬 اسألني':'💬 Ask me','🐢 نطق بطيء':'🐢 Speak slowly','اتنسخ ✓':'Copied ✓',
'النسخ مش متاح هنا، استخدم زرار نسخ الأندرويد':'Copy is not available here, use the Android copy button','النسخ مش متاح هنا':'Copy is not available here',
'رجوع للـPDF كله':'Back to the whole PDF','✥ اسحب':'✥ Drag','أصغر':'Smaller','أكبر':'Bigger','⌨️ كيبورد':'⌨️ Keyboard','✍️ بإيدك':'✍️ By hand',
'🃏 فلاش كاردز من الهايلايتس':'🃏 Flashcards from highlights',
'مفيش كروت لسه. اختار قلم الهايلايت 🖍️ وظلّل على كلام مهم في الصفحة، وبعدين ارجع هنا.':'No cards yet. Pick the highlight pen 🖍️ and mark important text on the page, then come back here.',
'خلصت كل الكروت المستحقة 🎉':'All due cards done 🎉','اظهر الإجابة':'Show answer',
'😣 لسه مش حافظها':'😣 Still not memorized','🙂 تمام':'🙂 OK','😎 سهلة':'😎 Easy','بجهّز الكروت...':'Preparing cards...',
'🔗 افتح ChatGPT':'🔗 Open ChatGPT','📋 انسخ النص والتعليمات':'📋 Copy text and instructions',
'لو التبويب ماتفتحش: انسخ النص وافتح ChatGPT وألصقه بنفسك. الحد الأقصى 1500 حرف.':'If the tab does not open: copy the text, open ChatGPT and paste it yourself. Maximum 1500 characters.',
'ملء الشاشة ✓':'Fullscreen ✓','المتصفح مانعها هنا. اسحب الصفحة لفوق بإيدك عشان الهيدر يختفي':'The browser blocks it here. Pull the page up yourself to hide the header',
'اشرح بالعربي':'Explain','لخّص':'Summarize','أسئلة امتحان':'Exam questions',
'الملف جاهز ✅':'File ready ✅',
'لو التحميل ما بدأش دوس الزرار. بعد التحميل ارجع لصفحة المذاكرة.':'If the download did not start, tap the button. After downloading, go back to the study page.',
'وضع صفحة صفحة: شغال':'Single-page mode: on','وضع صفحة صفحة: واقف':'Single-page mode: off',
'جاهز ✓ اختار ملف.':'Ready ✓ pick a file.','مفيش ملف اتشارك.':'No shared file.','غير معروف':'unknown'});
/* patterns: [regex, (m,lang,t)=>string] */
const NOEXT={'en':'no extension','fr':'sans extension','es':'sin extensión','de':'keine Endung','it':'nessuna estensione'};
PATS.push(
[/^📄 الملف ده \((.+)\) مش بيتفتح هنا/, (m,l,t)=>{const x=m[1]=='من غير امتداد'?NOEXT[l]:m[1];return{
 en:'📄 This file ('+x+') cannot be opened here. Open it in its own app, save it as PDF, PowerPoint (pptx), Word (docx) or an image, then pick it again.',
 fr:'📄 Ce fichier ('+x+') ne s\'ouvre pas ici. Ouvrez-le dans son application, enregistrez-le en PDF, PowerPoint (pptx), Word (docx) ou image, puis choisissez-le à nouveau.',
 es:'📄 Este archivo ('+x+') no se abre aquí. Ábrelo en su propia app, guárdalo como PDF, PowerPoint (pptx), Word (docx) o imagen, y elígelo de nuevo.',
 de:'📄 Diese Datei ('+x+') lässt sich hier nicht öffnen. Öffne sie in ihrer eigenen App, speichere sie als PDF, PowerPoint (pptx), Word (docx) oder Bild und wähle sie erneut.',
 it:'📄 Questo file ('+x+') non si apre qui. Aprilo nella sua app, salvalo come PDF, PowerPoint (pptx), Word (docx) o immagine, poi sceglilo di nuovo.'}[l]}],
[/^1\/4 قراءة الملف: (.+)$/, (m,l)=>({en:'1/4 Reading file: ',fr:'1/4 Lecture du fichier : ',es:'1/4 Leyendo archivo: ',de:'1/4 Datei wird gelesen: ',it:'1/4 Lettura file: '}[l])+m[1]],
[/^2\/4 تم قراءة (\d+) بايت/, (m,l)=>({en:'2/4 Read '+m[1]+' bytes, opening the PDF...',fr:'2/4 '+m[1]+' octets lus, ouverture du PDF...',es:'2/4 '+m[1]+' bytes leídos, abriendo el PDF...',de:'2/4 '+m[1]+' Bytes gelesen, PDF wird geöffnet...',it:'2/4 Letti '+m[1]+' byte, apertura del PDF...'}[l])],
[/^3\/4 فتح الـPDF تمام \((\d+) صفحة\)/, (m,l)=>({en:'3/4 PDF opened ('+m[1]+' pages), drawing pages...',fr:'3/4 PDF ouvert ('+m[1]+' pages), affichage des pages...',es:'3/4 PDF abierto ('+m[1]+' páginas), dibujando páginas...',de:'3/4 PDF geöffnet ('+m[1]+' Seiten), Seiten werden gezeichnet...',it:'3/4 PDF aperto ('+m[1]+' pagine), disegno delle pagine...'}[l])],
[/^4\/4 تم ✓ (.+) · (\d+) صفحة$/, (m,l)=>({en:'4/4 Done ✓ '+m[1]+' · '+m[2]+' pages',fr:'4/4 Terminé ✓ '+m[1]+' · '+m[2]+' pages',es:'4/4 Listo ✓ '+m[1]+' · '+m[2]+' páginas',de:'4/4 Fertig ✓ '+m[1]+' · '+m[2]+' Seiten',it:'4/4 Fatto ✓ '+m[1]+' · '+m[2]+' pagine'}[l])],
[/^(.+) · (\d+) صفحة$/, (m,l)=>m[1]+' · '+m[2]+({en:' pages',fr:' pages',es:' páginas',de:' Seiten',it:' pagine'}[l])],
[/^فشل: (.+)$/, (m,l,t)=>({en:'Failed: ',fr:'Échec : ',es:'Falló: ',de:'Fehlgeschlagen: ',it:'Non riuscito: '}[l])+t(m[1])],
[/^حصل خطأ: (.+)$/, (m,l,t)=>({en:'Error: ',fr:'Erreur : ',es:'Error: ',de:'Fehler: ',it:'Errore: '}[l])+t(m[1])],
[/^خطأ: (.+)$/, (m,l,t)=>({en:'Error: ',fr:'Erreur : ',es:'Error: ',de:'Fehler: ',it:'Errore: '}[l])+t(m[1])],
[/^خطأ في الصفحة: (.+)$/, (m,l,t)=>({en:'Page error: ',fr:'Erreur de page : ',es:'Error de página: ',de:'Seitenfehler: ',it:'Errore di pagina: '}[l])+t(m[1])],
[/^مكتبات ناقصة: (.+)$/, (m,l)=>({en:'Missing libraries: ',fr:'Bibliothèques manquantes : ',es:'Bibliotecas faltantes: ',de:'Fehlende Bibliotheken: ',it:'Librerie mancanti: '}[l])+m[1]],
[/^فشل التشغيل: (.+)$/, (m,l)=>({en:'Startup failed: ',fr:'Échec du démarrage : ',es:'Error de inicio: ',de:'Start fehlgeschlagen: ',it:'Avvio non riuscito: '}[l])+m[1]],
[/^مقدرتش أقرأ الملف: (.+)$/, (m,l)=>({en:'Could not read the file: ',fr:'Impossible de lire le fichier : ',es:'No se pudo leer el archivo: ',de:'Datei konnte nicht gelesen werden: ',it:'Impossibile leggere il file: '}[l])+m[1]],
[/^arrayBuffer فشل \((.+)\)، بجرب طريقة تانية/, (m,l)=>({en:'arrayBuffer failed ('+m[1]+'), trying another way...',fr:'arrayBuffer a échoué ('+m[1]+'), autre méthode...',es:'arrayBuffer falló ('+m[1]+'), probando otra forma...',de:'arrayBuffer fehlgeschlagen ('+m[1]+'), anderer Versuch...',it:'arrayBuffer non riuscito ('+m[1]+'), provo un altro modo...'}[l])],
[/^اتختار: (.+)$/, (m,l)=>({en:'Chosen: ',fr:'Choisi : ',es:'Elegido: ',de:'Gewählt: ',it:'Scelto: '}[l])+m[1]],
[/^فشل فتح الـPDF: (.+)$/, (m,l)=>({en:'Failed to open the PDF: ',fr:'Échec de l\'ouverture du PDF : ',es:'No se pudo abrir el PDF: ',de:'PDF konnte nicht geöffnet werden: ',it:'Apertura del PDF non riuscita: '}[l])+m[1]],
[/^فشل رسم صفحة (\d+): (.+)$/, (m,l)=>({en:'Failed to draw page '+m[1]+': ',fr:'Échec de l\'affichage de la page '+m[1]+' : ',es:'No se pudo dibujar la página '+m[1]+': ',de:'Seite '+m[1]+' konnte nicht gezeichnet werden: ',it:'Disegno della pagina '+m[1]+' non riuscito: '}[l])+m[2]],
[/^فشل فتح الملف المشارك: (.+)$/, (m,l)=>({en:'Failed to open the shared file: ',fr:'Échec de l\'ouverture du fichier partagé : ',es:'No se pudo abrir el archivo compartido: ',de:'Geteilte Datei konnte nicht geöffnet werden: ',it:'Apertura del file condiviso non riuscita: '}[l])+m[1]]
);
PATS.push(
[/^⭐ علّمت صفحة (\d+)$/, (m,l)=>({en:'⭐ Marked page ',fr:'⭐ Page marquée ',es:'⭐ Página marcada ',de:'⭐ Seite markiert ',it:'⭐ Pagina segnata '}[l])+m[1]],
[/^اتشالت العلامة من صفحة (\d+)$/, (m,l)=>({en:'Mark removed from page ',fr:'Marque retirée de la page ',es:'Marca quitada de la página ',de:'Markierung von Seite entfernt ',it:'Segno rimosso dalla pagina '}[l])+m[1]],
[/^صفحة (\d+)$/, (m,l)=>({en:'Page ',fr:'Page ',es:'Página ',de:'Seite ',it:'Pagina '}[l])+m[1]],
[/^صفحة (\d+): /, (m,l)=>({en:'Page ',fr:'Page ',es:'Página ',de:'Seite ',it:'Pagina '}[l])+m[1]+': '],
[/^💬 اسألني - صفحة (\d+)$/, (m,l)=>({en:'💬 Ask me - page ',fr:'💬 Demande-moi - page ',es:'💬 Pregúntame - página ',de:'💬 Frag mich - Seite ',it:'💬 Chiedimi - pagina '}[l])+m[1]],
[/^🔍 قراءة نص الصفحة (\d+) \(على الموبايل\)$/, (m,l)=>({en:'🔍 Reading page text '+m[1]+' (on mobile)',fr:'🔍 Lecture du texte de la page '+m[1]+' (sur mobile)',es:'🔍 Leyendo texto de la página '+m[1]+' (en el móvil)',de:'🔍 Seitentext '+m[1]+' wird gelesen (auf dem Handy)',it:'🔍 Lettura testo pagina '+m[1]+' (sul telefono)'}[l])],
[/^📷 اقرأ الصفحة - صفحة (\d+)$/, (m,l)=>({en:'📷 Read the page - page ',fr:'📷 Lire la page - page ',es:'📷 Leer la página - página ',de:'📷 Seite lesen - Seite ',it:'📷 Leggi la pagina - pagina '}[l])+m[1]],
[/^🌐 ترجمة للعربي \(صفحة (\d+)\)$/, (m,l)=>({en:'🌐 Translate to English (page '+m[1]+')',fr:'🌐 Traduire en français (page '+m[1]+')',es:'🌐 Traducir al español (página '+m[1]+')',de:'🌐 Ins Deutsche übersetzen (Seite '+m[1]+')',it:'🌐 Traduci in italiano (pagina '+m[1]+')'}[l])],
[/^بترجم (\d+) من (\d+)/, (m,l)=>({en:'Translating '+m[1]+' of '+m[2],fr:'Traduction '+m[1]+' sur '+m[2],es:'Traduciendo '+m[1]+' de '+m[2],de:'Übersetze '+m[1]+' von '+m[2],it:'Traduzione '+m[1]+' di '+m[2]}[l])],
[/^فشلت الترجمة: (.+)\. /, (m,l)=>({en:'Translation failed: '+m[1]+'. The free service may be down or there is no internet. Try "the other engine" or send the text to the assistant.',fr:'La traduction a échoué : '+m[1]+'. Le service gratuit est peut-être en panne ou hors ligne. Essayez « l\'autre moteur » ou envoyez le texte à l\'assistant.',es:'La traducción falló: '+m[1]+'. El servicio gratuito puede estar caído o sin internet. Prueba "el otro motor" o envía el texto al asistente.',de:'Übersetzung fehlgeschlagen: '+m[1]+'. Der kostenlose Dienst ist vielleicht ausgefallen oder offline. Versuche „die andere Engine" oder schicke den Text an den Assistenten.',it:'Traduzione non riuscita: '+m[1]+'. Il servizio gratuito potrebbe essere offline. Prova "l\'altro motore" o invia il testo all\'assistente.'}[l])],
[/^📝 نوتة اتحطت على صفحة (\d+)\. اسحبها من فوق$/, (m,l)=>({en:'📝 Note placed on page '+m[1]+'. Drag it from the top',fr:'📝 Note placée sur la page '+m[1]+'. Faites-la glisser par le haut',es:'📝 Nota puesta en la página '+m[1]+'. Arrástrala desde arriba',de:'📝 Notiz auf Seite '+m[1]+' platziert. Oben ziehen, um sie zu bewegen',it:'📝 Nota aggiunta alla pagina '+m[1]+'. Trascinala dall\'alto'}[l])],
[/^اختار صفحة \((\d+)\)$/, (m,l)=>({en:'Choose a page (',fr:'Choisissez une page (',es:'Elige una página (',de:'Seite wählen (',it:'Scegli una pagina ('}[l])+m[1]+')'],
[/^عندك (\d+) كارت، منهم (\d+) مستحقين دلوقتي للمراجعة/, (m,l)=>({en:'You have '+m[1]+' cards, '+m[2]+' of them due now for review (spaced repetition).',fr:'Vous avez '+m[1]+' cartes, dont '+m[2]+' à réviser maintenant (répétition espacée).',es:'Tienes '+m[1]+' tarjetas, '+m[2]+' pendientes de repasar ahora (repetición espaciada).',de:'Du hast '+m[1]+' Karten, davon '+m[2]+' jetzt zur Wiederholung fällig (verteilte Wiederholung).',it:'Hai '+m[1]+' schede, di cui '+m[2]+' da ripassare ora (ripetizione dilazionata).'}[l])],
[/^ابدأ المراجعة \((\d+)\)$/, (m,l)=>({en:'Start review (',fr:'Commencer la révision (',es:'Empezar repaso (',de:'Wiederholung starten (',it:'Inizia il ripasso ('}[l])+m[1]+')'],
[/^باقي (\d+) · صفحة (\d+)$/, (m,l)=>({en:'Left '+m[1]+' · page ',fr:'Reste '+m[1]+' · page ',es:'Quedan '+m[1]+' · página ',de:'Übrig '+m[1]+' · Seite ',it:'Rimangono '+m[1]+' · pagina '}[l])+m[2]],
[/^صفحة (\d+) لوحدها\. /, (m,l)=>({en:'Page '+m[1]+' alone. ✕ at the top to go back',fr:'Page '+m[1]+' seule. ✕ en haut pour revenir',es:'Página '+m[1]+' sola. ✕ arriba para volver',de:'Seite '+m[1]+' allein. ✕ oben zum Zurückgehen',it:'Pagina '+m[1]+' da sola. ✕ in alto per tornare'}[l])],
[/^الملف جاهز: (.+)$/, (m,l)=>({en:'File ready: ',fr:'Fichier prêt : ',es:'Archivo listo: ',de:'Datei fertig: ',it:'File pronto: '}[l])+m[1]],
[/^حصل خطأ في الحفظ: (.+)$/, (m,l)=>({en:'Save error: ',fr:'Erreur d\'enregistrement : ',es:'Error al guardar: ',de:'Speicherfehler: ',it:'Errore di salvataggio: '}[l])+m[1]],
[/^خطأ في الكروت: (.+)$/, (m,l)=>({en:'Cards error: ',fr:'Erreur des cartes : ',es:'Error de tarjetas: ',de:'Kartenfehler: ',it:'Errore delle schede: '}[l])+m[1]],
[/^اتفتح أول ملف بس من (\d+)$/, (m,l)=>({en:'Only the first of '+m[1]+' files was opened',fr:'Seul le premier des '+m[1]+' fichiers a été ouvert',es:'Solo se abrió el primero de '+m[1]+' archivos',de:'Nur die erste von '+m[1]+' Dateien wurde geöffnet',it:'È stato aperto solo il primo di '+m[1]+' file'}[l])],
[/^النطق مش شغال: /, (m,l)=>({en:'Speech is not working: ',fr:'La parole ne fonctionne pas : ',es:'La voz no funciona: ',de:'Sprachausgabe funktioniert nicht: ',it:'La voce non funziona: '}[l])],
[/^القراءة فشلت: /, (m,l)=>({en:'Reading failed: ',fr:'La lecture a échoué : ',es:'La lectura falló: ',de:'Lesen fehlgeschlagen: ',it:'Lettura non riuscita: '}[l])],
[/^الشير مش متاح هنا: اضغط مطولاً على الصورة واحفظها، وابعتها في الواتساب واكتب: /, (m,l)=>({en:'Sharing is not available here: long-press the image, save it and send it on WhatsApp with: ',fr:'Le partage n\'est pas disponible ici : appuyez longuement sur l\'image, enregistrez-la et envoyez-la sur WhatsApp avec : ',es:'Compartir no está disponible aquí: mantén pulsada la imagen, guárdala y envíala por WhatsApp con: ',de:'Teilen ist hier nicht verfügbar: Bild lange drücken, speichern und auf WhatsApp senden mit: ',it:'La condivisione non è disponibile qui: tieni premuta l\'immagine, salvala e inviala su WhatsApp con: '}[l])]
);
/* Français */
Object.assign(FR,{
'جاري التحميل…':'Chargement…',
'معلومات وخصوصية':'Infos & confidentialité',
'السابق':'Précédent','التالي':'Suivant','الأدوات':'Outils',
'اضغط الزرار واختار ملف: PDF أو PowerPoint (pptx) أو Word (docx) أو نص أو صورة.':'Appuyez sur le bouton et choisissez un fichier : PDF, PowerPoint (pptx), Word (docx), texte ou image.',
'هايلايت، رسم، كتابة، ممحاة، ترجمة للعربي، وبعدين احفظ نسخة عليها شخبطتك.':'Surlignez, dessinez, écrivez, effacez, traduisez, puis enregistrez une copie annotée.',
'الملف مابيتبعتش لأي مكان، كله على جهازك.':'Le fichier n\'est envoyé nulle part, tout reste sur votre appareil.',
'اختار ملف':'Choisir un fichier','ملف وتنقل':'Fichier et navigation','افتح ملف':'Ouvrir un fichier','الصفحات':'Pages',
'أدوات':'Outils','قراءة':'Lecture','قلم':'Stylo','هايلايت':'Surligner','مربع':'Rectangle','نص':'Texte','ممحاة':'Gomme','ترجم':'Traduire',
'لون وسُمك':'Couleur et épaisseur','لون':'Couleur','السُمك':'Épaisseur','تراجع':'Annuler','إعادة':'Rétablir',
'عرض':'Affichage','تكبير':'Zoom avant','تصغير':'Zoom arrière','عرض الصفحة':'Ajuster la page','ليلي':'Nuit',
'مذاكرة':'Étude','نوتة':'Note','اسألني':'Demande-moi','اقرأ الصفحة':'Lire la page','كروت':'Cartes',
'ملء الشاشة':'Plein écran','اسأل شات':'Demander au chat','بحث':'Rechercher','علّم':'Marquer','المعلّمة':'Marquées','تايمر':'Minuteur',
'حفظ':'Enregistrer','احفظ PDF':'Enregistrer PDF',
'النوع ده مش مدعوم، احفظه PDF أو pptx أو docx':'Ce type n\'est pas pris en charge, enregistrez-le en PDF, pptx ou docx',
'بيفتح الملف...':'Ouverture du fichier...','مفيش ملف اتختار':'Aucun fichier choisi','بيفتح اختيار الملفات...':'Ouverture du sélecteur de fichiers...',
'الملف ده مش PDF سليم أو متشفّر':'Ce fichier n\'est pas un PDF valide ou il est chiffré','مفيش محتوى في الملف':'Aucun contenu dans ce fichier',
'اكتب، وCtrl+Enter أو اضغط برّه عشان تثبّت':'Écrivez, puis Ctrl+Entrée ou touchez dehors pour valider',
'📤 احفظ / شارك الملف (Drive, ملفات, واتساب...)':'📤 Enregistrer / partager le fichier (Drive, Fichiers, WhatsApp...)',
'المشاركة مش شغالة، جرب زرار التحميل':'Le partage ne fonctionne pas, essayez le bouton de téléchargement',
'⬇️ نزّل الملف':'⬇️ Télécharger le fichier','المتصفح منع فتح التبويب':'Le navigateur a bloqué le nouvel onglet','إغلاق':'Fermer',
'افتح PDF الأول':'Ouvrez d\'abord un PDF','بجهّز الملف...':'Préparation du fichier...','مفيش تعديلات على الملف':'Aucune modification sur le fichier',
'مفيش شرايح في الملف':'Aucune diapositive trouvée','(شريحة بدون نص)':'(diapositive sans texte)','ملاحظات المتحدث':'Notes du présentateur',
'PowerPoint: بيتعرض النص بس، الصور والأشكال مش بتظهر':'PowerPoint : seul le texte est affiché, les images et formes n\'apparaissent pas',
'PowerPoint قديم (ppt): بيتعرض النص بس، الصور والأشكال مش بتظهر':'Ancien PowerPoint (ppt) : seul le texte est affiché, les images et formes n\'apparaissent pas',
'Word قديم (doc): بيتعرض النص بس':'Ancien Word (doc) : seul le texte est affiché',
'مش ملف أوفيس قديم سليم':'Pas un ancien fichier Office valide','مش لاقي شرايح في الملف':'Aucune diapositive trouvée dans le fichier',
'مقدرتش أطلّع نص من الملف ده':'Impossible d\'extraire le texte de ce fichier','مش لاقي نص في الملف':'Aucun texte trouvé dans le fichier',
'ملف Word قديم جدًا أو مش سليم':'Fichier Word trop ancien ou invalide','الملف مشفّر':'Le fichier est chiffré',
'مقدرتش أقرأ الملف':'Impossible de lire le fichier','مفيش نص في الملف':'Aucun texte dans le fichier','ملف docx غير سليم':'Fichier docx invalide',
'الملف مش zip سليم':'Le fichier n\'est pas un zip valide'});
Object.assign(FR,{
'النطق مش شغال في المتصفح ده':'La parole ne fonctionne pas dans ce navigateur','🐢 بنطق ببطء...':'🐢 Lecture lente...','🔊 بنطق...':'🔊 Lecture...',
'الصفحات المعلّمة':'Pages marquées','مفيش علامات. اضغط ⭐ علّم وانت واقف على الصفحة.':'Aucune marque. Touchez ⭐ Marquer sur la page.',
'افتح ملف الأول':'Ouvrez d\'abord un fichier','بحث في الملف':'Rechercher dans le fichier','اكتب كلمة...':'Tapez un mot...',
'مفيش نتايج (لو الـPDF صور ممسوحة مفيهوش نص يتبحث فيه)':'Aucun résultat (si le PDF est des images scannées, il n\'y a pas de texte à chercher)',
'ابحث':'Rechercher','تايمر مذاكرة':'Minuteur d\'étude','⏰ خلص الوقت! خد راحة':'⏰ Temps écoulé ! Pause','⏰ خلص التايمر':'⏰ Minuteur terminé',
'مذاكرة 25 دقيقة':'Étude 25 minutes','راحة 5 دقايق':'Pause 5 minutes','مذاكرة 50 دقيقة':'Étude 50 minutes','إيقاف التايمر':'Arrêter le minuteur',
'الشرح بالذكاء الاصطناعي بيتم في شات واتساب مع المساعد، مش جوه الصفحة. ابعت الصورة دي له واكتب "اشرحلي الشريحة دي بالعربي".':'L\'explication par IA se fait dans le chat WhatsApp avec l\'assistant, pas dans la page. Envoyez-lui cette image et écrivez « explique-moi cette diapositive ».',
'📤 ابعت الشريحة للمساعد (شير)':'📤 Envoyer la diapositive à l\'assistant (partager)',
'الشير مش شغال، اضغط مطولاً على الصورة واحفظها':'Le partage ne fonctionne pas, appuyez longuement sur l\'image et enregistrez-la',
'الشير مش متاح هنا: اضغط مطولاً على الصورة واحفظها، وابعتها في الواتساب.':'Le partage n\'est pas disponible ici : appuyez longuement sur l\'image, enregistrez-la et envoyez-la sur WhatsApp.',
'نص الصفحة (تقدر تعمله تحديد ونسخ):':'Texte de la page (vous pouvez le sélectionner et le copier) :',
'جاري التحضير...':'Préparation...','بيقرأ النص...':'Lecture du texte...',
'النص اللي اتقرأ (راجعه، الدقة بتقل مع الصور الوحشة والخط اليدوي):':'Le texte reconnu (vérifiez-le, la précision baisse avec les mauvaises images et l\'écriture manuscrite) :',
'ماقدرتش ألاقي نص في الصفحة دي.':'Aucun texte trouvé sur cette page.',
'📋 نسخ':'📋 Copier','🌐 ترجم':'🌐 Traduire','🤖 اسأل شات':'🤖 Demander au chat','🔊 نطق':'🔊 Lire','🐢 بطيء':'🐢 Lent',
'عربي':'Arabe','عربي + English':'Arabe + English',
'لو الصفحة مش بتتحدد (سكان أو ملف مقفول): ابعت صورتها للمساعد في الشات وهو يقرأ النص ويرجعهولك كنص. القراءة مش على الموبايل، بتتم في الشات، ومفيش خدمة تانية بتستلم الصورة.':'Si la page ne peut pas être sélectionnée (scan ou fichier verrouillé) : envoyez son image à l\'assistant dans le chat et il lira le texte et vous le renverra. La lecture ne se fait pas sur le téléphone, elle se fait dans le chat, et aucun autre service ne reçoit l\'image.',
'📤 ابعت الصفحة للمساعد عشان يقرأها':'📤 Envoyer la page à l\'assistant pour lecture'});
Object.assign(FR,{
'ترجمة آلية مجانية. المصطلحات العلمية والطبية بتظهر جنب النص الإنجليزي الأصلي عشان تراجعها. اختار جزء من النص واضغط "ترجم المحدد"، أو ترجم الصفحة كلها.':'Traduction automatique gratuite. Les termes scientifiques et médicaux apparaissent à côté du texte original pour vérification. Sélectionnez une partie du texte et touchez « Traduire la sélection », ou traduisez toute la page.',
'النص اللي في الصندوق ده بيتبعت لخدمة Google Translate (أو MyMemory لو اخترتها) عشان يتترجم. باقي الملف مابيتبعتش. متضغطش "ترجم" لو النص حساس.':'Le texte de cette zone est envoyé à Google Translate (ou MyMemory si vous le choisissez) pour être traduit. Le reste du fichier n\'est jamais envoyé. Ne touchez pas « Traduire » si le texte est sensible.',
'ℹ️ النص اللي في الصندوق بيتبعت لخدمة ترجمة خارجية.':'ℹ️ Le texte de la zone est envoyé à un service de traduction externe.',
'لما تضغط "افتح ChatGPT" النص اللي في الصندوق بيتبعت لـ ChatGPT (OpenAI) في تبويب جديد، وهو خدمة خارجية ممكن تطلب تسجيل دخول. باقي الملف مابيتبعتش. متضغطش لو النص حساس.':'Quand vous touchez « Ouvrir ChatGPT », le texte de la zone est envoyé à ChatGPT (OpenAI) dans un nouvel onglet, un service externe qui peut demander une connexion. Le reste du fichier n\'est jamais envoyé. Ne touchez pas si le texte est sensible.',
'ℹ️ النص اللي في الصندوق بيتبعت لـ ChatGPT.':'ℹ️ Le texte de la zone est envoyé à ChatGPT.',
'مفيش نص في الصفحة دي (ممكن تكون صورة). اكتب أو الصق النص هنا.':'Pas de texte sur cette page (c\'est peut-être une image). Tapez ou collez le texte ici.',
'مفيش نص للترجمة':'Aucun texte à traduire','ترجم المحدد':'Traduire la sélection','ترجم النص كله':'Tout traduire',
'المحرك: Google':'Moteur : Google','المحرك: MyMemory (فيه ذاكرة ترجمة طبية)':'Moteur : MyMemory (mémoire de traduction médicale)',
'💬 اسألني':'💬 Demande-moi','🐢 نطق بطيء':'🐢 Lecture lente','اتنسخ ✓':'Copié ✓',
'النسخ مش متاح هنا، استخدم زرار نسخ الأندرويد':'La copie n\'est pas disponible ici, utilisez le bouton copier d\'Android','النسخ مش متاح هنا':'La copie n\'est pas disponible ici',
'رجوع للـPDF كله':'Retour au PDF complet','✥ اسحب':'✥ Glisser','أصغر':'Plus petit','أكبر':'Plus grand','⌨️ كيبورد':'⌨️ Clavier','✍️ بإيدك':'✍️ À la main',
'🃏 فلاش كاردز من الهايلايتس':'🃏 Cartes mémoire des surlignages',
'مفيش كروت لسه. اختار قلم الهايلايت 🖍️ وظلّل على كلام مهم في الصفحة، وبعدين ارجع هنا.':'Pas encore de cartes. Prenez le surligneur 🖍️ et marquez le texte important, puis revenez ici.',
'خلصت كل الكروت المستحقة 🎉':'Toutes les cartes dues sont terminées 🎉','اظهر الإجابة':'Voir la réponse',
'😣 لسه مش حافظها':'😣 Pas encore retenue','🙂 تمام':'🙂 OK','😎 سهلة':'😎 Facile','بجهّز الكروت...':'Préparation des cartes...',
'🔗 افتح ChatGPT':'🔗 Ouvrir ChatGPT','📋 انسخ النص والتعليمات':'📋 Copier le texte et les instructions',
'لو التبويب ماتفتحش: انسخ النص وافتح ChatGPT وألصقه بنفسك. الحد الأقصى 1500 حرف.':'Si l\'onglet ne s\'ouvre pas : copiez le texte, ouvrez ChatGPT et collez-le vous-même. Maximum 1500 caractères.',
'ملء الشاشة ✓':'Plein écran ✓','المتصفح مانعها هنا. اسحب الصفحة لفوق بإيدك عشان الهيدر يختفي':'Le navigateur le bloque ici. Faites glisser la page vers le haut vous-même pour cacher l\'en-tête',
'اشرح بالعربي':'Expliquer','لخّص':'Résumer','أسئلة امتحان':'Questions d\'examen',
'الملف جاهز ✅':'Fichier prêt ✅',
'لو التحميل ما بدأش دوس الزرار. بعد التحميل ارجع لصفحة المذاكرة.':'Si le téléchargement n\'a pas démarré, touchez le bouton. Après le téléchargement, revenez à la page d\'étude.',
'وضع صفحة صفحة: شغال':'Mode page par page : activé','وضع صفحة صفحة: واقف':'Mode page par page : désactivé',
'جاهز ✓ اختار ملف.':'Prêt ✓ choisissez un fichier.','مفيش ملف اتشارك.':'Aucun fichier partagé.','غير معروف':'inconnu'});
/* Español */
Object.assign(ES,{
'جاري التحميل…':'Cargando…',
'معلومات وخصوصية':'Información y privacidad',
'السابق':'Anterior','التالي':'Siguiente','الأدوات':'Herramientas',
'اضغط الزرار واختار ملف: PDF أو PowerPoint (pptx) أو Word (docx) أو نص أو صورة.':'Pulsa el botón y elige un archivo: PDF, PowerPoint (pptx), Word (docx), texto o imagen.',
'هايلايت، رسم، كتابة، ممحاة، ترجمة للعربي، وبعدين احفظ نسخة عليها شخبطتك.':'Subraya, dibuja, escribe, borra, traduce y luego guarda una copia con tus notas.',
'الملف مابيتبعتش لأي مكان، كله على جهازك.':'El archivo no se envía a ningún sitio, todo queda en tu dispositivo.',
'اختار ملف':'Elige un archivo','ملف وتنقل':'Archivo y navegación','افتح ملف':'Abrir archivo','الصفحات':'Páginas',
'أدوات':'Herramientas','قراءة':'Lectura','قلم':'Pluma','هايلايت':'Subrayar','مربع':'Recuadro','نص':'Texto','ممحاة':'Borrador','ترجم':'Traducir',
'لون وسُمك':'Color y grosor','لون':'Color','السُمك':'Grosor','تراجع':'Deshacer','إعادة':'Rehacer',
'عرض':'Vista','تكبير':'Acercar','تصغير':'Alejar','عرض الصفحة':'Ajustar página','ليلي':'Nocturno',
'مذاكرة':'Estudio','نوتة':'Nota','اسألني':'Pregúntame','اقرأ الصفحة':'Leer página','كروت':'Tarjetas',
'ملء الشاشة':'Pantalla completa','اسأل شات':'Preguntar al chat','بحث':'Buscar','علّم':'Marcar','المعلّمة':'Marcadas','تايمر':'Temporizador',
'حفظ':'Guardar','احفظ PDF':'Guardar PDF',
'النوع ده مش مدعوم، احفظه PDF أو pptx أو docx':'Este tipo no es compatible, guárdalo como PDF, pptx o docx',
'بيفتح الملف...':'Abriendo el archivo...','مفيش ملف اتختار':'Ningún archivo elegido','بيفتح اختيار الملفات...':'Abriendo el selector de archivos...',
'الملف ده مش PDF سليم أو متشفّر':'Este archivo no es un PDF válido o está cifrado','مفيش محتوى في الملف':'No hay contenido en este archivo',
'اكتب، وCtrl+Enter أو اضغط برّه عشان تثبّت':'Escribe, luego Ctrl+Intro o toca fuera para fijarlo',
'📤 احفظ / شارك الملف (Drive, ملفات, واتساب...)':'📤 Guardar / compartir el archivo (Drive, Archivos, WhatsApp...)',
'المشاركة مش شغالة، جرب زرار التحميل':'Compartir no funciona, prueba el botón de descarga',
'⬇️ نزّل الملف':'⬇️ Descargar el archivo','المتصفح منع فتح التبويب':'El navegador bloqueó la nueva pestaña','إغلاق':'Cerrar',
'افتح PDF الأول':'Abre primero un PDF','بجهّز الملف...':'Preparando el archivo...','مفيش تعديلات على الملف':'No hay cambios en el archivo',
'مفيش شرايح في الملف':'No se encontraron diapositivas','(شريحة بدون نص)':'(diapositiva sin texto)','ملاحظات المتحدث':'Notas del orador',
'PowerPoint: بيتعرض النص بس، الصور والأشكال مش بتظهر':'PowerPoint: solo se muestra el texto, las imágenes y formas no aparecen',
'PowerPoint قديم (ppt): بيتعرض النص بس، الصور والأشكال مش بتظهر':'PowerPoint antiguo (ppt): solo se muestra el texto, las imágenes y formas no aparecen',
'Word قديم (doc): بيتعرض النص بس':'Word antiguo (doc): solo se muestra el texto',
'مش ملف أوفيس قديم سليم':'No es un archivo Office antiguo válido','مش لاقي شرايح في الملف':'No se encontraron diapositivas en el archivo',
'مقدرتش أطلّع نص من الملف ده':'No se pudo extraer texto de este archivo','مش لاقي نص في الملف':'No se encontró texto en el archivo',
'ملف Word قديم جدًا أو مش سليم':'Archivo Word demasiado antiguo o inválido','الملف مشفّر':'El archivo está cifrado',
'مقدرتش أقرأ الملف':'No se pudo leer el archivo','مفيش نص في الملف':'No hay texto en el archivo','ملف docx غير سليم':'Archivo docx inválido',
'الملف مش zip سليم':'El archivo no es un zip válido'});
Object.assign(ES,{
'النطق مش شغال في المتصفح ده':'La voz no funciona en este navegador','🐢 بنطق ببطء...':'🐢 Leyendo despacio...','🔊 بنطق...':'🔊 Leyendo...',
'الصفحات المعلّمة':'Páginas marcadas','مفيش علامات. اضغط ⭐ علّم وانت واقف على الصفحة.':'No hay marcas. Pulsa ⭐ Marcar estando en la página.',
'افتح ملف الأول':'Abre primero un archivo','بحث في الملف':'Buscar en el archivo','اكتب كلمة...':'Escribe una palabra...',
'مفيش نتايج (لو الـPDF صور ممسوحة مفيهوش نص يتبحث فيه)':'Sin resultados (si el PDF son imágenes escaneadas, no hay texto que buscar)',
'ابحث':'Buscar','تايمر مذاكرة':'Temporizador de estudio','⏰ خلص الوقت! خد راحة':'⏰ ¡Se acabó el tiempo! Descansa','⏰ خلص التايمر':'⏰ Temporizador terminado',
'مذاكرة 25 دقيقة':'Estudiar 25 minutos','راحة 5 دقايق':'Descanso 5 minutos','مذاكرة 50 دقيقة':'Estudiar 50 minutos','إيقاف التايمر':'Detener el temporizador',
'الشرح بالذكاء الاصطناعي بيتم في شات واتساب مع المساعد، مش جوه الصفحة. ابعت الصورة دي له واكتب "اشرحلي الشريحة دي بالعربي".':'La explicación con IA se hace en el chat de WhatsApp con el asistente, no dentro de la página. Envíale esta imagen y escribe "explícame esta diapositiva".',
'📤 ابعت الشريحة للمساعد (شير)':'📤 Enviar la diapositiva al asistente (compartir)',
'الشير مش شغال، اضغط مطولاً على الصورة واحفظها':'Compartir no funciona, mantén pulsada la imagen y guárdala',
'الشير مش متاح هنا: اضغط مطولاً على الصورة واحفظها، وابعتها في الواتساب.':'Compartir no está disponible aquí: mantén pulsada la imagen, guárdala y envíala por WhatsApp.',
'نص الصفحة (تقدر تعمله تحديد ونسخ):':'Texto de la página (puedes seleccionarlo y copiarlo):',
'جاري التحضير...':'Preparando...','بيقرأ النص...':'Leyendo el texto...',
'النص اللي اتقرأ (راجعه، الدقة بتقل مع الصور الوحشة والخط اليدوي):':'El texto reconocido (revísalo, la precisión baja con malas imágenes y escritura a mano):',
'ماقدرتش ألاقي نص في الصفحة دي.':'No se encontró texto en esta página.',
'📋 نسخ':'📋 Copiar','🌐 ترجم':'🌐 Traducir','🤖 اسأل شات':'🤖 Preguntar al chat','🔊 نطق':'🔊 Leer','🐢 بطيء':'🐢 Lento',
'عربي':'Árabe','عربي + English':'Árabe + English',
'لو الصفحة مش بتتحدد (سكان أو ملف مقفول): ابعت صورتها للمساعد في الشات وهو يقرأ النص ويرجعهولك كنص. القراءة مش على الموبايل، بتتم في الشات، ومفيش خدمة تانية بتستلم الصورة.':'Si la página no se puede seleccionar (escaneo o archivo bloqueado): envía su imagen al asistente en el chat y leerá el texto y te lo devolverá. La lectura no se hace en el móvil, se hace en el chat, y ningún otro servicio recibe la imagen.',
'📤 ابعت الصفحة للمساعد عشان يقرأها':'📤 Enviar la página al asistente para que la lea'});
Object.assign(ES,{
'ترجمة آلية مجانية. المصطلحات العلمية والطبية بتظهر جنب النص الإنجليزي الأصلي عشان تراجعها. اختار جزء من النص واضغط "ترجم المحدد"، أو ترجم الصفحة كلها.':'Traducción automática gratuita. Los términos científicos y médicos aparecen junto al texto original para que los revises. Selecciona parte del texto y pulsa "Traducir selección", o traduce toda la página.',
'النص اللي في الصندوق ده بيتبعت لخدمة Google Translate (أو MyMemory لو اخترتها) عشان يتترجم. باقي الملف مابيتبعتش. متضغطش "ترجم" لو النص حساس.':'El texto de este cuadro se envía a Google Translate (o MyMemory si lo eliges) para traducirse. El resto del archivo nunca se envía. No pulses "Traducir" si el texto es sensible.',
'ℹ️ النص اللي في الصندوق بيتبعت لخدمة ترجمة خارجية.':'ℹ️ El texto del cuadro se envía a un servicio de traducción externo.',
'لما تضغط "افتح ChatGPT" النص اللي في الصندوق بيتبعت لـ ChatGPT (OpenAI) في تبويب جديد، وهو خدمة خارجية ممكن تطلب تسجيل دخول. باقي الملف مابيتبعتش. متضغطش لو النص حساس.':'Al pulsar "Abrir ChatGPT" el texto del cuadro se envía a ChatGPT (OpenAI) en una pestaña nueva, un servicio externo que puede pedir inicio de sesión. El resto del archivo nunca se envía. No lo pulses si el texto es sensible.',
'ℹ️ النص اللي في الصندوق بيتبعت لـ ChatGPT.':'ℹ️ El texto del cuadro se envía a ChatGPT.',
'مفيش نص في الصفحة دي (ممكن تكون صورة). اكتب أو الصق النص هنا.':'No hay texto en esta página (puede ser una imagen). Escribe o pega el texto aquí.',
'مفيش نص للترجمة':'No hay texto para traducir','ترجم المحدد':'Traducir selección','ترجم النص كله':'Traducir todo',
'المحرك: Google':'Motor: Google','المحرك: MyMemory (فيه ذاكرة ترجمة طبية)':'Motor: MyMemory (con memoria de traducción médica)',
'💬 اسألني':'💬 Pregúntame','🐢 نطق بطيء':'🐢 Lectura lenta','اتنسخ ✓':'Copiado ✓',
'النسخ مش متاح هنا، استخدم زرار نسخ الأندرويد':'Copiar no está disponible aquí, usa el botón de copiar de Android','النسخ مش متاح هنا':'Copiar no está disponible aquí',
'رجوع للـPDF كله':'Volver al PDF completo','✥ اسحب':'✥ Arrastrar','أصغر':'Más pequeño','أكبر':'Más grande','⌨️ كيبورد':'⌨️ Teclado','✍️ بإيدك':'✍️ A mano',
'🃏 فلاش كاردز من الهايلايتس':'🃏 Tarjetas de los subrayados',
'مفيش كروت لسه. اختار قلم الهايلايت 🖍️ وظلّل على كلام مهم في الصفحة، وبعدين ارجع هنا.':'Aún no hay tarjetas. Coge la pluma de subrayar 🖍️ y marca texto importante en la página, luego vuelve aquí.',
'خلصت كل الكروت المستحقة 🎉':'Terminaste todas las tarjetas pendientes 🎉','اظهر الإجابة':'Ver respuesta',
'😣 لسه مش حافظها':'😣 Aún no la sé','🙂 تمام':'🙂 Bien','😎 سهلة':'😎 Fácil','بجهّز الكروت...':'Preparando tarjetas...',
'🔗 افتح ChatGPT':'🔗 Abrir ChatGPT','📋 انسخ النص والتعليمات':'📋 Copiar texto e instrucciones',
'لو التبويب ماتفتحش: انسخ النص وافتح ChatGPT وألصقه بنفسك. الحد الأقصى 1500 حرف.':'Si la pestaña no se abre: copia el texto, abre ChatGPT y pégalo tú mismo. Máximo 1500 caracteres.',
'ملء الشاشة ✓':'Pantalla completa ✓','المتصفح مانعها هنا. اسحب الصفحة لفوق بإيدك عشان الهيدر يختفي':'El navegador lo bloquea aquí. Desliza la página hacia arriba tú mismo para ocultar la barra',
'اشرح بالعربي':'Explicar','لخّص':'Resumir','أسئلة امتحان':'Preguntas de examen',
'الملف جاهز ✅':'Archivo listo ✅',
'لو التحميل ما بدأش دوس الزرار. بعد التحميل ارجع لصفحة المذاكرة.':'Si la descarga no empezó, pulsa el botón. Después de descargar, vuelve a la página de estudio.',
'وضع صفحة صفحة: شغال':'Modo página a página: activado','وضع صفحة صفحة: واقف':'Modo página a página: desactivado',
'جاهز ✓ اختار ملف.':'Listo ✓ elige un archivo.','مفيش ملف اتشارك.':'No hay archivo compartido.','غير معروف':'desconocido'});
/* Deutsch */
Object.assign(DE,{
'جاري التحميل…':'Wird geladen…',
'معلومات وخصوصية':'Info & Datenschutz',
'السابق':'Zurück','التالي':'Weiter','الأدوات':'Werkzeuge',
'اضغط الزرار واختار ملف: PDF أو PowerPoint (pptx) أو Word (docx) أو نص أو صورة.':'Tippe auf die Schaltfläche und wähle eine Datei: PDF, PowerPoint (pptx), Word (docx), Text oder Bild.',
'هايلايت، رسم، كتابة، ممحاة، ترجمة للعربي، وبعدين احفظ نسخة عليها شخبطتك.':'Markieren, zeichnen, schreiben, radieren, übersetzen, dann eine Kopie mit deinen Notizen speichern.',
'الملف مابيتبعتش لأي مكان، كله على جهازك.':'Die Datei wird nirgendwo hin gesendet, alles bleibt auf deinem Gerät.',
'اختار ملف':'Datei wählen','ملف وتنقل':'Datei & Navigation','افتح ملف':'Datei öffnen','الصفحات':'Seiten',
'أدوات':'Werkzeuge','قراءة':'Lesen','قلم':'Stift','هايلايت':'Markieren','مربع':'Rechteck','نص':'Text','ممحاة':'Radierer','ترجم':'Übersetzen',
'لون وسُمك':'Farbe & Stärke','لون':'Farbe','السُمك':'Stärke','تراجع':'Rückgängig','إعادة':'Wiederholen',
'عرض':'Ansicht','تكبير':'Vergrößern','تصغير':'Verkleinern','عرض الصفحة':'Seite einpassen','ليلي':'Nacht',
'مذاكرة':'Lernen','نوتة':'Notiz','اسألني':'Frag mich','اقرأ الصفحة':'Seite lesen','كروت':'Karten',
'ملء الشاشة':'Vollbild','اسأل شات':'Chat fragen','بحث':'Suchen','علّم':'Markieren','المعلّمة':'Markierte','تايمر':'Timer',
'حفظ':'Speichern','احفظ PDF':'PDF speichern',
'النوع ده مش مدعوم، احفظه PDF أو pptx أو docx':'Dieser Typ wird nicht unterstützt, speichere ihn als PDF, pptx oder docx',
'بيفتح الملف...':'Datei wird geöffnet...','مفيش ملف اتختار':'Keine Datei gewählt','بيفتح اختيار الملفات...':'Dateiauswahl wird geöffnet...',
'الملف ده مش PDF سليم أو متشفّر':'Diese Datei ist kein gültiges PDF oder sie ist verschlüsselt','مفيش محتوى في الملف':'Kein Inhalt in dieser Datei',
'اكتب، وCtrl+Enter أو اضغط برّه عشان تثبّت':'Schreiben, dann Strg+Eingabe oder außerhalb tippen zum Übernehmen',
'📤 احفظ / شارك الملف (Drive, ملفات, واتساب...)':'📤 Datei speichern / teilen (Drive, Dateien, WhatsApp...)',
'المشاركة مش شغالة، جرب زرار التحميل':'Teilen funktioniert nicht, versuche die Download-Schaltfläche',
'⬇️ نزّل الملف':'⬇️ Datei herunterladen','المتصفح منع فتح التبويب':'Der Browser hat den neuen Tab blockiert','إغلاق':'Schließen',
'افتح PDF الأول':'Öffne zuerst ein PDF','بجهّز الملف...':'Datei wird vorbereitet...','مفيش تعديلات على الملف':'Keine Änderungen an der Datei',
'مفيش شرايح في الملف':'Keine Folien gefunden','(شريحة بدون نص)':'(Folie ohne Text)','ملاحظات المتحدث':'Vortragsnotizen',
'PowerPoint: بيتعرض النص بس، الصور والأشكال مش بتظهر':'PowerPoint: nur Text wird gezeigt, Bilder und Formen erscheinen nicht',
'PowerPoint قديم (ppt): بيتعرض النص بس، الصور والأشكال مش بتظهر':'Altes PowerPoint (ppt): nur Text wird gezeigt, Bilder und Formen erscheinen nicht',
'Word قديم (doc): بيتعرض النص بس':'Altes Word (doc): nur Text wird gezeigt',
'مش ملف أوفيس قديم سليم':'Keine gültige alte Office-Datei','مش لاقي شرايح في الملف':'Keine Folien in der Datei gefunden',
'مقدرتش أطلّع نص من الملف ده':'Text konnte aus dieser Datei nicht extrahiert werden','مش لاقي نص في الملف':'Kein Text in der Datei gefunden',
'ملف Word قديم جدًا أو مش سليم':'Word-Datei zu alt oder ungültig','الملف مشفّر':'Die Datei ist verschlüsselt',
'مقدرتش أقرأ الملف':'Datei konnte nicht gelesen werden','مفيش نص في الملف':'Kein Text in der Datei','ملف docx غير سليم':'Ungültige docx-Datei',
'الملف مش zip سليم':'Die Datei ist kein gültiges Zip'});
Object.assign(DE,{
'النطق مش شغال في المتصفح ده':'Sprachausgabe funktioniert in diesem Browser nicht','🐢 بنطق ببطء...':'🐢 Langsames Vorlesen...','🔊 بنطق...':'🔊 Vorlesen...',
'الصفحات المعلّمة':'Markierte Seiten','مفيش علامات. اضغط ⭐ علّم وانت واقف على الصفحة.':'Keine Markierungen. Tippe auf der Seite auf ⭐ Markieren.',
'افتح ملف الأول':'Öffne zuerst eine Datei','بحث في الملف':'In der Datei suchen','اكتب كلمة...':'Wort eingeben...',
'مفيش نتايج (لو الـPDF صور ممسوحة مفيهوش نص يتبحث فيه)':'Keine Ergebnisse (bei gescannten Bildern gibt es keinen durchsuchbaren Text)',
'ابحث':'Suchen','تايمر مذاكرة':'Lern-Timer','⏰ خلص الوقت! خد راحة':'⏰ Zeit um! Mach Pause','⏰ خلص التايمر':'⏰ Timer fertig',
'مذاكرة 25 دقيقة':'25 Minuten lernen','راحة 5 دقايق':'5 Minuten Pause','مذاكرة 50 دقيقة':'50 Minuten lernen','إيقاف التايمر':'Timer stoppen',
'الشرح بالذكاء الاصطناعي بيتم في شات واتساب مع المساعد، مش جوه الصفحة. ابعت الصورة دي له واكتب "اشرحلي الشريحة دي بالعربي".':'Die KI-Erklärung läuft im WhatsApp-Chat mit dem Assistenten, nicht auf der Seite. Schicke ihm dieses Bild und schreibe „Erklär mir diese Folie".',
'📤 ابعت الشريحة للمساعد (شير)':'📤 Folie an den Assistenten senden (teilen)',
'الشير مش شغال، اضغط مطولاً على الصورة واحفظها':'Teilen funktioniert nicht, Bild lange drücken und speichern',
'الشير مش متاح هنا: اضغط مطولاً على الصورة واحفظها، وابعتها في الواتساب.':'Teilen ist hier nicht verfügbar: Bild lange drücken, speichern und auf WhatsApp senden.',
'نص الصفحة (تقدر تعمله تحديد ونسخ):':'Seitentext (du kannst ihn markieren und kopieren):',
'جاري التحضير...':'Wird vorbereitet...','بيقرأ النص...':'Text wird gelesen...',
'النص اللي اتقرأ (راجعه، الدقة بتقل مع الصور الوحشة والخط اليدوي):':'Der erkannte Text (bitte prüfen, die Genauigkeit sinkt bei schlechten Bildern und Handschrift):',
'ماقدرتش ألاقي نص في الصفحة دي.':'Auf dieser Seite wurde kein Text gefunden.',
'📋 نسخ':'📋 Kopieren','🌐 ترجم':'🌐 Übersetzen','🤖 اسأل شات':'🤖 Chat fragen','🔊 نطق':'🔊 Vorlesen','🐢 بطيء':'🐢 Langsam',
'عربي':'Arabisch','عربي + English':'Arabisch + English',
'لو الصفحة مش بتتحدد (سكان أو ملف مقفول): ابعت صورتها للمساعد في الشات وهو يقرأ النص ويرجعهولك كنص. القراءة مش على الموبايل، بتتم في الشات، ومفيش خدمة تانية بتستلم الصورة.':'Wenn die Seite nicht markierbar ist (Scan oder gesperrte Datei): Schicke ihr Bild an den Assistenten im Chat, er liest den Text und schickt ihn dir zurück. Das Lesen passiert nicht auf dem Handy, sondern im Chat, und kein anderer Dienst empfängt das Bild.',
'📤 ابعت الصفحة للمساعد عشان يقرأها':'📤 Seite zum Lesen an den Assistenten senden'});
Object.assign(DE,{
'ترجمة آلية مجانية. المصطلحات العلمية والطبية بتظهر جنب النص الإنجليزي الأصلي عشان تراجعها. اختار جزء من النص واضغط "ترجم المحدد"، أو ترجم الصفحة كلها.':'Kostenlose maschinelle Übersetzung. Fachbegriffe erscheinen neben dem Originaltext zum Prüfen. Markiere einen Teil und tippe auf „Auswahl übersetzen", oder übersetze die ganze Seite.',
'النص اللي في الصندوق ده بيتبعت لخدمة Google Translate (أو MyMemory لو اخترتها) عشان يتترجم. باقي الملف مابيتبعتش. متضغطش "ترجم" لو النص حساس.':'Der Text in diesem Feld wird zum Übersetzen an Google Translate (oder MyMemory, wenn gewählt) gesendet. Der Rest der Datei wird nie gesendet. Tippe nicht auf „Übersetzen", wenn der Text sensibel ist.',
'ℹ️ النص اللي في الصندوق بيتبعت لخدمة ترجمة خارجية.':'ℹ️ Der Text im Feld wird an einen externen Übersetzungsdienst gesendet.',
'لما تضغط "افتح ChatGPT" النص اللي في الصندوق بيتبعت لـ ChatGPT (OpenAI) في تبويب جديد، وهو خدمة خارجية ممكن تطلب تسجيل دخول. باقي الملف مابيتبعتش. متضغطش لو النص حساس.':'Wenn du auf „ChatGPT öffnen" tippst, wird der Text im Feld in einem neuen Tab an ChatGPT (OpenAI) gesendet, ein externer Dienst, der eine Anmeldung verlangen kann. Der Rest der Datei wird nie gesendet. Nicht tippen, wenn der Text sensibel ist.',
'ℹ️ النص اللي في الصندوق بيتبعت لـ ChatGPT.':'ℹ️ Der Text im Feld wird an ChatGPT gesendet.',
'مفيش نص في الصفحة دي (ممكن تكون صورة). اكتب أو الصق النص هنا.':'Kein Text auf dieser Seite (vielleicht ein Bild). Schreibe oder füge den Text hier ein.',
'مفيش نص للترجمة':'Kein Text zum Übersetzen','ترجم المحدد':'Auswahl übersetzen','ترجم النص كله':'Alles übersetzen',
'المحرك: Google':'Engine: Google','المحرك: MyMemory (فيه ذاكرة ترجمة طبية)':'Engine: MyMemory (mit medizinischem Translation Memory)',
'💬 اسألني':'💬 Frag mich','🐢 نطق بطيء':'🐢 Langsam vorlesen','اتنسخ ✓':'Kopiert ✓',
'النسخ مش متاح هنا، استخدم زرار نسخ الأندرويد':'Kopieren ist hier nicht verfügbar, nutze die Android-Kopierfunktion','النسخ مش متاح هنا':'Kopieren ist hier nicht verfügbar',
'رجوع للـPDF كله':'Zurück zum ganzen PDF','✥ اسحب':'✥ Ziehen','أصغر':'Kleiner','أكبر':'Größer','⌨️ كيبورد':'⌨️ Tastatur','✍️ بإيدك':'✍️ Von Hand',
'🃏 فلاش كاردز من الهايلايتس':'🃏 Karteikarten aus Markierungen',
'مفيش كروت لسه. اختار قلم الهايلايت 🖍️ وظلّل على كلام مهم في الصفحة، وبعدين ارجع هنا.':'Noch keine Karten. Nimm den Marker 🖍️ und markiere wichtigen Text auf der Seite, dann komm hierher zurück.',
'خلصت كل الكروت المستحقة 🎉':'Alle fälligen Karten geschafft 🎉','اظهر الإجابة':'Antwort zeigen',
'😣 لسه مش حافظها':'😣 Noch nicht gelernt','🙂 تمام':'🙂 Okay','😎 سهلة':'😎 Leicht','بجهّز الكروت...':'Karten werden vorbereitet...',
'🔗 افتح ChatGPT':'🔗 ChatGPT öffnen','📋 انسخ النص والتعليمات':'📋 Text und Anweisungen kopieren',
'لو التبويب ماتفتحش: انسخ النص وافتح ChatGPT وألصقه بنفسك. الحد الأقصى 1500 حرف.':'Wenn der Tab nicht aufgeht: Text kopieren, ChatGPT öffnen und selbst einfügen. Maximal 1500 Zeichen.',
'ملء الشاشة ✓':'Vollbild ✓','المتصفح مانعها هنا. اسحب الصفحة لفوق بإيدك عشان الهيدر يختفي':'Der Browser blockiert es hier. Ziehe die Seite selbst nach oben, um die Leiste auszublenden',
'اشرح بالعربي':'Erklären','لخّص':'Zusammenfassen','أسئلة امتحان':'Prüfungsfragen',
'الملف جاهز ✅':'Datei fertig ✅',
'لو التحميل ما بدأش دوس الزرار. بعد التحميل ارجع لصفحة المذاكرة.':'Wenn der Download nicht startet, tippe auf die Schaltfläche. Kehre danach zur Lernseite zurück.',
'وضع صفحة صفحة: شغال':'Einzelseiten-Modus: an','وضع صفحة صفحة: واقف':'Einzelseiten-Modus: aus',
'جاهز ✓ اختار ملف.':'Bereit ✓ wähle eine Datei.','مفيش ملف اتشارك.':'Keine geteilte Datei.','غير معروف':'unbekannt'});
/* Italiano */
Object.assign(IT,{
'جاري التحميل…':'Caricamento…',
'معلومات وخصوصية':'Info e privacy',
'السابق':'Precedente','التالي':'Successivo','الأدوات':'Strumenti',
'اضغط الزرار واختار ملف: PDF أو PowerPoint (pptx) أو Word (docx) أو نص أو صورة.':'Tocca il pulsante e scegli un file: PDF, PowerPoint (pptx), Word (docx), testo o immagine.',
'هايلايت، رسم، كتابة، ممحاة، ترجمة للعربي، وبعدين احفظ نسخة عليها شخبطتك.':'Evidenzia, disegna, scrivi, cancella, traduci, poi salva una copia con i tuoi appunti.',
'الملف مابيتبعتش لأي مكان، كله على جهازك.':'Il file non viene inviato da nessuna parte, tutto resta sul tuo dispositivo.',
'اختار ملف':'Scegli un file','ملف وتنقل':'File e navigazione','افتح ملف':'Apri file','الصفحات':'Pagine',
'أدوات':'Strumenti','قراءة':'Lettura','قلم':'Penna','هايلايت':'Evidenzia','مربع':'Riquadro','نص':'Testo','ممحاة':'Gomma','ترجم':'Traduci',
'لون وسُمك':'Colore e spessore','لون':'Colore','السُمك':'Spessore','تراجع':'Annulla','إعادة':'Ripeti',
'عرض':'Vista','تكبير':'Ingrandisci','تصغير':'Riduci','عرض الصفحة':'Adatta pagina','ليلي':'Notte',
'مذاكرة':'Studio','نوتة':'Nota','اسألني':'Chiedimi','اقرأ الصفحة':'Leggi pagina','كروت':'Schede',
'ملء الشاشة':'Schermo intero','اسأل شات':'Chiedi alla chat','بحث':'Cerca','علّم':'Segna','المعلّمة':'Segnate','تايمر':'Timer',
'حفظ':'Salva','احفظ PDF':'Salva PDF',
'النوع ده مش مدعوم، احفظه PDF أو pptx أو docx':'Questo tipo non è supportato, salvalo come PDF, pptx o docx',
'بيفتح الملف...':'Apertura del file...','مفيش ملف اتختار':'Nessun file scelto','بيفتح اختيار الملفات...':'Apertura del selettore file...',
'الملف ده مش PDF سليم أو متشفّر':'Questo file non è un PDF valido o è cifrato','مفيش محتوى في الملف':'Nessun contenuto in questo file',
'اكتب، وCtrl+Enter أو اضغط برّه عشان تثبّت':'Scrivi, poi Ctrl+Invio o tocca fuori per confermare',
'📤 احفظ / شارك الملف (Drive, ملفات, واتساب...)':'📤 Salva / condividi il file (Drive, File, WhatsApp...)',
'المشاركة مش شغالة، جرب زرار التحميل':'La condivisione non funziona, prova il pulsante di download',
'⬇️ نزّل الملف':'⬇️ Scarica il file','المتصفح منع فتح التبويب':'Il browser ha bloccato la nuova scheda','إغلاق':'Chiudi',
'افتح PDF الأول':'Apri prima un PDF','بجهّز الملف...':'Preparazione del file...','مفيش تعديلات على الملف':'Nessuna modifica al file',
'مفيش شرايح في الملف':'Nessuna diapositiva trovata','(شريحة بدون نص)':'(diapositiva senza testo)','ملاحظات المتحدث':'Note del relatore',
'PowerPoint: بيتعرض النص بس، الصور والأشكال مش بتظهر':'PowerPoint: viene mostrato solo il testo, immagini e forme non appaiono',
'PowerPoint قديم (ppt): بيتعرض النص بس، الصور والأشكال مش بتظهر':'Vecchio PowerPoint (ppt): viene mostrato solo il testo, immagini e forme non appaiono',
'Word قديم (doc): بيتعرض النص بس':'Vecchio Word (doc): viene mostrato solo il testo',
'مش ملف أوفيس قديم سليم':'Non è un vecchio file Office valido','مش لاقي شرايح في الملف':'Nessuna diapositiva trovata nel file',
'مقدرتش أطلّع نص من الملف ده':'Impossibile estrarre testo da questo file','مش لاقي نص في الملف':'Nessun testo trovato nel file',
'ملف Word قديم جدًا أو مش سليم':'File Word troppo vecchio o non valido','الملف مشفّر':'Il file è cifrato',
'مقدرتش أقرأ الملف':'Impossibile leggere il file','مفيش نص في الملف':'Nessun testo nel file','ملف docx غير سليم':'File docx non valido',
'الملف مش zip سليم':'Il file non è uno zip valido'});
Object.assign(IT,{
'النطق مش شغال في المتصفح ده':'La voce non funziona in questo browser','🐢 بنطق ببطء...':'🐢 Lettura lenta...','🔊 بنطق...':'🔊 Lettura...',
'الصفحات المعلّمة':'Pagine segnate','مفيش علامات. اضغط ⭐ علّم وانت واقف على الصفحة.':'Nessun segno. Tocca ⭐ Segna mentre sei sulla pagina.',
'افتح ملف الأول':'Apri prima un file','بحث في الملف':'Cerca nel file','اكتب كلمة...':'Scrivi una parola...',
'مفيش نتايج (لو الـPDF صور ممسوحة مفيهوش نص يتبحث فيه)':'Nessun risultato (se il PDF è fatto di immagini scansionate, non c\'è testo da cercare)',
'ابحث':'Cerca','تايمر مذاكرة':'Timer di studio','⏰ خلص الوقت! خد راحة':'⏰ Tempo finito! Fai una pausa','⏰ خلص التايمر':'⏰ Timer finito',
'مذاكرة 25 دقيقة':'Studia 25 minuti','راحة 5 دقايق':'Pausa 5 minuti','مذاكرة 50 دقيقة':'Studia 50 minuti','إيقاف التايمر':'Ferma il timer',
'الشرح بالذكاء الاصطناعي بيتم في شات واتساب مع المساعد، مش جوه الصفحة. ابعت الصورة دي له واكتب "اشرحلي الشريحة دي بالعربي".':'La spiegazione con l\'IA avviene nella chat WhatsApp con l\'assistente, non nella pagina. Invia questa immagine e scrivi "spiegami questa diapositiva".',
'📤 ابعت الشريحة للمساعد (شير)':'📤 Invia la diapositiva all\'assistente (condividi)',
'الشير مش شغال، اضغط مطولاً على الصورة واحفظها':'La condivisione non funziona, tieni premuta l\'immagine e salvala',
'الشير مش متاح هنا: اضغط مطولاً على الصورة واحفظها، وابعتها في الواتساب.':'La condivisione non è disponibile qui: tieni premuta l\'immagine, salvala e inviala su WhatsApp.',
'نص الصفحة (تقدر تعمله تحديد ونسخ):':'Testo della pagina (puoi selezionarlo e copiarlo):',
'جاري التحضير...':'Preparazione...','بيقرأ النص...':'Lettura del testo...',
'النص اللي اتقرأ (راجعه، الدقة بتقل مع الصور الوحشة والخط اليدوي):':'Il testo riconosciuto (ricontrollalo, la precisione cala con immagini brutte e scrittura a mano):',
'ماقدرتش ألاقي نص في الصفحة دي.':'Nessun testo trovato in questa pagina.',
'📋 نسخ':'📋 Copia','🌐 ترجم':'🌐 Traduci','🤖 اسأل شات':'🤖 Chiedi alla chat','🔊 نطق':'🔊 Leggi','🐢 بطيء':'🐢 Lento',
'عربي':'Arabo','عربي + English':'Arabo + English',
'لو الصفحة مش بتتحدد (سكان أو ملف مقفول): ابعت صورتها للمساعد في الشات وهو يقرأ النص ويرجعهولك كنص. القراءة مش على الموبايل، بتتم في الشات، ومفيش خدمة تانية بتستلم الصورة.':'Se la pagina non è selezionabile (scansione o file bloccato): invia la sua immagine all\'assistente in chat e leggerà il testo e te lo rimanderà. La lettura non avviene sul telefono, avviene in chat, e nessun altro servizio riceve l\'immagine.',
'📤 ابعت الصفحة للمساعد عشان يقرأها':'📤 Invia la pagina all\'assistente per leggerla'});
Object.assign(IT,{
'ترجمة آلية مجانية. المصطلحات العلمية والطبية بتظهر جنب النص الإنجليزي الأصلي عشان تراجعها. اختار جزء من النص واضغط "ترجم المحدد"، أو ترجم الصفحة كلها.':'Traduzione automatica gratuita. I termini scientifici e medici appaiono accanto al testo originale per il controllo. Seleziona una parte del testo e tocca "Traduci selezione", oppure traduci tutta la pagina.',
'النص اللي في الصندوق ده بيتبعت لخدمة Google Translate (أو MyMemory لو اخترتها) عشان يتترجم. باقي الملف مابيتبعتش. متضغطش "ترجم" لو النص حساس.':'Il testo in questo riquadro viene inviato a Google Translate (o MyMemory se lo scegli) per essere tradotto. Il resto del file non viene mai inviato. Non toccare "Traduci" se il testo è sensibile.',
'ℹ️ النص اللي في الصندوق بيتبعت لخدمة ترجمة خارجية.':'ℹ️ Il testo nel riquadro viene inviato a un servizio di traduzione esterno.',
'لما تضغط "افتح ChatGPT" النص اللي في الصندوق بيتبعت لـ ChatGPT (OpenAI) في تبويب جديد، وهو خدمة خارجية ممكن تطلب تسجيل دخول. باقي الملف مابيتبعتش. متضغطش لو النص حساس.':'Quando tocchi "Apri ChatGPT" il testo nel riquadro viene inviato a ChatGPT (OpenAI) in una nuova scheda, un servizio esterno che può richiedere l\'accesso. Il resto del file non viene mai inviato. Non toccarlo se il testo è sensibile.',
'ℹ️ النص اللي في الصندوق بيتبعت لـ ChatGPT.':'ℹ️ Il testo nel riquadro viene inviato a ChatGPT.',
'مفيش نص في الصفحة دي (ممكن تكون صورة). اكتب أو الصق النص هنا.':'Nessun testo in questa pagina (potrebbe essere un\'immagine). Scrivi o incolla il testo qui.',
'مفيش نص للترجمة':'Nessun testo da tradurre','ترجم المحدد':'Traduci selezione','ترجم النص كله':'Traduci tutto',
'المحرك: Google':'Motore: Google','المحرك: MyMemory (فيه ذاكرة ترجمة طبية)':'Motore: MyMemory (con memoria di traduzione medica)',
'💬 اسألني':'💬 Chiedimi','🐢 نطق بطيء':'🐢 Lettura lenta','اتنسخ ✓':'Copiato ✓',
'النسخ مش متاح هنا، استخدم زرار نسخ الأندرويد':'Copia non disponibile qui, usa il pulsante copia di Android','النسخ مش متاح هنا':'Copia non disponibile qui',
'رجوع للـPDF كله':'Torna al PDF intero','✥ اسحب':'✥ Trascina','أصغر':'Più piccolo','أكبر':'Più grande','⌨️ كيبورد':'⌨️ Tastiera','✍️ بإيدك':'✍️ A mano',
'🃏 فلاش كاردز من الهايلايتس':'🃏 Flashcard dalle evidenziazioni',
'مفيش كروت لسه. اختار قلم الهايلايت 🖍️ وظلّل على كلام مهم في الصفحة، وبعدين ارجع هنا.':'Ancora nessuna scheda. Prendi la penna evidenziatore 🖍️ e segna il testo importante sulla pagina, poi torna qui.',
'خلصت كل الكروت المستحقة 🎉':'Tutte le schede dovute completate 🎉','اظهر الإجابة':'Mostra risposta',
'😣 لسه مش حافظها':'😣 Non ancora imparata','🙂 تمام':'🙂 Ok','😎 سهلة':'😎 Facile','بجهّز الكروت...':'Preparazione schede...',
'🔗 افتح ChatGPT':'🔗 Apri ChatGPT','📋 انسخ النص والتعليمات':'📋 Copia testo e istruzioni',
'لو التبويب ماتفتحش: انسخ النص وافتح ChatGPT وألصقه بنفسك. الحد الأقصى 1500 حرف.':'Se la scheda non si apre: copia il testo, apri ChatGPT e incollalo tu. Massimo 1500 caratteri.',
'ملء الشاشة ✓':'Schermo intero ✓','المتصفح مانعها هنا. اسحب الصفحة لفوق بإيدك عشان الهيدر يختفي':'Il browser lo blocca qui. Trascina tu la pagina verso l\'alto per nascondere la barra',
'اشرح بالعربي':'Spiega','لخّص':'Riassumi','أسئلة امتحان':'Domande d\'esame',
'الملف جاهز ✅':'File pronto ✅',
'لو التحميل ما بدأش دوس الزرار. بعد التحميل ارجع لصفحة المذاكرة.':'Se il download non è partito, tocca il pulsante. Dopo il download torna alla pagina di studio.',
'وضع صفحة صفحة: شغال':'Modalità pagina singola: attiva','وضع صفحة صفحة: واقف':'Modalità pagina singola: disattiva',
'جاهز ✓ اختار ملف.':'Pronto ✓ scegli un file.','مفيش ملف اتشارك.':'Nessun file condiviso.','غير معروف':'sconosciuto'});
/* v7 text tool + install */
Object.assign(EN,{"ثبّت التطبيق":"Install app","التطبيق متثبّت خلاص ✓":"The app is already installed ✓","اتثبّت ✓ دور عليه في قائمة البرامج":"Installed ✓ look for it in your apps list","تقدر تثبّته من قائمة المتصفح":"You can install it from the browser menu","ثبّت التطبيق على جهازك":"Install the app on your device","على الكمبيوتر (Chrome أو Edge): دوس أيقونة التثبيت (⊕) في شريط العنوان، أو من القائمة ⋮ ← «تثبيت التطبيق». على الأندرويد: من القائمة ⋮ ← «إضافة إلى الشاشة الرئيسية».":"On a computer (Chrome or Edge): tap the install icon (⊕) in the address bar, or open the ⋮ menu and choose \"Install app\". On Android: ⋮ menu, then \"Add to Home screen\".","اكتب النص، وبعدين اضغط عليه تاني عشان تحركه أو تعدله":"Type the text, then tap it again to move or edit it","عدّل النص، وبعدين اضغط برّه":"Edit the text, then tap outside","تصغير الخط":"Smaller text","تكبير الخط":"Bigger text","عريض":"Bold","تعديل النص":"Edit text","تكرار":"Duplicate","حذف":"Delete","تم":"Done","لون":"Color"});
Object.assign(FR,{"ثبّت التطبيق":"Installer l'app","التطبيق متثبّت خلاص ✓":"L'app est déjà installée ✓","اتثبّت ✓ دور عليه في قائمة البرامج":"Installée ✓ cherche-la dans tes applications","تقدر تثبّته من قائمة المتصفح":"Tu peux l'installer depuis le menu du navigateur","ثبّت التطبيق على جهازك":"Installer l'app sur ton appareil","على الكمبيوتر (Chrome أو Edge): دوس أيقونة التثبيت (⊕) في شريط العنوان، أو من القائمة ⋮ ← «تثبيت التطبيق». على الأندرويد: من القائمة ⋮ ← «إضافة إلى الشاشة الرئيسية».":"Sur ordinateur (Chrome ou Edge) : touche l'icône d'installation (⊕) dans la barre d'adresse, ou ouvre le menu ⋮ puis « Installer l'application ». Sur Android : menu ⋮ puis « Ajouter à l'écran d'accueil ».","اكتب النص، وبعدين اضغط عليه تاني عشان تحركه أو تعدله":"Tape le texte, puis touche-le à nouveau pour le déplacer ou le modifier","عدّل النص، وبعدين اضغط برّه":"Modifie le texte, puis touche à l'extérieur","تصغير الخط":"Texte plus petit","تكبير الخط":"Texte plus grand","عريض":"Gras","تعديل النص":"Modifier le texte","تكرار":"Dupliquer","حذف":"Supprimer","تم":"Terminé","لون":"Couleur"});
Object.assign(ES,{"ثبّت التطبيق":"Instalar app","التطبيق متثبّت خلاص ✓":"La app ya está instalada ✓","اتثبّت ✓ دور عليه في قائمة البرامج":"Instalada ✓ búscala en tus aplicaciones","تقدر تثبّته من قائمة المتصفح":"Puedes instalarla desde el menú del navegador","ثبّت التطبيق على جهازك":"Instala la app en tu dispositivo","على الكمبيوتر (Chrome أو Edge): دوس أيقونة التثبيت (⊕) في شريط العنوان، أو من القائمة ⋮ ← «تثبيت التطبيق». على الأندرويد: من القائمة ⋮ ← «إضافة إلى الشاشة الرئيسية».":"En computadora (Chrome o Edge): toca el icono de instalar (⊕) en la barra de direcciones, o abre el menú ⋮ y elige \"Instalar aplicación\". En Android: menú ⋮ y luego \"Añadir a pantalla de inicio\".","اكتب النص، وبعدين اضغط عليه تاني عشان تحركه أو تعدله":"Escribe el texto y luego tócalo otra vez para moverlo o editarlo","عدّل النص، وبعدين اضغط برّه":"Edita el texto y luego toca fuera","تصغير الخط":"Texto más pequeño","تكبير الخط":"Texto más grande","عريض":"Negrita","تعديل النص":"Editar texto","تكرار":"Duplicar","حذف":"Eliminar","تم":"Listo","لون":"Color"});
Object.assign(DE,{"ثبّت التطبيق":"App installieren","التطبيق متثبّت خلاص ✓":"Die App ist schon installiert ✓","اتثبّت ✓ دور عليه في قائمة البرامج":"Installiert ✓ suche sie in deiner App-Liste","تقدر تثبّته من قائمة المتصفح":"Du kannst sie über das Browsermenü installieren","ثبّت التطبيق على جهازك":"Installiere die App auf deinem Gerät","على الكمبيوتر (Chrome أو Edge): دوس أيقونة التثبيت (⊕) في شريط العنوان، أو من القائمة ⋮ ← «تثبيت التطبيق». على الأندرويد: من القائمة ⋮ ← «إضافة إلى الشاشة الرئيسية».":"Am Computer (Chrome oder Edge): klicke auf das Installationssymbol (⊕) in der Adressleiste oder öffne das ⋮-Menü und wähle „App installieren“. Auf Android: ⋮-Menü, dann „Zum Startbildschirm hinzufügen“.","اكتب النص، وبعدين اضغط عليه تاني عشان تحركه أو تعدله":"Schreibe den Text und tippe ihn danach erneut an, um ihn zu verschieben oder zu ändern","عدّل النص، وبعدين اضغط برّه":"Ändere den Text und tippe dann daneben","تصغير الخط":"Kleinerer Text","تكبير الخط":"Größerer Text","عريض":"Fett","تعديل النص":"Text ändern","تكرار":"Duplizieren","حذف":"Löschen","تم":"Fertig","لون":"Farbe"});
Object.assign(IT,{"ثبّت التطبيق":"Installa l'app","التطبيق متثبّت خلاص ✓":"L'app è già installata ✓","اتثبّت ✓ دور عليه في قائمة البرامج":"Installata ✓ cercala tra le app","تقدر تثبّته من قائمة المتصفح":"Puoi installarla dal menu del browser","ثبّت التطبيق على جهازك":"Installa l'app sul tuo dispositivo","على الكمبيوتر (Chrome أو Edge): دوس أيقونة التثبيت (⊕) في شريط العنوان، أو من القائمة ⋮ ← «تثبيت التطبيق». على الأندرويد: من القائمة ⋮ ← «إضافة إلى الشاشة الرئيسية».":"Su computer (Chrome o Edge): tocca l'icona di installazione (⊕) nella barra degli indirizzi, oppure apri il menu ⋮ e scegli \"Installa app\". Su Android: menu ⋮ poi \"Aggiungi alla schermata Home\".","اكتب النص، وبعدين اضغط عليه تاني عشان تحركه أو تعدله":"Scrivi il testo, poi toccalo di nuovo per spostarlo o modificarlo","عدّل النص، وبعدين اضغط برّه":"Modifica il testo, poi tocca fuori","تصغير الخط":"Testo più piccolo","تكبير الخط":"Testo più grande","عريض":"Grassetto","تعديل النص":"Modifica testo","تكرار":"Duplica","حذف":"Elimina","تم":"Fatto","لون":"Colore"});
/* v8: selection explain */
Object.assign(EN,{"📖 شرح":"📖 Explain","اتنسخ، والصقه في شات المساعد وابعته":"Copied. Paste it into the assistant chat and send it"});
Object.assign(FR,{"📖 شرح":"📖 Expliquer","اتنسخ، والصقه في شات المساعد وابعته":"Copié. Colle-le dans le chat de l'assistant et envoie-le"});
Object.assign(ES,{"📖 شرح":"📖 Explicar","اتنسخ، والصقه في شات المساعد وابعته":"Copiado. Pégalo en el chat del asistente y envíalo"});
Object.assign(DE,{"📖 شرح":"📖 Erklären","اتنسخ، والصقه في شات المساعد وابعته":"Kopiert. Füge es im Assistenten-Chat ein und sende es"});
Object.assign(IT,{"📖 شرح":"📖 Spiega","اتنسخ، والصقه في شات المساعد وابعته":"Copiato. Incollalo nella chat dell'assistente e invialo"});
/* v10: text tool label */
Object.assign(EN,{"كتابة":"Writing"});
Object.assign(FR,{"كتابة":"Écrire"});
Object.assign(ES,{"كتابة":"Escribir"});
Object.assign(DE,{"كتابة":"Schreiben"});
Object.assign(IT,{"كتابة":"Scrivere"});
})();
