#!/usr/bin/env python3
"""Три проверки старого сайта, потерянные при переезде (Сергей 19.10.2026: вернуть сразу, стандарт №4 —
перенос не ослабляет правило). Логика перенесена как есть из AI_Projects tools/archive/audit-pages.py.

  1. «Консультанты музея» (museum-core §6-quater, Сергей 21.07 и 08.10: «я запрещаю слово научный
     консультант… Просто консультант») — на титульной музея блок с фамилиями-ссылками или
     «Ищем консультанта»; «научный совет/консультант» нигде на сайте.
  2. «Вопрос не закрыт» — метка ЖДУ ОТВЕТА не выходит на сайт.
  3. «Счёт из 100» (museum-core 6-тер) — шкала посетителя из 100 и до неё можно дойти.

  python3 scripts/staroe-pravilo.py [--dist dist]      код 1 при браке, строка «файл: что не так»
"""
import os, re, sys
from pathlib import Path

NA = None
DIST = Path(sys.argv[sys.argv.index('--dist') + 1] if '--dist' in sys.argv else 'dist').resolve()
BASE = '/'


def engine_sources(s, path, engine):
    """Тексты подключённых на странице файлов движка `engine` (локальных и существующих).

    Общий приём этого файла: повторяющийся блок канон отдаёт движку (договор о приёмке, п. 10),
    в разметке страницы его тогда нет. Проверять по тексту HTML — значит требовать ровно ту
    копию разметки, которую канон запрещает. Образец приёма — support_engine в home_checks.

    Хвост `?v=…` — метка версии для кэша браузера, а не часть имени файла: без её отбрасывания
    подключённый движок не находился, и проверки слогана, обложки и счёта отвечали «нарушено»
    на живых страницах (25.09.2026: 4 из 9 страниц архитектуры по слогану, Вятское по высоте
    сцены; из 9 страниц движок читался у 5).
    """
    out = []
    for src in re.findall(r'<script[^>]+src=["\']([^"\']+)["\']', s):
        if engine not in src or '://' in src:
            continue
        src = src.split('?', 1)[0].split('#', 1)[0]
        full = (str(DIST / src[len(BASE):]) if src.startswith(BASE) else str(DIST / src.lstrip("/")) if src.startswith("/")
                else os.path.join(os.path.dirname(path), src))
        if os.path.isfile(full):
            out.append(open(full, encoding='utf-8').read())
    return out


def award_calls(s):
    """Все вызовы award() страницы, разобранные с балансом скобок.

    Возвращает список (ключ, префикс, очки):
      ключ    — имя награды, если оно записано литералом, иначе None;
      префикс — литеральное начало составного ключа ('q' из 'q'+qIdx), иначе None;
      очки    — число, если очки записаны числом, иначе None.
    Регулярное выражение здесь не годится: в аргументах встречается Math.max(5, …),
    и запятая внутри вложенного вызова разрезала бы награду пополам.
    """
    out = []
    for m in re.finditer(r'\baward\(', s):
        i, depth = m.end(), 1
        while i < len(s) and depth:
            depth += (s[i] == '(') - (s[i] == ')')
            i += 1
        if depth:
            continue                        # скобка не закрыта — не наша забота, пропускаем
        args, depth, cut = s[m.end():i - 1], 0, -1
        for j, ch in enumerate(args):       # верхнеуровневая запятая: ключ | очки
            depth += (ch in '([{') - (ch in ')]}')
            if ch == ',' and depth == 0:
                cut = j
                break
        if cut < 0:
            continue
        key_src, pts_src = args[:cut].strip(), args[cut + 1:].strip()
        lit = re.fullmatch(r"""['"]([^'"]*)['"]""", key_src)
        pre = re.match(r"""['"]([^'"]*)['"]\s*\+""", key_src)
        pts = int(pts_src) if re.fullmatch(r'\d+', pts_src) else None
        out.append((lit.group(1) if lit else None, None if lit else (pre.group(1) if pre else None), pts))
    return out


def declared_awards(s):
    """Реестр наград страницы: {ключ: очки}. Пара [сколько раз, по сколько] уже перемножена."""
    m = re.search(r'\bawards\s*:\s*\{([^{}]*)\}', s)
    if not m:
        return None
    reg = {}
    for k, v in re.findall(r"""['"]?([A-Za-z_][\w-]*)['"]?\s*:\s*(\[[^\]]*\]|\d+)""", m.group(1)):
        if v.startswith('['):
            nums = [int(x) for x in re.findall(r'\d+', v)]
            reg[k] = (nums[0] * nums[1]) if len(nums) >= 2 else 0
        else:
            reg[k] = int(v)
    return reg


def _code_only(text):
    """Текст без JS-комментариев: award() внутри комментария — не начисление.

    25.09.2026: в museum-quiz.js пример `award('q0',10)` живёт в шапке-комментарии,
    и разбор по одному тексту принимал его за настоящее начисление: реестр страницы
    (`awards:{q:100}`) не покрывал литеральный ключ `q0`, и честная страница получала
    «счёт из 100 — НЕ СОБЛЮДЁН». Комментарии снимаются с учётом строковых литералов,
    чтобы `//` внутри строки (адрес, шаблон) не съедал код.
    """
    out, i, n, quote = [], 0, len(text), None
    while i < n:
        ch = text[i]
        if quote:
            out.append(ch)
            if ch == '\\' and i + 1 < n:
                out.append(text[i + 1]); i += 2; continue
            if ch == quote:
                quote = None
            i += 1; continue
        if ch in '\'"`':
            quote = ch; out.append(ch); i += 1; continue
        if ch == '/' and i + 1 < n and text[i + 1] == '/':
            while i < n and text[i] != '\n':
                i += 1
            continue
        if ch == '/' and i + 1 < n and text[i + 1] == '*':
            i += 2
            while i + 1 < n and not (text[i] == '*' and text[i + 1] == '/'):
                i += 1
            i += 2; continue
        out.append(ch); i += 1
    return ''.join(out)


