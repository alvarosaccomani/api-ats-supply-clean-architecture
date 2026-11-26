import { Express } from "express";
import { SequelizeCustomerMovementRepository } from "../../repository/customer-movement/sequelize-customer-movement.repository";
import { SequelizeCustomerRepository } from "../../repository/customer/sequelize-customer.repository";
import { SequelizeOrderRepository } from "../../repository/order/sequelize-order.repository";
import { SequelizeOrderHistoryRepository } from "../../repository/order-history/sequelize-order-history.repository";
import { OrderHistoryUseCase } from "../../../application/order-history/order-history-use-case";
import { CustomerMovementUseCase } from "../../../application/customer-movement/customer-movement-use-case";
import { CustomerMovementController } from "../../controller/customer-movement/customer-movement.controller";
import { authMiddleware, tenantMiddleware } from "../../middlewares";
import SocketAdapter from "../../services/socketAdapter";

function configureCustomerMovementRoutes(app: Express, socketAdapter?: SocketAdapter) {
    const customerMovementRepository = new SequelizeCustomerMovementRepository();
    const customerRepository = new SequelizeCustomerRepository();
    const orderRepository = new SequelizeOrderRepository();
    const orderHistoryRepository = new SequelizeOrderHistoryRepository();
    const orderHistoryUseCase = new OrderHistoryUseCase(orderHistoryRepository);
    const useCase = new CustomerMovementUseCase(customerMovementRepository, customerRepository, orderRepository, orderHistoryUseCase);
    const controller = new CustomerMovementController(useCase);

    const basePrefix = process.env.BASE_URL_API || 'api';

    /**
     * @swagger
     * /api/customer-movements/{cmp_uuid}/{cus_uuid}/{page?}/{perPage?}:
     *   get:
     *     summary: Listar movimientos de cuenta corriente de un cliente
     *     tags: [CustomerMovements]
     *     security:
     *       - bearerAuth: []
     */
    app.get(`/${basePrefix}/customer-movements/:cmp_uuid/:cus_uuid/:page?/:perPage?`, authMiddleware, tenantMiddleware, controller.getAllCtrl);

    /**
     * @swagger
     * /api/customer-balance/{cmp_uuid}/{cus_uuid}:
     *   get:
     *     summary: Obtener saldo actual de cuenta corriente de un cliente
     *     tags: [CustomerMovements]
     *     security:
     *       - bearerAuth: []
     */
    app.get(`/${basePrefix}/customer-balance/:cmp_uuid/:cus_uuid`, authMiddleware, tenantMiddleware, controller.getBalanceCtrl);

    /**
     * @swagger
     * /api/customer-movement/payment:
     *   post:
     *     summary: Registrar una cobranza o pago a cuenta corriente
     *     tags: [CustomerMovements]
     *     security:
     *       - bearerAuth: []
     */
    app.post(`/${basePrefix}/customer-movement/payment`, authMiddleware, tenantMiddleware, controller.registerPaymentCtrl);

    /**
     * @swagger
     * /api/customer-movement:
     *   post:
     *     summary: Registrar un movimiento manual (ajuste o debito/credito) en cuenta corriente
     *     tags: [CustomerMovements]
     *     security:
     *       - bearerAuth: []
     */
    app.post(`/${basePrefix}/customer-movement`, authMiddleware, tenantMiddleware, controller.insertCtrl);
}

export default configureCustomerMovementRoutes;
