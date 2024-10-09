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
const email_list_schemas_1 = require("./schemas/email_list.schemas");
let EmailListService = class EmailListService {
    constructor(emailListModel) {
        this.emailListModel = emailListModel;
    }
    async addEmails(emailArray) {
        try {
            const emailDocs = emailArray.map((email) => ({ email }));
            await this.emailListModel.insertMany(emailDocs, { ordered: false });
            return {
                message: 'Emails added successfully.',
                success: true,
            };
        }
        catch (err) {
            console.log('error while adding emails:', err.message);
            return {
                message: err.message,
                success: false,
            };
        }
    }
    async addEmailsFromCSVFile(filePath) {
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
                const res = await this.addEmails(emails);
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
};
exports.EmailListService = EmailListService;
exports.EmailListService = EmailListService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(email_list_schemas_1.EmailList.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], EmailListService);
//# sourceMappingURL=email_list.service.js.map