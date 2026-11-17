#!/usr/bin/env node
// Отправка дня одной командой (Р784, мера 5): node tools/otpravka-dnya.mjs <музей> <ММ-ДД> [--proba].
// Собирает в одну команду шаги, которые помощники делали руками и забывали (knowledge/brak-stranic.md):
//   1) git fetch origin && git rebase origin/main — конфликт: стоп, решать по п. 8/21 (п. 8);
//   2) node tools/proverka-dnya.mjs <музей> <ММ-ДД> — есть ошибка: стоп (п. 16);
//   3) есть public/ — npm run build, по дню ни «нет пункта N», ни [ERROR]; лёгкая копия без public/ —
//      kartochkaUtv.safeParse по всем копиям утверждённого музея (п. 9, 11);
//   4) сценарий ролика days/<id>.json в rc-rolik — в main, в ветке открытой заявки или в ветке с днём в имени, иначе стоп (п. 31);
//   5) push ветки (--force-with-lease к прежней голове), заявка, если её нет; автослияние, если не включено (п. 35);
//   6) ролик render.yml с веткой rc-rolik, где лежит days/<id>.json, и vetka_sajta = ветка заявки (п. 13, 23);
//      аудиогид audiogid.yml с той же веткой сайта, если в очереди нет чужого ждущего (п. 7, 17);
//      имя прогона с тем же ключом, что считает avto.py rc-rolik, — avto.yml второй раз их не ставит (r763);
//      ролик НС — только при adres: den в yaml (кадры на месте), ключ без блока video: (Р790 п.5);
//   7) avto.yml rc-rolik по этому дню сразу (Р789): сигнал rolik-signal.yml не доходит (нет секрета ROLIK_SIGNAL),
//      а расписание «раз в 5 мин» GitHub пускает раз в 4–8 ч; avto.py доставит то, что шаг 6 не поставил;
//   8) итог: номер заявки и ссылки на прогоны. Прогоны не ждёт (Р686 п.3).
// День уже влит в main (шаги 1–6 не нужны): node tools/otpravka-dnya.mjs <музей> <ММ-ДД> --avto — только шаг 7.
// Новых проверок нет: только существующие шаги в правильном порядке (заморозка Р783).
// --proba — без rebase, push, заявки и запусков: шаги 2–4 выполняет, остальное печатает «сделал бы».
// Откат: удалить файл; шаги снова делаются руками по brak-stranic.md.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

const SITE = 'arabelthera-dot/rc-site';
const ROLIK = 'arabelthera-dot/rc-rolik';
const MES = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

const argi = process.argv.slice(2);
const PROBA = argi.includes('--proba');
const [muzei, key] = argi.filter((a) => !a.startsWith('--'));
if (!muzei || !/^\d\d-\d\d$/.test(key ?? '')) {
  console.error('запуск: node tools/otpravka-dnya.mjs <музей> <ММ-ДД> [--proba] [--avto]');
  process.exit(1);
}

const run = (cmd, args, opts = {}) => spawnSync(cmd, args, { encoding: 'utf8', maxBuffer: 1 << 28, ...opts });
const vyvod = (cmd, args) => { const r = run(cmd, args); return r.status === 0 ? r.stdout.trim() : null; };
const stop = (shag, tekst) => { console.error(`\n✗ СТОП на шаге ${shag}: ${tekst}`); process.exit(1); };
const shag = (n, tekst) => console.log(`\n— ${n}. ${tekst}`);
const proba = (komanda) => console.log(`  [проба] сделал бы: ${komanda}`);
// 7. avto.yml rc-rolik по дню (Р789): ключ помощника пускает workflow_dispatch, секрет не нужен
const avto = () => {
  const komanda = ['workflow', 'run', 'avto.yml', '-R', ROLIK, '-f', `dni=${muzei}/${key}`];
  if (PROBA) { proba(`gh ${komanda.join(' ')}`); return; }
  const r = run('gh', komanda);
  if (r.status !== 0) console.error(`  ✗ gh ${komanda.join(' ')}: ${r.stderr.trim()}`);
  else console.log(`  ✓ avto.yml запущен по ${muzei}/${key}: gh run list -R ${ROLIK} --workflow avto.yml --event workflow_dispatch`);
};
if (argi.includes('--avto')) { shag(7, `avto.yml rc-rolik по ${muzei}/${key} (день уже в main)`); avto(); process.exit(0); }

