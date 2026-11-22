import { ProductEntity, ProductCreateInput, ProductUpdateData } from "../../../domain/product/product.entity";
import { ProductPriceEntity, ProductPriceInput } from "../../../domain/product/product-price.entity";
import { ProductRepository } from "../../../domain/product/product.repository";
import { SequelizeProduct } from "../../model/product/product.model";
import { SequelizeProductPrice } from "../../model/product/product-price.model";
import { SequelizePriceTier } from "../../model/price-tier/price-tier.model";
import { QueryOptions } from "../../../domain/common";
import { Op } from "sequelize";

export class SequelizeProductRepository implements ProductRepository {
    async getProducts(cmp_uuid: string, options?: QueryOptions): Promise<ProductEntity[] | null> {
        try {
            const whereClause: any = { cmp_uuid };
            if (options?.where) {
                Object.assign(whereClause, options.where);
            }

            const products = await SequelizeProduct.findAll({
                where: whereClause,
                include: [{
                    model: SequelizeProductPrice,
                    as: 'prices',
                    include: [{ model: SequelizePriceTier, as: 'priceTier' }]
                }],
                limit: options?.limit,
                offset: options?.offset,
                order: options?.order ?? [['prd_name', 'ASC']],
                transaction: options?.transaction
            });

            if (!products) {
                return null;
            }
            return products.map(p => p.get({ plain: true }) as ProductEntity);
        } catch (error: any) {
            console.error("Error en getProducts (repository):", error.message);
            throw error;
        }
    }

    async getProductsAndCount(cmp_uuid: string, options?: QueryOptions): Promise<{ count: number; rows: ProductEntity[] } | null> {
        try {
            const whereClause: any = { cmp_uuid };
            if (options?.where) {
                Object.assign(whereClause, options.where);
            }

            const { count, rows } = await SequelizeProduct.findAndCountAll({
                where: whereClause,
                include: [{
                    model: SequelizeProductPrice,
                    as: 'prices',
                    include: [{ model: SequelizePriceTier, as: 'priceTier' }]
                }],
                distinct: true,
                limit: options?.limit,
                offset: options?.offset,
                order: options?.order ?? [['prd_name', 'ASC']],
                transaction: options?.transaction
            });

            return {
                count,
                rows: rows.map(p => p.get({ plain: true }) as ProductEntity)
            };
        } catch (error: any) {
            console.error("Error en getProductsAndCount (repository):", error.message);
            throw error;
        }
    }

    async findProductById(cmp_uuid: string, prd_uuid: string, options?: QueryOptions): Promise<ProductEntity | null> {
        try {
            const product = await SequelizeProduct.findOne({
                where: { cmp_uuid, prd_uuid },
                include: [{
                    model: SequelizeProductPrice,
                    as: 'prices',
                    include: [{ model: SequelizePriceTier, as: 'priceTier' }]
                }],
                transaction: options?.transaction
            });
            if (!product) {
                return null;
            }
            return product.get({ plain: true }) as ProductEntity;
        } catch (error: any) {
            console.error("Error en findProductById (repository):", error.message);
            throw error;
        }
    }

    async findProductByCode(cmp_uuid: string, prd_code: string, excludeUuid?: string | null, options?: QueryOptions): Promise<ProductEntity | null> {
        try {
            const whereClause: any = {
                cmp_uuid,
                prd_code: prd_code.trim()
            };
            if (excludeUuid) {
                whereClause.prd_uuid = { [Op.ne]: excludeUuid };
            }

            const product = await SequelizeProduct.findOne({
                where: whereClause,
                transaction: options?.transaction
            });
            if (!product) {
                return null;
            }
            return product.get({ plain: true }) as ProductEntity;
        } catch (error: any) {
            console.error("Error en findProductByCode (repository):", error.message);
            throw error;
        }
    }

