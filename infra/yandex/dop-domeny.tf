# Дополнительные адреса сайта (решение Сергея 19.10.2026, М36 #2232): rusciv.ru и музей-русской-цивилизации.рф
# отвечают 301 на https://russian-civilization.ru с сохранением пути. Выключено: пока var.dop_domeny пуст,
# здесь не создаётся ничего. Включение и откат — docs/yandex-oblako.md, «Дополнительные адреса».
#
# По документации Яндекса: переадресация всех запросов бакета-сайта
# https://yandex.cloud/ru/docs/storage/operations/hosting/redirects , свой домен
# https://yandex.cloud/ru/docs/storage/operations/hosting/own-domain , публичная зона
# https://yandex.cloud/ru/docs/dns/operations/zone-create-public .

locals {
  # На каждый домен — сам домен и www: оба бакета переадресуют на основной адрес.
  dop_imena = toset(flatten([for d in var.dop_domeny : [d, "www.${d}"]]))
}

# Своя публичная зона на каждый домен: у регистратора ставятся NS ns1/ns2.yandexcloud.net.
resource "yandex_dns_zone" "dop" {
  for_each = toset(var.dop_domeny)
  name     = "dop-${replace(each.value, ".", "-")}"
  zone     = "${each.value}."
  public   = true
}

# Let's Encrypt на домен и www, проверка DNS_CNAME в зоне выше — продлевается сам.
resource "yandex_cm_certificate" "dop" {
  for_each = toset(var.dop_domeny)
  name     = "dop-${replace(each.value, ".", "-")}"
  domains  = [each.value, "www.${each.value}"]

  managed {
    challenge_type  = "DNS_CNAME"
    challenge_count = 2
  }
}

resource "yandex_dns_recordset" "dop_proverka_le" {
  for_each = { for p in setproduct(var.dop_domeny, [0, 1]) : "${p[0]}#${p[1]}" => { d = p[0], i = p[1] } }
  zone_id  = yandex_dns_zone.dop[each.value.d].id
  name     = yandex_cm_certificate.dop[each.value.d].challenges[each.value.i].dns_name
  type     = yandex_cm_certificate.dop[each.value.d].challenges[each.value.i].dns_type
  data     = [yandex_cm_certificate.dop[each.value.d].challenges[each.value.i].dns_value]
  ttl      = 600
}

# Ожидание выпуска — только при dop_https = true (второй проход, после смены NS у регистратора).
data "yandex_cm_certificate" "dop_vypushen" {
  for_each        = var.dop_https ? toset(var.dop_domeny) : toset([])
  depends_on      = [yandex_dns_recordset.dop_proverka_le]
  certificate_id  = yandex_cm_certificate.dop[each.value].id
  wait_validation = true
}

# Бакет на каждое имя: все запросы → https://<основной домен>/<тот же путь> (код 301).
resource "yandex_storage_bucket" "dop" {
  for_each = local.dop_imena
  bucket   = each.value

  anonymous_access_flags {
    read        = true
    list        = false
    config_read = false
  }

  website {
    redirect_all_requests_to = "https://${var.domain}"
  }

  dynamic "https" {
    for_each = var.dop_https ? [1] : []
    content {
      certificate_id = data.yandex_cm_certificate.dop_vypushen[trimprefix(each.value, "www.")].id
    }
  }
}

# Корень — ANAME на бакет (CNAME на корне зоны запрещён), www — CNAME.
resource "yandex_dns_recordset" "dop_koren" {
  for_each = toset(var.dop_domeny)
  zone_id  = yandex_dns_zone.dop[each.value].id
  name     = "${each.value}."
  type     = "ANAME"
  ttl      = 600
  data     = ["${each.value}.website.yandexcloud.net"]
}

resource "yandex_dns_recordset" "dop_www" {
  for_each = toset(var.dop_domeny)
  zone_id  = yandex_dns_zone.dop[each.value].id
  name     = "www.${each.value}."
  type     = "CNAME"
  ttl      = 600
  data     = ["www.${each.value}.website.yandexcloud.net"]
}
