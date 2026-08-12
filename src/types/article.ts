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
  mostRead?: number
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
    mostRead: row.most_read ?? undefined,
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
