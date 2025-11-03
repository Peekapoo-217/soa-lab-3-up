import { OrderStatus } from '../orders.service';

export class UpdateOrderDto {
    status?: OrderStatus;
    shippingAddress?: string;
    notes?: string;
}

