import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ProductReport } from '../../entities/ProductReport';
import { CreateProductReportDto } from '../../entities/dto/create-product-report.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ProductReportsService {
    private readonly dataPath = path.join(__dirname, '..', '..', 'data', 'product-reports.json');
    private readonly productServiceUrl = process.env.PRODUCT_SERVICE_URL || 'http://localhost:3001';
    private readonly orderServiceUrl = process.env.ORDER_SERVICE_URL || 'http://localhost:3002';

    constructor(private readonly httpService: HttpService) { }

    private readData(): ProductReport[] {
        try {
            const data = fs.readFileSync(this.dataPath, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            return [];
        }
    }

    private writeData(reports: ProductReport[]): void {
        fs.writeFileSync(this.dataPath, JSON.stringify(reports, null, 2));
    }

    private async getProductServiceUrl(): Promise<string> {
        try {
            const registryUrl = process.env.REGISTRY_URL || 'http://localhost:8600';
            const response = await firstValueFrom(
                this.httpService.get(`${registryUrl}/registry/discover/product-service`)
            );
            if (response?.data?.success && response.data.url) {
                return response.data.url;
            }
        } catch (error: any) {
            console.warn(`Failed to discover product-service: ${error.message}`);
        }
        return this.productServiceUrl;
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

    async findAll(): Promise<ProductReport[]> {
        return this.readData();
    }

    async findOne(id: number): Promise<ProductReport> {
        const reports = this.readData();
        const report = reports.find(r => r.id === id);
        if (!report) {
            throw new NotFoundException(`Product report with id ${id} not found`);
        }
        return report;
    }

    async create(createDto: CreateProductReportDto): Promise<ProductReport> {
        try {
            // Lấy thông tin sản phẩm từ Product Service
            const productServiceUrl = await this.getProductServiceUrl();
            const productResponse = await firstValueFrom(
                this.httpService.get(`${productServiceUrl}/products/${createDto.product_id}`)
            );
            const product = productResponse.data;

            // Lấy thông tin order report để liên kết
            const orderReportsPath = path.join(__dirname, '..', '..', 'data', 'order-reports.json');
            const orderReportsData = fs.readFileSync(orderReportsPath, 'utf-8');
            const orderReports = JSON.parse(orderReportsData);
            const orderReport = orderReports.find((r: any) => r.id === createDto.order_report_id);

            if (!orderReport) {
                throw new NotFoundException(`Order report with id ${createDto.order_report_id} not found`);
            }

            // Lấy thông tin order từ Order Service
            const orderServiceUrl = await this.getOrderServiceUrl();
            const orderResponse = await firstValueFrom(
                this.httpService.get(`${orderServiceUrl}/orders/${orderReport.order_id}`)
            );
            const order = orderResponse.data;

            // Tìm item của product trong order này
            let totalSold = 0;
            let revenue = 0;
            let cost = 0;

            if (order.items && Array.isArray(order.items)) {
                const item = order.items.find((i: any) => i.productId === createDto.product_id);
                if (item) {
                    totalSold = item.quantity;
                    revenue = item.subtotal;
                    // Giả sử cost = 60% của price
                    cost = item.price * 0.6 * item.quantity;
                }
            }

            const profit = revenue - cost;

            const reports = this.readData();
            const newId = reports.length > 0 ? Math.max(...reports.map(r => r.id)) + 1 : 1;

            const report: ProductReport = {
                id: newId,
                order_report_id: createDto.order_report_id,
                product_id: createDto.product_id,
                product_name: product.name,
                total_sold: totalSold,
                revenue: revenue,
                cost: cost,
                profit: profit,
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
            throw new BadRequestException(`Failed to create product report: ${error.message}`);
        }
    }

    async remove(id: number): Promise<void> {
        const reports = this.readData();
        const index = reports.findIndex(r => r.id === id);

        if (index === -1) {
            throw new NotFoundException(`Product report with id ${id} not found`);
        }

        reports.splice(index, 1);
        this.writeData(reports);
    }
}
