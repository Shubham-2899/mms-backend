export declare class FirebaseService {
    private firebaseApp;
    constructor();
    verifyToken(idToken: string): Promise<any>;
    createUser(email: string, password: string, displayName: string): Promise<any>;
    updateUser(uid: string, data: {
        email?: string;
        password?: string;
        displayName?: string;
    }): Promise<any>;
    deleteUser(uid: string): Promise<any>;
    setAdminClaim(uid: string, isAdmin: boolean): Promise<void>;
}
