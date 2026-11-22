import { ProductRepository } from "../../domain/product/product.repository";
import { ProductValue } from "../../domain/product/product.value";
import { ProductEntity, ProductCreateInput, ProductUpdateData } from "../../domain/product/product.entity";
import { ProductPriceInput, ProductPriceEntity } from "../../domain/product/product-price.entity";
import { QueryOptions } from "../../domain/common";
import { TimezoneConverter } from "../../infrastructure/utils/TimezoneConverter";

export class ProductUseCase {
    constructor(
        private readonly productRepository: ProductRepository
    ) {
        this.getProducts = this.getProducts.bind(this);
        this.getProductsAndCount = this.getProductsAndCount.bind(this);
        this.getDetailProduct = this.getDetailProduct.bind(this);
        this.createProduct = this.createProduct.bind(this);
        this.updateProduct = this.updateProduct.bind(this);
        this.deleteProduct = this.deleteProduct.bind(this);
        this.getProductPrices = this.getProductPrices.bind(this);
        this.setProductPrices = this.setProductPrices.bind(this);
    }

    private formatProduct(product: ProductEntity & { prices?: ProductPriceEntity[] }) {
        return {
            cmp_uuid: product.cmp_uuid,
            prd_uuid: product.prd_uuid,
            prd_code: product.prd_code ?? null,
            prd_name: product.prd_name,
            prd_type: product.prd_type,
            prd_unitlabel: product.prd_unitlabel,
            prd_weightorvolume: product.prd_weightorvolume !== null && product.prd_weightorvolume !== undefined 
                ? Number(product.prd_weightorvolume) 
                : null,
            prd_currentstock: Number(product.prd_currentstock) || 0,
            prd_minstockalert: Number(product.prd_minstockalert) || 0,
            prd_is_low_stock: (Number(product.prd_currentstock) || 0) <= (Number(product.prd_minstockalert) || 0),
            prd_active: Boolean(product.prd_active),
            prd_createdat: TimezoneConverter.toIsoStringInTimezone(product.prd_createdat, 'America/Buenos_Aires'),
            prd_updatedat: TimezoneConverter.toIsoStringInTimezone(product.prd_updatedat, 'America/Buenos_Aires'),
            prices: product.prices ? product.prices.map(p => this.formatPrice(p)) : undefined
        };
    }

    private formatPrice(price: ProductPriceEntity) {
        return {
            cmp_uuid: price.cmp_uuid,
            prd_uuid: price.prd_uuid,
            prct_uuid: price.prct_uuid,
            prdprc_price: Number(price.prdprc_price),
            prdprc_createdat: TimezoneConverter.toIsoStringInTimezone(price.prdprc_createdat, 'America/Buenos_Aires'),
            prdprc_updatedat: TimezoneConverter.toIsoStringInTimezone(price.prdprc_updatedat, 'America/Buenos_Aires'),
            priceTier: price.priceTier
        };
    }

    public async getProducts(cmp_uuid: string, options?: QueryOptions) {
        try {
            if (!cmp_uuid) {
                throw new Error("Debe proporcionar un identificador de empresa válido.");
            }
            const products = await this.productRepository.getProducts(cmp_uuid, options);
            if (!products) {
                return [];
            }
            return products.map(p => this.formatProduct(p));
        } catch (error: any) {
            console.error("Error en getProducts (use case):", error.message);
            throw error;
        }
    }

    public async getProductsAndCount(cmp_uuid: string, options?: QueryOptions) {
        try {
            if (!cmp_uuid) {
                throw new Error("Debe proporcionar un identificador de empresa válido.");
            }
            const result = await this.productRepository.getProductsAndCount(cmp_uuid, options);
            if (!result) {
                return { count: 0, rows: [] };
            }
            return {
                count: result.count,
                rows: result.rows.map(p => this.formatProduct(p))
            };
        } catch (error: any) {
            console.error("Error en getProductsAndCount (use case):", error.message);
            throw error;
        }
    }

    public async getDetailProduct(cmp_uuid: string, prd_uuid: string, options?: QueryOptions) {
        try {
            if (!cmp_uuid || !prd_uuid) {
                throw new Error("Debe proporcionar cmp_uuid y prd_uuid válidos.");
            }
            const product = await this.productRepository.findProductById(cmp_uuid, prd_uuid, options);
            if (!product) {
                throw new Error(`No se encontró el producto con ID: ${prd_uuid}`);
            }
            const prices = await this.productRepository.getProductPrices(cmp_uuid, prd_uuid, options);
            return this.formatProduct({ ...product, prices: prices ?? [] });
        } catch (error: any) {
            console.error("Error en getDetailProduct (use case):", error.message);
            throw error;
        }
    }

