import { v4 as uuid } from "uuid";
import moment from "moment";
import { OrderHistoryEntity, OrderHistoryCreateInput } from "./order-history.entity";

export class OrderHistoryValue implements OrderHistoryEntity {
    cmp_uuid: string;
    ordh_uuid: string;
    ord_uuid: string;
    usr_uuid: string;
    ordh_previousstatus: string | null;
    ordh_newstatus: string;
    ordh_notes: string | null;
    ordh_createdat: Date;
    ordh_updatedat: Date;

    constructor({
        cmp_uuid,
        ordh_uuid,
        ord_uuid,
        usr_uuid,
        ordh_previousstatus,
        ordh_newstatus,
        ordh_notes = null,
        ordh_createdat
    }: OrderHistoryCreateInput) {
        this.cmp_uuid = cmp_uuid;
        this.ordh_uuid = ordh_uuid ?? uuid();
        this.ord_uuid = ord_uuid;
        this.usr_uuid = usr_uuid;
        this.ordh_previousstatus = ordh_previousstatus ?? null;
        this.ordh_newstatus = ordh_newstatus;
        this.ordh_notes = ordh_notes ? ordh_notes.trim() : null;
        this.ordh_createdat = ordh_createdat ?? moment().toDate();
        this.ordh_updatedat = moment().toDate();
    }
}
