import { Injectable, Logger } from '@nestjs/common';
import * as Consul from 'consul';

@Injectable()
export class ConsulService {
    private readonly logger = new Logger(ConsulService.name);
    private consul: Consul.Consul;

    constructor() {
        this.consul = new Consul({
            host: process.env.CONSUL_HOST || 'localhost',
            port: process.env.CONSUL_PORT || '8500',
            promisify: true,
        });
        this.logger.log('Consul client initialized');
    }

    async getAllServices(): Promise<any> {
        try {
            const services = await this.consul.catalog.service.list();
            return services;
        } catch (error: any) {
            this.logger.error(`Failed to get services: ${error.message}`);
            throw error;
        }
    }

    async getServiceDetails(serviceName: string): Promise<any> {
        try {
            const result: any = await this.consul.health.service({
                service: serviceName,
                passing: true,
            });

            if (result.length === 0) {
                return null;
            }

            return result.map((item: any) => ({
                id: item.Service.ID,
                name: item.Service.Service,
                address: item.Service.Address || item.Node.Address,
                port: item.Service.Port,
                tags: item.Service.Tags,
                status: item.Checks.every((check: any) => check.Status === 'passing') ? 'healthy' : 'unhealthy',
                node: item.Node.Node,
            }));
        } catch (error: any) {
            this.logger.error(`Failed to get service ${serviceName}: ${error.message}`);
            throw error;
        }
    }

    async discoverService(serviceName: string): Promise<any> {
        try {
            const result: any = await this.consul.health.service({
                service: serviceName,
                passing: true,
            });

            if (result.length === 0) {
                return null;
            }

            // Random load balancing
            const instance = result[Math.floor(Math.random() * result.length)];
            const address = instance.Service.Address || instance.Node.Address;
            const port = instance.Service.Port;

            return {
                url: `http://${address}:${port}`,
                instance: {
                    id: instance.Service.ID,
                    name: instance.Service.Service,
                    address: address,
                    port: port,
                    tags: instance.Service.Tags,
                    node: instance.Node.Node,
                },
            };
        } catch (error: any) {
            this.logger.error(`Failed to discover service ${serviceName}: ${error.message}`);
            throw error;
        }
    }

    async getAllNodes(): Promise<any> {
        try {
            const nodes = await this.consul.catalog.node.list();
            return nodes;
        } catch (error: any) {
            this.logger.error(`Failed to get nodes: ${error.message}`);
            throw error;
        }
    }

    async getDatacenterInfo(): Promise<any> {
        try {
            const leader = await this.consul.status.leader();
            const peers = await this.consul.status.peers();

            return {
                leader,
                peers,
            };
        } catch (error: any) {
            this.logger.error(`Failed to get datacenter info: ${error.message}`);
            throw error;
        }
    }

    async getServiceHealth(serviceName: string): Promise<any> {
        try {
            const result: any = await this.consul.health.service({
                service: serviceName,
            });

            const healthyCount = result.filter((item: any) =>
                item.Checks.every((check: any) => check.Status === 'passing')
            ).length;

            return {
                service: serviceName,
                totalInstances: result.length,
                healthyInstances: healthyCount,
                unhealthyInstances: result.length - healthyCount,
                instances: result.map((item: any) => ({
                    id: item.Service.ID,
                    address: item.Service.Address || item.Node.Address,
                    port: item.Service.Port,
                    status: item.Checks.every((check: any) => check.Status === 'passing') ? 'healthy' : 'unhealthy',
                    checks: item.Checks.map((check: any) => ({
                        name: check.Name,
                        status: check.Status,
                        output: check.Output,
                    })),
                })),
            };
        } catch (error: any) {
            this.logger.error(`Failed to get service health ${serviceName}: ${error.message}`);
            throw error;
        }
    }

    async registerService(serviceConfig: any): Promise<void> {
        const serviceId = `${serviceConfig.name}-${serviceConfig.port}`;
        
        const registration = {
            id: serviceId,
            name: serviceConfig.name,
            address: serviceConfig.host || 'localhost',
            port: serviceConfig.port,
            tags: serviceConfig.tags || [],
            check: serviceConfig.check,
        };

        try {
            await this.consul.agent.service.register(registration);
            this.logger.log(`Service registered: ${serviceId}`);
        } catch (error: any) {
            this.logger.error(`Failed to register service: ${error.message}`);
            throw error;
        }
    }

    async deregisterService(serviceId: string): Promise<void> {
        try {
            await this.consul.agent.service.deregister(serviceId);
            this.logger.log(`Service deregistered: ${serviceId}`);
        } catch (error: any) {
            this.logger.error(`Failed to deregister service: ${error.message}`);
            throw error;
        }
    }

    getConsulClient(): Consul.Consul {
        return this.consul;
    }
}
