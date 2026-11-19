#!/usr/bin/env python3
"""Черновик описаний для незрячих (alt) — машиной у себя, в файл-предложение (п. 74).

Ищет картинки дня без alt:
  - src/content/days/<музей>/ММ-ДД.json — images[] без поля alt (поле по желанию, п. 25, #939);
  - src/content/dni-shablon/<музей>/ММ-ДД.yaml — любой кадр (src: /muzei/…) без alt.
Для каждой пишет черновик двумя способами:
  - iz_modeli — что видно на картинке: BLIP (Salesforce/blip-image-captioning-base) на CPU,
    перевод на русский — opus-mt-en-ru (Helsinki-NLP); обе модели бесплатные, локальные (transformers).
    Английский текст модели в файл не пишется — только перевод;
  - iz_podpisi — из подписи (caption/podpis) и этикетки источника (podpis_chto): вид предмета + что на нём.
Файл-предложение: docs/research/alt-chernovik/<музей>/ММ-ДД.json. На страницы не ставится, записи дней
и утверждённое не меняет: человек читает черновик, правит и сам вписывает alt.

  ~/.venvs/tripo/bin/python tools/alt-chernovik.py --muzei izobreteniya ne-sdayutsya --den 02-01 02-02 \\
      --kartinki ~/rc-site/public
  python3 tools/alt-chernovik.py --muzei izobreteniya --den 02-02 --bez-modeli   # только из подписи, без torch

Нужны torch, transformers, sentencepiece (в ~/.venvs/tripo нет sentencepiece — pip install --target <папка>, PYTHONPATH=<папка>).
--kartinki — папка, где лежит public/ (в лёгкой копии без public/ — основная ~/rc-site/public).
Откат — удалить этот файл и docs/research/alt-chernovik/.
"""
import argparse
import json
import os
import re
import sys

import yaml

KORNI = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_VIDA = 'Salesforce/blip-image-captioning-base'
MODEL_PEREVODA = 'Helsinki-NLP/opus-mt-en-ru'
KARTINKA = re.compile(r'\.(jpe?g|png|webp)$', re.I)
# Вид предмета по основе слова подписи — первое найденное («копия картины» → картина).
VIDY = [('картин', 'картина'), ('гравюр', 'гравюра'), ('литограф', 'литография'), ('икон', 'икона'),
        ('рисун', 'рисунок'), ('плакат', 'плакат'), ('открытк', 'открытка'), ('значк', 'значок'),
        ('значок', 'значок'), ('медал', 'медаль'), ('орден', 'орден'), ('модел', 'модель'), ('книг', 'книга'),
        ('обложк', 'обложка'), ('карт', 'карта'), ('схем', 'схема'), ('чертёж', 'чертёж'), ('фото', 'фотография'),
        ('снимок', 'снимок'), ('скульптур', 'скульптура'), ('бюст', 'бюст'), ('памятник', 'памятник'),
        ('марк', 'марка'), ('монет', 'монета'), ('портрет', 'портрет')]


def bez_alt(muzei, den):
    """Картинки дня без alt: (откуда, src, подпись, этикетка)."""
    out = []
    put = os.path.join(KORNI, 'src/content/days', muzei, den + '.json')
    if os.path.exists(put):
        for i, im in enumerate(json.load(open(put, encoding='utf-8')).get('images') or []):
            if not im.get('alt'):
                out.append((f'src/content/days/{muzei}/{den}.json images[{i}]', im['src'], im.get('caption', ''), ''))
    put = os.path.join(KORNI, 'src/content/dni-shablon', muzei, den + '.yaml')
    if os.path.exists(put):
        def obhod(o, gde):
            if isinstance(o, dict):
                src = o.get('src')
                if isinstance(src, str) and src.startswith('/muzei/') and KARTINKA.search(src) and not o.get('alt'):
                    out.append((f'src/content/dni-shablon/{muzei}/{den}.yaml {gde}', src,
                                o.get('podpis') or o.get('caption') or '', o.get('podpis_chto') or ''))
                for k, v in o.items():
                    obhod(v, f'{gde}.{k}' if gde else k)
            elif isinstance(o, list):
                for i, v in enumerate(o):
                    obhod(v, f'{gde}[{i}]')
        obhod(yaml.safe_load(open(put, encoding='utf-8')), '')
    return out


