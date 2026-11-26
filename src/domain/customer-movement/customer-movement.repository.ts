import { CustomerMovementEntity, CustomerMovementCreateInput } from "./customer-movement.entity";
import { QueryOptions } from "../common";

export interface CustomerMovementRepository {
    getMovements(cmp_uuid: string, cus_uuid: string, options?: QueryOptions): Promise<CustomerMovementEntity[] | null>;
    getMovementsAndCount(cmp_uuid: string, cus_uuid: string, options?: QueryOptions): Promise<{ count: number; rows: CustomerMovementEntity[] } | null>;
    findMovementById(cmp_uuid: string, cusm_uuid: string, options?: QueryOptions): Promise<CustomerMovementEntity | null>;
    createMovement(movement: CustomerMovementCreateInput, options?: QueryOptions): Promise<CustomerMovementEntity | null>;
    getLastMovementByCustomer(cmp_uuid: string, cus_uuid: string, options?: QueryOptions): Promise<CustomerMovementEntity | null>;
}
