import { Injectable } from '@nestjs/common';
import { Queue, Job } from 'bull';

@Injectable()
export class JobsService {
  async cleanOldJobs(
    queue: Queue,
    olderThanSeconds: number,
  ): Promise<{
    message: string;
    success: boolean;
    cleaned?: Record<string, number>;
    error?: string;
    status: number;
  }> {
    try {
      const states: Array<'completed' | 'failed' | 'waiting' | 'delayed'> = [
        'completed',
        'failed',
        'waiting',
        'delayed',
      ];

      const cleanedCount: Record<string, number> = {
        completed: 0,
        failed: 0,
        waiting: 0,
        delayed: 0,
      };

      for (const state of states) {
        const jobs = await queue.getJobs([state], 0, -1);
        const oldJobs = jobs.filter(
          (job: Job) => (Date.now() - job.timestamp) / 1000 > olderThanSeconds,
        );

        for (const job of oldJobs) {
          await job.remove();
        }

        cleanedCount[state] = oldJobs.length;
      }

      return {
        status: 200,
        success: true,
        message: `Cleaned jobs older than ${olderThanSeconds} seconds from queue: ${queue.name}`,
        cleaned: cleanedCount,
      };
    } catch (error: any) {
      console.error('Error during job cleanup:', error);
      return {
        status: 500,
        success: false,
        message: `Failed to clean jobs older than ${olderThanSeconds} seconds from queue: ${queue?.name || 'unknown'}`,
        error: error?.message || 'Unknown error occurred',
      };
    }
  }
}
