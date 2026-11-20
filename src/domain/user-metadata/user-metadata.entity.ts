import { UserEntity } from "../user/user.entity";

export interface UserMetadataEntity {
    usr_uuid: string;
    usrmd_key: string;
    usrmd_value: string | null;
    usr?: UserEntity;
}
