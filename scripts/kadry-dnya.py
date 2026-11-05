#!/usr/bin/env python3
"""Кадры дня по карточке — замок и добор (Р408, Р536 пункт 4; карточка — единственный источник страницы, Р442).

Кадры дня — все «src» картинок карточки src/content/dni-shablon/<музей>/ММ-ДД.yaml: обложка, кадры фактов,
figures (head.og/ld и постер ролика — не кадры дня). Как в мире: повтор кадра ловит перцептивный хеш —
pHash (imagehash, https://github.com/JohannesBuchner/imagehash), Хэмминг ≤ 8 из 64 бит = один кадр.

  zamok ДНИ [--muzei M]   — замок: кадров < 6, повтор по pHash, нет файла, адрес Википедии/Викисклада
                            в карточке — ✗ и код 1. ДНИ — ММ-ДД, ММ-ДД..ММ-ДД или «все».
  zamok --proba            — заведомые пробы: плохие образцы должны упасть, хороший — пройти.
  dobor ДНИ [--zapis]      — дню с кадрами < 6 машина ищет недостающие в Госкаталоге (scripts/fondy/goskatalog.py,
                            запрос — название дня и подпись обложки из карточки календаря и шаблона). Без --zapis —
                            сухой прогон: «добрал бы». С --zapis — качает кадр в public/muzei/<музей>/img/ММ-ДД-goskatalog-ID.jpg
                            (не шире 1600), сверяет pHash с кадрами дня и дописывает в figures карточки.
                            Википедия и Викисклад не запрашиваются (Р90): фонд — только Госкаталог.
Откат — удалить файл и шаг kadry-dnya в .github/workflows/proverka.yml.
"""
import argparse
import io
import json
import re
import sys
import tempfile
from pathlib import Path

import yaml
from PIL import Image
import imagehash

KOREN = Path(__file__).resolve().parents[1]
MIN_KADROV = 6
POROG = 8
VIKI = re.compile(r'wiki(pedia|media)\.org|wikimedia|викисклад|википеди', re.I)
KART = re.compile(r'\.(jpe?g|png|webp|avif)$', re.I)
LICENZIYA = 'цитирование в информационных и учебных целях с указанием автора и источника (ст. 1274 ГК РФ)'


def kadry(karta):
    """[(путь в карточке, src)] — кадры дня без head и video."""
    out = []

    def walk(o, p):
        if isinstance(o, dict):
            for k, v in o.items():
                if k == 'src' and isinstance(v, str) and KART.search(v):
                    out.append((p, v))
                else:
                    walk(v, f'{p}.{k}')
        elif isinstance(o, list):
            for i, v in enumerate(o):
                walk(v, f'{p}[{i}]')
    walk({k: v for k, v in (karta or {}).items() if k not in ('head', 'video')}, '')
    return out


def fail_kadra(src, public):
    return public / src.lstrip('/') if src.startswith('/') else None


def phash(put):
    with Image.open(put) as im:
        return imagehash.phash(im)


def proverit(tekst, public, imya='?'):
    """Список браков карточки (строки). Пусто — день прошёл."""
    brak = []
    for m in sorted({m.group(0) for m in VIKI.finditer(tekst)}):
        brak.append(f'адрес Википедии/Викисклада в карточке: «{m}» (Р90)')
    karta = yaml.safe_load(tekst) or {}
    kk = kadry(karta)
    raznye = list(dict.fromkeys(src for _, src in kk))
    hesh = []
    for src in raznye:
        f = fail_kadra(src, public)
        if f is None or not f.is_file():
            brak.append(f'нет файла кадра {src}')
            continue
        try:
            hesh.append((src, phash(f)))
        except Exception as e:
            brak.append(f'кадр не читается {src}: {type(e).__name__}')
    povtory = set()
    for i, (a, ha) in enumerate(hesh):
        for b, hb in hesh[i + 1:]:
            if ha - hb <= POROG:
                povtory.add(b)
                brak.append(f'повтор кадра: {Path(b).name} = {Path(a).name} (pHash, Хэмминг {ha - hb} ≤ {POROG})')
    for src in dict.fromkeys(s for s in (src for _, src in kk)):
        n = sum(1 for _, s in kk if s == src)
        if n > 1:
            brak.append(f'повтор кадра: {Path(src).name} стоит в карточке {n} раза')
    n = len(hesh) - len(povtory)
    if n < MIN_KADROV:
        brak.append(f'разных кадров {n} < {MIN_KADROV} — добор: python3 scripts/kadry-dnya.py dobor {imya} --zapis')
    return brak, n


