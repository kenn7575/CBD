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
}

export type Segment =
  { type: "text"; text: string } | { type: "finding"; finding: Finding }

type Candidate = { lang: Lang; entry: Entry }

const LANGS: Lang[] = ["en", "da"]

const normalize = (s: string) =>
  s.toLowerCase().replace(/\s+/g, " ").replace(/’/g, "'").trim()

const toPattern = (phrase: string) =>
  phrase
    .replace(/[.*+?^${}()|[\]\\/]/g, "\\$&")
    .replace(/ /g, "\\s+")
    .replace(/'/g, "['’]")

export function createScanner(datasets: Datasets): (text: string) => Finding[] {
  const candidates = new Map<string, Candidate[]>()
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
  }

  const phrases = [...candidates.keys()].sort((a, b) => b.length - a.length)
  if (phrases.length === 0) return () => []

  const pattern = new RegExp(
    `(?<![\\p{L}\\p{N}])(?:${phrases.map(toPattern).join("|")})(?![\\p{L}\\p{N}])`,
    "giu"
  )

  return (text: string) => {
    const raw: { start: number; text: string; phrase: string }[] = []
    for (const match of text.matchAll(pattern)) {
      const phrase = normalize(match[0])
      if (candidates.has(phrase)) {
        raw.push({ start: match.index, text: match[0], phrase })
      }
    }

    // Phrases found in only one language tell us which language the text leans to.
    const lean: Record<Lang, number> = { en: 0, da: 0 }
    for (const r of raw) {
      const list = candidates.get(r.phrase)!
      if (list.length === 1) lean[list[0].lang]++
    }

    const pick = (list: Candidate[]): Candidate =>
      [...list].sort(
        (a, b) =>
          lean[b.lang] - lean[a.lang] ||
          b.entry.score - a.entry.score ||
          LANGS.indexOf(a.lang) - LANGS.indexOf(b.lang)
      )[0]

    return raw.map((r) => {
      const { lang, entry } = pick(candidates.get(r.phrase)!)
      return {
        start: r.start,
        end: r.start + r.text.length,
        text: r.text,
        phrase: r.phrase,
        lang,
        entry,
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
