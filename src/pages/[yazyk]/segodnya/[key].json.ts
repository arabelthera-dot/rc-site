// «Сегодня в Русской цивилизации» на других языках: /<code>/segodnya/<ММ-ДД>.json, строки — из словаря
// src/data/stroki.json (stroka/chislo, Г20). ВЫКЛЮЧЕНО: файлы собираются только для языков с ready:true
// в src/data/yazyki.json, кроме русского (он — segodnya/[key].json.ts без приставки). Сейчас готов только
// русский — эта страница не создаёт ни одного файла. Откат — удалить этот файл.
import type { APIRoute } from 'astro';
import { KEYS, today } from '../../../lib/segodnya';
import { gotovye, poUmolchaniyu } from '../../../lib/yazyki.mjs';

export const getStaticPaths = () =>
  gotovye.filter((y) => y.code !== poUmolchaniyu).flatMap((y) => KEYS.map((key) => ({ params: { yazyk: y.code, key } })));

export const GET: APIRoute = async ({ params }) =>
  new Response(JSON.stringify(await today(params.key!, params.yazyk!)), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
