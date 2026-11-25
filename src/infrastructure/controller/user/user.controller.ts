import { Request, Response } from "express";
import { UserUseCase } from "../../../application/user/user-use-case";
import SocketAdapter from "../../services/socketAdapter";
import { paginator } from "../../services/paginator.service";

export class UserController {
    constructor(private userUseCase: UserUseCase, private socketAdapter: SocketAdapter) {
        this.getAllCtrl = this.getAllCtrl.bind(this);
        this.getCtrl = this.getCtrl.bind(this);
        this.insertCtrl = this.insertCtrl.bind(this);
        this.updateCtrl = this.updateCtrl.bind(this);
        this.deleteCtrl = this.deleteCtrl.bind(this);
    }

    public async getAllCtrl(req: Request, res: Response) {
        try {
            const page = (req.params.page ? parseInt(req.params.page) : null);
            const perPage = (req.params.perPage ? parseInt(req.params.perPage) : null);
            if (page && perPage) {
                const users = await this.userUseCase.getUsers();
                return res.status(200).send({
                    success: true,
                    message: 'Usuarios retornados.',
                    ...paginator(users, page, perPage)
                });
            } else {
                const users = await this.userUseCase.getUsers();
                return res.status(200).send({
                    success: true,
                    message: 'Usuarios retornados.',
                    data: users
                });
            }
        } catch (error: any) {
            console.error('Error en getAllCtrl (controller):', error.message);
            return res.status(400).json({
                success: false,
                message: 'No se pudo recuperar los usuarios.',
                error: error.message,
            });
        }
    }

    public async getCtrl(req: Request, res: Response) {
        try {
            const usr_uuid = req.params.usr_uuid;
            if (!usr_uuid || usr_uuid.toLowerCase() === 'null' || usr_uuid.toLowerCase() === 'undefined') {
                return res.status(400).json({
                    success: false,
                    message: 'No se pudo recuperar el usuario.',
                    error: 'Debe proporcionar un Id de usuario.'
                });
            }
            const user = await this.userUseCase.getDetailUser(`${usr_uuid}`);
            return res.status(200).send({
                success: true,
                message: 'Usuario retornado.',
                data: user
            });
        } catch (error: any) {
            console.error('Error en getCtrl (controller):', error.message);
            return res.status(400).json({
                success: false,
                message: 'No se pudo recuperar el usuario.',
                error: error.message,
            });
        }
    }

    public async insertCtrl({ body }: Request, res: Response) {
        try {
            const usr_nick = body.usr_nick;
            const usr_email = body.usr_email;        
            if (!usr_nick) {
                return res.status(400).json({
                    success: false,
                    message: 'No se pudo insertar el usuario.',
                    error: 'Debe proporcionar un Nick para el usuario.'
                });
            }
            if (!usr_email) {
                return res.status(400).json({
                    success: false,
                    message: 'No se pudo insertar el usuario.',
                    error: 'Debe proporcionar un Email para el usuario.'
                });
            }
            const userExist = await this.userUseCase.userExist(usr_nick, usr_email);
            if (userExist) {
                return res.status(400).json({
                    success: false,
                    message: 'No se pudo insertar el usuario.',
                    error: 'El usuario ya existe.'
                });
            }

            // Sincronización federada con el Kernel Central
            const centralUrl = (process.env.CENTRAL_API_URL ? process.env.CENTRAL_API_URL.replace('/auth/sso/verify', '/register') : null) || 'http://localhost:3006/api/register';
            try {
                const centralRes = await fetch(centralUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });
                const centralData = await centralRes.json() as any;

                if (!centralRes.ok || (centralData && centralData.success === false)) {
                    return res.status(400).json({
                        success: false,
                        message: centralData?.message || 'No se pudo registrar el usuario en el Kernel Central.',
                        error: centralData?.error || centralData?.message
                    });
                }

                if (centralData?.user?.usr_uuid) {
                    body.usr_uuid = centralData.user.usr_uuid;
                }
            } catch (centralError: any) {
                console.warn('Advertencia: No se pudo contactar el Kernel Central:', centralError.message);
            }

            const user = await this.userUseCase.registerUser(body);
            return res.status(201).json({
                success: true,
                message: 'Usuario insertado de forma unificada.',
                data: user
            });
        } catch (error: any) {
            console.error('Error en insertCtrl (controller):', error.message);
            return res.status(400).json({
                success: false,
                message: 'No se pudo insertar el usuario.',
                error: error.message,
            });
        }
    }

    public async updateCtrl(req: Request, res: Response) {
        try {
            const usr_uuid = req.params.usr_uuid;
            const update = req.body;
            if (!update.usr_nick) {
                return res.status(400).json({
                    success: false,
                    message: 'No se pudo actualizar el usuario.',
                    error: 'Debe proporcionar un Nick para el usuario.'
                });
            }
            if (!update.usr_email) {
                return res.status(400).json({
                    success: false,
                    message: 'No se pudo actualizar el usuario.',
                    error: 'Debe proporcionar un Email para el usuario.'
                });
            }
            const user = await this.userUseCase.updateUser(usr_uuid, update);
            return res.status(200).json({
                success: true,
                message: 'Usuario actualizado.',
                data: user
            });
        } catch (error: any) {
            console.error('Error en updateCtrl (controller):', error.message);
            return res.status(400).json({
                success: false,
                message: 'No se pudo actualizar el usuario.',
                error: error.message,
            });
        }
    }

    public async deleteCtrl(req: Request, res: Response) {
        try {
            const usr_uuid = req.params.usr_uuid;
            if (!usr_uuid) {
                return res.status(400).json({
                    success: false,
                    message: 'No se pudo eliminar el usuario.',
                    error: 'Debe proporcionar un Id de usuario.'
                });
            }
            const user = await this.userUseCase.deleteUser(usr_uuid);
            return res.status(200).json({
                success: true,
                message: 'Usuario eliminado.',
                data: user
            });
        } catch (error: any) {
            console.error('Error en deleteCtrl (controller):', error.message);
            return res.status(400).json({
                success: false,
                message: 'No se pudo eliminar el usuario.',
                error: error.message,
            });
        }
    }
}
