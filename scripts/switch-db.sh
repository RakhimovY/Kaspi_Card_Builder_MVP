#!/bin/bash

# Скрипт для переключения между локальной (SQLite) и cloud (PostgreSQL) базой данных

set -e

LOCAL_ENV=".env.local"
CLOUD_ENV=".env"
SCHEMA_FILE="prisma/schema.prisma"

echo "🔄 Переключение базы данных..."

if [ -f "$LOCAL_ENV" ] && [ -f "$CLOUD_ENV" ]; then
    echo "✅ Найдены оба файла окружения"
    
    # Проверяем текущий провайдер
    CURRENT_PROVIDER=$(grep "provider = " "$SCHEMA_FILE" | head -1 | sed 's/.*provider = "\([^"]*\)".*/\1/')
    
    if [ "$CURRENT_PROVIDER" = "sqlite" ]; then
        echo "🔄 Переключаемся на PostgreSQL (cloud)..."
        
        # Обновляем схему для PostgreSQL
        sed -i '' 's/provider = "sqlite"/provider = "postgresql"/' "$SCHEMA_FILE"
        sed -i '' 's/metadata          String?  \/\/ JSON as string for SQLite/metadata          Json?    \/\/ provider-specific data/' "$SCHEMA_FILE"
        sed -i '' 's/attributes  String?  \/\/ JSON as string for SQLite/attributes  Json?    \/\/ flexible attributes object/' "$SCHEMA_FILE"
        sed -i '' 's/metadata    String?  \/\/ JSON as string for SQLite/metadata    Json?    \/\/ EXIF, processing info/' "$SCHEMA_FILE"
        sed -i '' 's/rawJson   String   \/\/ JSON as string for SQLite/rawJson   Json     \/\/ full response from external service/' "$SCHEMA_FILE"
        
        # Переключаем .env файлы
        mv "$LOCAL_ENV" "$LOCAL_ENV.backup"
        mv "$CLOUD_ENV" "$LOCAL_ENV"
        mv "$LOCAL_ENV.backup" "$CLOUD_ENV"
        
        echo "✅ Переключились на PostgreSQL"
        echo "📝 Используйте: npm run prisma:migrate"
        
    elif [ "$CURRENT_PROVIDER" = "postgresql" ]; then
        echo "🔄 Переключаемся на SQLite (локальная)..."
        
        # Обновляем схему для SQLite
        sed -i '' 's/provider = "postgresql"/provider = "sqlite"/' "$SCHEMA_FILE"
        sed -i '' 's/metadata          Json?    \/\/ provider-specific data/metadata          String?  \/\/ JSON as string for SQLite/' "$SCHEMA_FILE"
        sed -i '' 's/attributes  Json?    \/\/ flexible attributes object/attributes  String?  \/\/ JSON as string for SQLite/' "$SCHEMA_FILE"
        sed -i '' 's/metadata    Json?    \/\/ EXIF, processing info/metadata    String?  \/\/ JSON as string for SQLite/' "$SCHEMA_FILE"
        sed -i '' 's/rawJson   Json     \/\/ full response from external service/rawJson   String   \/\/ JSON as string for SQLite/' "$SCHEMA_FILE"
        
        # Переключаем .env файлы
        mv "$CLOUD_ENV" "$CLOUD_ENV.backup"
        mv "$LOCAL_ENV" "$CLOUD_ENV"
        mv "$CLOUD_ENV.backup" "$LOCAL_ENV"
        
        echo "✅ Переключились на SQLite"
        echo "📝 Используйте: npm run prisma:db:push"
        
    else
        echo "❌ Неизвестный провайдер: $CURRENT_PROVIDER"
        exit 1
    fi
    
    # Генерируем клиент
    echo "🔧 Генерируем Prisma клиент..."
    npm run prisma:generate
    
    echo "✅ Переключение завершено!"
    
else
    echo "❌ Не найдены файлы окружения"
    echo "Убедитесь, что существуют $LOCAL_ENV и $CLOUD_ENV"
    exit 1
fi
