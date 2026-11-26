import { ProductPriceEntity } from "./product-price.entity";

export type ProductType = 'FINISHED' | 'SUPPLY';

export interface ProductEntity {
    cmp_uuid: string;
    prd_uuid: string;
    prd_code?: string | null;
    prd_name: string;
    prd_type: ProductType;
    prd_unitlabel: string;
    prd_weightorvolume?: number | null;
    prd_currentstock: number;
    prd_minstockalert: number;
    prd_active: boolean;
    prd_createdat: Date;
    prd_updatedat: Date;
    prices?: ProductPriceEntity[];
}

export interface ProductCreateInput {
    cmp_uuid: string;
    prd_uuid?: string;
    prd_code?: string | null;
    prd_name: string;
    prd_type?: ProductType;
    prd_unitlabel?: string;
    prd_weightorvolume?: number | null;
    prd_currentstock?: number;
    prd_minstockalert?: number;
    prd_active?: boolean;
}

export type ProductUpdateData = Partial<Pick<ProductEntity, 
    'prd_code' | 
    'prd_name' | 
    'prd_type' | 
    'prd_unitlabel' | 
    'prd_weightorvolume' | 
    'prd_currentstock' | 
    'prd_minstockalert' | 
    'prd_active'
>>;
