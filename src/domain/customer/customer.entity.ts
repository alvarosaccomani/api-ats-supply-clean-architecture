import { PriceTierEntity } from "../price-tier/price-tier.entity";

export interface CustomerEntity {
    cmp_uuid: string;
    cus_uuid: string;
    prct_uuid: string;
    cus_name: string;
    cus_address: string;
    cus_phone?: string | null;
    cus_contactname?: string | null;
    cus_notes?: string | null;
    cus_active: boolean;
    cus_createdat: Date;
    cus_updatedat: Date;
    priceTier?: PriceTierEntity;
}

export interface CustomerCreateInput {
    cmp_uuid: string;
    cus_uuid?: string;
    prct_uuid?: string;
    cus_name: string;
    cus_address: string;
    cus_phone?: string | null;
    cus_contactname?: string | null;
    cus_notes?: string | null;
    cus_active?: boolean;
}

export type CustomerUpdateData = Partial<Pick<CustomerEntity, 
    'prct_uuid' | 
    'cus_name' | 
    'cus_address' | 
    'cus_phone' | 
    'cus_contactname' | 
    'cus_notes' | 
    'cus_active'
>>;
