import { Request, Response } from "express";
import { PriceTierUseCase } from "../../../application/price-tier/price-tier-use-case";
import { getPaginationQuery, paginateDbResult } from "../../services/paginator.service";
import { Op } from "sequelize";

export class PriceTierController {
    constructor(private readonly priceTierUseCase: PriceTierUseCase) {
        this.getAllCtrl = this.getAllCtrl.bind(this);
        this.getCtrl = this.getCtrl.bind(this);
        this.insertCtrl = this.insertCtrl.bind(this);
        this.updateCtrl = this.updateCtrl.bind(this);
        this.deleteCtrl = this.deleteCtrl.bind(this);
        this.setDefaultCtrl = this.setDefaultCtrl.bind(this);
    }

    public async getAllCtrl(req: Request, res: Response) {
        try {
            const cmp_uuid = (req.params.cmp_uuid || req.query.cmp_uuid || (req as any).tenant?.cmp_uuid) as string;
            if (!cmp_uuid) {
                return res.status(400).json({
                    success: false,
                    message: "No se pudo recuperar las listas de precios.",
                    error: "Debe proporcionar el identificador de la empresa (cmp_uuid)."
                });
            }

            const page = req.query.page ? parseInt(req.query.page as string) : (req.params.page ? parseInt(req.params.page) : null);
            const perPage = req.query.perPage ? parseInt(req.query.perPage as string) : (req.params.perPage ? parseInt(req.params.perPage) : null);
            const search = (req.query.search || req.params.filter) as string | undefined;
            const activeOnly = req.query.active !== undefined ? req.query.active === 'true' : undefined;

            const where: any = {};
            if (activeOnly !== undefined) {
                where.prct_active = activeOnly;
            }
            if (search && search.trim() !== '') {
                const term = `%${search.trim()}%`;
                where[Op.or] = [
                    { prct_code: { [Op.iLike]: term } },
                    { prct_name: { [Op.iLike]: term } }
                ];
            }

            if (page && perPage) {
                const paginationQuery = getPaginationQuery(page, perPage);
                const result = await this.priceTierUseCase.getPriceTiersAndCount(cmp_uuid, {
                    ...paginationQuery,
                    where
                });

                return res.status(200).json({
                    success: true,
                    message: "Listas de precios retornadas.",
                    ...paginateDbResult(result, page, perPage)
                });
            } else {
                const tiers = await this.priceTierUseCase.getPriceTiers(cmp_uuid, { where });
                return res.status(200).json({
                    success: true,
                    message: "Listas de precios retornadas.",
                    data: tiers
                });
            }
        } catch (error: any) {
            console.error("Error en getAllCtrl (price tier):", error.message);
            return res.status(400).json({
                success: false,
                message: "No se pudo recuperar las listas de precios.",
                error: error.message
            });
        }
    }

    public async getCtrl(req: Request, res: Response) {
        try {
            const cmp_uuid = (req.params.cmp_uuid || (req as any).tenant?.cmp_uuid) as string;
            const prct_uuid = req.params.prct_uuid;

            if (!cmp_uuid || !prct_uuid) {
                return res.status(400).json({
                    success: false,
                    message: "No se pudo recuperar la lista de precios.",
                    error: "Debe proporcionar cmp_uuid y prct_uuid válidos."
                });
            }

            const tier = await this.priceTierUseCase.getDetailPriceTier(cmp_uuid, prct_uuid);
            return res.status(200).json({
                success: true,
                message: "Lista de precios retornada.",
                data: tier
            });
        } catch (error: any) {
            console.error("Error en getCtrl (price tier):", error.message);
            return res.status(404).json({
                success: false,
                message: "No se pudo recuperar la lista de precios.",
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
                    message: "No se pudo crear la lista de precios.",
                    error: "Debe proporcionar el identificador de la empresa (cmp_uuid)."
                });
            }

            const tier = await this.priceTierUseCase.createPriceTier({
                ...req.body,
                cmp_uuid
            });

            return res.status(201).json({
                success: true,
                message: "Lista de precios creada exitosamente.",
                data: tier
            });
        } catch (error: any) {
            console.error("Error en insertCtrl (price tier):", error.message);
            return res.status(400).json({
                success: false,
                message: "No se pudo crear la lista de precios.",
                error: error.message
            });
        }
    }

    public async updateCtrl(req: Request, res: Response) {
        try {
            const cmp_uuid = (req.params.cmp_uuid || req.body.cmp_uuid || (req as any).tenant?.cmp_uuid) as string;
            const prct_uuid = req.params.prct_uuid;

            if (!cmp_uuid || !prct_uuid) {
                return res.status(400).json({
                    success: false,
                    message: "No se pudo actualizar la lista de precios.",
                    error: "Debe proporcionar cmp_uuid y prct_uuid válidos."
                });
            }

            const updated = await this.priceTierUseCase.updatePriceTier(cmp_uuid, prct_uuid, req.body);
            return res.status(200).json({
                success: true,
                message: "Lista de precios actualizada exitosamente.",
                data: updated
            });
        } catch (error: any) {
            console.error("Error en updateCtrl (price tier):", error.message);
            return res.status(400).json({
                success: false,
                message: "No se pudo actualizar la lista de precios.",
                error: error.message
            });
        }
    }

    public async deleteCtrl(req: Request, res: Response) {
        try {
            const cmp_uuid = (req.params.cmp_uuid || (req as any).tenant?.cmp_uuid) as string;
            const prct_uuid = req.params.prct_uuid;

            if (!cmp_uuid || !prct_uuid) {
                return res.status(400).json({
                    success: false,
                    message: "No se pudo eliminar la lista de precios.",
                    error: "Debe proporcionar cmp_uuid y prct_uuid válidos."
                });
            }

            const deleted = await this.priceTierUseCase.deletePriceTier(cmp_uuid, prct_uuid);
            return res.status(200).json({
                success: true,
                message: "Lista de precios eliminada exitosamente.",
                data: deleted
            });
        } catch (error: any) {
            console.error("Error en deleteCtrl (price tier):", error.message);
            return res.status(400).json({
                success: false,
                message: "No se pudo eliminar la lista de precios.",
                error: error.message
            });
        }
    }

    public async setDefaultCtrl(req: Request, res: Response) {
        try {
            const cmp_uuid = (req.params.cmp_uuid || (req as any).tenant?.cmp_uuid) as string;
            const prct_uuid = req.params.prct_uuid;

            if (!cmp_uuid || !prct_uuid) {
                return res.status(400).json({
                    success: false,
                    message: "No se pudo establecer la lista de precios por defecto.",
                    error: "Debe proporcionar cmp_uuid y prct_uuid válidos."
                });
            }

            const updated = await this.priceTierUseCase.setDefaultPriceTier(cmp_uuid, prct_uuid);
            return res.status(200).json({
                success: true,
                message: "Lista de precios establecida como predeterminada.",
                data: updated
            });
        } catch (error: any) {
            console.error("Error en setDefaultCtrl (price tier):", error.message);
            return res.status(400).json({
                success: false,
                message: "No se pudo establecer la lista de precios por defecto.",
                error: error.message
            });
        }
    }
}
