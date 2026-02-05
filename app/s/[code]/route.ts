import { NextRequest, NextResponse } from "next/server"
import { API_ENDPOINTS } from "@/lib/api-config"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params

  if (!code) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.redirect(API_ENDPOINTS.REDIRECT(code))
}
