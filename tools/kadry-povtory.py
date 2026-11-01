#!/usr/bin/env python3
"""Кадры дня: сколько разных, где повторы, сколько портретов (Р408, museum-page-production п. 2-тер).

По собранным страницам дней (dist/muzei/<музей>/den/<день>/index.html) для каждого дня считает:
  - кадры тела — все <img> страницы, кроме обложки (figure.hero-fig) и служебных блоков
    (игра, викторина, календарь, «куда дальше», шапка, подвал);
  - повторы — перцептивный хеш (pHash, библиотека imagehash), расстояние Хэмминга ≤ 8 = один кадр
    (обложка тоже участвует: тот же кадр в теле — повтор обложки);
  - портреты — на кадре найдено лицо (каскад Хаара OpenCV, лицо ≥ 3 % площади кадра) или в alt слово «портрет».
Мерка: разных кадров в теле ≥ 6, портретов ≤ трети тела, повторов 0.

Только отчёт: код выхода всегда 0 (правило «новых замков нет»). Откат — удалить файл и шаг в proverka.yml.

  python3 tools/kadry-povtory.py dist                       # все музеи, таблица в stdout
  python3 tools/kadry-povtory.py dist --muzei izobreteniya --den 01-05 --podrobno
  python3 tools/kadry-povtory.py dist --json /tmp/kadry.json
"""
import argparse
import html.parser
import json
import os
import sys

POROG = 8          # Хэмминг для pHash 64 бит: ≤ 8 — один кадр
MIN_RAZNYH = 6
DOLYA_PORTRETOV = 1 / 3
DOLYA_LICA = 0.03

# Блоки, кадры которых в тело не идут.
SLUZHEBNYE_ID = {'games', 'game', 'quiz', 'calendar', 'kuda-dalshe', 'result'}
SLUZHEBNYE_TEGI = {'header', 'footer', 'nav'}
SLUZHEBNYE_KLASSY = {'igra', 'kd'}
PUSTYE = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr'}


