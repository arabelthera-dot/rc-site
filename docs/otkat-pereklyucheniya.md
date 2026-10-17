# Переключение адреса и откат (шаг 7 плана переезда)

17.10.2026 21:00 МСК адрес https://arabelthera-dot.github.io/rc-museum-preview/ начинает показывать новый сайт
(этот репозиторий). Старый репозиторий `rc-museum-preview` остаётся архивом. Здесь описано, как
переключаем, как за ≤10 минут вернуть старый сайт и как проверить результат. Всё отрепетировано
16.10.2026 на временной копии `arabelthera-dot/rc-otkat-test` (итоги внизу).

## 1. Способ: сборка нового сайта в ветку `site` старого репозитория

Адрес `<владелец>.github.io/rc-museum-preview/` закреплён за репозиторием с именем `rc-museum-preview`.
Своего домена нет, поэтому новый сайт нужно отдавать из этого же репозитория.

- **Как.** Сборка rc-site (`npx astro build --base /rc-museum-preview`) кладётся в отдельную ветку
  `site` старого репозитория. Это обычная практика «gh-pages-ветки из CI»
  (`peaceiris/actions-gh-pages` с `external_repository` и ключом развёртывания). Переключение —
  это смена источника Pages с `main /` на `site /`.
- **Почему так.** Старый сайт целиком остаётся в `main`, и его никто не трогает. Поэтому и
  переключение, и откат — одна и та же пара API-вызовов (сменить источник, запустить сборку), без
  правки файлов, без force push и без переписывания истории. Ruleset 24740200 защищает только
  `refs/heads/main`, на ветку `site` он не влияет.
- **Почему не переименование репозиториев** (rc-site → rc-museum-preview). Сайт на Pages после
  переименования не переадресуется. Новый репозиторий с тем же именем забирает и переадресацию
  git-адресов, а `gate-sergey.py`, `pr_preview.py` и все клоны, работающие с `rc-museum-preview`,
  молча начнут работать с новым сайтом. Откат тоже требует двух переименований подряд.
- **Почему не Pages из Actions прямо в старом репозитории.** `actions/deploy-pages` выкладывает
  только свой репозиторий. Тогда сборку нового сайта пришлось бы вести в старом репозитории
  (рабочий процесс + PAT для запуска из rc-site), а при откате ещё переключать `build_type`.
- **«Архив, только чтение» — правилом, а не кнопкой Archive.** У архивированного репозитория
  нельзя ни отправить в `site`, ни сменить источник Pages: откат упирается в разархивацию. Только
  чтение для `main` даёт ruleset (правило «update» на `refs/heads/main`).

### Подготовка до 17.10 21:00 МСК

1. Ключ развёртывания с записью в `rc-museum-preview` (ed25519; открытый — Settings →
   Deploy keys «rc-site deploy (ветка site)», закрытый — секрет `RC_MUSEUM_PREVIEW_DEPLOY_KEY` в rc-site). **Сделано 16.10.**
2. В `.github/workflows/deploy.yml` — вторая задача после сборки превью:
   `actions/setup-node` → `npm ci` → `npx astro build --base /rc-museum-preview` →
   `peaceiris/actions-gh-pages@v4` с `external_repository: arabelthera-dot/rc-museum-preview`,
   `publish_branch: site`, `publish_dir: ./dist`, `deploy_key: ${{ secrets.RC_MUSEUM_PREVIEW_DEPLOY_KEY }}`
   (`.nojekyll` действие кладёт само). Превью на `/rc-site/` остаётся как есть. **Сделано 16.10:** задача
   `vykladka-site`, `force_orphan` (в ветке один коммит — место на диске не копится), выключатель —
   переменная репозитория `RC_SITE_TO_PREVIEW` (`1` — включено; иначе задача пропускается).
3. Ветка `site` в старом репозитории собрана и заполнена до дня переключения. Её **не удалять**:
   без неё нет повторного переключения.

## 2. Переключение (17.10, 21:00 МСК)

```bash
export PATH=$HOME/bin:$PATH
R=repos/arabelthera-dot/rc-museum-preview/pages
gh api -X PUT  $R -f 'source[branch]=site' -f 'source[path]=/'
gh api -X POST $R/builds          # обязательно: смена источника сборку САМА НЕ запускает
gh api $R/builds/latest --jq '{status,duration,created_at}'   # ждать "built"
```

Признак успеха: главная отдаёт 200, и в ней есть `/_astro/`. Три старые страницы дня отдают 200 и
заглушку «Страница переехала» со ссылкой на новый адрес (п. 4, режим «новый»).

## 3. Откат — вернуть старый сайт (≤10 минут)

```bash
export PATH=$HOME/bin:$PATH
R=repos/arabelthera-dot/rc-museum-preview/pages
gh api -X PUT  $R -f 'source[branch]=main' -f 'source[path]=/'
gh api -X POST $R/builds
gh api $R/builds/latest --jq '{status,duration,created_at}'   # ждать "built"
```

