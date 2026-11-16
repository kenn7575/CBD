"use client"

import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import type { Lang } from "@/lib/bullshit/types"
import { dictionaries, LOCALE_COOKIE, LOCALE_PATH } from "@/lib/i18n"
import { cn } from "@/lib/utils"

const OPTIONS: { lang: Lang; name: string }[] = [
  { lang: "en", name: "English" },
  { lang: "da", name: "Dansk" },
]

/** Remember the choice so `/` stops redirecting by browser language. */
function remember(lang: Lang) {
  document.cookie = `${LOCALE_COOKIE}=${lang}; path=/; max-age=31536000; samesite=lax`
}

export function LangSwitcher({
  locale,
  className,
}: {
  locale: Lang
  className?: string
}) {
  return (
    <nav
      aria-label={dictionaries[locale].language}
      className={cn(
        "inline-flex shrink-0 gap-0.5 rounded-lg border border-border p-0.5",
        className
      )}
    >
      {OPTIONS.map(({ lang, name }) => (
        <Link
          key={lang}
          href={LOCALE_PATH[lang]}
          // A prefetch of `/` would run before the choice is saved and could
          // be answered with the redirect back to Danish.
          prefetch={false}
          hrefLang={lang}
          lang={lang}
          aria-current={lang === locale ? "true" : undefined}
          onClick={() => remember(lang)}
          className={buttonVariants({
            variant: lang === locale ? "secondary" : "ghost",
            size: "xs",
          })}
        >
          {name}
        </Link>
      ))}
    </nav>
  )
}
