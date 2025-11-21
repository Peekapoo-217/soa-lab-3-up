import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from '../entities/dto/create-order.dto';
import { UpdateOrderDto } from '../entities/dto/update-order.dto';

@Controller('orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    @Get()
    async findAll() {
        return this.ordersService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.ordersService.findOne(id);
    }

    @Get('user/:userId')
    async findByUser(@Param('userId', ParseIntPipe) userId: number) {
        return this.ordersService.findByUser(userId);
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createOrderDto: CreateOrderDto) {
        return this.ordersService.create(createOrderDto);
    }

    @Put(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateOrderDto: UpdateOrderDto
    ) {
        return this.ordersService.updateStatus(id, updateOrderDto);
    }

    @Put(':id/cancel')
    async cancel(@Param('id', ParseIntPipe) id: number) {
        return this.ordersService.cancelOrder(id);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
        return this.ordersService.remove(id);
    }

    @Get('product/:productId/check/:quantity')
    async checkProductAvailability(
        @Param('productId', ParseIntPipe) productId: number,
        @Param('quantity', ParseIntPipe) quantity: number
    ): Promise<{ available: boolean }> {
        const available = await this.ordersService.checkProductAvailability(productId, quantity);
        return { available };
    }
}

