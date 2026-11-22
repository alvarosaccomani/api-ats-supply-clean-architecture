import { Request, Response } from "express";
import { MachineUseCase } from "../../../application/machine/machine-use-case";
import { getPaginationQuery, paginateDbResult } from "../../services/paginator.service";
import { Op } from "sequelize";

export class MachineController {
    constructor(private readonly machineUseCase: MachineUseCase) {
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
                    message: "No se pudo recuperar las máquinas.",
                    error: "Debe proporcionar el identificador de la empresa (cmp_uuid)."
                });
            }

            const page = req.query.page ? parseInt(req.query.page as string) : (req.params.page ? parseInt(req.params.page) : null);
            const perPage = req.query.perPage ? parseInt(req.query.perPage as string) : (req.params.perPage ? parseInt(req.params.perPage) : null);
            const search = (req.query.search || req.params.filter) as string | undefined;
            const activeOnly = req.query.active !== undefined ? req.query.active === 'true' : undefined;

            const where: any = {};
            if (activeOnly !== undefined) {
                where.mch_active = activeOnly;
            }
            if (search && search.trim() !== '') {
                const term = `%${search.trim()}%`;
                where[Op.or] = [
                    { mch_name: { [Op.iLike]: term } },
                    { mch_description: { [Op.iLike]: term } }
                ];
            }

            if (page && perPage) {
                const paginationQuery = getPaginationQuery(page, perPage);
                const result = await this.machineUseCase.getMachinesAndCount(cmp_uuid, {
                    ...paginationQuery,
                    where
                });

                return res.status(200).json({
                    success: true,
                    message: "Máquinas retornadas.",
                    ...paginateDbResult(result, page, perPage)
                });
            } else {
                const machines = await this.machineUseCase.getMachines(cmp_uuid, { where });
                return res.status(200).json({
                    success: true,
                    message: "Máquinas retornadas.",
                    data: machines
                });
            }
        } catch (error: any) {
            console.error("Error en getAllCtrl (machine controller):", error.message);
            return res.status(400).json({
                success: false,
                message: "No se pudo recuperar las máquinas.",
                error: error.message
            });
        }
    }

    public async getCtrl(req: Request, res: Response) {
        try {
            const cmp_uuid = (req.params.cmp_uuid || (req as any).tenant?.cmp_uuid) as string;
            const mch_uuid = req.params.mch_uuid;

            if (!cmp_uuid || !mch_uuid) {
                return res.status(400).json({
                    success: false,
                    message: "No se pudo recuperar la máquina.",
                    error: "Debe proporcionar cmp_uuid y mch_uuid válidos."
                });
            }

            const machine = await this.machineUseCase.getDetailMachine(cmp_uuid, mch_uuid);
            return res.status(200).json({
                success: true,
                message: "Máquina retornada.",
                data: machine
            });
        } catch (error: any) {
            console.error("Error en getCtrl (machine controller):", error.message);
            return res.status(404).json({
                success: false,
                message: "No se pudo recuperar la máquina.",
                error: error.message
            });
        }
    }

    public async insertCtrl(req: Request, res: Response) {
        try {
            const cmp_uuid = (req.body.cmp_uuid || req.params.cmp_uuid || (req as any).tenant?.cmp_uuid) as string;
            if (!cmp_uuid) {
                return res.status(400).json({
                    success: false,
                    message: "No se pudo registrar la máquina.",
                    error: "Debe proporcionar el identificador de la empresa (cmp_uuid)."
                });
            }

            const machine = await this.machineUseCase.createMachine({
                ...req.body,
                cmp_uuid
            });

            return res.status(201).json({
                success: true,
                message: "Máquina registrada exitosamente.",
                data: machine
            });
        } catch (error: any) {
            console.error("Error en insertCtrl (machine controller):", error.message);
            return res.status(400).json({
                success: false,
                message: "No se pudo registrar la máquina.",
                error: error.message
            });
        }
    }

    public async updateCtrl(req: Request, res: Response) {
        try {
            const cmp_uuid = (req.params.cmp_uuid || req.body.cmp_uuid || (req as any).tenant?.cmp_uuid) as string;
            const mch_uuid = req.params.mch_uuid;

            if (!cmp_uuid || !mch_uuid) {
                return res.status(400).json({
                    success: false,
                    message: "No se pudo actualizar la máquina.",
                    error: "Debe proporcionar cmp_uuid y mch_uuid válidos."
                });
            }

            const updated = await this.machineUseCase.updateMachine(cmp_uuid, mch_uuid, req.body);
            return res.status(200).json({
                success: true,
                message: "Máquina actualizada exitosamente.",
                data: updated
            });
        } catch (error: any) {
            console.error("Error en updateCtrl (machine controller):", error.message);
            return res.status(400).json({
                success: false,
                message: "No se pudo actualizar la máquina.",
                error: error.message
            });
        }
    }

    public async deleteCtrl(req: Request, res: Response) {
        try {
            const cmp_uuid = (req.params.cmp_uuid || (req as any).tenant?.cmp_uuid) as string;
            const mch_uuid = req.params.mch_uuid;

            if (!cmp_uuid || !mch_uuid) {
                return res.status(400).json({
                    success: false,
                    message: "No se pudo eliminar la máquina.",
                    error: "Debe proporcionar cmp_uuid y mch_uuid válidos."
                });
            }

            const deleted = await this.machineUseCase.deleteMachine(cmp_uuid, mch_uuid);
            return res.status(200).json({
                success: true,
                message: "Máquina eliminada exitosamente.",
                data: deleted
            });
        } catch (error: any) {
            console.error("Error en deleteCtrl (machine controller):", error.message);
            return res.status(400).json({
                success: false,
                message: "No se pudo eliminar la máquina.",
                error: error.message
            });
        }
    }
}
