"""Адаптеры российских фондов для kadr.py zamena (Р90).

Каждый модуль scripts/fondy/<фонд>.py даёт po_nomeru(kadr: dict) -> list[dict].
kadr = {muzey, den, fayl, podpis, derzhatel, inv, avtor, god, syuzhet}
ответ = [{fond, card, image, title, avtor, god, osnovanie}] (+ по желанию inv, derzhatel —
без них совпадение по номеру не засчитывается, только автор+год+название).
Модуль, упавший при загрузке или вызове, kadr.py пропускает со строкой в stderr.
"""
