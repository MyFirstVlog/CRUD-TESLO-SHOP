import { UseGuards, applyDecorators } from '@nestjs/common';
import { ValidRoles } from '../interfaces/valid-roles.enum';
import { RoleProtected } from './role-protected/role-protected.decorator';
import { AuthGuard } from '@nestjs/passport';
import { CustomRolesGuard } from '../guards/custom-roles.guard.ts/custom-roles.guard.ts.guard';

export function Auth(...roles: ValidRoles[]) {
  console.log("entrando al auth fun wrapper", roles)
  return applyDecorators(
    RoleProtected(...roles),
    UseGuards(AuthGuard(), CustomRolesGuard)
  );
}