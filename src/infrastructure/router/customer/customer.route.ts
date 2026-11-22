import { Express } from "express";
import { SequelizeCustomerRepository } from "../../repository/customer/sequelize-customer.repository";
import { SequelizePriceTierRepository } from "../../repository/price-tier/sequelize-price-tier.repository";
import { CustomerUseCase } from "../../../application/customer/customer-use-case";
import { CustomerController } from "../../controller/customer/customer.controller";
import { authMiddleware, tenantMiddleware } from "../../middlewares";
import SocketAdapter from "../../services/socketAdapter";

function configureCustomerRoutes(app: Express, socketAdapter?: SocketAdapter) {
    const customerRepository = new SequelizeCustomerRepository();
    const priceTierRepository = new SequelizePriceTierRepository();
    const useCase = new CustomerUseCase(customerRepository, priceTierRepository);
    const controller = new CustomerController(useCase);

    const basePrefix = process.env.BASE_URL_API || 'api';

    /**
     * @swagger
     * /api/customers/{cmp_uuid}:
     *   get:
     *     summary: Listar clientes de una empresa (soporta filtros y paginación)
     *     tags: [Customers]
     *     security:
     *       - bearerAuth: []
     */
    app.get(`/${basePrefix}/customers/:cmp_uuid/:filter?/:page?/:perPage?`, authMiddleware, tenantMiddleware, controller.getAllCtrl);

    /**
     * @swagger
     * /api/customer/{cmp_uuid}/{cus_uuid}:
     *   get:
     *     summary: Obtener detalle de un cliente por UUID
     *     tags: [Customers]
     *     security:
     *       - bearerAuth: []
     */
    app.get(`/${basePrefix}/customer/:cmp_uuid/:cus_uuid`, authMiddleware, tenantMiddleware, controller.getCtrl);

    /**
     * @swagger
     * /api/customer:
     *   post:
     *     summary: Registrar un nuevo cliente
     *     tags: [Customers]
     *     security:
     *       - bearerAuth: []
     */
    app.post(`/${basePrefix}/customer`, authMiddleware, tenantMiddleware, controller.insertCtrl);

    /**
     * @swagger
     * /api/customer/{cmp_uuid}/{cus_uuid}:
     *   put:
     *     summary: Actualizar datos de un cliente
     *     tags: [Customers]
     *     security:
     *       - bearerAuth: []
     */
    app.put(`/${basePrefix}/customer/:cmp_uuid/:cus_uuid`, authMiddleware, tenantMiddleware, controller.updateCtrl);

    /**
     * @swagger
     * /api/customer/{cmp_uuid}/{cus_uuid}:
     *   delete:
     *     summary: Eliminar un cliente por UUID
     *     tags: [Customers]
     *     security:
     *       - bearerAuth: []
     */
    app.delete(`/${basePrefix}/customer/:cmp_uuid/:cus_uuid`, authMiddleware, tenantMiddleware, controller.deleteCtrl);
}

export default configureCustomerRoutes;
