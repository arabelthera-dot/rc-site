#!/usr/bin/env bash
# Забор сайта сервером (Р815, 18.11.2026): msk-new сам забирает готовую сборку из релиза vykladka (задача paket в
# .github/workflows/deploy.yml) — входящие соединения из-за границы не нужны. Запуск — cron раз в 5 минут
# (docs/zabor-na-servere.md). Хэш sayt.sha256 прежний — выход. Новый — архив, сверка хэша, распаковка во временную
# папку, rsync в папку сайта. Роликов в сборке нет (Р825): они в хранилище /srv/rc-media, туда их кладёт rolik-na-sait.yml.
# Любая ошибка — сайт остаётся прежним, запись в журнал, следующая попытка через 5 минут.
# Все пути и адрес — переменными окружения, по умолчанию боевые.
set -euo pipefail

ADRES=${ZABOR_ADRES:-https://github.com/arabelthera-dot/rc-site/releases/download/vykladka}
SAYT=${ZABOR_SAYT:-/srv/rc-site/www}
SOSTOYANIE=${ZABOR_SOSTOYANIE:-/var/lib/zabrat-sayt}
VREMENNAYA=${ZABOR_VREMENNAYA:-/var/tmp/zabrat-sayt}
ZHURNAL=${ZABOR_ZHURNAL:-/var/log/zabrat-sayt.log}
ZAMOK=${ZABOR_ZAMOK:-/run/lock/zabrat-sayt.lock}
# Владелец файлов (только при запуске от root): тот же, что писал прежде по ssh.
VLADELEC_SAYT=${ZABOR_VLADELEC_SAYT:-rcdeploy:rcdeploy}

exec >>"$ZHURNAL" 2>&1
exec 9>"$ZAMOK"
flock -n 9 || exit 0  # прошлый запуск ещё идёт

zapis() { echo "$(date '+%F %T') $*"; }
trap 'zapis "сбой в строке $LINENO"' ERR
trap 'kod=$?; [ "$kod" = 0 ] || zapis "ОШИБКА (код $kod) — сайт прежний"; rm -rf "$VREMENNAYA"' EXIT

mkdir -p "$SOSTOYANIE"
rm -rf "$VREMENNAYA"; mkdir -p "$VREMENNAYA"
T=$VREMENNAYA

skachat() { curl -fsSL --retry 3 --retry-delay 5 --connect-timeout 20 --max-time "${2:-60}" -o "$T/$1" "$ADRES/$1"; }
vladelec() { if [ "$(id -u)" = 0 ] && [ -n "$1" ]; then echo "-og --chown=$1"; fi; }

# Сайт.
skachat sayt.sha256
if cmp -s "$T/sayt.sha256" "$SOSTOYANIE/sayt.sha256"; then exit 0; fi
zapis "сайт: новая сборка $(cut -c1-12 "$T/sayt.sha256") — забираю"
skachat sayt.tar.gz 1800
(cd "$T" && sha256sum -c --quiet sayt.sha256)
mkdir -p "$T/s"
tar -xzf "$T/sayt.tar.gz" -C "$T/s" --no-same-owner --no-same-permissions
rm -f "$T/sayt.tar.gz"
for f in index.html 404.html robots.txt; do
  test -f "$T/s/$f" || { zapis "сайт: в сборке нет $f"; exit 1; }
done
# --checksum — у сборки всегда новое время файлов, без сверки содержимого rsync переписывал бы все ~18 тыс. файлов
# (как в msk, r790). Прежние mp4 в папке сайта --delete-after стирает: страницы берут ролики из хранилища (Р825).
# shellcheck disable=SC2046
rsync -rlt --checksum --delete-after --delay-updates --chmod=D755,F644 $(vladelec "$VLADELEC_SAYT") \
  --stats "$T/s/" "$SAYT/" > "$T/rsync.txt"
grep -E 'Number of (regular files transferred|deleted files)' "$T/rsync.txt" || true
cp "$T/sayt.sha256" "$SOSTOYANIE/sayt.sha256"
zapis "сайт: выложено $(find "$T/s" -type f | wc -l) файлов"
