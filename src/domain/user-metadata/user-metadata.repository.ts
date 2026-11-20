import { UserMetadataEntity } from "./user-metadata.entity";

export interface UserMetadataRepository {
    getMetadataByUser(usr_uuid: string, options?: { transaction?: any }): Promise<UserMetadataEntity[] | null>;
    getMetadataByKey(usr_uuid: string, usrmd_key: string, options?: { transaction?: any }): Promise<UserMetadataEntity | null>;
    setMetadata(metadata: UserMetadataEntity, options?: { transaction?: any }): Promise<UserMetadataEntity | null>;
    deleteMetadata(usr_uuid: string, usrmd_key: string, options?: { transaction?: any }): Promise<UserMetadataEntity | null>;
    deleteMetadataByUser(usr_uuid: string, options?: { transaction?: any }): Promise<number>;
}
