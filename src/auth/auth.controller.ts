import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Headers, SetMetadata } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateuserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser, RawHeaders } from './decorators/custom-decorators.decorator';
import { User } from './entities/users.entity';
import { IncomingHttpHeaders } from 'http';
import { CustomRolesGuard } from './guards/custom-roles.guard.ts/custom-roles.guard.ts.guard';
import { RoleProtected } from './decorators/role-protected/role-protected.decorator';
import { ValidRoles } from './interfaces/valid-roles.enum';
import { Auth } from './decorators/auth.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  create(@Body() createAuthDto: CreateuserDto) {
    return this.authService.create(createAuthDto);
  }

  @Post('login')
  login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get('revalidate-token-status')
  @UseGuards(AuthGuard())
  checkAuthStatus(
    @GetUser() user: User,
  ){
    return this.authService.checkAuthStatus(user);
  }

  @Get('private')
  @UseGuards(AuthGuard())
  testignPrivateRoutes(
    // @Req() request: Express.Request,
    @GetUser() user: User,
    @GetUser('email') userEmail: string,
    @RawHeaders() rawHeaders: string[],
    @Headers() headers: IncomingHttpHeaders 
  ){
    // console.log(request['rawHeaders']);
     console.log({user, userEmail, rawHeaders});
     
    return {
      user, userEmail, headers
    };
  }

  @Get('private2')
  // @SetMetadata('roles', ['admin', 'super-user'])
  @RoleProtected(ValidRoles.admin, ValidRoles.user)
  @UseGuards(AuthGuard(), CustomRolesGuard)
  privateRoutes2(
    @GetUser() user: User
  ){
    console.log({user})
    return user
  }

  @Get('private3')
  // @SetMetadata('roles', ['admin', 'super-user'])
  @Auth(ValidRoles.superUser)
  privateRoutes(
    @GetUser() user: User
  ){
    console.log({user})
    return user
  }

}
