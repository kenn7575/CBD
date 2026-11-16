"use client"

import { useId, useMemo, useState } from "react"

import { ResultPane } from "@/components/detector/result-pane"
import { ScorePanel } from "@/components/detector/score-panel"
import { TierLegend } from "@/components/detector/tier-legend"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { analyze } from "@/lib/bullshit/analyze"
import { datasets } from "@/lib/bullshit/data"
import { SAMPLES } from "@/lib/bullshit/sample"
import { createScanner, toSegments } from "@/lib/bullshit/scan"
import { dictionaries, NUMBER_LOCALE } from "@/lib/i18n"
import type { Lang } from "@/lib/bullshit/types"
import { cn } from "@/lib/utils"

export const MAX_CHARS = 10000

const scan = createScanner(datasets)
const PANE = "h-[26rem]"

export function Detector({ locale }: { locale: Lang }) {
  const t = dictionaries[locale]
  const sampleOrder: Lang[] = locale === "da" ? ["da", "en"] : ["en", "da"]
  const [text, setText] = useState("")
  const [plain, setPlain] = useState(false)
  const [sampleIndex, setSampleIndex] = useState(0)
  const inputId = useId()
  const plainId = useId()

  const { segments, analysis, lang } = useMemo(() => {
    const findings = scan(text)
    const danish = findings.filter((f) => f.lang === "da").length
    return {
      segments: toSegments(text, findings),
      analysis: analyze(text, findings),
      // Language of the pasted text; the interface language until it shows.
      lang: (findings.length === 0
        ? locale
        : danish > findings.length - danish
          ? "da"
          : "en") as Lang,
    }
  }, [text, locale])

  const loadSample = () => {
    setText(SAMPLES[sampleOrder[sampleIndex % sampleOrder.length]])
    setSampleIndex((i) => i + 1)
  }

  const atLimit = text.length >= MAX_CHARS

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" onClick={loadSample}>
          {t.loadSample}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setText("")}
          disabled={text.length === 0}
        >
          {t.clear}
        </Button>
        <label
          htmlFor={plainId}
          className="ml-auto flex cursor-pointer items-center gap-2 text-sm"
        >
          <Switch id={plainId} checked={plain} onCheckedChange={setPlain} />
          {t.plainLanguage}
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="flex min-w-0 flex-col gap-2">
          <label htmlFor={inputId} className="text-sm font-medium">
            {t.yourText}
          </label>
          <Textarea
            id={inputId}
            value={text}
            maxLength={MAX_CHARS}
            onChange={(event) =>
              setText(event.target.value.slice(0, MAX_CHARS))
            }
            placeholder={t.placeholder}
            spellCheck={false}
            className={cn(
              "field-sizing-fixed resize-none leading-relaxed",
              PANE
            )}
          />
          <span
            className={cn(
              "self-end font-mono text-xs text-muted-foreground",
              atLimit && "text-destructive"
            )}
          >
            {text.length.toLocaleString(NUMBER_LOCALE[locale])} /{" "}
            {MAX_CHARS.toLocaleString(NUMBER_LOCALE[locale])}
          </span>
        </section>

        <section className="flex min-w-0 flex-col gap-2">
          <h2 className="text-sm font-medium">{t.scan}</h2>
          <ResultPane
            segments={segments}
            plain={plain}
            locale={locale}
            className={PANE}
          />
          <TierLegend lang={lang} locale={locale} />
        </section>
      </div>

      <ScorePanel analysis={analysis} lang={lang} locale={locale} />
    </div>
  )
}
