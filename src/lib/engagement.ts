import { supabase } from "./supabase";

const VIEWER_KEY = "tafakuri:viewer";

export function formatEngagementCount(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(value);
}

export function getViewerKey(): string {
  try {
    let key = localStorage.getItem(VIEWER_KEY);
    if (!key) {
      key = crypto.randomUUID();
      localStorage.setItem(VIEWER_KEY, key);
    }
    return key;
  } catch {
    return "anonymous";
  }
}

function likedStorageKey(articleId: string): string {
  return `tafakuri:liked:${articleId}`;
}

export function hasStoredLike(articleId: string): boolean {
  try {
    return localStorage.getItem(likedStorageKey(articleId)) === "1";
  } catch {
    return false;
  }
}

function setStoredLike(articleId: string, liked: boolean): void {
  try {
    if (liked) localStorage.setItem(likedStorageKey(articleId), "1");
    else localStorage.removeItem(likedStorageKey(articleId));
  } catch {
    // ignore storage errors
  }
}

function readStorageKey(articleId: string): string {
  return `tafakuri:read:${articleId}`;
}

export async function trackArticleRead(articleId: string): Promise<number | null> {
  if (!supabase) return null;

  try {
    if (sessionStorage.getItem(readStorageKey(articleId))) return null;
    sessionStorage.setItem(readStorageKey(articleId), "1");
  } catch {
    // continue without dedup if storage blocked
  }

  const { data, error } = await supabase.rpc("increment_article_read", { article_id: articleId });
  if (error) return null;
  return typeof data === "number" ? data : null;
}

export async function toggleArticleLike(articleId: string): Promise<{ liked: boolean; likeCount: number } | null> {
  if (!supabase) return null;

  const viewerKey = getViewerKey();
  const { data, error } = await supabase.rpc("toggle_article_like", {
    article_id: articleId,
    viewer_key: viewerKey,
  });

  if (error || !data || typeof data !== "object") return null;

  const result = data as { liked?: boolean; likeCount?: number };
  const liked = Boolean(result.liked);
  setStoredLike(articleId, liked);
  return {
    liked,
    likeCount: typeof result.likeCount === "number" ? result.likeCount : 0,
  };
}

export async function trackArticleShare(articleId: string): Promise<number | null> {
  if (!supabase) return null;

  const { data, error } = await supabase.rpc("increment_article_share", { article_id: articleId });
  if (error) return null;
  return typeof data === "number" ? data : null;
}

export function getArticleShareUrl(articleId: string): string {
  const base = window.location.origin + window.location.pathname;
  return `${base}?article=${encodeURIComponent(articleId)}`;
}
