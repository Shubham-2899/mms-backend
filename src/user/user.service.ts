import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FirebaseService } from '../auth/firebase.service';
import { User } from './schemas/user.schema';
@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private firebaseService: FirebaseService,
  ) {}

  // Method to get all users
  async getAllUsers() {
    // Get all users from MongoDB
    try {
      const users = await this.userModel.find().exec();
      return {
        message: 'All Users',
        success: true,
        users: users,
      };
    } catch (err) {
      console.log(err);
      return {
        message: err.message,
        success: false,
      };
    }
  }

  /**
   * Creates a new user in Firebase and MongoDB.
   * @param email - The user's email address.
   * @param password - The user's password.
   * @param displayName - The user's display name.
   * @param serverData - The user's server data.
   * @param isAdmin - Whether the user is an admin or not.
   * @returns The newly created user.
   */
  async createUser(
    email: string,
    password: string,
    displayName: string,
    serverData: any,
    isAdmin: boolean,
  ) {
    // Create user in Firebase
    const firebaseUser = await this.firebaseService.createUser(
      email,
      password,
      displayName,
    );

    // Set the custom claim for admin
    await this.firebaseService.setAdminClaim(firebaseUser.uid, isAdmin);

    // Save user in MongoDB
    const createdUser = new this.userModel({
      firebaseUid: firebaseUser.uid,
      email,
      name: displayName,
      serverData,
      isAdmin,
    });

    return createdUser.save();
  }

  // Method to update a user
  async updateUser(uid: string, updateData: any) {
    const existingUser = await this.userModel.findOne({ firebaseUid: uid });

    if (!existingUser) {
      throw new Error('User not found');
    }

    const promises: Promise<any>[] = []; // Array to hold promises

    // Check if isAdmin has changed, and update Firebase claims accordingly
    if (
      updateData.isAdmin !== undefined &&
      updateData.isAdmin !== existingUser.isAdmin
    ) {
      promises.push(
        this.firebaseService.setAdminClaim(uid, updateData.isAdmin),
      );
      promises.push(
        this.userModel.updateOne(
          { firebaseUid: uid },
          { $set: { isAdmin: updateData.isAdmin } },
        ),
      );
    }

    // Update serverData if provided
    if (updateData.serverData) {
      await this.userModel.updateOne(
        { firebaseUid: uid },
        { $set: { serverData: updateData.serverData } },
      );
    }

    // Resolve all promises (for isAdmin update and Firebase claim)
    if (promises.length > 0) {
      await Promise.all(promises);
    }

    // Fetch and return the updated user
    const updatedUser = await this.userModel.findOne({ firebaseUid: uid });
    return updatedUser;
  }

  async deleteUser(uid: string) {
    // Delete user in Firebase
    await this.firebaseService.deleteUser(uid);

    // Delete user in MongoDB
    return this.userModel.findOneAndDelete({ firebaseUid: uid });
  }

  async findUserByUid(uid: string) {
    // Find user in MongoDB
    const user = await this.userModel.findOne({ firebaseUid: uid });
    if (!user) {
      return {
        message: 'User not found',
        success: false,
      };
    }
    return {
      message: 'User Found',
      success: true,
      user: user,
    };
  }
}
