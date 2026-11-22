import { PriceTierEntity, PriceTierCreateInput, PriceTierUpdateData } from "../../../domain/price-tier/price-tier.entity";
import { PriceTierRepository } from "../../../domain/price-tier/price-tier.repository";
import { SequelizePriceTier } from "../../model/price-tier/price-tier.model";
import { QueryOptions } from "../../../domain/common";
import { Op } from "sequelize";

export class SequelizePriceTierRepository implements PriceTierRepository {
    async getPriceTiers(cmp_uuid: string, options?: QueryOptions): Promise<PriceTierEntity[] | null> {
        try {
            const whereClause: any = { cmp_uuid };
            if (options?.where) {
                Object.assign(whereClause, options.where);
            }

            const tiers = await SequelizePriceTier.findAll({
                where: whereClause,
                limit: options?.limit,
                offset: options?.offset,
                order: options?.order ?? [['prct_isdefault', 'DESC'], ['prct_code', 'ASC']],
                transaction: options?.transaction
            });

            if (!tiers) {
                return null;
            }
            return tiers.map(t => t.get({ plain: true }) as PriceTierEntity);
        } catch (error: any) {
            console.error("Error en getPriceTiers (repository):", error.message);
            throw error;
        }
    }

    async getPriceTiersAndCount(cmp_uuid: string, options?: QueryOptions): Promise<{ count: number; rows: PriceTierEntity[] } | null> {
        try {
            const whereClause: any = { cmp_uuid };
            if (options?.where) {
                Object.assign(whereClause, options.where);
            }

            const { count, rows } = await SequelizePriceTier.findAndCountAll({
                where: whereClause,
                limit: options?.limit,
                offset: options?.offset,
                order: options?.order ?? [['prct_isdefault', 'DESC'], ['prct_code', 'ASC']],
                transaction: options?.transaction
            });

            return {
                count,
                rows: rows.map(t => t.get({ plain: true }) as PriceTierEntity)
            };
        } catch (error: any) {
            console.error("Error en getPriceTiersAndCount (repository):", error.message);
            throw error;
        }
    }

    async findPriceTierById(cmp_uuid: string, prct_uuid: string, options?: QueryOptions): Promise<PriceTierEntity | null> {
        try {
            const tier = await SequelizePriceTier.findOne({
                where: {
                    cmp_uuid,
                    prct_uuid
                },
                transaction: options?.transaction
            });
            if (!tier) {
                return null;
            }
            return tier.get({ plain: true }) as PriceTierEntity;
        } catch (error: any) {
            console.error("Error en findPriceTierById (repository):", error.message);
            throw error;
        }
    }

    async findPriceTierByCode(cmp_uuid: string, prct_code: string, excludeUuid?: string | null, options?: QueryOptions): Promise<PriceTierEntity | null> {
        try {
            const whereClause: any = {
                cmp_uuid,
                prct_code: prct_code.trim().toUpperCase()
            };
            if (excludeUuid) {
                whereClause.prct_uuid = { [Op.ne]: excludeUuid };
            }

            const tier = await SequelizePriceTier.findOne({
                where: whereClause,
                transaction: options?.transaction
            });
            if (!tier) {
                return null;
            }
            return tier.get({ plain: true }) as PriceTierEntity;
        } catch (error: any) {
            console.error("Error en findPriceTierByCode (repository):", error.message);
            throw error;
        }
    }

    async findDefaultPriceTier(cmp_uuid: string, options?: QueryOptions): Promise<PriceTierEntity | null> {
        try {
            const tier = await SequelizePriceTier.findOne({
                where: {
                    cmp_uuid,
                    prct_isdefault: true
                },
                transaction: options?.transaction
            });
            if (!tier) {
                return null;
            }
            return tier.get({ plain: true }) as PriceTierEntity;
        } catch (error: any) {
            console.error("Error en findDefaultPriceTier (repository):", error.message);
            throw error;
        }
    }

    async createPriceTier(priceTier: PriceTierCreateInput, options?: QueryOptions): Promise<PriceTierEntity | null> {
        try {
            const result = await SequelizePriceTier.create(
                priceTier as any,
                { transaction: options?.transaction }
            );
            if (!result) {
                return null;
            }
            return result.get({ plain: true }) as PriceTierEntity;
        } catch (error: any) {
            console.error("Error en createPriceTier (repository):", error.message);
            throw error;
        }
    }

    async updatePriceTier(cmp_uuid: string, prct_uuid: string, priceTier: PriceTierUpdateData, options?: QueryOptions): Promise<PriceTierEntity | null> {
        try {
            const tier = await SequelizePriceTier.findOne({
                where: { cmp_uuid, prct_uuid },
                transaction: options?.transaction
            });
            if (!tier) {
                return null;
            }

            await tier.update(priceTier as any, { transaction: options?.transaction });
            return tier.get({ plain: true }) as PriceTierEntity;
        } catch (error: any) {
            console.error("Error en updatePriceTier (repository):", error.message);
            throw error;
        }
    }

    async deletePriceTier(cmp_uuid: string, prct_uuid: string, options?: QueryOptions): Promise<PriceTierEntity | null> {
        try {
            const tier = await SequelizePriceTier.findOne({
                where: { cmp_uuid, prct_uuid },
                transaction: options?.transaction
            });
            if (!tier) {
                return null;
            }

            const deleted = tier.get({ plain: true }) as PriceTierEntity;
            await tier.destroy({ transaction: options?.transaction });
            return deleted;
        } catch (error: any) {
            console.error("Error en deletePriceTier (repository):", error.message);
            throw error;
        }
    }

    async clearDefaultFlag(cmp_uuid: string, excludeUuid?: string, options?: QueryOptions): Promise<number> {
        try {
            const whereClause: any = {
                cmp_uuid,
                prct_isdefault: true
            };
            if (excludeUuid) {
                whereClause.prct_uuid = { [Op.ne]: excludeUuid };
            }

            const [affectedRows] = await SequelizePriceTier.update(
                { prct_isdefault: false } as any,
                {
                    where: whereClause,
                    transaction: options?.transaction
                }
            );
            return affectedRows;
        } catch (error: any) {
            console.error("Error en clearDefaultFlag (repository):", error.message);
            throw error;
        }
    }
}
