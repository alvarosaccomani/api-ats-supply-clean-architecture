import { v4 as uuid } from "uuid";
import moment from "moment";
import { ProductEntity, ProductCreateInput, ProductType } from "./product.entity";

export class ProductValue implements ProductEntity {
    cmp_uuid: string;
    prd_uuid: string;
    prd_code: string | null;
    prd_name: string;
    prd_type: ProductType;
    prd_unitlabel: string;
    prd_weightorvolume: number | null;
    prd_currentstock: number;
    prd_minstockalert: number;
    prd_active: boolean;
    prd_createdat: Date;
    prd_updatedat: Date;

    constructor({
        cmp_uuid,
        prd_uuid,
        prd_code = null,
        prd_name,
        prd_type = 'FINISHED',
        prd_unitlabel = 'unidad',
        prd_weightorvolume = null,
        prd_currentstock = 0.0,
        prd_minstockalert = 0.0,
        prd_active = true
    }: ProductCreateInput) {
        this.cmp_uuid = cmp_uuid;
        this.prd_uuid = prd_uuid ?? uuid();
        this.prd_code = prd_code ? prd_code.trim() : null;
        this.prd_name = prd_name.trim();
        this.prd_type = prd_type;
        this.prd_unitlabel = prd_unitlabel.trim().toLowerCase();
        this.prd_weightorvolume = prd_weightorvolume !== null && prd_weightorvolume !== undefined 
            ? Number(prd_weightorvolume) 
            : null;
        this.prd_currentstock = Number(prd_currentstock) || 0.0;
        this.prd_minstockalert = Number(prd_minstockalert) || 0.0;
        this.prd_active = prd_active !== undefined ? Boolean(prd_active) : true;
        this.prd_createdat = moment().toDate();
        this.prd_updatedat = moment().toDate();
    }
}
