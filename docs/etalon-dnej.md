# Эталон дней (п. 52 очереди r605, Р288; перенесён в сайт — Р676, 09.11.2026)

Помощник, который делает день, сначала открывает эталон своего музея. Пути — от корня rc-site.
Карточка дня — `src/content/dni-shablon/<музей>/ММ-ДД.yaml` (docs/standart-dnya.md), запись дня —
`src/content/days/<музей>/ММ-ДД.json`, принятая копия — `src/data/utverzhdeno/<музей>/ММ-ДД.json`.

## Форма — дни, которые проходят стандарт дня целиком

С 02-01 сборка красная без любого из 29 пунктов docs/standart-dnya.md. Поля и их порядок берутся отсюда:
у обоих дней проверка `standartDnya` (src/lib/standart-dnya.mjs) пробелов не находит.

- Музей «Что изобрели русские первыми в мире», 02-01, Бехтерев
  - карточка: src/content/dni-shablon/izobreteniya/02-01.yaml
  - страница: https://russian-civilization.ru/muzei/izobreteniya/den/02-01/
- Музей стойкости и подвига «Русские не сдаются», 02-01, Пересвет
  - карточка: src/content/dni-shablon/ne-sdayutsya/02-01.yaml
  - страница: https://russian-civilization.ru/muzei/ne-sdayutsya/den/02-01/

## Содержание — 3 принятых дня на музей (январь)

Образец того, какие факты, хук и кадры принимаются. Форму с них не копировать: январь стандарт дня не проверяет,
и у этих карточек нет 22–28 пунктов из 29 (на 09.11.2026 — 1, 3, 4, 6, 8, 9, 13–18, 20, 21, 23, 24, 28–30, 40;
у «Изобретений» ещё 76 и 164, у «Не сдаются» ещё 19 и 27).

Музей «Что изобрели русские первыми в мире» (izobreteniya):

- 01-13 · К-278 «Комсомолец», глубина 1027 м (Р282); образцовый снимок — tests/obrazcy
  - карточка: src/content/dni-shablon/izobreteniya/01-13.yaml
  - запись: src/content/days/izobreteniya/01-13.json, копия: src/data/utverzhdeno/izobreteniya/01-13.json
  - страница: https://russian-civilization.ru/muzei/izobreteniya/den/01-13/
- 01-19 · Канторович, линейное программирование (Р172)
  - карточка: src/content/dni-shablon/izobreteniya/01-19.yaml
  - запись: src/content/days/izobreteniya/01-19.json, копия: src/data/utverzhdeno/izobreteniya/01-19.json
  - страница: https://russian-civilization.ru/muzei/izobreteniya/den/01-19/
- 01-25 · Корсаков, машины для поиска по перфокартам (Р187)
  - карточка: src/content/dni-shablon/izobreteniya/01-25.yaml
  - запись: src/content/days/izobreteniya/01-25.json, копия: src/data/utverzhdeno/izobreteniya/01-25.json
  - страница: https://russian-civilization.ru/muzei/izobreteniya/den/01-25/

Музей стойкости и подвига «Русские не сдаются» (ne-sdayutsya):

- 01-01 · Евпатий Коловрат (Р466)
  - карточка: src/content/dni-shablon/ne-sdayutsya/01-01.yaml
  - запись: src/content/days/ne-sdayutsya/01-01.json, копия: src/data/utverzhdeno/ne-sdayutsya/01-01.json
  - страница: https://russian-civilization.ru/muzei/ne-sdayutsya/den/01-01/
- 01-03 · Николай Сиротинин (Р467)
  - карточка: src/content/dni-shablon/ne-sdayutsya/01-03.yaml
  - запись: src/content/days/ne-sdayutsya/01-03.json, копия: src/data/utverzhdeno/ne-sdayutsya/01-03.json
  - страница: https://russian-civilization.ru/muzei/ne-sdayutsya/den/01-03/
- 01-21 · Володя Дубинин (Р478)
  - карточка: src/content/dni-shablon/ne-sdayutsya/01-21.yaml
  - запись: src/content/days/ne-sdayutsya/01-21.json, копия: src/data/utverzhdeno/ne-sdayutsya/01-21.json
  - страница: https://russian-civilization.ru/muzei/ne-sdayutsya/den/01-21/
