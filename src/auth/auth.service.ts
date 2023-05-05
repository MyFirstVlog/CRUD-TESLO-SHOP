import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { CreateuserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/users.entity';
import * as bcrypt from 'bcrypt'
import { LoginUserDto } from './dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload-interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService
  ){}

  async create(createUserDto: CreateuserDto) {
    
    try {

      const {password, ...userData} = createUserDto;

      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10),
      });

      await this.userRepository.save(user);
      delete user.password;

      return {
        ...user,
        token: this.getJwtToken({email: user.email}),
      };
      
    } catch (error) {
      this.handleDBErrors(error);
    }
    
  }

  async login( loginUserDto: LoginUserDto){
    const {email, password} = loginUserDto;
    const user = await this.userRepository.findOne({
      where: {email},
      select: {email: true, password: true}
    });

    if(!user) throw new UnauthorizedException('Credentials are not valid (email)');
    if(!bcrypt.compareSync(password, user.password)) throw new UnauthorizedException('Credentials are not valid (password)');

    return {
      ...user,
      token: this.getJwtToken({email: user.email}),
    };
  }

  private handleDBErrors(error: any): never{ // never return value
    if(error.code = '23505') throw new BadRequestException(error.detail);

    console.log({error});

    throw new InternalServerErrorException('Please check server logs');
  }

  private getJwtToken(payload: JwtPayload){
    //* Generate token
    return this.jwtService.sign(payload); //All config is already loaded on JwtModule.registerAsync in auth module
}
}
