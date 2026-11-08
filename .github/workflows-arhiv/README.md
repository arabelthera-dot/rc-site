# Архив проверок (Р627, Сергей 08.11.2026)

Снятые проверки. GitHub их не запускает: файлы лежат вне .github/workflows/.
Вернуть проверку — перенести файл обратно в .github/workflows/ (или шаг из proverka-do-r627.yml в proverka.yml)
только со словом Сергея: новая проверка без его «да» не ставится.

mashina-otdelno.yml и list-priemki.yml пока остаются в .github/workflows/: правило ветки main (ruleset main-proverka)
требует их как обязательные, у ключа агента нет прав это снять. Михаил снимет требование (карточка #2376) —
обе переезжают сюда отдельной заявкой.

## Шаги внутри npm run build (снято 08.11.2026, тот же Р627 п.2)

#902 сняла проверки-workflows, но 7 проверок текста остались шагами `npm run build` и роняли сборку любой заявки,
задевшей старый день (#906: ns-zamki на днях НС 09–14 января, которых заявка по смыслу не меняла).
Сняты из build, файлы остаются в scripts/ (ns-konveyer.mjs зовёт ns-zamki сам, вручную):
hook-odno, ns-zamki, dni-tolko-yaml, istochniki-yanvar, proporcii-rolika, avtory-ssylok (+ .test), pervyj-v-mire.
В build остались только база и двигатель: proverka-tls, reestr-rolikov, astro build, versii, canonical-domen (адреса),
media-base, tablica-gotovnosti (отчёт, не роняет). Вернуть шаг — дописать в "build" в package.json, только с «да» Сергея.
