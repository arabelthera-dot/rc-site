// Список музеев, у которых есть дни: выбор подписки в Telegram-боте (tg-bot/). Имя — title_ru дословно.
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async () => {
  const withDays = new Set((await getCollection('days')).map((d) => d.data.museum));
  const museums = (await getCollection('museums'))
    .filter((m) => withDays.has(m.id))
    .sort((a, b) => a.data.number - b.data.number)
    .map((m) => ({ slug: m.id, title: m.data.title_ru, number: m.data.number }));
  return new Response(JSON.stringify({ museums }), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
};
