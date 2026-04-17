export class CreateTestAccountDto {
  email: string;
  appPassword: string;
  provider?: string; // defaults to 'yahoo'
  active?: boolean;  // defaults to true
}
