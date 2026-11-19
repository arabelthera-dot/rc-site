// Перенос прогресса посетителя (п.496 плана, Р745, 10.11.2026): коллекция открытых дней (rc-return:<музей>,
// museum-return.js), серия дней (rc-privychka, rc-privychka.js) и сохранённые ответы игр живут только в
// localStorage браузера — Safari стирает их через 7 дней без захода. Страница /moy-progress/ (src/pages/moy-progress.astro,
// public/assets/rc-perenos.js): выгрузка в файл JSON, QR-код со ссылкой для телефона, загрузка обратно.
// ВЫКЛЮЧЕНО до показа Сергею: VKLYUCHENO = false — страница собирается (noindex), но ссылок на неё нет и
// navigator.storage.persist() не зовётся. Проба у себя — PUBLIC_PERENOS=1 npm run build. Включение — VKLYUCHENO = true.
const VKLYUCHENO = false;
export const perenosOn = () => VKLYUCHENO || process.env.PUBLIC_PERENOS === '1';

// Строка под серией в блоке «Завтра в музеях»; data-rc-persist на блоке просит rc-privychka.js
// один раз попросить браузер не стирать данные (navigator.storage.persist).
export const ssylkaPerenos = (base) =>
  `<p class="rc-pv-perenos"><a href="${base}moy-progress/">Сохранить мой прогресс</a> — открытые дни и серию можно перенести на другое устройство.</p>`;
