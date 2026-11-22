import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../db/sequelize';
import { ProductEntity, ProductType } from "../../../domain/product/product.entity";
import { SequelizeCompany } from '../company/company.model';

export class SequelizeProduct extends Model<ProductEntity, Partial<ProductEntity>> implements ProductEntity {
  declare cmp_uuid: string;
  declare prd_uuid: string;
  declare prd_code: string | null;
  declare prd_name: string;
  declare prd_type: ProductType;
  declare prd_unitlabel: string;
  declare prd_weightorvolume: number | null;
  declare prd_currentstock: number;
  declare prd_minstockalert: number;
  declare prd_active: boolean;
  declare prd_createdat: Date;
  declare prd_updatedat: Date;
}

SequelizeProduct.init({
  cmp_uuid: {
    type: DataTypes.STRING(40),
    primaryKey: true,
    allowNull: false
  },
  prd_uuid: {
    type: DataTypes.STRING(40),
    primaryKey: true,
    allowNull: false
  },
  prd_code: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  prd_name: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  prd_type: {
    type: DataTypes.STRING(20),
    defaultValue: 'FINISHED',
    allowNull: false
  },
  prd_unitlabel: {
    type: DataTypes.STRING(30),
    defaultValue: 'unidad',
    allowNull: false
  },
  prd_weightorvolume: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  prd_currentstock: {
    type: DataTypes.FLOAT,
    defaultValue: 0.00,
    allowNull: false
  },
  prd_minstockalert: {
    type: DataTypes.FLOAT,
    defaultValue: 0.00,
    allowNull: false
  },
  prd_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  },
  prd_createdat: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  },
  prd_updatedat: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  }
}, {
  sequelize,
  timestamps: true,
  createdAt: 'prd_createdat',
  updatedAt: 'prd_updatedat',
  tableName: 'prd_products'
});

SequelizeProduct.belongsTo(SequelizeCompany, {
  foreignKey: 'cmp_uuid',
  targetKey: 'cmp_uuid',
  as: 'company'
});

if (process.env.NODE_ENV !== "production") {
  SequelizeProduct.sync();
}
