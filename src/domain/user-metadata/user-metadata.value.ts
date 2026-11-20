import { UserMetadataEntity } from "./user-metadata.entity";

export class UserMetadataValue implements UserMetadataEntity {
    usr_uuid: string;
    usrmd_key: string;
    usrmd_value: string | null;

    constructor({
        usr_uuid,
        usrmd_key,
        usrmd_value
    }: {
        usr_uuid: string;
        usrmd_key: string;
        usrmd_value?: string | null;
    }) {
        this.usr_uuid = usr_uuid;
        this.usrmd_key = usrmd_key;
        this.usrmd_value = usrmd_value ?? null;
    }
}
