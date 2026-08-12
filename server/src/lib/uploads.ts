import sharp from "sharp";
import { supabase } from "../supabaseClient.js";

export const STORAGE_BUCKET = "makala";
export const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;

export async function processToWebp(
  buffer: Buffer,
  maxWidth: number,
  maxHeight: number,
): Promise<Buffer> {
  return sharp(buffer)
    .rotate()
    .resize(maxWidth, maxHeight, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();
}

export async function uploadToMakala(
  path: string,
  buffer: Buffer,
  upsert = false,
): Promise<string> {
  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, buffer, {
    contentType: "image/webp",
    upsert,
    cacheControl: "3600",
  });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export function articleImagePath(userId: string): string {
  return `articles/${userId}/${crypto.randomUUID()}.webp`;
}

export function profileAvatarPath(userId: string): string {
  return `profiles/${userId}/avatar.webp`;
}
