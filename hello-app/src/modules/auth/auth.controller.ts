import { Body, Controller, Get, Headers, Post, Req, Request, RequestMapping, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { LocalAuthGuard } from 'src/guard/local-auth.guard';
import { JwtAuthGuard } from 'src/guard/jwt-auth.guard';
import { User } from 'src/entities/User';
import { log } from 'console';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService
  ) { }

  @Post('register')
  register(@Body() userData: User) {
    return this.usersService.create(userData);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Request() request: any) {
    return this.authService.login(request.user)
  }

  @Post('validate')
  async validate(@Headers('authorization') authHeader: string) {
    if (!authHeader) {
      return { valid: false, message: 'Authorization header missing' };
    }

    // Header có dạng "Bearer <token>"
    const token = authHeader.split(' ')[1];
    if (!token) {
      return { valid: false, message: 'Token missing in Authorization header' };
    }

    return this.authService.validateToken(token);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/profile')
  profile(@Request() request: any) {
    return request.user;
  }

}
