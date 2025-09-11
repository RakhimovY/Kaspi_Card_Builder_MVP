# 🌐 Настройка домена tradecardbuilder.kz в Vercel

## Проблема
Домен `tradecardbuilder.kz` куплен и DNS настроен правильно, но сайт не открывается в браузере. В логах Vercel видны запросы, что означает, что домен привязан к проекту.

## Решение

### 1. Проверка домена в Vercel Dashboard

1. Зайдите в [Vercel Dashboard](https://vercel.com/dashboard)
2. Выберите проект `kaspi-card-builder-mvp`
3. Перейдите в **Settings** → **Domains**
4. Убедитесь, что домен `tradecardbuilder.kz` добавлен и имеет статус **Valid**

### 2. Настройка переменных окружения

В Vercel Dashboard → **Settings** → **Environment Variables** добавьте/обновите:

```bash
NEXTAUTH_URL=https://tradecardbuilder.kz
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=tradecardbuilder.kz
```

### 3. Проверка DNS записей

Убедитесь, что DNS записи настроены правильно:

```bash
# Проверка A записи (naked domain)
dig tradecardbuilder.kz A

# Проверка CNAME записи (www)
dig www.tradecardbuilder.kz CNAME
```

Ожидаемый результат:
- `tradecardbuilder.kz` → A запись на IP Vercel (76.76.19.61)
- `www.tradecardbuilder.kz` → CNAME на `cname.vercel-dns.com`

### 4. Проверка SSL сертификата

1. В Vercel Dashboard → **Settings** → **Domains**
2. Убедитесь, что SSL сертификат выдан для `tradecardbuilder.kz`
3. Статус должен быть **Valid**

### 5. Тестирование

После настройки проверьте:

```bash
# Проверка редиректа
curl -I https://tradecardbuilder.kz

# Проверка www редиректа
curl -I https://www.tradecardbuilder.kz

# Проверка главной страницы
curl -I https://tradecardbuilder.kz/landing
```

### 6. Возможные проблемы

#### Проблема: DNS_PROBE_FINISHED_NXDOMAIN
**Причина**: DNS не распространился или неправильно настроен
**Решение**: 
- Подождать 24-48 часов для полного распространения DNS
- Проверить DNS записи через `dig` или `nslookup`

#### Проблема: Сайт не загружается, но логи есть
**Причина**: Проблема с роутингом или переменными окружения
**Решение**:
- Проверить переменные окружения в Vercel
- Проверить логи в Vercel Dashboard → **Functions** → **Logs**
- Убедиться, что `NEXTAUTH_URL` правильно настроен

#### Проблема: Ошибка 500
**Причина**: Проблема с базой данных или переменными окружения
**Решение**:
- Проверить `DATABASE_URL` в Vercel
- Проверить все обязательные переменные окружения
- Проверить логи функций

### 7. Мониторинг

После успешной настройки:
1. Настройте мониторинг в Vercel Analytics
2. Проверьте производительность через Vercel Speed Insights
3. Настройте уведомления об ошибках

## Текущий статус

- ✅ Домен куплен: `tradecardbuilder.kz`
- ✅ DNS настроен: A запись и CNAME
- ✅ SSL сертификат: автоматически выдан Vercel
- ⏳ Настройка в Vercel Dashboard: в процессе
- ⏳ Тестирование: ожидает

## Следующие шаги

1. **Обновить переменные окружения** в Vercel Dashboard
2. **Перезапустить деплой** для применения изменений
3. **Протестировать** все основные страницы
4. **Проверить** работу аутентификации
5. **Настроить** мониторинг и аналитику
