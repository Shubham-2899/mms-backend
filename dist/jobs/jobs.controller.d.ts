import { Queue } from 'bull';
import { JobsService } from './jobs.service';
export declare class JobsController {
    private readonly jobsService;
    private readonly emailQueue;
    constructor(jobsService: JobsService, emailQueue: Queue);
    cleanOldJobs(value: string, unit: string): Promise<{
        message: string;
        success: boolean;
        cleaned?: Record<string, number>;
        error?: string;
        status: number;
    } | {
        message: string;
    }>;
}
