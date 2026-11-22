import { ProductEntity, ProductCreateInput, ProductUpdateData } from "./product.entity";
import { ProductPriceEntity, ProductPriceInput } from "./product-price.entity";
import { QueryOptions } from "../common";

export interface ProductRepository {
    getProducts(cmp_uuid: string, options?: QueryOptions): Promise<ProductEntity[] | null>;
    getProductsAndCount(cmp_uuid: string, options?: QueryOptions): Promise<{ count: number; rows: ProductEntity[] } | null>;
    findProductById(cmp_uuid: string, prd_uuid: string, options?: QueryOptions): Promise<ProductEntity | null>;
    findProductByCode(cmp_uuid: string, prd_code: string, excludeUuid?: string | null, options?: QueryOptions): Promise<ProductEntity | null>;
    createProduct(product: ProductCreateInput, options?: QueryOptions): Promise<ProductEntity | null>;
    updateProduct(cmp_uuid: string, prd_uuid: string, product: ProductUpdateData, options?: QueryOptions): Promise<ProductEntity | null>;
    deleteProduct(cmp_uuid: string, prd_uuid: string, options?: QueryOptions): Promise<ProductEntity | null>;
    getProductPrices(cmp_uuid: string, prd_uuid: string, options?: QueryOptions): Promise<ProductPriceEntity[] | null>;
    setProductPrices(cmp_uuid: string, prd_uuid: string, prices: ProductPriceInput[], options?: QueryOptions): Promise<ProductPriceEntity[] | null>;
    updateProductStock(cmp_uuid: string, prd_uuid: string, newStock: number, options?: QueryOptions): Promise<ProductEntity | null>;
}
