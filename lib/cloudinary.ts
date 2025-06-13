// Central configuration and helpers for Cloudinary (next-cloudinary)
import { CldUploadWidgetProps } from 'next-cloudinary';

export const cloudinaryConfig = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  apiSecret: process.env.CLOUDINARY_API_SECRET, // Only use server-side if needed
};

// Helper for upload presets if you use them
export const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || undefined;

// Default upload widget options (can be overridden per usage)
// export const defaultUploadWidgetOptions: Partial<CldUploadWidgetProps> = {
//   cropping: false,
//   multiple: false,
//   resourceType: 'image',
// };

// You can add more helpers here if needed, e.g. to build URLs or transformations
