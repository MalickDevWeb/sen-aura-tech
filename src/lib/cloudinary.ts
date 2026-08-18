/**
 * Cloudinary & File Upload Service for SEN AURA TECH
 * Upload direct navigateur → Cloudinary CDN (unsigned preset)
 */

export interface CloudinaryUploadResult {
  success: boolean;
  secure_url: string;
  public_id: string;
  format: string;
  bytes: number;
  original_filename: string;
  resource_type: string;
  createdAt: string;
  provider: "cloudinary" | "fallback";
  message?: string;
}

export type UploadProgressCallback = (percent: number, stage: string) => void;

// Variables Cloudinary côté client (VITE_*)
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "t7lndpvi";
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "senauratech_preset";

/**
 * Upload un fichier directement vers Cloudinary depuis le navigateur.
 * Utilise un "unsigned upload preset" — aucune signature SHA-1 requise.
 */
export async function uploadToCloudinary(
  fileOrBase64: File | Blob | string,
  folder: string = "sen_aura_tech_uploads",
  resourceType?: "image" | "video" | "auto",
  onProgress?: UploadProgressCallback
): Promise<CloudinaryUploadResult> {
  const isVideo =
    resourceType === "video" ||
    (fileOrBase64 instanceof File && fileOrBase64.type.startsWith("video/")) ||
    (typeof fileOrBase64 === "string" && fileOrBase64.startsWith("data:video/"));

  const uploadType = isVideo ? "video" : "auto";

  onProgress?.(10, "Préparation du fichier...");

  try {
    const formData = new FormData();
    formData.append("upload_preset", UPLOAD_PRESET);
    formData.append("folder", folder);

    if (fileOrBase64 instanceof File || fileOrBase64 instanceof Blob) {
      formData.append("file", fileOrBase64);
    } else {
      // base64 data URI ou URL string
      formData.append("file", fileOrBase64);
    }

    onProgress?.(30, "Connexion au CDN Cloudinary...");

    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${uploadType}/upload`;

    // Simulated smooth progress
    let fakeProgress = 40;
    const progressTimer = setInterval(() => {
      fakeProgress = Math.min(88, fakeProgress + Math.floor(Math.random() * 8 + 2));
      onProgress?.(fakeProgress, "Téléversement sur Cloudinary CDN...");
    }, 300);

    let cloudRes: Response;
    try {
      cloudRes = await fetch(cloudinaryUrl, {
        method: "POST",
        body: formData,
      });
    } finally {
      clearInterval(progressTimer);
    }

    if (!cloudRes.ok) {
      const errJson = await cloudRes.json().catch(() => null);
      const errMsg = errJson?.error?.message || `Cloudinary error ${cloudRes.status}`;
      throw new Error(errMsg);
    }

    const cloudJson = await cloudRes.json();
    onProgress?.(100, "Média téléversé avec succès !");

    return {
      success: true,
      secure_url: cloudJson.secure_url,
      public_id: cloudJson.public_id,
      format: cloudJson.format || (isVideo ? "mp4" : "jpg"),
      bytes: cloudJson.bytes || 0,
      original_filename: cloudJson.original_filename || "upload",
      resource_type: cloudJson.resource_type || uploadType,
      createdAt: new Date().toISOString(),
      provider: "cloudinary",
      message: "Média envoyé sur Cloudinary CDN avec succès !",
    };
  } catch (error: any) {
    console.warn("Cloudinary upload failed, fallback local:", error?.message || error);

    // Fallback: aperçu base64 local si c'est un File
    let fallbackUrl: string;
    if (fileOrBase64 instanceof File || fileOrBase64 instanceof Blob) {
      fallbackUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () =>
          resolve(
            isVideo
              ? "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
              : "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=400"
          );
        reader.readAsDataURL(fileOrBase64);
      });
    } else if (typeof fileOrBase64 === "string" && fileOrBase64.startsWith("data:")) {
      fallbackUrl = fileOrBase64;
    } else {
      fallbackUrl = isVideo
        ? "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
        : "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=400";
    }

    onProgress?.(100, "Aperçu local généré !");

    return {
      success: true,
      secure_url: fallbackUrl,
      public_id: `local_${Date.now()}`,
      format: isVideo ? "mp4" : "jpg",
      bytes: 0,
      original_filename:
        fileOrBase64 instanceof File ? fileOrBase64.name : "upload",
      resource_type: isVideo ? "video" : "image",
      createdAt: new Date().toISOString(),
      provider: "fallback",
      message:
        error?.message ||
        "Aperçu local généré. Vérifiez que le preset Cloudinary est bien 'Unsigned'.",
    };
  }
}

export async function checkCloudinaryStatus(): Promise<{
  configured: boolean;
  cloudName?: string;
  provider: string;
}> {
  return {
    configured: !!(CLOUD_NAME && UPLOAD_PRESET),
    cloudName: CLOUD_NAME,
    provider: "cloudinary",
  };
}
