import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { OrderReport } from '../../entities/OrderReport';
import { CreateOrderReportDto } from '../../entities/dto/create-order-report.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class OrderReportsService {
    private readonly dataPath = path.join(__dirname, '..', '..', 'data', 'order-reports.json');
    private readonly orderServiceUrl = process.env.ORDER_SERVICE_URL || 'http://localhost:3002';

    constructor(private readonly httpService: HttpService) { }

    private readData(): OrderReport[] {
        try {
            const data = fs.readFileSync(this.dataPath, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            return [];
        }
    }

    private writeData(reports: OrderReport[]): void {
        fs.writeFileSync(this.dataPath, JSON.stringify(reports, null, 2));
    }

    private async getOrderServiceUrl(): Promise<string> {
        try {
            const registryUrl = process.env.REGISTRY_URL || 'http://localhost:8600';
            const response = await firstValueFrom(
                this.httpService.get(`${registryUrl}/registry/discover/order-service`)
            );
            if (response?.data?.success && response.data.url) {
                return response.data.url;
            }
        } catch (error: any) {
            console.warn(`Failed to discover order-service: ${error.message}`);
        }
        return this.orderServiceUrl;
    }

    async findAll(): Promise<OrderReport[]> {
        return this.readData();
    }

    async findOne(id: number): Promise<OrderReport> {
        const reports = this.readData();
        const report = reports.find(r => r.id === id);
        if (!report) {
            throw new NotFoundException(`Order report with id ${id} not found`);
        }
        return report;
    }

    async create(createDto: CreateOrderReportDto): Promise<OrderReport> {
        try {
            // Lấy thông tin order từ Order Service
            const orderServiceUrl = await this.getOrderServiceUrl();
            const orderResponse = await firstValueFrom(
                this.httpService.get(`${orderServiceUrl}/orders/${createDto.order_id}`)
            );
            const order = orderResponse.data;

            const reports = this.readData();
            const newId = reports.length > 0 ? Math.max(...reports.map(r => r.id)) + 1 : 1;

            // Tính toán total_cost và total_profit từ các items trong order
            let totalCost = 0;
            if (order.items && Array.isArray(order.items)) {
                order.items.forEach((item: any) => {
                    // Giả sử cost = 60% của price (có thể lấy từ product service nếu cần)
                    const itemCost = item.price * 0.6 * item.quantity;
                    totalCost += itemCost;
                });
            }

            const totalRevenue = order.totalAmount;
            const totalProfit = totalRevenue - totalCost;

            const report: OrderReport = {
                id: newId,
                order_id: createDto.order_id,
                total_revenue: totalRevenue,
                total_cost: totalCost,
                total_profit: totalProfit,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            reports.push(report);
            this.writeData(reports);
            return report;
        } catch (error: any) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException(`Failed to create order report: ${error.message}`);
        }
    }

    async remove(id: number): Promise<void> {
        const reports = this.readData();
        const index = reports.findIndex(r => r.id === id);

        if (index === -1) {
            throw new NotFoundException(`Order report with id ${id} not found`);
        }

        reports.splice(index, 1);
        this.writeData(reports);
    }
}
