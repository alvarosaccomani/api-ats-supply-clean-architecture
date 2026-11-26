import { OrderHistoryRepository } from "../../domain/order-history/order-history.repository";
import { OrderHistoryValue } from "../../domain/order-history/order-history.value";
import { OrderHistoryEntity } from "../../domain/order-history/order-history.entity";
import { QueryOptions } from "../../domain/common";
import { TimezoneConverter } from "../../infrastructure/utils/TimezoneConverter";

export interface RecordOrderHistoryDTO {
    cmp_uuid: string;
    ord_uuid: string;
    usr_uuid: string;
    ordh_previousstatus: string | null;
    ordh_newstatus: string;
    ordh_notes?: string | null;
    ordh_createdat?: Date;
}

export class OrderHistoryUseCase {
    constructor(private readonly orderHistoryRepository: OrderHistoryRepository) {
        this.getOrderHistory = this.getOrderHistory.bind(this);
        this.recordTransition = this.recordTransition.bind(this);
    }

    private formatHistoryEntry(entry: OrderHistoryEntity) {
        return {
            cmp_uuid: entry.cmp_uuid,
            ordh_uuid: entry.ordh_uuid,
            ord_uuid: entry.ord_uuid,
            usr_uuid: entry.usr_uuid,
            ordh_previousstatus: entry.ordh_previousstatus,
            ordh_newstatus: entry.ordh_newstatus,
            ordh_notes: entry.ordh_notes ?? null,
            ordh_createdat: TimezoneConverter.toIsoStringInTimezone(entry.ordh_createdat, 'America/Buenos_Aires'),
            ordh_updatedat: TimezoneConverter.toIsoStringInTimezone(entry.ordh_updatedat, 'America/Buenos_Aires'),
            user: entry.user ? {
                usr_uuid: entry.user.usr_uuid,
                usr_name: entry.user.usr_name,
                usr_surname: entry.user.usr_surname,
                usr_email: entry.user.usr_email
            } : undefined
        };
    }

    public async getOrderHistory(cmp_uuid: string, ord_uuid: string, options?: QueryOptions) {
        try {
            if (!cmp_uuid || !ord_uuid) {
                throw new Error("Debe proporcionar cmp_uuid y ord_uuid válidos.");
            }
            const entries = await this.orderHistoryRepository.getHistoryByOrder(cmp_uuid, ord_uuid, options);
            return entries.map(e => this.formatHistoryEntry(e));
        } catch (error: any) {
            console.error("Error en getOrderHistory (use case):", error.message);
            throw error;
        }
    }

    public async recordTransition(data: RecordOrderHistoryDTO, options?: QueryOptions): Promise<OrderHistoryEntity> {
        try {
            const historyValue = new OrderHistoryValue(data);
            return await this.orderHistoryRepository.createHistoryEntry(historyValue, options);
        } catch (error: any) {
            console.error("Error en recordTransition (use case):", error.message);
            throw error;
        }
    }
}
