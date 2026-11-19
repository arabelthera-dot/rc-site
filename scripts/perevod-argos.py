# Машинный перевод строк дня — Argos Translate (Р603, Р686 п.8): открытый, бесплатный, офлайн, без ключа и без оплаты
# (https://github.com/argosopentech/argos-translate ; на нём построен LibreTranslate). Нужных пар нет — ставит их сам
# из открытого указателя Argos; ru→X без прямой пары Argos ведёт через английский.
# Зовёт только scripts/perevod-dnya.mjs: stdin {"zadachi": [{"code", "teksty": [...]}]} → stdout {"<code>": [...]} в том же порядке.
import json, sys
import argostranslate.package as pak, argostranslate.translate as tr

zadachi = json.load(sys.stdin)['zadachi']
nuzhno = {('ru', 'en')} | {('en', z['code']) for z in zadachi if z['code'] != 'en'}
est = {(p.from_code, p.to_code) for p in pak.get_installed_packages()}
if nuzhno - est:
    pak.update_package_index()
    for p in pak.get_available_packages():
        if (p.from_code, p.to_code) in nuzhno - est:
            print(f'perevod: ставлю модель {p.from_code}→{p.to_code}', file=sys.stderr)
            pak.install_from_path(p.download())
out = {}
for z in zadachi:
    print(f"perevod: ru→{z['code']}, строк {len(z['teksty'])}", file=sys.stderr)
    out[z['code']] = [tr.translate(t, 'ru', z['code']) for t in z['teksty']]
json.dump(out, sys.stdout, ensure_ascii=False)
