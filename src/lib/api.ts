import type { ArticleRow, CreateArticlePayload } from '../types/article'
import { mapRowToArticle, type Article } from '../types/article'

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, '') ?? ''

export type UserProfile = {
  id: string
  displayName: string
  avatarUrl: string | null
  bio: string
  email: string
  articleCount: number
}

function apiBase(): string {
  if (!API_URL) {
    throw new Error('VITE_API_URL is not configured.')
  }
  return `${API_URL}/api`
}

export function isApiConfigured(): boolean {
  return Boolean(API_URL)
}

export async function fetchArticles(): Promise<Article[]> {
  const res = await fetch(`${apiBase()}/articles`)
  if (!res.ok) {
    throw new Error(`Failed to load articles (${res.status})`)
  }
  const data = (await res.json()) as { articles: ArticleRow[] }
  return (data.articles ?? []).map(mapRowToArticle)
}

export async function createArticle(
  payload: CreateArticlePayload,
  accessToken: string,
): Promise<Article> {
  const res = await fetch(`${apiBase()}/articles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  })

  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.error ?? `Failed to publish (${res.status})`)
  }

  return mapRowToArticle((data as { article: ArticleRow }).article)
}

export async function fetchProfile(accessToken: string): Promise<UserProfile> {
  const res = await fetch(`${apiBase()}/profile`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.error ?? `Failed to load profile (${res.status})`)
  }
  return (data as { profile: UserProfile }).profile
}

export async function updateProfile(
  payload: { displayName?: string; bio?: string },
  accessToken: string,
): Promise<UserProfile> {
  const res = await fetch(`${apiBase()}/profile`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.error ?? `Failed to update profile (${res.status})`)
  }
  return (data as { profile: UserProfile }).profile
}

export async function uploadArticleImage(file: File, accessToken: string): Promise<string> {
  const form = new FormData()
  form.append('image', file)
  const res = await fetch(`${apiBase()}/uploads/article-image`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: form,
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.error ?? `Failed to upload image (${res.status})`)
  }
  return (data as { url: string }).url
}

export async function uploadProfilePhoto(file: File, accessToken: string): Promise<string> {
  const form = new FormData()
  form.append('photo', file)
  const res = await fetch(`${apiBase()}/uploads/profile-photo`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: form,
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.error ?? `Failed to upload photo (${res.status})`)
  }
  return (data as { url: string }).url
}
