#!/usr/bin/env python3
"""Метки внутри кадров дня (п. 114, 157): убрать GPS и лишнее, записать происхождение по IPTC — из карточки дня.

Как в мире — IPTC Photo Metadata Standard (https://iptc.org/standards/photo-metadata/iptc-standard/), запись XMP
инструментом ExifTool (https://exiftool.org/): метаданные переписываются без пересжатия, пиксели те же.
Карточка src/content/dni-shablon/<музей>/ММ-ДД.yaml — единственный источник (Р442): у каждого кадра src, data_source,
license, credit. В файл идёт (только XMP, у IIM поля по 32 байта — русская подпись не влезает):
  photoshop:Credit         ← credit (Credit Line)
  photoshop:Source         ← хранитель из credit («Хранится: …» или музей первым словом), иначе каталог по data_source
  dc:rights, xmpRights:UsageTerms ← license (Copyright Notice, Rights Usage Terms)
  xmpRights:Marked         ← False — общественное достояние/CC0, иначе True (Copyright Status)
  xmpRights:WebStatement   ← data_source — карточка предмета (Web Statement of Rights)
  Iptc4xmpExt:ArtworkOrObject ← AOSource хранитель, AOSourceInvNo номер (КП/инв., иначе Госкаталог №), AOSourceInvURL карточка
Убирается: GPS, MakerNotes, серийники камеры и объектива, владелец камеры, история правок XMP (xmpMM, photoshop:History),
старый IPTC IIM, COM-комментарий кодировщика.

  kartinki-metki.py МУЗЕЙ ДНИ            — сухой прогон: у скольких кадров GPS/лишнее, скольким нужна запись
  kartinki-metki.py МУЗЕЙ ДНИ --zapis    — записать; хеш пикселей до и после сверяется, не совпал — файл возвращается
ДНИ — ММ-ДД, ММ-ДД..ММ-ДД, ММ (весь месяц) или «все». Нет exiftool — предупреждение и код 0: кадр остаётся как был
(exiftool без sudo: архив https://github.com/exiftool/exiftool/tags → ~/bin/exiftool; в CI — apt libimage-exiftool-perl).
Зовут его kadr.py put (кадр из фонда), kadry-dnya.py dobor --zapis и ns-konveyer.mjs — новые кадры идут уже подписанными.
Откат — удалить файл и вызовы metki в этих трёх.
"""
import argparse
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

import yaml
from PIL import Image

KOREN = Path(__file__).resolve().parents[1]
KART = re.compile(r'\.(jpe?g|png|webp)$', re.I)
SVOBODNO = re.compile(r'общественн\w*\s+достояни|\bCC0\b|public domain', re.I)
DERZH = re.compile(r'музе|галере|библиотек|архив|заповедник|кремл|ЦАМО|РГА|ГАРФ|ЦВММ|ГИМ\b|ГМЗ|Эрмитаж', re.I)
NOMER = re.compile(r'(?<![\wА-ЯЁа-яё])((?:ГИК\s+)?(?:\w+\s+)?КП[\s-]?[\w-]*\d[\w/.-]*|инв\.\s*№?\s*[\w-]*\d[\w/.-]*)')
GK_NOMER = re.compile(r'Госкаталог[^;]*?№\s*(\d{4,})')
KATALOGI = {'goskatalog.ru': 'Госкаталог Музейного фонда Российской Федерации', 'pastvu.com': 'PastVu',
            'ar.culture.ru': 'Артефакт (Культура.РФ)', 'rusneb.ru': 'Национальная электронная библиотека',
            'victorymuseum.ru': 'Музей Победы', 'www.kremlin.ru': 'Президент России (kremlin.ru)'}
UBRAT = ['-gps:all=', '-makernotes:all=', '-SerialNumber=', '-BodySerialNumber=', '-LensSerialNumber=',
         '-InternalSerialNumber=', '-CameraSerialNumber=', '-OwnerName=', '-CameraOwnerName=', '-XMP-xmpMM:all=',
         '-XMP-photoshop:History=', '-IPTC:all=', '-File:Comment=']
LISHNEE = ('GPS', 'MakerNotes', 'SerialNumber', 'OwnerName', 'xmpMM', 'History', 'IPTC:', 'Comment')
POLYA = ('Credit', 'Source', 'Rights', 'UsageTerms', 'Marked', 'WebStatement', 'ArtworkOrObject')


