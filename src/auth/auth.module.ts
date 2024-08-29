// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { FirebaseService } from './firebase.service';
import { FirebaseAuthGuard } from './firebase-auth.guard';

@Module({
  providers: [FirebaseService, FirebaseAuthGuard],
  exports: [FirebaseAuthGuard, FirebaseService],
})
export class AuthModule {}
