import { supabase } from "./supabase";

const BUCKET = "makala";

async function compressImage(
  file: File,
  maxWidth: number,
  maxHeight: number,
  quality = 0.82,
): Promise<Blob> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("Could not read this image. Try JPEG or PNG.");
  }

  const ratio = Math.min(1, maxWidth / bitmap.width, maxHeight / bitmap.height);
  const width = Math.round(bitmap.width * ratio);
  const height = Math.round(bitmap.height * ratio);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close?.();
    throw new Error("Could not process image.");
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (result) resolve(result);
        else reject(new Error("Could not compress image."));
      },
      "image/webp",
      quality,
    );
  });

  return blob;
}

function publicUrl(path: string): string {
  if (!supabase) throw new Error("Supabase is not configured.");
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadArticleImage(file: File, userId: string): Promise<string> {
  if (!supabase) throw new Error("Supabase is not configured.");

  const webp = await compressImage(file, 1600, 900);
  const path = `articles/${userId}/${crypto.randomUUID()}.webp`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, webp, {
    contentType: "image/webp",
    cacheControl: "3600",
    upsert: false,
  });

  if (error) {
    throw new Error(error.message);
  }

  return publicUrl(path);
}

export async function uploadProfilePhoto(file: File, userId: string): Promise<string> {
  if (!supabase) throw new Error("Supabase is not configured.");

  const webp = await compressImage(file, 512, 512);
  const path = `profiles/${userId}/avatar.webp`;

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, webp, {
    contentType: "image/webp",
    cacheControl: "3600",
    upsert: true,
  });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const url = publicUrl(path);

  const { error: profileError } = await supabase
    .from("profiles")
    .upsert({ id: userId, avatar_url: url, updated_at: new Date().toISOString() });

  if (profileError) {
    throw new Error(profileError.message);
  }

  return url;
}
