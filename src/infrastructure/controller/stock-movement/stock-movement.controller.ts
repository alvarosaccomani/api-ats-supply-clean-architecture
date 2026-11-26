import { Request, Response } from "express";
import { StockMovementUseCase } from "../../../application/stock-movement/stock-movement-use-case";
import { getPaginationQuery, paginateDbResult } from "../../services/paginator.service";
import { Op } from "sequelize";

export class StockMovementController {
    constructor(private readonly stockMovementUseCase: StockMovementUseCase) {
        this.getAllCtrl = this.getAllCtrl.bind(this);
        this.getCtrl = this.getCtrl.bind(this);
        this.insertCtrl = this.insertCtrl.bind(this);
        this.dispatchLoadCtrl = this.dispatchLoadCtrl.bind(this);
        this.reconcileReturnCtrl = this.reconcileReturnCtrl.bind(this);
    }

    public async getAllCtrl(req: Request, res: Response) {
        try {
            const cmp_uuid = (req.params.cmp_uuid || req.query.cmp_uuid || (req as any).tenant?.cmp_uuid) as string;
            if (!cmp_uuid) {
                return res.status(400).json({
                    success: false,
                    message: "No se pudo recuperar los movimientos de stock.",
                    error: "Debe proporcionar el identificador de la empresa (cmp_uuid)."
                });
            }

            const page = req.query.page ? parseInt(req.query.page as string) : (req.params.page ? parseInt(req.params.page) : null);
            const perPage = req.query.perPage ? parseInt(req.query.perPage as string) : (req.params.perPage ? parseInt(req.params.perPage) : null);
            const prd_uuid = req.query.prd_uuid as string | undefined;
            const type = req.query.type as string | undefined;
            const startDate = req.query.start_date as string | undefined;
            const endDate = req.query.end_date as string | undefined;

            const where: any = {};
            if (prd_uuid) {
                where.prd_uuid = prd_uuid;
            }
            if (type) {
                where.stkm_type = type.toUpperCase();
            }
            if (startDate || endDate) {
                where.stkm_createdat = {};
                if (startDate) {
                    where.stkm_createdat[Op.gte] = new Date(startDate);
                }
                if (endDate) {
                    where.stkm_createdat[Op.lte] = new Date(endDate);
                }
            }

            if (page && perPage) {
                const paginationQuery = getPaginationQuery(page, perPage);
                const result = await this.stockMovementUseCase.getMovementsAndCount(cmp_uuid, {
                    ...paginationQuery,
                    where
                });

                return res.status(200).json({
                    success: true,
                    message: "Movimientos de stock retornados.",
                    ...paginateDbResult(result, page, perPage)
                });
            } else {
                const movements = await this.stockMovementUseCase.getMovements(cmp_uuid, { where });
                return res.status(200).json({
                    success: true,
                    message: "Movimientos de stock retornados.",
                    data: movements
                });
            }
        } catch (error: any) {
            console.error("Error en getAllCtrl (stock movement):", error.message);
            return res.status(400).json({
                success: false,
                message: "No se pudo recuperar los movimientos de stock.",
                error: error.message
            });
        }
    }

