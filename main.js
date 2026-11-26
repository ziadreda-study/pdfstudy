import * as pdfjsMod from './pdfjs.js';
import * as workerMod from './worker.js';
import * as pdflibMod from './pdflib.js';
import start from './app.js';
window.__OCR = true;
const wrap = document.getElementById('wrap');
const shell = document.createElement('div');
shell.id = 'shell';
shell.style.cssText = 'position:relative;width:100%;height:100%;display:flex;flex-direction:column';
wrap.parentNode.insertBefore(shell, wrap);
shell.appendChild(wrap);
shell.appendChild(document.getElementById('toast'));
const status = document.createElement('div');
status.id = 'status';
status.style.cssText = 'background:#111;color:#9f9;font:14px/1.5 sans-serif;padding:6px 10px;direction:rtl;white-space:pre-wrap;word-break:break-word;flex:0 0 auto';
status.textContent = '';status.style.display = 'none';
shell.insertBefore(status, wrap);
const size = () => {
    const land = window.innerWidth > window.innerHeight;
    wrap.classList.toggle('land', land);
    document.body.classList.toggle('land', land);
    wrap.style.height = Math.max(200, window.innerHeight - status.offsetHeight) + 'px';
};
document.getElementById('root').style.cssText = 'height:100%';
size();
addEventListener('resize', size);
addEventListener('orientationchange', () => setTimeout(size, 300));
const setStatus = (m, bad) => { status.textContent = m; status.style.color = bad ? '#ff8a8a' : '#9f9'; status.style.display = bad ? '' : 'none'; size(); };
window.__setStatus = setStatus;
addEventListener('error', (e) => setStatus('خطأ في الصفحة: ' + e.message, true));
addEventListener('unhandledrejection', (e) => setStatus('خطأ: ' + ((e.reason && (e.reason.message || e.reason)) || 'غير معروف'), true));
let ok = true;
try {
    const g = window;
    const pick = (m, k) => (m.default && m.default[k] ? m.default : (m[k] ? m : null));
    g.pdfjsLib = g.pdfjsLib || pick(pdfjsMod, 'getDocument');
    g.pdfjsWorker = g.pdfjsWorker || pick(workerMod, 'WorkerMessageHandler');
    g.PDFLib = g.PDFLib || pick(pdflibMod, 'PDFDocument');
    const miss = ['pdfjsLib', 'pdfjsWorker', 'PDFLib'].filter((k) => !g[k]);
    if (miss.length) throw new Error('مكتبات ناقصة: ' + miss.join(', '));
    start();
} catch (e) { ok = false; setStatus('فشل التشغيل: ' + String(e), true); }
if (ok) setStatus('جاهز ✓ اختار ملف.');
if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => {});

if (window.innerWidth >= 900) setTimeout(() => { const d = document.getElementById('dock'); if (d && !d.classList.contains('open')) document.getElementById('drawerBtn').click(); }, 400);

(async () => {
    if (!/[?&]shared=1/.test(location.search)) return;
    try {
        const c = await caches.open('share-inbox');
        const reqs = await c.keys();
        if (!reqs.length) { setStatus('مفيش ملف اتشارك.', true); return; }
        const dt = new DataTransfer();
        for (const r of reqs.slice(0, 1)) {
            const res = await c.match(r);
            const blob = await res.blob();
            dt.items.add(new File([blob], decodeURIComponent(res.headers.get('x-name') || 'shared'), { type: blob.type }));
            await c.delete(r);
        }
        history.replaceState(null, '', location.pathname);
        const ev = new Event('drop', { bubbles: true, cancelable: true });
        ev.dataTransfer = dt;
        document.dispatchEvent(ev);
        if (reqs.length > 1) setTimeout(() => { const t = document.getElementById('toast'); if (t) { t.textContent = 'اتفتح أول ملف بس من ' + reqs.length; t.style.display = 'block'; } }, 800);
    } catch (e) { setStatus('فشل فتح الملف المشارك: ' + e, true); }
})();
