import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateuserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/users.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ){}

  async create(createUserDto: CreateuserDto) {
    
    try {
      const user = this.userRepository.create(createUserDto);

      await this.userRepository.save(user);

      return user;
    } catch (error) {
      this.handleDBErrors(error);
    }
    
  }

  private handleDBErrors(error: any): never{ // never return value
    if(error.code = '23505') throw new BadRequestException(error.detail);

    console.log({error});

    throw new InternalServerErrorException('Please check server logs');
  }
}
