import { Express } from "express";
import { SequelizeOrderRepository } from "../../repository/order/sequelize-order.repository";
import { SequelizeCustomerRepository } from "../../repository/customer/sequelize-customer.repository";
import { SequelizeProductRepository } from "../../repository/product/sequelize-product.repository";
import { SequelizeStockMovementRepository } from "../../repository/stock-movement/sequelize-stock-movement.repository";
import { SequelizeCompanySettingRepository } from "../../repository/company-setting/sequelize-company-setting.repository";
import { SequelizeCustomerMovementRepository } from "../../repository/customer-movement/sequelize-customer-movement.repository";
import { StockMovementUseCase } from "../../../application/stock-movement/stock-movement-use-case";
import { CustomerMovementUseCase } from "../../../application/customer-movement/customer-movement-use-case";
import { OrderUseCase } from "../../../application/order/order-use-case";
import { OrderController } from "../../controller/order/order.controller";
import { authMiddleware, tenantMiddleware } from "../../middlewares";
import SocketAdapter from "../../services/socketAdapter";

function configureOrderRoutes(app: Express, socketAdapter?: SocketAdapter) {
    const orderRepository = new SequelizeOrderRepository();
    const customerRepository = new SequelizeCustomerRepository();
    const productRepository = new SequelizeProductRepository();
    const stockMovementRepository = new SequelizeStockMovementRepository();
    const companySettingRepository = new SequelizeCompanySettingRepository();
    const customerMovementRepository = new SequelizeCustomerMovementRepository();

    const stockMovementUseCase = new StockMovementUseCase(stockMovementRepository, productRepository);
    const customerMovementUseCase = new CustomerMovementUseCase(customerMovementRepository, customerRepository);
    const orderUseCase = new OrderUseCase(orderRepository, customerRepository, productRepository, stockMovementUseCase, companySettingRepository, customerMovementUseCase);
    const controller = new OrderController(orderUseCase);

    const basePrefix = process.env.BASE_URL_API || 'api';

    /**
     * @swagger
     * /api/orders/{cmp_uuid}:
     *   get:
     *     summary: Listar pedidos de una empresa (soporta filtros y paginación)
     *     tags: [Orders]
     *     security:
     *       - bearerAuth: []
     */
    app.get(`/${basePrefix}/orders/:cmp_uuid/:page?/:perPage?`, authMiddleware, tenantMiddleware, controller.getAllCtrl);

    /**
     * @swagger
     * /api/order/{cmp_uuid}/{ord_uuid}:
     *   get:
     *     summary: Obtener detalle completo de un pedido con ítems
     *     tags: [Orders]
     *     security:
     *       - bearerAuth: []
     */
    app.get(`/${basePrefix}/order/:cmp_uuid/:ord_uuid`, authMiddleware, tenantMiddleware, controller.getCtrl);

    /**
     * @swagger
     * /api/order:
     *   post:
     *     summary: Registrar un nuevo pedido con sus ítems
     *     tags: [Orders]
     *     security:
     *       - bearerAuth: []
     */
    app.post(`/${basePrefix}/order`, authMiddleware, tenantMiddleware, controller.insertCtrl);

    /**
     * @swagger
     * /api/order/{cmp_uuid}/{ord_uuid}:
     *   put:
     *     summary: Actualizar datos, estado o ítems de un pedido
     *     tags: [Orders]
     *     security:
     *       - bearerAuth: []
     */
    app.put(`/${basePrefix}/order/:cmp_uuid/:ord_uuid`, authMiddleware, tenantMiddleware, controller.updateCtrl);

    /**
     * @swagger
     * /api/order/{cmp_uuid}/{ord_uuid}:
     *   delete:
     *     summary: Eliminar un pedido no entregado
     *     tags: [Orders]
     *     security:
     *       - bearerAuth: []
     */
    app.delete(`/${basePrefix}/order/:cmp_uuid/:ord_uuid`, authMiddleware, tenantMiddleware, controller.deleteCtrl);
}

export default configureOrderRoutes;
