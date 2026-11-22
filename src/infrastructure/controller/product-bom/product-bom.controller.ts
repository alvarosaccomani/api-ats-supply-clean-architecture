import { Request, Response } from "express";
import { ProductBomUseCase } from "../../../application/product-bom/product-bom-use-case";
import { getPaginationQuery, paginateDbResult } from "../../services/paginator.service";

export class ProductBomController {
    constructor(private readonly productBomUseCase: ProductBomUseCase) {
        this.getRecipeCtrl = this.getRecipeCtrl.bind(this);
        this.getAllCtrl = this.getAllCtrl.bind(this);
        this.getCtrl = this.getCtrl.bind(this);
        this.insertCtrl = this.insertCtrl.bind(this);
        this.setFullRecipeCtrl = this.setFullRecipeCtrl.bind(this);
        this.deleteCtrl = this.deleteCtrl.bind(this);
        this.deleteRecipeCtrl = this.deleteRecipeCtrl.bind(this);
    }

    public async getRecipeCtrl(req: Request, res: Response) {
        try {
            const cmp_uuid = (req.params.cmp_uuid || (req as any).tenant?.cmp_uuid) as string;
            const prd_uuid_finished = req.params.prd_uuid_finished;

            if (!cmp_uuid || !prd_uuid_finished) {
                return res.status(400).json({
                    success: false,
                    message: "No se pudo recuperar la receta.",
                    error: "Debe proporcionar cmp_uuid y prd_uuid_finished válidos."
                });
            }

            const recipe = await this.productBomUseCase.getRecipe(cmp_uuid, prd_uuid_finished);
            return res.status(200).json({
                success: true,
                message: "Receta del producto retornada.",
                data: recipe
            });
        } catch (error: any) {
            console.error("Error en getRecipeCtrl (BOM controller):", error.message);
            return res.status(400).json({
                success: false,
                message: "No se pudo recuperar la receta.",
                error: error.message
            });
        }
    }

    public async getAllCtrl(req: Request, res: Response) {
        try {
            const cmp_uuid = (req.params.cmp_uuid || req.query.cmp_uuid || (req as any).tenant?.cmp_uuid) as string;
            if (!cmp_uuid) {
                return res.status(400).json({
                    success: false,
                    message: "No se pudo recuperar la lista de recetas.",
                    error: "Debe proporcionar el identificador de la empresa (cmp_uuid)."
                });
            }

            const page = req.query.page ? parseInt(req.query.page as string) : (req.params.page ? parseInt(req.params.page) : null);
            const perPage = req.query.perPage ? parseInt(req.query.perPage as string) : (req.params.perPage ? parseInt(req.params.perPage) : null);
            const prd_uuid_finished = req.query.prd_uuid_finished as string | undefined;

            const where: any = {};
            if (prd_uuid_finished) {
                where.prd_uuid_finished = prd_uuid_finished;
            }

            if (page && perPage) {
                const paginationQuery = getPaginationQuery(page, perPage);
                const result = await this.productBomUseCase.getBomItemsAndCount(cmp_uuid, {
                    ...paginationQuery,
                    where
                });

                return res.status(200).json({
                    success: true,
                    message: "Componentes de receta retornados.",
                    ...paginateDbResult(result, page, perPage)
                });
            } else {
                const result = await this.productBomUseCase.getBomItemsAndCount(cmp_uuid, { where });
                return res.status(200).json({
                    success: true,
                    message: "Componentes de receta retornados.",
                    data: result.rows
                });
            }
        } catch (error: any) {
            console.error("Error en getAllCtrl (BOM controller):", error.message);
            return res.status(400).json({
                success: false,
                message: "No se pudo recuperar los componentes de receta.",
                error: error.message
            });
        }
    }

    public async getCtrl(req: Request, res: Response) {
        try {
            const cmp_uuid = (req.params.cmp_uuid || (req as any).tenant?.cmp_uuid) as string;
            const prdbom_uuid = req.params.prdbom_uuid;

            if (!cmp_uuid || !prdbom_uuid) {
                return res.status(400).json({
                    success: false,
                    message: "No se pudo recuperar el componente de receta.",
                    error: "Debe proporcionar cmp_uuid y prdbom_uuid válidos."
                });
            }

            const item = await this.productBomUseCase.getDetailBomItem(cmp_uuid, prdbom_uuid);
            return res.status(200).json({
                success: true,
                message: "Componente de receta retornado.",
                data: item
            });
        } catch (error: any) {
            console.error("Error en getCtrl (BOM controller):", error.message);
            return res.status(404).json({
                success: false,
                message: "No se pudo recuperar el componente de receta.",
                error: error.message
            });
        }
    }

