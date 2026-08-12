import { supabase } from "./supabase";

export async function subscribeEmail(email: string): Promise<void> {
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const normalized = email.trim().toLowerCase();
  if (!normalized || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    throw new Error("Please enter a valid email address.");
  }

  const { error } = await supabase.from("subscribers").insert({ email: normalized });

  if (error) {
    if (error.code === "23505") {
      return;
    }
    throw new Error(error.message);
  }
}
