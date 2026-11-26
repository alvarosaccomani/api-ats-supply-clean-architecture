import { CustomerMovementEntity, CustomerMovementCreateInput } from "../../../domain/customer-movement/customer-movement.entity";
import { CustomerMovementRepository } from "../../../domain/customer-movement/customer-movement.repository";
import { SequelizeCustomerMovement } from "../../model/customer-movement/customer-movement.model";
import { SequelizeCustomer } from "../../model/customer/customer.model";
import { SequelizeUser } from "../../model/user/user.model";
import { SequelizeOrder } from "../../model/order/order.model";
import { QueryOptions } from "../../../domain/common";

export class SequelizeCustomerMovementRepository implements CustomerMovementRepository {
    async getMovements(cmp_uuid: string, cus_uuid: string, options?: QueryOptions): Promise<CustomerMovementEntity[] | null> {
        try {
            const whereClause: any = { cmp_uuid, cus_uuid };
            if (options?.where) {
                Object.assign(whereClause, options.where);
            }

            const movements = await SequelizeCustomerMovement.findAll({
                where: whereClause,
                include: [
                    { model: SequelizeCustomer, as: 'customer', attributes: ['cus_uuid', 'cus_name', 'cus_address', 'cus_currentbalance'] },
                    { model: SequelizeUser, as: 'user', attributes: ['usr_uuid', 'usr_name', 'usr_surname'] },
                    { model: SequelizeOrder, as: 'order', attributes: ['ord_uuid', 'ord_totalamount', 'ord_orderdate', 'ord_status'] }
                ],
                limit: options?.limit,
                offset: options?.offset,
                order: options?.order ?? [['cusm_createdat', 'DESC']],
                transaction: options?.transaction
            });

            if (!movements) {
                return null;
            }
            return movements.map(m => m.get({ plain: true }) as CustomerMovementEntity);
        } catch (error: any) {
            console.error("Error en getMovements (customer movement repository):", error.message);
            throw error;
        }
    }

    async getMovementsAndCount(cmp_uuid: string, cus_uuid: string, options?: QueryOptions): Promise<{ count: number; rows: CustomerMovementEntity[] } | null> {
        try {
            const whereClause: any = { cmp_uuid, cus_uuid };
            if (options?.where) {
                Object.assign(whereClause, options.where);
            }

            const { count, rows } = await SequelizeCustomerMovement.findAndCountAll({
                where: whereClause,
                include: [
                    { model: SequelizeCustomer, as: 'customer', attributes: ['cus_uuid', 'cus_name', 'cus_address', 'cus_currentbalance'] },
                    { model: SequelizeUser, as: 'user', attributes: ['usr_uuid', 'usr_name', 'usr_surname'] },
                    { model: SequelizeOrder, as: 'order', attributes: ['ord_uuid', 'ord_totalamount', 'ord_orderdate', 'ord_status'] }
                ],
                distinct: true,
                limit: options?.limit,
                offset: options?.offset,
                order: options?.order ?? [['cusm_createdat', 'DESC']],
                transaction: options?.transaction
            });

            return {
                count,
                rows: rows.map(m => m.get({ plain: true }) as CustomerMovementEntity)
            };
        } catch (error: any) {
            console.error("Error en getMovementsAndCount (customer movement repository):", error.message);
            throw error;
        }
    }

    async findMovementById(cmp_uuid: string, cusm_uuid: string, options?: QueryOptions): Promise<CustomerMovementEntity | null> {
        try {
            const movement = await SequelizeCustomerMovement.findOne({
                where: { cmp_uuid, cusm_uuid },
                include: [
                    { model: SequelizeCustomer, as: 'customer', attributes: ['cus_uuid', 'cus_name', 'cus_address', 'cus_currentbalance'] },
                    { model: SequelizeUser, as: 'user', attributes: ['usr_uuid', 'usr_name', 'usr_surname'] },
                    { model: SequelizeOrder, as: 'order', attributes: ['ord_uuid', 'ord_totalamount', 'ord_orderdate', 'ord_status'] }
                ],
                transaction: options?.transaction
            });

            if (!movement) {
                return null;
            }
            return movement.get({ plain: true }) as CustomerMovementEntity;
        } catch (error: any) {
            console.error("Error en findMovementById (customer movement repository):", error.message);
            throw error;
        }
    }

    async createMovement(movement: CustomerMovementCreateInput, options?: QueryOptions): Promise<CustomerMovementEntity | null> {
        try {
            const created = await SequelizeCustomerMovement.create(movement as any, { transaction: options?.transaction });
            if (!created) {
                return null;
            }
            return created.get({ plain: true }) as CustomerMovementEntity;
        } catch (error: any) {
            console.error("Error en createMovement (customer movement repository):", error.message);
            throw error;
        }
    }

    async getLastMovementByCustomer(cmp_uuid: string, cus_uuid: string, options?: QueryOptions): Promise<CustomerMovementEntity | null> {
        try {
            const movement = await SequelizeCustomerMovement.findOne({
                where: { cmp_uuid, cus_uuid },
                order: [['cusm_createdat', 'DESC']],
                transaction: options?.transaction
            });
            if (!movement) {
                return null;
            }
            return movement.get({ plain: true }) as CustomerMovementEntity;
        } catch (error: any) {
            console.error("Error en getLastMovementByCustomer (customer movement repository):", error.message);
            throw error;
        }
    }
}