def dni_iz(argi, papka):
    if not argi or argi == ['все']:
        return sorted(p.stem for p in papka.glob('*.yaml'))
    out = []
    for a in argi:
        m = re.fullmatch(r'(\d\d)-(\d\d)(?:\.\.(\d\d)-(\d\d))?', a)
        if not m:
            sys.exit(f'ОСТАНОВ: день — ММ-ДД или ММ-ДД..ММ-ДД, а не {a}')
        out += [f'{m[1]}-{d:02d}' for d in range(int(m[2]), int(m[4] or m[2]) + 1)]
    return out


def zamok(a):
    papka = KOREN / 'src/content/dni-shablon' / a.muzei
    public = KOREN / 'public'
    plohih = 0
    for d in dni_iz(a.dni, papka):
        f = papka / f'{d}.yaml'
        if not f.exists():
            print(f'  {d}: карточки нет — пропуск')
            continue
        brak, n = proverit(f.read_text(encoding='utf-8'), public, d)
        print(f'{"✗" if brak else "✓"} {a.muzei} {d}: разных кадров {n}' + ''.join(f'\n    ✗ {b}' for b in brak))
        plohih += bool(brak)
    if plohih:
        print(f'ОСТАНОВ: {plohih} дн. с браком кадров (Р408, Р90)')
    return 1 if plohih else 0


def proba():
    """Заведомые пробы на синтетических картинках: плохие — красные, хороший — зелёный."""
    import numpy as np
    with tempfile.TemporaryDirectory() as t:
        pub = Path(t)
        (pub / 'img').mkdir()
        rng = np.random.default_rng(7)
        for i in range(7):
            Image.fromarray((rng.random((64, 64)) * 255).astype('uint8')).resize((256, 256)).save(pub / f'img/k{i}.jpg')
        Image.open(pub / 'img/k0.jpg').resize((240, 240)).save(pub / 'img/k0-kopiya.jpg', quality=70)

        def karta(srcs, dop=''):
            return yaml.safe_dump({'oblozhka': {'src': srcs[0]}, 'figures': [{'src': s} for s in srcs[1:]]},
                                  allow_unicode=True) + dop
        k = [f'/img/k{i}.jpg' for i in range(6)]
        sluchai = [
            ('хороший: 6 разных кадров', karta(k), False),
            ('5 кадров', karta(k[:5]), True),
            ('повтор кадра (тот же снимок, другой размер)', karta(k[:5] + ['/img/k6.jpg', '/img/k0-kopiya.jpg']), True),
            ('тот же файл дважды', karta(k + [k[1]]), True),
            ('адрес Викисклада', karta(k, 'sources:\n  - html: https://upload.wikimedia.org/x.jpg\n'), True),
            ('адрес Википедии', karta(k, 'sources:\n  - html: https://ru.wikipedia.org/wiki/X\n'), True),
            ('нет файла', karta(k[:5] + ['/img/net.jpg']), True),
        ]
        zhdali = 0
        for imya, tekst, plohoy in sluchai:
            brak, _ = proverit(tekst, pub)
            ok = bool(brak) == plohoy
            zhdali += not ok
            print(f'  {"✓" if ok else "✗ ПРОБА НЕ ПРОШЛА"} {imya}: {"красный" if brak else "зелёный"}')
    print('пробы kadry-dnya: ' + ('все как ждали' if not zhdali else f'{zhdali} не как ждали'))
    return 1 if zhdali else 0


