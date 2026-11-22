import { v4 as uuid } from "uuid";
import moment from "moment";
import { MachineEntity, MachineCreateInput } from "./machine.entity";

export class MachineValue implements MachineEntity {
    cmp_uuid: string;
    mch_uuid: string;
    mch_name: string;
    mch_description: string | null;
    mch_dailycapacity: number | null;
    mch_active: boolean;
    mch_createdat: Date;
    mch_updatedat: Date;

    constructor({
        cmp_uuid,
        mch_uuid,
        mch_name,
        mch_description = null,
        mch_dailycapacity = null,
        mch_active = true
    }: MachineCreateInput) {
        this.cmp_uuid = cmp_uuid;
        this.mch_uuid = mch_uuid ?? uuid();
        this.mch_name = mch_name.trim();
        this.mch_description = mch_description ? mch_description.trim() : null;
        this.mch_dailycapacity = mch_dailycapacity !== null && mch_dailycapacity !== undefined 
            ? Number(mch_dailycapacity) 
            : null;
        this.mch_active = mch_active !== undefined ? Boolean(mch_active) : true;
        this.mch_createdat = moment().toDate();
        this.mch_updatedat = moment().toDate();
    }
}
