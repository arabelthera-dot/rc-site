#!/usr/bin/env python3
"""Люди словаря: латиница из авторитетной записи (п.38) и годы жизни неточной датой EDTF по двум стилям (п.35).

  python3 tools/spravochniki/imena.py svyazat <slug> loc:<id>|viaf:<id>  — записать человеку ид авторитетной записи
  python3 tools/spravochniki/imena.py                                    — заполнить latinica, latinica_iz, gody у всех lyudi

Латиница: заголовок LoC, если он без знаков ALA-LC (Benois, Chagall, Kandinsky); иначе форма из англоязычного
справочника в сноске (Britannica, Grove, ULAN) или вариант 4XX без знаков, чья фамилия встречается в сносках
(Aivazovsky); иначе — BGN/PCGN от русского имени. Записи LoC нет — VIAF (viaf.org, SRU); нет и её — BGN/PCGN,
годы не пишутся.
Сноски из Википедии/Викиданных (Р90) не считаются: день, подтверждённый только ими, обрезается до года.
Дата до 14.02.1918 с точностью до дня пишется в двух стилях, только если стиль доказан сносками
(«12 (24) May 1830», «Sept. 9(20), 1778», «May 4 [April 21, old style]» или обе даты порознь); иначе — только год.
"""
import json, re, sys, time, unicodedata, urllib.parse, urllib.request
from datetime import date, timedelta
from pathlib import Path

KOREN = Path(__file__).resolve().parents[2]
SLOVAR = KOREN / 'src/data/slovar.json'
KESH = Path.home() / '.cache/rc-imena'
M = 'http://www.loc.gov/mads/rdf/v1#'
VIKI = re.compile(r'wiki|vikiped', re.I)
SPRAVKA = re.compile(r'Brit|Grove|ULAN|Getty|Benezit|Columbia', re.I)
MES = {m: i + 1 for i, ms in enumerate(['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'])
       for m in [ms]}
MR = r'(Jan|Feb|Mar|Apr|May|June?|July?|Aug|Sept?|Oct|Nov|Dec)[a-z]*\.?'
GREG = date(1918, 2, 14)


def zapros(u):
    for i in range(3):
        try:
            return urllib.request.urlopen(urllib.request.Request(u, headers={'User-Agent': 'rc-site slovar/1.0',
                                                                             'Accept': 'application/json'}), timeout=60).read()
        except Exception as e:
            oshibka = e; time.sleep(3)
    raise oshibka


def loc(i):
    p = KESH / f'{i}.json'
    if not p.exists():
        KESH.mkdir(parents=True, exist_ok=True)
        p.write_bytes(zapros(f'https://id.loc.gov/authorities/names/{i}.madsrdf.json'))
    return json.loads(p.read_text())


def viaf(i, imya):
    p = KESH / f'viaf-{i}.json'
    if not p.exists():
        q = urllib.parse.quote(f'local.personalNames all "{imya}"')
        r = json.loads(zapros(f'https://viaf.org/viaf/search?maximumRecords=10&httpAccept=application/json&query={q}'))
        recs = r['searchRetrieveResponse']['records']['record']
        for x in recs if isinstance(recs, list) else [recs]:
            cl = x['recordData'].get('ns2:VIAFCluster', {})
            if str(cl.get('ns2:viafID')) == i:
                KESH.mkdir(parents=True, exist_ok=True); p.write_text(json.dumps(cl, ensure_ascii=False)); break
        else:
            raise SystemExit(f'VIAF {i}: кластер не найден поиском «{imya}»')
    return json.loads(p.read_text())


def bez_znakov(s):
    s = s.replace('ʹ', '').replace('ʺ', '').replace('︠', '').replace('︡', '')
    return ''.join(c for c in unicodedata.normalize('NFD', s) if not unicodedata.combining(c))


TR = dict(zip('абвгдзийклмнопрстуфыэ', 'abvgdziyklmnoprstufye'))
TR.update({'ж': 'zh', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch', 'ю': 'yu', 'я': 'ya', 'ё': 'yo',
           'ъ': '', 'ь': ''})


