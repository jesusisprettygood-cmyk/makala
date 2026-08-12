export interface ArticleRow {
  id: string;
  category: string;
  title: string;
  subtitle: string;
  excerpt: string;
  body: string[];
  author: string;
  image: string;
  most_read: number | null;
  author_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateArticleInput {
  category: string;
  title: string;
  subtitle?: string;
  excerpt?: string;
  body: string[] | string;
  author?: string;
  image?: string;
}

export function normalizeBody(body: string[] | string): string[] {
  if (Array.isArray(body)) {
    return body.map((p) => p.trim()).filter(Boolean);
  }
  return body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export function validateCreateArticle(input: CreateArticleInput): string | null {
  if (!input.category?.trim()) return "category is required.";
  if (!input.title?.trim()) return "title is required.";
  const body = normalizeBody(input.body ?? []);
  if (body.length === 0) return "body must contain at least one paragraph.";
  return null;
}
