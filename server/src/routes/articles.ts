import { Router } from "express";
import { supabase } from "../supabaseClient.js";
import { requireAuth, AuthenticatedRequest } from "../auth.js";

export const articlesRouter = Router();

articlesRouter.get("/", async (_req, res) => {
  const { data, error } = await supabase.from("articles").select("*");
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  return res.status(200).json({ articles: data });
});

articlesRouter.post("/", requireAuth, async (req: AuthenticatedRequest, res) => {
  const { title, content } = req.body;
  if (typeof title !== "string" || typeof content !== "string") {
    return res.status(400).json({ error: "title and content are required strings." });
  }

  const { data, error } = await supabase.from("articles").insert([{ title, content, author_id: req.supabaseUserId }]).select();
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  return res.status(201).json({ article: data?.[0] });
});
