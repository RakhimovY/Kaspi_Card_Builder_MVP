import Script from 'next/script'

interface StructuredDataProps {
  type?: 'landing' | 'application' | 'organization'
}

export default function StructuredData({ type = 'landing' }: StructuredDataProps) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://tradecardbuilder.com'
  
  const getStructuredData = () => {
    const baseData = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Trade Card Builder",
      "description": "Создавайте профессиональные карточки товаров для Kaspi.kz за минуты. ИИ генерация описаний, автозаполнение по штрихкоду, экспорт для маркетплейса.",
      "url": baseUrl,
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web",
      "creator": {
        "@type": "Organization",
        "name": "Trade Card Builder",
        "url": baseUrl,
        "sameAs": [
          "https://wa.me/77086934037",
          "https://t.me/YerkebulanR"
        ]
      },
      "offers": [
        {
          "@type": "Offer",
          "name": "Бесплатный план",
          "price": "0",
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock",
          "description": "Бесплатный план с возможностью создания карточек товаров"
        },
        {
          "@type": "Offer",
          "name": "Pro план",
          "price": "4.99",
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock",
          "description": "Расширенные возможности для профессионального использования"
        }
      ],
      "featureList": [
        "Автозаполнение по штрихкоду",
        "ИИ генерация описаний",
        "Экспорт для Kaspi маркетплейса",
        "Обработка изображений",
        "Мультиязычная поддержка",
        "Быстрое создание карточек товаров",
        "Автоматическое заполнение характеристик"
      ],
      "screenshot": `${baseUrl}/og-image.png`,
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "ratingCount": "127",
        "bestRating": "5",
        "worstRating": "1"
      },
      "potentialAction": {
        "@type": "UseAction",
        "target": `${baseUrl}/studio`,
        "name": "Создать карточку товара"
      }
    }

    if (type === 'landing') {
      return {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": baseData.name,
        "description": baseData.description,
        "url": baseData.url,
        "mainEntity": {
          ...baseData
        },
        "breadcrumb": {
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Главная",
              "item": baseUrl
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "Конструктор карточек товаров для Kaspi",
              "item": `${baseUrl}/landing`
            }
          ]
        }
      }
    }

    if (type === 'organization') {
      return {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Trade Card Builder",
        "url": baseUrl,
        "logo": `${baseUrl}/logo-icon.png`,
        "description": "Создавайте профессиональные карточки товаров для Kaspi.kz за минуты",
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": "+77086934037",
          "contactType": "customer service",
          "availableLanguage": ["Russian", "Kazakh"]
        },
        "sameAs": [
          "https://wa.me/77086934037",
          "https://t.me/YerkebulanR"
        ],
        "foundingDate": "2024",
        "areaServed": {
          "@type": "Country",
          "name": "Kazakhstan"
        }
      }
    }

    return baseData
  }

  return (
    <Script
      id="structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(getStructuredData())
      }}
    />
  )
}
