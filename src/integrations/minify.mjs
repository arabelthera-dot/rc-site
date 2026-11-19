// Минификация того, что Astro/Vite не трогают (замер Lighthouse 19.10: LCP нового хуже на 5 из 5,
// «Minify JavaScript / CSS», «Reduce unused CSS»): public/assets/*.js|*.css копируются в dist как есть,
// а полные страницы дней (fullPages) несут сотни КиБ встроенного <style>. Идёт ПОСЛЕДНЕЙ, после kartinki.
// JS — oxc (rolldown/experimental, уже в зависимостях vite): обычный скрипт как .cjs (верхние имена —
// глобальные, не переименовываются и не выбрасываются), файл с import/export — как модуль.
// CSS — lightningcss без targets (ничего не понижает и не выкидывает). Встроенные <script> не трогаются.
// Ошибка разбора файла — файл остаётся как был (не роняет сборку). Выключатель: RC_NO_MINIFY=1.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export default function minify() {
  return {
    name: 'rc-minify',
    hooks: {
      'astro:build:done': async ({ dir }) => {
        if (process.env.RC_NO_MINIFY === '1') { console.log('rc-minify: выключено (RC_NO_MINIFY=1)'); return; }
        let minifySync, transform;
        try {
          ({ minifySync } = await import('rolldown/experimental'));
          ({ transform } = await import('lightningcss'));
        } catch (e) { console.warn(`rc-minify: минификатор недоступен (${e.message}) — пропуск`); return; }
        const root = fileURLToPath(dir);
        const css = (code, name) => {
          const r = transform({ filename: name, code: Buffer.from(code), minify: true, errorRecovery: true });
          return r.code.toString();
        };
        const stat = { js: [0, 0], css: [0, 0], html: [0, 0], skip: [] };
        const assets = path.join(root, 'assets');
        for (const f of fs.existsSync(assets) ? fs.readdirSync(assets) : []) {
          const fp = path.join(assets, f);
          if (/\.min\.(?:js|css)$/.test(f) || !fs.statSync(fp).isFile()) continue;
          const src = fs.readFileSync(fp, 'utf8');
          let out;
          try {
            if (f.endsWith('.js')) {
              const isModule = /^\s*(?:import\s[\s\S]*?from\s|import\s*['"]|export\s)/m.test(src);
              const r = minifySync(f.replace(/\.js$/, isModule ? '.mjs' : '.cjs'), src,
                { compress: { target: 'es2020' }, mangle: { toplevel: false } });
              if (r.errors?.length) throw new Error(r.errors[0].message);
              out = r.code; stat.js[0] += src.length; stat.js[1] += out.length;
            } else if (f.endsWith('.css')) {
              out = css(src, f); stat.css[0] += src.length; stat.css[1] += out.length;
            } else continue;
          } catch (e) { stat.skip.push(`${f}: ${e.message}`); continue; }
          if (out.length < src.length) fs.writeFileSync(fp, out);
        }
        // Встроенный <style> в HTML (полные страницы дней и остальное) — тем же lightningcss.
        const walk = (d) => {
          for (const e of fs.readdirSync(d, { withFileTypes: true })) {
            const fp = path.join(d, e.name);
            if (e.isDirectory()) { walk(fp); continue; }
            if (!e.name.endsWith('.html')) continue;
            const html = fs.readFileSync(fp, 'utf8');
            if (!/<style/i.test(html)) continue;
            let changed = false;
            const out = html.replace(/(<style\b[^>]*>)([\s\S]*?)(<\/style>)/gi, (m, a, body, z) => {
              if (body.length < 200) return m;
              try {
                const min = css(body, e.name);
                if (min.length >= body.length) return m;
                stat.html[0] += body.length; stat.html[1] += min.length; changed = true;
                return a + min + z;
              } catch { return m; }
            });
            if (changed) fs.writeFileSync(fp, out);
          }
        };
        walk(root);
        const kb = ([a, b]) => `${(a / 1024).toFixed(0)}→${(b / 1024).toFixed(0)} КиБ`;
        console.log(`rc-minify: assets JS ${kb(stat.js)}, CSS ${kb(stat.css)}; встроенный <style> ${kb(stat.html)}`
          + (stat.skip.length ? `; оставлено как есть: ${stat.skip.join('; ')}` : ''));
      },
    },
  };
}
