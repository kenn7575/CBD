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
  it("returns nothing for empty or clean text", () => {
    expect(scan("")).toEqual([])
    expect(scan("The cat sat on the mat.")).toEqual([])
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
