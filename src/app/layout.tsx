import type { Metadata, Viewport } from "next";
import { Inter, Orbitron } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Skill Mapper - Gamified Learning Platform",
  description: "An interactive, gamified skill tree learning platform with progression tracking, achievements, and XP system",
  applicationName: "Skill Mapper",
  keywords: ["learning", "skills", "gamification", "education", "progress tracking", "skill tree"],
  authors: [{ name: "Skill Mapper Team" }],
  metadataBase: new URL("http://localhost:3000"),
  manifest: "/manifest.json",
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
    title: "Skill Mapper - Gamified Learning Platform",
    description: "Interactive skill tree learning with XP, badges, and progress tracking",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Skill Mapper - Interactive skill tree visualization",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Skill Mapper - Gamified Learning Platform",
    description: "Interactive skill tree learning with XP, badges, and progress tracking",
    images: ["/og-image.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#00f3ff",
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
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body
        className={`${inter.variable} ${orbitron.variable} antialiased bg-deep-void text-foreground`}
      >
        {children}
      </body>
    </html>
  );
}