def translit(s):
    """BGN/PCGN без диакритики: е → ye в начале слова и после гласной, ь, ъ."""
    out, pred = [], ''
    for c in s:
        n = c.lower()
        t = ('ye' if (not pred.isalpha() or pred in 'аеёиоуыэюяьъ') else 'e') if n == 'е' else TR.get(n, c)
        out.append(t.capitalize() if c != n and t else t)
        pred = n
    return ''.join(out)


def iz_dvuh(d, smeshchenie):
    return d - timedelta(days=smeshchenie)


def julian(d):
    """Разница григорианского и юлианского календарей на дату d (по юлианскому счёту столетий)."""
    v = d.year if (d.month, d.day) > (2, 28) else d.year - 1
    return v // 100 - v // 400 - 2


def daty_snosok(g):
    """Пары (старый, новый) и одиночные даты из сносок 670, кроме вики-сносок."""
    pary, odin = [], []
    for n in g:
        if VIKI.search(' '.join(x.get('@value', '') for x in n.get(M + 'citationSource', []))):
            continue
        for x in n.get(M + 'citationNote', []):
            t = x.get('@value', '')
            def D(y, m, d):
                try: return date(int(y), MES[m.lower()[:3]] if not str(m).isdigit() else int(m), int(d))
                except ValueError: return None
            for a in re.finditer(r'(\d{1,2}) ?\((\d{1,2})\) ' + MR + r',? (\d{4})', t):
                pary.append((D(a[4], a[3], a[1]), D(a[4], a[3], a[2])))
            for a in re.finditer(r'(\d{1,2}) ' + MR + r' ?\((\d{1,2}) ' + MR + r'\),? (\d{4})', t):
                pary.append((D(a[5], a[2], a[1]), D(a[5], a[4], a[3])))
            for a in re.finditer(MR + r' (\d{1,2}) ?[(/](\d{1,2})\)?,? (\d{4})', t):
                pary.append((D(a[4], a[1], a[2]), D(a[4], a[1], a[3])))
            for a in re.finditer(MR + r' (\d{1,2}) ?\(' + MR + r' (\d{1,2})\),? (\d{4})', t):
                pary.append((D(a[5], a[1], a[2]), D(a[5], a[3], a[4])))
            for a in re.finditer(MR + r' (\d{1,2}) \[' + MR + r' (\d{1,2}), old style\],? (\d{4})', t):
                pary.append((D(a[5], a[3], a[4]), D(a[5], a[1], a[2])))
            for a in re.finditer(MR + r' (\d{1,2}),? (\d{4})', t):
                odin.append(D(a[3], a[1], a[2]))
            for a in re.finditer(r'\b(\d{1,2}) ' + MR + r',? (\d{4})', t):
                odin.append(D(a[3], a[2], a[1]))
            for a in re.finditer(r'\b(\d{1,2})/(\d{1,2})/(\d{4})', t):
                odin.append(D(a[3], a[1], a[2]))
    pary = [(s, n) for s, n in pary if s and n and s.year == n.year or (s and n and abs((n - s).days) < 20)]
    pary = [(s, n) for s, n in pary if (n - s).days == julian(n)]
    return pary, [d for d in odin if d]


def gody_zagolovka(z):
    """Годы из заголовка LoC: 1782 or 1783-1836, approximately 1111-1174, -approximately 1430, active 17th century."""
    m = re.search(r',\s*((?:active |approximately )?[\d\- ]*(?:or \d{4})?[\d\-]*(?:approximately \d{4}|\d{2}th century)?)\s*$', z)
    t = m[1].strip() if m and re.search(r'\d', m[1]) else ''
    if t.startswith('active'):
        v = re.search(r'(\d{2})th century', t)
        return {'aktiven': f'{int(v[1]) - 1}XX'} if v else {}
    def god(s):
        s = s.strip()
        if not s: return None
        if s.startswith('approximately'): return s.split()[1] + '~'
        if ' or ' in s: a, b = s.split(' or '); return f'[{a},{b}]'
        return s
    if t.startswith('-'):
        return {'smert': god(t[1:])}
    r = re.match(r'(approximately \d{4}|\d{4} or \d{4}|\d{4})?-?(approximately \d{4}|\d{4})?$', t)
    if not r: return {}
    return {k: god(v) for k, v in (('rozhdenie', r[1]), ('smert', r[2])) if v}


