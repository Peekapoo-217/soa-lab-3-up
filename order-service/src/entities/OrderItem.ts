import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Order } from './Order';

@Entity('order_items')
export class OrderItem {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    orderId!: number;

    @Column()
    productId!: number;

    @Column()
    productName!: string;

    @Column('decimal', { precision: 10, scale: 2 })
    price!: number;

    @Column()
    quantity!: number;

    @Column('decimal', { precision: 10, scale: 2 })
    subtotal!: number;

    @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'orderId' })
    order!: Order;
}


