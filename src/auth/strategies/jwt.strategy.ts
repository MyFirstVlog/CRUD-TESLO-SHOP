import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { User } from "../entities/users.entity";
import { JwtPayload } from "../interfaces/jwt-payload-interface";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ConfigService } from '@nestjs/config';
import { Injectable, UnauthorizedException } from "@nestjs/common";

//* Expand JWT Validation
//* Password strategy will verify expiration date and if it's valid

@Injectable() //* All strategies are injectable
class JWTStrategy extends PassportStrategy( Strategy) {

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        configService: ConfigService
    ){
        super({
            secretOrKey: configService.get('JWT_SECRET'),
            //? Now to specify the place where the token will be located on the request
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        }); //* It's obliged
    }

    async validate( payload: JwtPayload): Promise<User>{

        const {email} = payload;

        const user = await this.userRepository.findOneBy({email});

        if (!user) throw new UnauthorizedException('token not valid');
        if (!user.isActive) throw new UnauthorizedException('Userd is inactive, talk with an admin');

        return user; //returning this, will help us to access to the user as Request.user in all places where you interact with it. This help us to create decorator to access the user
    }
}

export {
    JWTStrategy
}