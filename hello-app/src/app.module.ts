import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './products/products.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { ConsulModule } from './consul/consul.module';

@Module({
  imports: [
    ProductsModule, 
    UsersModule,
    AuthModule,
    ConsulModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
