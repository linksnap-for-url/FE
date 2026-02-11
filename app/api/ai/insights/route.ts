import { NextRequest, NextResponse } from "next/server"
import { API_ENDPOINTS } from "@/lib/api-config"

// Lambda AI Insights response type
interface LambdaInsightsResponse {
  analysis_type: string
  data_summary?: {
    total_urls: number
    total_clicks: number
    top_referers: string[]
    top_devices: string[]
    countries?: string[]
  }
  model_info?: {
    type: string
    accuracy: number | null
    auc_roc: number | null
    loaded: boolean
    trained_at?: string | null
  }
  conversion_prediction?: unknown | null
  rfm_summary?: unknown | null
  segmentation_summary?: unknown | null
  product_summary?: unknown | null
  ai_insights: string
  generated_at: string
  data_source: string
}

async function callLambdaInsights(analysisType: string): Promise<{ data: LambdaInsightsResponse | null; error: string | null; status: number }> {
  try {
    const response = await fetch(API_ENDPOINTS.AI_INSIGHTS, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ type: analysisType }),
    })

    const data = await response.json()

    if (!response.ok) {
      // Lambda에서 에러 응답이 온 경우
      const errorMsg = data.error || "Lambda API 에러"
      console.error(`Lambda AI Insights error (type: ${analysisType}):`, errorMsg)
      return { data: null, error: errorMsg, status: response.status }
    }

    return { data, error: null, status: response.status }
  } catch (err) {
    console.error(`Lambda AI Insights fetch error (type: ${analysisType}):`, err)
    return { data: null, error: "Lambda API 연결 실패", status: 500 }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type } = body

    // Map frontend types to Lambda API types
    let analysisType: string = "full"

    if (type === "url" || type === "traffic" || type === "referrer") {
      analysisType = "traffic"
    } else if (type === "marketing" || type === "conversion") {
      analysisType = "conversion"
    } else if (type === "site" || type === "full") {
      analysisType = "full"
    } else if (type === "segmentation") {
      analysisType = "full"
    }

    // 1차 시도: 원래 타입으로 호출
    let result = await callLambdaInsights(analysisType)

    // 2차 시도: 에러 발생 시 traffic으로 fallback
    if (result.error && analysisType !== "traffic") {
      console.log(`Falling back to traffic type (original: ${analysisType})`)
      result = await callLambdaInsights("traffic")
    }

    // fallback도 실패하면 에러 반환
    if (result.error || !result.data) {
      return NextResponse.json(
        { error: result.error || "AI 분석 생성에 실패했습니다" },
        { status: result.status || 500 }
      )
    }

    const data = result.data

    // Parse sections from markdown
    const sections = parseMarkdownSections(data.ai_insights)

    // Model info (Bedrock only)
    const modelInfo = data.model_info || null

    // Transform response based on requested type
    if (type === "url" || type === "traffic") {
      const trafficSection = sections.find(s =>
        s.title.includes("트래픽") || s.title.includes("패턴")
      )
      const trafficPattern = trafficSection?.content || sections[0]?.content || data.ai_insights

      return NextResponse.json({
        trafficPattern: cleanMarkdown(trafficPattern),
        dataSummary: data.data_summary,
        generatedAt: data.generated_at,
        modelInfo,
      })
    }

    if (type === "referrer") {
      const referrerSection = sections.find(s =>
        s.title.includes("채널") || s.title.includes("유입") || s.title.includes("경로")
      )
      const referrerAnalysis = referrerSection?.content || sections[2]?.content || data.ai_insights

      return NextResponse.json({
        referrerAnalysis: cleanMarkdown(referrerAnalysis),
        dataSummary: data.data_summary,
        generatedAt: data.generated_at,
        modelInfo,
      })
    }

    if (type === "marketing" || type === "conversion") {
      // conversion 타입이 BE에서 에러나면 traffic 응답으로 대체됨
      // 마케팅 관련 섹션을 찾거나, 없으면 전체를 보여줌
      const marketingSections = sections.filter(s =>
        s.title.includes("마케팅") ||
        s.title.includes("타겟") ||
        s.title.includes("전환") ||
        s.title.includes("액션") ||
        s.title.includes("실행") ||
        s.title.includes("전략") ||
        s.title.includes("채널")
      )

      const targetAnalysis = marketingSections.length > 0
        ? renumberAndCleanSections(marketingSections)
        : sections.length > 0
          ? renumberAndCleanSections(sections)
          : cleanMarkdown(data.ai_insights)

      return NextResponse.json({
        targetAnalysis,
        dataSummary: data.data_summary,
        generatedAt: data.generated_at,
        modelInfo,
      })
    }

    if (type === "segmentation") {
      const segmentationAnalysis = sections.length > 0
        ? renumberAndCleanSections(sections)
        : cleanMarkdown(data.ai_insights)

      return NextResponse.json({
        segmentationAnalysis,
        dataSummary: data.data_summary,
        generatedAt: data.generated_at,
        modelInfo,
      })
    }

    if (type === "site" || type === "full") {
      const trendAnalysis = sections.length > 0
        ? renumberAndCleanSections(sections)
        : cleanMarkdown(data.ai_insights)

      return NextResponse.json({
        trendAnalysis,
        dataSummary: data.data_summary,
        generatedAt: data.generated_at,
        modelInfo,
      })
    }

    // Default
    return NextResponse.json({
      insights: data.ai_insights,
      dataSummary: data.data_summary,
      generatedAt: data.generated_at,
      analysisType: data.analysis_type,
      modelInfo,
    })

  } catch (error) {
    console.error("AI Insights error:", error)
    return NextResponse.json(
      { error: "AI 분석 생성에 실패했습니다" },
      { status: 500 }
    )
  }
}

interface ParsedSection {
  title: string
  content: string
  fullContent: string
}

// Remove ### headers and clean up markdown
function cleanMarkdown(text: string): string {
  return text
    .replace(/^#{2,3}\s+\d*\.?\s*/gm, "")
    .replace(/^\s*\n/gm, "\n")
    .trim()
}

// Renumber sections starting from 1 and remove ### headers
function renumberAndCleanSections(sections: ParsedSection[]): string {
  return sections.map((section, index) => {
    const titleWithoutNumber = section.title.replace(/^\d+\.\s*/, "").trim()
    const newTitle = `${index + 1}. ${titleWithoutNumber}`
    return `${newTitle}\n${section.content.trim()}`
  }).join("\n\n")
}

// Parse markdown into sections based on headers (### or ##)
function parseMarkdownSections(markdown: string): ParsedSection[] {
  const sections: ParsedSection[] = []
  const lines = markdown.split("\n")

  let currentSection: ParsedSection | null = null

  for (const line of lines) {
    const headerMatch = line.match(/^(#{2,3})\s+(.+)$/)

    if (headerMatch) {
      if (currentSection) {
        currentSection.content = currentSection.content.trim()
        currentSection.fullContent = currentSection.fullContent.trim()
        sections.push(currentSection)
      }

      const title = headerMatch[2]
      currentSection = {
        title,
        content: "",
        fullContent: line + "\n"
      }
    } else if (currentSection) {
      currentSection.content += line + "\n"
      currentSection.fullContent += line + "\n"
    }
  }

  if (currentSection) {
    currentSection.content = currentSection.content.trim()
    currentSection.fullContent = currentSection.fullContent.trim()
    sections.push(currentSection)
  }

  return sections
}
