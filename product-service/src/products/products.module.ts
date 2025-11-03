import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { AuthGuard } from '../guards/auth.guard';

@Module({
  imports: [
    HttpModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsService, AuthGuard],
  exports: [ProductsService],
})
export class ProductsModule { }

