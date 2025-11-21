import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { OrderReportsController } from './order-reports.controller';
import { OrderReportsService } from './order-reports.service';

@Module({
    imports: [HttpModule],
    controllers: [OrderReportsController],
    providers: [OrderReportsService],
})
export class OrderReportsModule { }
