import { Request, Response } from "express";
import { ProductUseCase } from "../../../application/product/product-use-case";
import { getPaginationQuery, paginateDbResult } from "../../services/paginator.service";
import { Op, Sequelize } from "sequelize";

export class ProductController {
    constructor(private readonly productUseCase: ProductUseCase) {
        this.getAllCtrl = this.getAllCtrl.bind(this);
        this.getCtrl = this.getCtrl.bind(this);
        this.insertCtrl = this.insertCtrl.bind(this);
        this.updateCtrl = this.updateCtrl.bind(this);
        this.deleteCtrl = this.deleteCtrl.bind(this);
        this.getPricesCtrl = this.getPricesCtrl.bind(this);
        this.setPricesCtrl = this.setPricesCtrl.bind(this);
    }

    public async getAllCtrl(req: Request, res: Response) {
        try {
            const cmp_uuid = (req.params.cmp_uuid || req.query.cmp_uuid || (req as any).tenant?.cmp_uuid) as string;
            if (!cmp_uuid) {
                return res.status(400).json({
                    success: false,
                    message: "No se pudo recuperar los productos.",
                    error: "Debe proporcionar el identificador de la empresa (cmp_uuid)."
                });
            }

            const page = req.query.page ? parseInt(req.query.page as string) : (req.params.page ? parseInt(req.params.page) : null);
            const perPage = req.query.perPage ? parseInt(req.query.perPage as string) : (req.params.perPage ? parseInt(req.params.perPage) : null);
            const search = (req.query.search || req.params.filter) as string | undefined;
            const type = req.query.type as string | undefined;
            const activeOnly = req.query.active !== undefined ? req.query.active === 'true' : undefined;
            const lowStockOnly = req.query.low_stock === 'true';

            const where: any = {};
            if (activeOnly !== undefined) {
                where.prd_active = activeOnly;
            }
            if (type && ['FINISHED', 'SUPPLY'].includes(type.toUpperCase())) {
                where.prd_type = type.toUpperCase();
            }
            if (lowStockOnly) {
                where[Op.and] = [
                    Sequelize.where(Sequelize.col('prd_currentstock'), '<=', Sequelize.col('prd_minstockalert'))
                ];
            }
            if (search && search.trim() !== '') {
                const term = `%${search.trim()}%`;
                where[Op.or] = [
                    { prd_code: { [Op.iLike]: term } },
                    { prd_name: { [Op.iLike]: term } }
                ];
            }

            if (page && perPage) {
                const paginationQuery = getPaginationQuery(page, perPage);
                const result = await this.productUseCase.getProductsAndCount(cmp_uuid, {
                    ...paginationQuery,
                    where
                });

                return res.status(200).json({
                    success: true,
                    message: "Productos retornados.",
                    ...paginateDbResult(result, page, perPage)
                });
            } else {
                const products = await this.productUseCase.getProducts(cmp_uuid, { where });
                return res.status(200).json({
                    success: true,
                    message: "Productos retornados.",
                    data: products
                });
            }
        } catch (error: any) {
            console.error("Error en getAllCtrl (product controller):", error.message);
            return res.status(400).json({
                success: false,
                message: "No se pudo recuperar los productos.",
                error: error.message
            });
        }
    }

