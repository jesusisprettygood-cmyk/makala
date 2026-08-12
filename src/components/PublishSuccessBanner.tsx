import type { Article } from "../types/article";

interface PublishSuccessBannerProps {
  article: Article | null;
  onView: () => void;
  onDismiss: () => void;
}

export default function PublishSuccessBanner({ article, onView, onDismiss }: PublishSuccessBannerProps) {
  if (!article) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 92,
        left: 0,
        right: 0,
        zIndex: 60,
        padding: "0 24px",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          maxWidth: 920,
          margin: "0 auto",
          background: "rgba(34, 139, 87, 0.96)",
          color: "#fff",
          border: "1px solid rgba(255,255,255,0.18)",
          boxShadow: "0 16px 48px rgba(0,0,0,0.18)",
          padding: "18px 22px",
          display: "flex",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap",
          pointerEvents: "auto",
        }}
      >
        <div style={{ flex: 1, minWidth: 220 }}>
          <div
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.14em",
              opacity: 0.9,
              marginBottom: 4,
            }}
          >
            ARTICLE PUBLISHED
          </div>
          <div
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 20,
              fontWeight: 700,
              lineHeight: 1.3,
            }}
          >
            {article.title}
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={onView}
            style={{
              background: "#fff",
              color: "#1a6b42",
              border: "none",
              cursor: "pointer",
              padding: "10px 18px",
              fontFamily: "var(--font-sans)",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.06em",
            }}
          >
            VIEW ARTICLE
          </button>
          <button
            type="button"
            onClick={onDismiss}
            style={{
              background: "transparent",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.35)",
              cursor: "pointer",
              padding: "10px 18px",
              fontFamily: "var(--font-sans)",
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            DISMISS
          </button>
        </div>
      </div>
    </div>
  );
}
