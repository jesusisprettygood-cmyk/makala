import "dotenv/config";
import { env } from "node:process";

function requireEnv(name: string): string {
  const value = env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const SUPABASE_URL = requireEnv("SUPABASE_URL");
export const SUPABASE_ANON_KEY = requireEnv("SUPABASE_ANON_KEY");
export const SUPABASE_SERVICE_ROLE_KEY = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
export const SUPABASE_JWT_SECRET = env.SUPABASE_JWT_SECRET ?? "";
export const PORT = Number(env.PORT ?? "3000");

function normalizeOrigin(raw: string): string {
  const trimmed = raw.trim().replace(/\/$/, "");
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export const FRONTEND_URL = env.FRONTEND_URL ? normalizeOrigin(env.FRONTEND_URL) : "";

export const CORS_ORIGINS = (() => {
  const origins = new Set<string>();
  if (env.CORS_ORIGINS) {
    for (const origin of env.CORS_ORIGINS.split(",")) {
      const normalized = normalizeOrigin(origin);
      if (normalized && normalized !== "*") origins.add(normalized);
    }
  }
  if (FRONTEND_URL) origins.add(FRONTEND_URL);
  return [...origins];
})();
