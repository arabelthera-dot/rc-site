#!/usr/bin/env python3
"""Справочники стандарта дня: пункт 15 (источник-запись, закрытый список баз) и пункт 28 (подлинник картинки).

  python3 tools/spravochniki.py bazy                      — собрать src/data/spravochniki/bazy.json из общего реестра sources.json
  python3 tools/spravochniki.py istochnik zapis.json      — проверить запись источника (поля и база из списка)
  python3 tools/spravochniki.py podlinnik <музей> <ММ-ДД> <номер картинки>... [--public ~/rc-site/public]
                                                          — дописать запись подлинника в src/data/spravochniki/podlinniki.json
Картинки и подлинники скрипт не качает: только считает отпечаток копии и пишет, где лежит подлинник.
"""
import hashlib, json, re, struct, sys
from pathlib import Path

KOREN = Path(__file__).resolve().parent.parent
SPR = KOREN / 'src/data/spravochniki'
REESTR = Path.home() / 'projects/russian-civilization/docs/registries/sources.json'
# Р90 — вычеркнуты; иноагенты и запрещённые — через src/lib/zakon.mjs; чужие страны — не наши базы
ZAPRET = {'commons': 'Р90', 'wikidata': 'Р90', 'europeana': 'не российская и не белорусская',
          'lab_data_ladson': 'не российская и не белорусская'}
ZAPRET_ADRES = re.compile(r'wiki(pedia|media|data|source)|kasparov|facebook\.com|instagram\.com', re.I)
# Р469: белорусские музеи — союзники; в реестре sources.json их пока нет
BELARUS = [{'id': 'warmuseum_by', 'name': 'Белорусский государственный музей истории Великой Отечественной войны',
            'url': 'https://www.warmuseum.by/', 'strana': 'Беларусь', 'osnovanie': 'Р469'}]
# Р676: виды источника, у которых нет одной базы в реестре (книга, статья, сайт музея или архива) — те же id, что
# раньше были руками в BAZY src/lib/forma-dnya.mjs; теперь BAZY читается из bazy.json, список один
OBSHCHIE = [('muzej-rf', 'Сайт российского музея'), ('muzej-by', 'Сайт белорусского музея'),
            ('arhiv-rf', 'Российский архив'), ('arhiv-by', 'Белорусский архив'),
            ('biblioteka-rf', 'Российская библиотека'), ('biblioteka-by', 'Белорусская библиотека'),
            ('kniga', 'Книга'), ('periodika', 'Газета или журнал'), ('gosorgan-rf', 'Сайт российского госоргана'),
            ('gosorgan-by', 'Сайт белорусского госоргана'), ('nauka', 'Научная статья или издание'),
            ('sajt-organizacii', 'Сайт организации')]
POLYA = {'n': int, 'baza': str, 'nazvanie': str, 'ssylka': str}
POLYA_MOZHNO = {'avtor': str, 'god': (int, str), 'nomer_v_baze': str, 'stranica': str, 'provereno': str}


def bazy():
    d = json.loads(REESTR.read_text())
    da, vycherknuto = [], []
    for x in d['sources']:
        if x['id'] in ZAPRET or ZAPRET_ADRES.search(x.get('url', '')):
            vycherknuto.append({'id': x['id'], 'name': x['name'], 'pochemu': ZAPRET.get(x['id'], 'Р90')})
            continue
        da.append({'id': x['id'], 'name': x['name'], 'url': x.get('url', ''), 'strana': 'Россия',
                   'status': x.get('status'), 'proveren': x.get('checked')})
    da += BELARUS
    da += [{'id': i, 'name': n, 'url': '', 'strana': 'Беларусь' if i.endswith('-by') else 'Россия', 'vid': 'obshchij',
            'osnovanie': 'Р676'} for i, n in OBSHCHIE]
    out = {'_chto': 'Закрытый список баз для поля «baza» источника (пункт 15). Собран tools/spravochniki.py bazy '
                    'из ~/projects/russian-civilization/docs/registries/sources.json; руками не править — добавлять базу в реестр.',
           'razresheny': da, 'vycherknuty': vycherknuto}
    (SPR / 'bazy.json').write_text(json.dumps(out, ensure_ascii=False, indent=1) + '\n')
    print(f'разрешено {len(da)}, вычеркнуто {len(vycherknuto)}: ' + ', '.join(v['id'] for v in vycherknuto))


