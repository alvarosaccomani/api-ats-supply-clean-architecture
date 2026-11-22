import { OrderEntity } from "../../../domain/order/order.entity";
import { OrderDetailEntity } from "../../../domain/order/order-detail.entity";
import { OrderRepository } from "../../../domain/order/order.repository";
import { SequelizeOrder } from "../../model/order/order.model";
import { SequelizeOrderDetail } from "../../model/order/order-detail.model";
import { SequelizeCustomer } from "../../model/customer/customer.model";
import { SequelizeUser } from "../../model/user/user.model";
import { SequelizeProduct } from "../../model/product/product.model";
import { QueryOptions } from "../../../domain/common";

export class SequelizeOrderRepository implements OrderRepository {
    private readonly defaultInclude = [
        {
            model: SequelizeCustomer,
            as: 'customer',
            attributes: ['cus_uuid', 'cus_name', 'cus_address', 'cus_phone', 'prct_uuid']
        },
        {
            model: SequelizeUser,
            as: 'seller',
            attributes: ['usr_uuid', 'usr_name', 'usr_surname', 'usr_email']
        },
        {
            model: SequelizeUser,
            as: 'driver',
            attributes: ['usr_uuid', 'usr_name', 'usr_surname', 'usr_email']
        },
        {
            model: SequelizeOrderDetail,
            as: 'details',
            include: [
                {
                    model: SequelizeProduct,
                    as: 'product',
                    attributes: ['prd_uuid', 'prd_code', 'prd_name', 'prd_unitlabel', 'prd_currentstock']
                }
            ]
        }
    ];

    async getOrders(cmp_uuid: string, options?: QueryOptions): Promise<OrderEntity[] | null> {
        try {
            const whereClause: any = { cmp_uuid };
            if (options?.where) {
                Object.assign(whereClause, options.where);
            }

            const orders = await SequelizeOrder.findAll({
                where: whereClause,
                include: this.defaultInclude,
                limit: options?.limit,
                offset: options?.offset,
                order: options?.order ?? [['ord_orderdate', 'DESC']],
                transaction: options?.transaction
            });

            if (!orders) {
                return null;
            }
            return orders.map(o => o.get({ plain: true }) as OrderEntity);
        } catch (error: any) {
            console.error("Error en getOrders (repository):", error.message);
            throw error;
        }
    }

    async getOrdersAndCount(cmp_uuid: string, options?: QueryOptions): Promise<{ count: number; rows: OrderEntity[] } | null> {
        try {
            const whereClause: any = { cmp_uuid };
            if (options?.where) {
                Object.assign(whereClause, options.where);
            }

            const { count, rows } = await SequelizeOrder.findAndCountAll({
                where: whereClause,
                include: this.defaultInclude,
                distinct: true,
                limit: options?.limit,
                offset: options?.offset,
                order: options?.order ?? [['ord_orderdate', 'DESC']],
                transaction: options?.transaction
            });

            return {
                count,
                rows: rows.map(o => o.get({ plain: true }) as OrderEntity)
            };
        } catch (error: any) {
            console.error("Error en getOrdersAndCount (repository):", error.message);
            throw error;
        }
    }

    async findOrderById(cmp_uuid: string, ord_uuid: string, options?: QueryOptions): Promise<OrderEntity | null> {
        try {
            const order = await SequelizeOrder.findOne({
                where: { cmp_uuid, ord_uuid },
                include: this.defaultInclude,
                transaction: options?.transaction
            });
            if (!order) {
                return null;
            }
            return order.get({ plain: true }) as OrderEntity;
        } catch (error: any) {
            console.error("Error en findOrderById (repository):", error.message);
            throw error;
        }
    }

    async createOrder(order: OrderEntity, options?: QueryOptions): Promise<OrderEntity | null> {
        try {
            const created = await SequelizeOrder.create(order as any, { transaction: options?.transaction });
            if (!created) {
                return null;
            }

            if (order.details && order.details.length > 0) {
                await SequelizeOrderDetail.bulkCreate(
                    order.details.map(d => ({
                        ...d,
                        cmp_uuid: order.cmp_uuid,
                        ord_uuid: order.ord_uuid
                    })) as any,
                    { transaction: options?.transaction }
                );
            }

            return await this.findOrderById(created.cmp_uuid, created.ord_uuid, options);
        } catch (error: any) {
            console.error("Error en createOrder (repository):", error.message);
            throw error;
        }
    }

    async replaceOrderDetails(cmp_uuid: string, ord_uuid: string, details: OrderDetailEntity[], options?: QueryOptions): Promise<void> {
        try {
            await SequelizeOrderDetail.destroy({
                where: { cmp_uuid, ord_uuid },
                transaction: options?.transaction
            });

            if (details && details.length > 0) {
                await SequelizeOrderDetail.bulkCreate(
                    details.map(d => ({
                        ...d,
                        cmp_uuid,
                        ord_uuid
                    })) as any,
                    { transaction: options?.transaction }
                );
            }
        } catch (error: any) {
            console.error("Error en replaceOrderDetails (repository):", error.message);
            throw error;
        }
    }

    async updateOrder(cmp_uuid: string, ord_uuid: string, order: Partial<OrderEntity>, options?: QueryOptions): Promise<OrderEntity | null> {
        try {
            const existing = await SequelizeOrder.findOne({
                where: { cmp_uuid, ord_uuid },
                transaction: options?.transaction
            });
            if (!existing) {
                return null;
            }

            await existing.update(order as any, { transaction: options?.transaction });

            if (order.details) {
                await this.replaceOrderDetails(cmp_uuid, ord_uuid, order.details, options);
            }

            return await this.findOrderById(cmp_uuid, ord_uuid, options);
        } catch (error: any) {
            console.error("Error en updateOrder (repository):", error.message);
            throw error;
        }
    }

    async deleteOrder(cmp_uuid: string, ord_uuid: string, options?: QueryOptions): Promise<OrderEntity | null> {
        try {
            const existing = await this.findOrderById(cmp_uuid, ord_uuid, options);
            if (!existing) {
                return null;
            }

            await SequelizeOrderDetail.destroy({
                where: { cmp_uuid, ord_uuid },
                transaction: options?.transaction
            });

            await SequelizeOrder.destroy({
                where: { cmp_uuid, ord_uuid },
                transaction: options?.transaction
            });

            return existing;
        } catch (error: any) {
            console.error("Error en deleteOrder (repository):", error.message);
            throw error;
        }
    }
}
