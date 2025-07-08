import { Queue } from 'bull';
export declare class JobsService {
    cleanOldJobs(queue: Queue, olderThanSeconds: number): Promise<{
        message: string;
        success: boolean;
        cleaned?: Record<string, number>;
        error?: string;
        status: number;
    }>;
}
