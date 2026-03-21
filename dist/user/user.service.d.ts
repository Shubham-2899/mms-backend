import { Model } from 'mongoose';
import { FirebaseService } from '../auth/firebase.service';
import { User } from './schemas/user.schema';
export declare class UserService {
    private userModel;
    private firebaseService;
    constructor(userModel: Model<User>, firebaseService: FirebaseService);
    getAllUsers(): unknown;
    createUser(email: string, password: string, displayName: string, serverData: any, isAdmin: boolean): unknown;
    updateUser(uid: string, updateData: any): unknown;
    deleteUser(uid: string): unknown;
    findUserByUid(uid: string): unknown;
}
