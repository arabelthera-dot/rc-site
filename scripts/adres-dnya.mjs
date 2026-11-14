#!/usr/bin/env node
// Адрес дня — машиной (Р763): ролик и аудиогид пришли на main (rolik-na-sait.yml) — день получает adres: den без ручной заявки.
// Вызывает .github/workflows/adres-dnya.yml; руками — то же самое.
//   spisok                — строки «<музей> ММ-ДД»: карточка src/content/dni-shablon/<музей>/ММ-ДД.yaml без adres: den,
//                           а ролик (16:9 и 9:16) и mp3 гида дня уже лежат в main. Файлы смотрит по дереву git (HEAD),
//                           public/ в рабочей копии не нужна.
//   vklyuchit <музей> ММ-ДД [--proba] — «Русские не сдаются»: штатный scripts/ns-konveyer.mjs ММ-ДД (замки ns-zamki и схема);
//                           изобретения: adres: den ставится, только если карточка с ним проходит ту же схему и стандарт дня,
//                           что сборка (src/lib/dni-shablon.mjs, src/lib/standart-dnya.mjs). --proba — проверить, не писать.
// Код выхода vklyuchit: 0 — адрес стоит; 2 — замки не прошли, карточка не тронута (у НС конвейер сам снимает adres).
// Откат: удалить этот файл и .github/workflows/adres-dnya.yml (или выключатель — переменная ADRES_DNYA = '0').
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';

const DIR = 'src/content/dni-shablon';
const MUZEI = ['ne-sdayutsya', 'izobreteniya'];
const REESTR = { 'ne-sdayutsya': 'nesdayutsya', izobreteniya: 'izobreteniya' };
const MES_KL = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const ROLIK = 'arabelthera-dot/rc-rolik';
const ADRES = /^adres:\s*den\s*$/m;

const git = (...a) => execFileSync('git', a, { encoding: 'utf8', maxBuffer: 64 << 20 });
// Путь файла со страницы — как failPublic (src/lib/den-obshchee.mjs): «/x» от корня сайта, иначе от папки музея.
const vPublic = (muzei, src) => {
  const u = String(src).split(/[?#]/)[0];
  return path.posix.join('public', u.startsWith('/') ? path.posix.normalize(u) : path.posix.join(`/muzei/${muzei}/`, u));
};

async function spisok() {
  const YAML = (await import('yaml')).default;
  const derevo = new Set(git('ls-tree', '-r', '--name-only', 'HEAD', '--', 'public/muzei/', 'public/video/registry/').split('\n'));
  const est = (f) => derevo.has(f);
  const reestr = (f) => JSON.parse(git('show', `HEAD:${f}`));
  for (const muzei of MUZEI) {
    if (!fs.existsSync(path.join(DIR, muzei))) continue;
    for (const f of fs.readdirSync(path.join(DIR, muzei)).filter((x) => /^\d\d-\d\d\.yaml$/.test(x)).sort()) {
      const tekst = fs.readFileSync(path.join(DIR, muzei, f), 'utf8');
      if (ADRES.test(tekst)) continue;
      const key = f.slice(0, 5), k = YAML.parse(tekst) ?? {};
      if (k.status === 'zagotovka') continue; // заготовка на адрес den не идёт (Р676)
      const [mm, dd] = key.split('-');
      const net = [];
      // Ролик: выпуск реестра дня и оба его файла в main.
      const papka = `public/video/registry/${REESTR[muzei]}/`;
      const vypusk = muzei === 'ne-sdayutsya'
        ? [...derevo].find((x) => x.startsWith(`${papka}${dd}${MES_KL[+mm - 1]}-`) && x.endsWith('.json'))
        : k.video?.klyuch && `public/video/registry/${k.video.klyuch}.json`;
      if (!vypusk || !est(vypusk)) net.push('ролика нет в реестре');
      else { const r = reestr(vypusk); for (const s of [r.horizontal, r.vertical]) if (!s?.local || !est(`public/${s.local}`)) net.push(`нет файла ролика ${s?.local}`); }
      if (muzei === 'izobreteniya' && (!k.video?.mp4 || !est(vPublic(muzei, k.video.mp4)))) net.push(`нет файла ролика ${k.video?.mp4}`);
      // Гид: mp3 по audioSrc карточки, у НС без блока audioguide — по audiogid/ns-ММ-ДД.yaml облака (его кладёт rolik-na-sait).
      let ag = k.audioguide?.audioSrc;
      if (!ag && muzei === 'ne-sdayutsya') {
        try { ag = YAML.parse(execFileSync('gh', ['api', `repos/${ROLIK}/contents/audiogid/ns-${key}.yaml`, '-H', 'Accept: application/vnd.github.raw'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }))?.audioguide?.audioSrc; } catch {}
      }
      if (!ag || !est(vPublic(muzei, ag))) net.push(`нет mp3 гида ${ag ?? ''}`.trim());
      if (net.length) console.error(`${muzei} ${key}: ждёт — ${net.join('; ')}`);
      else console.log(`${muzei} ${key}`);
    }
  }
}

async function vklyuchit(muzei, key, proba) {
  if (!MUZEI.includes(muzei) || !/^\d\d-\d\d$/.test(key ?? '')) { console.error('запуск: node scripts/adres-dnya.mjs vklyuchit <ne-sdayutsya|izobreteniya> ММ-ДД [--proba]'); process.exit(1); }
  if (muzei === 'ne-sdayutsya') {
    const r = spawnSync('node', ['scripts/ns-konveyer.mjs', key, ...(proba ? ['--sverka'] : [])], { stdio: 'inherit' });
    process.exit(r.status ?? 1);
  }
  const fail = path.join(DIR, muzei, `${key}.yaml`);
  const YAML = (await import('yaml')).default;
  const { skhema } = await import('../src/lib/dni-shablon.mjs');
  const { standartDnya } = await import('../src/lib/standart-dnya.mjs');
  const { faktyIzUtverzhdeno } = await import('../src/lib/fakty-iz-utverzhdeno.mjs');
  const doc = YAML.parseDocument(fs.readFileSync(fail, 'utf8'));
  // Те же шаги, что загрузчик сборки (zagruzitKartochki, src/lib/den-obshchee.mjs), — на карточке с adres: den.
  const izUtv = faktyIzUtverzhdeno({ ...doc.toJS(), adres: 'den' }, muzei, key);
  const r = izUtv.oshibki.length ? null : skhema.safeParse(izUtv.syroe);
  const net = izUtv.oshibki.length ? izUtv.oshibki
    : !r.success ? r.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`)
    : standartDnya(r.data, izUtv.syroe);
  if (net.length) { console.log(`${muzei} ${key}: замки адреса den не прошли — карточка не тронута:\n${net.map((s) => `  ✗ ${s}`).join('\n')}`); process.exit(2); }
  if (!proba && !doc.has('adres')) {
    const items = doc.contents.items;
    items.splice(items.findIndex((p) => p.key?.value === 'key') + 1, 0, doc.createPair('adres', 'den'));
    fs.writeFileSync(fail, doc.toString({ lineWidth: 0 }));
  }
  console.log(`${muzei} ${key}: ✓ замки прошли${proba ? ' (проба, не записано)' : ', adres: den'}`);
}

const [cmd, ...a] = process.argv.slice(2);
if (cmd === 'spisok') await spisok();
else if (cmd === 'vklyuchit') await vklyuchit(a[0], a[1], a.includes('--proba'));
else { console.error('запуск: node scripts/adres-dnya.mjs spisok | vklyuchit <музей> ММ-ДД [--proba]'); process.exit(1); }