- Ветку `site` не трогать. Повторное переключение — команды п. 2.
- Если старый репозиторий всё-таки архивирован кнопкой Archive, сначала
  `gh repo unarchive arabelthera-dot/rc-museum-preview --yes`.
- Сборка `main` старого сайта на настоящем репозитории длится 115–241 с (сборки 16.10.2026).
  Вместе с командами и проверкой это 4–6 минут.
- Выкладка сбрасывает кеш CDN Pages: в репетиции старая главная была видна без `?v=` сразу
  (`age: 0`). Но Pages отдаёт `Cache-Control: max-age=600`, поэтому браузер посетителя может
  ещё до 10 минут показывать то, что уже скачал. Это нормально, повторно ничего делать не надо.

## 4. Проверка: главная и 3 страницы дня

```bash
S=https://arabelthera-dot.github.io/rc-museum-preview
P="index.html muzei/izobreteniya/day-01jan-cabletv.html muzei/ne-sdayutsya/podvig-brest.html muzei/pervoprohodcy/exp-ermak-1581.html"
# режим «старый» (после отката): 200 и тело байт в байт как в main старого репозитория
for p in $P; do
  c=$(curl -s -o /tmp/b -w '%{http_code}' "$S/$p?v=$(date +%s%N)")
  [ "$c" = 200 ] && [ "$(sha256sum </tmp/b)" = "$(git -C ~/rc-museum-preview show origin/main:$p | sha256sum)" ] \
    && echo "OK  $p" || echo "НЕТ $p ($c)"
done
# режим «новый» (после переключения): главная с /_astro/, старые страницы дня — заглушка-переадресация
for p in $P; do
  c=$(curl -s -o /tmp/b -w '%{http_code}' "$S/$p?v=$(date +%s%N)")
  m=$([ $p = index.html ] && echo /_astro/ || echo 'Страница переехала')
  [ "$c" = 200 ] && grep -q "$m" /tmp/b && echo "OK  $p" || echo "НЕТ $p ($c)"
done
```

`?v=…` обходит кеш CDN. Успех — четыре `OK`. До `built` в `builds/latest` проверять бесполезно.

## 5. Репетиция 16.10.2026 (`arabelthera-dot/rc-otkat-test`)

- `main` — часть старого сайта из `rc-museum-preview@9759f254`: главная, `assets/` и музеи
  izobreteniya, ne-sdayutsya, pervoprohodcy, 344 МБ. Ветка `site` — сборка rc-site
  `--base /rc-otkat-test` (202 МБ, 97 старых адресов с переадресацией). Pages: legacy, `main /`.
- Время засекалось от первой команды до четырёх `OK` проверки п. 4:

| Шаг | Время | Сборка Pages |
|---|---|---|
| исходное включение Pages на `main` | — | 83 с |
| переключение `main` → `site` | 70 с | 66 с |
| откат `site` → `main` | 55 с | 49 с |
| повторное переключение `main` → `site` | 40 с | 34 с |

- Первая попытка переключения была только `PUT` источника, без `POST …/builds`. За 575 с сборка
  так и не началась, сайт остался старым. Отсюда обязательный `POST` в п. 2 и п. 3.
- После переключения открывались `muzei/izobreteniya/den/01-01/` и `muzei/izobreteniya/calendar/`
  (200). Старый `day-01jan-cabletv.html` переадресовывал на `/rc-otkat-test/muzei/izobreteniya/den/01-01/`.
- После репетиции Pages на `rc-otkat-test` выключен. Сам репозиторий не удалён — **можно удалить**
  (только с «да» Сергея).

## 6. Живая репетиция 17.10.2026 (`arabelthera-dot/rc-museum-preview`, живой адрес)

- Копии до начала: метки `pered-repeticiey-otkata-20261017` (`main` 464941c) и
  `pered-repeticiey-otkata-20261017-site` (`site` 5763eaf); полный архив истории — `rc-museum-preview.bundle`
  (1,4 ГБ, проверен), настройки Pages — `pages-config.json` (оба у Джарвиса в `~/backups/otkat-1710/`).
  Файлы репетиция не трогала: менялся только источник показа.
- Время — от первой команды до готовой сборки Pages (по `pages/builds`):

| Шаг | Начало (UTC) | Готово (UTC) | Всего |
|---|---|---|---|
| переключение `main` → `site` (5763eaf) | 04:12:15 | 04:13:06 | 70 с с проверкой, сборка 50 с |
| откат `site` → `main` (464941c) | 04:13:42 | 04:15:54 | 132 с, сборка 131 с |

- После переключения проверка п. 4 «новый» — 6/6 OK (главная с `/_astro/`, 3 старые страницы — заглушка
  «Страница переехала», `den/01-01/`, `calendar/`).
- После отката проверка п. 4 «старый» — 4/4 OK байт в байт с `main` (04:32 UTC). Сборка старого сайта
  на живом адресе в 2,5 раза дольше, чем на учебной копии (131 с против 49 с): объём полного сайта.
  Окно отката ≤10 минут выдерживается с запасом.
- Находка: на главной нового сайта у первопроходцев «в календаре: 371 дней» — больше 365 и неверный падеж;
  чинится отдельной заявкой.