def dopisat_figures(tekst, novye):
    """Дописать кадры в конец списка figures, не трогая остальной текст карточки."""
    blok = ''.join('    ' + s if i else '  - ' + s for k in novye
                   for i, s in enumerate(yaml.safe_dump(k, allow_unicode=True, sort_keys=False, width=10 ** 6).splitlines(True)))
    m = re.search(r'^figures:[ \t]*(\[\])?[ \t]*\n', tekst, re.M)
    if not m:
        return tekst.rstrip('\n') + '\nfigures:\n' + blok
    sled = re.compile(r'^\S', re.M).search(tekst, m.end())
    konec = sled.start() if sled else len(tekst)
    return tekst[:m.start()] + 'figures:\n' + tekst[m.end():konec] + blok + tekst[konec:]


def nazvanie(o):
    return re.sub(r'\s+', ' ', o.get('name') or '').strip()


# Кадр «в честь»: улица, колхоз, завод, номер дома имени героя — не кадр события.
V_CHEST = re.compile(r'\b(ул\.|улиц|проспект|переул|площад[ьи] им|им\.|имени|колхоз|совхоз|артел|квартал|номер дома)', re.I)
STOP = {'которые', 'потому', 'только', 'после', 'перед', 'всего', 'когда', 'чтобы', 'между', 'через', 'русские', 'сдаются'}


def osnovy(tekst):
    """Основы слов (первые 5 букв слов от 5 букв) — мерка совпадения кадра с днём."""
    return {w[:5] for w in re.findall(r'[а-яё]{5,}', str(tekst or '').lower().replace('ё', 'е')) if w not in STOP}


def opis_dnya(muzei, d, karta):
    kal = KOREN / 'src/content/days' / muzei / f'{d}.json'
    k = json.loads(kal.read_text(encoding='utf-8')) if kal.exists() else {}
    imya = (karta.get('kroshka') or '').split('·')[-1].strip()
    podpis = (karta.get('oblozhka') or {}).get('podpis') or ''
    tekst = ' '.join(str(k.get(x) or '') for x in ('title', 'hook', 'mechanic', 'gist', 'source')) + f' {imya} {podpis}'
    glavnoe = k.get('title') or imya
    # Имена собственные (с заглавной не в начале фразы, в кавычках «…») — уточнение запроса: «челюскинцы Шмидта».
    imena = [w for w in re.findall(r'(?<![.!?—]\s)(?<=[\s«"])([А-ЯЁ][а-яё]{3,})', tekst) if w[:5].lower() not in osnovy(glavnoe)]
    q = [glavnoe, imya, podpis] + [f'{glavnoe} {w}' for w in dict.fromkeys(imena)][:4]
    return [x.strip()[:120] for x in dict.fromkeys(q) if x and x.strip()], osnovy(tekst)


def ochki(o, osn):
    """Сколько основ дня в названии кадра; кадр «в честь» — 0."""
    nazv = nazvanie(o)
    return 0 if V_CHEST.search(nazv) else len(osnovy(nazv) & osn)


