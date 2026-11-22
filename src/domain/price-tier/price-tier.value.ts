import { v4 as uuid } from "uuid";
import moment from "moment";
import { PriceTierEntity, PriceTierCreateInput } from "./price-tier.entity";

export class PriceTierValue implements PriceTierEntity {
    cmp_uuid: string;
    prct_uuid: string;
    prct_code: string;
    prct_name: string;
    prct_description: string | null;
    prct_isdefault: boolean;
    prct_active: boolean;
    prct_createdat: Date;
    prct_updatedat: Date;

    constructor({
        cmp_uuid,
        prct_uuid,
        prct_code,
        prct_name,
        prct_description = null,
        prct_isdefault = false,
        prct_active = true
    }: PriceTierCreateInput) {
        this.cmp_uuid = cmp_uuid;
        this.prct_uuid = prct_uuid ?? uuid();
        this.prct_code = prct_code.trim().toUpperCase();
        this.prct_name = prct_name.trim();
        this.prct_description = prct_description ? prct_description.trim() : null;
        this.prct_isdefault = Boolean(prct_isdefault);
        this.prct_active = prct_active !== undefined ? Boolean(prct_active) : true;
        this.prct_createdat = moment().toDate();
        this.prct_updatedat = moment().toDate();
    }
}