const vetka = vyvod('git', ['rev-parse', '--abbrev-ref', 'HEAD']);
if (!vetka || vetka === 'HEAD') stop(0, 'не на ветке (detached HEAD) — перейди в ветку дня');
if (vetka === 'main') stop(0, 'ветка main: прямой push в main запрещён — отправляй из своей ветки');
console.log(`отправка ${muzei}/${key}, ветка ${vetka}${PROBA ? ' — ПРОБА, без push и запусков' : ''}`);

// 1. rebase на свежий main (п. 8)
shag(1, 'git fetch origin && git rebase origin/main');
if (run('git', ['fetch', 'origin'], { stdio: 'inherit' }).status !== 0) stop(1, 'git fetch origin не прошёл');
const pozadi = vyvod('git', ['rev-list', '--count', 'HEAD..origin/main']);
if (PROBA) proba(`git rebase origin/main (main впереди ветки на ${pozadi} коммитов)`);
else {
  const gryaz = vyvod('git', ['status', '--porcelain', '--untracked-files=no']);
  if (gryaz) stop(1, `в копии незакоммиченные правки — закоммить свои файлы поимённо (git commit -- <пути>):\n${gryaz}`);
  const r = run('git', ['rebase', 'origin/main']);
  if (r.status !== 0) {
    const konflikt = vyvod('git', ['diff', '--name-only', '--diff-filter=U']) || r.stderr.trim();
    stop(1, `конфликт rebase:\n${konflikt}\n`
      + 'Решить: общие файлы — сохранить строки обоих (п. 8); «DU src/data/slovar.json» — свои записи файлами '
      + 'src/data/slovar/<tip>--<slug>.json и git rm src/data/slovar.json (п. 21); затем git add <файлы> && '
      + 'git rebase --continue и снова node tools/otpravka-dnya.mjs ' + `${muzei} ${key}. Отказаться — git rebase --abort.`);
  }
  console.log(`  ✓ ветка на origin/main (было позади на ${pozadi})`);
}

// 2. проверка дня (п. 16)
shag(2, `node tools/proverka-dnya.mjs ${muzei} ${key}`);
if (run('node', ['tools/proverka-dnya.mjs', muzei, key], { stdio: 'inherit' }).status !== 0)
  stop(2, 'проверка дня красная — чинить до отправки (п. 16)');

// 3. сборка (п. 9) или, в лёгкой копии без public/, схема копий утверждённого музея (п. 11)
if (fs.existsSync('public/video/registry.json') && fs.existsSync('public/assets/rc-sitebar.css')) {
  shag(3, 'npm run build');
  const r = run('npm', ['run', 'build']);
  const stroki = `${r.stdout}\n${r.stderr}`.split('\n');
  const plohie = stroki.filter((s) => s.includes('[ERROR]')
    || (/нет пункта \d+/.test(s) && (s.includes(`${muzei}/${key}`) || s.includes(`${key}.yaml`) || s.includes(`${key}.json`))));
  if (r.status !== 0 || plohie.length)
    stop(3, `сборка: ${r.status !== 0 ? `код ${r.status}` : 'есть строки по дню'}\n${(plohie.length ? plohie : stroki.slice(-20)).join('\n')}`);
  console.log('  ✓ npm run build — по дню ни «нет пункта», ни [ERROR]');
} else {
  shag(3, `лёгкая копия без public/ — kartochkaUtv.safeParse по src/data/utverzhdeno/${muzei}/*.json (п. 11)`);
  const papka = path.join('src/data/utverzhdeno', muzei);
  const { kartochkaUtv } = await import('../src/lib/skhema-utverzhdeno.mjs');
  const fajly = fs.existsSync(papka) ? fs.readdirSync(papka).filter((f) => f.endsWith('.json')) : [];
  const oshibki = [];
  for (const f of fajly) {
    const r = kartochkaUtv.safeParse(JSON.parse(fs.readFileSync(path.join(papka, f), 'utf8')));
    if (!r.success) oshibki.push(`InvalidContentEntryDataError: utverzhdeno → ${muzei}/${f}\n`
      + r.error.issues.map((i) => `  ${i.path.join('.')}: ${i.message}`).join('\n'));
  }
  if (oshibki.length) stop(3, oshibki.join('\n'));
  console.log(`  ✓ копий утверждённого ${fajly.length}, ошибок 0; полная сборка — в заявке`);
}

