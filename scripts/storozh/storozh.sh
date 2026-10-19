#!/usr/bin/env bash
# Сторож доступности (Д3). Три точки: главная, музей, день. Провал → повтор через минуту → всё ещё провал
# → «сбой» в Telegram (один раз, пока не поднимется). Поднялся → «снова работает». Работа всегда зелёная:
# итог — в сводке запуска и в Telegram, а не красным крестом каждые 20 минут.
set -u
ADRES="${ADRES:-http://russian-civilization.ru}"
ADRES="${ADRES%/}"
PAUZA="${PAUZA:-60}"
TOCHKI=(/ /muzei/arhitektura/ /muzei/arhitektura/den/01-01/)
ZAPUSK="${GITHUB_SERVER_URL:-}/${GITHUB_REPOSITORY:-}/actions/runs/${GITHUB_RUN_ID:-}"
SVODKA="${GITHUB_STEP_SUMMARY:-/dev/null}"
mkdir -p .storozh

shli() {  # отправка в Telegram; нет секрета — спит
  if [ -z "${TG_BOT_TOKEN:-}" ] || [ -z "${TG_STOROZH_CHAT:-}" ]; then
    echo "спит: нет секрета (TG_BOT_TOKEN / TG_STOROZH_CHAT) — не отправлено: $1"
    return 0
  fi
  local kod
  kod=$(curl -sS -m 20 -o /dev/null -w '%{http_code}' \
      "https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage" \
      --data-urlencode "chat_id=${TG_STOROZH_CHAT}" \
      --data-urlencode "text=$1" --data-urlencode "disable_web_page_preview=true" || true)
  if [ "$kod" = "200" ]; then echo "отправлено: $1"; else echo "::warning::Telegram не принял сообщение (код $kod)"; fi
}

proverka() {  # печатает упавшие точки; пусто — всё в порядке
  local t kod
  for t in "${TOCHKI[@]}"; do
    kod=$(curl -s -o /dev/null -L -m 25 -w '%{http_code}' "$ADRES$t" || true)
    [ "$kod" = "200" ] || echo "$t → ${kod:-000}"
  done
}

if [ "${PROBA:-false}" = "true" ]; then
  shli "🔴 ПРОБА сторожа: сайт $ADRES не отвечает (пробное сообщение, сайт не трогали). Запуск: $ZAPUSK"
  exit 0
fi

upali=$(proverka)
if [ -n "$upali" ]; then
  echo "первый провал:"; echo "$upali"; echo "повтор через $PAUZA с"
  sleep "$PAUZA"
  upali=$(proverka)
fi

if [ -n "$upali" ]; then
  echo "::warning::сайт не отвечает: $(echo "$upali" | tr '\n' ';')"
  { echo "### 🔴 Сайт не отвечает ($ADRES)"; echo "$upali"; } >> "$SVODKA"
  if [ ! -f .storozh/lezhit ]; then
    shli "🔴 Сбой: $ADRES не отвечает два раза подряд (с перерывом в минуту).
$upali
Запуск: $ZAPUSK"
    date -u +%FT%TZ > .storozh/lezhit
  else
    echo "о сбое уже сообщали ($(cat .storozh/lezhit)) — молчу до восстановления"
  fi
else
  echo "всё в порядке: ${TOCHKI[*]} → 200"
  echo "### 🟢 Сайт отвечает ($ADRES)" >> "$SVODKA"
  if [ -f .storozh/lezhit ]; then
    shli "🟢 Снова работает: $ADRES (лежал с $(cat .storozh/lezhit) UTC)."
    rm -f .storozh/lezhit
  fi
fi
date -u +%FT%TZ > .storozh/posledniy   # каталог не пустой — кэш сохранится
exit 0
