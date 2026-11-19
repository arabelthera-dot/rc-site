// Кадр вещи дня для пересылки главной: 1200×630, обрезка по центру, JPG (ВК не показывает WebP). Без текста.
// Адрес с ключом даты (ММ-ДД) — у Telegram/ВК свой кэш превью, новый день = новый адрес. Логика — src/lib/og-segodnya.ts.
import type { APIRoute, GetStaticPaths } from 'astro';
import fs from 'node:fs';
import sharp from 'sharp';
import { ogSegodnya } from '../../lib/og-segodnya';

export const getStaticPaths: GetStaticPaths = async () => {
  const o = await ogSegodnya();
  return o.file ? [{ params: { key: o.key }, props: { file: o.file } }] : [];
};

export const GET: APIRoute = async ({ props }) => {
  const buf = await sharp(fs.readFileSync((props as { file: string }).file))
    .resize(1200, 630, { fit: 'cover', position: 'attention' }).jpeg({ quality: 82, mozjpeg: true }).toBuffer();
  return new Response(buf, { headers: { 'Content-Type': 'image/jpeg' } });
};
