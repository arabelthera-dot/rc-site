#!/usr/bin/env python3
"""Пункт 48 (очередь 0, Р616): досье дня собирает машина до ИИ.

Даёшь музей, дату ММ-ДД и (не обязательно) героев — id записей src/data/slovar.json. Машина собирает
в один файл всё, что уже есть в наших базах по этой дате и этим героям, и печатает это помощнику:

  запись дня src/content/days/<музей>/ММ-ДД.json, утверждённый текст src/data/utverzhdeno/,
  карточку страницы src/content/dni-shablon/, старую страницу src/data/full-pages/,
  проверку источника data/istochniki-yanvar.json, подлинники картинок (пункт 28);
  по герою — запись словаря, карточку справочника (на каких днях уже стоит), ударения (пункт 39),
  второй год data/gody/geroi-goda.json (пункт 11) и дни этого музея, где герой уже упомянут;
  кандидатов data/zapas/zapas.json (пункт 7), материал ~/workspace/knowledge/<музей>-material/ (путь и размер),
  разрешённые базы (пункт 15) — и в конце список, чего в базах нет.

Читает только этот музей — дни других музеев не открывает (Р558). Ничего не пишет в src/ и ничего не
придумывает: досье — выписки с путями, откуда взято. Сборка сайта этот инструмент не зовёт.

Запуск: python3 tools/dosye-dnya.py <музей> <ММ-ДД> [tip:slug …] [--v файл]
"""
import argparse, glob, json, os, re, sys
from datetime import date

KOREN = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ZNANIYA = os.path.expanduser('~/workspace/knowledge')
PAPKA_ZNANIY = {'ne-sdayutsya': 'ns'}  # папка материала в knowledge: ns-material; у прочих — <музей>-material
MESYACY = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']


def zagruzit(put):
    put = f'{KOREN}/{put}'
    return json.load(open(put, encoding='utf-8')) if os.path.exists(put) else None


def korotko(t, n=300):
    t = re.sub(r'\s+', ' ', str(t)).strip()
    return t if len(t) <= n else t[:n].rsplit(' ', 1)[0] + ' …'


def osnovy(zapis):
    """Формы имени для поиска: название, написания и основа фамилии без окончания."""
    slova = {zapis.get('nazvanie', '')} | set(zapis.get('napisaniya', []))
    osn = set()
    for s in filter(None, slova):
        osn.add(s)
        fam = s.split()[-1]
        if len(fam) > 4:
            osn.add(re.sub(r'[аяйоеиыуь]+$', '', fam))
    return sorted(osn, key=len)


