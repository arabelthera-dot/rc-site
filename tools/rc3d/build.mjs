// Сборка движка rc3d: src/data/igry/rc3d/igrok.mjs → public/muzei/izobreteniya/igry/rc3d/ (rc3d.js + чанки).
// Один движок на все дни; новый день — новый файл сцены scen/<имя>.json, не новый код.
// Зависимости сборки (three строго 0.182.0, three.quarks, esbuild) — вне node_modules сайта: RC3D_NM=<папка>/node_modules.
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
const NM = process.env.RC3D_NM || '/tmp/r520/nm/node_modules';
const esbuild = createRequire(NM + '/')('esbuild');
const W = fileURLToPath(new URL('../..', import.meta.url));
const r = await esbuild.build({
  entryPoints: { rc3d: W + 'src/data/igry/rc3d/igrok.mjs' },
  bundle: true, format: 'esm', splitting: true, minify: true, target: 'es2020', outdir: W + 'public/muzei/izobreteniya/igry/rc3d',
  chunkNames: 'chunk-[hash]', nodePaths: [NM], legalComments: 'none', metafile: true,
});
for (const [f, o] of Object.entries(r.metafile.outputs)) console.log(f.replace(W, ''), Math.round(o.bytes / 1024) + ' КБ');
