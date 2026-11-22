import { ProductEntity } from "../product/product.entity";
import { UserEntity } from "../user/user.entity";

export type StockMovementType = 
    | 'PRODUCTION_IN' 
    | 'BOM_CONSUMPTION' 
    | 'WASTE' 
    | 'MANUAL_IN' 
    | 'ORDER_OUT' 
    | 'ORDER_CANCEL_IN' 
    | 'ADJUSTMENT';

export interface StockMovementEntity {
    cmp_uuid: string;
    stkm_uuid: string;
    prd_uuid: string;
    usr_uuid: string;
    stkm_type: StockMovementType;
    stkm_quantity: number;
    stkm_previousstock: number;
    stkm_newstock: number;
    stkm_referenceuuid?: string | null;
    stkm_notes?: string | null;
    stkm_createdat: Date;
    stkm_updatedat: Date;
    product?: ProductEntity;
    user?: UserEntity;
}

export interface StockMovementCreateInput {
    cmp_uuid: string;
    stkm_uuid?: string;
    prd_uuid: string;
    usr_uuid: string;
    stkm_type: StockMovementType;
    stkm_quantity: number;
    stkm_previousstock: number;
    stkm_newstock?: number;
    stkm_referenceuuid?: string | null;
    stkm_notes?: string | null;
}
