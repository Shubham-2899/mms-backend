import { Controller, Delete, Query } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { JobsService } from './jobs.service';

@Controller('jobs')
export class JobsController {
  constructor(
    private readonly jobsService: JobsService,
    @InjectQueue('email-queue') private readonly emailQueue: Queue,
  ) {}

  /**
   * DELETE /jobs/clean-old
   *
   * Cleans old jobs from the Bull queue (email-queue) that are older than the specified duration.
   *
   * @param value Numeric value representing the amount of time (e.g., 2)
   * @param unit  Time unit for the value. Accepted units: 'second', 'minute', 'hour'
   *
   * @returns JSON response containing:
   *   - status code
   *   - message
   *   - cleaned job counts by state (completed, failed, waiting, delayed)
   *   - error message (only on failure)
   *    */

  @Delete('clean-old')
  async cleanOldJobs(
    @Query('value') value: string,
    @Query('unit') unit: string,
  ) {
    const num = parseInt(value, 10);
    const units = { second: 1, minute: 60, hour: 3600 };
    const multiplier = units[unit?.toLowerCase()];

    if (!num || !multiplier) {
      return { message: 'Invalid value or unit (use second, minute, or hour)' };
    }

    const totalSeconds = num * multiplier;
    return this.jobsService.cleanOldJobs(this.emailQueue, totalSeconds);
  }
}
