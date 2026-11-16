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
import type { Lang } from "@/lib/bullshit/types"
import { cn } from "@/lib/utils"

export const MAX_CHARS = 10000

const scan = createScanner(datasets)
const SAMPLE_ORDER: Lang[] = ["en", "da"]
const PANE = "h-[26rem]"

export function Detector() {
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
      lang: (danish > findings.length - danish ? "da" : "en") as Lang,
    }
  }, [text])

  const loadSample = () => {
    setText(SAMPLES[SAMPLE_ORDER[sampleIndex % SAMPLE_ORDER.length]])
    setSampleIndex((i) => i + 1)
  }

  const atLimit = text.length >= MAX_CHARS

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" onClick={loadSample}>
          Load sample
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setText("")}
          disabled={text.length === 0}
        >
          Clear
        </Button>
        <label
          htmlFor={plainId}
          className="ml-auto flex cursor-pointer items-center gap-2 text-sm"
        >
          <Switch id={plainId} checked={plain} onCheckedChange={setPlain} />
          Plain language
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="flex min-w-0 flex-col gap-2">
          <div className="flex h-6 items-center justify-between gap-2">
            <label htmlFor={inputId} className="text-sm font-medium">
              Your text
            </label>
            <span
              className={cn(
                "font-mono text-xs text-muted-foreground",
                atLimit && "text-destructive"
              )}
            >
              {text.length.toLocaleString("en-US")} /{" "}
              {MAX_CHARS.toLocaleString("en-US")}
            </span>
          </div>
          <Textarea
            id={inputId}
            value={text}
            maxLength={MAX_CHARS}
            onChange={(event) =>
              setText(event.target.value.slice(0, MAX_CHARS))
            }
            placeholder="Paste an email, a strategy memo or a job ad…"
            spellCheck={false}
            className={cn(
              "field-sizing-fixed resize-none leading-relaxed",
              PANE
            )}
          />
        </section>

        <section className="flex min-w-0 flex-col gap-2">
          <div className="flex min-h-6 flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-medium">Scan</h2>
            <TierLegend />
          </div>
          <ResultPane segments={segments} plain={plain} className={PANE} />
        </section>
      </div>

      <ScorePanel analysis={analysis} lang={lang} />
    </div>
  )
}
