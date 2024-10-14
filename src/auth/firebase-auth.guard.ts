// src/auth/firebase-auth.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { FirebaseService } from './firebase.service';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(private firebaseService: FirebaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];

    console.log('token:', token);

    if (!token) {
      return false;
    }

    try {
      const decodedToken = await this.firebaseService.verifyToken(token);
      console.log('decodedToken:', decodedToken);
      request.user = decodedToken;
      return true;
    } catch (err) {
      return false;
    }
  }
}
