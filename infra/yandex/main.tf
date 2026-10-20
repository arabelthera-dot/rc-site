locals {
  www     = "www.${var.domain}"
  domains = [var.domain, local.www]
}

# Зона уже заведена в каталоге (М47) — здесь только читается.
data "yandex_dns_zone" "zona" {
  name = var.dns_zone_name
}

# Сертификат Let's Encrypt на домен и www с проверкой DNS_CNAME:
# https://yandex.cloud/ru/docs/certificate-manager/operations/managed/cert-create
# Запись _acme-challenge — постоянный CNAME на Certificate Manager, поэтому сертификат продлевается сам.
resource "yandex_cm_certificate" "sertifikat" {
  name    = "russian-civilization-ru"
  domains = local.domains

  managed {
    challenge_type  = "DNS_CNAME"
    challenge_count = length(local.domains)
  }
}

resource "yandex_dns_recordset" "proverka_le" {
  count   = length(local.domains)
  zone_id = data.yandex_dns_zone.zona.id
  name    = yandex_cm_certificate.sertifikat.challenges[count.index].dns_name
  type    = yandex_cm_certificate.sertifikat.challenges[count.index].dns_type
  data    = [yandex_cm_certificate.sertifikat.challenges[count.index].dns_value]
  ttl     = 600
}

# Ожидание выпуска (wait_validation): Let's Encrypt проверяет _acme-challenge там, куда смотрят NS домена.
# До переноса NS из reg.ru те же CNAME (вывод acme_cname) ставятся и в reg.ru — тогда https готов до переключения.
data "yandex_cm_certificate" "vypushen" {
  count           = var.https ? 1 : 0
  depends_on      = [yandex_dns_recordset.proverka_le]
  certificate_id  = yandex_cm_certificate.sertifikat.id
  wait_validation = true
}

# Бакет-сайт: https://yandex.cloud/ru/docs/storage/operations/hosting/setup
resource "yandex_storage_bucket" "sait" {
  bucket = var.domain

  anonymous_access_flags {
    read        = true
    list        = false
    config_read = false
  }

  website {
    index_document = "index.html"
    error_document = "404.html"
  }

  dynamic "https" {
    for_each = var.https ? [1] : []
    content {
      certificate_id = data.yandex_cm_certificate.vypushen[0].id
    }
  }
}

# www — отдельный бакет, который отправляет все запросы на основной адрес (redirect_all_requests_to).
resource "yandex_storage_bucket" "www" {
  bucket = local.www

  anonymous_access_flags {
    read        = true
    list        = false
    config_read = false
  }

  website {
    redirect_all_requests_to = "https://${var.domain}"
  }

  dynamic "https" {
    for_each = var.https ? [1] : []
    content {
      certificate_id = data.yandex_cm_certificate.vypushen[0].id
    }
  }
}

# Корень домена — ANAME на бакет (CNAME на корне зоны запрещён), www — CNAME:
# https://yandex.cloud/ru/docs/storage/operations/hosting/own-domain
resource "yandex_dns_recordset" "koren" {
  zone_id = data.yandex_dns_zone.zona.id
  name    = "${var.domain}."
  type    = "ANAME"
  ttl     = 600
  data    = ["${var.domain}.website.yandexcloud.net"]
}

resource "yandex_dns_recordset" "www" {
  zone_id = data.yandex_dns_zone.zona.id
  name    = "${local.www}."
  type    = "CNAME"
  ttl     = 600
  data    = ["${local.www}.website.yandexcloud.net"]
}

resource "yandex_dns_recordset" "dop" {
  for_each = var.dop_zapisi
  zone_id  = data.yandex_dns_zone.zona.id
  name     = each.value.name == "@" ? "${var.domain}." : "${each.value.name}.${var.domain}."
  type     = each.value.type
  ttl      = each.value.ttl
  data     = each.value.data
}
