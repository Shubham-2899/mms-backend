import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Email, EmailDocument } from './schemas/email.schemas';
import { CreateEmailDto } from './dto/create-email.dto';

@Injectable()
export class EmailService {
  constructor(
    @InjectQueue('email-queue') private emailQueue: Queue, // Inject BullMQ Queue
    @InjectModel(Email.name) private emailModel: Model<EmailDocument>,
  ) {}

  // This method now adds email jobs to the queue
  async create(createEmailDto: CreateEmailDto) {
    try {
      const smtpConfig = {
        host: 'mail.elitemarketpro.site',
        user: 'admin@elitemarketpro.site',
        password: 'adminMms@2899',
      };
      // Add job to BullMQ queue
      await this.emailQueue.add('send-email-job', {
        ...createEmailDto,
        smtpConfig,
      });

      return { message: 'Email job added to queue successfully' };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
