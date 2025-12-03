import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConsulModule } from './consul/consul.module';
import { RegistryModule } from './registry/registry.module';

@Module({
  imports: [
    ConsulModule,
    RegistryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}




