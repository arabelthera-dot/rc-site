// Выход по дате (Р686 п.7): день, готовый заранее, открывается в свой день сам — до него на его адресе «День готовится».
// Как в мире: Hugo publishDate + buildFuture:false, Jekyll future:false; ночная пересборка — schedule в deploy.yml.
// Выключатель — переменная репозитория RC_VYHOD_S (дата запуска ГГГГ-ММ-ДД, с неё идёт год дней); пусто — выключено, видны все дни.
import { mskIso } from './msk.mjs';

const S = (process.env.RC_VYHOD_S || '').trim();
if (S && !/^\d{4}-\d\d-\d\d$/.test(S)) throw new Error(`RC_VYHOD_S=${S}: нужна дата ГГГГ-ММ-ДД`);
export const vyhodVkl = !!S;
// День ключа ММ-ДД в году, который начинается датой запуска: ключ раньше запуска — уже следующий год.
export const denVyhoda = (key, s = S) => { const g = +s.slice(0, 4); const d = `${g}-${key}`; return d >= s ? d : `${g + 1}-${key}`; };
export const vyshel = (key, segodnya = mskIso(new Date()), s = S) => !s || denVyhoda(key, s) <= segodnya;
