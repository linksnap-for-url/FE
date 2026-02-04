"use client"

import { Badge } from "@/components/ui/badge"
import { ExternalLink } from "lucide-react"

interface PopularUrlsProps {
  urls: {
    shortCode: string
    originalUrl: string
    clicks: number
    createdAt: string
  }[]
}

export function PopularUrls({ urls }: PopularUrlsProps) {
  const maxClicks = Math.max(...urls.map(u => u.clicks))

  if (urls.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-muted-foreground">
        등록된 URL이 없습니다.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {urls.map((url, index) => (
        <div
          key={url.shortCode}
          className="relative overflow-hidden rounded-lg border border-border bg-card p-4"
        >
          {/* Progress bar background */}
          <div
            className="absolute inset-y-0 left-0 bg-primary/10"
            style={{ width: `${(url.clicks / maxClicks) * 100}%` }}
          />
          
          <div className="relative flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <code className="rounded bg-muted px-2 py-0.5 text-sm font-semibold text-foreground">
                    /s/{url.shortCode}
                  </code>
                  <Badge variant="secondary" className="shrink-0">
                    {url.clicks.toLocaleString()} 클릭
                  </Badge>
                </div>
                <a
                  href={url.originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
                >
                  <span className="max-w-[400px] truncate">{url.originalUrl}</span>
                  <ExternalLink className="h-3 w-3 shrink-0" />
                </a>
                <p className="mt-1 text-xs text-muted-foreground">
                  생성일: {new Date(url.createdAt).toLocaleDateString("ko-KR")}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
