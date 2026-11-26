import { Express } from "express";
import { SequelizeOrderHistoryRepository } from "../../repository/order-history/sequelize-order-history.repository";
import { OrderHistoryUseCase } from "../../../application/order-history/order-history-use-case";
import { OrderHistoryController } from "../../controller/order-history/order-history.controller";
import { authMiddleware, tenantMiddleware } from "../../middlewares";
import SocketAdapter from "../../services/socketAdapter";

function configureOrderHistoryRoutes(app: Express, socketAdapter?: SocketAdapter) {
    const orderHistoryRepository = new SequelizeOrderHistoryRepository();
    const useCase = new OrderHistoryUseCase(orderHistoryRepository);
    const controller = new OrderHistoryController(useCase);

    const basePrefix = process.env.BASE_URL_API || 'api';

    /**
     * @swagger
     * /api/order-history/{cmp_uuid}/{ord_uuid}:
     *   get:
     *     summary: Obtener el historial completo y línea de tiempo de estados de un pedido
     *     tags: [OrderHistory]
     *     security:
     *       - bearerAuth: []
     */
    app.get(`/${basePrefix}/order-history/:cmp_uuid/:ord_uuid`, authMiddleware, tenantMiddleware, controller.getHistoryByOrderCtrl);

    /**
     * @swagger
     * /api/order-history:
     *   post:
     *     summary: Registrar manualmente o sincronizar una transición de estado en el historial
     *     tags: [OrderHistory]
     *     security:
     *       - bearerAuth: []
     */
    app.post(`/${basePrefix}/order-history`, authMiddleware, tenantMiddleware, controller.insertHistoryCtrl);
}

export default configureOrderHistoryRoutes;
