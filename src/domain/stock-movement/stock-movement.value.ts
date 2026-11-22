import { v4 as uuid } from "uuid";
import moment from "moment";
import { StockMovementEntity, StockMovementCreateInput, StockMovementType } from "./stock-movement.entity";

export class StockMovementValue implements StockMovementEntity {
    cmp_uuid: string;
    stkm_uuid: string;
    prd_uuid: string;
    usr_uuid: string;
    stkm_type: StockMovementType;
    stkm_quantity: number;
    stkm_previousstock: number;
    stkm_newstock: number;
    stkm_referenceuuid: string | null;
    stkm_notes: string | null;
    stkm_createdat: Date;
    stkm_updatedat: Date;

    constructor({
        cmp_uuid,
        stkm_uuid,
        prd_uuid,
        usr_uuid,
        stkm_type,
        stkm_quantity,
        stkm_previousstock,
        stkm_newstock,
        stkm_referenceuuid = null,
        stkm_notes = null
    }: StockMovementCreateInput) {
        this.cmp_uuid = cmp_uuid;
        this.stkm_uuid = stkm_uuid ?? uuid();
        this.prd_uuid = prd_uuid;
        this.usr_uuid = usr_uuid;
        this.stkm_type = stkm_type;
        this.stkm_quantity = Number(stkm_quantity);
        this.stkm_previousstock = Number(stkm_previousstock);
        this.stkm_newstock = stkm_newstock !== undefined 
            ? Number(stkm_newstock) 
            : Number(stkm_previousstock) + Number(stkm_quantity);
        this.stkm_referenceuuid = stkm_referenceuuid ?? null;
        this.stkm_notes = stkm_notes ? stkm_notes.trim() : null;
        this.stkm_createdat = moment().toDate();
        this.stkm_updatedat = moment().toDate();
    }
}
