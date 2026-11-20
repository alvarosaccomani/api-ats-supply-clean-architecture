import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../db/sequelize';
import { UserMetadataEntity } from "../../../domain/user-metadata/user-metadata.entity";
import { SequelizeUser } from '../user/user.model';

export class SequelizeUserMetadata extends Model<UserMetadataEntity> implements UserMetadataEntity {
  declare usr_uuid: string;
  declare usrmd_key: string;
  declare usrmd_value: string | null;
}

SequelizeUserMetadata.init({
  usr_uuid: {
    type: DataTypes.STRING(40),
    primaryKey: true,
    allowNull: false
  },
  usrmd_key: {
    type: DataTypes.STRING(50),
    primaryKey: true,
    allowNull: false
  },
  usrmd_value: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  sequelize,
  timestamps: false,
  tableName: 'usrmd_usermetadata'
});

SequelizeUserMetadata.belongsTo(SequelizeUser, {
  as: 'usr',
  foreignKey: 'usr_uuid'
});

if (process.env.NODE_ENV !== "production") {
    SequelizeUserMetadata.sync();
}
