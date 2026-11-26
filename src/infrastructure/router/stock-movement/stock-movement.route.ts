import { Express } from "express";
import { SequelizeStockMovementRepository } from "../../repository/stock-movement/sequelize-stock-movement.repository";
import { SequelizeProductRepository } from "../../repository/product/sequelize-product.repository";
import { StockMovementUseCase } from "../../../application/stock-movement/stock-movement-use-case";
import { StockMovementController } from "../../controller/stock-movement/stock-movement.controller";
import { authMiddleware, tenantMiddleware } from "../../middlewares";
import SocketAdapter from "../../services/socketAdapter";

function configureStockMovementRoutes(app: Express, socketAdapter?: SocketAdapter) {
    const stockMovementRepository = new SequelizeStockMovementRepository();
    const productRepository = new SequelizeProductRepository();
    const useCase = new StockMovementUseCase(stockMovementRepository, productRepository);
    const controller = new StockMovementController(useCase);

    const basePrefix = process.env.BASE_URL_API || 'api';

    /**
     * @swagger
     * /api/stock-movements/{cmp_uuid}:
     *   get:
     *     summary: Consultar movimientos de stock / Kardex con filtros y paginación
     *     tags: [Stock Movements]
     *     security:
     *       - bearerAuth: []
     */
    app.get(`/${basePrefix}/stock-movements/:cmp_uuid/:filter?/:page?/:perPage?`, authMiddleware, tenantMiddleware, controller.getAllCtrl);

    /**
     * @swagger
     * /api/stock-movement/{cmp_uuid}/{stkm_uuid}:
     *   get:
     *     summary: Consultar detalle de un movimiento de stock por UUID
     *     tags: [Stock Movements]
     *     security:
     *       - bearerAuth: []
     */
    app.get(`/${basePrefix}/stock-movement/:cmp_uuid/:stkm_uuid`, authMiddleware, tenantMiddleware, controller.getCtrl);

    /**
     * @swagger
     * /api/stock-movement:
     *   post:
     *     summary: Registrar un nuevo movimiento de stock (manual, ajuste, etc.) actualizando el balance del producto
     *     tags: [Stock Movements]
     *     security:
     *       - bearerAuth: []
     */
    app.post(`/${basePrefix}/stock-movement`, authMiddleware, tenantMiddleware, controller.insertCtrl);

    /**
     * @swagger
     * /api/delivery/dispatch-load:
     *   post:
     *     summary: Despachar y registrar salida de stock de cámara por carga de camioneta
     *     tags: [Stock Movements]
     *     security:
     *       - bearerAuth: []
     */
    app.post(`/${basePrefix}/delivery/dispatch-load`, authMiddleware, tenantMiddleware, controller.dispatchLoadCtrl);

    /**
     * @swagger
     * /api/delivery/reconcile-return:
     *   post:
     *     summary: Reingresar mercadería no entregada a la cámara al regreso del reparto
     *     tags: [Stock Movements]
     *     security:
     *       - bearerAuth: []
     */
    app.post(`/${basePrefix}/delivery/reconcile-return`, authMiddleware, tenantMiddleware, controller.reconcileReturnCtrl);
}

export default configureStockMovementRoutes;
