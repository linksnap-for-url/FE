"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  LinkIcon, 
  MousePointerClick, 
  LogOut,
  Sparkles,
  RefreshCw,
  Calendar,
  ExternalLink
} from "lucide-react"
import { ClicksChart } from "@/components/dashboard/clicks-chart"
import { ReferrerChart } from "@/components/dashboard/referrer-chart"
import { PopularUrls } from "@/components/dashboard/popular-urls"
import { DeviceChart } from "@/components/dashboard/device-chart"
import { AiInsights } from "@/components/dashboard/ai-insights"

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

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedUrl, setSelectedUrl] = useState<string>("")

  const fetchAnalytics = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/analytics")
      const data = await response.json()
      setAnalytics(data)
      if (data.urlStats?.length > 0 && !selectedUrl) {
        setSelectedUrl(data.urlStats[0].shortCode)
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    window.location.href = "/"
  }

  const currentUrlStats = analytics?.urlStats.find(u => u.shortCode === selectedUrl)

  if (isLoading || !analytics) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">데이터를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <LinkIcon className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">LinkSnap</span>
            </Link>
            <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
              Admin
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={fetchAnalytics}>
              <RefreshCw className="mr-2 h-4 w-4" />
              새로고침
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              로그아웃
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">대시보드</h1>
          <p className="mt-1 text-muted-foreground">URL 클릭 통계 및 AI 분석 인사이트</p>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="url-stats" className="space-y-6">
          <TabsList className="grid w-full max-w-lg grid-cols-3">
            <TabsTrigger value="url-stats">URL별 통계</TabsTrigger>
            <TabsTrigger value="site-overview">전체 현황</TabsTrigger>
            <TabsTrigger value="ai">
              <Sparkles className="mr-2 h-4 w-4" />
              AI 분석
            </TabsTrigger>
          </TabsList>

          {/* URL별 통계 Tab */}
          <TabsContent value="url-stats" className="space-y-6">
            {/* URL Selector */}
            <Card>
              <CardHeader>
                <CardTitle className="text-foreground">URL 선택</CardTitle>
                <CardDescription>통계를 확인할 URL을 선택하세요</CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={selectedUrl} onValueChange={setSelectedUrl}>
                  <SelectTrigger className="w-full max-w-xl">
                    <SelectValue placeholder="URL을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {analytics.urlStats.map((url) => (
                      <SelectItem key={url.shortCode} value={url.shortCode}>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-primary">/{url.shortCode}</span>
                          <span className="text-muted-foreground">-</span>
                          <span className="max-w-xs truncate text-muted-foreground">
                            {url.originalUrl}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {currentUrlStats && (
              <>
                {/* URL Info */}
                <Card>
                  <CardContent className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <LinkIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-mono text-lg font-semibold text-primary">
                          linksnap.co/s/{currentUrlStats.shortCode}
                        </p>
                        <p className="max-w-lg truncate text-sm text-muted-foreground">
                          {currentUrlStats.originalUrl}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <a href={currentUrlStats.originalUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        원본 열기
                      </a>
                    </Button>
                  </CardContent>
                </Card>

                {/* Quick Stats - Single Row */}
                <div className="grid gap-4 grid-cols-3">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        총 클릭 수
                      </CardTitle>
                      <MousePointerClick className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold text-foreground">
                        {currentUrlStats.totalClicks.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">전체 기간 누적</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        오늘 클릭
                      </CardTitle>
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold text-foreground">
                        {currentUrlStats.todayClicks.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">오늘 00:00 이후</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        어제 클릭
                      </CardTitle>
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold text-foreground">
                        {currentUrlStats.yesterdayClicks.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">어제 하루 동안</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Charts */}
                <div className="grid gap-6 lg:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-foreground">시간대별 클릭</CardTitle>
                      <CardDescription>최근 24시간 클릭 추이</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ClicksChart data={currentUrlStats.clicksByHour} />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-foreground">일별 클릭</CardTitle>
                      <CardDescription>최근 7일간 클릭 추이</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ClicksChart data={currentUrlStats.dailyClicks.map(d => ({ hour: d.date, clicks: d.clicks }))} />
                    </CardContent>
                  </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-foreground">디바이스 분포</CardTitle>
                      <CardDescription>클릭 기기별 비율</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <DeviceChart data={currentUrlStats.deviceStats} />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-foreground">유입 경로</CardTitle>
                      <CardDescription>트래픽 소스별 클릭 수</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ReferrerChart data={currentUrlStats.referrerStats} />
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>

          {/* 전체 현황 Tab */}
          <TabsContent value="site-overview" className="space-y-6">
            {/* Site Overview Stats */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    등록된 전체 URL 수
                  </CardTitle>
                  <LinkIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-foreground">
                    {analytics.totalUrls}
                  </p>
                  <p className="text-sm text-muted-foreground">활성화된 단축 링크</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    전체 클릭 수
                  </CardTitle>
                  <MousePointerClick className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-foreground">
                    {analytics.totalClicks.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">모든 URL 합산</p>
                </CardContent>
              </Card>
            </div>

            {/* Popular URLs */}
            <Card>
              <CardHeader>
                <CardTitle className="text-foreground">인기 URL</CardTitle>
                <CardDescription>가장 많이 클릭된 단축 URL 순위</CardDescription>
              </CardHeader>
              <CardContent>
                <PopularUrls urls={analytics.popularUrls} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI 인사이트 Tab */}
          <TabsContent value="ai">
            <AiInsights analytics={analytics} selectedUrl={selectedUrl} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
