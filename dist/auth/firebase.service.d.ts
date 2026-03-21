export declare class FirebaseService {
    private firebaseApp;
    constructor();
    verifyToken(idToken: string): unknown;
    createUser(email: string, password: string, displayName: string): unknown;
    updateUser(uid: string, data: {
        email?: string;
        password?: string;
        displayName?: string;
    }): unknown;
    deleteUser(uid: string): unknown;
    setAdminClaim(uid: string, isAdmin: boolean): any;
}
