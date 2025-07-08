"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobsService = void 0;
const common_1 = require("@nestjs/common");
let JobsService = class JobsService {
    async cleanOldJobs(queue, olderThanSeconds) {
        try {
            const states = [
                'completed',
                'failed',
                'waiting',
                'delayed',
            ];
            const cleanedCount = {
                completed: 0,
                failed: 0,
                waiting: 0,
                delayed: 0,
            };
            for (const state of states) {
                const jobs = await queue.getJobs([state], 0, -1);
                const oldJobs = jobs.filter((job) => (Date.now() - job.timestamp) / 1000 > olderThanSeconds);
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
        }
        catch (error) {
            console.error('Error during job cleanup:', error);
            return {
                status: 500,
                success: false,
                message: `Failed to clean jobs older than ${olderThanSeconds} seconds from queue: ${queue?.name || 'unknown'}`,
                error: error?.message || 'Unknown error occurred',
            };
        }
    }
};
exports.JobsService = JobsService;
exports.JobsService = JobsService = __decorate([
    (0, common_1.Injectable)()
], JobsService);
//# sourceMappingURL=jobs.service.js.map