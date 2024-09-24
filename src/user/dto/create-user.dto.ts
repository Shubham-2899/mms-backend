export class CreateUserDto {
  name: string;
  email: string;
  lastLoginAt?: Date;
  serverData?: any;
  isAdmin: boolean;
}
