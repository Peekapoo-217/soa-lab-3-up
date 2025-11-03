import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly httpService: HttpService) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header missing');
    }

    try {
      // Gọi sang hello-app để validate token
      const response = await firstValueFrom(
        this.httpService.post('http://localhost:3000/auth/validate', {}, {
          headers: {
            Authorization: authHeader,
          },
        })
      );

      if (response.data.valid) {
        // Lưu thông tin user vào request để sử dụng trong controller
        request.user = response.data.payload;
        return true;
      }

      throw new UnauthorizedException('Invalid token');
    } catch (error) {
      throw new UnauthorizedException('Token validation failed');
    }
  }
}


