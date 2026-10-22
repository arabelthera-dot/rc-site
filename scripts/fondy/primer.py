"""Заглушка-пример адаптера фонда для kadr.py zamena. Ничего не ищет — показывает форму ответа."""


def po_nomeru(kadr: dict) -> list[dict]:
    # Настоящий адаптер: поиск по kadr['inv'] у kadr['derzhatel'], иначе по avtor + god + syuzhet.
    # Форма ответа:
    # [{'fond': 'goskatalog', 'card': 'https://goskatalog.ru/portal/#/collections?id=…',
    #   'image': 'https://…/img.jpg', 'title': 'Название предмета', 'avtor': 'И. И. Шишкин', 'god': '1889',
    #   'osnovanie': 'инв. Ж-95 ГТГ', 'inv': 'Ж-95', 'derzhatel': 'Третьяковская галерея'}]
    return []
