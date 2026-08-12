import type { Request, Response, NextFunction } from "express";
import { supabase } from "./supabaseClient.js";

export interface AuthenticatedRequest extends Request {
  supabaseUserId?: string;
}

export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing Bearer authorization header." });
  }

  const token = authHeader.slice(7);
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    return res.status(401).json({ error: "Invalid or expired access token." });
  }

  req.supabaseUserId = data.user.id;
  return next();
}