// 4. сценарий ролика дня в rc-rolik (п. 31)
const [mm, dd] = key.split('-');
const id = (muzei === 'ne-sdayutsya' ? 'ns' : '') + dd + MES[Number(mm) - 1];
shag(4, `сценарий ролика days/${id}.json в ${ROLIK}`);
const dayFile = `days/${id}.json`;
const izRolika = (ref) => {
  const r = run('gh', ['api', '-H', 'Accept: application/vnd.github.raw', `repos/${ROLIK}/contents/${dayFile}?ref=${encodeURIComponent(ref)}`]);
  return r.status === 0 ? Buffer.from(r.stdout, 'utf8') : null;
};
let vetkaRolika = null;
let scenarij = izRolika('main');
if (scenarij) vetkaRolika = 'main';
else {
  const zayavki = JSON.parse(vyvod('gh', ['pr', 'list', '-R', ROLIK, '--state', 'open', '-L', '100', '--json', 'headRefName,files']) || '[]');
  const z = zayavki.find((p) => p.files.some((f) => f.path === dayFile));
  if (z && (scenarij = izRolika(z.headRefName))) vetkaRolika = z.headRefName;
  // нет заявки — ветки rc-rolik с днём в имени (r780-ns27feb, r780-izobreteniya-02-27), новее — раньше
  const vetki = (vyvod('gh', ['api', '--paginate', `repos/${ROLIK}/branches?per_page=100`, '--jq', '.[].name']) || '').split('\n')
    .filter((v) => v.includes(id) || v.includes(`${muzei}-${key}`)).sort().reverse();
  for (const v of vetki) {
    if (scenarij) break;
    if ((scenarij = izRolika(v))) vetkaRolika = v;
  }
}
if (!scenarij)
  stop(4, `в ${ROLIK} нет ${dayFile} ни в main, ни в ветке rc-rolik — ролик не выпустится (vypusk «нет ${dayFile}», п. 31).\n`
    + `Создать: в копии rc-rolik на своей ветке RC_SITE_REF=${vetka} node scripts/scenarij.mjs ${key}`
    + `${muzei === 'ne-sdayutsya' ? '' : ` --muzej=${muzei}`} (пишет ${dayFile} и kadry/${id}/), `
    + `scripts/day.sh ${id} A oba --proverit, коммит поимённо, заявка в rc-rolik — и снова эта команда.`);
const sajt = JSON.parse(scenarij.toString('utf8')).sajt ?? {};
const zadacha = `${id}:${sajt.variant ?? 'A'}`;
console.log(`  ✓ ${dayFile} есть в ${vetkaRolika === 'main' ? 'main' : `ветке ${vetkaRolika}`}`);

// 5. push, заявка, автослияние (п. 35)
shag(5, 'push ветки, заявка, автослияние');
const udalyonnaya = vyvod('git', ['rev-parse', '--verify', '-q', `refs/remotes/origin/${vetka}`]);
const push = udalyonnaya
  ? ['push', `--force-with-lease=${vetka}:${udalyonnaya}`, 'origin', vetka]
  : ['push', '-u', 'origin', vetka];
