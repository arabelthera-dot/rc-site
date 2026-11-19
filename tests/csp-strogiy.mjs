// Строка Report-Only в deploy/bezopasnost/nginx-csp-limit.conf совпадает с CSP_STROGIY() (п.501, Р745),
// в ней нет 'unsafe-inline', хеш рамки зеркала — от того же RAMKA_JS, что вставляет scripts/ramka-zerkala.mjs.
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { CSP_STROGIY, RAMKA_JS, ramkaHash } from '../src/lib/csp.mjs';

const conf = readFileSync(new URL('../deploy/bezopasnost/nginx-csp-limit.conf', import.meta.url), 'utf8');
const m = conf.match(/Content-Security-Policy-Report-Only "([^"]+)"/);
assert.ok(m, 'нет строки Report-Only в nginx-csp-limit.conf');
assert.equal(m[1], CSP_STROGIY(), 'строка в nginx-csp-limit.conf разошлась с CSP_STROGIY() — пересобрать из src/lib/csp.mjs');
assert.ok(!CSP_STROGIY().includes('unsafe-inline'), "в строгом CSP 'unsafe-inline'");
assert.ok(CSP_STROGIY().includes(ramkaHash()) && RAMKA_JS.includes('github'));
console.log('csp-strogiy: ок');
