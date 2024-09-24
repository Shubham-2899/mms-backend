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
    return this.userModel.find().exec();
  }

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

  async updateUser(uid: string, updateData: any) {
    const updateOperations = [];

    if (updateData.serverData) {
      for (const server of updateData.serverData) {
        // Add push operation for instances or set if provider is missing
        updateOperations.push({
          updateOne: {
            filter: {
              firebaseUid: uid,
              'serverData.provider': server.provider,
            },
            update: {
              $push: {
                'serverData.$.instances': { $each: server.instances },
              },
            },
          },
        });

        // Add to serverData if provider is not found
        updateOperations.push({
          updateOne: {
            filter: {
              firebaseUid: uid,
              'serverData.provider': { $ne: server.provider },
            },
            update: {
              $addToSet: {
                serverData: {
                  provider: server.provider,
                  instances: server.instances,
                },
              },
            },
          },
        });
      }

      // Execute all operations in bulk
      await this.userModel.bulkWrite(updateOperations);
    }

    return this.userModel.findOne({ firebaseUid: uid });
  }

  async deleteUser(uid: string) {
    // Delete user in Firebase
    await this.firebaseService.deleteUser(uid);

    // Delete user in MongoDB
    return this.userModel.findOneAndDelete({ firebaseUid: uid });
  }

  async findUserByUid(uid: string) {
    return this.userModel.findOne({ firebaseUid: uid });
  }
}
