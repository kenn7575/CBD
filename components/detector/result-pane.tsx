"use client"

import { FindingMark } from "@/components/detector/finding-mark"
import type { Segment } from "@/lib/bullshit/scan"
import { cn } from "@/lib/utils"

export function ResultPane({
  segments,
  plain,
  className,
}: {
  segments: Segment[]
  plain: boolean
  className?: string
}) {
  return (
    <div
      aria-label="Scan result"
      className={cn(
        "overflow-auto rounded-lg border border-input bg-muted/30 px-2.5 py-2 text-base leading-relaxed md:text-sm",
        className
      )}
    >
      {segments.length === 0 ? (
        <p className="text-muted-foreground">
          Paste some text to see how bad it is.
        </p>
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
              />
            )
          )}
        </div>
      )}
    </div>
  )
}
