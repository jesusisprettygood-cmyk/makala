import { Router } from "express";
import { requireAuth, type AuthenticatedRequest } from "../auth.js";
import { supabase } from "../supabaseClient.js";

export const profileRouter = Router();

type ProfileRow = {
  id: string;
  display_name: string;
  avatar_url: string;
  bio: string;
  created_at: string;
  updated_at: string;
};

profileRouter.get("/", requireAuth, async (req: AuthenticatedRequest, res) => {
  const userId = req.supabaseUserId;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized." });
  }

  const [{ data: profile, error: profileError }, { data: userData, error: userError }, { count }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase.auth.admin.getUserById(userId),
      supabase
        .from("articles")
        .select("*", { count: "exact", head: true })
        .eq("author_id", userId),
    ]);

  if (profileError) {
    return res.status(500).json({ error: profileError.message });
  }
  if (userError || !userData.user) {
    return res.status(500).json({ error: userError?.message ?? "User not found." });
  }

  let row = profile as ProfileRow | null;
  if (!row) {
    const displayName =
      (userData.user.user_metadata?.display_name as string | undefined) ??
      userData.user.email?.split("@")[0] ??
      "Writer";

    const { data: created, error: createError } = await supabase
      .from("profiles")
      .insert([{ id: userId, display_name: displayName }])
      .select()
      .single();

    if (createError) {
      return res.status(500).json({ error: createError.message });
    }
    row = created as ProfileRow;
  }

  return res.status(200).json({
    profile: {
      id: row.id,
      displayName: row.display_name,
      avatarUrl: row.avatar_url || null,
      bio: row.bio,
      email: userData.user.email ?? "",
      articleCount: count ?? 0,
    },
  });
});

profileRouter.patch("/", requireAuth, async (req: AuthenticatedRequest, res) => {
  const userId = req.supabaseUserId;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized." });
  }

  const displayName =
    typeof req.body.displayName === "string" ? req.body.displayName.trim().slice(0, 80) : undefined;
  const bio = typeof req.body.bio === "string" ? req.body.bio.trim().slice(0, 500) : undefined;

  if (displayName === undefined && bio === undefined) {
    return res.status(400).json({ error: "Nothing to update." });
  }

  const updates: Record<string, string> = { updated_at: new Date().toISOString() };
  if (displayName !== undefined) updates.display_name = displayName;
  if (bio !== undefined) updates.bio = bio;

  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  const row = data as ProfileRow;
  return res.status(200).json({
    profile: {
      id: row.id,
      displayName: row.display_name,
      avatarUrl: row.avatar_url || null,
      bio: row.bio,
    },
  });
});
