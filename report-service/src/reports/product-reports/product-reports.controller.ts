import { Controller, Get, Post, Delete, Body, Param, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { ProductReportsService } from './product-reports.service';
import { CreateProductReportDto } from '../../entities/dto/create-product-report.dto';

@Controller('reports/products')
export class ProductReportsController {
    constructor(private readonly productReportsService: ProductReportsService) { }

    @Get()
    async findAll() {
        return this.productReportsService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.productReportsService.findOne(id);
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createDto: CreateProductReportDto) {
        return this.productReportsService.create(createDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
        return this.productReportsService.remove(id);
    }
}
