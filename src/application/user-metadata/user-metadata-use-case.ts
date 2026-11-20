import { UserMetadataRepository } from "../../domain/user-metadata/user-metadata.repository";
import { UserMetadataValue } from "../../domain/user-metadata/user-metadata.value";

export class UserMetadataUseCase {
    constructor(private readonly userMetadataRepository: UserMetadataRepository) {
        this.getMetadataByUser = this.getMetadataByUser.bind(this);
        this.getMetadataByKey = this.getMetadataByKey.bind(this);
        this.setMetadata = this.setMetadata.bind(this);
        this.deleteMetadata = this.deleteMetadata.bind(this);
        this.deleteMetadataByUser = this.deleteMetadataByUser.bind(this);
    }

    public async getMetadataByUser(usr_uuid: string, options?: { transaction?: any }) {
        try {
            const list = await this.userMetadataRepository.getMetadataByUser(usr_uuid, options);
            return list || [];
        } catch (error: any) {
            console.error('Error en getMetadataByUser (use case):', error.message);
            throw error;
        }
    }

    public async getMetadataByKey(usr_uuid: string, usrmd_key: string, options?: { transaction?: any }) {
        try {
            const item = await this.userMetadataRepository.getMetadataByKey(usr_uuid, usrmd_key, options);
            if (!item) {
                throw new Error(`No se encontró metadata con la clave '${usrmd_key}' para el usuario.`);
            }
            return item;
        } catch (error: any) {
            console.error('Error en getMetadataByKey (use case):', error.message);
            throw error;
        }
    }

    public async setMetadata(
        { usr_uuid, usrmd_key, usrmd_value }: { usr_uuid: string; usrmd_key: string; usrmd_value?: string | null },
        options?: { transaction?: any }
    ) {
        try {
            const metadataValue = new UserMetadataValue({ usr_uuid, usrmd_key, usrmd_value });
            const saved = await this.userMetadataRepository.setMetadata(metadataValue, options);
            if (!saved) {
                throw new Error('No se pudo guardar la metadata del usuario.');
            }
            return saved;
        } catch (error: any) {
            console.error('Error en setMetadata (use case):', error.message);
            throw error;
        }
    }

    public async deleteMetadata(usr_uuid: string, usrmd_key: string, options?: { transaction?: any }) {
        try {
            const deleted = await this.userMetadataRepository.deleteMetadata(usr_uuid, usrmd_key, options);
            if (!deleted) {
                throw new Error(`No se encontró metadata para eliminar con la clave '${usrmd_key}'.`);
            }
            return deleted;
        } catch (error: any) {
            console.error('Error en deleteMetadata (use case):', error.message);
            throw error;
        }
    }

    public async deleteMetadataByUser(usr_uuid: string, options?: { transaction?: any }) {
        try {
            return await this.userMetadataRepository.deleteMetadataByUser(usr_uuid, options);
        } catch (error: any) {
            console.error('Error en deleteMetadataByUser (use case):', error.message);
            throw error;
        }
    }
}
