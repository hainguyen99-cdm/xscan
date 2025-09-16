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
exports.ScansService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const scan_schema_1 = require("./schemas/scan.schema");
let ScansService = class ScansService {
    constructor(scanModel) {
        this.scanModel = scanModel;
    }
    async create(createScanDto) {
        const scan = new this.scanModel(createScanDto);
        return scan.save();
    }
    async findAll() {
        return this.scanModel.find().populate('userId', 'username email').exec();
    }
    async findByUser(userId) {
        return this.scanModel
            .find({ userId })
            .populate('userId', 'username email')
            .exec();
    }
    async findPublicScans() {
        return this.scanModel
            .find({ isPublic: true })
            .populate('userId', 'username email')
            .exec();
    }
    async findOne(id) {
        const scan = await this.scanModel
            .findById(id)
            .populate('userId', 'username email')
            .exec();
        if (!scan) {
            throw new common_1.NotFoundException('Scan not found');
        }
        return scan;
    }
    async update(id, updateScanDto) {
        const scan = await this.scanModel
            .findByIdAndUpdate(id, updateScanDto, { new: true, runValidators: true })
            .populate('userId', 'username email')
            .exec();
        if (!scan) {
            throw new common_1.NotFoundException('Scan not found');
        }
        return scan;
    }
    async remove(id) {
        const result = await this.scanModel.findByIdAndDelete(id).exec();
        if (!result) {
            throw new common_1.NotFoundException('Scan not found');
        }
    }
    async startScan(id) {
        const scan = await this.scanModel.findById(id);
        if (!scan) {
            throw new common_1.NotFoundException('Scan not found');
        }
        scan.status = scan_schema_1.ScanStatus.IN_PROGRESS;
        scan.startedAt = new Date();
        return scan.save();
    }
    async completeScan(id, results) {
        const scan = await this.scanModel.findById(id);
        if (!scan) {
            throw new common_1.NotFoundException('Scan not found');
        }
        scan.status = scan_schema_1.ScanStatus.COMPLETED;
        scan.results = results;
        scan.completedAt = new Date();
        return scan.save();
    }
    async failScan(id, errorMessage) {
        const scan = await this.scanModel.findById(id);
        if (!scan) {
            throw new common_1.NotFoundException('Scan not found');
        }
        scan.status = scan_schema_1.ScanStatus.FAILED;
        scan.errorMessage = errorMessage;
        scan.completedAt = new Date();
        return scan.save();
    }
};
exports.ScansService = ScansService;
exports.ScansService = ScansService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(scan_schema_1.Scan.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], ScansService);
//# sourceMappingURL=scans.service.js.map