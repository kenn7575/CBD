import { describe, expect, it } from "vitest"
import { datasets } from "./data"
import { createScanner, toSegments } from "./scan"

const scan = createScanner(datasets)
const terms = (text: string) => scan(text).map((f) => f.entry.term)

describe("scan", () => {
  it("finds a term and reports its position", () => {
    const [f] = scan("We need more synergy here.")
    expect(f.entry.id).toBe("bs-en-005")
    expect([f.start, f.end, f.text]).toEqual([13, 20, "synergy"])
  })
  it("is case-insensitive and keeps original casing", () => {
    expect(scan("SYNERGY")[0].text).toBe("SYNERGY")
  })
  it("matches variations to their entry", () => {
    expect(terms("They right-sized the team")).toEqual(["Rightsizing"])
  })
  it("prefers the longest phrase", () => {
    const found = scan("pick the low-hanging fruit")
    expect(found).toHaveLength(1)
    expect(found[0].phrase).toBe("pick the low-hanging fruit")
  })
  it("ignores phrases inside longer words", () => {
    expect(scan("safely fragil pingåben guruer")).toEqual([])
  })
  it("matches across line breaks and repeated spaces", () => {
    const [f] = scan("low-hanging\n   fruit")
    expect(f.entry.id).toBe("bs-en-006")
    expect(f.text).toBe("low-hanging\n   fruit")
  })
  it("matches typographic apostrophes", () => {
    expect(terms("Here we’re a family.")).toEqual(["We're a family"])
  })
  it("matches phrases with punctuation literally", () => {
    expect(terms("Har du båndbredde til det?")).toEqual([
      "Har du båndbredde til det?",
    ])
    expect(() => scan("primo/ultimo (ift. [x] *+?")).not.toThrow()
  })
  it("uses the Danish entry for shared phrases in Danish text", () => {
    const found = scan(
      "Vi er på en rejse med rightsizing og lavthængende frugter"
    )
    const shared = found.find((f) => f.phrase === "rightsizing")
    expect(shared?.lang).toBe("da")
  })
  it("uses the English entry for shared phrases in English text", () => {
    const found = scan("Going forward, rightsizing will move the needle")
    expect(found.find((f) => f.phrase === "rightsizing")?.lang).toBe("en")
  })
  it("finds the new Danish phrases", () => {
    const found = scan(
      "Vi har momentum i den digitale transformation og vender tilbage på et senere tidspunkt."
    )
    expect(found.map((f) => [f.entry.term, f.lang])).toEqual([
      ["Momentum", "da"],
      ["Digital transformation", "da"],
      ["På et tidspunkt", "da"],
    ])
    expect(found[2].entry.category).toBe("unspecified_time")
  })
  it("returns nothing for empty or clean text", () => {
    expect(scan("")).toEqual([])
    expect(scan("The cat sat on the mat.")).toEqual([])
  })
})

describe("future years", () => {
  const scan2026 = createScanner(datasets, { currentYear: 2026 })
  const years = (text: string) =>
    scan2026(text).map((f) => [f.text, f.year, f.lang])

  it("matches a prefixed future year as one finding", () => {
    expect(years("Vi vil være CO2-neutrale frem mod 2035.")).toEqual([
      ["frem mod 2035", 2035, "da"],
    ])
    expect(years("Next year? No, by 2027.")).toEqual([["by 2027", 2027, "en"]])
  })
  it("matches a bare year only when it is far enough ahead", () => {
    expect(years("Målet er nået i 2030").map(([t, y]) => [t, y])).toEqual([
      ["2030", 2030],
    ])
    expect(years("Budget 2027 er vedtaget")).toEqual([])
  })
  it("ignores past and current years and far-off numbers", () => {
    expect(years("Frem mod 2020 og inden 2026 voksede vi.")).toEqual([])
    expect(years("Ordrenummer 9999 og 1234")).toEqual([])
  })
  it("follows the text's language for a bare year", () => {
    const [f] = scan2026("Vi er på en rejse, og i 2030 er vi i mål.").filter(
      (x) => x.year
    )
    expect(f.lang).toBe("da")
  })
  it("uses the current year by default", () => {
    const next = new Date().getFullYear() + 5
    expect(scan(`frem mod ${next}`)[0]?.year).toBe(next)
  })
})

describe("toSegments", () => {
  it("reassembles to the original text", () => {
    const text = "  We leverage\n\nsynergy.  "
    const segs = toSegments(text, scan(text))
    expect(
      segs.map((s) => (s.type === "text" ? s.text : s.finding.text)).join("")
    ).toBe(text)
    expect(segs.filter((s) => s.type === "finding")).toHaveLength(2)
  })
  it("returns one text segment when there are no findings", () => {
    expect(toSegments("hello", [])).toEqual([{ type: "text", text: "hello" }])
    expect(toSegments("", [])).toEqual([])
  })
})
