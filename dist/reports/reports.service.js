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
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let ReportsService = class ReportsService {
    constructor(urlModel, emailModel) {
        this.urlModel = urlModel;
        this.emailModel = emailModel;
    }
    async getReports(page, pageSize, offerId, campaignId, fromDate, toDate) {
        try {
            const skip = (page - 1) * pageSize;
            const dateFilter = {};
            if (fromDate)
                dateFilter.$gte = new Date(fromDate);
            if (toDate) {
                const endDate = new Date(toDate);
                endDate.setHours(23, 59, 59, 999);
                dateFilter.$lte = endDate;
            }
            const matchStage = {
                ...(offerId && {
                    offerId: { $regex: `^${offerId}$`, $options: 'i' },
                }),
                ...(campaignId && {
                    campaignId: { $regex: `^${campaignId}$`, $options: 'i' },
                }),
                ...(Object.keys(dateFilter).length > 0 && {
                    createdAt: dateFilter,
                }),
            };
            const aggregatedData = await this.urlModel.aggregate([
                { $match: matchStage },
                {
                    $lookup: {
                        from: 'emails',
                        let: { campaignId: '$campaignId', offerId: '$offerId' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            {
                                                $eq: ['$campaignId', '$$campaignId'],
                                            },
                                            { $eq: ['$offerId', '$$offerId'] },
                                        ],
                                    },
                                    mode: 'bulk',
                                },
                            },
                        ],
                        as: 'emailData',
                    },
                },
                {
                    $addFields: {
                        totalEmailSent: { $size: '$emailData' },
                    },
                },
                {
                    $project: {
                        _id: 0,
                        campaignId: 1,
                        offerId: 1,
                        clickCount: 1,
                        totalEmailSent: 1,
                        openRate: { $ifNull: ['$openRate', 0] },
                        date: { $ifNull: ['$createdAt', new Date()] },
                    },
                },
                { $sort: { date: -1 } },
                { $skip: skip },
                { $limit: Number(pageSize) },
            ]);
            const totalElements = await this.urlModel.countDocuments(matchStage);
            return {
                reports: aggregatedData,
                page,
                pageSize,
                totalElements,
            };
        }
        catch (err) {
            console.log('error while fetching reports', err.message);
        }
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('Url')),
    __param(1, (0, mongoose_1.InjectModel)('Email')),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], ReportsService);
//# sourceMappingURL=reports.service.js.map