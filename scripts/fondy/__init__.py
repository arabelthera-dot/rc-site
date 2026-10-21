"""Адаптеры российских фондов для kadr.py zamena (Р90).

Каждый модуль scripts/fondy/<фонд>.py даёт po_nomeru(kadr: dict) -> list[dict].
kadr = {muzey, den, fayl, podpis, derzhatel, inv, avtor, nazvanie, god, syuzhet}
  avtor, nazvanie, god — kadr.iz_podpisi(): из подписи («А. Радаков · 1917 «Название» …»,
  «Автор. Название. 1905», «Название (Автор, 1905)», «… журнал «Будильник», 1906»); avtor — «Имя Фамилия»
  или «И. Фамилия», nazvanie — в «ёлочках», если они были (адаптер снимает их сам), god — 4 цифры или ''.
  Нет держателя и инв. номера — искать по avtor + nazvanie (+ god для строгой сверки).
ответ = [{fond, card, image, title, avtor, god, osnovanie}] (+ по желанию inv, derzhatel —
без них совпадение по номеру не засчитывается, только автор+год+название).
Модуль, упавший при загрузке или вызове, kadr.py пропускает со строкой в stderr.
"""

# Зарегистрированные адаптеры (kadr.adaptery() грузит scripts/fondy/*.py сам; список — для сверки):
# ermitazh (#332), rgb_neb (#334), goskatalog (#335, туннель 127.0.0.1:8899), loc (#336, Р93: выключен,
# только kadr.py zamena --s-loc с личного разрешения владельца); primer — заглушка-образец, не грузится.
ADAPTERY = ('ermitazh', 'rgb_neb', 'goskatalog', 'loc', 'tretyakov', 'rusmuseum')
# _set.py — общий сетевой путь (напрямую → прокси, кэш «недоступен» на прогон); certs/ — промежуточные сертификаты.
