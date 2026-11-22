import { OrderEntity } from "./order.entity";
import { OrderDetailEntity } from "./order-detail.entity";
import { QueryOptions } from "../common";

export interface OrderRepository {
    getOrders(cmp_uuid: string, options?: QueryOptions): Promise<OrderEntity[] | null>;
    getOrdersAndCount(cmp_uuid: string, options?: QueryOptions): Promise<{ count: number; rows: OrderEntity[] } | null>;
    findOrderById(cmp_uuid: string, ord_uuid: string, options?: QueryOptions): Promise<OrderEntity | null>;
    createOrder(order: OrderEntity, options?: QueryOptions): Promise<OrderEntity | null>;
    updateOrder(cmp_uuid: string, ord_uuid: string, order: Partial<OrderEntity>, options?: QueryOptions): Promise<OrderEntity | null>;
    deleteOrder(cmp_uuid: string, ord_uuid: string, options?: QueryOptions): Promise<OrderEntity | null>;
    replaceOrderDetails(cmp_uuid: string, ord_uuid: string, details: OrderDetailEntity[], options?: QueryOptions): Promise<void>;
}
