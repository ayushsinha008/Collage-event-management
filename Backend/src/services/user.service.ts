import { User, IUser } from '../models/User.model';
import { ApiError } from '../utils/ApiError';
import { uploadImage } from './cloudinary.service';

export class UserService {
  static async getProfile(userId: string): Promise<IUser> {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    return user;
  }

  static async updateProfile(userId: string, updateData: Partial<IUser> & { avatarBase64?: string }): Promise<IUser> {
    if (updateData.avatarBase64) {
      // Upload the base64 string directly to Cloudinary
      const url = await uploadImage(updateData.avatarBase64, 'avatars');
      updateData.photoURL = url;
      delete updateData.avatarBase64;
    }

    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    });
    
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    return user;
  }
}
