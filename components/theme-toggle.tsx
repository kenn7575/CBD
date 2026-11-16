"use client"

import { MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import type { Lang } from "@/lib/bullshit/types"
import { dictionaries } from "@/lib/i18n"
import { cn } from "@/lib/utils"

export function ThemeToggle({
  locale,
  className,
}: {
  locale: Lang
  className?: string
}) {
  const { resolvedTheme, setTheme } = useTheme()
  const label = dictionaries[locale].toggleTheme

  return (
    <Button
      variant="outline"
      size="icon"
      aria-label={label}
      title={label}
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      // Matches the height of the bordered language switcher next to it.
      className={cn("size-7.5", className)}
    >
      {/* Icons swap via the `dark` class, so server and client render alike. */}
      <SunIcon className="dark:hidden" />
      <MoonIcon className="hidden dark:block" />
    </Button>
  )
}
