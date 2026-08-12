import { Router } from "express";
import { supabase } from "../supabaseClient.js";
import { requireAuth, type AuthenticatedRequest } from "../auth.js";
import {
  normalizeBody,
  validateCreateArticle,
  type ArticleRow,
  type CreateArticleInput,
} from "../types/article.js";

export const articlesRouter = Router();

function mapRow(row: Record<string, unknown>): ArticleRow {
  return {
    id: String(row.id),
    category: String(row.category ?? ""),
    title: String(row.title ?? ""),
    subtitle: String(row.subtitle ?? ""),
    excerpt: String(row.excerpt ?? ""),
    body: Array.isArray(row.body) ? (row.body as string[]) : [],
    author: String(row.author ?? "Ndomi"),
    image: String(row.image ?? ""),
    most_read: typeof row.most_read === "number" ? row.most_read : null,
    author_id: row.author_id ? String(row.author_id) : null,
    created_at: String(row.created_at ?? new Date().toISOString()),
    updated_at: String(row.updated_at ?? new Date().toISOString()),
  };
}

articlesRouter.get("/", async (_req, res) => {
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ articles: (data ?? []).map(mapRow) });
});

articlesRouter.get("/:id", async (req, res) => {
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("id", req.params.id)
    .maybeSingle();

  if (error) {
    return res.status(500).json({ error: error.message });
  }
  if (!data) {
    return res.status(404).json({ error: "Article not found." });
  }

  return res.status(200).json({ article: mapRow(data) });
});

articlesRouter.post("/", requireAuth, async (req: AuthenticatedRequest, res) => {
  const input = req.body as CreateArticleInput;
  const validationError = validateCreateArticle(input);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const body = normalizeBody(input.body);
  const excerpt =
    input.excerpt?.trim() ||
    body.find((p) => !p.startsWith("PULLQUOTE:"))?.slice(0, 220) ||
    "";

  const { data, error } = await supabase
    .from("articles")
    .insert([
      {
        category: input.category.trim().toUpperCase(),
        title: input.title.trim(),
        subtitle: input.subtitle?.trim() ?? "",
        excerpt,
        body,
        author: input.author?.trim() || "Ndomi",
        image: input.image?.trim() ?? "",
        author_id: req.supabaseUserId,
      },
    ])
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(201).json({ article: mapRow(data) });
});
