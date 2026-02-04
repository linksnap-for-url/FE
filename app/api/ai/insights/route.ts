import { NextRequest, NextResponse } from "next/server"
import { generateText, Output } from "ai"
import { z } from "zod"

const urlInsightsSchema = z.object({
  trafficPattern: z.string().describe("트래픽 패턴 분석 결과"),
  referrerAnalysis: z.string().describe("유입 경로 분석 결과")
})

const siteInsightsSchema = z.object({
  trendAnalysis: z.string().describe("전체 사이트 트렌드 분석 결과")
})

const marketingInsightsSchema = z.object({
  targetAnalysis: z.string().describe("타겟 분석 및 마케팅 제안")
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type } = body

    if (type === "url") {
      const { urlStats } = body
      
      const prompt = `당신은 URL 단축 서비스의 데이터 분석 전문가입니다.

## 분석 대상 URL
- 단축 코드: /${urlStats.shortCode}
- 원본 URL: ${urlStats.originalUrl}
- 총 클릭: ${urlStats.totalClicks}회
- 오늘 클릭: ${urlStats.todayClicks}회
- 어제 클릭: ${urlStats.yesterdayClicks}회

## 시간대별 클릭 데이터
${urlStats.clicksByHour.map((h: { hour: string; clicks: number }) => `${h.hour}: ${h.clicks}회`).join(', ')}

## 유입 경로
${urlStats.referrerStats.map((r: { name: string; value: number }) => `- ${r.name}: ${r.value}회 (${((r.value / urlStats.totalClicks) * 100).toFixed(1)}%)`).join('\n')}

## 디바이스 분포
${urlStats.deviceStats.map((d: { name: string; value: number }) => `- ${d.name}: ${d.value}회`).join('\n')}

다음 형식으로 분석 결과를 제공해주세요:

1. 트래픽 패턴 분석 (trafficPattern):
예시 형식:
"이 URL은 [시간/요일]에 클릭이 급증해요.
[패턴에 대한 해석]
→ [구체적인 액션 제안]"

2. 유입 경로 분석 (referrerAnalysis):
예시 형식:
"[주요 유입 채널]에서 [비율]% 유입되는데,
[해당 채널 유저 특성]
→ [콘텐츠 최적화 제안]"

한국어로 자연스럽게, 친근한 말투로 작성해주세요.`

      const result = await generateText({
        model: "openai/gpt-4o-mini",
        prompt,
        output: Output.object({ schema: urlInsightsSchema })
      })

      return NextResponse.json(result.object)
    }

    if (type === "site") {
      const { analytics } = body
      
      const prompt = `당신은 URL 단축 서비스의 데이터 분석 전문가입니다.

## LinkSnap 전체 현황
- 등록된 총 URL 수: ${analytics.totalUrls}개
- 전체 클릭 수: ${analytics.totalClicks}회
- URL당 평균 클릭: ${Math.round(analytics.totalClicks / analytics.totalUrls)}회

## 인기 URL 순위
${analytics.popularUrls.slice(0, 5).map((u: { shortCode: string; originalUrl: string; clicks: number }, i: number) => 
  `${i + 1}. /${u.shortCode} (${u.clicks}회) - ${u.originalUrl}`
).join('\n')}

다음 형식으로 트렌드 분석 결과를 제공해주세요:

트렌드 분석 (trendAnalysis):
예시 형식:
"이번 주 인기 URL 카테고리:
1. [카테고리1] ([비율]%)
2. [카테고리2] ([비율]%)
3. [카테고리3] ([비율]%)

→ [트렌드에 대한 인사이트]"

URL 패턴을 분석하여 카테고리를 추론해주세요 (쇼핑몰, 유튜브, 뉴스, SNS, 블로그 등).
한국어로 자연스럽게, 친근한 말투로 작성해주세요.`

      const result = await generateText({
        model: "openai/gpt-4o-mini",
        prompt,
        output: Output.object({ schema: siteInsightsSchema })
      })

      return NextResponse.json(result.object)
    }

    if (type === "marketing") {
      const { urlStats } = body
      
      const prompt = `당신은 URL 단축 서비스의 마케팅 전문가입니다.

## 분석 대상 URL
- 단축 코드: /${urlStats.shortCode}
- 원본 URL: ${urlStats.originalUrl}
- 총 클릭: ${urlStats.totalClicks}회

## 디바이스 분포
${urlStats.deviceStats.map((d: { name: string; value: number }) => `- ${d.name}: ${d.value}회 (${((d.value / urlStats.totalClicks) * 100).toFixed(1)}%)`).join('\n')}

## 유입 경로
${urlStats.referrerStats.map((r: { name: string; value: number }) => `- ${r.name}: ${r.value}회 (${((r.value / urlStats.totalClicks) * 100).toFixed(1)}%)`).join('\n')}

## 시간대별 클릭
${urlStats.clicksByHour.map((h: { hour: string; clicks: number }) => `${h.hour}: ${h.clicks}회`).join(', ')}

다음 형식으로 타겟 분석 결과를 제공해주세요:

타겟 분석 (targetAnalysis):
예시 형식:
"이 URL 클릭 유저 특성:
- [디바이스 비율 및 특성]
- 주요 유입: [채널]
- 활동 시간: [시간대]

→ [추정 타겟층 및 마케팅 제안]"

한국어로 자연스럽게, 친근한 말투로 작성해주세요.`

      const result = await generateText({
        model: "openai/gpt-4o-mini",
        prompt,
        output: Output.object({ schema: marketingInsightsSchema })
      })

      return NextResponse.json(result.object)
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 })
  } catch (error) {
    console.error("AI Insights error:", error)
    return NextResponse.json(
      { error: "AI 분석 생성에 실패했습니다" },
      { status: 500 }
    )
  }
}
