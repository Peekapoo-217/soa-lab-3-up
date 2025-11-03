import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getInfo() {
    return {
      service: 'Registry Service',
      description: 'Service Discovery and Registry API using Consul',
      version: '1.0.0',
      endpoints: {
        apiInfo: 'GET /',
        health: 'GET /health',
        allServices: 'GET /registry/services',
        serviceDetails: 'GET /registry/services/:name',
        discoverService: 'GET /registry/discover/:name',
        serviceHealth: 'GET /registry/health/:name',
        allNodes: 'GET /registry/nodes',
        datacenterInfo: 'GET /registry/datacenter',
      },
      consulUI: 'http://localhost:8500/ui',
    };
  }

  @Get('health')
  healthCheck() {
    return {
      status: 'OK',
      service: 'Registry Service',
      timestamp: new Date().toISOString(),
    };
  }
}


