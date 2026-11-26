import { Request, Response } from "express";
import { OrderHistoryUseCase } from "../../../application/order-history/order-history-use-case";

export class OrderHistoryController {
    constructor(private readonly orderHistoryUseCase: OrderHistoryUseCase) {
        this.getHistoryByOrderCtrl = this.getHistoryByOrderCtrl.bind(this);
        this.insertHistoryCtrl = this.insertHistoryCtrl.bind(this);
    }

    public async getHistoryByOrderCtrl(req: Request, res: Response) {
        try {
            const cmp_uuid = (req.params.cmp_uuid || req.query.cmp_uuid || (req as any).tenant?.cmp_uuid) as string;
            const ord_uuid = req.params.ord_uuid as string;

            if (!cmp_uuid || !ord_uuid) {
                return res.status(400).json({
                    success: false,
                    message: "No se pudo recuperar el historial de estados.",
                    error: "Debe proporcionar cmp_uuid y ord_uuid."
                });
            }

            const history = await this.orderHistoryUseCase.getOrderHistory(cmp_uuid, ord_uuid);
            return res.status(200).json({
                success: true,
                message: "Historial de estados del pedido obtenido con éxito.",
                data: history
            });
        } catch (error: any) {
            console.error("Error en getHistoryByOrderCtrl (order history controller):", error.message);
            return res.status(400).json({
                success: false,
                message: "Error al consultar el historial del pedido.",
                error: error.message
            });
        }
    }

    public async insertHistoryCtrl(req: Request, res: Response) {
        try {
            const cmp_uuid = (req.body.cmp_uuid || (req as any).tenant?.cmp_uuid) as string;
            const user = (req as any).user;
            const usr_uuid = user?.sub || user?.usr_uuid;
            const { ord_uuid, previous_status, new_status, notes, created_at } = req.body;

            if (!cmp_uuid || !ord_uuid || !new_status) {
                return res.status(400).json({
                    success: false,
                    message: "Debe proporcionar cmp_uuid, ord_uuid y new_status."
                });
            }

            const entry = await this.orderHistoryUseCase.recordTransition({
                cmp_uuid,
                ord_uuid,
                usr_uuid: usr_uuid || req.body.usr_uuid,
                ordh_previousstatus: previous_status || null,
                ordh_newstatus: new_status,
                ordh_notes: notes,
                ordh_createdat: created_at ? new Date(created_at) : undefined
            });

            return res.status(201).json({
                success: true,
                message: "Transición de estado registrada con éxito.",
                data: entry
            });
        } catch (error: any) {
            console.error("Error en insertHistoryCtrl (order history controller):", error.message);
            return res.status(400).json({
                success: false,
                message: "Error al asentar la transición en el historial.",
                error: error.message
            });
        }
    }
}
