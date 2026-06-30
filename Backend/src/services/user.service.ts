import { User, IUser } from '../models/User.model';
import { ApiError } from '../utils/ApiError';

export class UserService {
  static async getProfile(userId: string): Promise<IUser> {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    return user;
  }

  static async updateProfile(userId: string, updateData: Partial<IUser>): Promise<IUser> {
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
