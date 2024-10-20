"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailModule = void 0;
const common_1 = require("@nestjs/common");
const email_controller_1 = require("./email.controller");
const email_service_1 = require("./email.service");
const auth_module_1 = require("../auth/auth.module");
const mongoose_1 = require("@nestjs/mongoose");
const email_schemas_1 = require("./schemas/email.schemas");
const bullmq_1 = require("@nestjs/bullmq");
const email_processor_1 = require("./email.processor");
const mailer_1 = require("@nestjs-modules/mailer");
const user_module_1 = require("../user/user.module");
let EmailModule = class EmailModule {
};
exports.EmailModule = EmailModule;
exports.EmailModule = EmailModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mailer_1.MailerModule,
            bullmq_1.BullModule.registerQueue({
                name: 'email-queue',
            }),
            auth_module_1.AuthModule,
            user_module_1.UserModule,
            mongoose_1.MongooseModule.forFeature([{ name: email_schemas_1.Email.name, schema: email_schemas_1.EmailSchema }]),
        ],
        controllers: [email_controller_1.EmailController],
        providers: [email_service_1.EmailService, email_processor_1.EmailProcessor],
    })
], EmailModule);
//# sourceMappingURL=email.module.js.map