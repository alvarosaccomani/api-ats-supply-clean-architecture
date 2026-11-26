import { v4 as uuid } from "uuid";
import moment from "moment";
import { CustomerMovementEntity, CustomerMovementCreateInput, CustomerMovementType } from "./customer-movement.entity";

export class CustomerMovementValue implements CustomerMovementEntity {
    cmp_uuid: string;
    cusm_uuid: string;
    cus_uuid: string;
    usr_uuid: string;
    cusm_type: CustomerMovementType;
    cusm_amount: number;
    cusm_previousbalance: number;
    cusm_newbalance: number;
    ord_uuid: string | null;
    cusm_paymentmethod: string | null;
    cusm_receiptnumber: string | null;
    cusm_notes: string | null;
    cusm_createdat: Date;
    cusm_updatedat: Date;

    constructor({
        cmp_uuid,
        cusm_uuid,
        cus_uuid,
        usr_uuid,
        cusm_type,
        cusm_amount,
        cusm_previousbalance = 0,
        cusm_newbalance = 0,
        ord_uuid = null,
        cusm_paymentmethod = null,
        cusm_receiptnumber = null,
        cusm_notes = null
    }: CustomerMovementCreateInput) {
        this.cmp_uuid = cmp_uuid;
        this.cusm_uuid = cusm_uuid ?? uuid();
        this.cus_uuid = cus_uuid;
        this.usr_uuid = usr_uuid;
        this.cusm_type = cusm_type;
        this.cusm_amount = Number(cusm_amount);
        this.cusm_previousbalance = Number(cusm_previousbalance);
        this.cusm_newbalance = Number(cusm_newbalance);
        this.ord_uuid = ord_uuid ?? null;
        this.cusm_paymentmethod = cusm_paymentmethod ? cusm_paymentmethod.trim().toUpperCase() : null;
        this.cusm_receiptnumber = cusm_receiptnumber ? cusm_receiptnumber.trim() : null;
        this.cusm_notes = cusm_notes ? cusm_notes.trim() : null;
        this.cusm_createdat = moment().toDate();
        this.cusm_updatedat = moment().toDate();
    }
}
