export type Lang = "en" | "da"

export type TierId = "tier-1" | "tier-2" | "tier-3" | "tier-4"

export type TaxonomyItem = { id: string; label: string; description?: string }

export type Tier = {
  id: TierId
  label: string
  ranks: [number, number]
  score_range: [number, number]
}

export type Entry = {
  id: string
  rank: number
  slug: string
  term: string
  score: number
  tier: TierId
  category: string
  origin: string
  language: string
  contexts: string[]
  meaning: string
  variations: { text: string; slug: string }[]
  related: string[]
}

/** Category for promises about the future with no date or owner. */
export const UNSPECIFIED_TIME = "unspecified_time"

/**
 * A regular expression that maps matches to an entry. A named group `year`
 * makes the match count only when that year is at least `min_years_ahead`
 * years after the current one.
 */
export type PatternRule = {
  pattern: string
  id: string
  min_years_ahead?: number
}

export type Dataset = {
  meta: { title: string; language: string; count: number }
  taxonomy: {
    categories: TaxonomyItem[]
    contexts: TaxonomyItem[]
    origins: TaxonomyItem[]
    languages: TaxonomyItem[]
    tiers: Tier[]
  }
  entries: Entry[]
  indexes: {
    variation_lookup: Record<string, string>
    pattern_lookup?: PatternRule[]
  }
}

export type Datasets = Record<Lang, Dataset>
