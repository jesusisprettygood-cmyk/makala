export interface Article {
  id: string
  category: string
  title: string
  subtitle: string
  excerpt: string
  body: string[]
  author: string
  date: string
  readTime: string
  image: string
  createdAt?: string
  authorId?: string | null
  mostRead?: number
  likeCount?: number
  shareCount?: number
}

const NEW_ARTICLE_DAYS = 7

export function isNewArticle(createdAt?: string): boolean {
  if (!createdAt) return false
  const created = new Date(createdAt).getTime()
  if (Number.isNaN(created)) return false
  const ageMs = Date.now() - created
  return ageMs >= 0 && ageMs <= NEW_ARTICLE_DAYS * 24 * 60 * 60 * 1000
}

export interface ArticleRow {
  id: string
  category: string
  title: string
  subtitle: string
  excerpt: string
  body: string[]
  author: string
  image: string
  most_read: number | null
  like_count: number | null
  share_count: number | null
  author_id: string | null
  created_at: string
  updated_at: string
}

export function formatArticleDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export function calcReadTime(body: string[]): string {
  const words = body.join(' ').split(/\s+/).filter(Boolean).length
  const minutes = Math.max(1, Math.round(words / 200))
  return `${minutes} min read`
}

export function mapRowToArticle(row: ArticleRow): Article {
  return {
    id: row.id,
    category: row.category,
    title: row.title,
    subtitle: row.subtitle,
    excerpt: row.excerpt,
    body: row.body,
    author: row.author,
    date: formatArticleDate(row.created_at),
    readTime: calcReadTime(row.body),
    image: row.image,
    createdAt: row.created_at,
    authorId: row.author_id,
    mostRead: row.most_read ?? undefined,
    likeCount: row.like_count ?? 0,
    shareCount: row.share_count ?? 0,
  }
}

export function normalizeArticleRow(row: Record<string, unknown>): ArticleRow {
  let body: string[] = []
  if (Array.isArray(row.body)) {
    body = row.body.map(String)
  } else if (typeof row.body === 'string') {
    try {
      const parsed = JSON.parse(row.body) as unknown
      body = Array.isArray(parsed) ? parsed.map(String) : [row.body]
    } catch {
      body = [row.body]
    }
  }

  return {
    id: String(row.id),
    category: String(row.category ?? ''),
    title: String(row.title ?? ''),
    subtitle: String(row.subtitle ?? ''),
    excerpt: String(row.excerpt ?? ''),
    body,
    author: String(row.author ?? 'Ndomi'),
    image: String(row.image ?? ''),
    most_read: typeof row.most_read === 'number' ? row.most_read : null,
    like_count: typeof row.like_count === 'number' ? row.like_count : null,
    share_count: typeof row.share_count === 'number' ? row.share_count : null,
    author_id: row.author_id ? String(row.author_id) : null,
    created_at: String(row.created_at ?? new Date().toISOString()),
    updated_at: String(row.updated_at ?? new Date().toISOString()),
  }
}

export interface CreateArticlePayload {
  category: string
  title: string
  subtitle?: string
  excerpt?: string
  body: string
  author?: string
  image?: string
}
