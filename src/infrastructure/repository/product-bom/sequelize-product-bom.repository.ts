import { ProductBomEntity, ProductBomCreateInput, ProductBomUpdateData, RecipeItemInput } from "../../../domain/product-bom/product-bom.entity";
import { ProductBomRepository } from "../../../domain/product-bom/product-bom.repository";
import { SequelizeProductBom } from "../../model/product-bom/product-bom.model";
import { SequelizeProduct } from "../../model/product/product.model";
import { ProductBomValue } from "../../../domain/product-bom/product-bom.value";
import { QueryOptions } from "../../../domain/common";

export class SequelizeProductBomRepository implements ProductBomRepository {
    async getBomByFinishedProduct(cmp_uuid: string, prd_uuid_finished: string, options?: QueryOptions): Promise<ProductBomEntity[] | null> {
        try {
            const items = await SequelizeProductBom.findAll({
                where: { cmp_uuid, prd_uuid_finished },
                include: [
                    { model: SequelizeProduct, as: 'finishedProduct' },
                    { model: SequelizeProduct, as: 'supplyProduct' }
                ],
                order: [['prdbom_createdat', 'ASC']],
                transaction: options?.transaction
            });

            if (!items) {
                return null;
            }
            return items.map(i => i.get({ plain: true }) as ProductBomEntity);
        } catch (error: any) {
            console.error("Error en getBomByFinishedProduct (repository):", error.message);
            throw error;
        }
    }

    async getBomAndCount(cmp_uuid: string, options?: QueryOptions): Promise<{ count: number; rows: ProductBomEntity[] } | null> {
        try {
            const whereClause: any = { cmp_uuid };
            if (options?.where) {
                Object.assign(whereClause, options.where);
            }

            const { count, rows } = await SequelizeProductBom.findAndCountAll({
                where: whereClause,
                include: [
                    { model: SequelizeProduct, as: 'finishedProduct' },
                    { model: SequelizeProduct, as: 'supplyProduct' }
                ],
                distinct: true,
                limit: options?.limit,
                offset: options?.offset,
                order: options?.order ?? [['prdbom_createdat', 'DESC']],
                transaction: options?.transaction
            });

            return {
                count,
                rows: rows.map(i => i.get({ plain: true }) as ProductBomEntity)
            };
        } catch (error: any) {
            console.error("Error en getBomAndCount (repository):", error.message);
            throw error;
        }
    }

    async findBomItemById(cmp_uuid: string, prdbom_uuid: string, options?: QueryOptions): Promise<ProductBomEntity | null> {
        try {
            const item = await SequelizeProductBom.findOne({
                where: { cmp_uuid, prdbom_uuid },
                include: [
                    { model: SequelizeProduct, as: 'finishedProduct' },
                    { model: SequelizeProduct, as: 'supplyProduct' }
                ],
                transaction: options?.transaction
            });
            if (!item) {
                return null;
            }
            return item.get({ plain: true }) as ProductBomEntity;
        } catch (error: any) {
            console.error("Error en findBomItemById (repository):", error.message);
            throw error;
        }
    }

    async findBomItem(cmp_uuid: string, prd_uuid_finished: string, prd_uuid_supply: string, options?: QueryOptions): Promise<ProductBomEntity | null> {
        try {
            const item = await SequelizeProductBom.findOne({
                where: { cmp_uuid, prd_uuid_finished, prd_uuid_supply },
                transaction: options?.transaction
            });
            if (!item) {
                return null;
            }
            return item.get({ plain: true }) as ProductBomEntity;
        } catch (error: any) {
            console.error("Error en findBomItem (repository):", error.message);
            throw error;
        }
    }

    async createBomItem(item: ProductBomCreateInput, options?: QueryOptions): Promise<ProductBomEntity | null> {
        try {
            const result = await SequelizeProductBom.create(item as any, { transaction: options?.transaction });
            if (!result) {
                return null;
            }
            return this.findBomItemById(result.cmp_uuid, result.prdbom_uuid, options);
        } catch (error: any) {
            console.error("Error en createBomItem (repository):", error.message);
            throw error;
        }
    }

    async updateBomItem(cmp_uuid: string, prdbom_uuid: string, data: ProductBomUpdateData, options?: QueryOptions): Promise<ProductBomEntity | null> {
        try {
            const existing = await SequelizeProductBom.findOne({
                where: { cmp_uuid, prdbom_uuid },
                transaction: options?.transaction
            });
            if (!existing) {
                return null;
            }

            await existing.update(data as any, { transaction: options?.transaction });
            return this.findBomItemById(cmp_uuid, prdbom_uuid, options);
        } catch (error: any) {
            console.error("Error en updateBomItem (repository):", error.message);
            throw error;
        }
    }

    async deleteBomItem(cmp_uuid: string, prdbom_uuid: string, options?: QueryOptions): Promise<ProductBomEntity | null> {
        try {
            const existing = await this.findBomItemById(cmp_uuid, prdbom_uuid, options);
            if (!existing) {
                return null;
            }

            await SequelizeProductBom.destroy({
                where: { cmp_uuid, prdbom_uuid },
                transaction: options?.transaction
            });
            return existing;
        } catch (error: any) {
            console.error("Error en deleteBomItem (repository):", error.message);
            throw error;
        }
    }

    async deleteBomByFinishedProduct(cmp_uuid: string, prd_uuid_finished: string, options?: QueryOptions): Promise<number> {
        try {
            const affectedRows = await SequelizeProductBom.destroy({
                where: { cmp_uuid, prd_uuid_finished },
                transaction: options?.transaction
            });
            return affectedRows;
        } catch (error: any) {
            console.error("Error en deleteBomByFinishedProduct (repository):", error.message);
            throw error;
        }
    }

    async setRecipeItems(cmp_uuid: string, prd_uuid_finished: string, items: RecipeItemInput[], options?: QueryOptions): Promise<ProductBomEntity[] | null> {
        try {
            // Eliminar fórmula previa
            await SequelizeProductBom.destroy({
                where: { cmp_uuid, prd_uuid_finished },
                transaction: options?.transaction
            });

            // Insertar nuevos ítems
            for (const item of items) {
                const bomValue = new ProductBomValue({
                    cmp_uuid,
                    prd_uuid_finished,
                    prd_uuid_supply: item.prd_uuid_supply,
                    prdbom_quantityperunit: item.prdbom_quantityperunit
                });

                await SequelizeProductBom.create(bomValue as any, { transaction: options?.transaction });
            }

            return this.getBomByFinishedProduct(cmp_uuid, prd_uuid_finished, options);
        } catch (error: any) {
            console.error("Error en setRecipeItems (repository):", error.message);
            throw error;
        }
    }
}
