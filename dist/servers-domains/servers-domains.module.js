"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServersDomainModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const server_domain_schema_1 = require("./schemas/server-domain.schema");
const servers_domains_controller_1 = require("./servers-domains.controller");
const servers_domains_service_1 = require("./servers-domains.service");
const auth_module_1 = require("../auth/auth.module");
let ServersDomainModule = class ServersDomainModule {
};
exports.ServersDomainModule = ServersDomainModule;
exports.ServersDomainModule = ServersDomainModule = __decorate([
    (0, common_1.Module)({
        imports: [
            auth_module_1.AuthModule,
            mongoose_1.MongooseModule.forFeature([
                { name: server_domain_schema_1.ServerDomain.name, schema: server_domain_schema_1.ServerDomainSchema },
            ]),
        ],
        controllers: [servers_domains_controller_1.ServersDomainController],
        providers: [servers_domains_service_1.ServersDomainService],
        exports: [servers_domains_service_1.ServersDomainService, mongoose_1.MongooseModule],
    })
], ServersDomainModule);
//# sourceMappingURL=servers-domains.module.js.map