export declare enum ExportFormat {
    JSON = "json",
    CSV = "csv",
    PDF = "pdf"
}
export declare class ProfileExportDto {
    format?: ExportFormat;
    fields?: string[];
    includeSensitiveData?: boolean;
}
