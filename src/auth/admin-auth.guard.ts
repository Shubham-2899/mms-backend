import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { FirebaseAuthGuard } from './firebase-auth.guard';
import { FirebaseService } from './firebase.service';

@Injectable()
export class AdminAuthGuard extends FirebaseAuthGuard implements CanActivate {
  constructor(firebaseService: FirebaseService) {
    super(firebaseService);
  }
  /**
   * Checks if the user has the 'admin' claim.
   * If the user is not authenticated, this will return false.
   * If the user is authenticated, this will return true only if the user has the 'admin' claim.
   * @param context - ExecutionContext
   * @returns Promise<boolean> - true if the user is authenticated and has the 'admin' claim, false otherwise
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isAuthenticated = await super.canActivate(context);
    if (!isAuthenticated) return false;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    return user.admin === true;
  }
}
