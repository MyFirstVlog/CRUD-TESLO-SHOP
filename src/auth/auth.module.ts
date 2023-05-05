import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/users.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User
    ]),
    PassportModule.register({defaultStrategy: 'jwt'}),
    JwtModule.registerAsync({
      imports: [],
      inject: [],
      useFactory: () => {
        console.log(process.env.JWT_SECRET)
        return {
          secret: process.env.JWT_SECRET,
          signOptions: {
            expiresIn: '24h'
          }
        } 
      }
    })
    // JwtModule.register({ // it might be possible that the app does not have env variables in the moment the app is mounted, in this case, we use registerAsync 
    //   secret: process.env.JWT_SECRET,
    //   signOptions: {
    //     expiresIn: '24h'
    //   }
    // })
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [TypeOrmModule]
})
export class AuthModule {}
