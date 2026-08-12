import { useRef, useState, type ChangeEvent } from "react";

const MAX_BYTES = 50 * 1024 * 1024;

interface ImageUploadFieldProps {
  label: string;
  onFileSelect: (file: File) => void;
  previewUrl?: string | null;
  uploading?: boolean;
  error?: string;
  hint?: string;
}

export default function ImageUploadField({
  label,
  onFileSelect,
  previewUrl,
  uploading = false,
  error,
  hint = "JPEG, PNG, or WebP · max 50 MB · converted to lightweight WebP",
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [localError, setLocalError] = useState("");

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setLocalError("");
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setLocalError("Please choose an image file.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setLocalError("Image must be smaller than 50 MB.");
      return;
    }
    onFileSelect(file);
  }

  const message = error || localError;

  return (
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
        {label}
      </label>
      <div
        style={{
          border: "1px dashed var(--border)",
          background: "var(--surface)",
          padding: 20,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {previewUrl && (
          <div style={{ aspectRatio: "16/9", maxHeight: 220, overflow: "hidden", background: "var(--muted)" }}>
            <img src={previewUrl} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            style={{
              background: "var(--ink)",
              color: "var(--paper)",
              border: "none",
              cursor: uploading ? "wait" : "pointer",
              padding: "10px 18px",
              fontFamily: "var(--font-sans)",
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.06em",
              opacity: uploading ? 0.7 : 1,
            }}
          >
            {uploading ? "UPLOADING…" : previewUrl ? "CHANGE IMAGE" : "UPLOAD IMAGE"}
          </button>
          <span style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--ink-3)" }}>{hint}</span>
        </div>
        <input ref={inputRef} type="file" accept="image/*" hidden onChange={handleChange} />
        {message && (
          <p style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "#b42318", margin: 0 }}>{message}</p>
        )}
      </div>
    </div>
  );
}
