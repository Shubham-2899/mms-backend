import { Queue } from 'bull';
import { JobsService } from './jobs.service';
export declare class JobsController {
    private readonly jobsService;
    private readonly emailQueue;
    constructor(jobsService: JobsService, emailQueue: Queue);
    cleanOldJobs(value: string, unit: string): unknown;
}
