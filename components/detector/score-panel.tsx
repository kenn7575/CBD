import { Card, CardContent } from "@/components/ui/card"
import type { Analysis } from "@/lib/bullshit/analyze"
import { label, TIER_SOLID } from "@/lib/bullshit/labels"
import type { Lang, TierId } from "@/lib/bullshit/types"
import { dictionaries } from "@/lib/i18n"
import { cn } from "@/lib/utils"

function scoreTier(score: number): TierId {
  if (score >= 80) return "tier-1"
  if (score >= 60) return "tier-2"
  if (score >= 40) return "tier-3"
  return "tier-4"
}

type Row = { id: string; name: string; count: number; barClass: string }

function Breakdown({ title, rows }: { title: string; rows: Row[] }) {
  const max = Math.max(...rows.map((row) => row.count), 1)
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {title}
      </h3>
      <ul className="flex flex-col gap-1.5">
        {rows.map((row) => (
          <li key={row.id} className="flex flex-col gap-0.5">
            <div className="flex justify-between gap-2 text-xs">
              <span className="truncate">{row.name}</span>
              <span className="font-mono text-muted-foreground">
                {row.count}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className={cn("h-full rounded-full", row.barClass)}
                style={{ width: `${(row.count / max) * 100}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

function rowsFrom(
  counts: Record<string, number>,
  name: (id: string) => string,
  barClass: (id: string) => string
): Row[] {
  return Object.entries(counts)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([id, count]) => ({
      id,
      name: name(id),
      count,
      barClass: barClass(id),
    }))
}

export function ScorePanel({
  analysis,
  lang,
  locale,
}: {
  analysis: Analysis
  /** Language of the pasted text; picks the taxonomy labels. */
  lang: Lang
  /** Interface language. */
  locale: Lang
}) {
  const t = dictionaries[locale]
  const { score, worst, topContext } = analysis
  const verdict = t.verdicts[analysis.verdict.min] ?? analysis.verdict
  const tier = scoreTier(score)
  const neutral = () => "bg-foreground/60"
  const hasFindings = analysis.findingCount > 0

  return (
    <Card>
      <CardContent className="flex flex-col gap-6">
        <div className="grid gap-6 md:grid-cols-[auto_1fr] md:items-center">
          <div className="flex items-baseline gap-2">
            <span
              className="font-heading text-6xl leading-none font-semibold tabular-nums"
              aria-label={t.scoreAria(score)}
            >
              {score}
            </span>
            <span className="text-sm text-muted-foreground">/ 100</span>
          </div>
          <div className="flex flex-col gap-2">
            <div>
              <div className="font-heading text-lg leading-snug font-medium">
                {verdict.label}
              </div>
              <p className="text-sm text-muted-foreground">{verdict.blurb}</p>
            </div>
            <div
              className="h-2.5 overflow-hidden rounded-full bg-muted"
              role="presentation"
            >
              <div
                className={cn(
                  "h-full rounded-full transition-[width] duration-300",
                  TIER_SOLID[tier]
                )}
                style={{ width: `${score}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {t.stats(
                analysis.findingCount,
                analysis.uniqueCount,
                analysis.wordCount
              )}
            </p>
          </div>
        </div>

        {hasFindings && (
          <>
            <div className="grid gap-3 text-sm sm:grid-cols-2">
              {worst && (
                <p>
                  <span className="text-muted-foreground">
                    {t.worstOffender}{" "}
                  </span>
                  <span className="font-medium">{worst.entry.term}</span>
                  <span className="text-muted-foreground">
                    {" "}
                    — {worst.entry.meaning}
                  </span>
                </p>
              )}
              {topContext && (
                <p>
                  <span className="text-muted-foreground">{t.readsLike} </span>
                  <span className="font-medium">
                    {label(lang, "contexts", topContext)}
                  </span>
                </p>
              )}
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <Breakdown
                title={t.byTier}
                rows={rowsFrom(
                  analysis.perTier,
                  (id) => label(lang, "tiers", id),
                  (id) => TIER_SOLID[id as TierId]
                )}
              />
              <Breakdown
                title={t.byCategory}
                rows={rowsFrom(
                  analysis.perCategory,
                  (id) => label(lang, "categories", id),
                  neutral
                )}
              />
              <Breakdown
                title={t.byOrigin}
                rows={rowsFrom(
                  analysis.perOrigin,
                  (id) => label(lang, "origins", id),
                  neutral
                )}
              />
              <Breakdown
                title={t.byLanguage}
                rows={rowsFrom(
                  analysis.perLanguage,
                  (id) => label(lang, "languages", id),
                  neutral
                )}
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
