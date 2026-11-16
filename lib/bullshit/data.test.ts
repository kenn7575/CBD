import { describe, expect, it } from "vitest"
import { datasets, entryById } from "./data"

describe("datasets", () => {
  it("loads 100 entries per language", () => {
    expect(datasets.en.entries).toHaveLength(100)
    expect(datasets.da.entries).toHaveLength(100)
  })
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
