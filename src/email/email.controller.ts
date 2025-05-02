import {
  Controller,
  Post,
  Body,
  UseGuards,
  Headers,
  Get,
} from '@nestjs/common';
import { EmailService } from './email.service';
import { CreateEmailDto } from './dto/create-email.dto';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';

// @UseGuards(FirebaseAuthGuard)
@Controller('/api')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('sendemail')
  async create(
    @Body() createEmailDto: CreateEmailDto,
    @Headers('Authorization') token: string,
  ) {
    // Extract the token from the Authorization header
    const firebaseToken = token.split(' ')[1];
    return this.emailService.create(createEmailDto, firebaseToken);
  }

  @Get('/availableIps')
  async getAvailableIps(@Headers('Authorization') token: string) {
    // Extract the token from the Authorization header
    const firebaseToken = token.split(' ')[1];
    return this.emailService.getAvailableIps(firebaseToken);
  }

  @Post('stopjob')
  async stopJob(@Body() jobId: number,@Headers('Authorization') token: string) {
    // Extract the token from the Authorization header
    return this.emailService.stopJob(jobId);
  }
}
