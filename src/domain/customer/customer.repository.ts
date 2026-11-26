import { CustomerEntity, CustomerCreateInput, CustomerUpdateData } from "./customer.entity";
import { QueryOptions } from "../common";

export interface CustomerRepository {
    getCustomers(cmp_uuid: string, options?: QueryOptions): Promise<CustomerEntity[] | null>;
    getCustomersAndCount(cmp_uuid: string, options?: QueryOptions): Promise<{ count: number; rows: CustomerEntity[] } | null>;
    findCustomerById(cmp_uuid: string, cus_uuid: string, options?: QueryOptions): Promise<CustomerEntity | null>;
    createCustomer(customer: CustomerCreateInput & { prct_uuid: string }, options?: QueryOptions): Promise<CustomerEntity | null>;
    updateCustomer(cmp_uuid: string, cus_uuid: string, customer: CustomerUpdateData, options?: QueryOptions): Promise<CustomerEntity | null>;
    updateCustomerBalance(cmp_uuid: string, cus_uuid: string, newBalance: number, options?: QueryOptions): Promise<CustomerEntity | null>;
    deleteCustomer(cmp_uuid: string, cus_uuid: string, options?: QueryOptions): Promise<CustomerEntity | null>;
}
