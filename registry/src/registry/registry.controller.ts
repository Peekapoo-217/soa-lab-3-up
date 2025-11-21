import { Controller, Get, Post, Delete, Param, Body, NotFoundException } from '@nestjs/common';
import { ConsulService } from '../consul/consul.service';

@Controller('registry')
export class RegistryController {
    constructor(private readonly consulService: ConsulService) { }

    @Get('services')
    async getAllServices() {
        try {
            const services = await this.consulService.getAllServices();
            return {
                success: true,
                services,
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message,
            };
        }
    }

    @Get('services/:name')
    async getServiceDetails(@Param('name') name: string) {
        try {
            const details = await this.consulService.getServiceDetails(name);
            if (!details) {
                throw new NotFoundException(`Service ${name} not found or no healthy instances`);
            }
            return {
                success: true,
                service: name,
                instances: details,
            };
        } catch (error: any) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            return {
                success: false,
                error: error.message,
            };
        }
    }

    @Get('discover/:name')
    async discoverService(@Param('name') name: string) {
        try {
            const discovered = await this.consulService.discoverService(name);
            if (!discovered) {
                throw new NotFoundException(`Service ${name} not found or no healthy instances`);
            }
            return {
                success: true,
                service: name,
                ...discovered,
            };
        } catch (error: any) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            return {
                success: false,
                error: error.message,
            };
        }
    }

    @Get('health/:name')
    async getServiceHealth(@Param('name') name: string) {
        try {
            const health = await this.consulService.getServiceHealth(name);
            return {
                success: true,
                ...health,
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message,
            };
        }
    }

    @Get('nodes')
    async getAllNodes() {
        try {
            const nodes = await this.consulService.getAllNodes();
            return {
                success: true,
                nodes,
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message,
            };
        }
    }

    @Get('datacenter')
    async getDatacenterInfo() {
        try {
            const info = await this.consulService.getDatacenterInfo();
            return {
                success: true,
                ...info,
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message,
            };
        }
    }

    @Post('register')
    async registerService(@Body() serviceConfig: any) {
        try {
            await this.consulService.registerService(serviceConfig);
            return {
                success: true,
                message: `Service ${serviceConfig.name} registered successfully`,
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message,
            };
        }
    }

    @Delete('deregister/:serviceId')
    async deregisterService(@Param('serviceId') serviceId: string) {
        try {
            await this.consulService.deregisterService(serviceId);
            return {
                success: true,
                message: `Service ${serviceId} deregistered successfully`,
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message,
            };
        }
    }
}
