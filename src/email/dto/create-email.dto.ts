export class CreateEmailDto {
  from: string;
  to: string[];
  templateType: string;
  emailTemplate: string;
  mode: string;
}
