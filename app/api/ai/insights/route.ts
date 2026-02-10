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

    // Parse sections from markdown
    const sections = parseMarkdownSections(data.ai_insights)

    // Transform response based on requested type
    if (type === "url" || type === "traffic") {
      // 트래픽 패턴 분석: Only traffic pattern section
      const trafficSection = sections.find(s => 
        s.title.includes("트래픽") || s.title.includes("패턴")
      )
      const trafficPattern = trafficSection?.content || sections[0]?.content || data.ai_insights

      // 유입 경로 분석: Channel/referrer related section
      const referrerSection = sections.find(s => 
        s.title.includes("채널") || s.title.includes("유입") || s.title.includes("경로")
      )
      const referrerAnalysis = referrerSection?.content || sections[2]?.content || ""

      return NextResponse.json({
        trafficPattern: cleanMarkdown(trafficPattern),
        referrerAnalysis: cleanMarkdown(referrerAnalysis),
        dataSummary: data.data_summary,
        generatedAt: data.generated_at,
      })
    }

    if (type === "marketing" || type === "conversion") {
      // 마케팅 제안: Marketing, target, action items
      const marketingSections = sections.filter(s =>
        s.title.includes("마케팅") || 
        s.title.includes("타겟") || 
        s.title.includes("전환") ||
        s.title.includes("액션") ||
        s.title.includes("실행")
      )
      
      // Renumber sections starting from 1
      const targetAnalysis = marketingSections.length > 0
        ? renumberAndCleanSections(marketingSections)
        : cleanMarkdown(data.ai_insights)

      return NextResponse.json({
        targetAnalysis,
        dataSummary: data.data_summary,
        generatedAt: data.generated_at,
      })
    }

    if (type === "site" || type === "full") {
      // Renumber all sections starting from 1
      const trendAnalysis = sections.length > 0
        ? renumberAndCleanSections(sections)
        : cleanMarkdown(data.ai_insights)

      return NextResponse.json({
        trendAnalysis,
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

interface ParsedSection {
  title: string
  content: string
  fullContent: string
}

// Remove ### headers and clean up markdown
function cleanMarkdown(text: string): string {
  return text
    .replace(/^#{2,3}\s+\d*\.?\s*/gm, "") // Remove ## or ### with optional numbers
    .replace(/^\s*\n/gm, "\n") // Remove empty lines at start
    .trim()
}

// Renumber sections starting from 1 and remove ### headers
function renumberAndCleanSections(sections: ParsedSection[]): string {
  return sections.map((section, index) => {
    // Extract the title without the number prefix
    const titleWithoutNumber = section.title.replace(/^\d+\.\s*/, "").trim()
    // Create new numbered title (without ###)
    const newTitle = `${index + 1}. ${titleWithoutNumber}`
    // Combine with content
    return `${newTitle}\n${section.content.trim()}`
  }).join("\n\n")
}

// Parse markdown into sections based on headers (### or ##)
function parseMarkdownSections(markdown: string): ParsedSection[] {
  const sections: ParsedSection[] = []
  const lines = markdown.split("\n")
  
  let currentSection: ParsedSection | null = null
  
  for (const line of lines) {
    // Check if line is a header (## or ###)
    const headerMatch = line.match(/^(#{2,3})\s+(.+)$/)
    
    if (headerMatch) {
      // Save previous section
      if (currentSection) {
        currentSection.content = currentSection.content.trim()
        currentSection.fullContent = currentSection.fullContent.trim()
        sections.push(currentSection)
      }
      
      // Start new section
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
  
  // Don't forget the last section
  if (currentSection) {
    currentSection.content = currentSection.content.trim()
    currentSection.fullContent = currentSection.fullContent.trim()
    sections.push(currentSection)
  }
  
  return sections
}
