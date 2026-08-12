import { Router, type NextFunction, type Response } from "express";
import multer from "multer";
import { requireAuth, type AuthenticatedRequest } from "../auth.js";
import { supabase } from "../supabaseClient.js";
import {
  MAX_UPLOAD_BYTES,
  articleImagePath,
  processToWebp,
  profileAvatarPath,
  uploadToMakala,
} from "../lib/uploads.js";

export const uploadsRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_BYTES },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      cb(new Error("Only image uploads are allowed."));
      return;
    }
    cb(null, true);
  },
});

function handleUpload(fieldName: string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    upload.single(fieldName)(req, res, (err: unknown) => {
      if (!err) {
        next();
        return;
      }
      if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
        res.status(400).json({ error: "Image must be smaller than 50 MB." });
        return;
      }
      const message = err instanceof Error ? err.message : "Upload failed.";
      res.status(400).json({ error: message });
    });
  };
}

uploadsRouter.post(
  "/article-image",
  requireAuth,
  handleUpload("image"),
  async (req: AuthenticatedRequest, res) => {
    const file = req.file;
    const userId = req.supabaseUserId;
    if (!file || !userId) {
      return res.status(400).json({ error: "Image file is required." });
    }

    try {
      const webp = await processToWebp(file.buffer, 1600, 900);
      const path = articleImagePath(userId);
      const url = await uploadToMakala(path, webp);
      return res.status(201).json({ url });
    } catch (err) {
      return res.status(500).json({
        error: err instanceof Error ? err.message : "Failed to process image.",
      });
    }
  },
);

uploadsRouter.post(
  "/profile-photo",
  requireAuth,
  handleUpload("photo"),
  async (req: AuthenticatedRequest, res) => {
    const file = req.file;
    const userId = req.supabaseUserId;
    if (!file || !userId) {
      return res.status(400).json({ error: "Photo file is required." });
    }

    try {
      const webp = await processToWebp(file.buffer, 512, 512);
      const path = profileAvatarPath(userId);
      const url = await uploadToMakala(path, webp, true);

      const { error } = await supabase
        .from("profiles")
        .upsert({ id: userId, avatar_url: url, updated_at: new Date().toISOString() });

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json({ url });
    } catch (err) {
      return res.status(500).json({
        error: err instanceof Error ? err.message : "Failed to upload profile photo.",
      });
    }
  },
);
