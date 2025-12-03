import { OrderStatus } from '../Order';

export class UpdateOrderDto {
    status?: OrderStatus;
    shippingAddress?: string;
    notes?: string;
}



