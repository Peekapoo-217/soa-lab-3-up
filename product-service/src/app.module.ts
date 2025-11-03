import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './products/products.module';
import { HttpModule } from '@nestjs/axios';
import { ConsulModule } from './consul/consul.module';

@Module({
  imports: [
    HttpModule,
    ConsulModule,
    ProductsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
