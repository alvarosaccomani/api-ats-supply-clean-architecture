import { CustomerRepository } from "../../domain/customer/customer.repository";
import { CustomerValue } from "../../domain/customer/customer.value";
import { CustomerEntity, CustomerCreateInput, CustomerUpdateData } from "../../domain/customer/customer.entity";
import { PriceTierRepository } from "../../domain/price-tier/price-tier.repository";
import { QueryOptions } from "../../domain/common";
import { TimezoneConverter } from "../../infrastructure/utils/TimezoneConverter";

export class CustomerUseCase {
    constructor(
        private readonly customerRepository: CustomerRepository,
        private readonly priceTierRepository: PriceTierRepository
    ) {
        this.getCustomers = this.getCustomers.bind(this);
        this.getCustomersAndCount = this.getCustomersAndCount.bind(this);
        this.getDetailCustomer = this.getDetailCustomer.bind(this);
        this.createCustomer = this.createCustomer.bind(this);
        this.updateCustomer = this.updateCustomer.bind(this);
        this.deleteCustomer = this.deleteCustomer.bind(this);
    }

    private formatCustomer(customer: CustomerEntity) {
        return {
            cmp_uuid: customer.cmp_uuid,
            cus_uuid: customer.cus_uuid,
            prct_uuid: customer.prct_uuid,
            cus_name: customer.cus_name,
            cus_address: customer.cus_address,
            cus_phone: customer.cus_phone ?? null,
            cus_contactname: customer.cus_contactname ?? null,
            cus_notes: customer.cus_notes ?? null,
            cus_active: Boolean(customer.cus_active),
            cus_createdat: TimezoneConverter.toIsoStringInTimezone(customer.cus_createdat, 'America/Buenos_Aires'),
            cus_updatedat: TimezoneConverter.toIsoStringInTimezone(customer.cus_updatedat, 'America/Buenos_Aires'),
            priceTier: customer.priceTier ? {
                prct_uuid: customer.priceTier.prct_uuid,
                prct_code: customer.priceTier.prct_code,
                prct_name: customer.priceTier.prct_name
            } : undefined
        };
    }

    public async getCustomers(cmp_uuid: string, options?: QueryOptions) {
        try {
            if (!cmp_uuid) {
                throw new Error("Debe proporcionar un identificador de empresa válido.");
            }
            const customers = await this.customerRepository.getCustomers(cmp_uuid, options);
            if (!customers) {
                return [];
            }
            return customers.map(c => this.formatCustomer(c));
        } catch (error: any) {
            console.error("Error en getCustomers (use case):", error.message);
            throw error;
        }
    }

    public async getCustomersAndCount(cmp_uuid: string, options?: QueryOptions) {
        try {
            if (!cmp_uuid) {
                throw new Error("Debe proporcionar un identificador de empresa válido.");
            }
            const result = await this.customerRepository.getCustomersAndCount(cmp_uuid, options);
            if (!result) {
                return { count: 0, rows: [] };
            }
            return {
                count: result.count,
                rows: result.rows.map(c => this.formatCustomer(c))
            };
        } catch (error: any) {
            console.error("Error en getCustomersAndCount (use case):", error.message);
            throw error;
        }
    }

    public async getDetailCustomer(cmp_uuid: string, cus_uuid: string, options?: QueryOptions) {
        try {
            if (!cmp_uuid || !cus_uuid) {
                throw new Error("Debe proporcionar cmp_uuid y cus_uuid válidos.");
            }
            const customer = await this.customerRepository.findCustomerById(cmp_uuid, cus_uuid, options);
            if (!customer) {
                throw new Error(`No se encontró el cliente con ID: ${cus_uuid}`);
            }
            return this.formatCustomer(customer);
        } catch (error: any) {
            console.error("Error en getDetailCustomer (use case):", error.message);
            throw error;
        }
    }

    public async createCustomer(input: CustomerCreateInput, options?: QueryOptions) {
        try {
            const { cmp_uuid, cus_name, cus_address } = input;
            if (!cmp_uuid) {
                throw new Error("Debe proporcionar el identificador de la empresa (cmp_uuid).");
            }
            if (!cus_name || cus_name.trim() === '') {
                throw new Error("El nombre o razón social del cliente es obligatorio.");
            }
            if (!cus_address || cus_address.trim() === '') {
                throw new Error("La dirección del cliente es obligatoria.");
            }

            // Asignación de lista de precios
            let prct_uuid = input.prct_uuid;
            if (!prct_uuid) {
                const defaultTier = await this.priceTierRepository.findDefaultPriceTier(cmp_uuid, options);
                if (defaultTier) {
                    prct_uuid = defaultTier.prct_uuid;
                } else {
                    const tiers = await this.priceTierRepository.getPriceTiers(cmp_uuid, options);
                    if (!tiers || tiers.length === 0) {
                        throw new Error("Debe registrar al menos una lista de precios antes de dar de alta clientes.");
                    }
                    prct_uuid = tiers[0].prct_uuid;
                }
            } else {
                const tier = await this.priceTierRepository.findPriceTierById(cmp_uuid, prct_uuid, options);
                if (!tier) {
                    throw new Error(`La lista de precios con ID ${prct_uuid} no existe en la empresa.`);
                }
            }

            const customerValue = new CustomerValue({
                ...input,
                prct_uuid
            });

            const created = await this.customerRepository.createCustomer(customerValue, options);
            if (!created) {
                throw new Error("No se pudo registrar el cliente.");
            }
            return this.formatCustomer(created);
        } catch (error: any) {
            console.error("Error en createCustomer (use case):", error.message);
            throw error;
        }
    }

    public async updateCustomer(cmp_uuid: string, cus_uuid: string, data: CustomerUpdateData, options?: QueryOptions) {
        try {
            if (!cmp_uuid || !cus_uuid) {
                throw new Error("Debe proporcionar cmp_uuid y cus_uuid válidos.");
            }

            const existing = await this.customerRepository.findCustomerById(cmp_uuid, cus_uuid, options);
            if (!existing) {
                throw new Error(`No existe el cliente con ID: ${cus_uuid}`);
            }

            if (data.prct_uuid) {
                const tier = await this.priceTierRepository.findPriceTierById(cmp_uuid, data.prct_uuid, options);
                if (!tier) {
                    throw new Error(`La lista de precios con ID ${data.prct_uuid} no existe en la empresa.`);
                }
            }

            const updated = await this.customerRepository.updateCustomer(cmp_uuid, cus_uuid, data, options);
            if (!updated) {
                throw new Error("No se pudo actualizar el cliente.");
            }
            return this.formatCustomer(updated);
        } catch (error: any) {
            console.error("Error en updateCustomer (use case):", error.message);
            throw error;
        }
    }

    public async deleteCustomer(cmp_uuid: string, cus_uuid: string, options?: QueryOptions) {
        try {
            if (!cmp_uuid || !cus_uuid) {
                throw new Error("Debe proporcionar cmp_uuid y cus_uuid válidos.");
            }

            const existing = await this.customerRepository.findCustomerById(cmp_uuid, cus_uuid, options);
            if (!existing) {
                throw new Error(`No existe el cliente con ID: ${cus_uuid}`);
            }

            const deleted = await this.customerRepository.deleteCustomer(cmp_uuid, cus_uuid, options);
            if (!deleted) {
                throw new Error("No se pudo eliminar el cliente.");
            }
            return this.formatCustomer(deleted);
        } catch (error: any) {
            console.error("Error en deleteCustomer (use case):", error.message);
            throw error;
        }
    }
}
