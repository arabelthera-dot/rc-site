// Отчёт строкой на игру: «ок» или «провал — на каком шаге и почему», по каждому движку. Итог: N из M прошли.
const pervyyProval = (steps) => {
  for (const s of steps) {
    const vnutri = pervyyProval(s.steps || []);
    if (vnutri) return vnutri;
    if (s.error && s.category === 'test.step') return s.title;
  }
};
const chisto = (t) => (t || '').replace(/\u001b\[[0-9;]*m/g, '').split('\n').find((l) => l.trim())?.trim().slice(0, 200) || '';

export default class Stroka {
  constructor() { this.itog = []; }
  onTestEnd(test, r) {
    if (r.retry < test.retries && r.status !== 'passed' && r.status !== 'skipped') return; // ждём повтор
    const proekt = test.parent.project()?.name;
    const snimok = (r.errors || []).some((e) => /toHaveScreenshot|снимок/.test(e.message || ''));
    let s;
    if (r.status === 'skipped') s = `пропуск — ${test.annotations.find((a) => a.type === 'skip')?.description || ''}`;
    else if (r.status === 'passed') s = 'ок';
    else s = `провал — шаг «${pervyyProval(r.steps) || '?'}»: ${chisto(r.error?.message)}${snimok ? ' [снимок отличается от эталона]' : ''}`;
    this.itog.push({ proekt, s });
    console.log(`${test.title} · ${proekt}: ${s}`);
  }
  // Ошибка вне игр (не поднялась раздача, сломан сценарий) — иначе прогон молча пустой.
  onError(e) { console.log(`Проходчик: ошибка запуска — ${chisto(e.message || e.stack)}`); }
  onEnd(r) {
    if (!this.itog.length) console.log(`Проходчик: ни одной игры не прогнано (${r.status})`);
    const po = {};
    for (const { proekt, s } of this.itog) {
      po[proekt] ??= { ok: 0, vsego: 0 };
      if (s.startsWith('пропуск')) continue;
      po[proekt].vsego++; if (s === 'ок') po[proekt].ok++;
    }
    for (const [p, { ok, vsego }] of Object.entries(po)) console.log(`Проходчик ${p}: ${ok} из ${vsego} прошли`);
  }
  printsToStdio() { return true; }
}
