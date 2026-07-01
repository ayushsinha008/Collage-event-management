import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env.config';
import { ApiError } from '../utils/ApiError';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

export const uploadImage = async (filePath: string, folder: string): Promise<string> => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: `festflow/${folder}`,
      use_filename: true,
      unique_filename: true,
    });
    return result.secure_url;
  } catch (error: any) {
    throw new ApiError(500, `Cloudinary upload failed: ${error.message}`);
  }
};

export const deleteImage = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error: any) {
    throw new ApiError(500, `Cloudinary delete failed: ${error.message}`);
  }
};
