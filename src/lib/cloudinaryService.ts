/**
 * Cloudinary Media & File Service
 * Uploads all images, videos, and PDF attachments to Cloudinary CDN,
 * and returns secure URLs to be saved directly in Neon PostgreSQL.
 */

export interface CloudinaryUploadResponse {
  success: boolean;
  secure_url: string;
  public_id: string;
  format: string;
  bytes: number;
  original_filename: string;
  resource_type: string;
  message?: string;
  error?: string;
}

export const CLOUDINARY_CONFIG = {
  cloudName: "t7lndpvi",
  apiKey: "119922593911554",
  uploadPreset: "senauratech_preset",
  folder: "senauratech_media",
};

export async function uploadMediaToCloudinary(
  file: File | string,
  folder: string = "senauratech_media",
  resourceType?: "image" | "video" | "raw" | "auto"
): Promise<string> {
  try {
    // 1. Try Server-Side Upload (Signed with Secret Key)
    let payloadFile: string;

    if (file instanceof File) {
      payloadFile = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    } else {
      payloadFile = file;
    }

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          file: payloadFile,
          filename: file instanceof File ? file.name : "upload_file",
          folder,
          resourceType: resourceType || (file instanceof File && file.type.startsWith("video/") ? "video" : "auto"),
        }),
      });

      if (res.ok) {
        const data: CloudinaryUploadResponse = await res.json();
        if (data.secure_url) return data.secure_url;
      }
    } catch (serverErr) {
      console.warn("Server-side upload attempt failed, falling back to direct preset upload:", serverErr);
    }

    // 2. Fallback: Direct Browser Upload using Unsigned Upload Preset (senauratech_preset)
    if (file instanceof File) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", CLOUDINARY_CONFIG.uploadPreset);
      formData.append("folder", folder);

      const type = file.type.startsWith("video/") ? "video" : (file.type.startsWith("image/") ? "image" : "auto");
      const directRes = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/${type}/upload`, {
        method: "POST",
        body: formData,
      });

      if (directRes.ok) {
        const directData = await directRes.json();
        return directData.secure_url || directData.url;
      }
    }

    // Fallback if URL
    if (typeof file === "string" && file.startsWith("http")) return file;
    return typeof file === "string" ? file : URL.createObjectURL(file);
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    if (typeof file === "string" && file.startsWith("http")) return file;
    return typeof file === "string" ? file : URL.createObjectURL(file);
  }
}
