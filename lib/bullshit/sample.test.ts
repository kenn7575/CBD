import { describe, expect, it } from "vitest"
import { analyze } from "./analyze"
import { datasets } from "./data"
import { SAMPLES } from "./sample"
import { createScanner } from "./scan"

const scan = createScanner(datasets)

describe("samples", () => {
  it.each(["en", "da"] as const)(
    "%s sample hits every tier and stays short",
    (lang) => {
      const text = SAMPLES[lang]
      expect(text.length).toBeLessThan(1200)
      expect(text).toContain("\n\n")
      const a = analyze(text, scan(text))
      for (const tier of ["tier-1", "tier-2", "tier-3", "tier-4"] as const) {
        expect(a.perTier[tier]).toBeGreaterThan(0)
      }
      expect(a.score).toBeGreaterThanOrEqual(60)
    }
  )
  it("Danish sample is mostly matched by the Danish dataset", () => {
    const found = scan(SAMPLES.da)
    expect(found.filter((f) => f.lang === "da").length).toBeGreaterThan(
      found.length / 2
    )
  })
})
