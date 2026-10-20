# Инфраструктура сайта в Яндекс Облаке (Р6, задача Y, 20.10.2026) — по образцу документации Яндекса
# «Статический сайт в Object Storage, Terraform»: https://yandex.cloud/ru/docs/storage/tutorials/static/terraform
# Состояние — в бакете Object Storage (backend s3, https://yandex.cloud/ru/docs/tutorials/infrastructure-management/terraform-state-storage),
# не в git. Имя бакета состояния и ключи доступа передаёт workflow terraform-yandex.yml (-backend-config).
terraform {
  required_version = ">= 1.6"
  required_providers {
    yandex = {
      source  = "yandex-cloud/yandex"
      version = "~> 0.130"
    }
  }
  backend "s3" {
    endpoints = {
      s3 = "https://storage.yandexcloud.net"
    }
    key    = "infra/yandex/terraform.tfstate"
    region = "ru-central1"

    skip_region_validation      = true
    skip_credentials_validation = true
    skip_requesting_account_id  = true
    skip_s3_checksum            = true
  }
}

# Ключ сервисного аккаунта rc-deploy, каталог и статический ключ для бакетов — из окружения:
# YC_SERVICE_ACCOUNT_KEY_FILE, YC_FOLDER_ID, YC_STORAGE_ACCESS_KEY, YC_STORAGE_SECRET_KEY.
provider "yandex" {
  zone = "ru-central1-a"
}
