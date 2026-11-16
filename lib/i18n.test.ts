import { describe, expect, it } from "vitest"

import {
  dictionaries,
  localeFromPath,
  pickLocale,
  preferredLocale,
} from "./i18n"

describe("pickLocale", () => {
  it.each([
    [null, "en"],
    [undefined, "en"],
    ["", "en"],
    ["da", "da"],
    ["da-DK,da;q=0.9,en-US;q=0.8,en;q=0.7", "da"],
    ["DA-dk", "da"],
    ["en-GB,en;q=0.9,da;q=0.8", "en"],
    ["en;q=0.5,da;q=0.9", "da"],
    ["da;q=0.5,en;q=0.5", "da"],
    ["en;q=0.5,da;q=0.5", "en"],
    ["da,en", "da"],
    ["en,da", "en"],
    ["da_DK,en;q=0.8", "da"],
    ["en,da;q=5", "en"],
    ["en;q=0.9,da;q=-1", "en"],
    ["de-DE,de;q=0.9", "en"],
    ["nb-NO,sv;q=0.9", "en"],
    ["de,da;q=0.3", "da"],
    ["da;q=0", "en"],
    ["da;q=abc", "da"],
    ["*", "en"],
  ])("%s -> %s", (header, expected) => {
    expect(pickLocale(header)).toBe(expected)
  })
})

describe("preferredLocale", () => {
  it.each([
    [undefined, "da-DK,da;q=0.9", "da"],
    [undefined, "en-US", "en"],
    [undefined, null, "en"],
    ["en", "da-DK,da;q=0.9", "en"],
    ["da", "en-US", "da"],
    ["da", null, "da"],
    ["fr", "da", "da"],
    ["", "en", "en"],
  ])("cookie %s, header %s -> %s", (cookie, header, expected) => {
    expect(preferredLocale(cookie, header)).toBe(expected)
  })
})

describe("localeFromPath", () => {
  it.each([
    ["/", "en"],
    ["/dk", "da"],
    ["/dk/", "da"],
    ["/dkx", "en"],
  ])("%s -> %s", (path, expected) => {
    expect(localeFromPath(path)).toBe(expected)
  })
})

describe("dictionaries", () => {
  it("formats large counts per language", () => {
    expect(dictionaries.en.stats(1234, 1, 1)).toContain("1,234 findings")
    expect(dictionaries.da.stats(1234, 1, 1)).toContain("1.234 fund")
  })

  it("has the same keys in both languages", () => {
    expect(Object.keys(dictionaries.da).sort()).toEqual(
      Object.keys(dictionaries.en).sort()
    )
  })

  it("has a verdict for every VERDICTS threshold", async () => {
    const { VERDICTS } = await import("./bullshit/analyze")
    for (const lang of ["en", "da"] as const) {
      for (const v of VERDICTS) {
        expect(dictionaries[lang].verdicts[v.min]).toBeDefined()
      }
    }
  })
})
