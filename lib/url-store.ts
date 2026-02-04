// In-memory URL storage (for demo purposes)
export interface UrlEntry {
  id: string
  originalUrl: string
  shortCode: string
  createdAt: Date
  clicks: ClickData[]
}

export interface ClickData {
  timestamp: Date
  referrer: string
  userAgent: string
}

// Global store for URLs
const urlStore: Map<string, UrlEntry> = new Map()

// Generate a random short code
export function generateShortCode(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Create a shortened URL
export function createShortUrl(originalUrl: string): UrlEntry {
  const shortCode = generateShortCode()
  const entry: UrlEntry = {
    id: crypto.randomUUID(),
    originalUrl,
    shortCode,
    createdAt: new Date(),
    clicks: []
  }
  urlStore.set(shortCode, entry)
  return entry
}

// Get URL by short code
export function getUrlByShortCode(shortCode: string): UrlEntry | undefined {
  return urlStore.get(shortCode)
}

// Record a click
export function recordClick(shortCode: string, referrer: string, userAgent: string): void {
  const entry = urlStore.get(shortCode)
  if (entry) {
    entry.clicks.push({
      timestamp: new Date(),
      referrer: referrer || 'direct',
      userAgent
    })
  }
}

// Get all URLs
export function getAllUrls(): UrlEntry[] {
  return Array.from(urlStore.values())
}

// Initialize with mock data for demo
export function initializeMockData(): void {
  if (urlStore.size > 0) return

  const mockUrls = [
    { original: 'https://vercel.com/docs/getting-started', shortCode: 'vrc101' },
    { original: 'https://nextjs.org/docs/app/building-your-application', shortCode: 'nxt202' },
    { original: 'https://react.dev/learn/thinking-in-react', shortCode: 'rct303' },
    { original: 'https://tailwindcss.com/docs/installation', shortCode: 'twn404' },
    { original: 'https://github.com/shadcn-ui/ui', shortCode: 'shd505' },
  ]

  const referrers = ['google.com', 'twitter.com', 'linkedin.com', 'facebook.com', 'direct', 'reddit.com', 'youtube.com']
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0)',
    'Mozilla/5.0 (Linux; Android 13)',
  ]

  mockUrls.forEach(({ original, shortCode }) => {
    const entry: UrlEntry = {
      id: crypto.randomUUID(),
      originalUrl: original,
      shortCode,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      clicks: []
    }

    // Generate random clicks over the past 30 days
    const clickCount = Math.floor(Math.random() * 500) + 100
    for (let i = 0; i < clickCount; i++) {
      entry.clicks.push({
        timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        referrer: referrers[Math.floor(Math.random() * referrers.length)],
        userAgent: userAgents[Math.floor(Math.random() * userAgents.length)]
      })
    }

    urlStore.set(shortCode, entry)
  })
}
