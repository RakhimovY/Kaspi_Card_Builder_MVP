import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import PlausibleScript from "@/components/PlausibleScript";
import PageViewTracker from "@/components/PageViewTracker";
import { Toaster } from "@/components/ui/toast";
import { SessionProvider } from "@/components/SessionProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Trade Card Builder - Конструктор карточек товаров для Kaspi",
    template: "%s | Trade Card Builder"
  },
  description: "Создавайте профессиональные карточки товаров для Kaspi.kz за минуты. ИИ генерация описаний, автозаполнение по штрихкоду, экспорт для маркетплейса. Попробуйте бесплатно!",
  keywords: [
    "kaspi карточки товаров",
    "каспи маркетплейс",
    "создание карточек товаров",
    "конструктор карточек kaspi",
    "штрихкод товара",
    "автозаполнение товаров",
    "ИИ описания товаров",
    "экспорт для kaspi",
    "казахстан маркетплейс",
    "продажи на kaspi"
  ],
  authors: [{ name: "Trade Card Builder" }],
  creator: "Trade Card Builder",
  publisher: "Trade Card Builder",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://tradecardbuilder.com'),
  alternates: {
    canonical: '/',
    languages: {
      'ru': '/',
    },
  },
  openGraph: {
    title: "Trade Card Builder - Конструктор карточек товаров для Kaspi",
    description: "Создавайте профессиональные карточки товаров для Kaspi.kz за минуты. ИИ генерация описаний, автозаполнение по штрихкоду, экспорт для маркетплейса.",
    url: '/',
    siteName: 'Trade Card Builder',
    locale: 'ru_RU',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Trade Card Builder - Конструктор карточек товаров для Kaspi',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Trade Card Builder - Конструктор карточек товаров для Kaspi",
    description: "Создавайте профессиональные карточки товаров для Kaspi.kz за минуты. ИИ генерация описаний, автозаполнение по штрихкоду.",
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/logo-icon.svg',
    apple: '/logo-icon.png',
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <head>
        <PlausibleScript />
        <link rel="canonical" href={process.env.NEXT_PUBLIC_BASE_URL || 'https://tradecardbuilder.com'} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "Trade Card Builder",
              "description": "Создавайте профессиональные карточки товаров для Kaspi.kz за минуты. ИИ генерация описаний, автозаполнение по штрихкоду, экспорт для маркетплейса.",
              "url": process.env.NEXT_PUBLIC_BASE_URL || 'https://tradecardbuilder.com',
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "Web",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD",
                "availability": "https://schema.org/InStock",
                "description": "Бесплатный план с возможностью создания карточек товаров"
              },
              "creator": {
                "@type": "Organization",
                "name": "Trade Card Builder",
                "url": process.env.NEXT_PUBLIC_BASE_URL || 'https://tradecardbuilder.com'
              },
              "featureList": [
                "Автозаполнение по штрихкоду",
                "ИИ генерация описаний",
                "Экспорт для Kaspi маркетплейса",
                "Обработка изображений",
                "Мультиязычная поддержка"
              ],
              "screenshot": (process.env.NEXT_PUBLIC_BASE_URL || 'https://tradecardbuilder.com') + '/og-image.png',
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "ratingCount": "127",
                "bestRating": "5",
                "worstRating": "1"
              }
            })
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>
          <PageViewTracker />
          {children}
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  );
}
