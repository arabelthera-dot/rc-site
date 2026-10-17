// Данные блока «Сегодня в Русской цивилизации»: 366 файлов segodnya/<ММ-ДД>.json (с 02-29).
// Браузер берёт файл московской даты, если она не совпала с датой сборки (portal/Segodnya.astro).
import type { APIRoute } from 'astro';
import { KEYS, today } from '../../lib/segodnya';

export const getStaticPaths = () => KEYS.map((key) => ({ params: { key } }));

export const GET: APIRoute = async ({ params }) =>
  new Response(JSON.stringify(await today(params.key!)), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
