import { CanActivate, ExecutionContext, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { User } from '../../entities/users.entity';

@Injectable()
export class CustomRolesGuard implements CanActivate {

  constructor(
    private readonly reflector: Reflector
  ){}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const validRoles: string[]  = this.reflector.get('roles', context.getHandler());
    const user = context.switchToHttp().getRequest().user as User; 
    
    if(validRoles.length === 0) return true;
    if(!user) throw new NotFoundException('User not found');

    for (const role of user.roles) {
      if(validRoles.includes(role)) return true;
    }
    throw new ForbiddenException(`User ${user.fullName} need a valid role [${validRoles}]`);
  }
}
