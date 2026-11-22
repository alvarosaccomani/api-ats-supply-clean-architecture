import { Request, Response } from "express";
import { ProductionOrderUseCase } from "../../../application/production-order/production-order-use-case";
import { getPaginationQuery, paginateDbResult } from "../../services/paginator.service";
import { Op } from "sequelize";

export class ProductionOrderController {
    constructor(private readonly productionOrderUseCase: ProductionOrderUseCase) {
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
                    message: "No se pudo recuperar las órdenes de producción.",
                    error: "Debe proporcionar el identificador de la empresa (cmp_uuid)."
                });
            }

            const page = req.query.page ? parseInt(req.query.page as string) : (req.params.page ? parseInt(req.params.page) : null);
            const perPage = req.query.perPage ? parseInt(req.query.perPage as string) : (req.params.perPage ? parseInt(req.params.perPage) : null);
            const prd_uuid = req.query.prd_uuid as string | undefined;
            const mch_uuid = req.query.mch_uuid as string | undefined;
            const status = req.query.status as string | undefined;
            const startDate = req.query.start_date as string | undefined;
            const endDate = req.query.end_date as string | undefined;

            const where: any = {};
            if (prd_uuid) {
                where.prd_uuid = prd_uuid;
            }
            if (mch_uuid) {
                where.mch_uuid = mch_uuid;
            }
            if (status) {
                where.prdord_status = status.toUpperCase();
            }
            if (startDate || endDate) {
                where.prdord_productiondate = {};
                if (startDate) {
                    where.prdord_productiondate[Op.gte] = new Date(startDate);
                }
                if (endDate) {
                    where.prdord_productiondate[Op.lte] = new Date(endDate);
                }
            }

            if (page && perPage) {
                const paginationQuery = getPaginationQuery(page, perPage);
                const result = await this.productionOrderUseCase.getProductionOrdersAndCount(cmp_uuid, {
                    ...paginationQuery,
                    where
                });

                return res.status(200).json({
                    success: true,
                    message: "Órdenes de producción retornadas.",
                    ...paginateDbResult(result, page, perPage)
                });
            } else {
                const orders = await this.productionOrderUseCase.getProductionOrders(cmp_uuid, { where });
                return res.status(200).json({
                    success: true,
                    message: "Órdenes de producción retornadas.",
                    data: orders
                });
            }
        } catch (error: any) {
            console.error("Error en getAllCtrl (production order):", error.message);
            return res.status(400).json({
                success: false,
                message: "No se pudo recuperar las órdenes de producción.",
                error: error.message
            });
        }
    }

    public async getCtrl(req: Request, res: Response) {
        try {
            const cmp_uuid = (req.params.cmp_uuid || (req as any).tenant?.cmp_uuid) as string;
            const prdord_uuid = req.params.prdord_uuid;

            if (!cmp_uuid || !prdord_uuid) {
                return res.status(400).json({
                    success: false,
                    message: "No se pudo recuperar la orden de producción.",
                    error: "Debe proporcionar cmp_uuid y prdord_uuid válidos."
                });
            }

            const order = await this.productionOrderUseCase.getDetailProductionOrder(cmp_uuid, prdord_uuid);
            return res.status(200).json({
                success: true,
                message: "Orden de producción retornada.",
                data: order
            });
        } catch (error: any) {
            console.error("Error en getCtrl (production order):", error.message);
            return res.status(404).json({
                success: false,
                message: "No se pudo recuperar la orden de producción.",
                error: error.message
            });
        }
    }

    public async insertCtrl(req: Request, res: Response) {
        try {
            const cmp_uuid = (req.body.cmp_uuid || req.params.cmp_uuid || (req as any).tenant?.cmp_uuid) as string;
            const user = (req as any).user;
            const usr_uuid = user?.sub || user?.usr_uuid;

            if (!cmp_uuid) {
                return res.status(400).json({
                    success: false,
                    message: "No se pudo registrar la orden de producción.",
                    error: "Debe proporcionar el identificador de la empresa (cmp_uuid)."
                });
            }

            if (!usr_uuid) {
                return res.status(401).json({
                    success: false,
                    message: "No se pudo registrar la orden de producción.",
                    error: "Token de usuario inválido o no autenticado."
                });
            }

            const order = await this.productionOrderUseCase.createProductionOrder({
                ...req.body,
                cmp_uuid,
                usr_uuid
            });

            return res.status(201).json({
                success: true,
                message: "Orden de producción asentada y stock balanceado exitosamente.",
                data: order
            });
        } catch (error: any) {
            console.error("Error en insertCtrl (production order):", error.message);
            return res.status(400).json({
                success: false,
                message: "No se pudo asentar la orden de producción.",
                error: error.message
            });
        }
    }

    public async updateCtrl(req: Request, res: Response) {
        try {
            const cmp_uuid = (req.params.cmp_uuid || req.body.cmp_uuid || (req as any).tenant?.cmp_uuid) as string;
            const prdord_uuid = req.params.prdord_uuid;

            if (!cmp_uuid || !prdord_uuid) {
                return res.status(400).json({
                    success: false,
                    message: "No se pudo actualizar la orden de producción.",
                    error: "Debe proporcionar cmp_uuid y prdord_uuid válidos."
                });
            }

            const updated = await this.productionOrderUseCase.updateProductionOrder(cmp_uuid, prdord_uuid, req.body);
            return res.status(200).json({
                success: true,
                message: "Orden de producción actualizada exitosamente.",
                data: updated
            });
        } catch (error: any) {
            console.error("Error en updateCtrl (production order):", error.message);
            return res.status(400).json({
                success: false,
                message: "No se pudo actualizar la orden de producción.",
                error: error.message
            });
        }
    }

    public async deleteCtrl(req: Request, res: Response) {
        try {
            const cmp_uuid = (req.params.cmp_uuid || (req as any).tenant?.cmp_uuid) as string;
            const prdord_uuid = req.params.prdord_uuid;

            if (!cmp_uuid || !prdord_uuid) {
                return res.status(400).json({
                    success: false,
                    message: "No se pudo eliminar la orden de producción.",
                    error: "Debe proporcionar cmp_uuid y prdord_uuid válidos."
                });
            }

            const deleted = await this.productionOrderUseCase.deleteProductionOrder(cmp_uuid, prdord_uuid);
            return res.status(200).json({
                success: true,
                message: "Orden de producción eliminada exitosamente.",
                data: deleted
            });
        } catch (error: any) {
            console.error("Error en deleteCtrl (production order):", error.message);
            return res.status(400).json({
                success: false,
                message: "No se pudo eliminar la orden de producción.",
                error: error.message
            });
        }
    }
}
