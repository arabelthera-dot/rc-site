#!/usr/bin/env bash
# Забор сайта сервером (Р815, 18.11.2026): msk-new сам забирает готовую сборку из релиза vykladka (задача paket в
# .github/workflows/deploy.yml) — входящие соединения из-за границы не нужны. Запуск — cron раз в 5 минут
# (docs/zabor-na-servere.md). Хэш sayt.sha256 прежний — выход. Новый — архив, сверка хэша, распаковка во временную
# папку, rsync в папку сайта. Ролики — по манифесту roliki.txt: сменился — части roliki-NN.tar в хранилище роликов.
# Любая ошибка — сайт остаётся прежним, запись в журнал, следующая попытка через 5 минут.
# Все пути и адрес — переменными окружения, по умолчанию боевые.
set -euo pipefail

ADRES=${ZABOR_ADRES:-https://github.com/arabelthera-dot/rc-site/releases/download/vykladka}
SAYT=${ZABOR_SAYT:-/srv/rc-site/www}
MEDIA=${ZABOR_MEDIA:-/srv/rc-media}
# Ролики и в папку сайта: пока MEDIA_BASE пуст, страницы берут mp4 с самого сайта (как делала задача msk).
ROLIKI_V_SAYT=${ZABOR_ROLIKI_V_SAYT:-1}
SOSTOYANIE=${ZABOR_SOSTOYANIE:-/var/lib/zabrat-sayt}
VREMENNAYA=${ZABOR_VREMENNAYA:-/var/tmp/zabrat-sayt}
ZHURNAL=${ZABOR_ZHURNAL:-/var/log/zabrat-sayt.log}
ZAMOK=${ZABOR_ZAMOK:-/run/lock/zabrat-sayt.lock}
# Владельцы файлов (только при запуске от root): те же, что писали прежде по ssh (rcdeploy — сайт, rcmedia — ролики).
VLADELEC_SAYT=${ZABOR_VLADELEC_SAYT:-rcdeploy:rcdeploy}
VLADELEC_MEDIA=${ZABOR_VLADELEC_MEDIA:-rcmedia:rcmedia}

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

# 1. Ролики — раньше страниц (страница с новым роликом не должна прийти раньше ролика).
skachat roliki.txt
if ! cmp -s "$T/roliki.txt" "$SOSTOYANIE/roliki.txt"; then
  zapis "ролики: манифест сменился ($(wc -l < "$T/roliki.txt") mp4) — забираю части"
  skachat roliki.sha256
  while read -r heh imya; do
    [[ $imya =~ ^roliki-[0-9]+\.tar$ ]] || { zapis "ролики: чужое имя части «$imya»"; exit 1; }
    skachat "$imya" 3600
    (cd "$T" && printf '%s  %s\n' "$heh" "$imya" | sha256sum -c --quiet -)
    mkdir -p "$T/r"
    tar -xf "$T/$imya" -C "$T/r" --no-same-owner --no-same-permissions
    rm -f "$T/$imya"
    # shellcheck disable=SC2046
    rsync -rlt --checksum --delay-updates --chmod=D755,F644 $(vladelec "$VLADELEC_MEDIA") \
      --include='*/' --include='*.mp4' --exclude='*' "$T/r/" "$MEDIA/"
    if [ "$ROLIKI_V_SAYT" = 1 ]; then
      # shellcheck disable=SC2046
      rsync -rlt --checksum --delay-updates --chmod=D755,F644 $(vladelec "$VLADELEC_SAYT") \
        --include='*/' --include='*.mp4' --exclude='*' "$T/r/" "$SAYT/"
    fi
    rm -rf "$T/r"
  done < "$T/roliki.sha256"
  # Сверка: каждый ролик манифеста лежит в хранилище нужного размера.
  while IFS=$'\t' read -r put razmer; do
    [ "$(stat -c %s "$MEDIA/$put" 2>/dev/null)" = "$razmer" ] || { zapis "ролики: нет или не тот размер — $put"; exit 1; }
  done < "$T/roliki.txt"
  cp "$T/roliki.txt" "$SOSTOYANIE/roliki.txt"
  zapis "ролики: готово"
fi

# 2. Сайт.
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
# --exclude='*.mp4': ролики в папке сайта --delete-after не стирает (их кладёт шаг 1); --checksum — у сборки всегда
# новое время файлов, без сверки содержимого rsync переписывал бы все ~18 тыс. файлов (как в msk, r790).
# shellcheck disable=SC2046
rsync -rlt --checksum --delete-after --delay-updates --chmod=D755,F644 $(vladelec "$VLADELEC_SAYT") \
  --exclude='*.mp4' --stats "$T/s/" "$SAYT/" > "$T/rsync.txt"
grep -E 'Number of (regular files transferred|deleted files)' "$T/rsync.txt" || true
cp "$T/sayt.sha256" "$SOSTOYANIE/sayt.sha256"
zapis "сайт: выложено $(find "$T/s" -type f | wc -l) файлов"
