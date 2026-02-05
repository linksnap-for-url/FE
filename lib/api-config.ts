// Lambda API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "https://bogx1f0m05.execute-api.ap-northeast-2.amazonaws.com/dev",
} as const

// API Endpoints
export const API_ENDPOINTS = {
  SHORTEN: `${API_CONFIG.BASE_URL}/shorten`,
  STATS: `${API_CONFIG.BASE_URL}/stats`,
  STATS_BY_CODE: (shortCode: string) => `${API_CONFIG.BASE_URL}/stats/${shortCode}`,
  REDIRECT: (shortCode: string) => `${API_CONFIG.BASE_URL}/${shortCode}`,
} as const
