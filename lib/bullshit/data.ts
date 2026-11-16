import da from "@/public/corporate_bullshit_dk.json"
import en from "@/public/corporate_bullshit_en.json"

import type { Datasets, Dataset, Entry, Lang } from "./types"

export const datasets: Datasets = {
  en: en as unknown as Dataset,
  da: da as unknown as Dataset,
}

const byId: Record<Lang, Map<string, Entry>> = {
  en: new Map(datasets.en.entries.map((e) => [e.id, e])),
  da: new Map(datasets.da.entries.map((e) => [e.id, e])),
}

export function entryById(lang: Lang, id: string): Entry | undefined {
  return byId[lang].get(id)
}
