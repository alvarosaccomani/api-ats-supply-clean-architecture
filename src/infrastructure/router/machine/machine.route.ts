import { Express } from "express";
import { SequelizeMachineRepository } from "../../repository/machine/sequelize-machine.repository";
import { MachineUseCase } from "../../../application/machine/machine-use-case";
import { MachineController } from "../../controller/machine/machine.controller";
import { authMiddleware, tenantMiddleware } from "../../middlewares";
import SocketAdapter from "../../services/socketAdapter";

function configureMachineRoutes(app: Express, socketAdapter?: SocketAdapter) {
    const repository = new SequelizeMachineRepository();
    const useCase = new MachineUseCase(repository);
    const controller = new MachineController(useCase);

    const basePrefix = process.env.BASE_URL_API || 'api';

    /**
     * @swagger
     * /api/machines/{cmp_uuid}:
     *   get:
     *     summary: Listar máquinas y líneas de producción de una empresa (soporta filtros y paginación)
     *     tags: [Machines]
     *     security:
     *       - bearerAuth: []
     */
    app.get(`/${basePrefix}/machines/:cmp_uuid/:filter?/:page?/:perPage?`, authMiddleware, tenantMiddleware, controller.getAllCtrl);

    /**
     * @swagger
     * /api/machine/{cmp_uuid}/{mch_uuid}:
     *   get:
     *     summary: Obtener detalle de una máquina por UUID
     *     tags: [Machines]
     *     security:
     *       - bearerAuth: []
     */
    app.get(`/${basePrefix}/machine/:cmp_uuid/:mch_uuid`, authMiddleware, tenantMiddleware, controller.getCtrl);

    /**
     * @swagger
     * /api/machine:
     *   post:
     *     summary: Registrar una nueva máquina o línea de producción
     *     tags: [Machines]
     *     security:
     *       - bearerAuth: []
     */
    app.post(`/${basePrefix}/machine`, authMiddleware, tenantMiddleware, controller.insertCtrl);

    /**
     * @swagger
     * /api/machine/{cmp_uuid}/{mch_uuid}:
     *   put:
     *     summary: Actualizar datos de una máquina
     *     tags: [Machines]
     *     security:
     *       - bearerAuth: []
     */
    app.put(`/${basePrefix}/machine/:cmp_uuid/:mch_uuid`, authMiddleware, tenantMiddleware, controller.updateCtrl);

    /**
     * @swagger
     * /api/machine/{cmp_uuid}/{mch_uuid}:
     *   delete:
     *     summary: Eliminar una máquina por UUID
     *     tags: [Machines]
     *     security:
     *       - bearerAuth: []
     */
    app.delete(`/${basePrefix}/machine/:cmp_uuid/:mch_uuid`, authMiddleware, tenantMiddleware, controller.deleteCtrl);
}

export default configureMachineRoutes;
