import { NextRequest, NextResponse } from "next/server"
import { createShortUrl, initializeMockData } from "@/lib/url-store"

export async function POST(request: NextRequest) {
  try {
    // Initialize mock data on first request
    initializeMockData()

    const body = await request.json()
    const { url } = body

    if (!url) {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      )
    }

    // Validate URL
    try {
      new URL(url)
    } catch {
      return NextResponse.json(
        { error: "Invalid URL" },
        { status: 400 }
      )
    }

    const entry = createShortUrl(url)
    const host = request.headers.get("host") || "localhost:3000"
    const protocol = host.includes("localhost") ? "http" : "https"
    const shortUrl = `${protocol}://${host}/s/${entry.shortCode}`

    return NextResponse.json({
      shortUrl,
      shortCode: entry.shortCode,
      originalUrl: entry.originalUrl
    })
  } catch {
    return NextResponse.json(
      { error: "Failed to shorten URL" },
      { status: 500 }
    )
  }
}
