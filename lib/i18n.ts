import type { Lang } from "./bullshit/types"

/**
 * Pick the interface language from an Accept-Language header.
 * Danish wins when it is ranked above English; on equal weight the one
 * listed first wins. Anything else is English.
 */
export function pickLocale(header: string | null | undefined): Lang {
  const best: Record<Lang, { q: number; index: number }> = {
    da: { q: 0, index: -1 },
    en: { q: 0, index: -1 },
  }
  const parts = (header ?? "").split(",")
  for (let index = 0; index < parts.length; index++) {
    const [tag, ...params] = parts[index].trim().split(";")
    const primary = tag.trim().toLowerCase().split(/[-_]/)[0]
    if (primary !== "da" && primary !== "en") continue
    let q = 1
    for (const param of params) {
      const [key, value] = param.trim().split("=")
      if (key.trim().toLowerCase() !== "q") continue
      const parsed = Number.parseFloat(value ?? "")
      if (Number.isFinite(parsed)) q = Math.min(1, Math.max(0, parsed))
    }
    if (q > best[primary].q) best[primary] = { q, index }
  }
  if (best.da.q === 0) return "en"
  if (best.da.q !== best.en.q) return best.da.q > best.en.q ? "da" : "en"
  return best.da.index < best.en.index ? "da" : "en"
}

/** Cookie that remembers a choice made with the language switcher. */
export const LOCALE_COOKIE = "lang"

/** Where each language lives. English is the default at the root. */
export const LOCALE_PATH: Record<Lang, string> = { en: "/", da: "/dk" }

/** A saved choice beats the browser's language. */
export function preferredLocale(
  cookie: string | null | undefined,
  header: string | null | undefined
): Lang {
  if (cookie === "da" || cookie === "en") return cookie
  return pickLocale(header)
}

export function localeFromPath(pathname: string): Lang {
  return pathname === "/dk" || pathname.startsWith("/dk/") ? "da" : "en"
}

const count = (n: number, lang: Lang) => n.toLocaleString(NUMBER_LOCALE[lang])

export const NUMBER_LOCALE: Record<Lang, string> = {
  en: "en-US",
  da: "da-DK",
}

export type Dictionary = {
  title: string
  metaDescription: string
  intro: string
  darkModeHint: [before: string, after: string]
  /** Accessible name of the language switcher. */
  language: string
  loadSample: string
  clear: string
  plainLanguage: string
  yourText: string
  placeholder: string
  scan: string
  scanResult: string
  emptyResult: string
  scoreAria: (score: number) => string
  stats: (findings: number, unique: number, words: number) => string
  worstOffender: string
  readsLike: string
  byTier: string
  byCategory: string
  byOrigin: string
  byLanguage: string
  matchedAs: (text: string) => string
  actuallyMeans: string
  rankLine: (rank: number, score: number) => string
  related: string
  tierTitle: (ranks: [number, number], scores: [number, number]) => string
  /** Keyed by `Verdict.min` from lib/bullshit/analyze. */
  verdicts: Record<number, { label: string; blurb: string }>
}

