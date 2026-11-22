import moment from "moment";
import { ProductPriceEntity, ProductPriceInput } from "./product-price.entity";

export class ProductPriceValue implements ProductPriceEntity {
    cmp_uuid: string;
    prd_uuid: string;
    prct_uuid: string;
    prdprc_price: number;
    prdprc_createdat: Date;
    prdprc_updatedat: Date;

    constructor({
        cmp_uuid,
        prd_uuid,
        prct_uuid,
        prdprc_price
    }: ProductPriceInput & { cmp_uuid: string; prd_uuid: string }) {
        this.cmp_uuid = cmp_uuid;
        this.prd_uuid = prd_uuid;
        this.prct_uuid = prct_uuid;
        this.prdprc_price = Number(prdprc_price) || 0.0;
        this.prdprc_createdat = moment().toDate();
        this.prdprc_updatedat = moment().toDate();
    }
}