    public async createProduct(input: ProductCreateInput & { prices?: ProductPriceInput[] }, options?: QueryOptions) {
        try {
            if (!input.cmp_uuid) {
                throw new Error("Debe proporcionar el identificador de la empresa (cmp_uuid).");
            }
            if (!input.prd_name || input.prd_name.trim() === '') {
                throw new Error("El nombre del producto es obligatorio.");
            }

            if (input.prd_code && input.prd_code.trim() !== '') {
                const existingCode = await this.productRepository.findProductByCode(input.cmp_uuid, input.prd_code.trim(), null, options);
                if (existingCode) {
                    throw new Error(`Ya existe un producto con el código '${input.prd_code.trim()}' en esta empresa.`);
                }
            }

            const productValue = new ProductValue(input);
            const created = await this.productRepository.createProduct(productValue, options);
            if (!created) {
                throw new Error("No se pudo crear el producto.");
            }

            let createdPrices: ProductPriceEntity[] = [];
            if (input.prices && Array.isArray(input.prices) && input.prices.length > 0) {
                const pricesResult = await this.productRepository.setProductPrices(
                    created.cmp_uuid,
                    created.prd_uuid,
                    input.prices,
                    options
                );
                createdPrices = pricesResult ?? [];
            }

            return this.formatProduct({ ...created, prices: createdPrices });
        } catch (error: any) {
            console.error("Error en createProduct (use case):", error.message);
            throw error;
        }
    }

    public async updateProduct(cmp_uuid: string, prd_uuid: string, data: ProductUpdateData & { prices?: ProductPriceInput[] }, options?: QueryOptions) {
        try {
            if (!cmp_uuid || !prd_uuid) {
                throw new Error("Debe proporcionar cmp_uuid y prd_uuid válidos.");
            }

            const existing = await this.productRepository.findProductById(cmp_uuid, prd_uuid, options);
            if (!existing) {
                throw new Error(`No existe el producto con ID: ${prd_uuid}`);
            }

            if (data.prd_code && data.prd_code.trim() !== '') {
                const conflict = await this.productRepository.findProductByCode(cmp_uuid, data.prd_code.trim(), prd_uuid, options);
                if (conflict) {
                    throw new Error(`El código '${data.prd_code.trim()}' ya pertenece a otro producto.`);
                }
            }

            const updated = await this.productRepository.updateProduct(cmp_uuid, prd_uuid, data, options);
            if (!updated) {
                throw new Error("No se pudo actualizar el producto.");
            }

            let updatedPrices: ProductPriceEntity[] = [];
            if (data.prices && Array.isArray(data.prices)) {
                const pricesResult = await this.productRepository.setProductPrices(cmp_uuid, prd_uuid, data.prices, options);
                updatedPrices = pricesResult ?? [];
            } else {
                const currentPrices = await this.productRepository.getProductPrices(cmp_uuid, prd_uuid, options);
                updatedPrices = currentPrices ?? [];
            }

            return this.formatProduct({ ...updated, prices: updatedPrices });
        } catch (error: any) {
            console.error("Error en updateProduct (use case):", error.message);
            throw error;
        }
    }

    public async deleteProduct(cmp_uuid: string, prd_uuid: string, options?: QueryOptions) {
        try {
            if (!cmp_uuid || !prd_uuid) {
                throw new Error("Debe proporcionar cmp_uuid y prd_uuid válidos.");
            }

            const existing = await this.productRepository.findProductById(cmp_uuid, prd_uuid, options);
            if (!existing) {
                throw new Error(`No existe el producto con ID: ${prd_uuid}`);
            }

            const deleted = await this.productRepository.deleteProduct(cmp_uuid, prd_uuid, options);
            if (!deleted) {
                throw new Error("No se pudo eliminar el producto.");
            }
            return this.formatProduct(deleted);
        } catch (error: any) {
            console.error("Error en deleteProduct (use case):", error.message);
            throw error;
        }
    }

    public async getProductPrices(cmp_uuid: string, prd_uuid: string, options?: QueryOptions) {
        try {
            if (!cmp_uuid || !prd_uuid) {
                throw new Error("Debe proporcionar cmp_uuid y prd_uuid válidos.");
            }
            const prices = await this.productRepository.getProductPrices(cmp_uuid, prd_uuid, options);
            if (!prices) {
                return [];
            }
            return prices.map(p => this.formatPrice(p));
        } catch (error: any) {
            console.error("Error en getProductPrices (use case):", error.message);
            throw error;
        }
    }

    public async setProductPrices(cmp_uuid: string, prd_uuid: string, prices: ProductPriceInput[], options?: QueryOptions) {
        try {
            if (!cmp_uuid || !prd_uuid) {
                throw new Error("Debe proporcionar cmp_uuid y prd_uuid válidos.");
            }
            const updated = await this.productRepository.setProductPrices(cmp_uuid, prd_uuid, prices, options);
            if (!updated) {
                return [];
            }
            return updated.map(p => this.formatPrice(p));
        } catch (error: any) {
            console.error("Error en setProductPrices (use case):", error.message);
            throw error;
        }
    }
}
