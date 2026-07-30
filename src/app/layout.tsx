import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Instrument_Sans, IBM_Plex_Mono } from "next/font/google";
import { PostHogProvider } from "@/lib/posthog";
import { env } from "@/env";
import "./globals.css";
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

const instrument = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
  display: "swap",
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Skill Mapper - Gamified Learning Platform for Interactive Skill Development",
  description: "Master new skills with Skill Mapper, an interactive gamified learning platform featuring visual skill trees, progression tracking, achievements, XP rewards, and personalized learning paths.",
  applicationName: "Skill Mapper",
  keywords: ["learning", "skills", "gamification", "education", "progress tracking", "skill tree", "interactive learning", "XP system", "achievements"],
  authors: [{ name: "Skill Mapper Team" }],
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL ?? "https://skill-mapper.vercel.app"),
  manifest: "/manifest.json",
  alternates: {
    canonical: env.NEXT_PUBLIC_APP_URL ?? "https://skill-mapper.vercel.app",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Skill Mapper",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "Skill Mapper",
    title: "Skill Mapper - Gamified Learning Platform for Interactive Skill Development",
    description: "Master new skills with Skill Mapper, an interactive gamified learning platform featuring visual skill trees, progression tracking, achievements, XP rewards, and personalized learning paths.",
    url: "https://skill-mapper.vercel.app",
    images: [
      {
        url: "https://skill-mapper.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "Skill Mapper - Interactive skill tree visualization with gamified learning experience",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Skill Mapper - Gamified Learning Platform",
    description: "Master new skills with interactive skill trees, XP rewards, achievements, and personalized learning paths.",
    images: ["https://skill-mapper.vercel.app/og-image.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#1a2e38",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body
        className={`${instrument.variable} ${bricolage.variable} ${plexMono.variable} antialiased bg-canvas text-foreground`}
      >
        <PostHogProvider>{children}</PostHogProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
