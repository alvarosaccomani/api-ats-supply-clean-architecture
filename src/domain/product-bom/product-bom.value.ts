import { v4 as uuid } from "uuid";
import moment from "moment";
import { ProductBomEntity, ProductBomCreateInput } from "./product-bom.entity";

export class ProductBomValue implements ProductBomEntity {
    cmp_uuid: string;
    prdbom_uuid: string;
    prd_uuid_finished: string;
    prd_uuid_supply: string;
    prdbom_quantityperunit: number;
    prdbom_createdat: Date;
    prdbom_updatedat: Date;

    constructor({
        cmp_uuid,
        prdbom_uuid,
        prd_uuid_finished,
        prd_uuid_supply,
        prdbom_quantityperunit
    }: ProductBomCreateInput) {
        if (prd_uuid_finished === prd_uuid_supply) {
            throw new Error("Un producto no puede ser su propio insumo en la receta.");
        }
        const qty = Number(prdbom_quantityperunit);
        if (isNaN(qty) || qty <= 0) {
            throw new Error("La cantidad por unidad en la receta debe ser mayor a cero.");
        }

        this.cmp_uuid = cmp_uuid;
        this.prdbom_uuid = prdbom_uuid ?? uuid();
        this.prd_uuid_finished = prd_uuid_finished;
        this.prd_uuid_supply = prd_uuid_supply;
        this.prdbom_quantityperunit = qty;
        this.prdbom_createdat = moment().toDate();
        this.prdbom_updatedat = moment().toDate();
    }
}
