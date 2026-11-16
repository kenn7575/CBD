import { Detector } from "@/components/detector/detector"
import { LangSwitcher } from "@/components/lang-switcher"
import type { Lang } from "@/lib/bullshit/types"
import { dictionaries } from "@/lib/i18n"

export function Home({ locale }: { locale: Lang }) {
  const t = dictionaries[locale]

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-6xl flex-col gap-6 p-4 md:p-8">
      <header className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            {t.title}
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">{t.intro}</p>
        </div>
        <LangSwitcher locale={locale} />
      </header>
      <Detector locale={locale} />
      <footer className="font-mono text-xs text-muted-foreground">
        {t.darkModeHint[0]}
        <kbd>d</kbd>
        {t.darkModeHint[1]}
      </footer>
    </main>
  )
}
