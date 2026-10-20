# Сайт в Яндекс Облаке (Р6, задача Y, 20.10.2026)

Решение Сергея: сайт держим в России. Основная площадка — Яндекс Облако (Object Storage, хостинг статического
сайта). GitHub Pages остаётся запасным зеркалом и собирается из той же сборки, что и раньше.

## Что где

| Что | Где |
|---|---|
| Сайт | бакет Object Storage `russian-civilization.ru` (хостинг: главная `index.html`, ошибка `404.html`) |
| www | бакет `www.russian-civilization.ru`: все запросы переадресует на `https://russian-civilization.ru` |
| DNS | публичная зона Cloud DNS домена: корень — запись ANAME на `russian-civilization.ru.website.yandexcloud.net`, www — CNAME |
| https | сертификат Let's Encrypt в Certificate Manager на домен и www, проверка DNS_CNAME; продлевается сам |
| Описание всего этого кодом | `infra/yandex/` (terraform, провайдер `yandex-cloud/yandex`) |
| Состояние terraform | бакет `russian-civilization-tfstate` (с версиями), в git его нет |
| Выкладка | задача `yandex` в `.github/workflows/deploy.yml`: после каждой сборки для Pages — `aws s3 sync` в бакет |
| Применение terraform | `.github/workflows/terraform-yandex.yml`, только ручной запуск (Actions → terraform-yandex → Run workflow) |

