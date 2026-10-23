// Пробы соседей полной страницы дня (src/lib/sosedi-polnye.mjs, Р165, 23.10.2026): «Куда дальше» и стрелки шапки
// ведут на ближайшие полные страницы музея по кругу года; чужой prev/next вне MUSEUM_CHROME не трогается.
import assert from 'node:assert/strict';
import { polnyeSosedi, perepisatSosedey, zagolovok } from '../src/lib/sosedi-polnye.mjs';

const keys = ['01-16', '01-30', '01-17', '12-14', '01-18'];
assert.deepEqual(polnyeSosedi(keys, '01-17'), { prev: '01-16', next: '01-18' });
assert.deepEqual(polnyeSosedi(keys, '01-18'), { prev: '01-17', next: '01-30' });
assert.deepEqual(polnyeSosedi(keys, '12-14'), { prev: '01-30', next: '01-16' });
assert.deepEqual(polnyeSosedi(['01-16'], '01-16'), {});
assert.equal(zagolovok('<h1 class="t">Аэродинамика <em>как</em>\n наука</h1>'), 'Аэродинамика как наука');

const s = (k, title, hook) => ({ href: `/muzei/izobreteniya/den/${k}/`, when: k === '01-18' ? '18 января' : '16 января', title, hook });
const html = `<div class="kd-card main"><span class="kd-lbl">Следующая страница</span><a href="day-30jan-kotelnikov.html">30 января — Парашют <span class="kd-arr">→</span></a>
        <p>Старый текст.</p></div>
<div class="kd-card"><span class="kd-lbl">Предыдущий день</span><a href="day-16jan-soyuz45.html">16 января — Стыковка <span class="kd-arr">→</span></a>
        <p>Старый.</p></div>
<script>var x={prev:{href:'a.html',title:'не трогать'}};</script>
<script>window.MUSEUM_CHROME={
  prev:{href:'day-16jan-soyuz45.html',title:'16 января · Союз'},
  next:{href:'day-30jan-kotelnikov.html',title:'30 января · Парашют'},
};</script>`;
const out = perepisatSosedey(html, { next: s('01-18', 'Арифмометр «Феликс»', 'Счёт <быстрее> & точнее'), prev: s('01-16', "Стыковка 'Союзов'", 'Через космос.') });
assert.match(out, /kd-lbl">Следующий день<\/span><a href="\/muzei\/izobreteniya\/den\/01-18\/">18 января — Арифмометр «Феликс» <span class="kd-arr">→<\/span><\/a>\s*<p>Счёт &lt;быстрее&gt; &amp; точнее<\/p>/);
assert.match(out, /kd-lbl">Предыдущий день<\/span><a href="\/muzei\/izobreteniya\/den\/01-16\/">16 января — Стыковка 'Союзов'/);
assert.match(out, /var x=\{prev:\{href:'a\.html',title:'не трогать'\}\}/);
assert.match(out, /prev:\{href:'\/muzei\/izobreteniya\/den\/01-16\/',title:'16 января · Стыковка \\'Союзов\\''\}/);
assert.match(out, /next:\{href:'\/muzei\/izobreteniya\/den\/01-18\/',title:'18 января · Арифмометр «Феликс»'\}/);
assert.equal(perepisatSosedey(html, {}), html);
console.log('sosedi-polnye: пробы прошли');
