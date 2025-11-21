import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './entities/dto/create-product.dto';
import { UpdateProductDto } from './entities/dto/update-product.dto';
import { Product } from './entities/Product';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AppService {
  private readonly dataPath = path.join(__dirname, '..', 'data', 'products.json');

  getServiceInfo() {
    return {
      service: 'Product Service',
      description: 'Microservice for managing products with Consul service discovery',
      version: '1.0.0',
      endpoints: {
        apiInfo: 'GET /',
        health: 'GET /health',
        allProducts: 'GET /products',
        productById: 'GET /products/:id',
        createProduct: 'POST /products',
        updateProduct: 'PUT /products/:id',
        deleteProduct: 'DELETE /products/:id',
      },
      integrations: {
        consul: 'http://localhost:8500',
      },
    };
  }

  healthCheck() {
    return {
      status: 'OK',
      service: 'Product Service',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  private readData(): Product[] {
    try {
      const data = fs.readFileSync(this.dataPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  private writeData(products: Product[]): void {
    fs.writeFileSync(this.dataPath, JSON.stringify(products, null, 2));
  }

  async findAll(): Promise<Product[]> {
    return this.readData();
  }

  async findOne(id: number): Promise<Product> {
    const products = this.readData();
    const product = products.find(p => p.id === id);
    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    return product;
  }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const products = this.readData();
    const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
    
    const product: Product = {
      id: newId,
      ...createProductDto,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    products.push(product);
    this.writeData(products);
    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto): Promise<Product> {
    const products = this.readData();
    const index = products.findIndex(p => p.id === id);
    
    if (index === -1) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    
    products[index] = {
      ...products[index],
      ...updateProductDto,
      updatedAt: new Date(),
    };
    
    this.writeData(products);
    return products[index];
  }

  async remove(id: number): Promise<void> {
    const products = this.readData();
    const index = products.findIndex(p => p.id === id);
    
    if (index === -1) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    
    products.splice(index, 1);
    this.writeData(products);
  }
}
