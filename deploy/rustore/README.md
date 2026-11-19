# Приложение «Русская цивилизация» для RuStore (п.507, Р746)

Приложение — обёртка сайта (Trusted Web Activity), своей разработки нет. Собирает бесплатный
[Bubblewrap](https://github.com/GoogleChromeLabs/bubblewrap) от Google Chrome Labs по `twa-manifest.json` из этой папки.
Содержимое приложения — живой сайт https://russian-civilization.ru/: новый день на сайте сразу есть и в приложении, пересборка не нужна.

Что уже есть в репозитории:

| Файл | Зачем |
|---|---|
| `public/manifest.webmanifest` | манифест PWA: имя, иконки 192 и 512, `start_url`, `display: standalone` |
| `public/.well-known/assetlinks.json` | связь сайта с приложением; **отпечаток ключа — заглушка из нулей**, заменить (шаг 3) |
| `deploy/rustore/twa-manifest.json` | настройки сборки: пакет `ru.russian_civilization.twa`, цвета, иконка, путь к ключу |
| `src/data/nastroyki.json` → `pwaManifest` | ссылка на манифест в `<head>` страниц; выключено (`false`), для приложения не нужна |

Ключа подписи в репозитории нет и быть не должно.

## 1. Что поставить (один раз, без sudo)

- Node.js 18+ (есть).
- `npm i -g @bubblewrap/cli` (или `npx @bubblewrap/cli …` без установки).
- При первом запуске `bubblewrap doctor` / `bubblewrap build` сам предложит скачать JDK 17 и Android SDK
  (около 1 ГБ) в `~/.bubblewrap/` — согласиться. Свои пути: `~/.bubblewrap/config.json` (`jdkPath`, `androidSdkPath`).

## 2. Ключ подписи (создаёт хозяин аккаунта RuStore, вне репозитория)

```sh
mkdir -p ~/rc-rustore-klyuch
keytool -genkeypair -v -keystore ~/rc-rustore-klyuch/rc-rustore.keystore \
  -alias rc-rustore -keyalg RSA -keysize 2048 -validity 10000
```

- Пароль и сам файл — в хранилище паролей проекта; потерян ключ — обновления в RuStore выпустить нельзя.
- Путь в `twa-manifest.json` (`signingKey.path`) — относительно папки сборки; поправить под своё место.
- В git ключ не класть никогда.

## 3. Отпечаток ключа → assetlinks.json

```sh
keytool -list -v -keystore ~/rc-rustore-klyuch/rc-rustore.keystore -alias rc-rustore | grep SHA256
# или после сборки: bubblewrap fingerprint add <SHA256> && bubblewrap fingerprint generateAssetLinks
```

Строку `SHA256: AA:BB:…` (32 пары) вписать вместо нулей в `public/.well-known/assetlinks.json`
(`sha256_cert_fingerprints`), заявкой в rc-site. Проверка после слияния:
`https://russian-civilization.ru/.well-known/assetlinks.json` открывается, `Content-Type: application/json`.
Без верного отпечатка приложение работает, но сверху видна адресная строка браузера.

## 4. Сборка apk и aab

```sh
mkdir -p ~/rc-rustore-sborka && cd ~/rc-rustore-sborka
cp <rc-site>/deploy/rustore/twa-manifest.json .
bubblewrap update --skipVersionUpgrade   # создаёт Android-проект из twa-manifest.json
bubblewrap build                         # спросит пароли ключа
```

Выход: `app-release-signed.apk` (для RuStore и пробы на телефоне) и `app-release-bundle.aab`.
Проба: `adb install app-release-signed.apk` или скопировать apk на телефон и открыть.

Новая версия: в `twa-manifest.json` поднять `appVersionCode` (+1) и `appVersionName`, снова `update` и `build`.

`fallbackType: webview` — на телефонах без Chrome (часто у покупателей RuStore) сайт откроется во встроенном окне, а не
сломается.

## 5. Кабинет RuStore (https://console.rustore.ru/)

Нужен аккаунт разработчика RuStore (вход через VK ID, юрлицо, ИП или самозанятый) — заводит хозяин проекта.

- «Создать приложение» → тип «Приложение», загрузить `app-release-signed.apk` (RuStore принимает APK и AAB;
  для AAB — ключ загрузки по их инструкции).
- Название: «Русская цивилизация»; краткое описание до 80 знаков; полное описание — о музеях проекта.
- Категория: «Образование»; возрастная маркировка — как на сайте (`src/lib/vozrast.mjs`).
- Иконка 512×512 — `public/icon-512.png`; снимки экрана телефона (не меньше 2) — с живого сайта.
- Политика конфиденциальности: https://russian-civilization.ru/politika-konfidencialnosti/
- Контакты: https://russian-civilization.ru/kontakty/
- Отправить на модерацию (1–5 рабочих дней).

## Как это делают в мире

- Bubblewrap и TWA — https://developer.chrome.com/docs/android/trusted-web-activity/quick-start
- Связь сайта и приложения (Digital Asset Links) — https://developer.android.com/training/app-links/verify-android-applinks
- Публикация в RuStore — https://www.rustore.ru/help/developers/publishing-and-verifying-apps/