const en: Dictionary = {
  title: "Corporate Bullshit Detector",
  metaDescription:
    "Paste text and see the corporate bullshit in it, highlighted and scored.",
  intro:
    "Paste any text to find the buzzwords, euphemisms and consultant dialect hiding in it, in English and Danish. Hover a highlight to see what it actually means.",
  darkModeHint: ["Press ", " to toggle dark mode"],
  language: "Language",
  loadSample: "Load sample",
  clear: "Clear",
  plainLanguage: "Plain language",
  yourText: "Your text",
  placeholder: "Paste an email, a strategy memo or a job ad…",
  scan: "Scan",
  scanResult: "Scan result",
  emptyResult: "Paste some text to see how bad it is.",
  scoreAria: (score) => `Bullshit score ${score} out of 100`,
  stats: (findings, unique, words) =>
    `${count(findings, "en")} ${findings === 1 ? "finding" : "findings"} · ${count(
      unique,
      "en"
    )} unique ${unique === 1 ? "phrase" : "phrases"} · ${count(words, "en")} ${
      words === 1 ? "word" : "words"
    }`,
  worstOffender: "Worst offender:",
  readsLike: "Reads like:",
  byTier: "By tier",
  byCategory: "By category",
  byOrigin: "By origin",
  byLanguage: "By language",
  matchedAs: (text) => `matched as “${text}”`,
  actuallyMeans: "Actually means:",
  rankLine: (rank, score) => `#${rank} of 100 · score ${score}`,
  related: "Related:",
  tierTitle: (ranks, scores) =>
    `Ranks ${ranks[0]}–${ranks[1]}, score ${scores[0]}–${scores[1]}`,
  verdicts: {
    0: {
      label: "Squeaky clean",
      blurb: "Not a buzzword in sight. Are you sure this is from an office?",
    },
    1: {
      label: "Mostly human",
      blurb: "A stray phrase slipped in, but a person clearly wrote this.",
    },
    20: {
      label: "Office casual",
      blurb: "Standard workplace seasoning. Nobody will blink.",
    },
    40: {
      label: "Middle management",
      blurb: "This could open a quarterly town hall.",
    },
    60: {
      label: "Consultant grade",
      blurb: "Billable by the hour, and it shows.",
    },
    80: {
      label: "Full synergy",
      blurb: "Almost no information survives. Impressive, in a way.",
    },
  },
}

const da: Dictionary = {
  title: "Corporate Bullshit Detector",
  metaDescription:
    "Indsæt en tekst og se bullshitten i den, markeret og med score.",
  intro:
    "Indsæt en tekst og find de buzzwords, eufemismer og konsulentfloskler, der gemmer sig i den, på dansk og engelsk. Hold musen over en markering for at se, hvad den i virkeligheden betyder.",
  darkModeHint: ["Tryk på ", " for at slå mørk tilstand til eller fra"],
  language: "Sprog",
  loadSample: "Indlæs eksempel",
  clear: "Ryd",
  plainLanguage: "Klart sprog",
  yourText: "Din tekst",
  placeholder: "Indsæt en mail, et strategioplæg eller et jobopslag…",
  scan: "Scanning",
  scanResult: "Scanningsresultat",
  emptyResult: "Indsæt en tekst for at se, hvor slemt det står til.",
  scoreAria: (score) => `Bullshit-score ${score} ud af 100`,
  stats: (findings, unique, words) =>
    `${count(findings, "da")} fund · ${count(unique, "da")} ${
      unique === 1 ? "unikt udtryk" : "unikke udtryk"
    } · ${count(words, "da")} ord`,
  worstOffender: "Værste synder:",
  readsLike: "Lyder som:",
  byTier: "Efter niveau",
  byCategory: "Efter kategori",
  byOrigin: "Efter oprindelse",
  byLanguage: "Efter sprog",
  matchedAs: (text) => `fundet som ”${text}”`,
  actuallyMeans: "Betyder i virkeligheden:",
  rankLine: (rank, score) => `Nr. ${rank} af 100 · score ${score}`,
  related: "Beslægtede udtryk:",
  tierTitle: (ranks, scores) =>
    `Placering ${ranks[0]}–${ranks[1]}, score ${scores[0]}–${scores[1]}`,
  verdicts: {
    0: {
      label: "Pletfri",
      blurb:
        "Ikke et buzzword i sigte. Er du sikker på, det kommer fra et kontor?",
    },
    1: {
      label: "Overvejende menneskelig",
      blurb:
        "En enkelt floskel har sneget sig ind, men det er tydeligvis skrevet af et menneske.",
    },
    20: {
      label: "Business casual",
      blurb: "Den sædvanlige kontorjargon. Ingen løfter et øjenbryn.",
    },
    40: {
      label: "Mellemleder",
      blurb: "Det her kunne åbne et kvartalsmøde for hele huset.",
    },
    60: {
      label: "Konsulentkvalitet",
      blurb: "Faktureret pr. time, og det kan ses.",
    },
    80: {
      label: "Fuld synergi",
      blurb: "Næsten ingen information overlever. Imponerende, på en måde.",
    },
  },
}

export const dictionaries: Record<Lang, Dictionary> = { en, da }
