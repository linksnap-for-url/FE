import { NextResponse } from "next/server"
import { getAllUrls, initializeMockData } from "@/lib/url-store"

export async function GET() {
  // Initialize mock data
  initializeMockData()

  const urls = getAllUrls()
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)

  // Calculate total stats
  const totalClicks = urls.reduce((sum, url) => sum + url.clicks.length, 0)
  const totalUrls = urls.length

  // Popular URLs (for site overview)
  const popularUrls = urls
    .map(url => ({
      shortCode: url.shortCode,
      originalUrl: url.originalUrl,
      clicks: url.clicks.length,
      createdAt: url.createdAt.toISOString()
    }))
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 10)

  // Per-URL statistics
  const urlStats = urls.map(url => {
    // Today's clicks
    const todayClicks = url.clicks.filter(click => {
      const clickDate = new Date(click.timestamp)
      return clickDate >= today
    }).length

    // Yesterday's clicks
    const yesterdayClicks = url.clicks.filter(click => {
      const clickDate = new Date(click.timestamp)
      return clickDate >= yesterday && clickDate < today
    }).length

    // Clicks by hour (last 24 hours)
    const clicksByHour: { hour: string; clicks: number }[] = []
    for (let i = 23; i >= 0; i--) {
      const hour = new Date(now.getTime() - i * 60 * 60 * 1000)
      const hourStr = hour.getHours().toString().padStart(2, "0") + ":00"
      const clicks = url.clicks.filter(click => {
        const clickTime = new Date(click.timestamp)
        const hourStart = new Date(hour.getFullYear(), hour.getMonth(), hour.getDate(), hour.getHours())
        const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000)
        return clickTime >= hourStart && clickTime < hourEnd
      }).length
      clicksByHour.push({ hour: hourStr, clicks })
    }

    // Daily clicks (last 7 days)
    const dailyClicks: { date: string; clicks: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dateStr = `${date.getMonth() + 1}/${date.getDate()}`
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000)
      const clicks = url.clicks.filter(click => {
        const clickDate = new Date(click.timestamp)
        return clickDate >= dayStart && clickDate < dayEnd
      }).length
      dailyClicks.push({ date: dateStr, clicks })
    }

    // Device stats for this URL
    const deviceMap = new Map<string, number>()
    url.clicks.forEach(click => {
      let device = "Desktop"
      if (click.userAgent.includes("iPhone") || click.userAgent.includes("Android")) {
        device = click.userAgent.includes("iPhone") ? "iPhone" : "Android"
      } else if (click.userAgent.includes("Macintosh")) {
        device = "Mac"
      } else if (click.userAgent.includes("Windows")) {
        device = "Windows"
      }
      deviceMap.set(device, (deviceMap.get(device) || 0) + 1)
    })
    const deviceStats = Array.from(deviceMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)

    // Referrer stats for this URL
    const referrerMap = new Map<string, number>()
    url.clicks.forEach(click => {
      const referrer = click.referrer.replace(/^https?:\/\//, "").split("/")[0] || "direct"
      referrerMap.set(referrer, (referrerMap.get(referrer) || 0) + 1)
    })
    const referrerStats = Array.from(referrerMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6)

    return {
      shortCode: url.shortCode,
      originalUrl: url.originalUrl,
      totalClicks: url.clicks.length,
      todayClicks,
      yesterdayClicks,
      clicksByHour,
      dailyClicks,
      deviceStats,
      referrerStats,
      createdAt: url.createdAt.toISOString()
    }
  }).sort((a, b) => b.totalClicks - a.totalClicks)

  return NextResponse.json({
    totalClicks,
    totalUrls,
    popularUrls,
    urlStats
  })
}
