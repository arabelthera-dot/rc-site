// Список RU_CA движка «Документ» (Р323) — в готовую сборку, а не в public/ (Р531, п. 15 аудита r530).
// Источник — src/data/tls-nedoverie.json (выход scripts/proverka-tls.mjs, в git его нет). Раньше скрипт
// переписывал public/assets/museum-proof.js — сборка оставляла грязную копию, файл уезжал в заявки дней.
// Стоит до minify в astro.config: правит dist/assets/museum-proof.js, пока он не сжат. Нет файла — пропуск.
// Откат — убрать из integrations и вернуть запись в public/ в scripts/proverka-tls.mjs.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ISTOCHNIK = 'src/data/tls-nedoverie.json';

export default function tlsRuCa() {
  return {
    name: 'rc-tls-ru-ca',
    hooks: {
      'astro:build:done': ({ dir }) => {
        const dvizhok = path.join(fileURLToPath(dir), 'assets/museum-proof.js');
        if (!fs.existsSync(dvizhok)) { console.log('rc-tls-ru-ca: нет assets/museum-proof.js — пропуск'); return; }
        let hosts = {};
        try { hosts = JSON.parse(fs.readFileSync(ISTOCHNIK, 'utf8')).hosts || {}; } catch { /* нет проверки — пустой список */ }
        const list = Object.keys(hosts).filter((h) => hosts[h].kind === 'ru-ca').sort();
        const js = fs.readFileSync(dvizhok, 'utf8');
        if (!/var RU_CA=\[[^\]]*\];/.test(js)) throw new Error('rc-tls-ru-ca: в museum-proof.js нет строки var RU_CA=[…];');
        fs.writeFileSync(dvizhok, js.replace(/var RU_CA=\[[^\]]*\];/, `var RU_CA=${JSON.stringify(list).replace(/"/g, "'")};`));
        console.log(`rc-tls-ru-ca: RU_CA ${list.length}${list.length ? ': ' + list.join(', ') : ''}`);
      },
    },
  };
}
