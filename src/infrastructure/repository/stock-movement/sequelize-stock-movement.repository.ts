import { StockMovementEntity, StockMovementCreateInput } from "../../../domain/stock-movement/stock-movement.entity";
import { StockMovementRepository } from "../../../domain/stock-movement/stock-movement.repository";
import { SequelizeStockMovement } from "../../model/stock-movement/stock-movement.model";
import { SequelizeProduct } from "../../model/product/product.model";
import { SequelizeUser } from "../../model/user/user.model";
import { QueryOptions } from "../../../domain/common";

export class SequelizeStockMovementRepository implements StockMovementRepository {
    async getMovements(cmp_uuid: string, options?: QueryOptions): Promise<StockMovementEntity[] | null> {
        try {
            const whereClause: any = { cmp_uuid };
            if (options?.where) {
                Object.assign(whereClause, options.where);
            }

            const movements = await SequelizeStockMovement.findAll({
                where: whereClause,
                include: [
                    { model: SequelizeProduct, as: 'product' },
                    { model: SequelizeUser, as: 'user', attributes: ['usr_uuid', 'usr_nick', 'usr_name', 'usr_surname'] }
                ],
                limit: options?.limit,
                offset: options?.offset,
                order: options?.order ?? [['stkm_createdat', 'DESC']],
                transaction: options?.transaction
            });

            if (!movements) {
                return null;
            }
            return movements.map(m => m.get({ plain: true }) as StockMovementEntity);
        } catch (error: any) {
            console.error("Error en getMovements (repository):", error.message);
            throw error;
        }
    }

    async getMovementsAndCount(cmp_uuid: string, options?: QueryOptions): Promise<{ count: number; rows: StockMovementEntity[] } | null> {
        try {
            const whereClause: any = { cmp_uuid };
            if (options?.where) {
                Object.assign(whereClause, options.where);
            }

            const { count, rows } = await SequelizeStockMovement.findAndCountAll({
                where: whereClause,
                include: [
                    { model: SequelizeProduct, as: 'product' },
                    { model: SequelizeUser, as: 'user', attributes: ['usr_uuid', 'usr_nick', 'usr_name', 'usr_surname'] }
                ],
                distinct: true,
                limit: options?.limit,
                offset: options?.offset,
                order: options?.order ?? [['stkm_createdat', 'DESC']],
                transaction: options?.transaction
            });

            return {
                count,
                rows: rows.map(m => m.get({ plain: true }) as StockMovementEntity)
            };
        } catch (error: any) {
            console.error("Error en getMovementsAndCount (repository):", error.message);
            throw error;
        }
    }

    async findMovementById(cmp_uuid: string, stkm_uuid: string, options?: QueryOptions): Promise<StockMovementEntity | null> {
        try {
            const movement = await SequelizeStockMovement.findOne({
                where: { cmp_uuid, stkm_uuid },
                include: [
                    { model: SequelizeProduct, as: 'product' },
                    { model: SequelizeUser, as: 'user', attributes: ['usr_uuid', 'usr_nick', 'usr_name', 'usr_surname'] }
                ],
                transaction: options?.transaction
            });
            if (!movement) {
                return null;
            }
            return movement.get({ plain: true }) as StockMovementEntity;
        } catch (error: any) {
            console.error("Error en findMovementById (repository):", error.message);
            throw error;
        }
    }

    async createMovement(movement: StockMovementCreateInput, options?: QueryOptions): Promise<StockMovementEntity | null> {
        try {
            const result = await SequelizeStockMovement.create(movement as any, { transaction: options?.transaction });
            if (!result) {
                return null;
            }
            return result.get({ plain: true }) as StockMovementEntity;
        } catch (error: any) {
            console.error("Error en createMovement (repository):", error.message);
            throw error;
        }
    }

    async getLastMovementByProduct(cmp_uuid: string, prd_uuid: string, options?: QueryOptions): Promise<StockMovementEntity | null> {
        try {
            const movement = await SequelizeStockMovement.findOne({
                where: { cmp_uuid, prd_uuid },
                order: [['stkm_createdat', 'DESC']],
                transaction: options?.transaction
            });
            if (!movement) {
                return null;
            }
            return movement.get({ plain: true }) as StockMovementEntity;
        } catch (error: any) {
            console.error("Error en getLastMovementByProduct (repository):", error.message);
            throw error;
        }
    }
}
