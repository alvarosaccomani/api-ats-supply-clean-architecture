import { ProductBomEntity, ProductBomCreateInput, ProductBomUpdateData, RecipeItemInput } from "./product-bom.entity";
import { QueryOptions } from "../common";

export interface ProductBomRepository {
    getBomByFinishedProduct(cmp_uuid: string, prd_uuid_finished: string, options?: QueryOptions): Promise<ProductBomEntity[] | null>;
    getBomAndCount(cmp_uuid: string, options?: QueryOptions): Promise<{ count: number; rows: ProductBomEntity[] } | null>;
    findBomItemById(cmp_uuid: string, prdbom_uuid: string, options?: QueryOptions): Promise<ProductBomEntity | null>;
    findBomItem(cmp_uuid: string, prd_uuid_finished: string, prd_uuid_supply: string, options?: QueryOptions): Promise<ProductBomEntity | null>;
    createBomItem(item: ProductBomCreateInput, options?: QueryOptions): Promise<ProductBomEntity | null>;
    updateBomItem(cmp_uuid: string, prdbom_uuid: string, data: ProductBomUpdateData, options?: QueryOptions): Promise<ProductBomEntity | null>;
    deleteBomItem(cmp_uuid: string, prdbom_uuid: string, options?: QueryOptions): Promise<ProductBomEntity | null>;
    deleteBomByFinishedProduct(cmp_uuid: string, prd_uuid_finished: string, options?: QueryOptions): Promise<number>;
    setRecipeItems(cmp_uuid: string, prd_uuid_finished: string, items: RecipeItemInput[], options?: QueryOptions): Promise<ProductBomEntity[] | null>;
}