По документации Яндекса: [статический сайт, Terraform](https://yandex.cloud/ru/docs/storage/tutorials/static/terraform),
[свой домен](https://yandex.cloud/ru/docs/storage/operations/hosting/own-domain),
[сертификат для бакета](https://yandex.cloud/ru/docs/storage/operations/hosting/certificate),
[AWS CLI для Object Storage](https://yandex.cloud/ru/docs/storage/tools/aws-cli),
[состояние terraform в Object Storage](https://yandex.cloud/ru/docs/tutorials/infrastructure-management/terraform-state-storage).

## Что заводит Михаил (М47) и что нужно сервисному аккаунту

Каталог, публичная зона Cloud DNS `russian-civilization.ru.` с именем **`russian-civilization-ru`**
(другое имя — вписать в `dns_zone_name` в `infra/yandex/variables.tf`), сервисный аккаунт `rc-deploy`
с ролями на каталог: `storage.admin` (бакеты и публичный доступ), `dns.editor`, `certificate-manager.editor`,
`certificate-manager.certificates.downloader` (привязка сертификата к бакету). Секреты репозитория:

- `YC_ACCESS_KEY_ID`, `YC_SECRET_ACCESS_KEY` — статический ключ доступа `rc-deploy` (бакеты, выкладка, состояние);
- `YC_SA_KEY_JSON` — авторизованный ключ `rc-deploy` (JSON целиком);
- `YC_FOLDER_ID` — идентификатор каталога.

Пока секретов нет, обе задачи спят и пишут в журнал строку «Яндекс Облако: нет секретов… — пропущено».
Pages работает как прежде.

## Как включить, по шагам (сайт не пропадает ни на минуту)

1. **Записи reg.ru.** Посмотреть в панели reg.ru все записи домена, кроме A/CNAME сайта: почта (MX), TXT
   подтверждений (Вебмастер, почта, SPF/DKIM). Вписать их в `dop_zapisi` (пример — `infra/yandex/terraform.tfvars.example`,
   значение — в `variables.tf` или файлом). Иначе после смены NS они пропадут.
2. **Первый проход terraform:** Run workflow, `deystvie = plan`, `https = false` → посмотреть план → то же с `apply`.
   Появятся бакеты, записи в зоне Яндекса и заявка на сертификат. В конце журнала — `acme_cname`: два CNAME
   `_acme-challenge…` → `…cm.yandexcloud.net`.
3. **Выкладка.** Перезапустить последний deploy (или дождаться слияния/ночной сборки) — задача `yandex` положит сайт в бакет.
   Проверка без DNS: <http://russian-civilization.ru.website.yandexcloud.net/> открывается, внутренняя страница
   (например `/muzei/`) тоже.
4. **Сертификат до переключения.** Два CNAME `_acme-challenge` из шага 2 добавить в reg.ru (DNS там ещё действует).
   Второй проход: `apply` с `https = true` — terraform дождётся выпуска (обычно минуты, до часа) и привяжет сертификат.
5. **Переключение.** В reg.ru у домена сменить DNS-серверы `ns1.reg.ru`, `ns2.reg.ru` на `ns1.yandexcloud.net`,
   `ns2.yandexcloud.net`. Расходится до суток; всё это время отвечает то Pages, то Яндекс — оба с https и одним сайтом.

## Проверка

- <https://russian-civilization.ru/> открывается с замочком; в свойствах сертификата: выдан Let's Encrypt,
  на имена `russian-civilization.ru` и `www.russian-civilization.ru`.
- `https://www.russian-civilization.ru/` переадресует на `https://russian-civilization.ru/`.
- Несуществующий адрес отдаёт страницу 404 сайта.
- Кто отвечает: `dig NS russian-civilization.ru +short` → `ns1.yandexcloud.net.`/`ns2.yandexcloud.net.`;
  `curl -sI https://russian-civilization.ru/ | grep -i server` → `nginx` или `Yandex…` (у Pages — `GitHub.com`).
- Типы и кэш: `curl -sI https://russian-civilization.ru/` → `content-type: text/html; charset=utf-8`, `cache-control: public, max-age=600`.
- Smoke (`.github/workflows/smoke.yml`) после смены NS ходит уже на Яндекс; чужой сертификат там сразу красный.

## Как устроена выкладка

Задача `yandex` берёт тот же артефакт `github-pages`, что ушёл на Pages, и раскладывает его в бакет
командой `aws s3 sync --delete` (endpoint `https://storage.yandexcloud.net`). Типы файлов задаются явно:
HTML `text/html; charset=utf-8`, css, js, webp, woff2 и прочие. Кэш:

- `_astro/*` (имя файла меняется вместе с содержимым) — год, `immutable`;
- картинки, звук, видео, шрифты — неделя;
- прочие css/js/json/xml — час;
- HTML — 10 минут, как на Pages.

Тяжёлые файлы сверяются по размеру, текстовые выкладываются каждый раз; HTML идёт последним. Ошибка выкладки
даёт предупреждение и не роняет Pages, IndexNow и smoke.

## Откат

- **Быстрый (сайт снова с GitHub Pages):** в reg.ru вернуть DNS-серверы домена `ns1.reg.ru`, `ns2.reg.ru`.
  Записи сайта в reg.ru для этого не трогаем и до конца переезда не удаляем. Pages собирается всё это время,
  свой домен у него остаётся. Расходится до суток.
- **Остановить выкладку в бакет:** удалить секреты `YC_ACCESS_KEY_ID`/`YC_SECRET_ACCESS_KEY` (задача уснёт) или
  revert этой заявки.
- **Убрать инфраструктуру:** `terraform destroy` в `infra/yandex` с теми же ключами (бакет перед этим очистить).

## Цены

Только со страниц тарифов Яндекса, смотреть там же перед решением:

- Object Storage — [тарифы](https://yandex.cloud/ru/docs/storage/pricing) и [прайс-лист](https://yandex.cloud/ru/price-list):
  платят за хранение (ГБ в месяц), за операции и за исходящий трафик. Сайт сейчас весит около 0,6 ГБ.
- Cloud DNS — [тарифы](https://yandex.cloud/ru/docs/dns/pricing): на 20.10.2026 там указано 37,94 ₽ за 1 млн
  запросов к публичным зонам в месяц.
- Certificate Manager — [тарифы](https://yandex.cloud/ru/docs/certificate-manager/pricing): «дополнительно не тарифицируется».
