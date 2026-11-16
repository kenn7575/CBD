import { Detector } from "@/components/detector/detector"

export default function Page() {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-6xl flex-col gap-6 p-4 md:p-8">
      <header className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Corporate Bullshit Detector
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Paste any text to find the buzzwords, euphemisms and consultant
          dialect hiding in it, in English and Danish. Hover a highlight to see
          what it actually means.
        </p>
      </header>
      <Detector />
      <footer className="font-mono text-xs text-muted-foreground">
        Press <kbd>d</kbd> to toggle dark mode
      </footer>
    </main>
  )
}
