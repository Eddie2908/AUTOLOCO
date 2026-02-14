import type React from "react"
import type { Metadata, Viewport } from "next"

import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import Providers from "@/components/providers"
import "./globals.css"

import { Inter, Poppins, Geist as V0_Font_Geist, Source_Serif_4 as V0_Font_Source_Serif_4 } from "next/font/google"
import { Geist_Mono as V0_Font_Geist_Mono } from "next/font/google"

// Initialize fonts
const _geist = V0_Font_Geist({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
})
const _geistMono = V0_Font_Geist_Mono({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
})
const _sourceSerif_4 = V0_Font_Source_Serif_4({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
})

const _inter = Inter({ subsets: ["latin"] })
const _poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
})

export const metadata: Metadata = {
  title: "AUTOLOCO - Location de Véhicules au Cameroun",
  description:
    "Plateforme de location de véhicules entre particuliers et professionnels au Cameroun. Louez ou mettez en location votre véhicule en toute sécurité.",
  keywords: ["location véhicule", "Cameroun", "voiture", "moto", "rental", "Douala", "Yaoundé"],
  authors: [{ name: "AUTOLOCO" }],
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-16x16.jpg", sizes: "16x16", type: "image/jpeg" },
      { url: "/favicon-32x32.jpg", sizes: "32x32", type: "image/jpeg" },
      { url: "/favicon-48x48.jpg", sizes: "48x48", type: "image/jpeg" },
      { url: "/android-chrome-192x192.jpg", sizes: "192x192", type: "image/jpeg" },
      { url: "/android-chrome-512x512.jpg", sizes: "512x512", type: "image/jpeg" },
    ],
    apple: [
      { url: "/apple-touch-icon.jpg", sizes: "180x180", type: "image/jpeg" },
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/logo-icon.svg",
        color: "#16a34a",
      },
    ],
  },
  other: {
    "msapplication-TileColor": "#16a34a",
    "msapplication-config": "/browserconfig.xml",
  },
  openGraph: {
    title: "AUTOLOCO - Location de Véhicules au Cameroun",
    description: "La plateforme de référence pour la location de véhicules au Cameroun",
    type: "website",
    locale: "fr_CM",
    siteName: "AUTOLOCO",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "AUTOLOCO - Plateforme de location de véhicules au Cameroun",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AUTOLOCO - Location de Véhicules au Cameroun",
    description: "La plateforme de référence pour la location de véhicules au Cameroun",
    images: ["/og-image.jpg"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AUTOLOCO",
  },
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
  generator: "v0.app",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#16a34a" },
    { media: "(prefers-color-scheme: dark)", color: "#15803d" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <Providers>
          {children}
          <Toaster />
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}
