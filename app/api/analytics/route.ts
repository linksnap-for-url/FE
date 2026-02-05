import { NextRequest, NextResponse } from "next/server"
import { API_ENDPOINTS } from "@/lib/api-config"

interface LambdaSiteStats {
  totalUrls: number
  totalClicks: number
  todayClicks: number
  yesterdayClicks: number
  popularUrls: {
    urlId: string
    shortUrl: string
    originalUrl: string
    clickCount: number
    createdAt: string
  }[]
  recentUrls: {
    urlId: string
    shortUrl: string
    originalUrl: string
    clickCount: number
    createdAt: string
  }[]
}

interface LambdaUrlStats {
  urlId: string
  shortUrl: string
  originalUrl: string
  createdAt: string
  stats: {
    totalClicks: number
    todayClicks: number
    yesterdayClicks: number
    hourlyClicks: { hour: number; clicks: number }[]
    dailyClicks: { date: string; clicks: number }[]
    deviceDistribution: {
      desktop: number
      mobile: number
      tablet: number
    }
    refererDistribution: Record<string, number>
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const shortCode = searchParams.get("shortCode")

    // If shortCode is provided, get stats for specific URL
    if (shortCode) {
      const response = await fetch(API_ENDPOINTS.STATS_BY_CODE(shortCode))
      
      if (!response.ok) {
        const error = await response.json()
        return NextResponse.json(
          { error: error.error || "Failed to fetch URL stats" },
          { status: response.status }
        )
      }

      const data: LambdaUrlStats = await response.json()
      return NextResponse.json(transformUrlStats(data))
    }

    // Get overall site stats
    const siteResponse = await fetch(API_ENDPOINTS.STATS)
    
    if (!siteResponse.ok) {
      const error = await siteResponse.json()
      return NextResponse.json(
        { error: error.error || "Failed to fetch site stats" },
        { status: siteResponse.status }
      )
    }

    const siteStats: LambdaSiteStats = await siteResponse.json()

    // Fetch detailed stats for each popular/recent URL
    const allUrlIds = new Set<string>()
    siteStats.popularUrls.forEach(url => allUrlIds.add(url.urlId))
    siteStats.recentUrls.forEach(url => allUrlIds.add(url.urlId))

    const urlStatsPromises = Array.from(allUrlIds).map(async (urlId) => {
      try {
        const response = await fetch(API_ENDPOINTS.STATS_BY_CODE(urlId))
        if (response.ok) {
          const data: LambdaUrlStats = await response.json()
          return transformUrlStats(data)
        }
        return null
      } catch {
        return null
      }
    })

    const urlStatsResults = await Promise.all(urlStatsPromises)
    const urlStats = urlStatsResults.filter((stat): stat is NonNullable<typeof stat> => stat !== null)

    // Transform to frontend expected format
    return NextResponse.json({
      totalClicks: siteStats.totalClicks,
      totalUrls: siteStats.totalUrls,
      todayClicks: siteStats.todayClicks,
      yesterdayClicks: siteStats.yesterdayClicks,
      popularUrls: siteStats.popularUrls.map(url => ({
        shortCode: url.urlId,
        originalUrl: url.originalUrl,
        clicks: url.clickCount,
        createdAt: url.createdAt,
      })),
      recentUrls: siteStats.recentUrls.map(url => ({
        shortCode: url.urlId,
        originalUrl: url.originalUrl,
        clicks: url.clickCount,
        createdAt: url.createdAt,
      })),
      urlStats,
    })

  } catch (error) {
    console.error("Analytics API error:", error)
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    )
  }
}

function transformUrlStats(data: LambdaUrlStats) {
  const { stats } = data

  // Transform hourly clicks (hour number to "HH:00" format)
  const clicksByHour = stats.hourlyClicks.map(h => ({
    hour: h.hour.toString().padStart(2, "0") + ":00",
    clicks: h.clicks,
  }))

  // Transform daily clicks
  const dailyClicks = stats.dailyClicks.map(d => ({
    date: formatDate(d.date),
    clicks: d.clicks,
  }))

  // Transform device distribution
  const deviceStats = [
    { name: "Desktop", value: stats.deviceDistribution.desktop },
    { name: "Mobile", value: stats.deviceDistribution.mobile },
    { name: "Tablet", value: stats.deviceDistribution.tablet },
  ].filter(d => d.value > 0)

  // Transform referrer distribution
  const referrerStats = Object.entries(stats.refererDistribution)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6)

  return {
    shortCode: data.urlId,
    originalUrl: data.originalUrl,
    totalClicks: stats.totalClicks,
    todayClicks: stats.todayClicks,
    yesterdayClicks: stats.yesterdayClicks,
    clicksByHour,
    dailyClicks,
    deviceStats,
    referrerStats,
    createdAt: data.createdAt,
  }
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}/${date.getDate()}`
}
