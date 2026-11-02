// Замок «хук = одно предложение» (закон хука №5; standards/museum-core/06-acceptance.md: ноль совпадений
// `[.!?]\s+[А-ЯЁ]`). Хук — одна фраза, 80–130 знаков, потолок 200. Брак 29.10.2026 (Р492): хук 31 янв. (гиротрон)
// из двух предложений дошёл до живого сайта — проверки не было.
// Проверяются все дни всех музеев: src/content/days/*/*.json (поле hook), src/content/dni-shablon/*/*.yaml
// (lead.hook), src/data/full-pages/*/*.html (элемент class="hook").
// Не вторая фраза: точка/знак внутри «…» (цитата), инициалы («А. К. Толстой»), сокращения («1812 г. Наполеон»).
// Нарушение — код 1 и ::error:: по-русски: файл, хук. Откат — удалить вызов из package.json (build).
// Запуск: node scripts/hook-odno.mjs [--proba]
//
// Режим --vezde (r604; поправка №2 r603: «одна карточка — источник для всех площадок», NPR/Smithsonian):
// хук карточки src/content/dni-shablon/<музей>/ММ-ДД.yaml (lead.hook) дословно совпадает в каждом носителе:
//   страница — <p class="hook"> дня; календарь — поле d в kalendar-dney.js; витрина — /segodnya/ММ-ДД/
//   (если музей там стоит); пост — хук, который берёт scripts/kanaly/post.py (collect); аудиогид — текст гида
//   (audioguide.transcript карточки и rc-rolik/audiogid/ММ-ДД.yaml); ролик — надпись сегмента hook в
//   rc-rolik/days/<ДДмес>.json. Страница/календарь/витрина — из --dist <папка> или с живого --sait <адрес>,
//   без них — из src/content/days (источник календаря, витрины и поста). Сравнение — после снятия тегов,
//   сущностей, знака ударения и лишних пробелов.
// Нынешний текст хука появился (git log -S: карточка, days/*.json, полная страница) позже коммита mp4 ролика / mp3 гида —
// строка «пересобрать».
// Пока ВЫКЛЮЧЕН как замок: только отчёт (::warning::), код 0; --strogo — код 1 при расхождении.
//   node scripts/hook-odno.mjs --vezde [--muzei izobreteniya] [--mesyac 01] [--dist dist | --sait https://…]
//                                      [--rolik <папка rc-rolik> | --bez-seti] [--strogo]
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const SOKR = /^(г|гг|в|вв|ст|им|св|т|тыс|млн|млрд|руб|н|э|пр|ул|см|др|акад|проф)$/i;
const decode = (t) => t.replace(/&nbsp;|&#160;/g, ' ').replace(/&laquo;/g, '«').replace(/&raquo;/g, '»')
  .replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n));