def exiftool():
    for p in (os.environ.get('EXIFTOOL'), shutil.which('exiftool'), str(Path.home() / 'bin/exiftool')):
        if p and Path(p).is_file():
            return p
    return None


def dni(muzei, zapros):
    papka = KOREN / 'src/content/dni-shablon' / muzei
    vse = sorted(p.stem for p in papka.glob('[0-9][0-9]-[0-9][0-9].yaml'))
    if zapros == 'все':
        return vse
    if re.fullmatch(r'\d\d', zapros):
        return [d for d in vse if d.startswith(zapros + '-')]
    if '..' in zapros:
        a, b = zapros.split('..')
        return [d for d in vse if a <= d <= b]
    return [d for d in vse if d == zapros]


def kadry(o, acc):
    if isinstance(o, dict):
        s = o.get('src')
        if isinstance(s, str) and s.startswith('/muzei/') and KART.search(s.split('?')[0]):
            acc.append(o)
        for v in o.values():
            kadry(v, acc)
    elif isinstance(o, list):
        for v in o:
            kadry(v, acc)
    return acc


def proishozhdenie(credit, data_source, license):
    """Теги XMP по IPTC из полей карточки; пустые не пишутся."""
    credit, ds, lic = (credit or '').strip(), (data_source or '').strip(), (license or '').strip()
    m = re.search(r'Хранится:\s*(.+?)(?:[.;]\s*(?=Госкаталог|Права|Источник|Фото)|;|$)', credit)
    derzh = m.group(1) if m else next((s.strip() for s in credit.split(';')[:1] if DERZH.search(s)), '')
    nomer = NOMER.search(derzh or credit)
    derzh = re.split(r',\s*(?=(?:ГИК\s+)?(?:\w+\s+)?КП|инв\.|МПК|Госкаталог)', derzh)[0].strip(' .,«')  if derzh else ''
    derzh = re.sub(r'^Госкаталог[^,]*,[\s,]*|\s*\(museumId \d+\)|,\s*[A-ZА-ЯЁ]{1,4}\s+\d+$', '', derzh).strip(' .,')
    derzh = re.split(r'\.\s+Публикация', derzh)[0]
    if not DERZH.search(derzh) or re.match(r'(Подпись|Фото)', derzh):
        derzh = ''
    if derzh.count('«') < derzh.count('»'):
        derzh = '«' + derzh
    gk = GK_NOMER.search(credit)
    nomer = nomer.group(1).strip(' .,;') if nomer else (f'Госкаталог № {gk.group(1)}' if gk else '')
    url = ds if ds.startswith('http') else ''
    host = re.sub(r'^https?://([^/]+).*', r'\1', url) if url else ''
    t = {'XMP-photoshop:Credit': credit or lic,
         'XMP-photoshop:Source': derzh or KATALOGI.get(host, host or ds),
         'XMP-dc:Rights': lic, 'XMP-xmpRights:UsageTerms': lic,
         'XMP-xmpRights:Marked': not SVOBODNO.search(lic),
         'XMP-xmpRights:WebStatement': url}
    ao = {k: v for k, v in (('AOSource', derzh or (ds if not url else '')), ('AOSourceInvNo', nomer), ('AOSourceInvURL', url)) if v}
    if ao:
        t['XMP-iptcExt:ArtworkOrObject'] = [ao]
    return {k: v for k, v in t.items() if v not in ('', None)}


def pikseli(p):
    with Image.open(p) as im:
        return hashlib.sha256(im.tobytes()).hexdigest()


def prochest(et, puti):
    if not puti:
        return {}
    r = subprocess.run([et, '-j', '-G1', '-struct', '-q', '-m', '-charset', 'utf8', '-gps:all', '-makernotes:all',
                        '-SerialNumber', '-BodySerialNumber', '-LensSerialNumber', '-InternalSerialNumber', '-OwnerName',
                        '-CameraOwnerName', '-XMP-xmpMM:all', '-XMP-photoshop:all', '-IPTC:all', '-File:Comment',
                        '-XMP-dc:Rights', '-XMP-xmpRights:all', '-XMP-iptcExt:ArtworkOrObject', *map(str, puti)],
                       capture_output=True, text=True)
    return {str(Path(x['SourceFile']).resolve()): x for x in json.loads(r.stdout or '[]')}


