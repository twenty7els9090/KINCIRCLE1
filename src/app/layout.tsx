import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KINCIRCLE — Семейное приложение",
  description: "Многофункциональное приложение для семьи и друзей. Совместное ведение списков покупок, планирование мероприятий, вишлисты и напоминания о днях рождения.",
  keywords: ["KINCIRCLE", "семья", "друзья", "список покупок", "мероприятия", "вишлист", "Telegram Mini App"],
  authors: [{ name: "KINCIRCLE Team" }],
  icons: {
    icon: "/logo.svg",
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "KINCIRCLE",
    description: "Семейное приложение для заботы друг о друге",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#8B1E3F",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        {/* Telegram WebApp script */}
        <script src="https://telegram.org/js/telegram-web-app.js" async />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-[#1C1C1E]`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
