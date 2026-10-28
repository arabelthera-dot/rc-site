#!/usr/bin/env node
// Проверка сертификатов источников (Р323, 28.10): посетителя не отправляем на страницу с предупреждением браузера.
// Собирает адреса source_url (блок «Документ»), source (строка «Источник») и ссылок href из src/content и src/data/full-pages,
// проверяет сертификат каждого сайта обычной проверкой node tls (как Chrome/Safari без российского корня).
// Не прошёл — сайт попадает в src/data/tls-nedoverie.json и в список RU_CA движка public/assets/museum-proof.js:
// блок показывает реквизиты документа текстом, ссылку подписывает «сайт архива — откроется в Яндекс Браузере».
// Выключить: PROVERKA_TLS=0. Нет сети / сайт не ответил — прежняя запись сайта сохраняется, сборка не падает.
import fs from 'node:fs';
import path from 'node:path';
import tls from 'node:tls';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const OUT = path.join(ROOT, 'src/data/tls-nedoverie.json');
const ENGINE = path.join(ROOT, 'public/assets/museum-proof.js');
if (process.env.PROVERKA_TLS === '0') { console.log('proverka-tls: выключена (PROVERKA_TLS=0)'); process.exit(0); }

const files = [];
const walk = (d) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) {
  const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else if (/\.(json|ya?ml|html)$/.test(e.name)) files.push(p); } };
walk(path.join(ROOT, 'src/content')); walk(path.join(ROOT, 'src/data/full-pages'));
const RE = /(?:\\?"?(?:source(?:_url)?|href)\\?"?\s*:\s*\\?"?[^\n"]*?|href=\\?["'])(https?:\/\/[^/\s"'\\:]+)/g;
const hosts = new Set();
for (const f of files) for (const m of fs.readFileSync(f, 'utf8').matchAll(RE)) hosts.add(new URL(m[1]).hostname.replace(/^www\./, ''));

const CERT = /CERT|SELF_SIGNED|UNABLE_TO|VERIFY|ERR_TLS|HOSTNAME/i;
const check = (host) => new Promise((res) => {
  const s = tls.connect({ host, port: 443, servername: host, timeout: 8000 }, () => { s.end(); res({ host, ok: true }); });
  s.on('timeout', () => { s.destroy(); res({ host, ok: null, error: 'timeout' }); });
  s.on('error', (e) => res({ host, ok: CERT.test(e.code || '') ? false : null, error: e.code || e.message }));
});
// Кто выдал сертификат: российский госцентр (НУЦ Минцифры) — Яндекс Браузер его знает, остальные браузеры нет.
const issuer = (host) => new Promise((res) => {
  const s = tls.connect({ host, port: 443, servername: host, timeout: 8000, rejectUnauthorized: false }, () => {
    const c = s.getPeerCertificate(); s.end(); res((c && c.issuer && (c.issuer.CN || c.issuer.O)) || ''); });
  s.on('timeout', () => { s.destroy(); res(''); }); s.on('error', () => res(''));
});

const prev = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : { hosts: {} };
const out = { _: 'Сайты источников, чей сертификат не проходит обычную проверку TLS; пишет scripts/proverka-tls.mjs', hosts: {} };
const today = new Date().toISOString().slice(0, 10);
for (const r of await Promise.all([...hosts].sort().map(check))) {
  if (r.ok === false) {
    const iss = await issuer(r.host);
    out.hosts[r.host] = { kind: /Russian Trusted/i.test(iss) ? 'ru-ca' : 'other', error: r.error, issuer: iss, checked: today };
  }
  else if (r.ok === null && prev.hosts[r.host]) out.hosts[r.host] = prev.hosts[r.host];
}
fs.writeFileSync(OUT, JSON.stringify(out, null, 1) + '\n');
const list = Object.keys(out.hosts).filter((h) => out.hosts[h].kind === 'ru-ca').sort();
const other = Object.keys(out.hosts).filter((h) => out.hosts[h].kind !== 'ru-ca');
const js = fs.readFileSync(ENGINE, 'utf8');
const next = js.replace(/var RU_CA=\[[^\]]*\];/, `var RU_CA=${JSON.stringify(list).replace(/"/g, "'")};`);
if (next !== js) fs.writeFileSync(ENGINE, next);
console.log(`proverka-tls: сайтов ${hosts.size}; сертификат НУЦ Минцифры — ${list.length}${list.length ? ': ' + list.join(', ') : ''}`);
if (other.length) console.log(`proverka-tls: ВНИМАНИЕ, сертификат не проходит по другой причине: ${other.map((h) => `${h} (${out.hosts[h].error})`).join(', ')}`);
