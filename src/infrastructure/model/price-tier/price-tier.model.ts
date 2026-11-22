import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../db/sequelize';
import { PriceTierEntity } from "../../../domain/price-tier/price-tier.entity";
import { SequelizeCompany } from '../company/company.model';

export class SequelizePriceTier extends Model<PriceTierEntity, Partial<PriceTierEntity>> implements PriceTierEntity {
  declare cmp_uuid: string;
  declare prct_uuid: string;
  declare prct_code: string;
  declare prct_name: string;
  declare prct_description: string | null;
  declare prct_isdefault: boolean;
  declare prct_active: boolean;
  declare prct_createdat: Date;
  declare prct_updatedat: Date;
}

SequelizePriceTier.init({
  cmp_uuid: {
    type: DataTypes.STRING(40),
    primaryKey: true,
    allowNull: false
  },
  prct_uuid: {
    type: DataTypes.STRING(40),
    primaryKey: true,
    allowNull: false
  },
  prct_code: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  prct_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  prct_description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  prct_isdefault: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
  prct_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  },
  prct_createdat: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  },
  prct_updatedat: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  }
}, {
  sequelize,
  timestamps: true,
  createdAt: 'prct_createdat',
  updatedAt: 'prct_updatedat',
  tableName: 'prct_pricetiers'
});

SequelizePriceTier.belongsTo(SequelizeCompany, {
  foreignKey: 'cmp_uuid',
  targetKey: 'cmp_uuid',
  as: 'company'
});

if (process.env.NODE_ENV !== "production") {
  SequelizePriceTier.sync();
}
