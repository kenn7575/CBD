"use client"

import { FindingMark } from "@/components/detector/finding-mark"
import type { Segment } from "@/lib/bullshit/scan"
import type { Lang } from "@/lib/bullshit/types"
import { dictionaries } from "@/lib/i18n"
import { cn } from "@/lib/utils"

export function ResultPane({
  segments,
  plain,
  locale,
  className,
}: {
  segments: Segment[]
  plain: boolean
  locale: Lang
  className?: string
}) {
  const t = dictionaries[locale]
  return (
    <div
      aria-label={t.scanResult}
      className={cn(
        "overflow-auto rounded-lg border border-input bg-muted/30 px-2.5 py-2 text-base leading-relaxed md:text-sm",
        className
      )}
    >
      {segments.length === 0 ? (
        <p className="text-muted-foreground">{t.emptyResult}</p>
      ) : (
        <div className="break-words whitespace-pre-wrap">
          {segments.map((segment, i) =>
            segment.type === "text" ? (
              <span key={i}>{segment.text}</span>
            ) : (
              <FindingMark
                key={`${i}-${segment.finding.start}`}
                finding={segment.finding}
                plain={plain}
                locale={locale}
              />
            )
          )}
        </div>
      )}
    </div>
  )
}
