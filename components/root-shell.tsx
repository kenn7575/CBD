import type { Metadata } from "next"
import { Geist_Mono, Inter } from "next/font/google"

import "@/app/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import type { Lang } from "@/lib/bullshit/types"
import { dictionaries } from "@/lib/i18n"
import { cn } from "@/lib/utils"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export function localeMetadata(locale: Lang): Metadata {
  const t = dictionaries[locale]
  return { title: t.title, description: t.metaDescription }
}

/** The `<html>` document shared by the per-language root layouts. */
export function RootShell({
  locale,
  children,
}: Readonly<{
  locale: Lang
  children: React.ReactNode
}>) {
  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        inter.variable
      )}
    >
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