def engine_award_calls(s, path):
    """Начисления движков, подключённых к странице: award() живёт и в них.

    Наряд b6-storozh-blokiruet-vse-claude4-1809, часть 1: `award_calls` читал только
    разметку страницы, а викторина канона раздаёт очки из museum-quiz.js
    (`window.award('q'+idx, points)`). У страницы, которая объявила реестр и отдала
    раздачу движку, список вызовов выходил пустым — и проверка отвечала «нарушено»
    до того, как доходила до честного реестра. Образец приёма — slogan_ok/hero_fit_ok.
    """
    out = []
    for engine in ('museum-score.js', 'museum-quiz.js', 'museum-choice-run.js'):
        for text in engine_sources(s, path, engine):
            out += award_calls(_code_only(text))
    return out


def score_ok(s, path):
    """True, если шкала счёта честная: движок подключён и максимум равен достижимому.

    09.09.2026. Прежняя проверка искала в разметке «/ 100» и потому мерила ФОРМУ ЗАПИСИ.
    Замер по 16 страницам января: знаменатель не совпадал с достижимым НИ НА ОДНОЙ
    (60 при достижимых 38, 80 при 50, 100 при 45), а диплом Шухова открывался при 60
    из достижимых 45 — то есть не открывался никогда, и всё это время проверка стояла ✓.

    11.09.2026, вторая яма на том же месте. Сменившая её проверка складывала ТОЛЬКО
    награды с литеральным именем и числом очков, а award('q'+qIdx,10) в теле викторины
    и award('gm_fallback',pts) не видела вовсе — и объявляла «сумма сошлась» там, где
    сошлась лишь её собственная половина суммы. У Мечникова max:38 — ровно сумма шести
    литералов, при этом одна викторина добавляет по 10 очков за вопрос. Занижение хуже
    завышения: движок обрезает raw/max по 100, посетитель упирается в потолок и получает
    высшее звание за треть дня. Страница с такими наградами обязана объявить реестр
    awards — тогда максимум считает движок, и расходиться становится не с чем.
    """
    if 'scoreBox' not in s:
        return NA                           # счёта на странице нет — правило не про неё
    if not any('MUSEUM_SCORE' in src for src in engine_sources(s, path, 'museum-score.js')):
        return False                        # страница считает счёт сама — шкала не гарантирована
    calls = award_calls(s) + engine_award_calls(s, path)
    if not calls:
        return False
    best = {}
    for key, _pre, pts in calls:
        if key and pts is not None:
            best[key] = max(best.get(key, 0), pts)
    # Награды, которых не видно статически: ключ собирается в цикле или очки заданы переменной.
    groups = {pre for key, pre, _p in calls if pre}
    varpts = {key for key, _pre, pts in calls if key and pts is None}
    reg = declared_awards(s)
    if reg is not None:
        for key in set(best) | varpts:      # реестр обязан покрывать все награды кода
            if key not in reg:
                return False
        for pre in groups:
            if pre not in reg:
                return False
        m = re.search(r'MUSEUM_SCORE\s*=\s*\{[^}]*\bmax\s*:\s*(\d+)', s)
        return not m or int(m.group(1)) == sum(reg.values())
    if groups or varpts:
        return False                        # есть награды вне поля зрения max — нужен реестр
    m = re.search(r'MUSEUM_SCORE\s*=\s*\{[^}]*\bmax\s*:\s*(\d+)', s)
    return bool(m) and int(m.group(1)) == sum(best.values())




def consultants_ok(low):
    """Титульная музея: «Консультанты музея» + «Ищем консультанта» или ссылка после заголовка."""
    return 'консультанты музея' in low and ('ищем консультанта' in low or
           re.search(r'консультанты музея.{0,3000}?<a\s', low, re.S) is not None)


def main():
    brak = []
    for f in sorted(DIST.rglob('*.html')):
        rel, s = f.relative_to(DIST), f.read_text(encoding='utf-8', errors='replace')
        low = re.sub(r'<!--.*?-->', '', s.lower(), flags=re.S)
        if 'http-equiv="refresh"' in low:
            continue                        # переадресация старого адреса — не страница
        if re.search(r'научн\w* (совет|консультант)', low):
            brak.append(f'{rel}: слово «научный» у консультантов — «Просто консультант» (Сергей 08.10)')
        if 'ЖДУ ОТВЕТА' in s:
            brak.append(f'{rel}: метка ЖДУ ОТВЕТА — вопрос не закрыт, страница не сдаётся')
        parts = rel.parts
        if len(parts) == 3 and parts[0] == 'muzei' and parts[2] == 'index.html' and not consultants_ok(low):
            brak.append(f'{rel}: нет блока «Консультанты музея» (фамилии-ссылки или «Ищем консультанта»)')
        if score_ok(s, str(f)) is False:
            brak.append(f'{rel}: счёт не из 100 или максимум недостижим (museum-core 6-тер)')
    print('\n'.join(brak) or 'старые правила: чисто')
    print(f'брак: {len(brak)}')
    return 1 if brak else 0


if __name__ == '__main__':
    sys.exit(main())
