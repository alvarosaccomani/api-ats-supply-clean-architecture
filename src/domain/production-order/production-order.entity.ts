import { ProductEntity } from "../product/product.entity";
import { MachineEntity } from "../machine/machine.entity";
import { UserEntity } from "../user/user.entity";

export type ProductionOrderStatus = 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface ProductionOrderEntity {
    cmp_uuid: string;
    prdord_uuid: string;
    mch_uuid?: string | null;
    prd_uuid: string;
    usr_uuid: string;
    prdord_producedqty: number;
    prdord_wasteqty: number;
    prdord_status: ProductionOrderStatus;
    prdord_productiondate: Date;
    prdord_notes?: string | null;
    prdord_createdat: Date;
    prdord_updatedat: Date;
    product?: ProductEntity;
    machine?: MachineEntity;
    user?: UserEntity;
}

export interface ProductionOrderCreateInput {
    cmp_uuid: string;
    prdord_uuid?: string;
    mch_uuid?: string | null;
    prd_uuid: string;
    usr_uuid: string;
    prdord_producedqty: number;
    prdord_wasteqty?: number;
    prdord_status?: ProductionOrderStatus;
    prdord_productiondate?: Date;
    prdord_notes?: string | null;
}

export type ProductionOrderUpdateData = Partial<Pick<ProductionOrderEntity, 
    'mch_uuid' | 
    'prdord_producedqty' | 
    'prdord_wasteqty' | 
    'prdord_status' | 
    'prdord_productiondate' | 
    'prdord_notes'
>>;
