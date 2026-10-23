// Проверка правила лупы на кадр (Р178, src/lib/lupa.mjs): что кадр, что нет, порог 1200 px, srcset. Запуск: node scripts/lupa.test.mjs
import assert from 'node:assert/strict';
import { kadry, razmetit } from '../src/lib/lupa.mjs';

const razmer = (p) => ({ 'muzei/a/big.jpg': [2400, 1600], 'muzei/a/small.jpg': [800, 585], 'muzei/a/full.jpg': [3000, 2000] })[p] ?? null;
const html = `<html><head></head><body>
<figure class="fig"><img src="/muzei/a/big.jpg" alt="Большой" srcset="/_k/x-480.webp 480w, /_k/x-1600.webp 1600w"><figcaption>Хранится: музей</figcaption></figure>
<figure><img src="/muzei/a/small.jpg" alt="Мелкий"></figure>
<a href="/muzei/a/full.jpg"><img src="/muzei/a/small.jpg" alt="Ссылка на полный файл"></a>
<a href="/muzei/a/den/01-05/"><figure><img src="/muzei/a/big.jpg" alt="Карточка-ссылка"></figure></a>
<figure><img id="hero" src="/muzei/a/big.jpg" alt="Меняет скрипт"></figure>
<figure><img data-src="/muzei/a/big.jpg" src="/muzei/a/big.jpg" alt="Ленивая скриптом"></figure>
<button><figure><img src="/muzei/a/big.jpg" alt="Механика"></figure></button>
<figure data-rc-bez-lupy><img src="/muzei/a/big.jpg" alt="Опт-аут"></figure>
<div class="hero"><img src="/muzei/a/big.jpg" alt="Не в figure"></div>
<script>var s = '<figure><img src="/muzei/a/big.jpg"></figure>';</script>
<figure><img src="https://example.com/x.jpg" alt="Чужая"></figure>
</body></html>`;

const r = kadry(html).map((k) => [k.tag.match(/alt="([^"]*)"/)?.[1], k.reason]);
assert.deepEqual(r, [
  ['Большой', ''], ['Мелкий', ''], ['Ссылка на полный файл', ''],
  ['Карточка-ссылка', 'картинка — ссылка на страницу'], ['Меняет скрипт', 'картинку меняет скрипт'],
  ['Ленивая скриптом', 'картинку меняет скрипт'], ['Механика', 'внутри механики или служебного блока'],
  ['Опт-аут', 'data-rc-bez-lupy'], ['Не в figure', 'не в figure'], ['Чужая', 'не своя растровая картинка'],
]);

const out = razmetit(html, { razmer });
assert.equal(out.kadrov, 3);
assert.equal(out.vkl, 2, 'большой кадр и ссылка на полный файл — с лупой, мелкий без');
assert.match(out.html, /alt="Большой"[^>]*data-lupa="\/muzei\/a\/big\.jpg" data-lupa-w="2400" data-lupa-h="1600" data-lupa-srcset="\/_k\/x-480\.webp 480w, \/_k\/x-1600\.webp 1600w, \/muzei\/a\/big\.jpg 2400w"/);
assert.match(out.html, /alt="Ссылка на полный файл"[^>]*data-lupa="\/muzei\/a\/full\.jpg" data-lupa-w="3000" data-lupa-h="2000">/);
assert.doesNotMatch(out.html, /alt="Мелкий"[^>]*data-lupa/);
assert.equal(out.prichiny['исходник мельче 1200 px'], 1);
// повторная разметка ничего не меняет
assert.equal(razmetit(out.html, { razmer }).html, out.html);
console.log('lupa.test: ok');
