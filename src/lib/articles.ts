import type { ArticleRow, CreateArticlePayload } from "../types/article";
import { mapRowToArticle, normalizeArticleRow, type Article } from "../types/article";
import { supabase } from "./supabase";
import { trackArticleRead } from "./engagement";

function normalizeBody(body: string): string[] {
  return body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function validatePayload(payload: CreateArticlePayload): string | null {
  if (!payload.category?.trim()) return "Category is required.";
  if (!payload.title?.trim()) return "Title is required.";
  if (normalizeBody(payload.body).length === 0) return "Body must contain at least one paragraph.";
  return null;
}

async function requireUserId(): Promise<string> {
  if (!supabase) throw new Error("Supabase is not configured.");
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Please sign in.");
  return user.id;
}

export async function fetchArticlesDirect(): Promise<Article[]> {
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) =>
    mapRowToArticle(normalizeArticleRow(row as Record<string, unknown>)),
  );
}

export async function createArticleDirect(payload: CreateArticlePayload): Promise<Article> {
  const validationError = validatePayload(payload);
  if (validationError) {
    throw new Error(validationError);
  }

  const userId = await requireUserId();
  const body = normalizeBody(payload.body);
  const excerpt =
    payload.excerpt?.trim() ||
    body.find((p) => !p.startsWith("PULLQUOTE:"))?.slice(0, 220) ||
    "";

  const { data, error } = await supabase!
    .from("articles")
    .insert({
      category: payload.category.trim().toUpperCase(),
      title: payload.title.trim(),
      subtitle: payload.subtitle?.trim() ?? "",
      excerpt,
      body,
      author: payload.author?.trim() || "Ndomi",
      image: payload.image?.trim() ?? "",
      author_id: userId,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapRowToArticle(normalizeArticleRow(data as Record<string, unknown>));
}

export async function updateArticleDirect(
  articleId: string,
  payload: CreateArticlePayload,
): Promise<Article> {
  const validationError = validatePayload(payload);
  if (validationError) {
    throw new Error(validationError);
  }

  const userId = await requireUserId();
  const body = normalizeBody(payload.body);
  const excerpt =
    payload.excerpt?.trim() ||
    body.find((p) => !p.startsWith("PULLQUOTE:"))?.slice(0, 220) ||
    "";

  const { data, error } = await supabase!
    .from("articles")
    .update({
      category: payload.category.trim().toUpperCase(),
      title: payload.title.trim(),
      subtitle: payload.subtitle?.trim() ?? "",
      excerpt,
      body,
      author: payload.author?.trim() || "Ndomi",
      image: payload.image?.trim() ?? "",
      updated_at: new Date().toISOString(),
    })
    .eq("id", articleId)
    .eq("author_id", userId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapRowToArticle(normalizeArticleRow(data as Record<string, unknown>));
}

export async function deleteArticleDirect(articleId: string): Promise<void> {
  const userId = await requireUserId();

  const { error } = await supabase!
    .from("articles")
    .delete()
    .eq("id", articleId)
    .eq("author_id", userId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function incrementArticleRead(articleId: string): Promise<number | null> {
  return trackArticleRead(articleId);
}

export function buildTopicCounts(articles: Article[]): { name: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const article of articles) {
    const key = article.category.trim();
    if (!key) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export function categoryMatchesTopic(category: string, topic: string): boolean {
  return category.toLowerCase().includes(topic.toLowerCase())
    || topic.toLowerCase().includes(category.toLowerCase().split(" ")[0] ?? "");
}

export function getMostReadArticles(articles: Article[], limit = 5): Article[] {
  return [...articles]
    .sort((a, b) => {
      const readDiff = (b.mostRead ?? 0) - (a.mostRead ?? 0);
      if (readDiff !== 0) return readDiff;
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    })
    .slice(0, limit);
}

export function getLatestArticles(articles: Article[], skipFeatured = 1, limit = 7): Article[] {
  return articles.slice(skipFeatured, skipFeatured + limit);
}

export function isRealArticle(article: Article): boolean {
  return Boolean(article.createdAt) && !/^\d+$/.test(article.id);
}

export function preferDatabaseArticles(articles: Article[]): Article[] {
  const real = articles.filter(isRealArticle);
  return real.length > 0 ? real : articles;
}