def data(edtf_loc, god_z, pary, odin):
    """Одна дата: (EDTF, EDTF по старому стилю или None)."""
    if not edtf_loc or not re.fullmatch(r'\d{4}-\d{2}-\d{2}', edtf_loc):
        if god_z: return god_z, None
        return (edtf_loc if edtf_loc and re.fullmatch(r'[\d~?/\[\],X-]+', edtf_loc) else None), None
    d = date.fromisoformat(edtf_loc)
    if god_z and god_z[:4].isdigit() and god_z[:4] != edtf_loc[:4] and not god_z.startswith('['):
        return god_z, None
    if date(1582, 10, 15) <= d < GREG:
        for s, n in pary:
            if d in (s, n): return n.isoformat(), s.isoformat()
        sm = julian(d)
        if d in odin and d + timedelta(days=sm) in odin: return (d + timedelta(days=sm)).isoformat(), d.isoformat()
        if d in odin and d - timedelta(days=sm) in odin: return d.isoformat(), (d - timedelta(days=sm)).isoformat()
        return god_z or edtf_loc[:4], None
    return (edtf_loc if d in odin else (god_z or edtf_loc[:4])), None


def latinica_loc(g, i, zag):
    tela = [n for n in g if n.get('@id', '').endswith('/' + i)]
    vary = [x['@value'] for n in g for x in n.get(M + 'variantLabel', [])]
    snoski = [(' '.join(x.get('@value', '') for x in n.get(M + 'citationSource', [])),
               ' '.join(x.get('@value', '') for x in n.get(M + 'citationNote', []))) for n in g if M + 'citationNote' in n]
    tekst = ' '.join(s + ' ' + n for s, n in snoski if not VIKI.search(s))
    def chast(z):
        return [p.strip() for p in re.sub(r',?\s*(active |approximately |-)?[\d].*$', '', z).split(',')]
    def chisto(z):
        z = ', '.join(chast(z))
        return z == bez_znakov(z) and re.fullmatch(r"[A-Za-z .'()\-,]+", z)
    def schet(z):
        f = chast(z)[0]
        return len(re.findall(r'(?<![A-Za-z])' + re.escape(f) + r'(?![A-Za-z])', tekst))
    kand = []
    if chisto(zag):
        kand.append((schet(zag), 3, zag, 'loc'))
    for s, n in snoski:
        if SPRAVKA.search(s) and not VIKI.search(s):
            for a in re.finditer(r"([A-Z][a-z'\-]+(?:-[A-Z][a-z]+)?), ([A-Z][a-z]+)", n):
                kand.append((schet(a[0]), 2, a[0], 'loc-istochnik'))
    golyi = re.sub(r'\b(I[UA])(?=[a-z])', lambda m: m[1].title(), bez_znakov(zag))
    angl = lambda f: re.sub(r'^I([ua])', r'Y\1', re.sub(r'(sk|ts|n|v)?ii$', lambda m: (m[1] or '') + 'y', f))
    for v in vary:
        if chisto(v) and len(chast(v)) > 1 and chast(v)[0] == angl(chast(golyi)[0]) != chast(golyi)[0]:
            kand.append((schet(v), 1, v, 'loc-variant'))
    kand.append((-1, 0, golyi, 'loc-bez-znakov'))
    _, _, z, iz = max(kand, key=lambda k: (k[0], k[1]))
    p = chast(z)
    if len(p) > 1 and re.match(r'(Emperor|Grand|King|Tsar|Prince|Saint|Archbishop|Bishop|Metropolitan)\b', p[1]):
        return p[0], iz
    imya = p[1] if len(p) > 1 else ''
    imya = imya.split()[0] if imya else ''
    if '.' in imya:
        imya = None
    return (f'{imya} {p[0]}'.strip() if imya is not None else f'None {p[0]}', iz)


