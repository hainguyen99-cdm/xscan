import { Document, Types } from 'mongoose';
export type ScanDocument = Scan & Document;
export declare enum ScanStatus {
    PENDING = "pending",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    FAILED = "failed"
}
export declare enum ScanType {
    PORT_SCAN = "port_scan",
    VULNERABILITY_SCAN = "vulnerability_scan",
    WEB_APPLICATION_SCAN = "web_application_scan"
}
export declare class Scan {
    name: string;
    target: string;
    type: ScanType;
    status: ScanStatus;
    userId: Types.ObjectId;
    results?: any;
    startedAt?: Date;
    completedAt?: Date;
    errorMessage?: string;
    configuration?: any;
}
export declare const ScanSchema: import("mongoose").Schema<Scan, import("mongoose").Model<Scan, any, any, any, Document<unknown, any, Scan, any, {}> & Scan & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Scan, Document<unknown, {}, import("mongoose").FlatRecord<Scan>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Scan> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
