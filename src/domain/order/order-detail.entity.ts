import { ProductEntity } from "../product/product.entity";

export interface OrderDetailEntity {
    cmp_uuid: string;
    ord_uuid: string;
    ordd_uuid: string;
    prd_uuid: string;
    ordd_quantity: number;
    ordd_unitprice: number;
    ordd_subtotal: number;
    ordd_createdat?: Date;
    ordd_updatedat?: Date;
    product?: ProductEntity;
}

export interface OrderDetailCreateInput {
    cmp_uuid: string;
    ord_uuid?: string;
    ordd_uuid?: string;
    prd_uuid: string;
    ordd_quantity: number;
    ordd_unitprice?: number;
    ordd_subtotal?: number;
}
