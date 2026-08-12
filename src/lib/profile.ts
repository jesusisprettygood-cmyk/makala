import type { UserProfile } from "./api";
import { supabase } from "./supabase";

export async function fetchProfileDirect(): Promise<UserProfile> {
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error("Please sign in.");
  }

  let { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    throw new Error(profileError.message);
  }

  if (!profile) {
    const displayName = user.email?.split("@")[0] ?? "Writer";
    const { data: created, error: createError } = await supabase
      .from("profiles")
      .insert({ id: user.id, display_name: displayName })
      .select()
      .single();
    if (createError) {
      throw new Error(createError.message);
    }
    profile = created;
  }

  const { count } = await supabase
    .from("articles")
    .select("*", { count: "exact", head: true })
    .eq("author_id", user.id);

  return {
    id: profile.id,
    displayName: profile.display_name ?? "",
    avatarUrl: profile.avatar_url || null,
    bio: profile.bio ?? "",
    email: user.email ?? "",
    articleCount: count ?? 0,
  };
}

export async function updateProfileDirect(payload: {
  displayName?: string;
  bio?: string;
}): Promise<UserProfile> {
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error("Please sign in.");
  }

  const updates: Record<string, string> = { updated_at: new Date().toISOString() };
  if (payload.displayName !== undefined) {
    updates.display_name = payload.displayName.trim().slice(0, 80);
  }
  if (payload.bio !== undefined) {
    updates.bio = payload.bio.trim().slice(0, 500);
  }

  const { error } = await supabase.from("profiles").update(updates).eq("id", user.id);
  if (error) {
    throw new Error(error.message);
  }

  return fetchProfileDirect();
}