class Razbor(html.parser.HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stek = []       # (тег, служебный?, обложка?)
        self.kadry = []      # dict(src, alt, oblozhka)

    def handle_starttag(self, teg, attrs):
        a = dict(attrs)
        klassy = set((a.get('class') or '').split())
        if teg == 'img':
            sluzh = any(s for _, s, _ in self.stek)
            obl = any(o for _, _, o in self.stek)
            if not sluzh and a.get('src'):
                self.kadry.append({'src': a['src'], 'alt': a.get('alt') or '', 'oblozhka': obl})
            return
        if teg in PUSTYE:
            return
        sluzh = teg in SLUZHEBNYE_TEGI or a.get('id') in SLUZHEBNYE_ID or bool(klassy & SLUZHEBNYE_KLASSY)
        obl = teg == 'figure' and 'hero-fig' in klassy
        self.stek.append((teg, sluzh, obl))

    def handle_endtag(self, teg):
        for i in range(len(self.stek) - 1, -1, -1):
            if self.stek[i][0] == teg:
                del self.stek[i:]
                return


class Glaz:
    """Хеш и лицо по файлу; один файл на многих страницах считается один раз."""

    def __init__(self, koren, zapas):
        from PIL import Image  # noqa: F401
        import imagehash  # noqa: F401
        self.koren, self.zapas, self.kesh = koren, zapas, {}
        try:
            import cv2
            self.cv2 = cv2
            self.kaskad = cv2.CascadeClassifier(os.path.join(cv2.data.haarcascades, 'haarcascade_frontalface_default.xml'))
        except Exception:
            self.cv2 = None
            print('kadry-povtory: OpenCV нет — портреты только по alt', file=sys.stderr)

    def put(self, src):
        s = src.split('?')[0].split('#')[0]
        if s.startswith(('http://', 'https://', '//', 'data:')):
            return None
        for k in (self.koren, self.zapas):
            if k:
                p = os.path.join(k, s.lstrip('/'))
                if os.path.isfile(p):
                    return p
        return None

    def __call__(self, src):
        p = self.put(src)
        if p is None:
            return None
        if p in self.kesh:
            return self.kesh[p]
        from PIL import Image
        import imagehash
        try:
            im = Image.open(p)
            im.load()
            im = im.convert('RGB')
        except Exception:
            self.kesh[p] = None
            return None
        h = imagehash.phash(im)
        lico = 0.0
        if self.cv2 is not None:
            import numpy as np
            m = im.copy()
            m.thumbnail((640, 640))
            g = self.cv2.cvtColor(np.asarray(m), self.cv2.COLOR_RGB2GRAY)
            mn = max(24, min(g.shape) // 10)
            lica = self.kaskad.detectMultiScale(g, scaleFactor=1.1, minNeighbors=10, minSize=(mn, mn))
            if len(lica):
                lico = float(max(w * hh for (_, _, w, hh) in lica)) / float(g.shape[0] * g.shape[1])
        self.kesh[p] = {'hash': h, 'lico': lico}
        return self.kesh[p]


def den(put_html, glaz):
    r = Razbor()
    with open(put_html, encoding='utf-8') as f:
        r.feed(f.read())
    vse, propal = [], []
    for k in r.kadry:
        g = glaz(k['src'])
        if g is None:
            propal.append(k['src'])
            continue
        portret = bool(g['lico'] >= DOLYA_LICA or 'портрет' in k['alt'].lower())
        vse.append(dict(k, hash=g['hash'], portret=portret, lico=round(g['lico'], 3)))
    # Повторы: первый кадр гнезда — подлинник, остальные близкие к нему — повторы.
    povtory = []
    for i, k in enumerate(vse):
        for j in range(i):
            if 'povtor_of' in vse[j]:
                continue
            d = k['hash'] - vse[j]['hash']
            if d <= POROG:
                k['povtor_of'], k['hamming'] = vse[j]['src'], d
                povtory.append((k['src'], vse[j]['src'], d))
                break
    telo = [k for k in vse if not k['oblozhka']]
    raznye = [k for k in telo if 'povtor_of' not in k]
    portrety = [k for k in telo if k['portret']]
    flagi = []
    if len(raznye) < MIN_RAZNYH:
        flagi.append(f'разных<{MIN_RAZNYH}')
    if telo and len(portrety) > len(telo) * DOLYA_PORTRETOV:
        flagi.append('портретов>1/3')
    if povtory:
        flagi.append('повторы')
    if propal:
        flagi.append('нет файла')
    return {
        'telo': len(telo), 'raznyh': len(raznye), 'portretov': len(portrety), 'povtorov': len(povtory),
        'oblozhka': next((k['src'] for k in vse if k['oblozhka']), None),
        'povtory': [{'kadr': a, 'kak': b, 'hamming': d} for a, b, d in povtory],
        'portrety': [k['src'] for k in portrety], 'net_fajla': propal, 'flagi': flagi,
        'kadry': [{'src': k['src'], 'oblozhka': k['oblozhka'], 'portret': k['portret'], 'lico': k['lico'],
                   'phash': str(k['hash']), 'povtor_of': k.get('povtor_of')} for k in vse],
    }


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('dist', nargs='?', default='dist')
    ap.add_argument('--public', default='public', help='запасной корень файлов картинок')
    ap.add_argument('--muzei', action='append', help='только этот музей (можно несколько раз)')
    ap.add_argument('--den', action='append', help='только этот день, например 01-05')
    ap.add_argument('--json', help='записать полный отчёт в файл')
    ap.add_argument('--podrobno', action='store_true', help='под таблицей — повторы и портреты по файлам')
    ap.add_argument('--svod', help='дописать в файл свод по музеям (для $GITHUB_STEP_SUMMARY)')
    a = ap.parse_args()

    koren = os.path.join(a.dist, 'muzei')
    if not os.path.isdir(koren):
        print(f'kadry-povtory: нет {koren} — сначала npm run build; отчёт пропущен')
        return 0
    glaz = Glaz(a.dist, a.public)
    otchet = {}
    for m in sorted(os.listdir(koren)):
        if a.muzei and m not in a.muzei:
            continue
        dd = os.path.join(koren, m, 'den')
        if not os.path.isdir(dd):
            continue
        for d in sorted(os.listdir(dd)):
            if a.den and d not in a.den:
                continue
            p = os.path.join(dd, d, 'index.html')
            if os.path.isfile(p):
                otchet[f'{m}/{d}'] = den(p, glaz)

    plohie = {k: v for k, v in otchet.items() if v['flagi']}
    print(f'## Кадры дней (Р408): {len(otchet)} дней, по мерке {len(otchet) - len(plohie)}, '
          f'с замечанием {len(plohie)} — только отчёт, заявку не роняет\n')
    print(f'Мерка: разных в теле ≥ {MIN_RAZNYH}; портретов ≤ 1/3 тела; повтор = pHash, Хэмминг ≤ {POROG}.\n')
    print('| день | в теле | разных | портретов | повторов | замечание |')
    print('|---|---|---|---|---|---|')
    for k, v in otchet.items():
        if v['flagi'] or a.den:
            print(f"| {k} | {v['telo']} | {v['raznyh']} | {v['portretov']} | {v['povtorov']} | {', '.join(v['flagi'])} |")
    if a.podrobno:
        for k, v in otchet.items():
            for p in v['povtory']:
                print(f"- {k}: повтор {p['kadr']} ≈ {p['kak']} (Хэмминг {p['hamming']})")
            for p in v['portrety']:
                print(f'- {k}: портрет {p}')
            for p in v['net_fajla']:
                print(f'- {k}: нет файла {p}')
    if a.svod:
        muz = {}
        for k, v in otchet.items():
            m = muz.setdefault(k.split('/')[0], [0, 0, 0, 0, 0])
            m[0] += 1
            m[1] += not v['flagi']
            m[2] += f'разных<{MIN_RAZNYH}' in v['flagi']
            m[3] += 'портретов>1/3' in v['flagi']
            m[4] += 'повторы' in v['flagi']
        with open(a.svod, 'a', encoding='utf-8') as f:
            f.write(f'## Кадры дней (Р408, tools/kadry-povtory.py) — только отчёт, заявку не роняет\n\n'
                    f'Мерка: разных в теле ≥ {MIN_RAZNYH}; портретов ≤ 1/3 тела; повтор = pHash, Хэмминг ≤ {POROG}. '
                    f'Дни по отдельности — в журнале шага.\n\n'
                    '| музей | дней | по мерке | разных<6 | портретов>1/3 | с повторами |\n|---|---|---|---|---|---|\n')
            for m, c in muz.items():
                f.write(f'| {m} | ' + ' | '.join(map(str, c)) + ' |\n')
    if a.json:
        with open(a.json, 'w', encoding='utf-8') as f:
            json.dump(otchet, f, ensure_ascii=False, indent=1)
    return 0


if __name__ == '__main__':
    try:
        sys.exit(main())
    except Exception as e:  # отчёт не роняет заявку ни при какой ошибке
        print(f'kadry-povtory: отчёт не снят — {type(e).__name__}: {e}')
        sys.exit(0)
