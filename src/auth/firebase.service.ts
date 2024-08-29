// src/auth/firebase.service.ts
import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as path from 'path';

//To avoid keeping sensitive files like serviceAccountKey.json directly into code, we can keep content of the file into .env file
@Injectable()
export class FirebaseService {
  private firebaseApp: admin.app.App;

  constructor() {
    const serviceAccount = require(
      path.resolve(__dirname, '../../serviceAccountKey.json'),
    );

    this.firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }

  async verifyToken(idToken: string) {
    return this.firebaseApp.auth().verifyIdToken(idToken);
  }
}
