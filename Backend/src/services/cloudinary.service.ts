import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env.config';
import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

const DEFAULT_EVENT_PLACEHOLDER = 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=800&q=80';

export const uploadImage = async (filePath: string, folder: string): Promise<string> => {
  const isDummyConfig = !env.CLOUDINARY_CLOUD_NAME || env.CLOUDINARY_CLOUD_NAME === 'your-cloud-name';
  if (isDummyConfig) {
    logger.warn('⚠️ Cloudinary is not configured. Returning original file/base64 fallback.');
    return filePath;
  }

  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: `festflow/${folder}`,
      use_filename: true,
      unique_filename: true,
    });
    return result.secure_url;
  } catch (error: any) {
    logger.warn(`⚠️ Cloudinary upload failed (${error.message}). Returning original file/base64 fallback.`);
    return filePath;
  }
};

export const deleteImage = async (publicId: string): Promise<void> => {
  const isDummyConfig = !env.CLOUDINARY_CLOUD_NAME || env.CLOUDINARY_CLOUD_NAME === 'your-cloud-name';
  if (isDummyConfig && (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test')) {
    return;
  }

  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error: any) {
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      logger.warn(`⚠️ Cloudinary delete failed: ${error.message}`);
      return;
    }
    throw new ApiError(500, `Cloudinary delete failed: ${error.message}`);
  }
};
