// AI explain proxy: keeps the provider key server-side.
// Configure with Netlify env vars: AI_KEY (required), AI_BASE, AI_MODEL.
const ALLOW = ['https://ziadreda-study.github.io', 'https://ziad-pdfstudy.netlify.app', 'http://127.0.0.1:8901', 'http://localhost:8901'];

const SYS = [
  'انت مساعد مذاكرة لطالب طب مصري (Ziad) بيفهم عربي مصري.',
  'هتوصلك "النص المحدد" اللي الطالب معلّم عليه، وكمان "سياق الصفحة" اللي حواليه.',
  'المطلوب: شرح للنص المحدد بالعربي المصري البسيط، دقيق ومطابق للمعنى العلمي، ومبني على فهم النص في سياقه.',
  'قواعد:',
  '1) افهم النص الأول من سياقه (مصطلح ناقص، اختصار، أو جملة مبتورة توضح من السياق). متشرحش كلمة لوحدها وتتجاهل الجملة.',
  '2) سيب أسماء الأدوية والبكتيريا والفيروسات والأمراض والمصطلحات العلمية والطبية بالإنجليزي زي ما هي (Penicillin, beta-lactam, gram-positive, MIC).',
  '3) اشرح ليه الكلام ده مهم وامتى يتقال، مش مجرد إعادة صياغة. لو النص فيه رقم أو نسبة، قول معناها.',
  '4) ماتألفش أي معلومة مش موجودة في النص أو سياقه. لو النص ناقص قول "النص مختصر كده".',
  '5) الطول: من 3 لـ 6 سطور قصيرة. كل نقطة في سطر، والنقاط كلها تبدا بـ "• ".',
  '6) مفيش مقدمات ولا "طبعاً" ولا "بالتأكيد". ادخل في الشرح مباشرة.',
  '7) نص عادي بس: ممنوع markdown أو نجوم ** أو عناوين # أو شرطات طويلة. النقاط تبدأ بـ "• " فقط.',
  '8) اكتب كل الكلمات بحروف عادية من غير أي علامات تشكيل أو أكسنت غريب.',
  'لو النص مش علمي (كلام عادي أو عنوان)، اشرحه بالعربي المصري البسيط بنفس الروح.'
].join('\n');

const cors = origin => {
  const h = { 'Content-Type': 'application/json; charset=utf-8', 'Vary': 'Origin' };
  if (ALLOW.indexOf(origin) >= 0) h['Access-Control-Allow-Origin'] = origin;
  return h;
};

exports.handler = async event => {
  const origin = event.headers.origin || event.headers.Origin || '';
  const h = cors(origin);
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: Object.assign({}, h, { 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Max-Age': '86400' }), body: '' };
  }
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: h, body: JSON.stringify({ error: 'method' }) };

  let text = '', context = '';
  try { const b = JSON.parse(event.body || '{}'); text = String(b.text || '').slice(0, 2500); context = String(b.context || '').slice(0, 2500); } catch (e) {}
  if (!text.trim()) return { statusCode: 400, headers: h, body: JSON.stringify({ error: 'no_text' }) };

  const key = process.env.AI_KEY || process.env.GROQ_API_KEY || process.env.OPENROUTER_API_KEY;
  if (!key) return { statusCode: 503, headers: h, body: JSON.stringify({ error: 'no_key' }) };
  const base = (process.env.AI_BASE || 'https://openrouter.ai/api/v1').replace(/\/$/, '');
  const models = (process.env.AI_MODEL || 'meta-llama/llama-3.3-70b-instruct:free').split(',').map(m => m.trim()).filter(Boolean);
  const user = 'النص المحدد:\n' + text + (context ? '\n\nسياق الصفحة (للتوضيح بس، متشرحوش كله):\n' + context : '');
  let lastErr = 'no_model';
  for (const model of models) {
    try {
      const r = await fetch(base + '/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json', 'HTTP-Referer': 'https://ziadreda-study.github.io', 'X-Title': 'Ziads PDF study app' },
        body: JSON.stringify({ model, temperature: 0.2, max_tokens: 700, messages: [{ role: 'system', content: SYS }, { role: 'user', content: user }] })
      });
      const raw = await r.text();
      let j = {};
      try { j = JSON.parse(raw); } catch (e) {}
      if (!r.ok) { lastErr = 'upstream_' + r.status + ':' + ((j.error && (j.error.message || j.error.code)) || raw.slice(0, 120)); continue; }
      const msg = j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content;
      if (!msg) { lastErr = 'empty'; continue; }
      return { statusCode: 200, headers: h, body: JSON.stringify({ explanation: String(msg).trim(), model }) };
    } catch (e) { lastErr = 'fetch_failed:' + String(e && e.message || e).slice(0, 120); }
  }
  return { statusCode: 502, headers: h, body: JSON.stringify({ error: 'upstream', detail: lastErr }) };
};
