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
exports.BullmqDashboardService = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("bullmq");
const bullmq_2 = require("@nestjs/bullmq");
const api_1 = require("@bull-board/api");
const bullAdapter_1 = require("@bull-board/api/bullAdapter");
const express_1 = require("@bull-board/express");
let BullmqDashboardService = class BullmqDashboardService {
    constructor(emailQueue) {
        this.emailQueue = emailQueue;
    }
    onModuleInit() {
        this.serverAdapter = new express_1.ExpressAdapter();
        this.serverAdapter.setBasePath('/api/admin/dashboard');
        (0, api_1.createBullBoard)({
            queues: [new bullAdapter_1.BullAdapter(this.emailQueue, { readOnlyMode: true })],
            serverAdapter: this.serverAdapter,
            options: {
                uiConfig: {
                    pollingInterval: {
                        showSetting: true,
                        forceInterval: 8000,
                    },
                },
            },
        });
    }
    getDashboardRouter() {
        return this.serverAdapter.getRouter();
    }
    bindMiddleware(app) {
        const authMiddleware = async (req, res, next) => {
            let authHeader = req.headers['authorization'];
            authHeader = 'true';
            if (!authHeader) {
                console.log('inside unauthorized');
                return res.status(401).send('Unauthorized');
            }
            const token = authHeader.split(' ')[1];
            const decodedToken = { admin: true };
            console.log('🚀 ~ BullmqDashboardService ~ bindMiddleware ~ decodedToken:', decodedToken);
            const isAdmin = decodedToken.admin === true;
            if (!isAdmin) {
                return res.status(403).send('Forbidden');
            }
            next();
        };
        console.log('bindMiddleware called:');
        if (!this.serverAdapter) {
            this.serverAdapter = new express_1.ExpressAdapter();
            this.serverAdapter.setBasePath('/api/admin/dashboard');
            (0, api_1.createBullBoard)({
                queues: [new bullAdapter_1.BullAdapter(this.emailQueue, { readOnlyMode: true })],
                serverAdapter: this.serverAdapter,
                options: {
                    uiConfig: {
                        boardTitle: 'MMS Board',
                        pollingInterval: {
                            showSetting: true,
                            forceInterval: 8000,
                        },
                    },
                },
            });
        }
        app.use('/api/admin/dashboard', authMiddleware, this.serverAdapter.getRouter());
    }
};
exports.BullmqDashboardService = BullmqDashboardService;
exports.BullmqDashboardService = BullmqDashboardService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, bullmq_2.InjectQueue)('email-queue')),
    __metadata("design:paramtypes", [bullmq_1.Queue])
], BullmqDashboardService);
//# sourceMappingURL=bullmq-dashboard.service.js.map