import { Request, Response } from "express";
import { CustomerUseCase } from "../../../application/customer/customer-use-case";
import { getPaginationQuery, paginateDbResult } from "../../services/paginator.service";
import { Op } from "sequelize";

export class CustomerController {
    constructor(private readonly customerUseCase: CustomerUseCase) {
        this.getAllCtrl = this.getAllCtrl.bind(this);
        this.getCtrl = this.getCtrl.bind(this);
        this.insertCtrl = this.insertCtrl.bind(this);
        this.updateCtrl = this.updateCtrl.bind(this);
        this.deleteCtrl = this.deleteCtrl.bind(this);
    }

    public async getAllCtrl(req: Request, res: Response) {
        try {
            const cmp_uuid = (req.params.cmp_uuid || req.query.cmp_uuid || (req as any).tenant?.cmp_uuid) as string;
            if (!cmp_uuid) {
                return res.status(400).json({
                    success: false,
                    message: "No se pudo recuperar los clientes.",
                    error: "Debe proporcionar el identificador de la empresa (cmp_uuid)."
                });
            }

            const page = req.query.page ? parseInt(req.query.page as string) : (req.params.page ? parseInt(req.params.page) : null);
            const perPage = req.query.perPage ? parseInt(req.query.perPage as string) : (req.params.perPage ? parseInt(req.params.perPage) : null);
            const search = (req.query.search || req.params.filter) as string | undefined;
            const activeOnly = req.query.active !== undefined ? req.query.active === 'true' : undefined;
            const prct_uuid = req.query.prct_uuid as string | undefined;

            const where: any = {};
            if (activeOnly !== undefined) {
                where.cus_active = activeOnly;
            }
            if (prct_uuid) {
                where.prct_uuid = prct_uuid;
            }
            if (search && search.trim() !== '') {
                const term = `%${search.trim()}%`;
                where[Op.or] = [
                    { cus_name: { [Op.iLike]: term } },
                    { cus_address: { [Op.iLike]: term } },
                    { cus_phone: { [Op.iLike]: term } },
                    { cus_contactname: { [Op.iLike]: term } }
                ];
            }

            if (page && perPage) {
                const paginationQuery = getPaginationQuery(page, perPage);
                const result = await this.customerUseCase.getCustomersAndCount(cmp_uuid, {
                    ...paginationQuery,
                    where
                });

                return res.status(200).json({
                    success: true,
                    message: "Clientes retornados.",
                    ...paginateDbResult(result, page, perPage)
                });
            } else {
                const customers = await this.customerUseCase.getCustomers(cmp_uuid, { where });
                return res.status(200).json({
                    success: true,
                    message: "Clientes retornados.",
                    data: customers
                });
            }
        } catch (error: any) {
            console.error("Error en getAllCtrl (customer controller):", error.message);
            return res.status(400).json({
                success: false,
                message: "No se pudo recuperar los clientes.",
                error: error.message
            });
        }
    }

    public async getCtrl(req: Request, res: Response) {
        try {
            const cmp_uuid = (req.params.cmp_uuid || (req as any).tenant?.cmp_uuid) as string;
            const cus_uuid = req.params.cus_uuid;

            if (!cmp_uuid || !cus_uuid) {
                return res.status(400).json({
                    success: false,
                    message: "No se pudo recuperar el cliente.",
                    error: "Debe proporcionar cmp_uuid y cus_uuid."
                });
            }

            const customer = await this.customerUseCase.getDetailCustomer(cmp_uuid, cus_uuid);
            return res.status(200).json({
                success: true,
                message: "Cliente retornado.",
                data: customer
            });
        } catch (error: any) {
            console.error("Error en getCtrl (customer controller):", error.message);
            return res.status(404).json({
                success: false,
                message: "No se pudo recuperar el cliente.",
                error: error.message
            });
        }
    }

    public async insertCtrl(req: Request, res: Response) {
        try {
            const cmp_uuid = (req.params.cmp_uuid || req.body.cmp_uuid || (req as any).tenant?.cmp_uuid) as string;
            const { prct_uuid, cus_name, cus_address, cus_phone, cus_contactname, cus_notes, cus_active } = req.body;

            if (!cmp_uuid) {
                return res.status(400).json({
                    success: false,
                    message: "No se pudo crear el cliente.",
                    error: "Debe proporcionar el identificador de la empresa (cmp_uuid)."
                });
            }

            const customer = await this.customerUseCase.createCustomer({
                cmp_uuid,
                prct_uuid,
                cus_name,
                cus_address,
                cus_phone,
                cus_contactname,
                cus_notes,
                cus_active: cus_active !== undefined ? Boolean(cus_active) : true
            });

            return res.status(201).json({
                success: true,
                message: "Cliente creado con éxito.",
                data: customer
            });
        } catch (error: any) {
            console.error("Error en insertCtrl (customer controller):", error.message);
            return res.status(400).json({
                success: false,
                message: "No se pudo crear el cliente.",
                error: error.message
            });
        }
    }

    public async updateCtrl(req: Request, res: Response) {
        try {
            const cmp_uuid = (req.params.cmp_uuid || req.body.cmp_uuid || (req as any).tenant?.cmp_uuid) as string;
            const cus_uuid = req.params.cus_uuid;
            const { prct_uuid, cus_name, cus_address, cus_phone, cus_contactname, cus_notes, cus_active } = req.body;

            if (!cmp_uuid || !cus_uuid) {
                return res.status(400).json({
                    success: false,
                    message: "No se pudo actualizar el cliente.",
                    error: "Debe proporcionar cmp_uuid y cus_uuid."
                });
            }

            const updated = await this.customerUseCase.updateCustomer(cmp_uuid, cus_uuid, {
                prct_uuid,
                cus_name,
                cus_address,
                cus_phone,
                cus_contactname,
                cus_notes,
                cus_active: cus_active !== undefined ? Boolean(cus_active) : undefined
            });

            return res.status(200).json({
                success: true,
                message: "Cliente actualizado con éxito.",
                data: updated
            });
        } catch (error: any) {
            console.error("Error en updateCtrl (customer controller):", error.message);
            return res.status(400).json({
                success: false,
                message: "No se pudo actualizar el cliente.",
                error: error.message
            });
        }
    }

    public async deleteCtrl(req: Request, res: Response) {
        try {
            const cmp_uuid = (req.params.cmp_uuid || (req as any).tenant?.cmp_uuid) as string;
            const cus_uuid = req.params.cus_uuid;

            if (!cmp_uuid || !cus_uuid) {
                return res.status(400).json({
                    success: false,
                    message: "No se pudo eliminar el cliente.",
                    error: "Debe proporcionar cmp_uuid y cus_uuid."
                });
            }

            const deleted = await this.customerUseCase.deleteCustomer(cmp_uuid, cus_uuid);
            return res.status(200).json({
                success: true,
                message: "Cliente eliminado con éxito.",
                data: deleted
            });
        } catch (error: any) {
            console.error("Error en deleteCtrl (customer controller):", error.message);
            return res.status(400).json({
                success: false,
                message: "No se pudo eliminar el cliente.",
                error: error.message
            });
        }
    }
}
