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
  title: "Trade Card Builder",
  description: "Профессиональные карточки товаров для Kaspi Marketplace",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html>
      <head>
        <PlausibleScript />
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
