import { ScanType } from '../schemas/scan.schema';
export declare class CreateScanDto {
    name: string;
    target: string;
    type: ScanType;
    userId: string;
    configuration?: any;
}
