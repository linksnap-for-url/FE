import { NextRequest, NextResponse } from "next/server"
import { getUrlByShortCode, recordClick, initializeMockData } from "@/lib/url-store"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  // Initialize mock data
  initializeMockData()

  const { code } = await params
  const entry = getUrlByShortCode(code)

  if (!entry) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  // Record click
  const referrer = request.headers.get("referer") || "direct"
  const userAgent = request.headers.get("user-agent") || "unknown"
  recordClick(code, referrer, userAgent)

  return NextResponse.redirect(entry.originalUrl)
}
