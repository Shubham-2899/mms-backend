export declare class FirebaseService {
    private firebaseApp;
    constructor();
    verifyToken(idToken: string): Promise<import("firebase-admin/lib/auth/token-verifier").DecodedIdToken>;
    createUser(email: string, password: string, displayName: string): Promise<import("firebase-admin/lib/auth/user-record").UserRecord>;
    updateUser(uid: string, data: {
        email?: string;
        password?: string;
        displayName?: string;
    }): Promise<import("firebase-admin/lib/auth/user-record").UserRecord>;
    deleteUser(uid: string): Promise<void>;
}
