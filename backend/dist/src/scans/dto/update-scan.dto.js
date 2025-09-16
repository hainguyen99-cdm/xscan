"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateScanDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_scan_dto_1 = require("./create-scan.dto");
class UpdateScanDto extends (0, mapped_types_1.PartialType)(create_scan_dto_1.CreateScanDto) {
}
exports.UpdateScanDto = UpdateScanDto;
//# sourceMappingURL=update-scan.dto.js.map