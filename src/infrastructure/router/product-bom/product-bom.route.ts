import { Express } from "express";
import { SequelizeProductBomRepository } from "../../repository/product-bom/sequelize-product-bom.repository";
import { SequelizeProductRepository } from "../../repository/product/sequelize-product.repository";
import { ProductBomUseCase } from "../../../application/product-bom/product-bom-use-case";
import { ProductBomController } from "../../controller/product-bom/product-bom.controller";
import { authMiddleware, tenantMiddleware } from "../../middlewares";
import SocketAdapter from "../../services/socketAdapter";

function configureProductBomRoutes(app: Express, socketAdapter?: SocketAdapter) {
    const bomRepository = new SequelizeProductBomRepository();
    const productRepository = new SequelizeProductRepository();
    const useCase = new ProductBomUseCase(bomRepository, productRepository);
    const controller = new ProductBomController(useCase);

    const basePrefix = process.env.BASE_URL_API || 'api';

    /**
     * @swagger
     * /api/product-bom/recipe/{cmp_uuid}/{prd_uuid_finished}:
     *   get:
     *     summary: Obtener la receta / fórmula de un producto terminado
     *     tags: [Product BOM]
     *     security:
     *       - bearerAuth: []
     */
    app.get(`/${basePrefix}/product-bom/recipe/:cmp_uuid/:prd_uuid_finished`, authMiddleware, tenantMiddleware, controller.getRecipeCtrl);

    /**
     * @swagger
     * /api/product-boms/{cmp_uuid}:
     *   get:
     *     summary: Listar componentes de recetas con soporte de filtros y paginación
     *     tags: [Product BOM]
     *     security:
     *       - bearerAuth: []
     */
    app.get(`/${basePrefix}/product-boms/:cmp_uuid/:filter?/:page?/:perPage?`, authMiddleware, tenantMiddleware, controller.getAllCtrl);

    /**
     * @swagger
     * /api/product-bom/{cmp_uuid}/{prdbom_uuid}:
     *   get:
     *     summary: Obtener detalle de un componente de receta por UUID
     *     tags: [Product BOM]
     *     security:
     *       - bearerAuth: []
     */
    app.get(`/${basePrefix}/product-bom/:cmp_uuid/:prdbom_uuid`, authMiddleware, tenantMiddleware, controller.getCtrl);

    /**
     * @swagger
     * /api/product-bom:
     *   post:
     *     summary: Agregar o actualizar un componente individual en una receta
     *     tags: [Product BOM]
     *     security:
     *       - bearerAuth: []
     */
    app.post(`/${basePrefix}/product-bom`, authMiddleware, tenantMiddleware, controller.insertCtrl);

    /**
     * @swagger
     * /api/product-bom/recipe/{cmp_uuid}/{prd_uuid_finished}:
     *   put:
     *     summary: Guardar / reemplazar en lote la receta completa de un producto terminado
     *     tags: [Product BOM]
     *     security:
     *       - bearerAuth: []
     */
    app.put(`/${basePrefix}/product-bom/recipe/:cmp_uuid/:prd_uuid_finished`, authMiddleware, tenantMiddleware, controller.setFullRecipeCtrl);

    /**
     * @swagger
     * /api/product-bom/{cmp_uuid}/{prdbom_uuid}:
     *   delete:
     *     summary: Eliminar un componente individual de una receta
     *     tags: [Product BOM]
     *     security:
     *       - bearerAuth: []
     */
    app.delete(`/${basePrefix}/product-bom/:cmp_uuid/:prdbom_uuid`, authMiddleware, tenantMiddleware, controller.deleteCtrl);

    /**
     * @swagger
     * /api/product-bom/recipe/{cmp_uuid}/{prd_uuid_finished}:
     *   delete:
     *     summary: Eliminar la receta completa de un producto terminado
     *     tags: [Product BOM]
     *     security:
     *       - bearerAuth: []
     */
    app.delete(`/${basePrefix}/product-bom/recipe/:cmp_uuid/:prd_uuid_finished`, authMiddleware, tenantMiddleware, controller.deleteRecipeCtrl);
}

export default configureProductBomRoutes;
