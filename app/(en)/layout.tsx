import { localeMetadata, RootShell } from "@/components/root-shell"

export const metadata = localeMetadata("en")

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <RootShell locale="en">{children}</RootShell>
}
