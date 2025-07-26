// hooks/cloudinary.ts

/**
 * Upload une image sur Cloudinary et retourne l'URL sécurisée
 * @param imageFile Fichier image à uploader
 * @returns L'URL Cloudinary de l'image
 */
export async function uploadImageToCloudinary(imageFile: File): Promise<string> {
  const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET as string;
  const data = new FormData();
  data.append("file", imageFile);
  data.append("upload_preset", uploadPreset);
  try {
    const res = await fetch(CLOUDINARY_UPLOAD_URL, {
      method: "POST",
      body: data
    });
    const cloudinary = await res.json();
    if (!cloudinary.secure_url) throw new Error("Échec de l'upload de l'image");
    return cloudinary.secure_url;
  } catch (err) {
    throw new Error("Erreur lors de l'upload de l'image");
  }
}

// Utilisation :

/**
 * Upload un fichier (PDF, docx, zip, etc.) sur Cloudinary (resource_type: 'raw') et retourne l'URL sécurisée
 * @param file Fichier à uploader
 * @returns L'URL Cloudinary du fichier
 */
export async function uploadFileToCloudinary(file: File): Promise<string> {
  const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/raw/upload`;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET as string;
  const data = new FormData();
  data.append("file", file);
  data.append("upload_preset", uploadPreset);
  try {
    const res = await fetch(CLOUDINARY_UPLOAD_URL, {
      method: "POST",
      body: data
    });
    const cloudinary = await res.json();
    if (!cloudinary.secure_url) throw new Error("Échec de l'upload du fichier");
    return cloudinary.secure_url;
  } catch (err) {
    throw new Error("Erreur lors de l'upload du fichier");
  }
}
// const url = await uploadImageToCloudinary(file);
