import { datasets } from "./data"
import type { Lang, TierId } from "./types"

type Kind = "categories" | "contexts" | "origins" | "languages" | "tiers"

/** Display label for a taxonomy id, in the dataset's own language. */
export function label(lang: Lang, kind: Kind, id: string): string {
  const items: { id: string; label: string }[] = datasets[lang].taxonomy[kind]
  return items.find((item) => item.id === id)?.label ?? id
}

export function describe(
  lang: Lang,
  kind: "categories" | "contexts",
  id: string
): string | undefined {
  return datasets[lang].taxonomy[kind].find((item) => item.id === id)
    ?.description
}

/** Highlight classes per tier. Full strings so Tailwind can see them. */
export const TIER_HIGHLIGHT: Record<TierId, string> = {
  "tier-1": "bg-tier-1-bg text-tier-1-fg",
  "tier-2": "bg-tier-2-bg text-tier-2-fg",
  "tier-3": "bg-tier-3-bg text-tier-3-fg",
  "tier-4": "bg-tier-4-bg text-tier-4-fg",
}

export const TIER_SOLID: Record<TierId, string> = {
  "tier-1": "bg-tier-1",
  "tier-2": "bg-tier-2",
  "tier-3": "bg-tier-3",
  "tier-4": "bg-tier-4",
}
