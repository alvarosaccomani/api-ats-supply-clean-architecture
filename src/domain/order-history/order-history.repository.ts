import { OrderHistoryEntity } from "./order-history.entity";
import { QueryOptions } from "../common";

export interface OrderHistoryRepository {
    getHistoryByOrder(cmp_uuid: string, ord_uuid: string, options?: QueryOptions): Promise<OrderHistoryEntity[]>;
    createHistoryEntry(history: OrderHistoryEntity, options?: QueryOptions): Promise<OrderHistoryEntity>;
}