def nado(est, teg):
    lishnee = [k for k in est if k != 'SourceFile' and k.split(':')[-1] not in POLYA and any(s in k for s in LISHNEE)]
    raznica = [k for k, v in teg.items()
               if json.dumps(est.get(k), ensure_ascii=False, sort_keys=True)
               != json.dumps(v, ensure_ascii=False, sort_keys=True)]
    return lishnee, raznica


def metki(zadaniya, zapis=True, et=None):
    """zadaniya: {путь: теги}. Возвращает (всего, с GPS, с лишним, записано, брак)."""
    et = et or exiftool()
    if not et:
        print('⚠ kartinki-metki: нет exiftool — метки не записаны (поставь ~/bin/exiftool, см. --help)', file=sys.stderr)
        return len(zadaniya), 0, 0, 0, []
    est = prochest(et, list(zadaniya))
    gps = lish = zap = 0
    brak = []
    for p, teg in zadaniya.items():
        e = est.get(str(Path(p).resolve()), {})
        gps += any(k.startswith('GPS') or ':GPS' in k for k in e)
        lishnee, raznica = nado(e, teg)
        lish += bool(lishnee)
        if not (lishnee or raznica) or not zapis:
            zap += bool(lishnee or raznica) and not zapis
            continue
        do, kopiya = pikseli(p), Path(p).read_bytes()
        with tempfile.NamedTemporaryFile('w', suffix='.json', delete=False, encoding='utf-8') as f:
            json.dump([{'SourceFile': str(p), **teg}], f, ensure_ascii=False)
        r = subprocess.run([et, '-q', '-m', '-overwrite_original', '-charset', 'utf8', '-struct', f'-json={f.name}', *UBRAT, str(p)],
                           capture_output=True, text=True)
        os.unlink(f.name)
        if r.returncode or pikseli(p) != do:
            Path(p).write_bytes(kopiya)
            brak.append(f'{p}: {(r.stderr or "пиксели изменились").strip()[:200]} — файл возвращён')
            continue
        zap += 1
    return len(zadaniya), gps, lish, zap, brak


def podpisat(put, credit, data_source, license):
    """Один новый кадр — для машин, которые кладут кадры (kadr.py, kadry-dnya.py); брак — в stderr, кадр остаётся."""
    *_, brak = metki({Path(put): proishozhdenie(credit, data_source, license)})
    for s in brak:
        print(f'⚠ kartinki-metki: {s}', file=sys.stderr)


def zadaniya_dnya(muzei, spisok):
    z, vtoroy = {}, []
    for d in spisok:
        karta = yaml.safe_load((KOREN / 'src/content/dni-shablon' / muzei / f'{d}.yaml').read_text(encoding='utf-8'))
        for k in kadry(karta, []):
            p = KOREN / 'public' / k['src'].split('?')[0].lstrip('/')
            if not p.is_file():
                continue
            teg = proishozhdenie(k.get('credit'), k.get('data_source'), k.get('license'))
            if p in z and z[p] != teg:
                vtoroy.append(f'{p.relative_to(KOREN)}: в {d} другие права/подпись — оставлены из первой карточки')
                continue
            z.setdefault(p, teg)
    return z, vtoroy


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.split('\n\n')[0], epilog=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('muzei')
    ap.add_argument('dni', help='ММ-ДД, ММ-ДД..ММ-ДД, ММ или «все»')
    ap.add_argument('--zapis', action='store_true', help='записать (без него — сухой прогон)')
    a = ap.parse_args(argv)
    spisok = dni(a.muzei, a.dni)
    if not spisok:
        sys.exit(f'{a.muzei}: карточек {a.dni} нет')
    z, vtoroy = zadaniya_dnya(a.muzei, spisok)
    vsego, gps, lish, zap, brak = metki(z, a.zapis)
    for s in vtoroy:
        print(f'  · {s}')
    for s in brak:
        print(f'✗ {s}', file=sys.stderr)
    glag = 'записано' if a.zapis else 'записал бы'
    print(f'{a.muzei} {a.dni}: дней {len(spisok)}, кадров {vsego}, с GPS {gps}, с лишними метками {lish}, {glag} {zap}, брак {len(brak)}')
    return 1 if brak else 0


if __name__ == '__main__':
    sys.exit(main())
