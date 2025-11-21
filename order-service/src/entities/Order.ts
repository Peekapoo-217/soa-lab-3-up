import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { OrderItem } from './OrderItem';

export enum OrderStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    PROCESSING = 'PROCESSING',
    SHIPPED = 'SHIPPED',
    DELIVERED = 'DELIVERED',
    CANCELLED = 'CANCELLED',
}

@Entity('orders')
export class Order {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    userId!: number;

    @Column({
        type: 'enum',
        enum: OrderStatus,
        default: OrderStatus.PENDING,
    })
    status!: OrderStatus;

    @Column('decimal', { precision: 10, scale: 2 })
    totalAmount!: number;

    @Column('text', { nullable: true })
    shippingAddress?: string;

    @Column('text', { nullable: true })
    notes?: string;

    @OneToMany(() => OrderItem, (orderItem) => orderItem.order, { 
        cascade: true,
        eager: true 
    })
    items!: OrderItem[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}



