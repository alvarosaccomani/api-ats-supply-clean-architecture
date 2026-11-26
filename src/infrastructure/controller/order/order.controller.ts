import { Request, Response } from "express";
import { OrderUseCase } from "../../../application/order/order-use-case";
import { getPaginationQuery, paginateDbResult } from "../../services/paginator.service";
import { Op } from "sequelize";

export class OrderController {
    constructor(private readonly orderUseCase: OrderUseCase) {
        this.getAllCtrl = this.getAllCtrl.bind(this);
        this.getCtrl = this.getCtrl.bind(this);
        this.insertCtrl = this.insertCtrl.bind(this);
        this.updateCtrl = this.updateCtrl.bind(this);
        this.deleteCtrl = this.deleteCtrl.bind(this);
    }

    public async getAllCtrl(req: Request, res: Response) {
        try {
            const cmp_uuid = (req.params.cmp_uuid || req.query.cmp_uuid || (req as any).tenant?.cmp_uuid) as string;
            if (!cmp_uuid) {
                return res.status(400).json({
                    success: false,
                    message: "No se pudo recuperar los pedidos.",
                    error: "Debe proporcionar el identificador de la empresa (cmp_uuid)."
                });
            }

            const page = req.query.page ? parseInt(req.query.page as string) : (req.params.page ? parseInt(req.params.page) : null);
            const perPage = req.query.perPage ? parseInt(req.query.perPage as string) : (req.params.perPage ? parseInt(req.params.perPage) : null);
            const status = req.query.status as string | undefined;
            const cus_uuid = req.query.cus_uuid as string | undefined;
            const usr_uuid_seller = req.query.usr_uuid_seller as string | undefined;
            const usr_uuid_driver = req.query.usr_uuid_driver as string | undefined;
            const startDate = req.query.startDate as string | undefined;
            const endDate = req.query.endDate as string | undefined;

            const where: any = {};
            if (status) {
                where.ord_status = status;
            }
            if (cus_uuid) {
                where.cus_uuid = cus_uuid;
            }
            if (usr_uuid_seller) {
                where.usr_uuid_seller = usr_uuid_seller;
            }
            if (usr_uuid_driver) {
                where.usr_uuid_driver = usr_uuid_driver;
            }
            if (startDate || endDate) {
                where.ord_orderdate = {};
                if (startDate) {
                    where.ord_orderdate[Op.gte] = new Date(startDate);
                }
                if (endDate) {
                    where.ord_orderdate[Op.lte] = new Date(endDate);
                }
            }

            if (page && perPage) {
                const paginationQuery = getPaginationQuery(page, perPage);
                const result = await this.orderUseCase.getOrdersAndCount(cmp_uuid, {
                    ...paginationQuery,
                    where
                });

                return res.status(200).json({
                    success: true,
                    message: "Pedidos retornados.",
                    ...paginateDbResult(result, page, perPage)
                });
            } else {
                const orders = await this.orderUseCase.getOrders(cmp_uuid, { where });
                return res.status(200).json({
                    success: true,
                    message: "Pedidos retornados.",
                    data: orders
                });
            }
        } catch (error: any) {
            console.error("Error en getAllCtrl (order controller):", error.message);
            return res.status(400).json({
                success: false,
                message: "No se pudo recuperar los pedidos.",
                error: error.message
            });
        }
    }

    public async getCtrl(req: Request, res: Response) {
        try {
            const cmp_uuid = (req.params.cmp_uuid || (req as any).tenant?.cmp_uuid) as string;
            const ord_uuid = req.params.ord_uuid;

            if (!cmp_uuid || !ord_uuid) {
                return res.status(400).json({
                    success: false,
                    message: "No se pudo recuperar el pedido.",
                    error: "Debe proporcionar cmp_uuid y ord_uuid."
                });
            }

            const order = await this.orderUseCase.getDetailOrder(cmp_uuid, ord_uuid);
            return res.status(200).json({
                success: true,
                message: "Pedido retornado.",
                data: order
            });
        } catch (error: any) {
            console.error("Error en getCtrl (order controller):", error.message);
            return res.status(404).json({
                success: false,
                message: "No se pudo recuperar el pedido.",
                error: error.message
            });
        }
    }

