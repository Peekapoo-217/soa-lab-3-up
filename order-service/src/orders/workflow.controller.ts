import { Controller, Post, Body, HttpCode, HttpStatus, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { OrdersService } from './orders.service';

interface PurchaseWorkflowDto {
    customer_name: string;
    customer_email: string;
    items: Array<{
        product_id: number;
        quantity: number;
    }>;
    shipping_address?: string;
    notes?: string;
}

interface WorkflowResponse {
    success: boolean;
    message: string;
    data: {
        order: any;
        order_report?: any;
        product_reports?: any[];
    };
}

@Controller('workflow')
export class WorkflowController {
    private readonly reportServiceUrl = process.env.REPORT_SERVICE_URL || 'http://localhost:3003';

    constructor(
        private readonly ordersService: OrdersService,
        private readonly httpService: HttpService,
    ) { }

    private async getReportServiceUrl(): Promise<string> {
        try {
            const registryUrl = process.env.REGISTRY_URL || 'http://localhost:8600';
            const response = await firstValueFrom(
                this.httpService.get(`${registryUrl}/registry/discover/report-service`)
            );
            if (response?.data?.success && response.data.url) {
                return response.data.url;
            }
        } catch (error: any) {
            console.warn(`Failed to discover report-service: ${error.message}`);
        }
        return this.reportServiceUrl;
    }

    @Post('purchase')
    @HttpCode(HttpStatus.CREATED)
    async completePurchaseWorkflow(@Body() purchaseDto: PurchaseWorkflowDto): Promise<WorkflowResponse> {
        try {
            // Step 1: Create Order (this will also update product stock automatically)
            console.log('Step 1: Creating order...');
            const order = await this.ordersService.create({
                userId: 1, // Default user for demo
                items: purchaseDto.items.map(item => ({
                    productId: item.product_id,
                    quantity: item.quantity,
                })),
                shippingAddress: purchaseDto.shipping_address,
                notes: purchaseDto.notes,
            });

            console.log(`✓ Order created with ID: ${order.id}`);

            // Step 2: Update order status to CONFIRMED (simulating payment and shipping)
            console.log('Step 2: Updating order status to CONFIRMED...');
            await this.ordersService.updateStatus(order.id, {
                status: 'CONFIRMED' as any,
            });
            console.log('✓ Order status updated to CONFIRMED');

            // Step 3: Update order status to COMPLETED
            console.log('Step 3: Updating order status to COMPLETED...');
            const completedOrder = await this.ordersService.updateStatus(order.id, {
                status: 'COMPLETED' as any,
            });
            console.log('✓ Order status updated to COMPLETED');

            // Step 4: Create Order Report
            console.log('Step 4: Creating order report...');
            const reportServiceUrl = await this.getReportServiceUrl();
            const orderReportResponse = await firstValueFrom(
                this.httpService.post(`${reportServiceUrl}/reports/orders`, {
                    order_id: order.id,
                })
            );
            const orderReport = orderReportResponse.data;
            console.log(`✓ Order report created with ID: ${orderReport.id}`);

            // Step 5: Create Product Reports for each item
            console.log('Step 5: Creating product reports...');
            const productReports = [];
            for (const item of order.items) {
                const productReportResponse = await firstValueFrom(
                    this.httpService.post(`${reportServiceUrl}/reports/products`, {
                        order_report_id: orderReport.id,
                        product_id: item.productId,
                    })
                );
                productReports.push(productReportResponse.data);
                console.log(`✓ Product report created for product ID: ${item.productId}`);
            }

            return {
                success: true,
                message: 'Purchase workflow completed successfully',
                data: {
                    order: completedOrder,
                    order_report: orderReport,
                    product_reports: productReports,
                },
            };
        } catch (error: any) {
            console.error('Workflow error:', error.message);
            throw new BadRequestException(`Purchase workflow failed: ${error.message}`);
        }
    }

    @Post('purchase-simple')
    @HttpCode(HttpStatus.CREATED)
    async simplePurchaseWorkflow(@Body() purchaseDto: PurchaseWorkflowDto): Promise<any> {
        try {
            // Just create the order without reports
            console.log('Creating order...');
            const order = await this.ordersService.create({
                userId: 1,
                items: purchaseDto.items.map(item => ({
                    productId: item.product_id,
                    quantity: item.quantity,
                })),
                shippingAddress: purchaseDto.shipping_address,
                notes: purchaseDto.notes,
            });

            return {
                success: true,
                message: 'Order created successfully',
                data: {
                    order,
                    customer_name: purchaseDto.customer_name,
                    customer_email: purchaseDto.customer_email,
                },
            };
        } catch (error: any) {
            throw new BadRequestException(`Order creation failed: ${error.message}`);
        }
    }
}

