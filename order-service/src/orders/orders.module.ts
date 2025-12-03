import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { WorkflowController } from './workflow.controller';

@Module({
    imports: [
        HttpModule,
    ],
    controllers: [OrdersController, WorkflowController],
    providers: [OrdersService],
    exports: [OrdersService],
})
export class OrdersModule { }

