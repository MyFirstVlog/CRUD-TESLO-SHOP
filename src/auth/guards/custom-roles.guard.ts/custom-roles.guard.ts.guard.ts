import { CanActivate, ExecutionContext, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { User } from '../../entities/users.entity';
import { META_ROLES } from '../../../auth/decorators/role-protected/role-protected.decorator';

@Injectable()
export class CustomRolesGuard implements CanActivate {

  constructor(
    private readonly reflector: Reflector
  ){}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const validRoles: string[]  = this.reflector.getAllAndOverride(META_ROLES, [
      context.getHandler(),
      context.getClass(),
 ]);
    

    const user = context.switchToHttp().getRequest().user as User; 
    console.log({validRoles, user})
    
    if(!validRoles) return true;
    if(validRoles.length === 0) return true;
    if(!user) throw new NotFoundException('User not found');

    for (const role of user.roles) {
      if(validRoles.includes(role)) return true;
    }
    throw new ForbiddenException(`User ${user.fullName} need a valid role [${validRoles}]`);
  }
}
