import { ProductionOrderEntity, ProductionOrderCreateInput, ProductionOrderUpdateData } from "./production-order.entity";
import { QueryOptions } from "../common";

export interface ProductionOrderRepository {
    getProductionOrders(cmp_uuid: string, options?: QueryOptions): Promise<ProductionOrderEntity[] | null>;
    getProductionOrdersAndCount(cmp_uuid: string, options?: QueryOptions): Promise<{ count: number; rows: ProductionOrderEntity[] } | null>;
    findProductionOrderById(cmp_uuid: string, prdord_uuid: string, options?: QueryOptions): Promise<ProductionOrderEntity | null>;
    createProductionOrder(order: ProductionOrderCreateInput, options?: QueryOptions): Promise<ProductionOrderEntity | null>;
    updateProductionOrder(cmp_uuid: string, prdord_uuid: string, data: ProductionOrderUpdateData, options?: QueryOptions): Promise<ProductionOrderEntity | null>;
    deleteProductionOrder(cmp_uuid: string, prdord_uuid: string, options?: QueryOptions): Promise<ProductionOrderEntity | null>;
}