def dobor(a):
    sys.path.insert(0, str(KOREN / 'scripts/fondy'))
    import goskatalog as gk
    papka = KOREN / 'src/content/dni-shablon' / a.muzei
    public = KOREN / 'public'
    img = public / 'muzei' / a.muzei / 'img'
    dni = dni_iz(a.dni, papka)
    zakryto = 0
    for d in dni:
        f = papka / f'{d}.yaml'
        tekst = f.read_text(encoding='utf-8') if f.exists() else ''
        karta = yaml.safe_load(tekst) or {} if tekst else {}
        brak, n = proverit(tekst, public, d) if tekst else ([], 0)
        nado = max(0, MIN_KADROV - n)
        if not nado:
            print(f'✓ {d}: кадров {n} — добирать не нужно')
            zakryto += 1
            continue
        uzhe = set(re.findall(r'collections\?id=(\d+)', tekst)) | set(re.findall(r'goskatalog-(\d+)\.', tekst))
        q, osn = opis_dnya(a.muzei, d, karta)
        nashli = []
        for s in q:
            for o in gk._safe(s, 30):
                im = (o.get('mainImage') or {}).get('id')
                if not im or str(o['id']) in uzhe or str(im) in uzhe or VIKI.search(json.dumps(o, ensure_ascii=False)):
                    continue
                uzhe |= {str(o['id']), str(im)}
                if ochki(o, osn) >= 2:   # два совпадения с днём: «челюскин» + «лагерь/Шмидт/лётчик…»
                    nashli.append((s, o))
        nashli.sort(key=lambda x: -ochki(x[1], osn))
        vzyali = []
        if a.zapis and f.exists():
            heshi = [phash(fail_kadra(s, public)) for s in dict.fromkeys(x for _, x in kadry(karta))
                     if fail_kadra(s, public) and fail_kadra(s, public).is_file()]
            for s, o in nashli:
                if len(vzyali) >= nado:
                    break
                im = o['mainImage']['id']
                try:
                    r = gk._set.zapros(gk._S, 'GET', f'{gk.GK}/muzfo-imaginator/rest/images/original/{im}',
                                       timeout=60, proxy=gk._kadr.ru_proxy())
                    r.raise_for_status()
                    kadr = Image.open(io.BytesIO(r.content)).convert('RGB')
                except Exception as e:
                    print(f'    {d}: кадр {im} не скачан — {type(e).__name__}', file=sys.stderr)
                    continue
                h = imagehash.phash(kadr)
                if any(h - x <= POROG for x in heshi):
                    continue
                if kadr.width > 1600:
                    kadr = kadr.resize((1600, round(kadr.height * 1600 / kadr.width)))
                put = img / f'{d}-goskatalog-{im}.jpg'
                kadr.save(put, quality=85)
                heshi.append(h)
                avt = ', '.join(x.get('name', '') for x in o.get('authors') or [] if isinstance(x, dict))
                nazv = nazvanie(o).rstrip('.')
                vzyali.append({'src': f'/muzei/{a.muzei}/img/{put.name}', 'alt': f'Кадр из музейного фонда: {nazv}'[:200],
                               'data_source': f'{gk.GK}/portal/#/collections?id={o["id"]}', 'license': LICENZIYA,
                               'podpis': f'{nazv}.',
                               'credit': f'{avt + ". " if avt else ""}Хранится: {gk.muzey(o.get("museumId"))}. Госкаталог № {o["id"]}',
                               'width': kadr.width, 'height': kadr.height})
            if vzyali:
                f.write_text(dopisat_figures(tekst, vzyali), encoding='utf-8')
        mozhno = min(nado, len(vzyali) if a.zapis else len(nashli))
        ok = n + mozhno >= MIN_KADROV
        zakryto += ok
        glag = 'добрал' if a.zapis else 'добрал бы'
        print(f'{"✓" if ok else "✗"} {d}: кадров {n}, нужно ещё {nado}, кандидатов в Госкаталоге {len(nashli)} — {glag} {mozhno}'
              + ('' if f.exists() else ' (карточки нет — запись после карточки)')
              + ''.join(f'\n    · «{s}» → {o["id"]}: {nazvanie(o)[:90]}' for s, o in nashli[:nado]))
    print(f'итог: {"добрал" if a.zapis else "добрал бы"} {zakryto} из {len(dni)} (день закрыт = кадров ≥ {MIN_KADROV})')
    return 0


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument('deystvie', choices=['zamok', 'dobor'])
    p.add_argument('dni', nargs='*')
    p.add_argument('--muzei', default='ne-sdayutsya')
    p.add_argument('--proba', action='store_true')
    p.add_argument('--zapis', action='store_true')
    a = p.parse_args()
    if a.deystvie == 'zamok':
        return proba() if a.proba else zamok(a)
    return dobor(a)


if __name__ == '__main__':
    sys.exit(main())