    async createProduct(product: ProductCreateInput, options?: QueryOptions): Promise<ProductEntity | null> {
        try {
            const result = await SequelizeProduct.create(product as any, { transaction: options?.transaction });
            if (!result) {
                return null;
            }
            return result.get({ plain: true }) as ProductEntity;
        } catch (error: any) {
            console.error("Error en createProduct (repository):", error.message);
            throw error;
        }
    }

    async updateProduct(cmp_uuid: string, prd_uuid: string, product: ProductUpdateData, options?: QueryOptions): Promise<ProductEntity | null> {
        try {
            const existing = await SequelizeProduct.findOne({
                where: { cmp_uuid, prd_uuid },
                transaction: options?.transaction
            });
            if (!existing) {
                return null;
            }

            await existing.update(product as any, { transaction: options?.transaction });
            return existing.get({ plain: true }) as ProductEntity;
        } catch (error: any) {
            console.error("Error en updateProduct (repository):", error.message);
            throw error;
        }
    }

    async deleteProduct(cmp_uuid: string, prd_uuid: string, options?: QueryOptions): Promise<ProductEntity | null> {
        try {
            const existing = await SequelizeProduct.findOne({
                where: { cmp_uuid, prd_uuid },
                transaction: options?.transaction
            });
            if (!existing) {
                return null;
            }

            const deleted = existing.get({ plain: true }) as ProductEntity;
            await existing.destroy({ transaction: options?.transaction });
            return deleted;
        } catch (error: any) {
            console.error("Error en deleteProduct (repository):", error.message);
            throw error;
        }
    }

    async getProductPrices(cmp_uuid: string, prd_uuid: string, options?: QueryOptions): Promise<ProductPriceEntity[] | null> {
        try {
            const prices = await SequelizeProductPrice.findAll({
                where: { cmp_uuid, prd_uuid },
                include: [{ model: SequelizePriceTier, as: 'priceTier' }],
                order: [['prdprc_price', 'ASC']],
                transaction: options?.transaction
            });
            if (!prices) {
                return null;
            }
            return prices.map(p => p.get({ plain: true }) as ProductPriceEntity);
        } catch (error: any) {
            console.error("Error en getProductPrices (repository):", error.message);
            throw error;
        }
    }

    async setProductPrices(cmp_uuid: string, prd_uuid: string, prices: ProductPriceInput[], options?: QueryOptions): Promise<ProductPriceEntity[] | null> {
        try {
            for (const priceInput of prices) {
                const existing = await SequelizeProductPrice.findOne({
                    where: {
                        cmp_uuid,
                        prd_uuid,
                        prct_uuid: priceInput.prct_uuid
                    },
                    transaction: options?.transaction
                });

                if (existing) {
                    await existing.update(
                        { prdprc_price: Number(priceInput.prdprc_price) },
                        { transaction: options?.transaction }
                    );
                } else {
                    await SequelizeProductPrice.create({
                        cmp_uuid,
                        prd_uuid,
                        prct_uuid: priceInput.prct_uuid,
                        prdprc_price: Number(priceInput.prdprc_price)
                    } as any, { transaction: options?.transaction });
                }
            }

            return this.getProductPrices(cmp_uuid, prd_uuid, options);
        } catch (error: any) {
            console.error("Error en setProductPrices (repository):", error.message);
            throw error;
        }
    }

    async updateProductStock(cmp_uuid: string, prd_uuid: string, newStock: number, options?: QueryOptions): Promise<ProductEntity | null> {
        try {
            const existing = await SequelizeProduct.findOne({
                where: { cmp_uuid, prd_uuid },
                transaction: options?.transaction
            });
            if (!existing) {
                return null;
            }

            await existing.update({ prd_currentstock: newStock }, { transaction: options?.transaction });
            return existing.get({ plain: true }) as ProductEntity;
        } catch (error: any) {
            console.error("Error en updateProductStock (repository):", error.message);
            throw error;
        }
    }
}
