export class CreateEmailDto {
  from: string;
  fromName: string;
  subject: string;
  to: string[];
  templateType: string;
  emailTemplate: string;
  mode: string;
  offerId: string;
}
