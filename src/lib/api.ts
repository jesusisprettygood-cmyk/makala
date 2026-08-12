import type { ArticleRow, CreateArticlePayload } from '../types/article'
import { mapRowToArticle, type Article } from '../types/article'

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, '') ?? ''

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
