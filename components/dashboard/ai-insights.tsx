"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, TrendingUp, Target, Clock, Share2, RefreshCw, AlertCircle } from "lucide-react"

interface UrlStats {
  shortCode: string
  originalUrl: string
  totalClicks: number
  todayClicks: number
  yesterdayClicks: number
  clicksByHour: { hour: string; clicks: number }[]
  dailyClicks: { date: string; clicks: number }[]
  deviceStats: { name: string; value: number }[]
  referrerStats: { name: string; value: number }[]
  createdAt: string
}

interface Analytics {
  totalClicks: number
  totalUrls: number
  popularUrls: { shortCode: string; originalUrl: string; clicks: number; createdAt: string }[]
  urlStats: UrlStats[]
}

interface AiInsightsProps {
  analytics: Analytics
  selectedUrl?: string
}

interface UrlInsightData {
  trafficPattern: string
  referrerAnalysis: string
}

interface SiteInsightData {
  trendAnalysis: string
}

interface MarketingInsightData {
  targetAnalysis: string
}

export function AiInsights({ analytics, selectedUrl }: AiInsightsProps) {
  const [urlInsights, setUrlInsights] = useState<UrlInsightData | null>(null)
  const [siteInsights, setSiteInsights] = useState<SiteInsightData | null>(null)
  const [marketingInsights, setMarketingInsights] = useState<MarketingInsightData | null>(null)
  
  const [isLoadingUrl, setIsLoadingUrl] = useState(false)
  const [isLoadingSite, setIsLoadingSite] = useState(false)
  const [isLoadingMarketing, setIsLoadingMarketing] = useState(false)
  
  const [errorUrl, setErrorUrl] = useState("")
  const [errorSite, setErrorSite] = useState("")
  const [errorMarketing, setErrorMarketing] = useState("")

  const currentUrlStats = analytics.urlStats.find(u => u.shortCode === selectedUrl)

  const generateUrlInsights = async () => {
    if (!currentUrlStats) return
    setIsLoadingUrl(true)
    setErrorUrl("")

    try {
      const response = await fetch("/api/ai/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          type: "url",
          urlStats: currentUrlStats
        })
      })

      if (!response.ok) throw new Error("AI 분석 생성에 실패했습니다")
      const data = await response.json()
      setUrlInsights(data)
    } catch (err) {
      setErrorUrl(err instanceof Error ? err.message : "오류가 발생했습니다")
    } finally {
      setIsLoadingUrl(false)
    }
  }

  const generateSiteInsights = async () => {
    setIsLoadingSite(true)
    setErrorSite("")

    try {
      const response = await fetch("/api/ai/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          type: "site",
          analytics
        })
      })

      if (!response.ok) throw new Error("AI 분석 생성에 실패했습니다")
      const data = await response.json()
      setSiteInsights(data)
    } catch (err) {
      setErrorSite(err instanceof Error ? err.message : "오류가 발생했습니다")
    } finally {
      setIsLoadingSite(false)
    }
  }

  const generateMarketingInsights = async () => {
    if (!currentUrlStats) return
    setIsLoadingMarketing(true)
    setErrorMarketing("")

    try {
      const response = await fetch("/api/ai/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          type: "marketing",
          urlStats: currentUrlStats
        })
      })

      if (!response.ok) throw new Error("AI 분석 생성에 실패했습니다")
      const data = await response.json()
      setMarketingInsights(data)
    } catch (err) {
      setErrorMarketing(err instanceof Error ? err.message : "오류가 발생했습니다")
    } finally {
      setIsLoadingMarketing(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Section 1: URL별 분석 - 트래픽 패턴 */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">특정 URL 분석</h2>
        </div>

        {!currentUrlStats ? (
          <Card className="border-dashed">
            <CardContent className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">URL별 통계 탭에서 URL을 선택해주세요</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <CardTitle className="text-foreground">트래픽 패턴 분석</CardTitle>
                </div>
                <Button 
                  size="sm" 
                  onClick={generateUrlInsights} 
                  disabled={isLoadingUrl}
                >
                  {isLoadingUrl ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <CardDescription>
                /{currentUrlStats.shortCode} - 시간대/요일별 클릭 패턴 분석
              </CardDescription>
            </CardHeader>
            <CardContent>
              {errorUrl && (
                <div className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">{errorUrl}</span>
                </div>
              )}
              {urlInsights?.trafficPattern ? (
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                    {urlInsights.trafficPattern}
                  </p>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-border bg-muted/20 p-4">
                  <p className="text-center text-sm text-muted-foreground">
                    버튼을 클릭하여 AI 분석을 시작하세요
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Section 2: 마케팅 제안 */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Target className="h-4 w-4 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">마케팅 제안</h2>
        </div>

        {!currentUrlStats ? (
          <Card className="border-dashed">
            <CardContent className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">URL별 통계 탭에서 URL을 선택해주세요</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  <CardTitle className="text-foreground">타겟 분석</CardTitle>
                </div>
                <Button 
                  size="sm" 
                  onClick={generateMarketingInsights} 
                  disabled={isLoadingMarketing}
                >
                  {isLoadingMarketing ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <CardDescription>
                /{currentUrlStats.shortCode} - 유저 특성 및 마케팅 타겟 제안
              </CardDescription>
            </CardHeader>
            <CardContent>
              {errorMarketing && (
                <div className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">{errorMarketing}</span>
                </div>
              )}
              {marketingInsights?.targetAnalysis ? (
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                    {marketingInsights.targetAnalysis}
                  </p>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-border bg-muted/20 p-4">
                  <p className="text-center text-sm text-muted-foreground">
                    버튼을 클릭하여 AI 분석을 시작하세요
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Section 3: 유입 경로 분석 */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Share2 className="h-4 w-4 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">유입 경로 분석</h2>
        </div>

        {!currentUrlStats ? (
          <Card className="border-dashed">
            <CardContent className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">URL별 통계 탭에서 URL을 선택해주세요</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Share2 className="h-5 w-5 text-primary" />
                  <CardTitle className="text-foreground">채널별 분석</CardTitle>
                </div>
                <Button 
                  size="sm" 
                  onClick={generateUrlInsights} 
                  disabled={isLoadingUrl}
                >
                  {isLoadingUrl ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <CardDescription>
                /{currentUrlStats.shortCode} - 유입 채널별 특성 분석
              </CardDescription>
            </CardHeader>
            <CardContent>
              {errorUrl && (
                <div className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">{errorUrl}</span>
                </div>
              )}
              {urlInsights?.referrerAnalysis ? (
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                    {urlInsights.referrerAnalysis}
                  </p>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-border bg-muted/20 p-4">
                  <p className="text-center text-sm text-muted-foreground">
                    버튼을 클릭하여 AI 분석을 시작하세요
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Section 4: 전체 사이트 분석 */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">전체 사이트 분석</h2>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <CardTitle className="text-foreground">트렌드 분석</CardTitle>
              </div>
              <Button 
                size="sm" 
                onClick={generateSiteInsights} 
                disabled={isLoadingSite}
              >
                {isLoadingSite ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
              </Button>
            </div>
            <CardDescription>
              LinkSnap 전체 URL의 인기 카테고리 및 트렌드
            </CardDescription>
          </CardHeader>
          <CardContent>
            {errorSite && (
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{errorSite}</span>
              </div>
            )}
            {siteInsights?.trendAnalysis ? (
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                  {siteInsights.trendAnalysis}
                </p>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-border bg-muted/20 p-4">
                <p className="text-center text-sm text-muted-foreground">
                  버튼을 클릭하여 AI 분석을 시작하세요
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
