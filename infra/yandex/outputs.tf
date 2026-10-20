output "ns" {
  description = "Серверы имён зоны — их ставят в reg.ru вместо ns1/ns2.reg.ru (переключение на Яндекс)"
  value       = ["ns1.yandexcloud.net.", "ns2.yandexcloud.net."]
}

output "acme_cname" {
  description = "Записи проверки Let's Encrypt: до переноса NS — продублировать в reg.ru"
  value = [for c in yandex_cm_certificate.sertifikat.challenges : {
    domain = c.domain
    name   = c.dns_name
    type   = c.dns_type
    value  = c.dns_value
  }]
}

output "sertifikat_status" {
  value = var.https ? data.yandex_cm_certificate.vypushen[0].status : yandex_cm_certificate.sertifikat.status
}

output "bakety_http" {
  description = "Проверка сайта до переключения DNS"
  value = {
    sait = "http://${yandex_storage_bucket.sait.bucket}.website.yandexcloud.net/"
    www  = "http://${yandex_storage_bucket.www.bucket}.website.yandexcloud.net/"
  }
}

output "dop_domeny" {
  description = "Дополнительные адреса: NS для регистратора и проверка переадресации до смены NS"
  value = {
    for d in var.dop_domeny : d => {
      ns          = ["ns1.yandexcloud.net.", "ns2.yandexcloud.net."]
      bakety_http = ["http://${d}.website.yandexcloud.net/", "http://www.${d}.website.yandexcloud.net/"]
      sertifikat  = yandex_cm_certificate.dop[d].status
    }
  }
}
