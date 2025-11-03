import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ConsulService } from '../consul/consul.service';
import * as fs from 'fs';
import * as path from 'path';

export enum OrderStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    PROCESSING = 'PROCESSING',
    SHIPPED = 'SHIPPED',
    DELIVERED = 'DELIVERED',
    CANCELLED = 'CANCELLED',
}

interface OrderItem {
    id: number;
    productId: number;
    productName: string;
    price: number;
    quantity: number;
    subtotal: number;
}

interface Order {
    id: number;
    userId: number;
    status: OrderStatus;
    totalAmount: number;
    shippingAddress?: string;
    notes?: string;
    items: OrderItem[];
    createdAt: Date;
    updatedAt: Date;
}

@Injectable()
export class OrdersService {
    private readonly dataPath = path.join(__dirname, '..', 'data', 'orders.json');
    private productServiceUrl = process.env.PRODUCT_SERVICE_URL || 'http://localhost:3001';

    constructor(
        private readonly httpService: HttpService,
        private readonly consulService: ConsulService,
    ) { }

    private readData(): Order[] {
        try {
            const data = fs.readFileSync(this.dataPath, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            return [];
        }
    }

    private writeData(orders: Order[]): void {
        fs.writeFileSync(this.dataPath, JSON.stringify(orders, null, 2));
    }

    private async getProductServiceUrl(): Promise<string> {
        const serviceUrl = await this.consulService.discoverService('product-service');
        return serviceUrl || this.productServiceUrl;
    }

    async findAll(): Promise<Order[]> {
        return this.readData();
    }

    async findOne(id: number): Promise<Order> {
        const orders = this.readData();
        const order = orders.find(o => o.id === id);
        if (!order) {
            throw new NotFoundException(`Order with id ${id} not found`);
        }
        return order;
    }

    async findByUser(userId: number): Promise<Order[]> {
        const orders = this.readData();
        return orders.filter(o => o.userId === userId);
    }

    async create(createOrderDto: CreateOrderDto): Promise<Order> {
        const orderItems: OrderItem[] = [];
        let totalAmount = 0;
        let itemIdCounter = 1;

        for (const item of createOrderDto.items) {
            try {
                const productServiceUrl = await this.getProductServiceUrl();
                const response = await firstValueFrom(
                    this.httpService.get(`${productServiceUrl}/products/${item.productId}`)
                );
                const product = response.data;

                if (product.stock < item.quantity) {
                    throw new BadRequestException(
                        `Insufficient stock for product ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`
                    );
                }

                const orderItem: OrderItem = {
                    id: itemIdCounter++,
                    productId: product.id,
                    productName: product.name,
                    price: product.price,
                    quantity: item.quantity,
                    subtotal: product.price * item.quantity,
                };

                orderItems.push(orderItem);
                totalAmount += orderItem.subtotal;
            } catch (error: any) {
                if (error instanceof BadRequestException) {
                    throw error;
                }
                throw new BadRequestException(`Product with id ${item.productId} not found or unavailable`);
            }
        }

        const orders = this.readData();
        const newId = orders.length > 0 ? Math.max(...orders.map(o => o.id)) + 1 : 1;

        const order: Order = {
            id: newId,
            userId: createOrderDto.userId,
            status: OrderStatus.PENDING,
            totalAmount: totalAmount,
            shippingAddress: createOrderDto.shippingAddress || '',
            notes: createOrderDto.notes || '',
            items: orderItems,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        orders.push(order);
        this.writeData(orders);
        return order;
    }

    async updateStatus(id: number, updateOrderDto: UpdateOrderDto): Promise<Order> {
        const orders = this.readData();
        const index = orders.findIndex(o => o.id === id);

        if (index === -1) {
            throw new NotFoundException(`Order with id ${id} not found`);
        }

        if (updateOrderDto.status) {
            orders[index].status = updateOrderDto.status;
        }
        if (updateOrderDto.shippingAddress !== undefined) {
            orders[index].shippingAddress = updateOrderDto.shippingAddress;
        }
        if (updateOrderDto.notes !== undefined) {
            orders[index].notes = updateOrderDto.notes;
        }

        orders[index].updatedAt = new Date();

        this.writeData(orders);
        return orders[index];
    }

    async remove(id: number): Promise<void> {
        const orders = this.readData();
        const index = orders.findIndex(o => o.id === id);

        if (index === -1) {
            throw new NotFoundException(`Order with id ${id} not found`);
        }

        orders.splice(index, 1);
        this.writeData(orders);
    }

    async cancelOrder(id: number): Promise<Order> {
        const orders = this.readData();
        const index = orders.findIndex(o => o.id === id);

        if (index === -1) {
            throw new NotFoundException(`Order with id ${id} not found`);
        }

        const order = orders[index];

        if (order.status === OrderStatus.DELIVERED || order.status === OrderStatus.CANCELLED) {
            throw new BadRequestException(`Cannot cancel order with status ${order.status}`);
        }

        orders[index].status = OrderStatus.CANCELLED;
        orders[index].updatedAt = new Date();

        this.writeData(orders);
        return orders[index];
    }

    async checkProductAvailability(productId: number, quantity: number): Promise<boolean> {
        try {
            const productServiceUrl = await this.getProductServiceUrl();
            const response = await firstValueFrom(
                this.httpService.get(`${productServiceUrl}/products/${productId}`)
            );
            const product = response.data;
            return product.stock >= quantity;
        } catch (error) {
            return false;
        }
    }
}
