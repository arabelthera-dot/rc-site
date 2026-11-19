# Выкладка из России: свой исполнитель (self-hosted runner) — инструкция для Михаила

Зачем. С 13.11.2026 msk-new (185.149.145.227) не отвечает из-за границы: облачные машины GitHub
не достают до него по ssh, и шаги `msk` и `zhivoy` в `.github/workflows/deploy.yml` падают.
Сборка (`build`) остаётся в облаке, а выкладку можно запускать на машине в России. Этой машине нужен
только исходящий HTTPS к GitHub, входящие порты открывать не надо.

Сейчас переключатель выключен: пока переменная `RC_RUNNER_RF` не равна `1`, всё работает как раньше.

## Шаги

1. **Машина.** Нужна любая машина в РФ с Linux x64, у которой есть ssh до msk-new. Подойдёт и сам msk-new.
   Заведите отдельного пользователя без sudo, например `sudo useradd -m gh-runner`.
2. **Программы.** Поставьте `rsync`, `openssh-client`, `tar`, `curl` и Node 22. Для проверки живого сайта
   (`zhivoy`) один раз с sudo выполните `npx -y playwright@1.55.1 install-deps chromium`.
3. **Сеть.** Нужен исходящий 443 к `github.com`, `api.github.com`, `*.actions.githubusercontent.com`,
   `*.blob.core.windows.net`. Проверка: `curl -sI https://github.com` должен ответить кодом 200.
4. **Токен.** Владелец репозитория открывает
   https://github.com/arabelthera-dot/rc-site/settings/actions/runners/new, выбирает Linux x64 и
   копирует оттуда команды скачивания и токен. Токен действует 1 час.
5. **Регистрация.** От пользователя `gh-runner`, в папке `~/actions-runner`:
   `./config.sh --url https://github.com/arabelthera-dot/rc-site --token <ТОКЕН> --labels rf --unattended`.
   Затем запуск службы: `sudo ./svc.sh install gh-runner && sudo ./svc.sh start`. На странице
   Settings → Actions → Runners у исполнителя должен появиться зелёный статус Idle.
6. **Включение.** Settings → Secrets and variables → Actions → вкладка Variables → New repository variable,
   имя `RC_RUNNER_RF`, значение `1`. Затем одна команда:
   `gh workflow run deploy.yml -R arabelthera-dot/rc-site --ref main`.
   Выкладка полная, поэтому первый прогон унесёт на сайт всё, что слито с 13.11.
7. **Откат.** Удалите переменную `RC_RUNNER_RF` или поставьте ей `0`, и выкладка снова пойдёт из облака.
   Сам исполнитель снимается командой `./config.sh remove --token <ТОКЕН>` (токен даёт та же страница).

## Безопасность

Репозиторий публичный. Метку `rf` использует только `deploy.yml`, а он запускается на слияние в `main`,
по расписанию и вручную. Чужие заявки (pull request) его не запускают, ключи выдаются окружением `msk-new`.
Не добавляйте `rf` в `runs-on` других файлов из `.github/workflows/`, которые запускаются на `pull_request`.
Подробнее: https://docs.github.com/en/actions/hosting-your-own-runners/managing-self-hosted-runners/about-self-hosted-runners#self-hosted-runner-security