    public async getCtrl(req: Request, res: Response) {
        try {
            const cmp_uuid = (req.params.cmp_uuid || (req as any).tenant?.cmp_uuid) as string;
            const prd_uuid = req.params.prd_uuid;

            if (!cmp_uuid || !prd_uuid) {
                return res.status(400).json({
                    success: false,
                    message: "No se pudo recuperar el producto.",
                    error: "Debe proporcionar cmp_uuid y prd_uuid válidos."
                });
            }

            const product = await this.productUseCase.getDetailProduct(cmp_uuid, prd_uuid);
            return res.status(200).json({
                success: true,
                message: "Producto retornado.",
                data: product
            });
        } catch (error: any) {
            console.error("Error en getCtrl (product controller):", error.message);
            return res.status(404).json({
                success: false,
                message: "No se pudo recuperar el producto.",
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
                    message: "No se pudo crear el producto.",
                    error: "Debe proporcionar el identificador de la empresa (cmp_uuid)."
                });
            }

            const product = await this.productUseCase.createProduct({
                ...req.body,
                cmp_uuid
            });

            return res.status(201).json({
                success: true,
                message: "Producto creado exitosamente.",
                data: product
            });
        } catch (error: any) {
            console.error("Error en insertCtrl (product controller):", error.message);
            return res.status(400).json({
                success: false,
                message: "No se pudo crear el producto.",
                error: error.message
            });
        }
    }

    public async updateCtrl(req: Request, res: Response) {
        try {
            const cmp_uuid = (req.params.cmp_uuid || req.body.cmp_uuid || (req as any).tenant?.cmp_uuid) as string;
            const prd_uuid = req.params.prd_uuid;

            if (!cmp_uuid || !prd_uuid) {
                return res.status(400).json({
                    success: false,
                    message: "No se pudo actualizar el producto.",
                    error: "Debe proporcionar cmp_uuid y prd_uuid válidos."
                });
            }

            const updated = await this.productUseCase.updateProduct(cmp_uuid, prd_uuid, req.body);
            return res.status(200).json({
                success: true,
                message: "Producto actualizado exitosamente.",
                data: updated
            });
        } catch (error: any) {
            console.error("Error en updateCtrl (product controller):", error.message);
            return res.status(400).json({
                success: false,
                message: "No se pudo actualizar el producto.",
                error: error.message
            });
        }
    }

    public async deleteCtrl(req: Request, res: Response) {
        try {
            const cmp_uuid = (req.params.cmp_uuid || (req as any).tenant?.cmp_uuid) as string;
            const prd_uuid = req.params.prd_uuid;

            if (!cmp_uuid || !prd_uuid) {
                return res.status(400).json({
                    success: false,
                    message: "No se pudo eliminar el producto.",
                    error: "Debe proporcionar cmp_uuid y prd_uuid válidos."
                });
            }

            const deleted = await this.productUseCase.deleteProduct(cmp_uuid, prd_uuid);
            return res.status(200).json({
                success: true,
                message: "Producto eliminado exitosamente.",
                data: deleted
            });
        } catch (error: any) {
            console.error("Error en deleteCtrl (product controller):", error.message);
            return res.status(400).json({
                success: false,
                message: "No se pudo eliminar el producto.",
                error: error.message
            });
        }
    }

    public async getPricesCtrl(req: Request, res: Response) {
        try {
            const cmp_uuid = (req.params.cmp_uuid || (req as any).tenant?.cmp_uuid) as string;
            const prd_uuid = req.params.prd_uuid;

            if (!cmp_uuid || !prd_uuid) {
                return res.status(400).json({
                    success: false,
                    message: "No se pudo recuperar los precios.",
                    error: "Debe proporcionar cmp_uuid y prd_uuid válidos."
                });
            }

            const prices = await this.productUseCase.getProductPrices(cmp_uuid, prd_uuid);
            return res.status(200).json({
                success: true,
                message: "Precios de producto retornados.",
                data: prices
            });
        } catch (error: any) {
            console.error("Error en getPricesCtrl (product controller):", error.message);
            return res.status(400).json({
                success: false,
                message: "No se pudo recuperar los precios.",
                error: error.message
            });
        }
    }

    public async setPricesCtrl(req: Request, res: Response) {
        try {
            const cmp_uuid = (req.params.cmp_uuid || req.body.cmp_uuid || (req as any).tenant?.cmp_uuid) as string;
            const prd_uuid = req.params.prd_uuid;
            const prices = req.body.prices;

            if (!cmp_uuid || !prd_uuid || !Array.isArray(prices)) {
                return res.status(400).json({
                    success: false,
                    message: "No se pudo actualizar los precios.",
                    error: "Debe proporcionar cmp_uuid, prd_uuid y un arreglo de precios."
                });
            }

            const updatedPrices = await this.productUseCase.setProductPrices(cmp_uuid, prd_uuid, prices);
            return res.status(200).json({
                success: true,
                message: "Precios de producto actualizados exitosamente.",
                data: updatedPrices
            });
        } catch (error: any) {
            console.error("Error en setPricesCtrl (product controller):", error.message);
            return res.status(400).json({
                success: false,
                message: "No se pudo actualizar los precios.",
                error: error.message
            });
        }
    }
}
