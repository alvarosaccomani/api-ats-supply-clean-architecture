export interface MachineEntity {
    cmp_uuid: string;
    mch_uuid: string;
    mch_name: string;
    mch_description?: string | null;
    mch_dailycapacity?: number | null;
    mch_active: boolean;
    mch_createdat: Date;
    mch_updatedat: Date;
}

export interface MachineCreateInput {
    cmp_uuid: string;
    mch_uuid?: string;
    mch_name: string;
    mch_description?: string | null;
    mch_dailycapacity?: number | null;
    mch_active?: boolean;
}

export type MachineUpdateData = Partial<Pick<MachineEntity, 
    'mch_name' | 
    'mch_description' | 
    'mch_dailycapacity' | 
    'mch_active'
>>;