def proverit_istochnik(z, ids):
    oshibki = []
    for k, t in POLYA.items():
        if not isinstance(z.get(k), t) or z.get(k) in ('', None):
            oshibki.append(f'нет поля {k}')
    for k in z:
        if k not in POLYA and k not in POLYA_MOZHNO:
            oshibki.append(f'лишнее поле {k}')
    if z.get('baza') and z['baza'] not in ids:
        oshibki.append(f'база «{z["baza"]}» не из списка bazy.json')
    if ZAPRET_ADRES.search(str(z.get('ssylka', ''))):
        oshibki.append('ссылка на вычеркнутый источник (Р90)')
    return oshibki


def istochnik(put):
    ids = {b['id'] for b in json.loads((SPR / 'bazy.json').read_text())['razresheny']}
    zapisi = json.loads(Path(put).read_text())
    zapisi = zapisi if isinstance(zapisi, list) else [zapisi]
    vsego = 0
    for z in zapisi:
        o = proverit_istochnik(z, ids)
        vsego += len(o)
        for s in o:
            print(f'источник {z.get("n")}: {s}')
    print('ошибок:', vsego)
    sys.exit(1 if vsego else 0)


def razmer(b):
    if b[:8] == b'\x89PNG\r\n\x1a\n':
        return struct.unpack('>II', b[16:24])
    i = 2
    while i < len(b) - 9:
        if b[i] != 0xFF:
            i += 1; continue
        m = b[i + 1]
        if m in (0xC0, 0xC1, 0xC2):
            h, w = struct.unpack('>HH', b[i + 5:i + 9]); return w, h
        i += 2 + struct.unpack('>H', b[i + 2:i + 4])[0]
    return None, None


def podlinnik(muzei, den, nomera, public):
    day = json.loads((KOREN / f'src/content/days/{muzei}/{den}.json').read_text())
    ids = {b['id'] for b in json.loads((SPR / 'bazy.json').read_text())['razresheny']}
    put = SPR / 'podlinniki.json'
    vse = json.loads(put.read_text()) if put.exists() else {'_chto': 'Подлинники картинок (пункт 28), одна запись на картинку.', 'zapisi': []}
    for n in nomera:
        im = day['images'][n - 1]
        b = (Path(public) / im['src']).read_bytes()
        w, h = razmer(b)
        cr = im.get('credit', '')
        baza = (re.search(r'\[([a-z_]+)\]', cr) or [None, None])[1]
        adres = (re.search(r'https?://\S+?(?=[.,;]?(\s|$))', cr) or [None])[0]
        z = {'kopiya': im['src'], 'muzei': muzei, 'den': den, 'kartinka': n,
             'kopiya_sha256': hashlib.sha256(b).hexdigest(), 'kopiya_bayt': len(b), 'kopiya_px': [w, h],
             'baza': baza, 'otkuda_skachan': adres,
             'podlinnik_gde': 'u_istochnika', 'podlinnik_fayl': None, 'podlinnik_sha256': None}
        z['oshibki'] = [s for s, ne in (('база не из списка', baza not in ids), ('нет адреса, откуда скачан', not adres)) if ne]
        vse['zapisi'] = [x for x in vse['zapisi'] if x['kopiya'] != z['kopiya']] + [z]
        print(json.dumps(z, ensure_ascii=False))
    put.write_text(json.dumps(vse, ensure_ascii=False, indent=1) + '\n')


if __name__ == '__main__':
    a = sys.argv[1:]
    if a[:1] == ['bazy']:
        bazy()
    elif a[:1] == ['istochnik']:
        istochnik(a[1])
    elif a[:1] == ['podlinnik']:
        pub = a[a.index('--public') + 1] if '--public' in a else str(Path.home() / 'rc-site/public')
        nom = [int(x) for x in a[3:] if x.isdigit()]
        podlinnik(a[1], a[2], nom, pub)
    else:
        print(__doc__)
