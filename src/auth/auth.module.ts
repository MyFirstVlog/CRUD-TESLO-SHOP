import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/users.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JWTStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User
    ]),
    PassportModule.register({defaultStrategy: 'jwt'}),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        // console.log(process.env.JWT_SECRET);
        // console.log(configService.get('JWT_SECRET'));
        return {
          secret: configService.get('JWT_SECRET'),
          signOptions: {
            expiresIn: '24h'
          }
        } 
      }
    }),
    // JwtModule.register({ // it might be possible that the app does not have env variables in the moment the app is mounted, in this case, we use registerAsync 
    //   secret: process.env.JWT_SECRET,
    //   signOptions: {
    //     expiresIn: '24h'
    //   }
    // }),
    ConfigModule
  ],
  controllers: [AuthController],
  providers: [AuthService, JWTStrategy],
  exports: [TypeOrmModule, JWTStrategy, PassportModule, JwtModule]
})
export class AuthModule {}
