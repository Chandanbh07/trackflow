import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "TradeFlow - Stock Trading Dashboard",
  description: "Professional stock monitoring dashboard with real-time price updates",
  icons: {
    icon: [
      {
        url: "/tf-icon-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/tf-icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/tf-icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/tf-apple-icon.png",
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
