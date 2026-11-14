// Словарь связей дня (Р37) — одна запись = один файл (Р776, 14.11): src/data/slovar/<tip>--<slug>.json,
// служебные ключи — _<имя>.json (_roli). Заявки дней пишут свои файлы и не спорят за общий файл.
// Здесь — единственное место, где файлы склеиваются в объект { "tip:slug": запись, "_roli": … }; по имени файла.
import fs from 'node:fs';
import path from 'node:path';

export const PAPKA = 'src/data/slovar';

// Имя файла → ключ: lyudi--ivan-ivanov.json → lyudi:ivan-ivanov, _roli.json → _roli.
export const klyuch = (fayl) => {
  const imya = fayl.replace(/\.json$/, '');
  return imya.startsWith('_') ? imya : imya.replace('--', ':');
};

export function chitajSlovar(papka = PAPKA) {
  const slovar = {};
  for (const f of fs.readdirSync(papka).filter((x) => x.endsWith('.json')).sort()) {
    slovar[klyuch(f)] = JSON.parse(fs.readFileSync(path.join(papka, f), 'utf8'));
  }
  return slovar;
}

export const slovar = chitajSlovar();
export default slovar;
