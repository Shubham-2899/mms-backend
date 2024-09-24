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
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const firebase_service_1 = require("../auth/firebase.service");
const user_schema_1 = require("./schemas/user.schema");
let UserService = class UserService {
    constructor(userModel, firebaseService) {
        this.userModel = userModel;
        this.firebaseService = firebaseService;
    }
    async getAllUsers() {
        return this.userModel.find().exec();
    }
    async createUser(email, password, displayName, serverData, isAdmin) {
        const firebaseUser = await this.firebaseService.createUser(email, password, displayName);
        const createdUser = new this.userModel({
            firebaseUid: firebaseUser.uid,
            email,
            name: displayName,
            serverData,
            isAdmin,
        });
        return createdUser.save();
    }
    async updateUser(uid, updateData) {
        const updateOperations = [];
        if (updateData.serverData) {
            for (const server of updateData.serverData) {
                updateOperations.push({
                    updateOne: {
                        filter: {
                            firebaseUid: uid,
                            'serverData.provider': server.provider,
                        },
                        update: {
                            $push: {
                                'serverData.$.instances': { $each: server.instances },
                            },
                        },
                    },
                });
                updateOperations.push({
                    updateOne: {
                        filter: {
                            firebaseUid: uid,
                            'serverData.provider': { $ne: server.provider },
                        },
                        update: {
                            $addToSet: {
                                serverData: {
                                    provider: server.provider,
                                    instances: server.instances,
                                },
                            },
                        },
                    },
                });
            }
            await this.userModel.bulkWrite(updateOperations);
        }
        return this.userModel.findOne({ firebaseUid: uid });
    }
    async deleteUser(uid) {
        await this.firebaseService.deleteUser(uid);
        return this.userModel.findOneAndDelete({ firebaseUid: uid });
    }
    async findUserByUid(uid) {
        return this.userModel.findOne({ firebaseUid: uid });
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        firebase_service_1.FirebaseService])
], UserService);
//# sourceMappingURL=user.service.js.map