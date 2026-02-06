import { NextRequest, NextResponse } from "next/server"
import { API_ENDPOINTS } from "@/lib/api-config"

// Lambda AI Insights response type
interface LambdaInsightsResponse {
  analysis_type: string
  data_summary: {
    total_urls: number
    total_clicks: number
    top_referers: string[]
    top_devices: string[]
  }
  ai_insights: string
  generated_at: string
  data_source: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type } = body

    // Map frontend types to Lambda API types
    let analysisType: "full" | "traffic" | "conversion" = "full"
    
    if (type === "url" || type === "traffic") {
      analysisType = "traffic"
    } else if (type === "marketing" || type === "conversion") {
      analysisType = "conversion"
    } else if (type === "site" || type === "full") {
      analysisType = "full"
    }

    // Call Lambda Bedrock API
    const response = await fetch(API_ENDPOINTS.AI_INSIGHTS, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ type: analysisType }),
    })

    const data: LambdaInsightsResponse = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: "AI 분석 생성에 실패했습니다" },
        { status: response.status }
      )
    }

    // Transform response based on requested type
    if (type === "url" || type === "traffic") {
      return NextResponse.json({
        trafficPattern: data.ai_insights,
        referrerAnalysis: extractSection(data.ai_insights, "채널") || data.ai_insights,
        dataSummary: data.data_summary,
        generatedAt: data.generated_at,
      })
    }

    if (type === "marketing" || type === "conversion") {
      return NextResponse.json({
        targetAnalysis: data.ai_insights,
        dataSummary: data.data_summary,
        generatedAt: data.generated_at,
      })
    }

    if (type === "site" || type === "full") {
      return NextResponse.json({
        trendAnalysis: data.ai_insights,
        dataSummary: data.data_summary,
        generatedAt: data.generated_at,
      })
    }

    // Default: return full insights
    return NextResponse.json({
      insights: data.ai_insights,
      dataSummary: data.data_summary,
      generatedAt: data.generated_at,
      analysisType: data.analysis_type,
    })

  } catch (error) {
    console.error("AI Insights error:", error)
    return NextResponse.json(
      { error: "AI 분석 생성에 실패했습니다" },
      { status: 500 }
    )
  }
}

// Helper to extract specific section from markdown insights
function extractSection(markdown: string, keyword: string): string | null {
  const lines = markdown.split("\n")
  let capturing = false
  const result: string[] = []

  for (const line of lines) {
    if (line.toLowerCase().includes(keyword.toLowerCase()) && line.startsWith("#")) {
      capturing = true
      result.push(line)
      continue
    }
    if (capturing) {
      if (line.startsWith("#") && !line.toLowerCase().includes(keyword.toLowerCase())) {
        break
      }
      result.push(line)
    }
  }

  return result.length > 0 ? result.join("\n").trim() : null
}