    public async getCtrl(req: Request, res: Response) {
        try {
            const cmp_uuid = (req.params.cmp_uuid || (req as any).tenant?.cmp_uuid) as string;
            const stkm_uuid = req.params.stkm_uuid;

            if (!cmp_uuid || !stkm_uuid) {
                return res.status(400).json({
                    success: false,
                    message: "No se pudo recuperar el movimiento de stock.",
                    error: "Debe proporcionar cmp_uuid y stkm_uuid válidos."
                });
            }

            const movement = await this.stockMovementUseCase.getDetailMovement(cmp_uuid, stkm_uuid);
            return res.status(200).json({
                success: true,
                message: "Movimiento de stock retornado.",
                data: movement
            });
        } catch (error: any) {
            console.error("Error en getCtrl (stock movement):", error.message);
            return res.status(404).json({
                success: false,
                message: "No se pudo recuperar el movimiento de stock.",
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
                    message: "No se pudo registrar el movimiento de stock.",
                    error: "Debe proporcionar el identificador de la empresa (cmp_uuid)."
                });
            }

            if (!usr_uuid) {
                return res.status(401).json({
                    success: false,
                    message: "No se pudo registrar el movimiento de stock.",
                    error: "Token de usuario inválido o no autenticado."
                });
            }

            const movement = await this.stockMovementUseCase.registerMovement({
                ...req.body,
                cmp_uuid,
                usr_uuid
            });

            return res.status(201).json({
                success: true,
                message: "Movimiento de stock registrado y balance actualizado exitosamente.",
                data: movement
            });
        } catch (error: any) {
            console.error("Error en insertCtrl (stock movement):", error.message);
            return res.status(400).json({
                success: false,
                message: "No se pudo registrar el movimiento de stock.",
                error: error.message
            });
        }
    }

    public async dispatchLoadCtrl(req: Request, res: Response) {
        try {
            const cmp_uuid = (req.body.cmp_uuid || (req as any).tenant?.cmp_uuid) as string;
            const user = (req as any).user;
            const usr_uuid = user?.sub || user?.usr_uuid;
            const items = req.body.items as { prd_uuid: string; quantity: number }[];
            const notes = req.body.notes || 'Carga y despacho de camioneta para reparto';

            if (!cmp_uuid) {
                return res.status(400).json({
                    success: false,
                    message: "Debe proporcionar cmp_uuid."
                });
            }

            if (!items || !Array.isArray(items) || items.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Debe incluir los productos y cantidades a cargar en la camioneta."
                });
            }

            const results = [];
            for (const item of items) {
                if (Number(item.quantity) > 0) {
                    const m = await this.stockMovementUseCase.registerMovement({
                        cmp_uuid,
                        prd_uuid: item.prd_uuid,
                        usr_uuid,
                        stkm_type: 'TRUCK_LOAD_OUT',
                        stkm_quantity: Number(item.quantity),
                        stkm_notes: notes
                    });
                    results.push(m);
                }
            }

            return res.status(201).json({
                success: true,
                message: "Carga de camioneta despachada y stock descontado de cámara.",
                data: results
            });
        } catch (error: any) {
            console.error("Error en dispatchLoadCtrl:", error.message);
            return res.status(400).json({
                success: false,
                message: "Error al registrar la carga de la camioneta.",
                error: error.message
            });
        }
    }

    public async reconcileReturnCtrl(req: Request, res: Response) {
        try {
            const cmp_uuid = (req.body.cmp_uuid || (req as any).tenant?.cmp_uuid) as string;
            const user = (req as any).user;
            const usr_uuid = user?.sub || user?.usr_uuid;
            const items = req.body.items as { prd_uuid: string; quantity: number }[];
            const notes = req.body.notes || 'Reingreso de sobrante por regreso de camioneta';

            if (!cmp_uuid) {
                return res.status(400).json({
                    success: false,
                    message: "Debe proporcionar cmp_uuid."
                });
            }

            if (!items || !Array.isArray(items) || items.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Debe incluir los productos y cantidades a reingresar a la cámara."
                });
            }

            const results = [];
            for (const item of items) {
                if (Number(item.quantity) > 0) {
                    const m = await this.stockMovementUseCase.registerMovement({
                        cmp_uuid,
                        prd_uuid: item.prd_uuid,
                        usr_uuid,
                        stkm_type: 'TRUCK_RETURN_IN',
                        stkm_quantity: Number(item.quantity),
                        stkm_notes: notes
                    });
                    results.push(m);
                }
            }

            return res.status(201).json({
                success: true,
                message: "Mercadería no entregada reingresada a la cámara con éxito.",
                data: results
            });
        } catch (error: any) {
            console.error("Error en reconcileReturnCtrl:", error.message);
            return res.status(400).json({
                success: false,
                message: "Error al reingresar la mercadería a la cámara.",
                error: error.message
            });
        }
    }
}
