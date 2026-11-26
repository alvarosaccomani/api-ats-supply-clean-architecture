import { CustomerEntity } from "../customer/customer.entity";
import { OrderDetailEntity, OrderDetailCreateInput } from "./order-detail.entity";

export type OrderStatus = 'PENDIENTE_DE_ENTREGA' | 'ENTREGADO_DEBE' | 'PAGADO' | 'CUENTA_CORRIENTE' | 'CANCELADO';

export interface OrderEntity {
    cmp_uuid: string;
    ord_uuid: string;
    cus_uuid: string;
    usr_uuid_seller: string;
    usr_uuid_driver?: string | null;
    ord_orderdate: Date;
    ord_deliverydate?: Date | null;
    ord_status: OrderStatus;
    ord_totalamount: number;
    ord_paidamount?: number;
    ord_notes?: string | null;
    ord_createdat?: Date;
    ord_updatedat?: Date;
    customer?: CustomerEntity;
    seller?: {
        usr_uuid: string;
        usr_username?: string;
        usr_name?: string;
        usr_lastname?: string;
        usr_email?: string;
    };
    driver?: {
        usr_uuid: string;
        usr_username?: string;
        usr_name?: string;
        usr_lastname?: string;
        usr_email?: string;
    };
    details?: OrderDetailEntity[];
}

export interface OrderCreateInput {
    cmp_uuid: string;
    ord_uuid?: string;
    cus_uuid: string;
    usr_uuid_seller: string;
    usr_uuid_driver?: string | null;
    ord_orderdate?: Date | string;
    ord_deliverydate?: Date | string | null;
    ord_status?: OrderStatus;
    ord_paidamount?: number;
    ord_notes?: string | null;
    details: OrderDetailCreateInput[];
}

export interface OrderUpdateData {
    cus_uuid?: string;
    usr_uuid_driver?: string | null;
    usr_uuid_operator?: string | null;
    ord_deliverydate?: Date | string | null;
    ord_status?: OrderStatus;
    ord_paidamount?: number;
    ord_notes?: string | null;
    details?: OrderDetailCreateInput[];
}
