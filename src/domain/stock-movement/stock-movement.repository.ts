import { StockMovementEntity, StockMovementCreateInput } from "./stock-movement.entity";
import { QueryOptions } from "../common";

export interface StockMovementRepository {
    getMovements(cmp_uuid: string, options?: QueryOptions): Promise<StockMovementEntity[] | null>;
    getMovementsAndCount(cmp_uuid: string, options?: QueryOptions): Promise<{ count: number; rows: StockMovementEntity[] } | null>;
    findMovementById(cmp_uuid: string, stkm_uuid: string, options?: QueryOptions): Promise<StockMovementEntity | null>;
    createMovement(movement: StockMovementCreateInput, options?: QueryOptions): Promise<StockMovementEntity | null>;
    getLastMovementByProduct(cmp_uuid: string, prd_uuid: string, options?: QueryOptions): Promise<StockMovementEntity | null>;
    getLatestTruckMovement(cmp_uuid: string, options?: QueryOptions): Promise<StockMovementEntity | null>;
}
