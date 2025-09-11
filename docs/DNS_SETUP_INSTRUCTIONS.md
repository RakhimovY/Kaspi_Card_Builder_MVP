# 🔧 Инструкция по настройке DNS для tradecardbuilder.kz

## Проблема
Домен `tradecardbuilder.kz` не открывается в браузере, хотя `www.tradecardbuilder.kz` настроен правильно.

## Диагноз
- ✅ `www.tradecardbuilder.kz` → CNAME на `cname.vercel-dns.com` (работает)
- ❌ `tradecardbuilder.kz` → нет A записи (не работает)

## Решение

### Вариант 1: A запись (рекомендуется)

1. **Зайти в панель управления доменом**
   - Обычно это сайт регистратора домена (например, GoDaddy, Namecheap, etc.)

2. **Найти раздел DNS Management / DNS Records**

3. **Добавить A запись**:
   ```
   Тип: A
   Имя: @ (или оставить пустым)
   Значение: 76.76.19.61
   TTL: 3600 (или по умолчанию)
   ```

4. **Сохранить изменения**

### Вариант 2: CNAME запись (если поддерживается)

1. **Добавить CNAME запись**:
   ```
   Тип: CNAME
   Имя: @ (или оставить пустым)
   Значение: cname.vercel-dns.com
   TTL: 3600 (или по умолчанию)
   ```

2. **Сохранить изменения**

## Проверка настройки

После добавления DNS записи проверьте:

```bash
# Проверка A записи
dig tradecardbuilder.kz A

# Ожидаемый результат:
# tradecardbuilder.kz. 3600 IN A 76.76.19.61
```

## Время распространения

- **Обычно**: 5-30 минут
- **Максимум**: 24-48 часов
- **Проверка**: используйте `dig` или онлайн DNS checker

## Текущие DNS записи

### Работающие:
```
www.tradecardbuilder.kz. 3600 IN CNAME cname.vercel-dns.com.
```

### Нужно добавить:
```
tradecardbuilder.kz. 3600 IN A 76.76.19.61
```

## После настройки

1. **Подождать 5-30 минут**
2. **Проверить DNS**:
   ```bash
   dig tradecardbuilder.kz A
   ```
3. **Проверить сайт**:
   ```bash
   curl -I https://tradecardbuilder.kz
   ```
4. **Открыть в браузере**: https://tradecardbuilder.kz

## Troubleshooting

### Если DNS не обновляется:
1. Очистить DNS кэш:
   ```bash
   # macOS
   sudo dscacheutil -flushcache
   
   # Windows
   ipconfig /flushdns
   
   # Linux
   sudo systemctl restart systemd-resolved
   ```

2. Использовать другой DNS сервер:
   - Google DNS: 8.8.8.8, 8.8.4.4
   - Cloudflare DNS: 1.1.1.1, 1.0.0.1

### Если все еще не работает:
1. Проверить настройки в Vercel Dashboard
2. Убедиться, что домен добавлен в проект
3. Проверить SSL сертификат

## Следующие шаги

После успешной настройки DNS:
1. ✅ Обновить переменные окружения в Vercel
2. ✅ Протестировать все страницы
3. ✅ Настроить мониторинг
4. ✅ Проверить производительность
