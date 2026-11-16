import { localeMetadata, RootShell } from "@/components/root-shell"

export const metadata = localeMetadata("da")

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <RootShell locale="da">{children}</RootShell>
}
