import { Module } from '@nestjs/common';
import { RegistryController } from './registry.controller';
import { ConsulModule } from '../consul/consul.module';

@Module({
    imports: [ConsulModule],
    controllers: [RegistryController],
})
export class RegistryModule { }
