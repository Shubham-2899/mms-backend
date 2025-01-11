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
exports.UrlService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const shortid = require('shortid');
const url_schema_1 = require("./schemas/url.schema");
const mongoose_2 = require("mongoose");
function generateRandomString(length) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
let UrlService = class UrlService {
    constructor(urlModel) {
        this.urlModel = urlModel;
    }
    async create(createUrlDto) {
        const body = createUrlDto;
        console.log('req body', body);
        if (!body.url)
            throw new common_1.BadRequestException('Url is required');
        const [part1, part2] = body.linkPattern.split('/').filter(Boolean);
        const RANDOM_STRING_LENGTH = 16;
        const randomString1 = generateRandomString(RANDOM_STRING_LENGTH);
        const randomString2 = generateRandomString(RANDOM_STRING_LENGTH);
        const finalLongString1 = `${part1}${randomString1}`;
        const finalLongString2 = `${part2}${randomString2}`;
        let shortID;
        let createdUrl;
        let finalRedirectLink;
        for (let attempt = 0; attempt < 3; attempt++) {
            shortID = shortid();
            createdUrl = new this.urlModel({
                shortId: shortID,
                redirectURL: body.url.trim(),
                domain: body.domain,
                offerId: body.offerId,
                campaignId: body.campaignId,
                linkType: body.linkType,
                visitHistory: [],
            });
            try {
                await createdUrl.save();
                finalRedirectLink = `${body.domain}/${shortID}/${finalLongString1}/${finalLongString2}`;
                return { finalRedirectLink };
            }
            catch (error) {
                if (error.code === 11000 && error.keyPattern?.shortId) {
                    console.warn(`shortId conflict detected. Retrying... (Attempt ${attempt + 1})`);
                    continue;
                }
                throw new common_1.InternalServerErrorException('Failed to save URL');
            }
        }
        throw new common_1.InternalServerErrorException('Could not generate a unique shortId after multiple attempts');
    }
    async getAnalytics(shortId) {
        const result = await this.urlModel.findOne({ shortId });
        if (result) {
            return {
                offerId: result.offerId,
                campaignId: result.campaignId,
                totalClicks: result.clickCount,
                analytics: result.visitHistory,
            };
        }
        else {
            return {};
        }
    }
    async getReports() {
        try {
            const allUrls = await this.urlModel.find({}, { offerId: 1, clickCount: 1, visitHistory: 1, campaignId: 1 });
            const reports = allUrls.map((url) => ({
                offerId: url.offerId,
                totalClicks: url.clickCount,
                analytics: url.visitHistory,
                campaignId: url.campaignId,
            }));
            return reports;
        }
        catch (error) {
            console.log('🚀 ~ UrlService ~ getReports ~ error:', error);
        }
    }
};
exports.UrlService = UrlService;
exports.UrlService = UrlService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(url_schema_1.Url.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], UrlService);
//# sourceMappingURL=url.service.js.map