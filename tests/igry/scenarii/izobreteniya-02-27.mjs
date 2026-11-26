// Сценарий прохода: 02-27 «Изобретений», Филатов «До и после» (do-i-posle).
// Как играет ребёнок: тянет шторку «до/после» вправо прямо по холсту [data-scena] — слева мир в бельме, справа ясный.
// Шторка доходит до конца (порог 0.97) — сцена проясняется (💡), ползунок возвращается в начало (0.5), сцена сменяется.
// Три сцены (лицо врача, море за окном, своя комната), на последней — финал с «🏆».
// Движок слушает pointer-события на холсте (мышь/палец) и «input» ползунка (клавиатура): тянем пальцем, как посетитель.
export const final = '[data-igra-itog]';

const SCEN = 3; // сцен в dannye: lico, more, komnata

export default async function (i, page) {
  for (let s = 1; s <= SCEN; s++) {
    await i.vedi('[data-scena]', {
      ot: 0.5, do: 0.98, shag: 10, pauza: 30,
      opis: `снять бельмо со сцены ${s} (тянуть шторку вправо)`,
    });
    // Сцена прояснилась и сменилась, когда ползунок вернулся в начало (≤ 51); на последней — сразу «🏆».
    await i.zhdi(() => {
      const it = document.querySelector('[data-igra-itog]')?.textContent || '';
      const v = Number(document.querySelector('.gm-slider')?.value || 0);
      return /🏆/.test(it) || v <= 51;
    }, 12_000, `сцена ${s} прояснилась, шторка вернулась`);
  }
  await i.zhdi(() => /🏆/.test(document.querySelector('[data-igra-itog]')?.textContent || ''), 8000, 'финальный экран «🏆»');
}
