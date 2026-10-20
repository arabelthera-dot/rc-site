// Данные блока «Сегодня в Русской цивилизации»: 366 файлов segodnya/<ММ-ДД>.json (с 02-29).
// Браузер берёт файл московской даты, если она не совпала с датой сборки (portal/Segodnya.astro).
// Язык по умолчанию (русский) — без приставки адреса; прочие готовые языки — [yazyk]/segodnya/[key].json.ts (Г20).
import type { APIRoute } from 'astro';
import { KEYS, today } from '../../lib/segodnya';
import { poUmolchaniyu } from '../../lib/yazyki.mjs';

export const getStaticPaths = () => KEYS.map((key) => ({ params: { key } }));

export const GET: APIRoute = async ({ params }) =>
  new Response(JSON.stringify(await today(params.key!, poUmolchaniyu)), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
