import { v4 as uuidv4 } from "uuid";
import { OrderEntity, OrderCreateInput, OrderStatus } from "./order.entity";
import { OrderDetailEntity } from "./order-detail.entity";

export class OrderValue implements OrderEntity {
    cmp_uuid: string;
    ord_uuid: string;
    cus_uuid: string;
    usr_uuid_seller: string;
    usr_uuid_driver?: string | null;
    ord_orderdate: Date;
    ord_deliverydate?: Date | null;
    ord_status: OrderStatus;
    ord_totalamount: number;
    ord_paidamount?: number;
    ord_notes?: string | null;
    ord_createdat?: Date;
    ord_updatedat?: Date;
    details?: OrderDetailEntity[];

    constructor(data: OrderCreateInput & { detailsWithPrices?: OrderDetailEntity[] }) {
        this.cmp_uuid = data.cmp_uuid;
        this.ord_uuid = data.ord_uuid || uuidv4();
        this.cus_uuid = data.cus_uuid;
        this.usr_uuid_seller = data.usr_uuid_seller;
        this.usr_uuid_driver = data.usr_uuid_driver ?? null;
        this.ord_orderdate = data.ord_orderdate ? new Date(data.ord_orderdate) : new Date();
        this.ord_deliverydate = data.ord_deliverydate ? new Date(data.ord_deliverydate) : null;
        this.ord_status = data.ord_status || 'PENDIENTE_DE_ENTREGA';
        this.ord_notes = data.ord_notes ? data.ord_notes.trim() : null;

        if (data.detailsWithPrices && data.detailsWithPrices.length > 0) {
            this.details = data.detailsWithPrices.map(item => ({
                cmp_uuid: this.cmp_uuid,
                ord_uuid: this.ord_uuid,
                ordd_uuid: item.ordd_uuid || uuidv4(),
                prd_uuid: item.prd_uuid,
                ordd_quantity: Number(item.ordd_quantity),
                ordd_unitprice: Number(item.ordd_unitprice),
                ordd_subtotal: Number(item.ordd_quantity) * Number(item.ordd_unitprice)
            }));
            this.ord_totalamount = this.details.reduce((sum, item) => sum + item.ordd_subtotal, 0);
        } else {
            this.details = (data.details || []).map(item => ({
                cmp_uuid: this.cmp_uuid,
                ord_uuid: this.ord_uuid,
                ordd_uuid: item.ordd_uuid || uuidv4(),
                prd_uuid: item.prd_uuid,
                ordd_quantity: Number(item.ordd_quantity),
                ordd_unitprice: Number(item.ordd_unitprice || 0),
                ordd_subtotal: Number(item.ordd_quantity) * Number(item.ordd_unitprice || 0)
            }));
            this.ord_totalamount = this.details.reduce((sum, item) => sum + item.ordd_subtotal, 0);
        }

        this.ord_paidamount = (data as any).ord_paidamount !== undefined ? Number((data as any).ord_paidamount) : (this.ord_status === 'PAGADO' ? this.ord_totalamount : 0);
    }
}