if (PROBA) proba(`git ${push.join(' ')}`);
else if (run('git', push, { stdio: 'inherit' }).status !== 0) stop(5, `git ${push.join(' ')} не прошёл — ветку двигал кто-то ещё: git fetch, сверить, снова эта команда`);
const najti = () => JSON.parse(vyvod('gh', ['pr', 'list', '-R', SITE, '--head', vetka, '--state', 'open', '--json', 'number,url,autoMergeRequest']) || '[]')[0];
let pr = najti();
if (!pr) {
  if (PROBA) proba(`gh pr create -R ${SITE} --base main --head ${vetka} --fill`);
  else {
    const r = run('gh', ['pr', 'create', '-R', SITE, '--base', 'main', '--head', vetka, '--fill']);
    if (r.status !== 0) stop(5, `gh pr create: ${r.stderr.trim()}`);
    pr = najti();
    if (!pr) stop(5, 'заявка создана, но не нашлась по ветке — gh pr list --head ' + vetka);
  }
}
if (pr) console.log(`  заявка №${pr.number} ${pr.url}`);
if (pr?.autoMergeRequest?.mergeMethod) console.log(`  ✓ автослияние уже включено: ${pr.autoMergeRequest.mergeMethod}`);
// Р798 п.3: день, отправленный помощником, до слияния читает второй помощник — автослияние включает Джарвис после чтения.
else if (process.env.RC_POMOSHCHNIK === '1') console.log(`  ⏸ автослияние не включено: заявку №${pr?.number} читает второй помощник (Р798 п.3)`);
else if (PROBA) proba(`gh pr merge ${pr?.number ?? '<N>'} --auto --squash -R ${SITE}`);
else {
  const r = run('gh', ['pr', 'merge', String(pr.number), '--auto', '--squash', '-R', SITE]);
  if (r.status !== 0) stop(5, `gh pr merge --auto: ${r.stderr.trim()}`);
  console.log(`  ✓ автослияние: ${najti()?.autoMergeRequest?.mergeMethod ?? '?'}`);
}

// 6. ролик и аудиогид в облако сразу после заявки (п. 7, 13, 17, 23)
shag(6, 'ролик и аудиогид в облако rc-rolik');
const sha10 = (b) => crypto.createHash('sha1').update(b).digest('hex').slice(0, 10);
const progony = (wf) => JSON.parse(vyvod('gh', ['run', 'list', '-R', ROLIK, '-w', wf, '-L', '200', '--json', 'databaseId,displayTitle,status,url']) || '[]');
const ssylki = [];
const zapusk = (wf, imya, args) => {
  const byl = progony(wf).find((p) => p.displayTitle.trim() === imya);
  if (byl) { console.log(`  ✓ ${imya} — уже есть прогон ${byl.url} (${byl.status}), второй не ставлю`); ssylki.push(byl.url); return; }
  const komanda = ['workflow', 'run', wf, '-R', ROLIK, ...args];
  if (PROBA) { proba(`gh ${komanda.join(' ')}`); return; }
  const r = run('gh', komanda);
  if (r.status !== 0) { console.error(`  ✗ gh ${komanda.join(' ')}: ${r.stderr.trim()}`); return; }
  // прогон появляется в списке не сразу — ссылка на последний с этим именем, если уже виден
  const nov = progony(wf).find((p) => p.displayTitle.trim() === imya);
  const url = nov?.url ?? `https://github.com/${ROLIK}/actions/workflows/${wf} (имя «${imya}»)`;
  console.log(`  ✓ запущен ${url}`);
  ssylki.push(url);
};
// ключ ролика — как kluch_ns / kluch в scripts/avto.py rc-rolik; у НС yaml без верхнего блока video: (Р790 п.5)
const chasti = [`src/content/days/${muzei}/${key}.json`, `src/content/dni-shablon/${muzei}/${key}.yaml`, `src/data/utverzhdeno/${muzei}/${key}.json`];
const bezVideo = (f, b) => (f.endsWith('.yaml') ? Buffer.from(b.toString('latin1').replace(/^video:.*\n(?:(?:[ \t-].*)?\n)*/gm, ''), 'latin1') : b);
const kluchRolika = muzei === 'ne-sdayutsya'
  ? sha10(Buffer.concat(chasti.filter((f) => fs.existsSync(f)).map((f) => Buffer.concat([Buffer.from(`${f}\0`), bezVideo(f, fs.readFileSync(f))]))))
  : sha10(scenarij);
