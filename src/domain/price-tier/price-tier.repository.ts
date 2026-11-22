import { PriceTierEntity, PriceTierCreateInput, PriceTierUpdateData } from "./price-tier.entity";
import { QueryOptions } from "../common";

export interface PriceTierRepository {
    getPriceTiers(cmp_uuid: string, options?: QueryOptions): Promise<PriceTierEntity[] | null>;
    getPriceTiersAndCount(cmp_uuid: string, options?: QueryOptions): Promise<{ count: number; rows: PriceTierEntity[] } | null>;
    findPriceTierById(cmp_uuid: string, prct_uuid: string, options?: QueryOptions): Promise<PriceTierEntity | null>;
    findPriceTierByCode(cmp_uuid: string, prct_code: string, excludeUuid?: string | null, options?: QueryOptions): Promise<PriceTierEntity | null>;
    findDefaultPriceTier(cmp_uuid: string, options?: QueryOptions): Promise<PriceTierEntity | null>;
    createPriceTier(priceTier: PriceTierCreateInput, options?: QueryOptions): Promise<PriceTierEntity | null>;
    updatePriceTier(cmp_uuid: string, prct_uuid: string, priceTier: PriceTierUpdateData, options?: QueryOptions): Promise<PriceTierEntity | null>;
    deletePriceTier(cmp_uuid: string, prct_uuid: string, options?: QueryOptions): Promise<PriceTierEntity | null>;
    clearDefaultFlag(cmp_uuid: string, excludeUuid?: string, options?: QueryOptions): Promise<number>;
}
