import { useAuth } from "../lib/auth";

export default function EmailVerifiedBanner() {
  const { emailVerifiedNotice, dismissEmailVerified } = useAuth();

  if (!emailVerifiedNotice) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: "rgba(24,22,26,0.55)",
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        style={{
          maxWidth: 520,
          width: "100%",
          background: "var(--paper)",
          border: "1px solid var(--border)",
          padding: "48px 40px",
          textAlign: "center",
          boxShadow: "0 24px 80px rgba(0,0,0,0.18)",
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            margin: "0 auto 24px",
            borderRadius: "50%",
            background: "rgba(34, 139, 87, 0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#228b57" strokeWidth="2">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <span
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.16em",
            color: "#228b57",
          }}
        >
          EMAIL VERIFIED
        </span>
        <h2
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(28px, 5vw, 40px)",
            fontWeight: 700,
            margin: "12px 0 16px",
            color: "var(--ink)",
          }}
        >
          Your email is confirmed
        </h2>
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 16,
            lineHeight: 1.7,
            color: "var(--ink-2)",
            margin: "0 0 32px",
          }}
        >
          Welcome to Tafakuri. You can now sign in, publish reflections, and manage your profile.
        </p>
        <button
          type="button"
          onClick={dismissEmailVerified}
          style={{
            background: "var(--accent)",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            padding: "14px 28px",
            fontFamily: "var(--font-sans)",
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.08em",
          }}
        >
          CONTINUE
        </button>
      </div>
    </div>
  );
}
