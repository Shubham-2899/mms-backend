"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobsController = void 0;
const common_1 = require("@nestjs/common");
const bull_1 = require("@nestjs/bull");
const jobs_service_1 = require("./jobs.service");
let JobsController = class JobsController {
    constructor(jobsService, emailQueue) {
        this.jobsService = jobsService;
        this.emailQueue = emailQueue;
    }
    async cleanOldJobs(value, unit) {
        const num = parseInt(value, 10);
        const units = { second: 1, minute: 60, hour: 3600 };
        const multiplier = units[unit?.toLowerCase()];
        if (!num || !multiplier) {
            return { message: 'Invalid value or unit (use second, minute, or hour)' };
        }
        const totalSeconds = num * multiplier;
        return this.jobsService.cleanOldJobs(this.emailQueue, totalSeconds);
    }
};
exports.JobsController = JobsController;
__decorate([
    (0, common_1.Delete)('clean-old'),
    __param(0, (0, common_1.Query)('value')),
    __param(1, (0, common_1.Query)('unit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], JobsController.prototype, "cleanOldJobs", null);
exports.JobsController = JobsController = __decorate([
    (0, common_1.Controller)('jobs'),
    __param(1, (0, bull_1.InjectQueue)('email-queue')),
    __metadata("design:paramtypes", [jobs_service_1.JobsService, Object])
], JobsController);
//# sourceMappingURL=jobs.controller.js.map