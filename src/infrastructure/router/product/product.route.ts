import { Express } from "express";
import { SequelizeProductRepository } from "../../repository/product/sequelize-product.repository";
import { ProductUseCase } from "../../../application/product/product-use-case";
import { ProductController } from "../../controller/product/product.controller";
import { authMiddleware, tenantMiddleware } from "../../middlewares";
import SocketAdapter from "../../services/socketAdapter";

function configureProductRoutes(app: Express, socketAdapter?: SocketAdapter) {
    const repository = new SequelizeProductRepository();
    const useCase = new ProductUseCase(repository);
    const controller = new ProductController(useCase);

    const basePrefix = process.env.BASE_URL_API || 'api';

    /**
     * @swagger
     * /api/products/{cmp_uuid}:
     *   get:
     *     summary: Listar productos e insumos de una empresa (soporta filtros por tipo, stock bajo, búsqueda y paginación)
     *     tags: [Products]
     *     security:
     *       - bearerAuth: []
     */
    app.get(`/${basePrefix}/products/:cmp_uuid/:filter?/:page?/:perPage?`, authMiddleware, tenantMiddleware, controller.getAllCtrl);

    /**
     * @swagger
     * /api/product/{cmp_uuid}/{prd_uuid}:
     *   get:
     *     summary: Obtener detalle de un producto por UUID incluyendo su matriz de precios
     *     tags: [Products]
     *     security:
     *       - bearerAuth: []
     */
    app.get(`/${basePrefix}/product/:cmp_uuid/:prd_uuid`, authMiddleware, tenantMiddleware, controller.getCtrl);

    /**
     * @swagger
     * /api/product:
     *   post:
     *     summary: Registrar un nuevo producto o insumo para una empresa
     *     tags: [Products]
     *     security:
     *       - bearerAuth: []
     */
    app.post(`/${basePrefix}/product`, authMiddleware, tenantMiddleware, controller.insertCtrl);

    /**
     * @swagger
     * /api/product/{cmp_uuid}/{prd_uuid}:
     *   put:
     *     summary: Actualizar un producto existente y sus precios
     *     tags: [Products]
     *     security:
     *       - bearerAuth: []
     */
    app.put(`/${basePrefix}/product/:cmp_uuid/:prd_uuid`, authMiddleware, tenantMiddleware, controller.updateCtrl);

    /**
     * @swagger
     * /api/product/{cmp_uuid}/{prd_uuid}:
     *   delete:
     *     summary: Eliminar un producto por UUID
     *     tags: [Products]
     *     security:
     *       - bearerAuth: []
     */
    app.delete(`/${basePrefix}/product/:cmp_uuid/:prd_uuid`, authMiddleware, tenantMiddleware, controller.deleteCtrl);

    /**
     * @swagger
     * /api/product-prices/{cmp_uuid}/{prd_uuid}:
     *   get:
     *     summary: Obtener matriz de precios asignados a un producto
     *     tags: [Products]
     *     security:
     *       - bearerAuth: []
     */
    app.get(`/${basePrefix}/product-prices/:cmp_uuid/:prd_uuid`, authMiddleware, tenantMiddleware, controller.getPricesCtrl);

    /**
     * @swagger
     * /api/product-prices/{cmp_uuid}/{prd_uuid}:
     *   put:
     *     summary: Actualizar matriz de precios de un producto
     *     tags: [Products]
     *     security:
     *       - bearerAuth: []
     */
    app.put(`/${basePrefix}/product-prices/:cmp_uuid/:prd_uuid`, authMiddleware, tenantMiddleware, controller.setPricesCtrl);
}

export default configureProductRoutes;
