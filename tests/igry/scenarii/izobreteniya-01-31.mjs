// Сценарий прохода: 31 января, гиротрон «Поймай резонанс» (нестандартная игра: ползунок, найти место и отпустить).
// Как играет ребёнок: ведёт жёлтый кружок, пока не загорится «Стоп!» (.gr-w.hot), отпускает и ждёт; промахнулся —
// подправляет туда, куда показывает подсказка («правее →» / «← левее»). Два уровня, потом «Финал» и «Включить».
export const final = '.gr-finale';

const goryacho = () => !!document.querySelector('.gr-w.hot');
const zapolneno = () => { const n = document.querySelector('.gr-next'); return !!n && !n.hidden; };

async function poymat(i, page, uroven) {
  for (let popytka = 1; popytka <= 10; popytka++) {
    if (await i.vidno(zapolneno)) return;
    if (!(await i.vidno(goryacho))) {
      const { v, kuda } = await page.evaluate(() => {
        const sub = document.querySelector('.gr-sub').textContent;
        return { v: +document.querySelector('.gr-range').value / 1000, kuda: /правее/.test(sub) ? 1 : /левее/.test(sub) ? -1 : 0 };
      });
      if (kuda) {
        // «Теплее» — медленно в сторону подсказки, пока не «Стоп!» или подсказка не сменит сторону
        const smenilas = kuda > 0 ? () => /левее/.test(document.querySelector('.gr-sub').textContent)
          : () => /правее/.test(document.querySelector('.gr-sub').textContent);
        const stop = `() => !!document.querySelector('.gr-w.hot') || (${smenilas})()`;
        await i.vedi('.gr-range', { ot: v, do: kuda > 0 ? 0.99 : 0.01, shag: 1, pauza: 140, stop: new Function(`return (${stop})()`),
          opis: `уровень ${uroven}: «Теплее» — медленно ${kuda > 0 ? 'вправо' : 'влево'} (попытка ${popytka})` });
      } else {
        // холодно — вести через всю ручку, пока не «Теплее» или «Стоп!»
        const teplee = () => !!document.querySelector('.gr-w.hot') || /Теплее/.test(document.querySelector('.gr-sub').textContent);
        await i.vedi('.gr-range', { ot: v, do: v > 0.5 ? 0.01 : 0.99, shag: 3, pauza: 50, stop: teplee,
          opis: `уровень ${uroven}: вести кружок ${v > 0.5 ? 'влево' : 'вправо'} до «Теплее» (попытка ${popytka})` });
      }
    }
    // отпустил на «Стоп!» — мощность растёт, пока точки кружат вместе
    const t0 = Date.now();
    while (Date.now() - t0 < 7000 && (await i.vidno(goryacho)) && !(await i.vidno(zapolneno))) await page.waitForTimeout(200);
  }
  throw new Error(`уровень ${uroven}: за 10 попыток не удержал резонанс`);
}

export default async function (i, page) {
  await poymat(i, page, 1);
  await i.tap('.gr-next', 'тап «Дальше: гиротрон для ИТЭР»');
  await poymat(i, page, 2);
  await i.tap('.gr-next', 'тап «Финал: 8 лучей в реактор»');
  await i.tap('.gr-next', 'тап «Включить 8 гиротронов»');
  await i.zhdi('.gr-finale', 20_000, 'градусник до 300 млн °C');
}
