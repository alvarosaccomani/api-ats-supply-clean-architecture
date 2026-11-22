import { ProductEntity } from "../product/product.entity";

export interface ProductBomEntity {
    cmp_uuid: string;
    prdbom_uuid: string;
    prd_uuid_finished: string;
    prd_uuid_supply: string;
    prdbom_quantityperunit: number;
    prdbom_createdat: Date;
    prdbom_updatedat: Date;
    finishedProduct?: ProductEntity;
    supplyProduct?: ProductEntity;
}

export interface ProductBomCreateInput {
    cmp_uuid: string;
    prdbom_uuid?: string;
    prd_uuid_finished: string;
    prd_uuid_supply: string;
    prdbom_quantityperunit: number;
}

export type ProductBomUpdateData = Partial<Pick<ProductBomEntity, 'prdbom_quantityperunit'>>;

export interface RecipeItemInput {
    prd_uuid_supply: string;
    prdbom_quantityperunit: number;
}
