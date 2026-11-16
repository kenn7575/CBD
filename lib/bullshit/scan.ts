import type { Datasets, Entry, Lang } from "./types"

export type Finding = {
  /** Index into the original text. */
  start: number
  /** Exclusive end index into the original text. */
  end: number
  /** The original slice, with its original casing and whitespace. */
  text: string
  /** The lookup key that matched, lower-case. */
  phrase: string
  lang: Lang
  entry: Entry
  /** The future year a pattern matched, e.g. 2030 in "frem mod 2030". */
  year?: number
}

export type Segment =
  { type: "text"; text: string } | { type: "finding"; finding: Finding }

export type ScanOptions = {
  /** The year that future years are measured from. Defaults to now. */
  currentYear?: number
}

type Candidate = { lang: Lang; entry: Entry }

type Rule = Candidate & { regex: RegExp; minYearsAhead: number }

type Raw = {
  start: number
  end: number
  text: string
  phrase: string
  candidates: Candidate[]
  year?: number
}

const LANGS: Lang[] = ["en", "da"]

/** Years further ahead than this are not promises, just numbers. */
const MAX_YEARS_AHEAD = 75

const BEFORE = "(?<![\\p{L}\\p{N}])"
const AFTER = "(?![\\p{L}\\p{N}])"

const normalize = (s: string) =>
  s.toLowerCase().replace(/\s+/g, " ").replace(/’/g, "'").trim()

const toPattern = (phrase: string) =>
  phrase
    .replace(/[.*+?^${}()|[\]\\/]/g, "\\$&")
    .replace(/ /g, "\\s+")
    .replace(/'/g, "['’]")

export function createScanner(
  datasets: Datasets,
  options: ScanOptions = {}
): (text: string) => Finding[] {
  const candidates = new Map<string, Candidate[]>()
  const rules: Rule[] = []
  for (const lang of LANGS) {
    const dataset = datasets[lang]
    const byId = new Map(dataset.entries.map((e) => [e.id, e]))
    for (const [key, id] of Object.entries(dataset.indexes.variation_lookup)) {
      const entry = byId.get(id)
      const phrase = normalize(key)
      if (!entry || !phrase) continue
      const list = candidates.get(phrase) ?? []
      list.push({ lang, entry })
      candidates.set(phrase, list)
    }
    for (const rule of dataset.indexes.pattern_lookup ?? []) {
      const entry = byId.get(rule.id)
      if (!entry) continue
      rules.push({
        lang,
        entry,
        regex: new RegExp(`${BEFORE}(?:${rule.pattern})${AFTER}`, "giu"),
        minYearsAhead: rule.min_years_ahead ?? 0,
      })
    }
  }

  const phrases = [...candidates.keys()].sort((a, b) => b.length - a.length)
  if (phrases.length === 0 && rules.length === 0) return () => []

  const pattern =
    phrases.length > 0
      ? new RegExp(
          `${BEFORE}(?:${phrases.map(toPattern).join("|")})${AFTER}`,
          "giu"
        )
      : null

  return (text: string) => {
    const currentYear = options.currentYear ?? new Date().getFullYear()
    const raw: Raw[] = []
    if (pattern) {
      for (const match of text.matchAll(pattern)) {
        const phrase = normalize(match[0])
        const list = candidates.get(phrase)
        if (list) {
          raw.push({
            start: match.index,
            end: match.index + match[0].length,
            text: match[0],
            phrase,
            candidates: list,
          })
        }
      }
    }
    for (const rule of rules) {
      for (const match of text.matchAll(rule.regex)) {
        const yearText = match.groups?.year
        const year = yearText === undefined ? undefined : Number(yearText)
        if (year !== undefined) {
          const ahead = year - currentYear
          if (ahead < rule.minYearsAhead || ahead > MAX_YEARS_AHEAD) continue
        }
        raw.push({
          start: match.index,
          end: match.index + match[0].length,
          text: match[0],
          phrase: normalize(match[0]),
          candidates: [{ lang: rule.lang, entry: rule.entry }],
          year,
        })
      }
    }

    // Keep the earliest, then longest, of overlapping matches. Matches of
    // the same span (a phrase and a pattern, or two languages) are merged.
    raw.sort((a, b) => a.start - b.start || b.end - a.end)
    const kept: Raw[] = []
    for (const r of raw) {
      const last = kept.at(-1)
      if (last && r.start === last.start && r.end === last.end) {
        for (const c of r.candidates) {
          const known = last.candidates.some(
            (k) => k.lang === c.lang && k.entry.id === c.entry.id
          )
          if (!known) last.candidates = [...last.candidates, c]
        }
        last.year ??= r.year
        continue
      }
      if (last && r.start < last.end) continue
      kept.push({ ...r })
    }

    // Matches found in only one language tell us which language the text leans to.
    const lean: Record<Lang, number> = { en: 0, da: 0 }
    for (const r of kept) {
      const langs = new Set(r.candidates.map((c) => c.lang))
      if (langs.size === 1) lean[r.candidates[0].lang]++
    }

    const pick = (list: Candidate[]): Candidate =>
      [...list].sort(
        (a, b) =>
          lean[b.lang] - lean[a.lang] ||
          b.entry.score - a.entry.score ||
          LANGS.indexOf(a.lang) - LANGS.indexOf(b.lang)
      )[0]

    return kept.map((r) => {
      const { lang, entry } = pick(r.candidates)
      return {
        start: r.start,
        end: r.end,
        text: r.text,
        phrase: r.phrase,
        lang,
        entry,
        ...(r.year !== undefined && { year: r.year }),
      }
    })
  }
}

export function toSegments(text: string, findings: Finding[]): Segment[] {
  const segments: Segment[] = []
  let cursor = 0
  for (const finding of findings) {
    if (finding.start > cursor) {
      segments.push({ type: "text", text: text.slice(cursor, finding.start) })
    }
    segments.push({ type: "finding", finding })
    cursor = finding.end
  }
  if (cursor < text.length) {
    segments.push({ type: "text", text: text.slice(cursor) })
  }
  return segments
}
