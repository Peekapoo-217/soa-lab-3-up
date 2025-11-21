import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getServiceInfo() {
    return {
      service: 'Order Service',
      description: 'Microservice for managing orders with Consul service discovery',
      version: '1.0.0',
      endpoints: {
        apiInfo: 'GET /',
        health: 'GET /health',
        allOrders: 'GET /orders',
        orderById: 'GET /orders/:id',
        ordersByUser: 'GET /orders/user/:userId',
        createOrder: 'POST /orders',
        updateOrder: 'PUT /orders/:id',
        cancelOrder: 'PUT /orders/:id/cancel',
        deleteOrder: 'DELETE /orders/:id',
        checkAvailability: 'GET /orders/product/:productId/check/:quantity',
      },
      integrations: {
        productService: 'Consul service discovery',
        consul: 'http://localhost:8500',
      },
    };
  }

  healthCheck() {
    return {
      status: 'OK',
      service: 'Order Service',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
