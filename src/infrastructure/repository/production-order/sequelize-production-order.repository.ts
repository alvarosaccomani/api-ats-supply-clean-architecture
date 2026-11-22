import { ProductionOrderEntity, ProductionOrderCreateInput, ProductionOrderUpdateData } from "../../../domain/production-order/production-order.entity";
import { ProductionOrderRepository } from "../../../domain/production-order/production-order.repository";
import { SequelizeProductionOrder } from "../../model/production-order/production-order.model";
import { SequelizeProduct } from "../../model/product/product.model";
import { SequelizeMachine } from "../../model/machine/machine.model";
import { SequelizeUser } from "../../model/user/user.model";
import { QueryOptions } from "../../../domain/common";

export class SequelizeProductionOrderRepository implements ProductionOrderRepository {
    async getProductionOrders(cmp_uuid: string, options?: QueryOptions): Promise<ProductionOrderEntity[] | null> {
        try {
            const whereClause: any = { cmp_uuid };
            if (options?.where) {
                Object.assign(whereClause, options.where);
            }

            const orders = await SequelizeProductionOrder.findAll({
                where: whereClause,
                include: [
                    { model: SequelizeProduct, as: 'product' },
                    { model: SequelizeMachine, as: 'machine' },
                    { model: SequelizeUser, as: 'user', attributes: ['usr_uuid', 'usr_nick', 'usr_name', 'usr_surname'] }
                ],
                limit: options?.limit,
                offset: options?.offset,
                order: options?.order ?? [['prdord_productiondate', 'DESC']],
                transaction: options?.transaction
            });

            if (!orders) {
                return null;
            }
            return orders.map(o => o.get({ plain: true }) as ProductionOrderEntity);
        } catch (error: any) {
            console.error("Error en getProductionOrders (repository):", error.message);
            throw error;
        }
    }

    async getProductionOrdersAndCount(cmp_uuid: string, options?: QueryOptions): Promise<{ count: number; rows: ProductionOrderEntity[] } | null> {
        try {
            const whereClause: any = { cmp_uuid };
            if (options?.where) {
                Object.assign(whereClause, options.where);
            }

            const { count, rows } = await SequelizeProductionOrder.findAndCountAll({
                where: whereClause,
                include: [
                    { model: SequelizeProduct, as: 'product' },
                    { model: SequelizeMachine, as: 'machine' },
                    { model: SequelizeUser, as: 'user', attributes: ['usr_uuid', 'usr_nick', 'usr_name', 'usr_surname'] }
                ],
                distinct: true,
                limit: options?.limit,
                offset: options?.offset,
                order: options?.order ?? [['prdord_productiondate', 'DESC']],
                transaction: options?.transaction
            });

            return {
                count,
                rows: rows.map(o => o.get({ plain: true }) as ProductionOrderEntity)
            };
        } catch (error: any) {
            console.error("Error en getProductionOrdersAndCount (repository):", error.message);
            throw error;
        }
    }

    async findProductionOrderById(cmp_uuid: string, prdord_uuid: string, options?: QueryOptions): Promise<ProductionOrderEntity | null> {
        try {
            const order = await SequelizeProductionOrder.findOne({
                where: { cmp_uuid, prdord_uuid },
                include: [
                    { model: SequelizeProduct, as: 'product' },
                    { model: SequelizeMachine, as: 'machine' },
                    { model: SequelizeUser, as: 'user', attributes: ['usr_uuid', 'usr_nick', 'usr_name', 'usr_surname'] }
                ],
                transaction: options?.transaction
            });
            if (!order) {
                return null;
            }
            return order.get({ plain: true }) as ProductionOrderEntity;
        } catch (error: any) {
            console.error("Error en findProductionOrderById (repository):", error.message);
            throw error;
        }
    }

    async createProductionOrder(order: ProductionOrderCreateInput, options?: QueryOptions): Promise<ProductionOrderEntity | null> {
        try {
            const result = await SequelizeProductionOrder.create(order as any, { transaction: options?.transaction });
            if (!result) {
                return null;
            }
            return this.findProductionOrderById(result.cmp_uuid, result.prdord_uuid, options);
        } catch (error: any) {
            console.error("Error en createProductionOrder (repository):", error.message);
            throw error;
        }
    }

    async updateProductionOrder(cmp_uuid: string, prdord_uuid: string, data: ProductionOrderUpdateData, options?: QueryOptions): Promise<ProductionOrderEntity | null> {
        try {
            const existing = await SequelizeProductionOrder.findOne({
                where: { cmp_uuid, prdord_uuid },
                transaction: options?.transaction
            });
            if (!existing) {
                return null;
            }

            await existing.update(data as any, { transaction: options?.transaction });
            return this.findProductionOrderById(cmp_uuid, prdord_uuid, options);
        } catch (error: any) {
            console.error("Error en updateProductionOrder (repository):", error.message);
            throw error;
        }
    }

    async deleteProductionOrder(cmp_uuid: string, prdord_uuid: string, options?: QueryOptions): Promise<ProductionOrderEntity | null> {
        try {
            const existing = await this.findProductionOrderById(cmp_uuid, prdord_uuid, options);
            if (!existing) {
                return null;
            }

            await SequelizeProductionOrder.destroy({
                where: { cmp_uuid, prdord_uuid },
                transaction: options?.transaction
            });
            return existing;
        } catch (error: any) {
            console.error("Error en deleteProductionOrder (repository):", error.message);
            throw error;
        }
    }
}
