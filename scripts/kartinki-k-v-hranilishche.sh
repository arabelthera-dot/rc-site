#!/usr/bin/env bash
# Картинки шаблона rc-kartinki (dist/_k/<хеш>-<ширина>.webp) — в хранилище media.russian-civilization.ru под тем же
# адресом /_k/… (Р825 задача G, 19.11.2026). Их нет в public/, они появляются только в astro build, поэтому шаг
# «картинки в хранилище» deploy.yml их не видит: этот скрипт идёт в build-cmd после npm run build.
# Только при MEDIA_KARTINKI (его ставит шаг «картинки в хранилище» после удачной закачки public/). Доложил — второй
# проход scripts/media-base.mjs с MEDIA_K_DOLOZHENY=1 ведёт srcset/src /_k/ этих страниц на хранилище.
# Не доложил — предупреждение, /_k/ остаются из dist, как раньше. Без --delete: только докладываем; --checksum (r790).
# dist/_k/ остаётся в dist. Откат — опустошить vars.MEDIA_KARTINKI.
set -uo pipefail
echo "картинки /_k/: $(du -sm dist/_k 2>/dev/null | cut -f1) МБ, $(find dist/_k -type f 2>/dev/null | wc -l) файлов; картинок в dist всего: $(find dist -type f \( -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.png' -o -iname '*.webp' -o -iname '*.avif' -o -iname '*.gif' -o -iname '*.svg' \) | wc -l)"
[ -n "${MEDIA_KARTINKI:-}" ] || { echo "картинки /_k/: выключены (MEDIA_KARTINKI пуст) — из dist"; exit 0; }
[ -d dist/_k ] || { echo "::warning::нет dist/_k — нечего докладывать"; exit 0; }
[ -n "${MEDIA_KLYUCH:-}" ] || { echo "::warning::нет секрета MEDIA_SSH_KEY — картинки /_k/ из dist"; exit 0; }
export S="${RUNNER_TEMP:-/tmp}/ssh-media-k"; (umask 077; mkdir -p "$S"; printf '%s\n' "$MEDIA_KLYUCH" > "$S/media"; printf '%s\n' "$IZVESTNYE" > "$S/known_hosts")
# путь упал — следующий (r833, scripts/prohod-v-rossiyu.sh --)
kod=0; scripts/prohod-v-rossiyu.sh -- bash -c 'rsync -rltz --checksum --delay-updates --chmod=D755,F644 --stats --include="/_k/***" --exclude="*" \
  -e "ssh -i $S/media -o IdentitiesOnly=yes -o StrictHostKeyChecking=yes -o UserKnownHostsFile=$S/known_hosts -o BatchMode=yes -o ConnectTimeout=30 $SSH_MOST" \
  dist/ rcmedia@185.149.145.227: | tail -n 4; exit "${PIPESTATUS[0]}"' || kod=$?
rm -rf "$S"
[ "$kod" = 0 ] || { echo "::warning::картинки /_k/ не доложены в хранилище (rsync $kod) — из dist"; exit 0; }
MEDIA_K_DOLOZHENY=1 node scripts/media-base.mjs --dist dist
