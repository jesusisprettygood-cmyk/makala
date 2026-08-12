import { isNewArticle } from "../types/article";

export default function NewBadge({ createdAt, compact = false }: { createdAt?: string; compact?: boolean }) {
  if (!isNewArticle(createdAt)) return null;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: compact ? 4 : 6,
        background: "linear-gradient(135deg, #228b57 0%, #1a6b42 100%)",
        color: "#fff",
        fontFamily: "var(--font-sans)",
        fontSize: compact ? 9 : 10,
        fontWeight: 700,
        letterSpacing: "0.14em",
        padding: compact ? "3px 8px" : "5px 10px",
        lineHeight: 1,
        boxShadow: "0 4px 14px rgba(34, 139, 87, 0.35)",
      }}
    >
      <span
        aria-hidden
        style={{
          width: compact ? 5 : 6,
          height: compact ? 5 : 6,
          borderRadius: "50%",
          background: "#fff",
          opacity: 0.95,
        }}
      />
      NEW
    </span>
  );
}
