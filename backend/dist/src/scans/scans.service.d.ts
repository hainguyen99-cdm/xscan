import { Model } from 'mongoose';
import { Scan, ScanDocument } from './schemas/scan.schema';
import { CreateScanDto } from './dto/create-scan.dto';
import { UpdateScanDto } from './dto/update-scan.dto';
export declare class ScansService {
    private scanModel;
    constructor(scanModel: Model<ScanDocument>);
    create(createScanDto: CreateScanDto): Promise<Scan>;
    findAll(): Promise<Scan[]>;
    findByUser(userId: string): Promise<Scan[]>;
    findPublicScans(): Promise<Scan[]>;
    findOne(id: string): Promise<Scan>;
    update(id: string, updateScanDto: UpdateScanDto): Promise<Scan>;
    remove(id: string): Promise<void>;
    startScan(id: string): Promise<Scan>;
    completeScan(id: string, results: any): Promise<Scan>;
    failScan(id: string, errorMessage: string): Promise<Scan>;
}
