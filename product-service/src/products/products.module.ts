import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { Product } from '../entities/Product';
import { AuthGuard } from '../guards/auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product]),
    HttpModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsService, AuthGuard],
  exports: [ProductsService],
})
export class ProductsModule { }

