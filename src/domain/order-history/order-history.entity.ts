import { UserEntity } from "../user/user.entity";
import { OrderEntity } from "../order/order.entity";

export interface OrderHistoryEntity {
    cmp_uuid: string;
    ordh_uuid: string;
    ord_uuid: string;
    usr_uuid: string;
    ordh_previousstatus: string | null;
    ordh_newstatus: string;
    ordh_notes?: string | null;
    ordh_createdat: Date;
    ordh_updatedat: Date;
    user?: UserEntity;
    order?: OrderEntity;
}

export interface OrderHistoryCreateInput {
    cmp_uuid: string;
    ordh_uuid?: string;
    ord_uuid: string;
    usr_uuid: string;
    ordh_previousstatus: string | null;
    ordh_newstatus: string;
    ordh_notes?: string | null;
    ordh_createdat?: Date;
}
