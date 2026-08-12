import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "../lib/auth";
import { updateProfile, uploadProfilePhoto } from "../lib/api";
import ImageUploadField from "../components/ImageUploadField";

const WRAP = { maxWidth: 1200, margin: "0 auto", padding: "0 24px" } as const;

type NavFn = (page: "home" | "article" | "about" | "explore" | "publish" | "profile") => void;

interface ProfilePageProps {
  navigate: NavFn;
}

const fieldStyle = {
  width: "100%",
  background: "var(--surface)",
  border: "1px solid var(--border)",
  padding: "13px 16px",
  fontFamily: "var(--font-sans)",
  fontSize: 14,
  color: "var(--ink)",
  outline: "none",
} as const;

export default function ProfilePage({ navigate }: ProfilePageProps) {
  const { ready, accessToken, profile, refreshProfile, signOut } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName);
      setBio(profile.bio);
    }
  }, [profile]);

  if (!ready) {
    return (
      <main style={{ paddingTop: 120, paddingBottom: 80, textAlign: "center" }}>
        <div style={WRAP}>Loading…</div>
      </main>
    );
  }

  if (!accessToken || !profile) {
    return (
      <main style={{ paddingTop: 120, paddingBottom: 80 }}>
        <div style={{ ...WRAP, maxWidth: 560, textAlign: "center" }}>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 36, marginBottom: 16 }}>Your profile</h1>
          <p style={{ fontFamily: "var(--font-sans)", color: "var(--ink-2)", lineHeight: 1.7, marginBottom: 24 }}>
            Sign in to view and edit your profile.
          </p>
          <button
            type="button"
            onClick={() => navigate("publish")}
            style={{
              background: "var(--accent)",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              padding: "12px 24px",
              fontFamily: "var(--font-sans)",
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.08em",
            }}
          >
            SIGN IN
          </button>
        </div>
      </main>
    );
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!accessToken) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await updateProfile({ displayName, bio }, accessToken);
      await refreshProfile();
      setMessage("Profile updated successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  }

  async function handlePhoto(file: File) {
    if (!accessToken) return;
    setUploadingPhoto(true);
    setError("");
    setMessage("");
    try {
      await uploadProfilePhoto(file, accessToken);
      await refreshProfile();
      setMessage("Profile photo updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload photo.");
    } finally {
      setUploadingPhoto(false);
    }
  }

  return (
    <main style={{ paddingTop: 96, paddingBottom: 96 }}>
      <div style={WRAP}>
        <div style={{ maxWidth: 880, margin: "0 auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr)",
              gap: 32,
            }}
            className="profile-grid"
          >
            <section
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                padding: "40px 36px",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.16em",
                  color: "var(--accent)",
                }}
              >
                ACCOUNT
              </span>
              <h1
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "clamp(32px, 5vw, 44px)",
                  fontWeight: 700,
                  margin: "12px 0 8px",
                }}
              >
                {profile.displayName || "Your profile"}
              </h1>
              <p style={{ fontFamily: "var(--font-sans)", color: "var(--ink-2)", margin: "0 0 32px" }}>
                {profile.email}
              </p>

              <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginBottom: 36 }}>
                <div
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: "50%",
                    overflow: "hidden",
                    background: "var(--muted)",
                    flexShrink: 0,
                  }}
                >
                  {profile.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt=""
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily: "var(--font-serif)",
                        fontSize: 36,
                        color: "var(--ink-3)",
                      }}
                    >
                      {(profile.displayName || profile.email).slice(0, 1).toUpperCase()}
                    </div>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 240 }}>
                  <ImageUploadField
                    label="PROFILE PHOTO"
                    onFileSelect={handlePhoto}
                    previewUrl={profile.avatarUrl}
                    uploading={uploadingPhoto}
                    hint="Square photos work best · max 50 MB"
                  />
                </div>
              </div>

              <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontFamily: "var(--font-sans)",
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: "0.1em",
                      color: "var(--ink-3)",
                      marginBottom: 8,
                    }}
                  >
                    DISPLAY NAME
                  </label>
                  <input
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    style={fieldStyle}
                    maxLength={80}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontFamily: "var(--font-sans)",
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: "0.1em",
                      color: "var(--ink-3)",
                      marginBottom: 8,
                    }}
                  >
                    BIO
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={5}
                    maxLength={500}
                    style={{ ...fieldStyle, resize: "vertical", lineHeight: 1.7 }}
                    placeholder="A short introduction for readers."
                  />
                </div>

                {message && (
                  <p style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "#228b57", margin: 0 }}>
                    {message}
                  </p>
                )}
                {error && (
                  <p style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "#b42318", margin: 0 }}>
                    {error}
                  </p>
                )}

                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <button
                    type="submit"
                    disabled={saving}
                    style={{
                      background: "var(--accent)",
                      color: "#fff",
                      border: "none",
                      cursor: "pointer",
                      padding: "14px 24px",
                      fontFamily: "var(--font-sans)",
                      fontSize: 12,
                      fontWeight: 600,
                      letterSpacing: "0.08em",
                      opacity: saving ? 0.7 : 1,
                    }}
                  >
                    {saving ? "SAVING…" : "SAVE PROFILE"}
                  </button>
                  <button
                    type="button"
                    onClick={() => void signOut()}
                    style={{
                      background: "none",
                      border: "1px solid var(--border)",
                      cursor: "pointer",
                      padding: "14px 24px",
                      fontFamily: "var(--font-sans)",
                      fontSize: 12,
                      color: "var(--ink-3)",
                    }}
                  >
                    LOGOUT
                  </button>
                </div>
              </form>
            </section>

            <aside
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 16,
              }}
            >
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "28px 24px" }}>
                <div
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: 40,
                    fontWeight: 700,
                    color: "var(--accent)",
                    lineHeight: 1,
                  }}
                >
                  {profile.articleCount}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: 12,
                    letterSpacing: "0.08em",
                    color: "var(--ink-3)",
                    marginTop: 8,
                  }}
                >
                  ARTICLES PUBLISHED
                </div>
              </div>
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "28px 24px" }}>
                <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--ink-2)", lineHeight: 1.7 }}>
                  Your account is protected. Only you can publish, upload photos, or sign out from this session.
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}
