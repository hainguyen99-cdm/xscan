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
exports.BankAccountService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let BankAccountService = class BankAccountService {
    constructor(bankAccountModel) {
        this.bankAccountModel = bankAccountModel;
    }
    async createBankAccount(userId, createBankAccountDto) {
        const userObjectId = new mongoose_2.Types.ObjectId(userId);
        const existingAccount = await this.bankAccountModel.findOne({
            userId: userObjectId,
            bankCode: createBankAccountDto.bankCode,
            accountNumber: createBankAccountDto.accountNumber,
        });
        if (existingAccount) {
            throw new common_1.ConflictException('Bank account with this combination already exists');
        }
        if (createBankAccountDto.isDefault) {
            await this.bankAccountModel.updateMany({ userId: userObjectId, isDefault: true }, { isDefault: false });
        }
        const bankAccount = new this.bankAccountModel({
            userId: userObjectId,
            ...createBankAccountDto,
        });
        const savedAccount = await bankAccount.save();
        return this.mapToResponseDto(savedAccount);
    }
    async getUserBankAccounts(userId) {
        const userObjectId = new mongoose_2.Types.ObjectId(userId);
        const accounts = await this.bankAccountModel
            .find({ userId: userObjectId, isActive: true })
            .sort({ isDefault: -1, createdAt: -1 })
            .exec();
        return accounts.map(account => this.mapToResponseDto(account));
    }
    async getBankAccount(userId, accountId) {
        const userObjectId = new mongoose_2.Types.ObjectId(userId);
        const accountObjectId = new mongoose_2.Types.ObjectId(accountId);
        const account = await this.bankAccountModel.findOne({
            _id: accountObjectId,
            userId: userObjectId,
            isActive: true,
        }).exec();
        if (!account) {
            throw new common_1.NotFoundException('Bank account not found');
        }
        return this.mapToResponseDto(account);
    }
    async updateBankAccount(userId, accountId, updateBankAccountDto) {
        const userObjectId = new mongoose_2.Types.ObjectId(userId);
        const accountObjectId = new mongoose_2.Types.ObjectId(accountId);
        const existingAccount = await this.bankAccountModel.findOne({
            _id: accountObjectId,
            userId: userObjectId,
            isActive: true,
        });
        if (!existingAccount) {
            throw new common_1.NotFoundException('Bank account not found');
        }
        if (updateBankAccountDto.accountNumber && updateBankAccountDto.accountNumber !== existingAccount.accountNumber) {
            const duplicateAccount = await this.bankAccountModel.findOne({
                userId: userObjectId,
                bankCode: updateBankAccountDto.bankCode || existingAccount.bankCode,
                accountNumber: updateBankAccountDto.accountNumber,
                _id: { $ne: accountObjectId },
            });
            if (duplicateAccount) {
                throw new common_1.ConflictException('Bank account with this combination already exists');
            }
        }
        if (updateBankAccountDto.isDefault) {
            await this.bankAccountModel.updateMany({ userId: userObjectId, isDefault: true, _id: { $ne: accountObjectId } }, { isDefault: false });
        }
        const updatedAccount = await this.bankAccountModel.findByIdAndUpdate(accountObjectId, { ...updateBankAccountDto }, { new: true }).exec();
        if (!updatedAccount) {
            throw new common_1.NotFoundException('Bank account not found');
        }
        return this.mapToResponseDto(updatedAccount);
    }
    async deleteBankAccount(userId, accountId) {
        const userObjectId = new mongoose_2.Types.ObjectId(userId);
        const accountObjectId = new mongoose_2.Types.ObjectId(accountId);
        const account = await this.bankAccountModel.findOne({
            _id: accountObjectId,
            userId: userObjectId,
            isActive: true,
        });
        if (!account) {
            throw new common_1.NotFoundException('Bank account not found');
        }
        await this.bankAccountModel.findByIdAndUpdate(accountObjectId, { isActive: false });
    }
    async setDefaultBankAccount(userId, accountId) {
        const userObjectId = new mongoose_2.Types.ObjectId(userId);
        const accountObjectId = new mongoose_2.Types.ObjectId(accountId);
        const account = await this.bankAccountModel.findOne({
            _id: accountObjectId,
            userId: userObjectId,
            isActive: true,
        });
        if (!account) {
            throw new common_1.NotFoundException('Bank account not found');
        }
        await this.bankAccountModel.updateMany({ userId: userObjectId, isDefault: true }, { isDefault: false });
        const updatedAccount = await this.bankAccountModel.findByIdAndUpdate(accountObjectId, { isDefault: true }, { new: true }).exec();
        if (!updatedAccount) {
            throw new common_1.NotFoundException('Bank account not found');
        }
        return this.mapToResponseDto(updatedAccount);
    }
    async getDefaultBankAccount(userId) {
        const userObjectId = new mongoose_2.Types.ObjectId(userId);
        const account = await this.bankAccountModel.findOne({
            userId: userObjectId,
            isDefault: true,
            isActive: true,
        }).exec();
        return account ? this.mapToResponseDto(account) : null;
    }
    async validateBankAccount(userId, accountId) {
        const userObjectId = new mongoose_2.Types.ObjectId(userId);
        const accountObjectId = new mongoose_2.Types.ObjectId(accountId);
        const account = await this.bankAccountModel.findOne({
            _id: accountObjectId,
            userId: userObjectId,
            isActive: true,
        }).exec();
        return !!account;
    }
    async getBankAccountStats(userId) {
        const userObjectId = new mongoose_2.Types.ObjectId(userId);
        const [totalAccounts, activeAccounts, defaultAccount] = await Promise.all([
            this.bankAccountModel.countDocuments({ userId: userObjectId }),
            this.bankAccountModel.countDocuments({ userId: userObjectId, isActive: true }),
            this.bankAccountModel.findOne({ userId: userObjectId, isDefault: true, isActive: true }),
        ]);
        return {
            totalAccounts,
            activeAccounts,
            defaultAccount: defaultAccount ? this.mapToResponseDto(defaultAccount) : null,
        };
    }
    mapToResponseDto(account) {
        return {
            _id: account._id.toString(),
            userId: account.userId.toString(),
            bankName: account.bankName,
            accountName: account.accountName,
            accountNumber: account.accountNumber,
            bankCode: account.bankCode,
            bankShortName: account.bankShortName,
            bin: account.bin,
            logo: account.logo,
            isActive: account.isActive,
            isDefault: account.isDefault,
            lastUsedAt: account.lastUsedAt,
            createdAt: account.createdAt || new Date(),
            updatedAt: account.updatedAt || new Date(),
        };
    }
};
exports.BankAccountService = BankAccountService;
exports.BankAccountService = BankAccountService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('BankAccount')),
    __metadata("design:paramtypes", [mongoose_2.Model])
], BankAccountService);
//# sourceMappingURL=bank-account.service.js.map