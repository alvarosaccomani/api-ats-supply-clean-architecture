import { CustomerEntity } from "../customer/customer.entity";
import { UserEntity } from "../user/user.entity";
import { OrderEntity } from "../order/order.entity";

export type CustomerMovementType = 
    | 'ORDER_DEBIT' 
    | 'PAYMENT_CREDIT' 
    | 'ADJUSTMENT_DEBIT' 
    | 'ADJUSTMENT_CREDIT' 
    | 'CANCEL_CREDIT';

export interface CustomerMovementEntity {
    cmp_uuid: string;
    cusm_uuid: string;
    cus_uuid: string;
    usr_uuid: string;
    cusm_type: CustomerMovementType;
    cusm_amount: number;
    cusm_previousbalance: number;
    cusm_newbalance: number;
    ord_uuid?: string | null;
    cusm_paymentmethod?: string | null;
    cusm_receiptnumber?: string | null;
    cusm_notes?: string | null;
    cusm_createdat: Date;
    cusm_updatedat: Date;
    customer?: CustomerEntity;
    user?: UserEntity;
    order?: OrderEntity;
}

export interface CustomerMovementCreateInput {
    cmp_uuid: string;
    cusm_uuid?: string;
    cus_uuid: string;
    usr_uuid: string;
    cusm_type: CustomerMovementType;
    cusm_amount: number;
    cusm_previousbalance?: number;
    cusm_newbalance?: number;
    ord_uuid?: string | null;
    cusm_paymentmethod?: string | null;
    cusm_receiptnumber?: string | null;
    cusm_notes?: string | null;
}
