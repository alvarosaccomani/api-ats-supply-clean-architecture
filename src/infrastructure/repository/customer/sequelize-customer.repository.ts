import { CustomerEntity, CustomerCreateInput, CustomerUpdateData } from "../../../domain/customer/customer.entity";
import { CustomerRepository } from "../../../domain/customer/customer.repository";
import { SequelizeCustomer } from "../../model/customer/customer.model";
import { SequelizePriceTier } from "../../model/price-tier/price-tier.model";
import { QueryOptions } from "../../../domain/common";

export class SequelizeCustomerRepository implements CustomerRepository {
    private readonly defaultInclude = [
        {
            model: SequelizePriceTier,
            as: 'priceTier',
            attributes: ['prct_uuid', 'prct_code', 'prct_name', 'prct_isdefault']
        }
    ];

    async getCustomers(cmp_uuid: string, options?: QueryOptions): Promise<CustomerEntity[] | null> {
        try {
            const whereClause: any = { cmp_uuid };
            if (options?.where) {
                Object.assign(whereClause, options.where);
            }

            const customers = await SequelizeCustomer.findAll({
                where: whereClause,
                include: this.defaultInclude,
                limit: options?.limit,
                offset: options?.offset,
                order: options?.order ?? [['cus_name', 'ASC']],
                transaction: options?.transaction
            });

            if (!customers) {
                return null;
            }
            return customers.map(c => c.get({ plain: true }) as CustomerEntity);
        } catch (error: any) {
            console.error("Error en getCustomers (repository):", error.message);
            throw error;
        }
    }

    async getCustomersAndCount(cmp_uuid: string, options?: QueryOptions): Promise<{ count: number; rows: CustomerEntity[] } | null> {
        try {
            const whereClause: any = { cmp_uuid };
            if (options?.where) {
                Object.assign(whereClause, options.where);
            }

            const { count, rows } = await SequelizeCustomer.findAndCountAll({
                where: whereClause,
                include: this.defaultInclude,
                distinct: true,
                limit: options?.limit,
                offset: options?.offset,
                order: options?.order ?? [['cus_name', 'ASC']],
                transaction: options?.transaction
            });

            return {
                count,
                rows: rows.map(c => c.get({ plain: true }) as CustomerEntity)
            };
        } catch (error: any) {
            console.error("Error en getCustomersAndCount (repository):", error.message);
            throw error;
        }
    }

    async findCustomerById(cmp_uuid: string, cus_uuid: string, options?: QueryOptions): Promise<CustomerEntity | null> {
        try {
            const customer = await SequelizeCustomer.findOne({
                where: { cmp_uuid, cus_uuid },
                include: this.defaultInclude,
                transaction: options?.transaction
            });
            if (!customer) {
                return null;
            }
            return customer.get({ plain: true }) as CustomerEntity;
        } catch (error: any) {
            console.error("Error en findCustomerById (repository):", error.message);
            throw error;
        }
    }

    async createCustomer(customer: CustomerCreateInput & { prct_uuid: string }, options?: QueryOptions): Promise<CustomerEntity | null> {
        try {
            const created = await SequelizeCustomer.create(customer as any, { transaction: options?.transaction });
            if (!created) {
                return null;
            }
            return await this.findCustomerById(created.cmp_uuid, created.cus_uuid, options);
        } catch (error: any) {
            console.error("Error en createCustomer (repository):", error.message);
            throw error;
        }
    }

    async updateCustomer(cmp_uuid: string, cus_uuid: string, customer: CustomerUpdateData, options?: QueryOptions): Promise<CustomerEntity | null> {
        try {
            const existing = await SequelizeCustomer.findOne({
                where: { cmp_uuid, cus_uuid },
                transaction: options?.transaction
            });
            if (!existing) {
                return null;
            }

            await existing.update(customer as any, { transaction: options?.transaction });
            return await this.findCustomerById(cmp_uuid, cus_uuid, options);
        } catch (error: any) {
            console.error("Error en updateCustomer (repository):", error.message);
            throw error;
        }
    }

    async deleteCustomer(cmp_uuid: string, cus_uuid: string, options?: QueryOptions): Promise<CustomerEntity | null> {
        try {
            const existing = await this.findCustomerById(cmp_uuid, cus_uuid, options);
            if (!existing) {
                return null;
            }

            await SequelizeCustomer.destroy({
                where: { cmp_uuid, cus_uuid },
                transaction: options?.transaction
            });
            return existing;
        } catch (error: any) {
            console.error("Error en deleteCustomer (repository):", error.message);
            throw error;
        }
    }
}
