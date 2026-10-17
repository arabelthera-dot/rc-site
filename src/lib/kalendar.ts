// Общие правила календаря музея — одно место для главной портала, главной музея и страницы календаря.
import fs from 'node:fs';

// длина месяцев невисокосного года: у недатированного музея «ДД» — номер записи в месяце
export const YEAR = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export const plural = (n: number, one: string, few: string, many: string) => {
  const n10 = n % 10, n100 = n % 100;
  return n10 === 1 && n100 !== 11 ? one : n10 >= 2 && n10 <= 4 && (n100 < 10 || n100 >= 20) ? few : many;
};

// календарь датированный, если в calendar-meta не сказано dated:false (нет файла — датированный)
export const isDated = (slug: string) => {
  const p = `src/data/calendar-meta-${slug}.json`;
  return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')).dated !== false : true;
};

// номер записи больше длины месяца — запись «сверх года» (то же правило, что beyondYear
// в museum-calendar-page.js): в счётчик года не идёт, показывается отдельной группой
export const beyondYear = (key: string, dated: boolean) => !dated && +key.slice(3) > YEAR[+key.slice(0, 2) - 1];
