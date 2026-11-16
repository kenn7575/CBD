import { describe, expect, it } from "vitest"
import { analyze } from "./analyze"
import { datasets } from "./data"
import { createScanner } from "./scan"

const scan = createScanner(datasets)
const run = (text: string) => analyze(text, scan(text))

describe("analyze", () => {
  it("scores empty and clean text 0", () => {
    for (const t of ["", "   \n ", "The cat sat on the mat."]) {
      const a = run(t)
      expect(a.score).toBe(0)
      expect(a.verdict.label).toBe("Squeaky clean")
      expect(a.topContext).toBeNull()
      expect(a.worst).toBeNull()
    }
  })
  it("does not max out on a single word", () => {
    const a = run("synergy")
    expect(a.score).toBeGreaterThan(0)
    expect(a.score).toBeLessThan(60)
  })
  it("scores a dense paragraph high", () => {
    const a = run(
      "Going forward we will leverage synergy, circle back on the low-hanging fruit and move the needle with a deep dive."
    )
    expect(a.score).toBeGreaterThanOrEqual(80)
    expect(a.verdict.label).toBe("Full synergy")
  })
  it("scores the same findings lower in a longer text", () => {
    const filler = " The report covers the third quarter in detail.".repeat(20)
    expect(run("We leverage synergy." + filler).score).toBeLessThan(
      run("We leverage synergy.").score
    )
  })
  it("counts findings, uniques and tiers", () => {
    const a = run("synergy synergy rightsizing")
    expect(a.findingCount).toBe(3)
    expect(a.uniqueCount).toBe(2)
    expect(a.perTier["tier-1"]).toBe(3)
    expect(a.perTier["tier-4"]).toBe(0)
    expect(a.worst?.entry.term).toBe("Rightsizing")
    expect(a.perLanguage.english).toBe(3)
  })
  it("always returns an integer between 0 and 100", () => {
    const a = run("synergy ".repeat(500))
    expect(Number.isInteger(a.score)).toBe(true)
    expect(a.score).toBeLessThanOrEqual(100)
  })
})
