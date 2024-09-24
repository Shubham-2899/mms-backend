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

  // Function to create a new Firebase user
  async createUser(email: string, password: string, displayName: string) {
    return this.firebaseApp.auth().createUser({
      email,
      password,
      displayName,
    });
  }

  // Function to update Firebase user
  async updateUser(
    uid: string,
    data: { email?: string; password?: string; displayName?: string },
  ) {
    return this.firebaseApp.auth().updateUser(uid, data);
  }

  // Function to delete Firebase user
  async deleteUser(uid: string) {
    return this.firebaseApp.auth().deleteUser(uid);
  }
}
