"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, TrendingUp, Target, Clock, Share2, RefreshCw, AlertCircle, Users, Brain } from "lucide-react"

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

interface ModelInfo {
  type: string
  accuracy: number
  auc_roc: number
}

interface UrlInsightData {
  trafficPattern: string
  referrerAnalysis: string
  modelInfo?: ModelInfo | null
}

interface SiteInsightData {
  trendAnalysis: string
  modelInfo?: ModelInfo | null
  rfmSummary?: { segments: Record<string, { count: number }> } | null
  segmentationSummary?: { clusters: Record<string, { count: number }> } | null
  productSummary?: { total_products: number; total_revenue: number } | null
}

interface MarketingInsightData {
  targetAnalysis: string
  modelInfo?: ModelInfo | null
}

interface SegmentationInsightData {
  segmentationAnalysis: string
  modelInfo?: ModelInfo | null
  rfmSummary?: { segments: Record<string, { count: number }> } | null
  segmentationSummary?: { clusters: Record<string, { count: number }> } | null
  productSummary?: { total_products: number; total_revenue: number } | null
}

// Check if a numbered line is a section title (short, title-like)
function isSectionTitle(text: string): boolean {
  const titleKeywords = ["인사이트", "분석", "제안", "플랜", "전략", "추천", "시간대", "액션", "아이템", "요약", "현황", "트렌드", "세그먼트", "클러스터", "RFM", "고객"]
  const isShort = text.length < 25
  const hasKeyword = titleKeywords.some(keyword => text.includes(keyword))
  return (isShort && hasKeyword) || text.length < 15
}

// Component to render formatted insights with styled numbered headers
function FormattedInsight({ text }: { text: string }) {
  const lines = text.split("\n")
  
  return (
    <div className="space-y-2">
      {lines.map((line, index) => {
        const numberedMatch = line.match(/^(\d+)\.\s+(.+)$/)
        
        if (numberedMatch) {
          const content = numberedMatch[2]
          
          if (isSectionTitle(content)) {
            return (
              <div key={index} className="mt-4 first:mt-0">
                <h4 className="text-base font-semibold text-foreground">
                  <span className="text-primary">{numberedMatch[1]}.</span> {content}
                </h4>
              </div>
            )
          } else {
            return (
              <p key={index} className="text-sm leading-relaxed text-foreground/90">
                <span className="font-medium text-foreground">{numberedMatch[1]}.</span> {content}
              </p>
            )
          }
        }
        
        if (line.trim() === "") {
          return <div key={index} className="h-1" />
        }
        
        return (
          <p key={index} className="text-sm leading-relaxed text-foreground/90">
            {line}
          </p>
        )
      })}
    </div>
  )
}

// Model info badge component
function ModelInfoBadge({ modelInfo }: { modelInfo: ModelInfo }) {
  if (!modelInfo?.type) return null

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
      <div className="flex items-center gap-1">
        <Brain className="h-3 w-3" />
        <span className="font-medium">{modelInfo.type}</span>
      </div>
      {modelInfo.accuracy != null && (
        <>
          <span className="text-border">|</span>
          <span>정확도 <span className="font-medium text-foreground">{(modelInfo.accuracy * 100).toFixed(0)}%</span></span>
        </>
      )}
      {modelInfo.auc_roc != null && (
        <>
          <span className="text-border">|</span>
          <span>AUC-ROC <span className="font-medium text-foreground">{modelInfo.auc_roc.toFixed(2)}</span></span>
        </>
      )}
    </div>
  )
}

