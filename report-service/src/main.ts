import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import axios from 'axios';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT ?? 3003;
  const registryUrl = process.env.REGISTRY_URL || 'http://localhost:8600';

  await app.listen(port);
  console.log(`Report Service is running on: ${await app.getUrl()}`);

  // Register with Registry Service
  const serviceId = `report-service-${port}`;
  try {
    await axios.post(`${registryUrl}/registry/register`, {
      name: 'report-service',
      port: Number(port),
      host: 'localhost',
      tags: ['report', 'api'],
      check: {
        http: `http://localhost:${port}/health`,
        interval: '10s',
        timeout: '5s',
      },
    });
    console.log(`✓ Registered with Registry Service: ${serviceId}`);
  } catch (error: any) {
    console.error(`✗ Failed to register with Registry Service: ${error.message}`);
  }

  // Handle graceful shutdown
  const shutdown = async () => {
    try {
      await axios.delete(`${registryUrl}/registry/deregister/${serviceId}`);
      console.log(`✓ Deregistered from Registry Service`);
    } catch (error: any) {
      console.error(`✗ Failed to deregister: ${error.message}`);
    }
    await app.close();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}
bootstrap();
