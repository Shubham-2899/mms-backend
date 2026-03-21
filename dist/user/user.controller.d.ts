import { UserService } from './user.service';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    getAllUsers(): unknown;
    createUser(body: {
        email: string;
        password: string;
        displayName: string;
        serverData: any;
        isAdmin: boolean;
    }): unknown;
    updateUser(uid: string, body: {
        email?: string;
        password?: string;
        displayName?: string;
        serverData?: any;
        isAdmin: boolean;
    }): unknown;
    deleteUser(uid: string): unknown;
    findUser(uid: string): unknown;
}
