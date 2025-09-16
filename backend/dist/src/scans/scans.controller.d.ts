import { ScansService } from './scans.service';
import { CreateScanDto } from './dto/create-scan.dto';
import { UpdateScanDto } from './dto/update-scan.dto';
export declare class ScansController {
    private readonly scansService;
    constructor(scansService: ScansService);
    create(createScanDto: CreateScanDto, req: any): Promise<import("./schemas/scan.schema").Scan>;
    findAll(): Promise<import("./schemas/scan.schema").Scan[]>;
    getMyScans(req: any): Promise<import("./schemas/scan.schema").Scan[]>;
    getPublicScans(): Promise<import("./schemas/scan.schema").Scan[]>;
    findByUser(userId: string): Promise<import("./schemas/scan.schema").Scan[]>;
    findOne(id: string): Promise<import("./schemas/scan.schema").Scan>;
    update(id: string, updateScanDto: UpdateScanDto): Promise<import("./schemas/scan.schema").Scan>;
    remove(id: string): Promise<void>;
    startScan(id: string): Promise<import("./schemas/scan.schema").Scan>;
    completeScan(id: string, body: {
        results: any;
    }): Promise<import("./schemas/scan.schema").Scan>;
    failScan(id: string, body: {
        errorMessage: string;
    }): Promise<import("./schemas/scan.schema").Scan>;
}