def zapolnit():
    sl = json.loads(SLOVAR.read_text())
    schet = {}
    for k, z in sl.items():
        if z['tip'] != 'lyudi': continue
        for pole in ('latinica', 'latinica_iz', 'gody'): z.pop(pole, None)
        nr = z.get('normativ')
        gody = {}
        if not nr:
            z['latinica'], z['latinica_iz'] = translit(z['nazvanie'].split(' (')[0]), 'translit'
        elif nr['baza'] == 'LoC':
            g = loc(nr['id'])
            zag = next(x['@value'] for n in g if n.get('@id', '').endswith('/' + nr['id'])
                       for x in n.get(M + 'authoritativeLabel', []) if x.get('@language') in (None, 'en') or x['@value'].isascii() or re.match('[A-Za-z]', x['@value']))
            nr['zagolovok'] = zag
            lat, iz = latinica_loc(g, nr['id'], zag)
            ru = z['nazvanie'].split(' (')[0].split()
            if not lat:
                lat, iz = translit(' '.join(ru)), 'translit'
            elif lat.startswith('None '):
                lat = translit(ru[0]) + lat[4:]
            z['latinica'], z['latinica_iz'] = lat, iz
            gz = gody_zagolovka(zag)
            me = [n for n in g if M + 'birthDate' in n or M + 'deathDate' in n]
            pary, odin = daty_snosok(g)
            for pole, kl in (('rozhdenie', 'birthDate'), ('smert', 'deathDate')):
                vals = [x['@value'] for n in me for x in n.get(M + kl, [])]
                v, ss = data(vals[0] if vals else None, gz.get(pole), pary, odin)
                if v: gody[pole] = v
                if ss: gody[pole + '_ss'] = ss
            if 'aktiven' in gz: gody['aktiven'] = gz['aktiven']
        else:
            cl = viaf(nr['id'], nr['poisk'])
            hs = cl['ns2:mainHeadings']['ns2:data']
            zag = next(h['ns2:text'] for h in (hs if isinstance(hs, list) else [hs]) if re.match('[A-Za-z]', h['ns2:text']))
            nr['zagolovok'] = zag
            f, i = [p.strip() for p in bez_znakov(re.sub(r'\s*\(.*$|,\s*\d.*$', '', zag)).split(',')[:2]]
            z['latinica'], z['latinica_iz'] = f'{i.split()[0]} {f}', 'viaf'
            m = re.search(r'(\d{4})-(\d{4})', zag)
            if m: gody = {'rozhdenie': m[1], 'smert': m[2]}
        if gody: z['gody'] = gody
        schet[z['latinica_iz']] = schet.get(z['latinica_iz'], 0) + 1
        print(f"{k:38} {z['latinica']:28} {z['latinica_iz']:15} {json.dumps(gody, ensure_ascii=False)}")
    SLOVAR.write_text(json.dumps(sl, ensure_ascii=False, indent=2) + '\n')
    print('итого:', schet)


def svyazat(slug, ssylka):
    sl = json.loads(SLOVAR.read_text())
    baza, i = ssylka.split(':', 1)
    z = sl[f'lyudi:{slug}']
    if baza == 'loc':
        nr = {'baza': 'LoC', 'id': i, 'ssylka': f'https://id.loc.gov/authorities/names/{i}.html'}
    else:
        p = z['nazvanie'].split(' (')[0].split()
        nr = {'baza': 'VIAF', 'id': i, 'ssylka': f'https://viaf.org/viaf/{i}/', 'poisk': ' '.join(p[1:] + p[:1])}
    z['normativ'] = nr
    SLOVAR.write_text(json.dumps(sl, ensure_ascii=False, indent=2) + '\n')


if __name__ == '__main__':
    a = sys.argv[1:]
    if a and a[0] == 'svyazat': svyazat(a[1], a[2])
    else: zapolnit()
