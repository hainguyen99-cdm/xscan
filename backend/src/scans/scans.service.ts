import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Scan, ScanDocument, ScanStatus } from './schemas/scan.schema';
import { CreateScanDto } from './dto/create-scan.dto';
import { UpdateScanDto } from './dto/update-scan.dto';

@Injectable()
export class ScansService {
  constructor(@InjectModel(Scan.name) private scanModel: Model<ScanDocument>) {}

  async create(createScanDto: CreateScanDto): Promise<Scan> {
    const scan = new this.scanModel(createScanDto);
    return scan.save();
  }

  async findAll(): Promise<Scan[]> {
    return this.scanModel.find().populate('userId', 'username email').exec();
  }

  async findByUser(userId: string): Promise<Scan[]> {
    return this.scanModel
      .find({ userId })
      .populate('userId', 'username email')
      .exec();
  }

  async findPublicScans(): Promise<Scan[]> {
    return this.scanModel
      .find({ isPublic: true })
      .populate('userId', 'username email')
      .exec();
  }

  async findOne(id: string): Promise<Scan> {
    const scan = await this.scanModel
      .findById(id)
      .populate('userId', 'username email')
      .exec();
    if (!scan) {
      throw new NotFoundException('Scan not found');
    }
    return scan;
  }

  async update(id: string, updateScanDto: UpdateScanDto): Promise<Scan> {
    const scan = await this.scanModel
      .findByIdAndUpdate(id, updateScanDto, { new: true, runValidators: true })
      .populate('userId', 'username email')
      .exec();
    if (!scan) {
      throw new NotFoundException('Scan not found');
    }
    return scan;
  }

  async remove(id: string): Promise<void> {
    const result = await this.scanModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Scan not found');
    }
  }

  async startScan(id: string): Promise<Scan> {
    const scan = await this.scanModel.findById(id);
    if (!scan) {
      throw new NotFoundException('Scan not found');
    }

    scan.status = ScanStatus.IN_PROGRESS;
    scan.startedAt = new Date();
    return scan.save();
  }

  async completeScan(id: string, results: any): Promise<Scan> {
    const scan = await this.scanModel.findById(id);
    if (!scan) {
      throw new NotFoundException('Scan not found');
    }

    scan.status = ScanStatus.COMPLETED;
    scan.results = results;
    scan.completedAt = new Date();
    return scan.save();
  }

  async failScan(id: string, errorMessage: string): Promise<Scan> {
    const scan = await this.scanModel.findById(id);
    if (!scan) {
      throw new NotFoundException('Scan not found');
    }

    scan.status = ScanStatus.FAILED;
    scan.errorMessage = errorMessage;
    scan.completedAt = new Date();
    return scan.save();
  }
}
