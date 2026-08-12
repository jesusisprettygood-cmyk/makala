import { useEffect, useRef, useState } from "react";
import { useAuth } from "../lib/auth";

type Page = "home" | "article" | "about" | "explore" | "publish" | "profile";

interface UserMenuProps {
  navigate: (page: Page) => void;
  compact?: boolean;
}

function initials(name: string, email: string): string {
  const source = name.trim() || email;
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

export default function UserMenu({ navigate, compact = false }: UserMenuProps) {
  const { session, profile, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  if (!session) {
    return (
      <button
        onClick={() => navigate("publish")}
        style={{
          background: "none",
          border: "1px solid var(--border)",
          cursor: "pointer",
          fontFamily: "var(--font-sans)",
          fontSize: compact ? 11 : 12,
          fontWeight: 600,
          letterSpacing: "0.06em",
          color: "var(--ink)",
          padding: compact ? "8px 12px" : "9px 16px",
        }}
      >
        SIGN IN
      </button>
    );
  }

  const label = profile?.displayName || session.user.email || "Account";
  const avatarUrl = profile?.avatarUrl;

  return (
    <div ref={rootRef} style={{ position: "relative" }}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "none",
          border: "1px solid var(--border)",
          cursor: "pointer",
          padding: "4px 8px 4px 4px",
          borderRadius: 999,
        }}
      >
        <span
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            overflow: "hidden",
            background: "var(--muted)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-sans)",
            fontSize: 11,
            fontWeight: 700,
            color: "var(--ink-2)",
            flexShrink: 0,
          }}
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            initials(label, session.user.email ?? "")
          )}
        </span>
        {!compact && (
          <span
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 12,
              fontWeight: 500,
              color: "var(--ink-2)",
              maxWidth: 120,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {label}
          </span>
        )}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" strokeWidth="2">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            minWidth: 180,
            background: "var(--paper)",
            border: "1px solid var(--border)",
            boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
            zIndex: 80,
            padding: "6px 0",
          }}
        >
          <button
            role="menuitem"
            type="button"
            onClick={() => {
              setOpen(false);
              navigate("profile");
            }}
            style={{
              display: "block",
              width: "100%",
              textAlign: "left",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "10px 16px",
              fontFamily: "var(--font-sans)",
              fontSize: 13,
              color: "var(--ink)",
            }}
          >
            Profile
          </button>
          <button
            role="menuitem"
            type="button"
            onClick={() => {
              setOpen(false);
              void signOut();
            }}
            style={{
              display: "block",
              width: "100%",
              textAlign: "left",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "10px 16px",
              fontFamily: "var(--font-sans)",
              fontSize: 13,
              color: "#b42318",
            }}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
