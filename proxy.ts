import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { LOCALE_COOKIE, LOCALE_PATH, preferredLocale } from "@/lib/i18n"

/**
 * English lives at `/`, Danish at `/dk`. A visit to `/` is sent to `/dk` when
 * the visitor chose Danish in the switcher or, without a saved choice, when
 * their browser prefers Danish.
 */
export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname !== "/") return NextResponse.next()

  const locale = preferredLocale(
    request.cookies.get(LOCALE_COOKIE)?.value,
    request.headers.get("accept-language")
  )
  if (locale !== "da") return NextResponse.next()

  const url = request.nextUrl.clone()
  url.pathname = LOCALE_PATH.da
  const response = NextResponse.redirect(url)
  // The answer depends on the visitor, so it must not be reused for others.
  response.headers.set("Cache-Control", "private, no-store")
  response.headers.set("Vary", "Accept-Language, Cookie")
  return response
}

export const config = {
  matcher: "/",
}
