import { Injectable, NotFoundException } from '@nestjs/common';

export interface Product {
    id: number;
    name: string;
    price: number;
}

@Injectable()
export class ProductsService {
    private list: Product[] = [{ id: 1, name: 'Product A', price: 100 }, { id: 2, name: 'Product B', price: 150 }];

    findAll(): Product[] {
        return this.list;
    }

    findOne(id: number): Product {
        const product = this.list.find((p) => p.id === id);
        if (!product) {
            throw new NotFoundException(`Product with id ${id} not found`);
        }
        return product;
    }
}
