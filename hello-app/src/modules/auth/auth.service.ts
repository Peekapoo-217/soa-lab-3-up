import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { access } from 'fs';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService) { }

    async login(user: any) {
        const payload = { email: user.email, sub: user.id };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }

    async validateToken(token: string) {
        
        try {
            // Không cần truyền secret nữa, vì đã config trong JwtModule
            const payload = await this.jwtService.verifyAsync(token);
            return { valid: true, payload };
        } catch (error) {
            throw new UnauthorizedException('Invalid or expired token');
        }
    }
}
