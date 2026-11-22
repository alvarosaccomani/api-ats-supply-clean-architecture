import { Express } from "express";
import { SequelizeProductionOrderRepository } from "../../repository/production-order/sequelize-production-order.repository";
import { SequelizeProductRepository } from "../../repository/product/sequelize-product.repository";
import { SequelizeProductBomRepository } from "../../repository/product-bom/sequelize-product-bom.repository";
import { SequelizeMachineRepository } from "../../repository/machine/sequelize-machine.repository";
import { SequelizeStockMovementRepository } from "../../repository/stock-movement/sequelize-stock-movement.repository";
import { StockMovementUseCase } from "../../../application/stock-movement/stock-movement-use-case";
import { ProductionOrderUseCase } from "../../../application/production-order/production-order-use-case";
import { ProductionOrderController } from "../../controller/production-order/production-order.controller";
import { authMiddleware, tenantMiddleware } from "../../middlewares";
import SocketAdapter from "../../services/socketAdapter";

function configureProductionOrderRoutes(app: Express, socketAdapter?: SocketAdapter) {
    const productionOrderRepository = new SequelizeProductionOrderRepository();
    const productRepository = new SequelizeProductRepository();
    const productBomRepository = new SequelizeProductBomRepository();
    const machineRepository = new SequelizeMachineRepository();
    const stockMovementRepository = new SequelizeStockMovementRepository();
    const stockMovementUseCase = new StockMovementUseCase(stockMovementRepository, productRepository);

    const useCase = new ProductionOrderUseCase(
        productionOrderRepository,
        productRepository,
        productBomRepository,
        machineRepository,
        stockMovementUseCase
    );
    const controller = new ProductionOrderController(useCase);

    const basePrefix = process.env.BASE_URL_API || 'api';

    /**
     * @swagger
     * /api/production-orders/{cmp_uuid}:
     *   get:
     *     summary: Listar órdenes de producción con filtros y paginación
     *     tags: [Production Orders]
     *     security:
     *       - bearerAuth: []
     */
    app.get(`/${basePrefix}/production-orders/:cmp_uuid/:filter?/:page?/:perPage?`, authMiddleware, tenantMiddleware, controller.getAllCtrl);

    /**
     * @swagger
     * /api/production-order/{cmp_uuid}/{prdord_uuid}:
     *   get:
     *     summary: Obtener detalle de una orden de producción por UUID
     *     tags: [Production Orders]
     *     security:
     *       - bearerAuth: []
     */
    app.get(`/${basePrefix}/production-order/:cmp_uuid/:prdord_uuid`, authMiddleware, tenantMiddleware, controller.getCtrl);

    /**
     * @swagger
     * /api/production-order:
     *   post:
     *     summary: Registrar una nueva orden de producción (si está COMPLETED, asienta ingreso de producto y consumo de insumos BOM)
     *     tags: [Production Orders]
     *     security:
     *       - bearerAuth: []
     */
    app.post(`/${basePrefix}/production-order`, authMiddleware, tenantMiddleware, controller.insertCtrl);

    /**
     * @swagger
     * /api/production-order/{cmp_uuid}/{prdord_uuid}:
     *   put:
     *     summary: Actualizar una orden de producción existente (procesa stock al cambiar a COMPLETED)
     *     tags: [Production Orders]
     *     security:
     *       - bearerAuth: []
     */
    app.put(`/${basePrefix}/production-order/:cmp_uuid/:prdord_uuid`, authMiddleware, tenantMiddleware, controller.updateCtrl);

    /**
     * @swagger
     * /api/production-order/{cmp_uuid}/{prdord_uuid}:
     *   delete:
     *     summary: Eliminar una orden de producción por UUID
     *     tags: [Production Orders]
     *     security:
     *       - bearerAuth: []
     */
    app.delete(`/${basePrefix}/production-order/:cmp_uuid/:prdord_uuid`, authMiddleware, tenantMiddleware, controller.deleteCtrl);
}

export default configureProductionOrderRoutes;
