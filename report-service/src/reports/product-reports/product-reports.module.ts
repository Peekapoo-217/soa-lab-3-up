import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ProductReportsController } from './product-reports.controller';
import { ProductReportsService } from './product-reports.service';

@Module({
    imports: [HttpModule],
    controllers: [ProductReportsController],
    providers: [ProductReportsService],
})
export class ProductReportsModule { }
