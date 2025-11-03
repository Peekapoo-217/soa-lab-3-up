import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt } from "passport-jwt";
import { Strategy } from "passport-jwt";
import { UsersService } from "src/modules/users/users.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly userService: UsersService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: 'a8e16df56fbe747d92a2fb63dfdffd3b43ba993c7d29185af14715f872cec446'
        });
    }

    async validate(payload: any) {
        const email = payload.email;
        const user = this.userService.findByEmail(email);
        return user;
    }
}