import type { Request, Response, NextFunction } from "express";
import { supabaseAuth } from "./supabaseClient.js";

export interface AuthenticatedRequest extends Request {
  supabaseUserId?: string;
}

export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing Bearer authorization header." });
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    return res.status(401).json({ error: "Missing access token." });
  }

  const { data, error } = await supabaseAuth.auth.getUser(token);
  if (error || !data.user) {
    const message = error?.message?.toLowerCase().includes("expired")
      ? "Session expired. Please sign in again."
      : "Invalid or expired access token.";
    return res.status(401).json({ error: message });
  }

  req.supabaseUserId = data.user.id;
  return next();
}
