"""Адаптеры российских фондов для kadr.py zamena (Р90).

Каждый модуль scripts/fondy/<фонд>.py даёт po_nomeru(kadr: dict) -> list[dict].
kadr = {muzey, den, fayl, podpis, derzhatel, inv, avtor, god, syuzhet}
ответ = [{fond, card, image, title, avtor, god, osnovanie}] (+ по желанию inv, derzhatel —
без них совпадение по номеру не засчитывается, только автор+год+название).
Модуль, упавший при загрузке или вызове, kadr.py пропускает со строкой в stderr.
"""

# Зарегистрированные адаптеры (kadr.adaptery() грузит scripts/fondy/*.py сам; список — для сверки):
# ermitazh (#332), rgb_neb (#334), goskatalog (#335, туннель 127.0.0.1:8899), loc (#336); primer — заглушка-образец.
ADAPTERY = ('ermitazh', 'rgb_neb', 'goskatalog', 'loc')