    public async insertCtrl(req: Request, res: Response) {
        try {
            const cmp_uuid = (req.body.cmp_uuid || req.params.cmp_uuid || (req as any).tenant?.cmp_uuid) as string;
            const { prd_uuid_finished, prd_uuid_supply, prdbom_quantityperunit } = req.body;

            if (!cmp_uuid) {
                return res.status(400).json({
                    success: false,
                    message: "No se pudo guardar el componente en la receta.",
                    error: "Debe proporcionar el identificador de la empresa (cmp_uuid)."
                });
            }

            const item = await this.productBomUseCase.addOrUpdateBomItem(
                cmp_uuid,
                prd_uuid_finished,
                prd_uuid_supply,
                prdbom_quantityperunit
            );

            return res.status(201).json({
                success: true,
                message: "Componente guardado en la receta exitosamente.",
                data: item
            });
        } catch (error: any) {
            console.error("Error en insertCtrl (BOM controller):", error.message);
            return res.status(400).json({
                success: false,
                message: "No se pudo guardar el componente en la receta.",
                error: error.message
            });
        }
    }

    public async setFullRecipeCtrl(req: Request, res: Response) {
        try {
            const cmp_uuid = (req.params.cmp_uuid || req.body.cmp_uuid || (req as any).tenant?.cmp_uuid) as string;
            const prd_uuid_finished = req.params.prd_uuid_finished;
            const items = req.body.items;

            if (!cmp_uuid || !prd_uuid_finished) {
                return res.status(400).json({
                    success: false,
                    message: "No se pudo actualizar la receta.",
                    error: "Debe proporcionar cmp_uuid y prd_uuid_finished válidos."
                });
            }

            if (!Array.isArray(items)) {
                return res.status(400).json({
                    success: false,
                    message: "No se pudo actualizar la receta.",
                    error: "Debe proporcionar una lista de insumos en el campo 'items'."
                });
            }

            const recipe = await this.productBomUseCase.setFullRecipe(cmp_uuid, prd_uuid_finished, items);
            return res.status(200).json({
                success: true,
                message: "Receta completa actualizada exitosamente.",
                data: recipe
            });
        } catch (error: any) {
            console.error("Error en setFullRecipeCtrl (BOM controller):", error.message);
            return res.status(400).json({
                success: false,
                message: "No se pudo actualizar la receta.",
                error: error.message
            });
        }
    }

    public async deleteCtrl(req: Request, res: Response) {
        try {
            const cmp_uuid = (req.params.cmp_uuid || (req as any).tenant?.cmp_uuid) as string;
            const prdbom_uuid = req.params.prdbom_uuid;

            if (!cmp_uuid || !prdbom_uuid) {
                return res.status(400).json({
                    success: false,
                    message: "No se pudo eliminar el componente de la receta.",
                    error: "Debe proporcionar cmp_uuid y prdbom_uuid válidos."
                });
            }

            const deleted = await this.productBomUseCase.deleteBomItem(cmp_uuid, prdbom_uuid);
            return res.status(200).json({
                success: true,
                message: "Componente eliminado de la receta exitosamente.",
                data: deleted
            });
        } catch (error: any) {
            console.error("Error en deleteCtrl (BOM controller):", error.message);
            return res.status(400).json({
                success: false,
                message: "No se pudo eliminar el componente de la receta.",
                error: error.message
            });
        }
    }

    public async deleteRecipeCtrl(req: Request, res: Response) {
        try {
            const cmp_uuid = (req.params.cmp_uuid || (req as any).tenant?.cmp_uuid) as string;
            const prd_uuid_finished = req.params.prd_uuid_finished;

            if (!cmp_uuid || !prd_uuid_finished) {
                return res.status(400).json({
                    success: false,
                    message: "No se pudo eliminar la receta.",
                    error: "Debe proporcionar cmp_uuid y prd_uuid_finished válidos."
                });
            }

            const result = await this.productBomUseCase.deleteRecipe(cmp_uuid, prd_uuid_finished);
            return res.status(200).json({
                success: true,
                message: "Receta completa eliminada exitosamente.",
                data: result
            });
        } catch (error: any) {
            console.error("Error en deleteRecipeCtrl (BOM controller):", error.message);
            return res.status(400).json({
                success: false,
                message: "No se pudo eliminar la receta.",
                error: error.message
            });
        }
    }
}
