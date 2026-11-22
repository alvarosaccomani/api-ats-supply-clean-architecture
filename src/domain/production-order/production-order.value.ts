import { v4 as uuid } from "uuid";
import moment from "moment";
import { ProductionOrderEntity, ProductionOrderCreateInput, ProductionOrderStatus } from "./production-order.entity";

export class ProductionOrderValue implements ProductionOrderEntity {
    cmp_uuid: string;
    prdord_uuid: string;
    mch_uuid: string | null;
    prd_uuid: string;
    usr_uuid: string;
    prdord_producedqty: number;
    prdord_wasteqty: number;
    prdord_status: ProductionOrderStatus;
    prdord_productiondate: Date;
    prdord_notes: string | null;
    prdord_createdat: Date;
    prdord_updatedat: Date;

    constructor({
        cmp_uuid,
        prdord_uuid,
        mch_uuid = null,
        prd_uuid,
        usr_uuid,
        prdord_producedqty,
        prdord_wasteqty = 0.0,
        prdord_status = 'COMPLETED',
        prdord_productiondate,
        prdord_notes = null
    }: ProductionOrderCreateInput) {
        const produced = Number(prdord_producedqty);
        if (isNaN(produced) || produced < 0) {
            throw new Error("La cantidad producida no puede ser negativa.");
        }
        const waste = Number(prdord_wasteqty);
        if (isNaN(waste) || waste < 0) {
            throw new Error("La cantidad de merma no puede ser negativa.");
        }

        this.cmp_uuid = cmp_uuid;
        this.prdord_uuid = prdord_uuid ?? uuid();
        this.mch_uuid = mch_uuid ?? null;
        this.prd_uuid = prd_uuid;
        this.usr_uuid = usr_uuid;
        this.prdord_producedqty = produced;
        this.prdord_wasteqty = waste;
        this.prdord_status = prdord_status;
        this.prdord_productiondate = prdord_productiondate ? moment(prdord_productiondate).toDate() : moment().toDate();
        this.prdord_notes = prdord_notes ? prdord_notes.trim() : null;
        this.prdord_createdat = moment().toDate();
        this.prdord_updatedat = moment().toDate();
    }
}
