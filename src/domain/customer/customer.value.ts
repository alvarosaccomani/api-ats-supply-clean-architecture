import { v4 as uuid } from "uuid";
import moment from "moment";
import { CustomerEntity, CustomerCreateInput } from "./customer.entity";

export class CustomerValue implements CustomerEntity {
    cmp_uuid: string;
    cus_uuid: string;
    prct_uuid: string;
    cus_name: string;
    cus_address: string;
    cus_phone: string | null;
    cus_contactname: string | null;
    cus_notes: string | null;
    cus_lat: number | null;
    cus_lng: number | null;
    cus_active: boolean;
    cus_createdat: Date;
    cus_updatedat: Date;

    constructor({
        cmp_uuid,
        cus_uuid,
        prct_uuid,
        cus_name,
        cus_address,
        cus_phone = null,
        cus_contactname = null,
        cus_notes = null,
        cus_lat = null,
        cus_lng = null,
        cus_active = true
    }: CustomerCreateInput & { prct_uuid: string }) {
        this.cmp_uuid = cmp_uuid;
        this.cus_uuid = cus_uuid ?? uuid();
        this.prct_uuid = prct_uuid;
        this.cus_name = cus_name.trim();
        this.cus_address = cus_address.trim();
        this.cus_phone = cus_phone ? cus_phone.trim() : null;
        this.cus_contactname = cus_contactname ? cus_contactname.trim() : null;
        this.cus_notes = cus_notes ? cus_notes.trim() : null;
        this.cus_lat = cus_lat !== undefined && cus_lat !== null ? Number(cus_lat) : null;
        this.cus_lng = cus_lng !== undefined && cus_lng !== null ? Number(cus_lng) : null;
        this.cus_active = cus_active !== undefined ? Boolean(cus_active) : true;
        this.cus_createdat = moment().toDate();
        this.cus_updatedat = moment().toDate();
    }
}
