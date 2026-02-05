import { NextRequest, NextResponse } from "next/server"
import { API_ENDPOINTS } from "@/lib/api-config"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url } = body

    if (!url) {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      )
    }

    // Validate URL format
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      return NextResponse.json(
        { error: "URL must start with http:// or https://" },
        { status: 400 }
      )
    }

    // Call Lambda API
    const response = await fetch(API_ENDPOINTS.SHORTEN, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || "Failed to shorten URL" },
        { status: response.status }
      )
    }

    // Return response matching Lambda API format
    return NextResponse.json({
      urlId: data.urlId,
      shortUrl: data.shortUrl,
      originalUrl: data.originalUrl,
      createdAt: data.createdAt,
      expiresAt: data.expiresAt,
    }, { status: 201 })

  } catch (error) {
    console.error("Shorten API error:", error)
    return NextResponse.json(
      { error: "Failed to shorten URL" },
      { status: 500 }
    )
  }
}
