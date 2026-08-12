import { createClient } from "@supabase/supabase-js";
import { jwtVerify } from "jose";
import type { Request, Response, NextFunction } from "express";
import { SUPABASE_ANON_KEY, SUPABASE_JWT_SECRET, SUPABASE_URL } from "./config.js";

export interface AuthenticatedRequest extends Request {
  supabaseUserId?: string;
}

function readBearerToken(authHeader: string | undefined): string | null {
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7).trim();
  return token || null;
}

async function verifyWithJwtSecret(token: string): Promise<string | null> {
  if (!SUPABASE_JWT_SECRET) return null;

  try {
    const secret = new TextEncoder().encode(SUPABASE_JWT_SECRET);
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
    });
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

async function verifyWithSupabaseApi(authHeader: string): Promise<string | null> {
  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await client.auth.getUser();
  if (error || !data.user) {
    return null;
  }
  return data.user.id;
}

export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = readBearerToken(authHeader);
  if (!token) {
    return res.status(401).json({ error: "Missing Bearer authorization header." });
  }

  const userId =
    (await verifyWithJwtSecret(token)) ??
    (authHeader ? await verifyWithSupabaseApi(authHeader) : null);

  if (!userId) {
    return res.status(401).json({
      error: "Session expired. Please sign out, sign in again, then publish.",
    });
  }

  req.supabaseUserId = userId;
  return next();
}
