import { datasets } from "@/lib/bullshit/data"
import {
  CATEGORY_MARK,
  describe,
  label,
  TIER_HIGHLIGHT,
} from "@/lib/bullshit/labels"
import { UNSPECIFIED_TIME, type Lang } from "@/lib/bullshit/types"
import { dictionaries } from "@/lib/i18n"
import { cn } from "@/lib/utils"

export function TierLegend({
  lang,
  locale,
  className,
}: {
  /** Language of the pasted text; picks the tier names, as in the results. */
  lang: Lang
  /** Interface language. */
  locale: Lang
  className?: string
}) {
  const t = dictionaries[locale]
  return (
    <ul className={cn("flex flex-wrap gap-1.5 text-xs", className)}>
      {datasets[lang].taxonomy.tiers.map((tier) => (
        <li
          key={tier.id}
          title={t.tierTitle(tier.ranks, tier.score_range)}
          className={cn(
            "rounded-sm px-1.5 py-0.5 font-medium",
            TIER_HIGHLIGHT[tier.id]
          )}
        >
          {tier.label}
        </li>
      ))}
      <li
        title={describe(lang, "categories", UNSPECIFIED_TIME)}
        className={cn(
          "rounded-sm px-1.5 py-0.5 font-medium",
          CATEGORY_MARK[UNSPECIFIED_TIME]
        )}
      >
        {label(lang, "categories", UNSPECIFIED_TIME)}
      </li>
    </ul>
  )
}
