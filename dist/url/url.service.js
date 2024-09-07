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
let UrlService = class UrlService {
    constructor(urlModel) {
        this.urlModel = urlModel;
    }
    async create(createUrlDto) {
        const body = createUrlDto;
        console.log('req body', body);
        if (!body.url)
            throw new common_1.BadRequestException('Url is required');
        const shortID = shortid();
        const createdUrl = new this.urlModel({
            shortId: shortID,
            redirectURL: body.url,
            domain: body.domain,
            offerId: body.offerId,
            linkType: body.linkType,
            visitHistory: [],
        });
        createdUrl.save();
        return { finalRedirectLink: `${body.domain}/${shortID}` };
    }
    async getAnalytics(shortId) {
        const result = await this.urlModel.findOne({ shortId });
        return {
            offerId: result.offerId,
            totalClicks: result.clickCount,
            analytics: result.visitHistory,
        };
    }
    async getReports() {
        try {
            const allUrls = await this.urlModel.find({}, { offerId: 1, clickCount: 1, visitHistory: 1 });
            const reports = allUrls.map((url) => ({
                offerId: url.offerId,
                totalClicks: url.clickCount,
                analytics: url.visitHistory,
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