// ролик НС ждёт кадры: только при adres: den — с ним сайт уже держит замок кадров дня (zamokObshchiy), как в avto.py (Р790 п.5)
if (muzei === 'ne-sdayutsya' && !/^adres:[ \t]*['"]?den['"]?[ \t]*$/m.test(fs.readFileSync(chasti[1], 'utf8')))
  console.log(`  ролик ждёт: в ${chasti[1]} нет adres: den — кадры не на месте; avto.py rc-rolik соберёт после adres: den`);
else {
  // workflow_dispatch берёт render.yml с той же ветки, что --ref: старая ветка сценария (r759, r760) без main —
  // без входа vetka_sajta, 422 (r807). Ветку догоняет main, как кнопка «Update branch» (POST /repos/{o}/{r}/merges).
  if (vetkaRolika !== 'main' && !PROBA) {
    const r = run('gh', ['api', '-X', 'POST', `repos/${ROLIK}/merges`, '-f', `base=${vetkaRolika}`, '-f', 'head=main',
      '-f', `commit_message=Merge main into ${vetkaRolika}: свежий render.yml (r807)`]);
    if (r.status !== 0) console.error(`  ✗ main в ${vetkaRolika} не влился: ${(r.stderr || r.stdout).trim()} — ролик соберётся старым render.yml`);
  }
  zapusk('render.yml', `render ${zadacha} ${kluchRolika}`,
  ['--ref', vetkaRolika, '-f', `zadacha=${zadacha}`, '-f', 'format=oba', '-f', `vetka_sajta=${vetka}`, '-f', `klyuch=${kluchRolika}`]);
}
// гид — если в yaml дня есть audioguide.transcript и audioSrc; ключ — как в avto.py (sha1 json.dumps текста, Python)
const put = chasti[1];
const kluchGida = fs.existsSync(put) ? vyvod('python3', ['-c', `import json,sys,yaml,hashlib
g=(yaml.safe_load(open(sys.argv[1],encoding='utf-8')) or {}).get('audioguide') or {}
print(hashlib.sha1(json.dumps(g['transcript'],ensure_ascii=False).encode()).hexdigest()[:10] if g.get('transcript') and g.get('audioSrc') else '')`, put]) : '';
if (!kluchGida) console.log(`  гида у дня нет (в ${put} нет audioguide.transcript или audioSrc) — не запускаю`);
else {
  const zhdut = progony('audiogid.yml').filter((p) => ['queued', 'pending', 'waiting', 'requested'].includes(p.status));
  const imya = `audiogid ${put} ${kluchGida}`;
  if (zhdut.length && !zhdut.some((p) => p.displayTitle.trim() === imya))
    console.log(`  ! в очереди audiogid уже ждёт ${zhdut[0].url} — новый отменил бы его (п. 17); гид по открытой заявке поставит avto.yml rc-rolik,\n`
      + `    или позже: gh workflow run audiogid.yml -R ${ROLIK} -f put=${put} -f vetka_sajta=${vetka} -f klyuch=${kluchGida}`);
  else zapusk('audiogid.yml', imya, ['-f', `put=${put}`, '-f', `vetka_sajta=${vetka}`, '-f', `klyuch=${kluchGida}`]);
}

shag(7, 'avto.yml rc-rolik по дню');
avto();

// 8. итог
console.log(`\nИТОГ ${muzei}/${key}${PROBA ? ' (проба)' : ''}: заявка ${pr ? `№${pr.number} ${pr.url}` : 'ещё нет'}; прогоны: ${ssylki.length ? ssylki.join(' ') : 'нет'}`);
console.log('Прогоны не жду (Р686 п.3): ролик и гид на сайт приносит rolik-na-sait.yml. Проверки заявки — gh pr checks один раз.');