    public async insertCtrl(req: Request, res: Response) {
        try {
            const cmp_uuid = (req.params.cmp_uuid || req.body.cmp_uuid || (req as any).tenant?.cmp_uuid) as string;
            const usr_uuid_seller = req.body.usr_uuid_seller || (req as any).user?.usr_uuid;
            const { cus_uuid, usr_uuid_driver, ord_orderdate, ord_deliverydate, ord_status, ord_notes, details } = req.body;

            if (!cmp_uuid) {
                return res.status(400).json({
                    success: false,
                    message: "No se pudo registrar el pedido.",
                    error: "Debe proporcionar el identificador de la empresa (cmp_uuid)."
                });
            }

            const order = await this.orderUseCase.createOrder({
                cmp_uuid,
                cus_uuid,
                usr_uuid_seller,
                usr_uuid_driver,
                ord_orderdate,
                ord_deliverydate,
                ord_status,
                ord_notes,
                details: details || []
            });

            return res.status(201).json({
                success: true,
                message: "Pedido creado con éxito.",
                data: order
            });
        } catch (error: any) {
            console.error("Error en insertCtrl (order controller):", error.message);
            return res.status(400).json({
                success: false,
                message: "No se pudo registrar el pedido.",
                error: error.message
            });
        }
    }

    public async updateCtrl(req: Request, res: Response) {
        try {
            const cmp_uuid = (req.params.cmp_uuid || req.body.cmp_uuid || (req as any).tenant?.cmp_uuid) as string;
            const ord_uuid = req.params.ord_uuid;
            const { cus_uuid, usr_uuid_driver, ord_deliverydate, ord_status, ord_notes, details } = req.body;

            if (!cmp_uuid || !ord_uuid) {
                return res.status(400).json({
                    success: false,
                    message: "No se pudo actualizar el pedido.",
                    error: "Debe proporcionar cmp_uuid y ord_uuid."
                });
            }

            const user = (req as any).user;
            const usr_uuid_operator = user?.sub || user?.usr_uuid;

            const updated = await this.orderUseCase.updateOrder(cmp_uuid, ord_uuid, {
                cus_uuid,
                usr_uuid_driver,
                usr_uuid_operator,
                ord_deliverydate,
                ord_status,
                ord_notes,
                details
            });

            return res.status(200).json({
                success: true,
                message: "Pedido actualizado con éxito.",
                data: updated
            });
        } catch (error: any) {
            console.error("Error en updateCtrl (order controller):", error.message);
            return res.status(400).json({
                success: false,
                message: "No se pudo actualizar el pedido.",
                error: error.message
            });
        }
    }

    public async deleteCtrl(req: Request, res: Response) {
        try {
            const cmp_uuid = (req.params.cmp_uuid || (req as any).tenant?.cmp_uuid) as string;
            const ord_uuid = req.params.ord_uuid;

            if (!cmp_uuid || !ord_uuid) {
                return res.status(400).json({
                    success: false,
                    message: "No se pudo eliminar el pedido.",
                    error: "Debe proporcionar cmp_uuid y ord_uuid."
                });
            }

            const deleted = await this.orderUseCase.deleteOrder(cmp_uuid, ord_uuid);
            return res.status(200).json({
                success: true,
                message: "Pedido eliminado con éxito.",
                data: deleted
            });
        } catch (error: any) {
            console.error("Error en deleteCtrl (order controller):", error.message);
            return res.status(400).json({
                success: false,
                message: "No se pudo eliminar el pedido.",
                error: error.message
            });
        }
    }
}