def main():
    ap = argparse.ArgumentParser(description='Досье дня из наших баз — до ИИ (пункт 48).')
    ap.add_argument('muzei')
    ap.add_argument('den', help='ММ-ДД')
    ap.add_argument('geroi', nargs='*', help='id записей src/data/slovar.json; без них — из slovar записи дня')
    ap.add_argument('--v', help='записать в файл (не в src/, существующий не перезаписывается)')
    a = ap.parse_args()

    muzei = {m['slug']: m for m in zagruzit('src/data/museums.json')['museums']}
    if a.muzei not in muzei:
        sys.exit(f'нет музея «{a.muzei}» в src/data/museums.json')
    if not re.fullmatch(r'\d\d-\d\d', a.den):
        sys.exit('дата — ММ-ДД')
    mm, dd = map(int, a.den.split('-'))
    try:
        date(2028, mm, dd)
    except ValueError:
        sys.exit(f'нет такого дня: {a.den}')
    m, k = a.muzei, a.den
    mk = f'{m}/{k}'
    slovar = zagruzit('src/data/slovar.json')
    out, net = [], []

    def razdel(z):
        out.append(f'\n## {z}\n')

    den = zagruzit(f'src/content/days/{m}/{k}.json')
    geroi = a.geroi or [s for s in (den or {}).get('slovar', []) if s.split(':')[0] in slovar['_roli']['geroy']['tipy']]
    for g in geroi:
        if g not in slovar:
            sys.exit(f'нет «{g}» в src/data/slovar.json')

    out.append(f'# Досье: {muzei[m]["title_ru"]}, {dd} {MESYACY[mm - 1]}')
    spisok = ', '.join(slovar[g]['nazvanie'] + f' ({g})' for g in geroi) or 'не заданы'
    out.append(f'\nГерои: {spisok}. '
               f'Собрано машиной tools/dosye-dnya.py из баз проекта — выписки, не проверенный текст.')

    razdel(f'Запись дня — src/content/days/{m}/{k}.json')
    if den:
        for p in ('status', 'nomer_dnya', 'title', 'hook', 'god', 'data_sobytiya', 'source', 'slovar', 'slovar_roli'):
            if den.get(p) not in (None, '', [], {}):
                out.append(f'- {p}: {korotko(json.dumps(den[p], ensure_ascii=False) if isinstance(den[p], (list, dict)) else den[p])}')
        for f in den.get('fakty', []):
            out.append(f'- факт: {korotko(f.get("tekst", f) if isinstance(f, dict) else f)}')
        for i in den.get('istochniki', []):
            out.append(f'- источник: {i.get("baza", "")} {i.get("nazvanie", "")} {i.get("ssylka", "")}'.rstrip())
        out.append(f'- картинок: {len(den.get("images", []))}')
    else:
        net.append('записи дня')
        out.append('нет')

    razdel(f'Утверждённый текст — src/data/utverzhdeno/{m}/{k}.json')
    utv = zagruzit(f'src/data/utverzhdeno/{m}/{k}.json')
    if utv:
        out.append(f'- заголовок: {utv.get("zagolovok", "")}')
        for f in utv.get('fakty', []):
            out.append(f'- {f.get("n", "")}. {f.get("zagolovok", "")} — {korotko(f.get("podrobnee", ""), 200)}')
    else:
        net.append('утверждённого текста')
        out.append('нет')

    razdel(f'Карточка страницы — src/content/dni-shablon/{m}/{k}.yaml')
    put = f'{KOREN}/src/content/dni-shablon/{m}/{k}.yaml'
    if os.path.exists(put):
        bylo = set()  # первое вхождение поля — само поле дня; дальше идут источники и соседние дни
        for s in open(put, encoding='utf-8'):
            p = re.match(r'\s*(sobytie|god|h1|hook|nomer_dnya):', s)
            if p and p[1] not in bylo:
                bylo.add(p[1])
                out.append(f'- {s.strip()}')
    else:
        net.append('карточки страницы')
        out.append('нет')

    razdel('Старая страница')
    put = f'src/data/full-pages/{m}/{k}.html'
    out.append(f'- {put}: {os.path.getsize(f"{KOREN}/{put}")} байт' if os.path.exists(f'{KOREN}/{put}') else 'нет')

    razdel('Проверка источника — data/istochniki-yanvar.json')
    ist = (zagruzit('data/istochniki-yanvar.json') or {}).get('dni', {}).get(mk)
    if ist:
        out.append(f'- {ist.get("url")} — ответ {ist.get("kod")}, нашлось {ist.get("naydeno")} из {ist.get("klyuch")}, {ist.get("data")}')
    else:
        out.append('нет записи')

    razdel('Подлинники картинок — src/data/spravochniki/podlinniki.json (пункт 28)')
    pod = [z for z in zagruzit('src/data/spravochniki/podlinniki.json')['zapisi'] if z.get('muzei') == m and z.get('den') == k]
    for z in pod:
        out.append(f'- {z["kartinka"]}. {z["kopiya"]} — {z.get("baza")}, {z.get("otkuda_skachan")}, подлинник: {z.get("podlinnik_gde")}')
    if not pod:
        net.append('подлинников картинок')
        out.append('нет')

    kartochki = zagruzit('src/data/spravochniki/kartochki.json')
    udareniya = zagruzit('src/data/spravochniki/udareniya.json')
    gody = (zagruzit('data/gody/geroi-goda.json') or {}).get('dni', {})
    svoi = sorted(glob.glob(f'{KOREN}/src/data/utverzhdeno/{m}/*.json') + glob.glob(f'{KOREN}/src/content/days/{m}/*.json'))
    for g in geroi:
        z = slovar[g]
        razdel(f'Герой: {z["nazvanie"]} ({g})')
        out.append('- словарь: ' + '; '.join(f'{p}: {v}' for p, v in z.items() if p != 'nazvanie'))
        kart = kartochki.get(g)
        out.append(f'- справочник карточек: на днях {", ".join(kart.get("dni", [])) or "нет"}' if kart else '- справочник карточек: нет')
        if g in udareniya:
            out.append(f'- ударения: {", ".join(udareniya[g]["formy"])}')
        else:
            net.append(f'ударений «{z["nazvanie"]}»')
        vg = [f'{d}: {v}' for d, v in gody.items() if g in json.dumps(v, ensure_ascii=False)]
        out.append(f'- второй год: {"; ".join(vg) if vg else "нет"}')
        osn = osnovy(z)
        gde = []
        for put in svoi:
            t = open(put, encoding='utf-8').read()
            if g in t or any(o in t for o in osn):
                gde.append(os.path.relpath(put, KOREN))
        out.append(f'- упомянут в этом музее ({", ".join(osn)}): {", ".join(gde) if gde else "нигде"}')

    razdel('Кандидаты — data/zapas/zapas.json (пункт 7)')
    kand = (zagruzit('data/zapas/zapas.json') or {}).get('dni', {}).get(mk, [])
    for c in kand:
        out.append(f'- {c.get("god")} — {c.get("imya")}: {korotko(c.get("sobytie", ""), 200)} [{c.get("istochnik", {}).get("baza")} {c.get("istochnik", {}).get("ssylka")}], нашёл {c.get("nashel")}')
    if not kand:
        net.append('кандидатов в запасе')
        out.append('нет')

    razdel('Материал')
    put = f'{ZNANIYA}/{PAPKA_ZNANIY.get(m, m)}-material/{k}.md'
    if os.path.exists(put):
        out.append(f'- {put}: {os.path.getsize(put)} байт — читать целиком')
    else:
        net.append('материала в knowledge')
        out.append('нет')

    razdel('Разрешённые базы — src/data/spravochniki/bazy.json (пункт 15)')
    out.append(', '.join(b['id'] for b in zagruzit('src/data/spravochniki/bazy.json')['razresheny']))

    razdel('Чего в базах нет')
    out.append(', '.join(net) if net else 'всё есть')

    tekst = '\n'.join(out) + '\n'
    if a.v:
        put = os.path.abspath(a.v)
        if put.startswith(f'{KOREN}/src/'):
            sys.exit('в src/ машина не пишет')
        if os.path.exists(put):
            sys.exit(f'{a.v} уже есть — не перезаписываю')
        open(put, 'w', encoding='utf-8').write(tekst)
        print(f'досье: {a.v}', file=sys.stderr)
    else:
        sys.stdout.write(tekst)


if __name__ == '__main__':
    main()
