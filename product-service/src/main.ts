import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConsulService } from './consul/consul.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT ?? 3001;
  
  await app.listen(port);
  console.log(`Product Service is running on: ${await app.getUrl()}`);

  // Register with Consul
  const consulService = app.get(ConsulService);
  await consulService.registerService({
    name: 'product-service',
    port: Number(port),
    host: 'localhost',
    tags: ['product', 'api'],
    check: {
      http: `http://localhost:${port}/health`,
      interval: '10s',
      timeout: '5s',
    },
  });

  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    await consulService.deregisterService();
    await app.close();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await consulService.deregisterService();
    await app.close();
    process.exit(0);
  });
}
bootstrap();
