import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersService } from '../users/users.service';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from 'src/passport/local.strategy';
import { JwtAuthGuard } from 'src/guard/jwt-auth.guard';
import { JwtStrategy } from 'src/passport/jwt.strategy';

@Module({
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: 'a8e16df56fbe747d92a2fb63dfdffd3b43ba993c7d29185af14715f872cec446',
      signOptions: { expiresIn: '1h' },
    }),
  ],
})
export class AuthModule { }
