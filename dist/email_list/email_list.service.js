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
exports.EmailListService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const csv_parse_1 = require("csv-parse");
const fs = require("fs");
const campaign_schemas_1 = require("../campaign/schemas/campaign.schemas");
const email_list_schemas_1 = require("./schemas/email_list.schemas");
let EmailListService = class EmailListService {
    constructor(campaignEmailTrackingModel, emailListModel) {
        this.campaignEmailTrackingModel = campaignEmailTrackingModel;
        this.emailListModel = emailListModel;
        this.emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    }
    async addEmails(emailArray, campaignId) {
        try {
            const validEmails = emailArray.filter((email) => this.emailRegex.test(email));
            if (!validEmails.length) {
                throw new common_1.BadRequestException('No valid emails provided.');
            }
            const bulkOps = validEmails.map((email) => ({
                updateOne: {
                    filter: { to_email: email, campaignId },
                    update: {
                        $setOnInsert: {
                            to_email: email,
                            campaignId,
                            status: 'pending',
                            isProcessed: false,
                        },
                    },
                    upsert: true,
                },
            }));
            const result = await this.campaignEmailTrackingModel.bulkWrite(bulkOps);
            return {
                message: 'Emails processed successfully.',
                success: true,
                insertedCount: result.upsertedCount,
                modifiedCount: result.modifiedCount,
            };
        }
        catch (err) {
            console.log('Error while processing emails:', err.message);
            return {
                message: err.message,
                success: false,
            };
        }
    }
    async addEmailsFromCSVFile(filePath, campaignId) {
        const emails = [];
        return new Promise((resolve, reject) => {
            const stream = fs
                .createReadStream(filePath)
                .pipe((0, csv_parse_1.parse)({
                delimiter: ',',
                columns: true,
                trim: true,
            }))
                .on('data', (row) => {
                if (row.emails) {
                    emails.push(row.emails);
                }
            })
                .on('end', async () => {
                if (!emails.length) {
                    return reject(new common_1.BadRequestException('No emails found in the CSV file.'));
                }
                const res = await this.addEmails(emails, campaignId);
                if (res.success) {
                    resolve(res);
                }
                else {
                    reject(res);
                }
            })
                .on('error', (err) => {
                console.error('Error reading CSV file:', err);
                reject(new common_1.BadRequestException('Failed to process the CSV file.'));
            });
        });
    }
    async getSuppressionList(page = 1, limit = 10, fromDate, toDate) {
        const filter = {};
        if (fromDate || toDate) {
            filter.createdAt = {};
            if (fromDate) {
                const from = new Date(fromDate);
                if (!isNaN(from.getTime())) {
                    filter.createdAt.$gte = from;
                }
            }
            if (toDate) {
                const to = new Date(toDate);
                if (!isNaN(to.getTime())) {
                    to.setHours(23, 59, 59, 999);
                    filter.createdAt.$lte = to;
                }
            }
        }
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.emailListModel
                .find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            this.emailListModel.countDocuments(filter),
        ]);
        const formatted = data.map((item) => ({
            email: item.email,
            date: item.createdAt.toISOString().split('T')[0],
            domain: item.unsubscribed_domains.toString(),
        }));
        return {
            data: formatted,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
};
exports.EmailListService = EmailListService;
exports.EmailListService = EmailListService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(campaign_schemas_1.CampaignEmailTracking.name)),
    __param(1, (0, mongoose_1.InjectModel)(email_list_schemas_1.EmailList.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], EmailListService);
//# sourceMappingURL=email_list.service.js.map