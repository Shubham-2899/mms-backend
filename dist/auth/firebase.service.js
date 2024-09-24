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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirebaseService = void 0;
const common_1 = require("@nestjs/common");
const admin = require("firebase-admin");
const path = require("path");
let FirebaseService = class FirebaseService {
    constructor() {
        const serviceAccount = require(path.resolve(__dirname, '../../serviceAccountKey.json'));
        this.firebaseApp = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
    }
    async verifyToken(idToken) {
        return this.firebaseApp.auth().verifyIdToken(idToken);
    }
    async createUser(email, password, displayName) {
        return this.firebaseApp.auth().createUser({
            email,
            password,
            displayName,
        });
    }
    async updateUser(uid, data) {
        return this.firebaseApp.auth().updateUser(uid, data);
    }
    async deleteUser(uid) {
        return this.firebaseApp.auth().deleteUser(uid);
    }
};
exports.FirebaseService = FirebaseService;
exports.FirebaseService = FirebaseService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], FirebaseService);
//# sourceMappingURL=firebase.service.js.map