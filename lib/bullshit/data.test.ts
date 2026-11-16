import { describe, expect, it } from "vitest"
import { datasets, entryById } from "./data"

describe("datasets", () => {
  it.each(["en", "da"] as const)(
    "%s: meta, ranks and indexes match the entries",
    (lang) => {
      const { meta, entries, indexes, taxonomy } = datasets[lang]
      expect(entries.length).toBeGreaterThanOrEqual(100)
      expect(meta.count).toBe(entries.length)
      expect(entries.map((e) => e.rank).sort((a, b) => a - b)).toEqual(
        entries.map((_, i) => i + 1)
      )
      const ids = new Set(entries.map((e) => e.id))
      for (const id of Object.values(indexes.variation_lookup)) {
        expect(ids).toContain(id)
      }
      for (const rule of indexes.pattern_lookup ?? []) {
        expect(ids).toContain(rule.id)
        expect(() => new RegExp(rule.pattern, "u")).not.toThrow()
      }
      const categories = new Set(taxonomy.categories.map((c) => c.id))
      for (const e of entries) {
        expect(categories).toContain(e.category)
        for (const r of e.related) expect(ids).toContain(r)
      }
    }
  )
  it("shares taxonomy ids across languages", () => {
    for (const key of [
      "categories",
      "contexts",
      "origins",
      "languages",
      "tiers",
    ] as const) {
      expect(datasets.da.taxonomy[key].map((x) => x.id)).toEqual(
        datasets.en.taxonomy[key].map((x) => x.id)
      )
    }
  })
  it("resolves entries by id", () => {
    expect(entryById("en", "bs-en-001")?.term).toBe("Rightsizing")
    expect(entryById("da", "bs-001")?.meaning).toBe("Fyringer.")
    expect(entryById("en", "nope")).toBeUndefined()
  })
})
