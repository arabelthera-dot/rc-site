// Е1/Е2 (Сергей 20.10.2026, Р47) — закон о содержании и права на кадры XX века внутри сборки, а не отдельным сторожем.
// Разбор — src/lib/zakon.mjs, снимки реестров и ведомости — data/reestry/, обновление — scripts/prava.mjs --reestry.
// Е1: сильное совпадение с реестром Минюста (иноагенты, нежелательные и экстремистские организации, экстремистские
//     материалы) — сборка красная со строкой «где — кто — какой реестр». Возможные (однофамильцы, короткие
//     названия) и старый снимок (> 14 дней) — предупреждением. Ложное — строкой в data/reestry/isklyucheniya.json.
// Е2: кадр XX века без основания — сборка красная (с 20.10, Р47: 147 кадров разобраны в data/reestry/osnovaniya.json,
//     без основания 0). Новый кадр — основание в подписи или строкой в ведомости. Список — node scripts/prava.mjs --xx.
import { sverkaReestrov, probaReestrov, kadryXX } from '../lib/zakon.mjs';

export default function zakon() {
  return {
    name: 'rc-zakon',
    hooks: {
      'astro:build:start': ({ logger }) => {
        // проба: сверка обязана поймать настоящую запись каждого реестра — иначе «0 совпадений» ничего не значит
        const sboi = probaReestrov();
        if (sboi.length) {
          for (const s of sboi) logger.error(s);
          throw new Error(`закон о содержании: проба сверки не прошла (${sboi.length}) — сверка с реестрами сломана или снимки пусты`);
        }
        const r = sverkaReestrov();
        for (const s of r.starye) logger.warn(s);
        if (r.vozmozhnye.length) logger.warn(`реестры: возможных совпадений ${r.vozmozhnye.length} (однофамильцы, короткие названия) — список: node scripts/prava.mjs --zakon --vse`);
        if (r.sovpadeniya.length) {
          for (const s of r.sovpadeniya) logger.error(`${s.gde}: «${s.imya}» — ${s.reestr} (найдено «${s.variant}»)`);
          throw new Error(`закон о содержании: ${r.sovpadeniya.length} совпадений с реестрами Минюста — убрать из текста или, если это тёзка, строкой в data/reestry/isklyucheniya.json`);
        }
        logger.info(`реестры: снимков ${r.snimkov}, записей ${r.zapisey}, совпадений 0`);
        const xx = kadryXX();
        if (xx.bez.length) {
          for (const k of xx.bez) logger.error(`${k.museum}/${k.key} ${k.gde}: ${k.put} — нет основания показа`);
          throw new Error(`кадры XX века: ${xx.vsego}, без основания ${xx.bez.length} — основание (ГК РФ: общественное достояние, свободная лицензия, ст. 1259, ст. 1274, разрешение) в подписи кадра или строкой в data/reestry/osnovaniya.json со ссылкой на источник`);
        }
        logger.info(`кадры XX века: ${xx.vsego}, без основания 0`);
      },
    },
  };
}
