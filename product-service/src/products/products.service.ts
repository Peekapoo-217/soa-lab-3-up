import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import * as fs from 'fs';
import * as path from 'path';

interface Product {
    id: number;
    name: string;
    description?: string;
    price: number;
    stock: number;
    createdAt: Date;
    updatedAt: Date;
}

@Injectable()
export class ProductsService {
    private readonly dataPath = path.join(__dirname, '..', 'data', 'products.json');

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
