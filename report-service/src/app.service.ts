import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getServiceInfo() {
    return {
      service: 'Report Service',
      description: 'Microservice for generating reports from Product and Order services',
      version: '1.0.0',
      endpoints: {
        apiInfo: 'GET /',
        health: 'GET /health',
        allProductReports: 'GET /reports/products',
        productReportById: 'GET /reports/products/:id',
        createProductReport: 'POST /reports/products (body: {order_report_id, product_id})',
        deleteProductReport: 'DELETE /reports/products/:id',
        allOrderReports: 'GET /reports/orders',
        orderReportById: 'GET /reports/orders/:id',
        createOrderReport: 'POST /reports/orders (body: {order_id})',
        deleteOrderReport: 'DELETE /reports/orders/:id',
      },
      dataModels: {
        orderReport: {
          id: 'number',
          order_id: 'number',
          total_revenue: 'decimal(10,2)',
          total_cost: 'decimal(10,2)',
          total_profit: 'decimal(10,2)',
        },
        productReport: {
          id: 'number',
          order_report_id: 'number (FK to order_reports)',
          product_id: 'number',
          total_sold: 'number',
          revenue: 'decimal(10,2)',
          cost: 'decimal(10,2)',
          profit: 'decimal(10,2)',
        },
      },
      integrations: {
        productService: 'Consul service discovery',
        orderService: 'Consul service discovery',
        consul: 'http://localhost:8500',
      },
    };
  }

  healthCheck() {
    return {
      status: 'OK',
      service: 'Report Service',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
