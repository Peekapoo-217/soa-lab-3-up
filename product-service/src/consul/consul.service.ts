import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import * as Consul from 'consul';

export interface ServiceConfig {
    name: string;
    port: number;
    host?: string;
    tags?: string[];
    check?: {
        http?: string;
        interval?: string;
        timeout?: string;
    };
}

@Injectable()
export class ConsulService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(ConsulService.name);
    private consul: Consul.Consul;
    private serviceId: string = '';
    private serviceConfig: ServiceConfig | null = null;

    constructor() {
        // Initialize Consul client
        this.consul = new Consul({
            host: process.env.CONSUL_HOST || 'localhost',
            port: process.env.CONSUL_PORT || '8500',
            promisify: true,
        });
    }

    async onModuleInit() {
        // Register service will be called manually after configuration
    }

    async onModuleDestroy() {
        await this.deregisterService();
    }

    async registerService(config: ServiceConfig): Promise<void> {
        this.serviceConfig = config;
        const host = config.host || 'localhost';
        this.serviceId = `${config.name}-${host}-${config.port}`;

        const registration: Consul.Agent.Service.RegisterOptions = {
            id: this.serviceId,
            name: config.name,
            address: host,
            port: config.port,
            tags: config.tags || [],
        };

        // Add health check if provided
        if (config.check) {
            registration.check = {
                http: config.check.http || `http://${host}:${config.port}/health`,
                interval: config.check.interval || '10s',
                timeout: config.check.timeout || '5s',
            };
        }

        try {
            await this.consul.agent.service.register(registration);
            this.logger.log(`Service ${config.name} registered successfully with Consul`);
            this.logger.log(`Service ID: ${this.serviceId}`);
            this.logger.log(`Service Address: ${host}:${config.port}`);
        } catch (error) {
            this.logger.error(`Failed to register service with Consul: ${error}`);
            throw error;
        }
    }

    async deregisterService(): Promise<void> {
        if (!this.serviceId) {
            return;
        }

        try {
            await this.consul.agent.service.deregister(this.serviceId);
            this.logger.log(`Service ${this.serviceId} deregistered from Consul`);
        } catch (error) {
            this.logger.error(`Failed to deregister service from Consul: ${error}`);
        }
    }

    async getService(serviceName: string): Promise<Consul.Agent.Service.Service[]> {
        try {
            const result: any = await this.consul.health.service({
                service: serviceName,
                passing: true,
            });
            return result;
        } catch (error) {
            this.logger.error(`Failed to get service ${serviceName} from Consul: ${error}`);
            throw error;
        }
    }

    async discoverService(serviceName: string): Promise<string | null> {
        try {
            const services = await this.getService(serviceName);
            if (services && services.length > 0) {
                // Simple load balancing: return random service
                const service = services[Math.floor(Math.random() * services.length)];
                const address = service.Service.Address || service.Node.Address;
                const port = service.Service.Port;
                return `http://${address}:${port}`;
            }
            this.logger.warn(`No healthy instances found for service ${serviceName}`);
            return null;
        } catch (error) {
            this.logger.error(`Failed to discover service ${serviceName}: ${error}`);
            return null;
        }
    }

    getConsulClient(): Consul.Consul {
        return this.consul;
    }
}


