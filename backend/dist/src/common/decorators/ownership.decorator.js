"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequireOwnership = exports.OWNERSHIP_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.OWNERSHIP_KEY = 'ownership';
const RequireOwnership = () => (0, common_1.SetMetadata)(exports.OWNERSHIP_KEY, true);
exports.RequireOwnership = RequireOwnership;
//# sourceMappingURL=ownership.decorator.js.map