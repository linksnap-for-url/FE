"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LinkIcon, Copy, Check, ArrowRight } from "lucide-react"

export default function HomePage() {
  const [url, setUrl] = useState("")
  const [shortenedUrl, setShortenedUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState("")

  const handleShorten = async () => {
    if (!url) {
      setError("URL을 입력해주세요")
      return
    }

    try {
      new URL(url)
    } catch {
      setError("유효한 URL을 입력해주세요")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url })
      })

      const data = await response.json()

      if (data.shortUrl) {
        setShortenedUrl(data.shortUrl)
      }
    } catch {
      setError("URL 단축 중 오류가 발생했습니다")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shortenedUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <LinkIcon className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">LinkSnap</span>
          </div>
          <Link href="/admin/login">
            <Button variant="outline" size="sm">
              Admin Login
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="mx-auto max-w-6xl px-6 py-20">
        <div className="text-center">
          <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            URL을 더 짧고 스마트하게
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground">
            긴 URL을 간결하게 단축하고, AI 기반 분석으로 클릭 통계와 트렌드를 실시간으로 확인하세요.
          </p>
        </div>

        {/* URL Shortener Form */}
        <Card className="mx-auto mt-12 max-w-2xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-foreground">URL 단축하기</CardTitle>
            <CardDescription>긴 URL을 입력하면 짧은 링크를 생성해 드립니다</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <Input
                type="url"
                placeholder="https://example.com/very-long-url-here..."
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value)
                  setError("")
                }}
                className="flex-1"
              />
              <Button onClick={handleShorten} disabled={isLoading}>
                {isLoading ? "단축 중..." : "단축하기"}
              </Button>
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            {shortenedUrl && (
              <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 p-4">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">단축된 URL</p>
                  <p className="font-mono text-foreground">{shortenedUrl}</p>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopy}
                  className="shrink-0 bg-transparent"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="mt-24 rounded-2xl bg-primary p-12 text-center">
          <h2 className="text-2xl font-bold text-primary-foreground sm:text-3xl">
            관리자 대시보드에서 더 많은 인사이트를 확인하세요
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-primary-foreground/80">
            실시간 클릭 통계, AI 기반 트렌드 분석, 마케팅 제안 등 다양한 기능을 활용해보세요.
          </p>
          <Link href="/admin/login">
            <Button
              variant="secondary"
              size="lg"
              className="mt-8"
            >
              대시보드 접속하기
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8">
        <div className="mx-auto max-w-6xl px-6 text-center text-sm text-muted-foreground">
          <p>Demo credentials: admin@linksnap.com / admin123</p>
        </div>
      </footer>
    </div>
  )
}
