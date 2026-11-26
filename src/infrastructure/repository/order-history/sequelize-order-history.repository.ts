import { OrderHistoryEntity } from "../../../domain/order-history/order-history.entity";
import { OrderHistoryRepository } from "../../../domain/order-history/order-history.repository";
import { SequelizeOrderHistory } from "../../model/order-history/order-history.model";
import { SequelizeUser } from "../../model/user/user.model";
import { QueryOptions } from "../../../domain/common";

export class SequelizeOrderHistoryRepository implements OrderHistoryRepository {
    private readonly defaultInclude = [
        {
            model: SequelizeUser,
            as: 'user',
            attributes: ['usr_uuid', 'usr_name', 'usr_surname', 'usr_email']
        }
    ];

    async getHistoryByOrder(cmp_uuid: string, ord_uuid: string, options?: QueryOptions): Promise<OrderHistoryEntity[]> {
        try {
            const history = await SequelizeOrderHistory.findAll({
                where: {
                    cmp_uuid,
                    ord_uuid
                },
                include: this.defaultInclude,
                order: [['ordh_createdat', 'ASC']],
                transaction: options?.transaction
            });

            return history.map(h => h.get({ plain: true }) as OrderHistoryEntity);
        } catch (error: any) {
            console.error("Error en getHistoryByOrder (repository):", error.message);
            throw error;
        }
    }

    async createHistoryEntry(history: OrderHistoryEntity, options?: QueryOptions): Promise<OrderHistoryEntity> {
        try {
            const created = await SequelizeOrderHistory.create(history, {
                transaction: options?.transaction
            });
            return created.get({ plain: true }) as OrderHistoryEntity;
        } catch (error: any) {
            console.error("Error en createHistoryEntry (repository):", error.message);
            throw error;
        }
    }
}
