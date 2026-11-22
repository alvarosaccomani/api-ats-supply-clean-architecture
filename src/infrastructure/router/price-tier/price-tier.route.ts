import { Express } from "express";
import { SequelizePriceTierRepository } from "../../repository/price-tier/sequelize-price-tier.repository";
import { PriceTierUseCase } from "../../../application/price-tier/price-tier-use-case";
import { PriceTierController } from "../../controller/price-tier/price-tier.controller";
import { authMiddleware, tenantMiddleware } from "../../middlewares";
import SocketAdapter from "../../services/socketAdapter";

function configurePriceTierRoutes(app: Express, socketAdapter?: SocketAdapter) {
    const repository = new SequelizePriceTierRepository();
    const useCase = new PriceTierUseCase(repository);
    const controller = new PriceTierController(useCase);

    const basePrefix = process.env.BASE_URL_API || 'api';

    /**
     * @swagger
     * /api/price-tiers/{cmp_uuid}:
     *   get:
     *     summary: Obtener listas de precios de una empresa (con soporte de búsqueda y paginación)
     *     tags: [Price Tiers]
     *     security:
     *       - bearerAuth: []
     */
    app.get(`/${basePrefix}/price-tiers/:cmp_uuid/:filter?/:page?/:perPage?`, authMiddleware, tenantMiddleware, controller.getAllCtrl);

    /**
     * @swagger
     * /api/price-tier/{cmp_uuid}/{prct_uuid}:
     *   get:
     *     summary: Obtener detalle de una lista de precios por UUID
     *     tags: [Price Tiers]
     *     security:
     *       - bearerAuth: []
     */
    app.get(`/${basePrefix}/price-tier/:cmp_uuid/:prct_uuid`, authMiddleware, tenantMiddleware, controller.getCtrl);

    /**
     * @swagger
     * /api/price-tier:
     *   post:
     *     summary: Registrar una nueva lista de precios para una empresa
     *     tags: [Price Tiers]
     *     security:
     *       - bearerAuth: []
     */
    app.post(`/${basePrefix}/price-tier`, authMiddleware, tenantMiddleware, controller.insertCtrl);

    /**
     * @swagger
     * /api/price-tier/{cmp_uuid}/{prct_uuid}:
     *   put:
     *     summary: Actualizar una lista de precios existente
     *     tags: [Price Tiers]
     *     security:
     *       - bearerAuth: []
     */
    app.put(`/${basePrefix}/price-tier/:cmp_uuid/:prct_uuid`, authMiddleware, tenantMiddleware, controller.updateCtrl);

    /**
     * @swagger
     * /api/price-tier/{cmp_uuid}/{prct_uuid}:
     *   delete:
     *     summary: Eliminar una lista de precios por UUID
     *     tags: [Price Tiers]
     *     security:
     *       - bearerAuth: []
     */
    app.delete(`/${basePrefix}/price-tier/:cmp_uuid/:prct_uuid`, authMiddleware, tenantMiddleware, controller.deleteCtrl);

    /**
     * @swagger
     * /api/price-tier/{cmp_uuid}/{prct_uuid}/default:
     *   patch:
     *     summary: Establecer una lista de precios como la predeterminada de la empresa
     *     tags: [Price Tiers]
     *     security:
     *       - bearerAuth: []
     */
    app.patch(`/${basePrefix}/price-tier/:cmp_uuid/:prct_uuid/default`, authMiddleware, tenantMiddleware, controller.setDefaultCtrl);
}

export default configurePriceTierRoutes;
