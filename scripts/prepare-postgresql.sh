#!/bin/bash

# Script to prepare project for PostgreSQL deployment

echo "🚀 Preparing project for PostgreSQL deployment..."

# Create .env.local if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local file..."
    cat > .env.local << 'EOF'
# Development Environment Variables
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_SECRET="development-secret-key-32-chars-long"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (fill these with your values)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# OpenAI (fill this with your API key)
OPENAI_API_KEY="your-openai-api-key"
OPENAI_MODEL="gpt-4o-mini"

# Billing Provider
BILLING_PROVIDER="lemon-squeezy"

# Lemon Squeezy (fill these with your values)
LEMON_SQUEEZY_WEBHOOK_SECRET="your-webhook-secret"
LEMON_SQUEEZY_API_KEY="your-api-key"
NEXT_PUBLIC_LEMON_SQUEEZY_PRODUCT_ID="your-product-id"
NEXT_PUBLIC_LEMON_SQUEEZY_VARIANT_ID="your-variant-id"

# GTIN Provider
GTIN_PROVIDER="upcitemdb"
UPCITEMDB_USER_KEY="your-upcitemdb-user-key"

# Analytics
NEXT_PUBLIC_PLAUSIBLE_DOMAIN="localhost"

# App
NODE_ENV="development"
LOG_LEVEL="info"
EOF
    echo "✅ .env.local created"
else
    echo "✅ .env.local already exists"
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

echo "✅ Project prepared for PostgreSQL deployment!"
echo ""
echo "📋 Next steps:"
echo "1. Create Neon database and get connection string"
echo "2. Update DATABASE_URL in .env.local with Neon connection string"
echo "3. Run: npx prisma migrate deploy"
echo "4. Deploy to Vercel"
