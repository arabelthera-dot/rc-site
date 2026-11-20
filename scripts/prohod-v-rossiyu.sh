#!/usr/bin/env bash
# Путь до msk-new (185.149.145.227:22) из облака GitHub (Р825 задача A): тот же выбор, что в шаге «проход в Россию»
# deploy.yml (18.11.2026, Р813) — прямой, Cloudflare (RU_MOST), bore.pub (RU_MOST2, host:port); первый, где сервер
# ответил баннером SSH. Печатает опцию ssh («-o ProxyCommand=…» или пусто для прямого), сообщения — в stderr.
# Ни один путь не ответил — код 1. Сервер сверяется по known_hosts вызывающего: подмена по пути невозможна.
# Запуск: SSH_MOST=$(MOST=… MOST2=… scripts/prohod-v-rossiyu.sh)
#
# С командой — пути по очереди до первого удачного (r833, 20.11.2026): scripts/prohod-v-rossiyu.sh -- команда …
# Команда видит опцию пути в $SSH_MOST; упала — та же команда идёт следующим ответившим путём. Зачем: баннер SSH на
# прямом пути — не гарантия, фильтр на границе пропускает пробу, а через минуту rsync получает «Connection timed out»
# (deploy 44592076488, 44672739220, 44677442012); туннель Cloudflare рвётся посреди rsync (44475675257) — и выкладка
# падала, хотя запасной проход был жив. rsync с --checksum и --delay-updates повторять безопасно: доложит недостающее.
# Как в мире — повтор с переходом на запасной адрес (failover): man ssh_config, ConnectionAttempts и несколько Host;
# https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/retry-backoff.html
set -euo pipefail
T="${RUNNER_TEMP:-/tmp}"
otvet() { timeout 25 bash -c "exec 3<>/dev/tcp/$1/$2 && head -c 7 <&3" 2>/dev/null | grep -q '^SSH-2.0'; }

# Путь № $1 (1 — прямой, 2 — Cloudflare, 3 — bore): ответил — печатает опцию ssh и код 0, нет — код 1.
put() {
  case "$1" in
    1) if otvet 185.149.145.227 22; then echo "msk-new: прямой путь открыт — без прохода" >&2; return 0; fi ;;
    2)
      [ -n "${MOST:-}" ] || return 1
      # Версия и контрольная сумма закреплены: чужой файл не запустится.
      if [ -x "$T/cloudflared" ] || { curl -fsSL -o "$T/cloudflared" https://github.com/cloudflare/cloudflared/releases/download/2026.11.1/cloudflared-linux-amd64 \
         && echo "97bb3b02d23a5980fc9c15a1a270e692da1923f103f920d5b16d4931d5ab55e7  $T/cloudflared" | sha256sum -c - >&2 && chmod +x "$T/cloudflared"; }; then
        printf '#!/bin/sh\nexec "%s" access tcp --hostname "%s"\n' "$T/cloudflared" "$MOST" > "$T/most.sh"; chmod +x "$T/most.sh"
        "$T/cloudflared" access tcp --hostname "$MOST" --url 127.0.0.1:2222 >/dev/null 2>&1 &
        cf=$!
        est=0; for i in $(seq 1 15); do sleep 2; if otvet 127.0.0.1 2222; then est=1; break; fi; done
        kill "$cf" || true
        if [ "$est" = 1 ]; then echo "msk-new: через проход $MOST" >&2; echo "-o ProxyCommand=$T/most.sh"; return 0; fi
      fi
      echo "::warning::msk-new: проход Cloudflare $MOST не ответил — пробую запасной" >&2 ;;
    3)
      if [ -n "${MOST2:-}" ] && otvet "${MOST2%:*}" "${MOST2##*:}"; then
        printf '#!/bin/sh\nexec nc %s %s\n' "${MOST2%:*}" "${MOST2##*:}" > "$T/most2.sh"; chmod +x "$T/most2.sh"
        echo "msk-new: через запасной проход $MOST2" >&2; echo "-o ProxyCommand=$T/most2.sh"; return 0
      fi ;;
  esac
  return 1
}

if [ "${1:-}" = "--" ]; then
  shift
  kod=1; byl=0
  for n in 1 2 3; do
    most=$(put "$n") || continue
    byl=1
    if SSH_MOST="$most" "$@"; then exit 0; else kod=$?; fi
    echo "::warning::msk-new: путь $n ответил, но команда упала (код $kod) — пробую следующий" >&2
  done
  [ "$byl" = 1 ] || echo "::error::msk-new: ни прямой путь, ни проходы (${MOST:-}, ${MOST2:-}) не отвечают — смотритель ~/tools/rf-most" >&2
  exit "$kod"
fi

for n in 1 2 3; do put "$n" && exit 0; done
echo "::error::msk-new: ни прямой путь, ни проходы (${MOST:-}, ${MOST2:-}) не отвечают — смотритель ~/tools/rf-most" >&2
exit 1
