"use client"

import { Badge } from "@/components/ui/badge"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Separator } from "@/components/ui/separator"
import { entryById } from "@/lib/bullshit/data"
import { describe, label, TIER_HIGHLIGHT } from "@/lib/bullshit/labels"
import type { Finding } from "@/lib/bullshit/scan"
import type { Lang } from "@/lib/bullshit/types"
import { dictionaries } from "@/lib/i18n"
import { cn } from "@/lib/utils"

/** Fit a dataset meaning ("Layoffs.") into the middle of a sentence. */
function inlineMeaning(finding: Finding): string {
  const meaning = finding.entry.meaning.replace(/\.$/, "")
  const startsUpper = /^\p{Lu}/u.test(finding.text)
  return startsUpper
    ? meaning
    : meaning.charAt(0).toLowerCase() + meaning.slice(1)
}

export function FindingMark({
  finding,
  plain,
  locale,
}: {
  finding: Finding
  plain: boolean
  locale: Lang
}) {
  const t = dictionaries[locale]
  const { entry, lang } = finding
  const tierClass = TIER_HIGHLIGHT[entry.tier]
  const matchedDiffers =
    finding.text.replace(/\s+/g, " ").toLowerCase() !== entry.term.toLowerCase()
  const related = entry.related
    .map((id) => entryById(lang, id))
    .filter((e) => e !== undefined)
  const categoryDescription = describe(lang, "categories", entry.category)

  return (
    <HoverCard>
      <HoverCardTrigger
        delay={120}
        closeDelay={80}
        render={
          <mark
            tabIndex={0}
            className={cn(
              "cursor-help rounded-sm box-decoration-clone px-0.5 py-px outline-none focus-visible:ring-2 focus-visible:ring-ring",
              tierClass,
              plain && "italic"
            )}
          />
        }
      >
        {plain ? inlineMeaning(finding) : finding.text}
      </HoverCardTrigger>
      <HoverCardContent className="flex w-80 flex-col gap-2.5 p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="font-heading text-base leading-snug font-medium">
              {entry.term}
            </div>
            {matchedDiffers && (
              <div className="text-xs text-muted-foreground">
                {t.matchedAs(finding.text.replace(/\s+/g, " "))}
              </div>
            )}
          </div>
          <Badge className={cn("shrink-0", tierClass)}>
            {label(lang, "tiers", entry.tier)}
          </Badge>
        </div>

        <p className="text-sm">
          <span className="text-muted-foreground">{t.actuallyMeans} </span>
          {entry.meaning}
        </p>

        <div className="font-mono text-xs text-muted-foreground">
          {t.rankLine(entry.rank, entry.score)}
        </div>

        <Separator />

        <div className="text-xs">
          <span className="font-medium">
            {label(lang, "categories", entry.category)}
          </span>
          {categoryDescription && (
            <span className="text-muted-foreground">
              {" "}
              — {categoryDescription}
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-1">
          <Badge variant="secondary">
            {label(lang, "origins", entry.origin)}
          </Badge>
          <Badge variant="secondary">
            {label(lang, "languages", entry.language)}
          </Badge>
          {entry.contexts.map((context) => (
            <Badge key={context} variant="outline">
              {label(lang, "contexts", context)}
            </Badge>
          ))}
        </div>

        {related.length > 0 && (
          <div className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{t.related} </span>
            {related.map((e) => e.term).join(" · ")}
          </div>
        )}
      </HoverCardContent>
    </HoverCard>
  )
}
