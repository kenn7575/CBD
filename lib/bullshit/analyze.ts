import type { Finding } from "./scan"
import type { TierId } from "./types"

export type Verdict = { min: number; label: string; blurb: string }

export const VERDICTS: Verdict[] = [
  {
    min: 0,
    label: "Squeaky clean",
    blurb: "Not a buzzword in sight. Are you sure this is from an office?",
  },
  {
    min: 1,
    label: "Mostly human",
    blurb: "A stray phrase slipped in, but a person clearly wrote this.",
  },
  {
    min: 20,
    label: "Office casual",
    blurb: "Standard workplace seasoning. Nobody will blink.",
  },
  {
    min: 40,
    label: "Middle management",
    blurb: "This could open a quarterly town hall.",
  },
  {
    min: 60,
    label: "Consultant grade",
    blurb: "Billable by the hour, and it shows.",
  },
  {
    min: 80,
    label: "Full synergy",
    blurb: "Almost no information survives. Impressive, in a way.",
  },
]

export type Analysis = {
  /** Integer 0–100. */
  score: number
  verdict: Verdict
  wordCount: number
  findingCount: number
  /** Distinct phrases, counted per dataset entry. */
  uniqueCount: number
  perTier: Record<TierId, number>
  perCategory: Record<string, number>
  perOrigin: Record<string, number>
  perLanguage: Record<string, number>
  perContext: Record<string, number>
  topContext: string | null
  worst: Finding | null
}

const WORD = /[\p{L}\p{N}]+(?:[-'’][\p{L}\p{N}]+)*/gu
const MIN_WORDS = 20
const STEEPNESS = 12

export function verdictFor(score: number): Verdict {
  let verdict = VERDICTS[0]
  for (const v of VERDICTS) if (score >= v.min) verdict = v
  return verdict
}

export function analyze(text: string, findings: Finding[]): Analysis {
  const wordCount = text.match(WORD)?.length ?? 0
  const perTier: Record<TierId, number> = {
    "tier-1": 0,
    "tier-2": 0,
    "tier-3": 0,
    "tier-4": 0,
  }
  const perCategory: Record<string, number> = {}
  const perOrigin: Record<string, number> = {}
  const perLanguage: Record<string, number> = {}
  const perContext: Record<string, number> = {}
  const unique = new Set<string>()
  const bump = (map: Record<string, number>, key: string) => {
    map[key] = (map[key] ?? 0) + 1
  }

  let weight = 0
  let worst: Finding | null = null
  for (const finding of findings) {
    const { entry } = finding
    weight += entry.score / 100
    perTier[entry.tier]++
    bump(perCategory, entry.category)
    bump(perOrigin, entry.origin)
    bump(perLanguage, entry.language)
    for (const context of entry.contexts) bump(perContext, context)
    unique.add(`${finding.lang}:${entry.id}`)
    if (!worst || entry.score > worst.entry.score) worst = finding
  }

  let topContext: string | null = null
  for (const [context, count] of Object.entries(perContext)) {
    if (topContext === null || count > perContext[topContext]) {
      topContext = context
    }
  }

  const score =
    findings.length === 0
      ? 0
      : Math.round(
          100 *
            (1 -
              Math.exp((-STEEPNESS * weight) / Math.max(wordCount, MIN_WORDS)))
        )

  return {
    score,
    verdict: verdictFor(score),
    wordCount,
    findingCount: findings.length,
    uniqueCount: unique.size,
    perTier,
    perCategory,
    perOrigin,
    perLanguage,
    perContext,
    topContext,
    worst,
  }
}
