// Р649 п.15: одна таблица дизайна (dizayn/tablica.json, формат DTCG) → выходы Style Dictionary.
// Запуск: npx style-dictionary@5.8.0 build --config dizayn/sd.config.mjs (из корня rc-site).
// Значения не преобразуются (ловушка шрифта в кавычках, «'"PT Serif"'»): только имя — путь через дефис.
const SHAPKA = () => ['Создано из dizayn/tablica.json (Style Dictionary) — руками не править, править таблицу'];
export default {
  source: ['dizayn/tablica.json'],
  hooks: {
    transforms: {
      'name/rc': { type: 'name', transform: (t) => t.path.join('-') },
      'name/rc-js': { type: 'name', transform: (t) => t.path.join('_').replace(/-/g, '_') },
    },
    fileHeaders: { rc: SHAPKA },
  },
  platforms: {
    // стили страниц: public/assets/rc-dizayn.css, подключается первым стилем каждой страницы
    css: {
      transforms: ['name/rc'], buildPath: 'public/assets/',
      files: [{ destination: 'rc-dizayn.css', format: 'css/variables', options: { fileHeader: 'rc', outputReferences: false } }],
    },
    // ролик (Remotion): плоский json имя → значение
    rolik: {
      transforms: ['name/rc'], buildPath: 'dizayn/vyhod/',
      files: [{ destination: 'tokens-rolik.json', format: 'json/flat', options: { fileHeader: 'rc' } }],
    },
    // скрипты сборки: import { cvet_ffffff } from 'dizayn/vyhod/tokens.mjs'
    skripty: {
      transforms: ['name/rc-js'], buildPath: 'dizayn/vyhod/',
      files: [{ destination: 'tokens.mjs', format: 'javascript/es6', options: { fileHeader: 'rc' } }],
    },
  },
};
