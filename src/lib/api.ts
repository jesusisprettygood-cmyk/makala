import type { ArticleRow, CreateArticlePayload } from '../types/article'
import { mapRowToArticle, type Article } from '../types/article'

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
      'Network error — could not reach the API. Check VITE_API_URL and backend CORS_ORIGINS / FRONTEND_URL on Railway.',
    )
  }
}

export function isApiConfigured(): boolean {
  return Boolean(API_URL)
}

export async function fetchArticles(): Promise<Article[]> {
  const res = await apiFetch(`${apiBase()}/articles`)
  if (!res.ok) {
    throw new Error(`Failed to load articles (${res.status})`)
  }
  const data = (await parseJsonResponse(res)) as { articles: ArticleRow[] }
  return (data.articles ?? []).map(mapRowToArticle)
}

export async function createArticle(
  payload: CreateArticlePayload,
  accessToken: string,
): Promise<Article> {
  const res = await apiFetch(`${apiBase()}/articles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  })

  const data = (await parseJsonResponse(res)) as { error?: string; article?: ArticleRow }
  if (!res.ok) {
    throw new Error(data.error ?? `Failed to publish (${res.status})`)
  }

  return mapRowToArticle(data.article!)
}

export async function fetchProfile(accessToken: string): Promise<UserProfile> {
  const res = await apiFetch(`${apiBase()}/profile`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const data = (await parseJsonResponse(res)) as { error?: string; profile?: UserProfile }
  if (!res.ok) {
    throw new Error(data.error ?? `Failed to load profile (${res.status})`)
  }
  return data.profile!
}

export async function updateProfile(
  payload: { displayName?: string; bio?: string },
  accessToken: string,
): Promise<UserProfile> {
  const res = await apiFetch(`${apiBase()}/profile`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  })
  const data = (await parseJsonResponse(res)) as { error?: string; profile?: UserProfile }
  if (!res.ok) {
    throw new Error(data.error ?? `Failed to update profile (${res.status})`)
  }
  return data.profile!
}

export async function uploadArticleImage(file: File, accessToken: string): Promise<string> {
  const form = new FormData()
  form.append('image', file)
  const res = await apiFetch(`${apiBase()}/uploads/article-image`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: form,
  })
  const data = (await parseJsonResponse(res)) as { error?: string; url?: string }
  if (!res.ok) {
    throw new Error(data.error ?? `Failed to upload image (${res.status})`)
  }
  return data.url!
}

export async function uploadProfilePhoto(file: File, accessToken: string): Promise<string> {
  const form = new FormData()
  form.append('photo', file)
  const res = await apiFetch(`${apiBase()}/uploads/profile-photo`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: form,
  })
  const data = (await parseJsonResponse(res)) as { error?: string; url?: string }
  if (!res.ok) {
    throw new Error(data.error ?? `Failed to upload photo (${res.status})`)
  }
  return data.url!
}
