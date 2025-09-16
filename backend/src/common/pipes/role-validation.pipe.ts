import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { UserRole } from '../enums/roles.enum';

@Injectable()
export class RoleValidationPipe implements PipeTransform {
  transform(value: any) {
    if (!value) {
      return value;
    }

    // If it's an array, validate each role
    if (Array.isArray(value)) {
      const invalidRoles = value.filter(
        (role) => !Object.values(UserRole).includes(role),
      );
      if (invalidRoles.length > 0) {
        throw new BadRequestException(
          `Invalid roles: ${invalidRoles.join(', ')}. Valid roles are: ${Object.values(UserRole).join(', ')}`,
        );
      }
      return value;
    }

    // If it's a single value, validate it
    if (!Object.values(UserRole).includes(value)) {
      throw new BadRequestException(
        `Invalid role: ${value}. Valid roles are: ${Object.values(UserRole).join(', ')}`,
      );
    }

    return value;
  }
}
