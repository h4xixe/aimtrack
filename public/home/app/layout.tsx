import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Aim Track - Melhore sua mira em jogos FPS",
  description:
    "Melhore sua mira em jogos FPS com o Aim Track. Buff de aim assist, zero recoil e auto ping em um só aplicativo!",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-background`}>{children}</body>
    </html>
  )
}
