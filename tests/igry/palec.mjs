// Палец: касания как у человека на телефоне. В chromium — настоящий сенсорный ввод через CDP
// (Input.dispatchTouchEvent: браузер сам делает из него pointer-, touch- и click-события, учитывает
// touch-action и прокрутку — как на Android). В webkit и firefox у Playwright касание есть только «тап»
// (touchscreen.tap); удержание и проведение там — мышью (pointerType=mouse), это честно пишется в отчёт.

export async function palec(page, browserName) {
  const cdp = browserName === 'chromium' ? await page.context().newCDPSession(page) : null;
  const pauza = (ms) => page.waitForTimeout(ms);
  const touch = (type, x, y) => cdp.send('Input.dispatchTouchEvent', {
    type, touchPoints: type === 'touchEnd' ? [] : [{ x: Math.round(x), y: Math.round(y), radiusX: 6, radiusY: 6, force: 1, id: 1 }],
  });

  // Точка внутри элемента: доли ширины и высоты (по умолчанию — середина). Элемент сперва прокручивается в экран.
  async function tochka(loc, [fx, fy] = [0.5, 0.5]) {
    await loc.scrollIntoViewIfNeeded();
    const b = await loc.boundingBox();
    if (!b) throw new Error('элемент не виден на экране');
    return [b.x + b.width * fx, b.y + b.height * fy];
  }

  return {
    vvod: cdp ? 'касание (CDP)' : 'тап касанием, удержание и проведение — мышью',
    async tap(loc, gde) {
      const [x, y] = await tochka(loc, gde);
      await page.touchscreen.tap(x, y);
    },
    async hold(loc, ms, gde) {
      const [x, y] = await tochka(loc, gde);
      if (cdp) {
        await touch('touchStart', x, y);
        // Палец не каменный: лёгкое дрожание раз в 100 мс, как у живой руки (игра не должна сбрасываться).
        for (let t = 0; t < ms; t += 100) { await pauza(100); await touch('touchMove', x + (t / 100) % 2, y); }
        await touch('touchEnd');
      } else {
        await page.mouse.move(x, y); await page.mouse.down(); await pauza(ms); await page.mouse.up();
      }
    },
    async swipe(loc, dx, dy, { ot, ms = 400, shagov = 12 } = {}) {
      const [x, y] = await tochka(loc, ot);
      if (cdp) {
        await touch('touchStart', x, y);
        for (let i = 1; i <= shagov; i++) { await pauza(ms / shagov); await touch('touchMove', x + (dx * i) / shagov, y + (dy * i) / shagov); }
        await touch('touchEnd');
      } else {
        await page.mouse.move(x, y); await page.mouse.down();
        await page.mouse.move(x + dx, y + dy, { steps: shagov }); await page.mouse.up();
      }
    },
  };
}
