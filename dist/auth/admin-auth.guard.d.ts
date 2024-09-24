import { CanActivate, ExecutionContext } from '@nestjs/common';
import { FirebaseAuthGuard } from './firebase-auth.guard';
import { FirebaseService } from './firebase.service';
export declare class AdminAuthGuard extends FirebaseAuthGuard implements CanActivate {
    constructor(firebaseService: FirebaseService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