def iz_podpisi(podpis, etiketka):
    """Вид предмета + что на нём: из этикетки, нет — из подписи до первой запятой."""
    chto = (etiketka or podpis).split(',')[0].strip().rstrip('.')
    if not chto:
        return ''
    nizh = podpis.lower()
    vid = next((v for osn, v in VIDY if re.search(r'\b' + osn, nizh)), '')
    if vid and not chto.lower().startswith(vid[:4]):
        return f'{vid.capitalize()}: {chto}'
    return chto


class Modeli:
    def __init__(self):
        from transformers import (BlipForConditionalGeneration, BlipProcessor, MarianMTModel,
                                  MarianTokenizer)
        self.vid_p = BlipProcessor.from_pretrained(MODEL_VIDA)
        self.vid_m = BlipForConditionalGeneration.from_pretrained(MODEL_VIDA).eval()
        self.per_t = MarianTokenizer.from_pretrained(MODEL_PEREVODA)
        self.per_m = MarianMTModel.from_pretrained(MODEL_PEREVODA).eval()

    def opisat(self, put):
        import torch
        from PIL import Image
        with torch.no_grad():
            im = Image.open(put).convert('RGB')
            vh = self.vid_p(images=im, return_tensors='pt')
            en = self.vid_p.decode(self.vid_m.generate(**vh, num_beams=3, max_new_tokens=30)[0],
                                   skip_special_tokens=True)
            vh = self.per_t([en], return_tensors='pt')
            ru = self.per_t.decode(self.per_m.generate(**vh, num_beams=3, max_new_tokens=60)[0],
                                   skip_special_tokens=True)
        return ru.strip().rstrip('.')


def main():
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('--muzei', nargs='+', required=True)
    ap.add_argument('--den', nargs='+', required=True, help='ММ-ДД')
    ap.add_argument('--kartinki', default=os.path.join(KORNI, 'public'), help='папка public/')
    ap.add_argument('--bez-modeli', action='store_true', help='только из подписи')
    ap.add_argument('--vyhod', default=os.path.join(KORNI, 'docs/research/alt-chernovik'))
    a = ap.parse_args()
    modeli = None if a.bez_modeli else Modeli()
    vsego = 0
    for muzei in a.muzei:
        for den in a.den:
            zapisi = []
            for gde, src, podpis, etiketka in bez_alt(muzei, den):
                z = {'gde': gde, 'src': src, 'podpis': podpis, 'iz_podpisi': iz_podpisi(podpis, etiketka)}
                put = os.path.join(os.path.expanduser(a.kartinki), src.lstrip('/'))
                if modeli and os.path.exists(put):
                    z['iz_modeli'] = modeli.opisat(put)
                elif modeli:
                    z['iz_modeli'] = None
                    print(f'нет файла {put}', file=sys.stderr)
                zapisi.append(z)
            if not zapisi:
                continue
            os.makedirs(os.path.join(a.vyhod, muzei), exist_ok=True)
            fail = os.path.join(a.vyhod, muzei, den + '.json')
            json.dump({'muzei': muzei, 'den': den, 'status': 'черновик, на страницы не ставится',
                       'modeli': None if a.bez_modeli else [MODEL_VIDA, MODEL_PEREVODA], 'kartinki': zapisi},
                      open(fail, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
            open(fail, 'a', encoding='utf-8').write('\n')
            vsego += len(zapisi)
            print(f'{muzei} {den}: без alt {len(zapisi)} → {os.path.relpath(fail, KORNI)}')
    print(f'черновиков: {vsego}')


if __name__ == '__main__':
    main()
