"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const mailer_1 = require("@nestjs-modules/mailer");
const config_1 = require("@nestjs/config");
const email_module_1 = require("./email/email.module");
const url_module_1 = require("./url/url.module");
const url_schema_1 = require("./url/schemas/url.schema");
const auth_module_1 = require("./auth/auth.module");
const root_controller_1 = require("./root.controller");
const serve_static_1 = require("@nestjs/serve-static");
const path_1 = require("path");
const email_schemas_1 = require("./email/schemas/email.schemas");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            auth_module_1.AuthModule,
            config_1.ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true }),
            mongoose_1.MongooseModule.forRoot(`${process.env.DB_CONNECTION_STRING}`),
            mailer_1.MailerModule.forRoot({
                transport: {
                    host: `${process.env.MAILER_HOST}`,
                    pool: true,
                    secure: false,
                    port: 587,
                    tls: {
                        rejectUnauthorized: false,
                    },
                    auth: {
                        user: `${process.env.ROOT_MAIL_USER}`,
                        pass: `${process.env.ROOT_MAIL_USER_PASSWORD}`,
                    },
                    logger: true,
                },
            }),
            mongoose_1.MongooseModule.forFeature([
                { name: url_schema_1.Url.name, schema: url_schema_1.UrlSchema },
                { name: email_schemas_1.Email.name, schema: email_schemas_1.EmailSchema },
            ]),
            email_module_1.EmailModule,
            url_module_1.UrlModule,
            serve_static_1.ServeStaticModule.forRoot({
                rootPath: (0, path_1.join)(__dirname, '..', 'public'),
            }),
        ],
        controllers: [app_controller_1.AppController, root_controller_1.RootController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map