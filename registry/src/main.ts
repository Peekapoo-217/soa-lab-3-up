import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT ?? 8600;
  
  await app.listen(port);
  
  console.log('===========================================');
  console.log('Registry Service Started');
  console.log('===========================================');
  console.log(`Port: ${port}`);
  console.log(`URL: http://localhost:${port}`);
  console.log(`Health Check: http://localhost:${port}/health`);
  console.log('');
  console.log('Available Endpoints:');
  console.log('  GET /                           - API info');
  console.log('  GET /health                     - Health check');
  console.log('  GET /registry/services          - List all services');
  console.log('  GET /registry/services/:name    - Get service details');
  console.log('  GET /registry/discover/:name    - Discover service instance');
  console.log('  GET /registry/health/:name      - Get service health');
  console.log('  GET /registry/nodes             - List all nodes');
  console.log('  GET /registry/datacenter        - Get datacenter info');
  console.log('===========================================');
  console.log('');
  console.log('Make sure Consul is running:');
  console.log('  consul agent -dev');
  console.log('');
  console.log('Consul UI: http://localhost:8500/ui');
  console.log('===========================================');
}
bootstrap();



