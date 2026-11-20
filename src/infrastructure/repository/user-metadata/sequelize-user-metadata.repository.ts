import { UserMetadataEntity } from "../../../domain/user-metadata/user-metadata.entity";
import { UserMetadataRepository } from "../../../domain/user-metadata/user-metadata.repository";
import { SequelizeUserMetadata } from "../../model/user-metadata/user-metadata.model";
import { SequelizeUser } from "../../model/user/user.model";

export class SequelizeRepository implements UserMetadataRepository {
    async getMetadataByUser(usr_uuid: string, options?: { transaction?: any }): Promise<UserMetadataEntity[] | null> {
        try {
            const list = await SequelizeUserMetadata.findAll({
                where: { usr_uuid: usr_uuid ?? null },
                include: [{ as: 'usr', model: SequelizeUser }],
                transaction: options?.transaction
            });
            return list.map(item => item.get({ plain: true }));
        } catch (error: any) {
            console.error('Error en getMetadataByUser:', error.message);
            throw error;
        }
    }

    async getMetadataByKey(usr_uuid: string, usrmd_key: string, options?: { transaction?: any }): Promise<UserMetadataEntity | null> {
        try {
            const item = await SequelizeUserMetadata.findOne({
                where: {
                    usr_uuid: usr_uuid ?? null,
                    usrmd_key: usrmd_key ?? null
                },
                transaction: options?.transaction
            });
            return item ? item.get({ plain: true }) : null;
        } catch (error: any) {
            console.error('Error en getMetadataByKey:', error.message);
            throw error;
        }
    }

    async setMetadata(metadata: UserMetadataEntity, options?: { transaction?: any }): Promise<UserMetadataEntity | null> {
        try {
            const { usr_uuid, usrmd_key, usrmd_value } = metadata;
            const existing = await this.getMetadataByKey(usr_uuid, usrmd_key, options);
            if (existing) {
                await SequelizeUserMetadata.update(
                    { usrmd_value },
                    {
                        where: { usr_uuid, usrmd_key },
                        transaction: options?.transaction
                    }
                );
                return await this.getMetadataByKey(usr_uuid, usrmd_key, options);
            }
            const created = await SequelizeUserMetadata.create(
                { usr_uuid, usrmd_key, usrmd_value },
                { transaction: options?.transaction }
            );
            return created.get({ plain: true }) as UserMetadataEntity;
        } catch (error: any) {
            console.error('Error en setMetadata:', error.message);
            throw error;
        }
    }

    async deleteMetadata(usr_uuid: string, usrmd_key: string, options?: { transaction?: any }): Promise<UserMetadataEntity | null> {
        try {
            const existing = await this.getMetadataByKey(usr_uuid, usrmd_key, options);
            if (!existing) {
                return null;
            }
            await SequelizeUserMetadata.destroy({
                where: { usr_uuid, usrmd_key },
                transaction: options?.transaction
            });
            return existing;
        } catch (error: any) {
            console.error('Error en deleteMetadata:', error.message);
            throw error;
        }
    }

    async deleteMetadataByUser(usr_uuid: string, options?: { transaction?: any }): Promise<number> {
        try {
            const count = await SequelizeUserMetadata.destroy({
                where: { usr_uuid },
                transaction: options?.transaction
            });
            return count;
        } catch (error: any) {
            console.error('Error en deleteMetadataByUser:', error.message);
            throw error;
        }
    }
}
