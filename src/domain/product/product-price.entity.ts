import { PriceTierEntity } from "../price-tier/price-tier.entity";

export interface ProductPriceEntity {
    cmp_uuid: string;
    prd_uuid: string;
    prct_uuid: string;
    prdprc_price: number;
    prdprc_createdat: Date;
    prdprc_updatedat: Date;
    priceTier?: PriceTierEntity;
}

export interface ProductPriceInput {
    cmp_uuid?: string;
    prd_uuid?: string;
    prct_uuid: string;
    prdprc_price: number;
}
