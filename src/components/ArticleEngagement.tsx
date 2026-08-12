import { useEffect, useState } from "react";
import type { Article } from "../types/article";
import {
  formatEngagementCount,
  getArticleShareUrl,
  hasStoredLike,
  toggleArticleLike,
  trackArticleRead,
  trackArticleShare,
} from "../lib/engagement";
import { isRealArticle } from "../lib/articles";

export type ArticleEngagementStats = {
  readCount: number;
  likeCount: number;
  shareCount: number;
  liked: boolean;
};

interface ArticleEngagementProps {
  article: Article;
  onStatsChange?: (stats: Partial<ArticleEngagementStats>) => void;
}

const statStyle = {
  fontFamily: "var(--font-sans)",
  fontSize: 12,
  color: "var(--ink-3)",
  letterSpacing: "0.02em",
} as const;

const actionBtnStyle = {
  background: "none",
  border: "1px solid var(--border)",
  cursor: "pointer",
  fontFamily: "var(--font-sans)",
  fontSize: 11,
  fontWeight: 500,
  color: "var(--ink-3)",
  padding: "7px 12px",
  letterSpacing: "0.04em",
  transition: "border-color 0.2s, color 0.2s, background 0.2s",
} as const;

export default function ArticleEngagement({ article, onStatsChange }: ArticleEngagementProps) {
  const [readCount, setReadCount] = useState(article.mostRead ?? 0);
  const [likeCount, setLikeCount] = useState(article.likeCount ?? 0);
  const [shareCount, setShareCount] = useState(article.shareCount ?? 0);
  const [liked, setLiked] = useState(() => hasStoredLike(article.id));
  const [likeLoading, setLikeLoading] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [shareMessage, setShareMessage] = useState("");

  useEffect(() => {
    setReadCount(article.mostRead ?? 0);
    setLikeCount(article.likeCount ?? 0);
    setShareCount(article.shareCount ?? 0);
    setLiked(hasStoredLike(article.id));
  }, [article.id, article.likeCount, article.mostRead, article.shareCount]);

  useEffect(() => {
    if (!isRealArticle(article)) return;
    void trackArticleRead(article.id).then((count) => {
      if (count === null) return;
      setReadCount(count);
      onStatsChange?.({ readCount: count });
    });
  }, [article.id]);

  async function handleLike() {
    if (!isRealArticle(article) || likeLoading) return;
    setLikeLoading(true);
    try {
      const result = await toggleArticleLike(article.id);
      if (!result) return;
      setLiked(result.liked);
      setLikeCount(result.likeCount);
      onStatsChange?.({ liked: result.liked, likeCount: result.likeCount });
    } finally {
      setLikeLoading(false);
    }
  }

  async function bumpShare(): Promise<number | null> {
    if (!isRealArticle(article)) {
      setShareCount((current) => current + 1);
      return shareCount + 1;
    }
    const count = await trackArticleShare(article.id);
    if (count === null) return null;
    setShareCount(count);
    onStatsChange?.({ shareCount: count });
    return count;
  }

  async function handleShare() {
    if (shareLoading) return;
    setShareLoading(true);
    setShareMessage("");
    const url = getArticleShareUrl(article.id);

    try {
      if (navigator.share) {
        await navigator.share({
          title: article.title,
          text: article.subtitle || article.excerpt,
          url,
        });
        await bumpShare();
        setShareMessage("Shared");
      } else {
        await navigator.clipboard.writeText(url);
        await bumpShare();
        setShareMessage("Link copied");
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      try {
        await navigator.clipboard.writeText(url);
        await bumpShare();
        setShareMessage("Link copied");
      } catch {
        setShareMessage("Could not share");
      }
    } finally {
      setShareLoading(false);
      window.setTimeout(() => setShareMessage(""), 2500);
    }
  }

  async function handleCopyLink() {
    if (shareLoading) return;
    setShareLoading(true);
    setShareMessage("");
    try {
      await navigator.clipboard.writeText(getArticleShareUrl(article.id));
      await bumpShare();
      setShareMessage("Link copied");
    } catch {
      setShareMessage("Could not copy link");
    } finally {
      setShareLoading(false);
      window.setTimeout(() => setShareMessage(""), 2500);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, alignItems: "flex-end" }}>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "flex-end" }}>
        <span style={statStyle}>{formatEngagementCount(readCount)} reads</span>
        <span style={statStyle}>{formatEngagementCount(likeCount)} likes</span>
        <span style={statStyle}>{formatEngagementCount(shareCount)} shares</span>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end", alignItems: "center" }}>
        <button
          type="button"
          onClick={() => void handleLike()}
          disabled={likeLoading}
          style={{
            ...actionBtnStyle,
            color: liked ? "var(--accent)" : "var(--ink-3)",
            borderColor: liked ? "var(--accent)" : "var(--border)",
            background: liked ? "rgba(196, 120, 74, 0.08)" : "none",
            opacity: likeLoading ? 0.7 : 1,
          }}
        >
          {likeLoading ? "…" : liked ? "Liked" : "Like"}
        </button>
        <button
          type="button"
          onClick={() => void handleShare()}
          disabled={shareLoading}
          style={{ ...actionBtnStyle, opacity: shareLoading ? 0.7 : 1 }}
        >
          {shareLoading ? "…" : "Share"}
        </button>
        <button
          type="button"
          onClick={() => void handleCopyLink()}
          disabled={shareLoading}
          style={{ ...actionBtnStyle, opacity: shareLoading ? 0.7 : 1 }}
        >
          Copy link
        </button>
        {shareMessage && (
          <span style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--accent)" }}>
            {shareMessage}
          </span>
        )}
      </div>
    </div>
  );
}
