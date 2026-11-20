import { Request, Response } from "express";
import { UserMetadataUseCase } from "../../../application/user-metadata/user-metadata-use-case";

export class UserMetadataController {
    constructor(private userMetadataUseCase: UserMetadataUseCase) {
        this.getByUserCtrl = this.getByUserCtrl.bind(this);
        this.getByKeyCtrl = this.getByKeyCtrl.bind(this);
        this.setCtrl = this.setCtrl.bind(this);
        this.deleteCtrl = this.deleteCtrl.bind(this);
    }

    public async getByUserCtrl(req: Request, res: Response) {
        try {
            const { usr_uuid } = req.params;
            if (!usr_uuid) {
                return res.status(400).json({
                    success: false,
                    message: 'No se pudo recuperar la metadata del usuario.',
                    error: 'Debe proporcionar el usr_uuid.'
                });
            }
            const metadata = await this.userMetadataUseCase.getMetadataByUser(usr_uuid);
            return res.status(200).json({
                success: true,
                message: 'Metadata del usuario retornada.',
                data: metadata
            });
        } catch (error: any) {
            console.error('Error en getByUserCtrl (controller):', error.message);
            return res.status(400).json({
                success: false,
                message: 'No se pudo recuperar la metadata del usuario.',
                error: error.message
            });
        }
    }

    public async getByKeyCtrl(req: Request, res: Response) {
        try {
            const { usr_uuid, usrmd_key } = req.params;
            if (!usr_uuid || !usrmd_key) {
                return res.status(400).json({
                    success: false,
                    message: 'No se pudo recuperar la metadata.',
                    error: 'Debe proporcionar usr_uuid y usrmd_key.'
                });
            }
            const item = await this.userMetadataUseCase.getMetadataByKey(usr_uuid, usrmd_key);
            return res.status(200).json({
                success: true,
                message: 'Metadata retornada.',
                data: item
            });
        } catch (error: any) {
            console.error('Error en getByKeyCtrl (controller):', error.message);
            return res.status(404).json({
                success: false,
                message: 'No se pudo recuperar la metadata.',
                error: error.message
            });
        }
    }

    public async setCtrl(req: Request, res: Response) {
        try {
            const { usr_uuid, usrmd_key, usrmd_value } = req.body;
            if (!usr_uuid || !usrmd_key) {
                return res.status(400).json({
                    success: false,
                    message: 'No se pudo guardar la metadata.',
                    error: 'Debe proporcionar usr_uuid y usrmd_key.'
                });
            }
            const saved = await this.userMetadataUseCase.setMetadata({ usr_uuid, usrmd_key, usrmd_value });
            return res.status(201).json({
                success: true,
                message: 'Metadata guardada con éxito.',
                data: saved
            });
        } catch (error: any) {
            console.error('Error en setCtrl (controller):', error.message);
            return res.status(400).json({
                success: false,
                message: 'No se pudo guardar la metadata.',
                error: error.message
            });
        }
    }

    public async deleteCtrl(req: Request, res: Response) {
        try {
            const { usr_uuid, usrmd_key } = req.params;
            if (!usr_uuid || !usrmd_key) {
                return res.status(400).json({
                    success: false,
                    message: 'No se pudo eliminar la metadata.',
                    error: 'Debe proporcionar usr_uuid y usrmd_key.'
                });
            }
            const deleted = await this.userMetadataUseCase.deleteMetadata(usr_uuid, usrmd_key);
            return res.status(200).json({
                success: true,
                message: 'Metadata eliminada con éxito.',
                data: deleted
            });
        } catch (error: any) {
            console.error('Error en deleteCtrl (controller):', error.message);
            return res.status(400).json({
                success: false,
                message: 'No se pudo eliminar la metadata.',
                error: error.message
            });
        }
    }
}