const strip = (t) => decode(t.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();

// Вторая фраза: [.!?…] + пробел + заглавная, вне кавычек «…», не после инициала и не после сокращения.
export function vtorayaFraza(hook) {
  let t = hook;
  for (let prev; prev !== t;) { prev = t; t = t.replace(/«[^«»]*»/g, '«»'); }
  const re = /(\S*)[.!?…]\s+(?=[А-ЯЁ])/g;
  for (let m; (m = re.exec(t));) {
    const w = m[1].replace(/^[(«"„]+/, '');
    if (/^[А-ЯЁA-Z]$/.test(w) || /^([А-ЯЁ]\.)+[А-ЯЁ]$/.test(w) || SOKR.test(w)) continue;
    return t.slice(m.index, m.index + m[0].length + 1);
  }
  return null;
}

if (process.argv.includes('--proba')) {
  const proba = [
    ['Горьковские физики первыми в мире построили гиротрон: 6 ватт, а через девять лет — мегаватт.', false],
    ['Гиротрон построили в Горьком. Его лучом греют плазму.', true],
    ['Он воскресил Ивана Грозного — А. К. Толстой вернул Руси её живую историю.', false],
    ['«Буря! Скоро грянет буря!» — Горький написал песню о птице.', false],
    ['«Вы стоите? Я один пойду!» — повёл полк и не вернулся', false],
    ['Шарик стал Шариковым! Булгаков написал гротеск.', true],
    ['В 1812 г. Наполеон вошёл в Москву.', false],
  ];
  let bad = 0;
  for (const [h, zhdem] of proba) if (!!vtorayaFraza(h) !== zhdem) { bad++; console.log(`проба ✗ ждали ${zhdem}: ${h}`); }
  console.log(`hook-odno --proba: ${proba.length - bad} из ${proba.length}`);
  process.exit(bad ? 1 : 0);
}

const root = process.cwd();
const papki = (d) => (fs.existsSync(d) ? fs.readdirSync(d).filter((m) => fs.statSync(path.join(d, m)).isDirectory()) : []);
if (process.argv.includes('--vezde')) process.exit(await vezde());

async function vezde() {
  const { parse } = await import('yaml');
  const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : undefined; };
  const est = (k) => process.argv.includes(k);
  const ROLIK_RAW = 'https://raw.githubusercontent.com/arabelthera-dot/rc-rolik/main/';
  const MES = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  const norm = (t) => strip(String(t ?? '')).replace(/́/g, '').replace(/[­​]/g, '').replace(/\s+/g, ' ').trim();
  const sait = arg('--sait')?.replace(/\/$/, ''), dist = arg('--dist'), rolikDir = arg('--rolik'), bezSeti = est('--bez-seti');
  const nuzhnyMuzei = arg('--muzei')?.split(','), mesyac = arg('--mesyac');

  const kesh = new Map();
  // Файл носителя: dist/<путь> или живой сайт; null — нет.
  const vyvod = async (put) => {
    if (kesh.has(put)) return kesh.get(put);
    let t = null;
    if (dist) { const f = path.join(dist, put.endsWith('/') ? `${put}index.html` : put); if (fs.existsSync(f)) t = fs.readFileSync(f, 'utf8'); }
    else if (sait) try { const r = await fetch(sait + '/' + put); if (r.ok) t = await r.text(); } catch { /* сеть */ }
    kesh.set(put, t);
    return t;
  };
  const rolik = async (put) => {
    if (rolikDir) { const f = path.join(rolikDir, put); return fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : null; }
    if (bezSeti) return undefined;
    if (kesh.has('rolik:' + put)) return kesh.get('rolik:' + put);
    let t = null;
    try { const r = await fetch(ROLIK_RAW + put); if (r.ok) t = await r.text(); } catch { t = undefined; }
    kesh.set('rolik:' + put, t);
    return t;
  };
  const gitData = (args, f) => { try { return execFileSync('git', ['log', '-1', '--format=%cI', ...args, '--', f], { encoding: 'utf8' }).trim() || null; } catch { return null; } };

  const dirS = path.join(root, 'src/content/dni-shablon');
  const kartochki = papki(dirS).filter((m) => !nuzhnyMuzei || nuzhnyMuzei.includes(m)).flatMap((m) => fs.readdirSync(path.join(dirS, m))
    .filter((f) => f.endsWith('.yaml') && (!mesyac || f.startsWith(mesyac + '-'))).sort().map((f) => ({ m, key: f.slice(0, 5), f: `src/content/dni-shablon/${m}/${f}` })));

  // Пост: те же записи, что берёт автопост (scripts/kanaly/post.py collect), одним вызовом на все дни.
  let post = null;
  try {
    const keys = [...new Set(kartochki.map((k) => k.key))];
    post = JSON.parse(execFileSync('python3', ['-c', `import sys,json; sys.path.insert(0,'scripts/kanaly'); import post
print(json.dumps({k: {x['slug']: x['hook'] for x in post.collect(k)} for k in json.loads(sys.argv[1])}, ensure_ascii=False))`, JSON.stringify(keys)],
    { encoding: 'utf8', cwd: root, stdio: ['ignore', 'pipe', 'ignore'] }));
  } catch { /* нет python3 — пост не проверен */ }

  const NOS = ['страница', 'календарь', 'витрина', 'пост', 'аудиогид', 'ролик'];
  let sovpalo = 0, vsego = 0;
  const rashozhdeniya = [], pereseobrat = [], neProvereno = {};
  const ne = (n, why) => { (neProvereno[n] ??= []).push(why); };
  for (const k of kartochki) {
    const d = parse(fs.readFileSync(path.join(root, k.f), 'utf8'));
    const hook = norm(d?.lead?.hook);
    if (!hook) continue;
    const dayJ = path.join(root, 'src/content/days', k.m, `${k.key}.json`);
    const day = fs.existsSync(dayJ) ? JSON.parse(fs.readFileSync(dayJ, 'utf8')) : {};
    const res = {}; // носитель → [найденный текст | null] ; undefined — не проверен

    // страница
    const str = await vyvod(`muzei/${k.m}/den/${k.key}/`);
    if (str != null) res['страница'] = [norm(str.match(/<p class="hook">([\s\S]*?)<\/p>/)?.[1]) || null];
    else if (dist || sait) res['страница'] = [null];
    else ne('страница', `${k.key}: без --dist/--sait`);
    // календарь
    const kal = await vyvod(`muzei/${k.m}/kalendar-dney.js`);
    if (kal != null) {
      let cal = {}; try { cal = JSON.parse(kal.replace(/^[^{]*/, '').replace(/;?\s*$/, '')); } catch { /* не разобрался */ }
      res['календарь'] = [norm(cal[k.key]?.d) || null];
    } else res['календарь'] = [norm(day.hook) || null];
    // витрина «Сегодня»: музей на странице дня /segodnya/ — его хук там дословно
    const seg = await vyvod(`segodnya/${k.key}/`);
    if (seg != null) {
      if (seg.includes(`/muzei/${k.m}/den/${k.key}/`)) res['витрина'] = [norm(seg).includes(hook) ? hook : 'хука музея нет на странице'];
      else ne('витрина', `${k.key}: музея нет на /segodnya/${k.key}/`);
    } else res['витрина'] = [norm(day.hook) || null];
    // пост
    if (!post) ne('пост', `${k.key}: python3 недоступен`);
    else if (post[k.key]?.[k.m] == null) ne('пост', `${k.key}: день не идёт в автопост`);
    else res['пост'] = [norm(post[k.key][k.m])];
    // аудиогид: текст на странице и текст озвучки (rc-rolik/audiogid), если он есть
    const ag = d.audioguide;
    if (ag?.transcript?.length) {
      const teksty = [['карточка', ag.transcript]];
      const ra = await rolik(`audiogid/${k.key}.yaml`);
      if (ra) teksty.push(['rc-rolik/audiogid', parse(ra)?.transcript ?? []]);
      const net = teksty.filter(([, t]) => !norm([].concat(t).join(' ')).includes(hook)).map(([g]) => g);
      res['аудиогид'] = [net.length ? `хука нет в тексте гида (${net.join(', ')})` : hook];
    } else ne('аудиогид', `${k.key}: гида нет`);
    // ролик: надпись сегмента hook
    const id = d.video?.klyuch?.match(/\/(\d\d[a-z]{3})/)?.[1] ?? `${k.key.slice(3)}${MES[+k.key.slice(0, 2) - 1]}`;
    if (d.video) {
      const r = await rolik(`days/${id}.json`);
      if (r === undefined) ne('ролик', `${k.key}: без сети и --rolik`);
      else if (r === null) res['ролик'] = [`нет rc-rolik/days/${id}.json`];
      else { const seg = JSON.parse(r).segments?.find((s) => s.id === 'hook'); res['ролик'] = [norm(seg?.show) || 'нет сегмента hook']; }
    } else ne('ролик', `${k.key}: ролика нет`);

    for (const n of NOS) {
      if (!res[n]) continue;
      vsego++;
      if (res[n][0] === hook) sovpalo++;
      else rashozhdeniya.push({ key: k.key, m: k.m, f: k.f, n, bylo: res[n][0], hook });
    }
    // пересобрать: хук изменён позже файла ролика/гида
    // дата нынешнего текста хука — первый коммит, где он появился (карточка, days/*.json, полная страница до переноса)
    let hd = null;
    try {
      hd = execFileSync('git', ['log', '--format=%cI', '-S', d.lead.hook, '--', k.f, `src/content/days/${k.m}/${k.key}.json`,
        `src/data/full-pages/${k.m}/${k.key}.html`], { encoding: 'utf8' }).trim().split('\n').pop() || null;
    } catch { /* нет git */ }
    hd ??= gitData(['-G', '^  hook: '], k.f);
    const fajly = [['ролик', d.video?.mp4], ['аудиогид', ag?.audioSrc]];
    for (const [n, src] of fajly) {
      if (!src || !hd) continue;
      const fd = gitData([], `public/muzei/${k.m}/${src.replace(/[?#].*$/, '')}`);
      if (fd && new Date(hd) > new Date(fd)) pereseobrat.push({ key: k.key, m: k.m, n, hd, fd, src });
    }
  }

  const ist = dist ? `dist ${dist}` : sait ? sait : 'src/content/days';
  console.log(`hook-odno --vezde: карточек ${kartochki.length}; страница/календарь/витрина — ${ist}; совпало ${sovpalo} из ${vsego} носителей`);
  for (const r of rashozhdeniya) console.log(`::warning file=${r.f}::${r.key} ${r.m} · ${r.n}: «${r.bylo ?? '— пусто —'}» ≠ карточка «${r.hook}»`);
  for (const p of pereseobrat) console.log(`::warning file=src/content/dni-shablon/${p.m}/${p.key}.yaml::${p.key} ${p.m} · пересобрать ${p.n}: нынешний хук с ${p.hd.slice(0, 10)}, ${p.src} — ${p.fd.slice(0, 10)}`);
  for (const [n, v] of Object.entries(neProvereno)) console.log(`не проверен ${n}: ${v.length} (${v.slice(0, 3).join('; ')}${v.length > 3 ? '; …' : ''})`);
  if (est('--json')) fs.writeFileSync(arg('--json'), JSON.stringify({ sovpalo, vsego, rashozhdeniya, pereseobrat, neProvereno }, null, 1));
  return est('--strogo') && (rashozhdeniya.length || pereseobrat.length) ? 1 : 0;
}

const hooks = [];
const days = path.join(root, 'src/content/days');
for (const m of papki(days)) for (const f of fs.readdirSync(path.join(days, m)).filter((f) => f.endsWith('.json'))) {
  const j = JSON.parse(fs.readFileSync(path.join(days, m, f), 'utf8'));
  if (j.hook) hooks.push([`src/content/days/${m}/${f}`, j.hook]);
}
const shablon = path.join(root, 'src/content/dni-shablon');
for (const m of papki(shablon)) for (const f of fs.readdirSync(path.join(shablon, m)).filter((f) => f.endsWith('.yaml'))) {
  const s = fs.readFileSync(path.join(shablon, m, f), 'utf8');
  const lead = s.match(/^lead:\n((?:[ \t]+.*\n?)*)/m)?.[1] ?? '';
  const v = lead.match(/^  hook: (.*)$/m)?.[1]?.trim();
  if (!v) continue;
  const hook = /^'.*'$/.test(v) ? v.slice(1, -1).replace(/''/g, "'") : /^".*"$/.test(v) ? JSON.parse(v) : v;
  hooks.push([`src/content/dni-shablon/${m}/${f}`, hook]);
}
const full = path.join(root, 'src/data/full-pages');
for (const m of papki(full)) for (const f of fs.readdirSync(path.join(full, m)).filter((f) => f.endsWith('.html'))) {
  const h = fs.readFileSync(path.join(full, m, f), 'utf8').match(/<(\w+)[^>]*class="hook"[^>]*>([\s\S]*?)<\/\1>/)?.[2];
  if (h) hooks.push([`src/data/full-pages/${m}/${f}`, strip(h)]);
}

let krasnyh = 0;
for (const [f, h] of hooks) {
  const v = vtorayaFraza(h);
  if (v) { krasnyh++; console.log(`::error file=${f}::хук из двух предложений (закон хука №5: одно предложение), стык «${v}»: «${h}»`); }
}
console.log(`hook-odno: хуков ${hooks.length}, двухфразовых ${krasnyh}`);
process.exit(krasnyh ? 1 : 0);
