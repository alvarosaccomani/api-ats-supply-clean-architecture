import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../db/sequelize';
import { CustomerEntity } from "../../../domain/customer/customer.entity";
import { SequelizePriceTier } from '../price-tier/price-tier.model';
import { SequelizeCompany } from '../company/company.model';

export class SequelizeCustomer extends Model<CustomerEntity, Partial<CustomerEntity>> implements CustomerEntity {
  declare cmp_uuid: string;
  declare cus_uuid: string;
  declare prct_uuid: string;
  declare cus_name: string;
  declare cus_address: string;
  declare cus_phone: string | null;
  declare cus_contactname: string | null;
  declare cus_notes: string | null;
  declare cus_lat: number | null;
  declare cus_lng: number | null;
  declare cus_hascredit: boolean;
  declare cus_active: boolean;
  declare cus_createdat: Date;
  declare cus_updatedat: Date;
}

SequelizeCustomer.init({
  cmp_uuid: {
    type: DataTypes.STRING(40),
    primaryKey: true,
    allowNull: false
  },
  cus_uuid: {
    type: DataTypes.STRING(40),
    primaryKey: true,
    allowNull: false
  },
  prct_uuid: {
    type: DataTypes.STRING(40),
    allowNull: false
  },
  cus_name: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  cus_address: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  cus_phone: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  cus_contactname: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  cus_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  cus_lat: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true
  },
  cus_lng: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true
  },
  cus_hascredit: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
  cus_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  },
  cus_createdat: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  },
  cus_updatedat: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  }
}, {
  sequelize,
  timestamps: true,
  createdAt: 'cus_createdat',
  updatedAt: 'cus_updatedat',
  tableName: 'cus_customers',
  indexes: [
    {
      name: 'idx_cus_search',
      fields: ['cmp_uuid', 'cus_name']
    }
  ]
});

SequelizeCustomer.belongsTo(SequelizeCompany, {
  foreignKey: 'cmp_uuid',
  targetKey: 'cmp_uuid',
  as: 'company'
});

SequelizeCustomer.belongsTo(SequelizePriceTier, {
  foreignKey: 'prct_uuid',
  targetKey: 'prct_uuid',
  as: 'priceTier'
});

SequelizePriceTier.hasMany(SequelizeCustomer, {
  foreignKey: 'prct_uuid',
  sourceKey: 'prct_uuid',
  as: 'customers'
});

if (process.env.NODE_ENV !== "production") {
  SequelizeCustomer.sync();
}
