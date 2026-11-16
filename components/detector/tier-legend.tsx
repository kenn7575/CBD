import { datasets } from "@/lib/bullshit/data"
import { TIER_HIGHLIGHT } from "@/lib/bullshit/labels"
import { cn } from "@/lib/utils"

export function TierLegend({ className }: { className?: string }) {
  return (
    <ul className={cn("flex flex-wrap gap-1.5 text-xs", className)}>
      {datasets.en.taxonomy.tiers.map((tier) => (
        <li
          key={tier.id}
          title={`Ranks ${tier.ranks[0]}–${tier.ranks[1]}, score ${tier.score_range[0]}–${tier.score_range[1]}`}
          className={cn(
            "rounded-sm px-1.5 py-0.5 font-medium",
            TIER_HIGHLIGHT[tier.id]
          )}
        >
          {tier.label}
        </li>
      ))}
    </ul>
  )
}
