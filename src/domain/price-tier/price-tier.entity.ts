export interface PriceTierEntity {
    cmp_uuid: string;
    prct_uuid: string;
    prct_code: string;
    prct_name: string;
    prct_description?: string | null;
    prct_isdefault: boolean;
    prct_active: boolean;
    prct_createdat: Date;
    prct_updatedat: Date;
}

export interface PriceTierCreateInput {
    cmp_uuid: string;
    prct_uuid?: string;
    prct_code: string;
    prct_name: string;
    prct_description?: string | null;
    prct_isdefault?: boolean;
    prct_active?: boolean;
}

export type PriceTierUpdateData = Partial<Pick<PriceTierEntity, 'prct_code' | 'prct_name' | 'prct_description' | 'prct_isdefault' | 'prct_active'>>;
