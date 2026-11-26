import { Request, Response } from "express";
import { CustomerMovementUseCase } from "../../../application/customer-movement/customer-movement-use-case";
import { getPaginationQuery, paginateDbResult } from "../../services/paginator.service";
import { Op } from "sequelize";

export class CustomerMovementController {
    constructor(private readonly customerMovementUseCase: CustomerMovementUseCase) {
        this.getAllCtrl = this.getAllCtrl.bind(this);
        this.getBalanceCtrl = this.getBalanceCtrl.bind(this);
        this.registerPaymentCtrl = this.registerPaymentCtrl.bind(this);
        this.insertCtrl = this.insertCtrl.bind(this);
    }

    public async getAllCtrl(req: Request, res: Response) {
        try {
            const cmp_uuid = (req.params.cmp_uuid || req.query.cmp_uuid || (req as any).tenant?.cmp_uuid) as string;
            const cus_uuid = req.params.cus_uuid as string;

            if (!cmp_uuid || !cus_uuid) {
                return res.status(400).json({
                    success: false,
                    message: "No se pudo recuperar los movimientos de cuenta corriente.",
                    error: "Debe proporcionar cmp_uuid y cus_uuid."
                });
            }

            const page = req.query.page ? parseInt(req.query.page as string) : (req.params.page ? parseInt(req.params.page) : null);
            const perPage = req.query.perPage ? parseInt(req.query.perPage as string) : (req.params.perPage ? parseInt(req.params.perPage) : null);
            const type = req.query.type as string | undefined;
            const startDate = req.query.start_date as string | undefined;
            const endDate = req.query.end_date as string | undefined;

            const where: any = {};
            if (type && type.trim() !== '') {
                where.cusm_type = type;
            }
            if (startDate && endDate) {
                where.cusm_createdat = {
                    [Op.between]: [new Date(startDate), new Date(endDate)]
                };
            } else if (startDate) {
                where.cusm_createdat = {
                    [Op.gte]: new Date(startDate)
                };
            } else if (endDate) {
                where.cusm_createdat = {
                    [Op.lte]: new Date(endDate)
                };
            }

            if (page && perPage) {
                const paginationQuery = getPaginationQuery(page, perPage);
                const result = await this.customerMovementUseCase.getMovementsAndCount(cmp_uuid, cus_uuid, {
                    ...paginationQuery,
                    where
                });

                const paginated = paginateDbResult(result, page, perPage);
                return res.status(200).json({
                    success: true,
                    message: "Extracto de cuenta corriente obtenido.",
                    ...paginated
                });
            }

            const movements = await this.customerMovementUseCase.getMovements(cmp_uuid, cus_uuid, { where });
            return res.status(200).json({
                success: true,
                message: "Extracto de cuenta corriente obtenido.",
                data: movements
            });
        } catch (error: any) {
            console.error("Error en getAllCtrl (customer movement controller):", error.message);
            return res.status(400).json({
                success: false,
                message: "Error al consultar los movimientos de cuenta corriente.",
                error: error.message
            });
        }
    }

    public async getBalanceCtrl(req: Request, res: Response) {
        try {
            const cmp_uuid = (req.params.cmp_uuid || (req as any).tenant?.cmp_uuid) as string;
            const cus_uuid = req.params.cus_uuid as string;

            if (!cmp_uuid || !cus_uuid) {
                return res.status(400).json({
                    success: false,
                    message: "Debe proporcionar cmp_uuid y cus_uuid."
                });
            }

            const balance = await this.customerMovementUseCase.getCustomerBalance(cmp_uuid, cus_uuid);
            return res.status(200).json({
                success: true,
                message: "Saldo de cuenta corriente obtenido.",
                data: balance
            });
        } catch (error: any) {
            console.error("Error en getBalanceCtrl (customer movement controller):", error.message);
            return res.status(400).json({
                success: false,
                message: "Error al consultar el saldo del cliente.",
                error: error.message
            });
        }
    }

    public async registerPaymentCtrl(req: Request, res: Response) {
        try {
            const cmp_uuid = (req.body.cmp_uuid || (req as any).tenant?.cmp_uuid) as string;
            const user = (req as any).user;
            const usr_uuid = user?.sub || user?.usr_uuid;
            const { cus_uuid, amount, ord_uuid, payment_method, receipt_number, notes } = req.body;

            if (!cmp_uuid || !cus_uuid) {
                return res.status(400).json({
                    success: false,
                    message: "Debe proporcionar cmp_uuid y cus_uuid."
                });
            }

            if (!amount || Number(amount) <= 0) {
                return res.status(400).json({
                    success: false,
                    message: "El importe del pago debe ser mayor a cero."
                });
            }

            const movement = await this.customerMovementUseCase.registerMovement({
                cmp_uuid,
                cus_uuid,
                usr_uuid,
                cusm_type: 'PAYMENT_CREDIT',
                cusm_amount: Number(amount),
                ord_uuid: ord_uuid || null,
                cusm_paymentmethod: payment_method || 'EFECTIVO',
                cusm_receiptnumber: receipt_number || null,
                cusm_notes: notes || 'Cobranza / Pago recibido a cuenta corriente'
            });

            return res.status(201).json({
                success: true,
                message: "Cobranza asentada en cuenta corriente con éxito.",
                data: movement
            });
        } catch (error: any) {
            console.error("Error en registerPaymentCtrl (customer movement controller):", error.message);
            return res.status(400).json({
                success: false,
                message: "Error al registrar la cobranza en cuenta corriente.",
                error: error.message
            });
        }
    }

    public async insertCtrl(req: Request, res: Response) {
        try {
            const cmp_uuid = (req.body.cmp_uuid || (req as any).tenant?.cmp_uuid) as string;
            const user = (req as any).user;
            const usr_uuid = user?.sub || user?.usr_uuid;
            const { cus_uuid, type, amount, ord_uuid, payment_method, receipt_number, notes } = req.body;

            if (!cmp_uuid || !cus_uuid || !type) {
                return res.status(400).json({
                    success: false,
                    message: "Debe proporcionar cmp_uuid, cus_uuid y type de movimiento."
                });
            }

            const movement = await this.customerMovementUseCase.registerMovement({
                cmp_uuid,
                cus_uuid,
                usr_uuid,
                cusm_type: type,
                cusm_amount: Number(amount),
                ord_uuid,
                cusm_paymentmethod: payment_method,
                cusm_receiptnumber: receipt_number,
                cusm_notes: notes
            });

            return res.status(201).json({
                success: true,
                message: "Movimiento de cuenta corriente registrado con éxito.",
                data: movement
            });
        } catch (error: any) {
            console.error("Error en insertCtrl (customer movement controller):", error.message);
            return res.status(400).json({
                success: false,
                message: "Error al registrar el movimiento en cuenta corriente.",
                error: error.message
            });
        }
    }
}