// Summary stats component for segmentation data
function SegmentationSummary({ 
  rfmSummary, 
  segmentationSummary, 
  productSummary 
}: { 
  rfmSummary?: { segments: Record<string, { count: number }> } | null
  segmentationSummary?: { clusters: Record<string, { count: number }> } | null
  productSummary?: { total_products: number; total_revenue: number } | null
}) {
  const hasData = rfmSummary || segmentationSummary || productSummary
  if (!hasData) return null

  return (
    <div className="space-y-3">
      {productSummary && (
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-border bg-muted/20 p-3 text-center">
            <p className="text-2xl font-bold text-foreground">{productSummary.total_products.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">총 상품 수</p>
          </div>
          <div className="rounded-lg border border-border bg-muted/20 p-3 text-center">
            <p className="text-2xl font-bold text-foreground">{productSummary.total_revenue.toLocaleString()}원</p>
            <p className="text-xs text-muted-foreground">총 매출</p>
          </div>
        </div>
      )}

      {rfmSummary && Object.keys(rfmSummary.segments).length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">RFM 세그먼트</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(rfmSummary.segments).map(([name, data]) => (
              <span key={name} className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/30 px-2.5 py-1 text-xs">
                <span className="font-medium text-foreground">{name}</span>
                <span className="text-muted-foreground">{data.count}명</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {segmentationSummary && Object.keys(segmentationSummary.clusters).length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">클러스터</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(segmentationSummary.clusters).map(([name, data]) => (
              <span key={name} className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-xs">
                <span className="font-medium text-foreground">{name}</span>
                <span className="text-muted-foreground">{data.count}명</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export function AiInsights({ analytics, selectedUrl }: AiInsightsProps) {
  const [urlInsights, setUrlInsights] = useState<UrlInsightData | null>(null)
  const [siteInsights, setSiteInsights] = useState<SiteInsightData | null>(null)
  const [marketingInsights, setMarketingInsights] = useState<MarketingInsightData | null>(null)
  const [segInsights, setSegInsights] = useState<SegmentationInsightData | null>(null)
  
  const [isLoadingUrl, setIsLoadingUrl] = useState(false)
  const [isLoadingSite, setIsLoadingSite] = useState(false)
  const [isLoadingMarketing, setIsLoadingMarketing] = useState(false)
  const [isLoadingSeg, setIsLoadingSeg] = useState(false)
  
  const [errorUrl, setErrorUrl] = useState("")
  const [errorSite, setErrorSite] = useState("")
  const [errorMarketing, setErrorMarketing] = useState("")
  const [errorSeg, setErrorSeg] = useState("")

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

  const generateSegInsights = async () => {
    setIsLoadingSeg(true)
    setErrorSeg("")

    try {
      const response = await fetch("/api/ai/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "segmentation" })
      })

      if (!response.ok) throw new Error("AI 분석 생성에 실패했습니다")
      const data = await response.json()
      setSegInsights(data)
    } catch (err) {
      setErrorSeg(err instanceof Error ? err.message : "오류가 발생했습니다")
    } finally {
      setIsLoadingSeg(false)
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
            <CardContent className="space-y-3">
              {urlInsights?.modelInfo && <ModelInfoBadge modelInfo={urlInsights.modelInfo} />}
              {errorUrl && (
                <div className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">{errorUrl}</span>
                </div>
              )}
              {urlInsights?.trafficPattern ? (
                <div className="rounded-lg bg-muted/50 p-4">
                  <FormattedInsight text={urlInsights.trafficPattern} />
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
            <CardContent className="space-y-3">
              {marketingInsights?.modelInfo && <ModelInfoBadge modelInfo={marketingInsights.modelInfo} />}
              {errorMarketing && (
                <div className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">{errorMarketing}</span>
                </div>
              )}
              {marketingInsights?.targetAnalysis ? (
                <div className="rounded-lg bg-muted/50 p-4">
                  <FormattedInsight text={marketingInsights.targetAnalysis} />
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
                  <FormattedInsight text={urlInsights.referrerAnalysis} />
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

      {/* Section 4: 고객 세그멘테이션 */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Users className="h-4 w-4 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">고객 세그멘테이션</h2>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <CardTitle className="text-foreground">세그멘테이션 분석</CardTitle>
              </div>
              <Button 
                size="sm" 
                onClick={generateSegInsights} 
                disabled={isLoadingSeg}
              >
                {isLoadingSeg ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
              </Button>
            </div>
            <CardDescription>
              XGBoost + K-Means + RFM 기반 고객 세그멘테이션 분석
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {segInsights?.modelInfo && <ModelInfoBadge modelInfo={segInsights.modelInfo} />}
            {errorSeg && (
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{errorSeg}</span>
              </div>
            )}
            {segInsights ? (
              <>
                <SegmentationSummary
                  rfmSummary={segInsights.rfmSummary}
                  segmentationSummary={segInsights.segmentationSummary}
                  productSummary={segInsights.productSummary}
                />
                {segInsights.segmentationAnalysis && (
                  <div className="rounded-lg bg-muted/50 p-4">
                    <FormattedInsight text={segInsights.segmentationAnalysis} />
                  </div>
                )}
              </>
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

      {/* Section 5: 전체 사이트 분석 */}
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
          <CardContent className="space-y-3">
            {siteInsights?.modelInfo && <ModelInfoBadge modelInfo={siteInsights.modelInfo} />}
            {errorSite && (
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{errorSite}</span>
              </div>
            )}
            {siteInsights?.trendAnalysis ? (
              <>
                <SegmentationSummary
                  rfmSummary={siteInsights.rfmSummary}
                  segmentationSummary={siteInsights.segmentationSummary}
                  productSummary={siteInsights.productSummary}
                />
                <div className="rounded-lg bg-muted/50 p-4">
                  <FormattedInsight text={siteInsights.trendAnalysis} />
                </div>
              </>
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
