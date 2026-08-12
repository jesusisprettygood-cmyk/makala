import type { ArticleRow, CreateArticlePayload } from '../types/article'
import { mapRowToArticle, type Article } from '../types/article'
import { supabase } from './supabase'

const API_URL = normalizeApiUrl(import.meta.env.VITE_API_URL ?? '')

export type UserProfile = {
  id: string
  displayName: string
  avatarUrl: string | null
  bio: string
  email: string
  articleCount: number
}

function normalizeApiUrl(raw: string): string {
  const trimmed = raw.trim().replace(/\/$/, '')
  if (!trimmed) return ''
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

async function parseJsonResponse(res: Response): Promise<unknown> {
  const text = await res.text()
  if (!text) return {}
  try {
    return JSON.parse(text) as unknown
  } catch {
    if (text.trimStart().startsWith('<!')) {
      throw new Error(
        'Server returned HTML instead of JSON. Check VITE_API_URL — it must be your backend URL with https:// (e.g. https://makala-production.up.railway.app).',
      )
    }
    throw new Error('Server returned an invalid response.')
  }
}

function apiBase(): string {
  // Local dev uses Vite proxy → same origin, no CORS issues.
  if (import.meta.env.DEV) {
    return '/api'
  }
  if (!API_URL) {
    throw new Error('VITE_API_URL is not configured.')
  }
  return `${API_URL}/api`
}

async function apiFetch(input: string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(input, init)
  } catch {
    throw new Error(
      import.meta.env.DEV
        ? 'Network error — could not reach the API. Set VITE_API_URL in .env to your Railway backend (https://makala-production.up.railway.app) and restart the dev server.'
        : 'Network error — could not reach the API. Check VITE_API_URL and backend CORS_ORIGINS / FRONTEND_URL on Railway.',
    )
  }
}

export function isApiConfigured(): boolean {
  return import.meta.env.DEV || Boolean(API_URL)
}

async function freshAccessToken(): Promise<string> {
  if (!supabase) {
    throw new Error('Supabase is not configured.')
  }

  const { data: refreshed, error: refreshError } = await supabase.auth.refreshSession()
  if (!refreshError && refreshed.session?.access_token) {
    return refreshed.session.access_token
  }

  const { data: sessionData } = await supabase.auth.getSession()
  const session = sessionData.session
  if (session?.access_token) {
    const expiresAt = session.expires_at ?? 0
    const now = Math.floor(Date.now() / 1000)
    if (expiresAt > now + 30) {
      return session.access_token
    }
  }

  throw new Error('Session expired. Please sign out and sign in again.')
}

async function authHeaders(): Promise<Record<string, string>> {
  const token = await freshAccessToken()
  return { Authorization: `Bearer ${token}` }
}

async function authedFetch(
  path: string,
  init: RequestInit,
  retried = false,
): Promise<Response> {
  const headers = {
    ...(init.headers as Record<string, string> | undefined),
    ...(await authHeaders()),
  }
  const res = await apiFetch(`${apiBase()}${path}`, { ...init, headers })
  if (res.status === 401 && !retried) {
    const { error } = await supabase!.auth.refreshSession()
    if (error) {
      return res
    }
    return authedFetch(path, init, true)
  }
  return res
}

export async function fetchArticles(): Promise<Article[]> {
  const res = await apiFetch(`${apiBase()}/articles`)
  if (!res.ok) {
    throw new Error(`Failed to load articles (${res.status})`)
  }
  const data = (await parseJsonResponse(res)) as { articles: ArticleRow[] }
  return (data.articles ?? []).map(mapRowToArticle)
}

export async function createArticle(payload: CreateArticlePayload): Promise<Article> {
  const res = await authedFetch('/articles', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const data = (await parseJsonResponse(res)) as { error?: string; article?: ArticleRow }
  if (!res.ok) {
    throw new Error(data.error ?? `Failed to publish (${res.status})`)
  }

  return mapRowToArticle(data.article!)
}

export async function fetchProfile(): Promise<UserProfile> {
  const res = await authedFetch('/profile', {})
  const data = (await parseJsonResponse(res)) as { error?: string; profile?: UserProfile }
  if (!res.ok) {
    throw new Error(data.error ?? `Failed to load profile (${res.status})`)
  }
  return data.profile!
}

export async function updateProfile(payload: {
  displayName?: string
  bio?: string
}): Promise<UserProfile> {
  const res = await authedFetch('/profile', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
  const data = (await parseJsonResponse(res)) as { error?: string; profile?: UserProfile }
  if (!res.ok) {
    throw new Error(data.error ?? `Failed to update profile (${res.status})`)
  }
  return data.profile!
}
