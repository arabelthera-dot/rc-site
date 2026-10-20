variable "domain" {
  description = "Домен сайта; бакет хостинга называется так же (требование Object Storage для своего домена)"
  type        = string
  default     = "russian-civilization.ru"
}

variable "dns_zone_name" {
  description = "Имя публичной зоны Cloud DNS для домена (зону заводит Михаил, М47)"
  type        = string
  default     = "russian-civilization-ru"
}

variable "https" {
  description = "Ждать выпуска сертификата Let's Encrypt и привязать его к бакетам. false — первый проход: бакеты, DNS и заявка на сертификат без ожидания"
  type        = bool
  default     = true
}

variable "dop_zapisi" {
  description = "Прочие записи домена, перенесённые из reg.ru (почта MX, TXT подтверждений и т. п.): ключ — произвольное имя"
  type = map(object({
    name = string # относительное имя: "@" — сам домен, "mail", "_dmarc"…
    type = string
    ttl  = optional(number, 3600)
    data = list(string)
  }))
  default = {}
}
