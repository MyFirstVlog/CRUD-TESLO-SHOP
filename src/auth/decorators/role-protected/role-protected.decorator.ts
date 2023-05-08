import { SetMetadata } from '@nestjs/common';
import { ValidRoles } from '../../../auth/interfaces/valid-roles.enum';

const META_ROLES = 'roles';

const RoleProtected = (...args: ValidRoles[]) => {
    console.log("roles protected", args)
    return SetMetadata(META_ROLES, args);
};


export {
 RoleProtected, 
 META_ROLES
}
