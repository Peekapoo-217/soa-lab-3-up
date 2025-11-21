import { Controller, Get, Post, Delete, Body, Param, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { OrderReportsService } from './order-reports.service';
import { CreateOrderReportDto } from '../../entities/dto/create-order-report.dto';

@Controller('reports/orders')
export class OrderReportsController {
    constructor(private readonly orderReportsService: OrderReportsService) { }

    @Get()
    async findAll() {
        return this.orderReportsService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.orderReportsService.findOne(id);
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createDto: CreateOrderReportDto) {
        return this.orderReportsService.create(createDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
        return this.orderReportsService.remove(id);
    }
}
