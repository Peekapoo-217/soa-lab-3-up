import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductReportsModule } from './reports/product-reports/product-reports.module';
import { OrderReportsModule } from './reports/order-reports/order-reports.module';

@Module({
  imports: [
    HttpModule,
    ProductReportsModule,
    OrderReportsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
