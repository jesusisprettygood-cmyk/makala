import type { ArticleRow, CreateArticlePayload } from "../types/article";
import { mapRowToArticle, type Article } from "../types/article";
import { supabase } from "./supabase";

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

export async function createArticleDirect(payload: CreateArticlePayload): Promise<Article> {
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const validationError = validatePayload(payload);
  if (validationError) {
    throw new Error(validationError);
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error("Please sign in to publish.");
  }

  const body = normalizeBody(payload.body);
  const excerpt =
    payload.excerpt?.trim() ||
    body.find((p) => !p.startsWith("PULLQUOTE:"))?.slice(0, 220) ||
    "";

  const { data, error } = await supabase
    .from("articles")
    .insert({
      category: payload.category.trim().toUpperCase(),
      title: payload.title.trim(),
      subtitle: payload.subtitle?.trim() ?? "",
      excerpt,
      body,
      author: payload.author?.trim() || "Ndomi",
      image: payload.image?.trim() ?? "",
      author_id: user.id,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapRowToArticle(data as ArticleRow);
}
