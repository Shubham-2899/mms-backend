export declare class FirebaseService {
    private firebaseApp;
    constructor();
    verifyToken(idToken: string): Promise<import("firebase-admin/lib/auth/token-verifier").DecodedIdToken>;
}
