import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../db/sequelize';
import { ProductBomEntity } from "../../../domain/product-bom/product-bom.entity";
import { SequelizeProduct } from '../product/product.model';
import { SequelizeCompany } from '../company/company.model';

export class SequelizeProductBom extends Model<ProductBomEntity, Partial<ProductBomEntity>> implements ProductBomEntity {
  declare cmp_uuid: string;
  declare prdbom_uuid: string;
  declare prd_uuid_finished: string;
  declare prd_uuid_supply: string;
  declare prdbom_quantityperunit: number;
  declare prdbom_createdat: Date;
  declare prdbom_updatedat: Date;
}

SequelizeProductBom.init({
  cmp_uuid: {
    type: DataTypes.STRING(40),
    primaryKey: true,
    allowNull: false
  },
  prdbom_uuid: {
    type: DataTypes.STRING(40),
    primaryKey: true,
    allowNull: false
  },
  prd_uuid_finished: {
    type: DataTypes.STRING(40),
    allowNull: false
  },
  prd_uuid_supply: {
    type: DataTypes.STRING(40),
    allowNull: false
  },
  prdbom_quantityperunit: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  prdbom_createdat: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  },
  prdbom_updatedat: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  }
}, {
  sequelize,
  timestamps: true,
  createdAt: 'prdbom_createdat',
  updatedAt: 'prdbom_updatedat',
  tableName: 'prdbom_productbom'
});

SequelizeProductBom.belongsTo(SequelizeCompany, {
  foreignKey: 'cmp_uuid',
  targetKey: 'cmp_uuid',
  as: 'company'
});

SequelizeProductBom.belongsTo(SequelizeProduct, {
  foreignKey: 'prd_uuid_finished',
  targetKey: 'prd_uuid',
  as: 'finishedProduct'
});

SequelizeProductBom.belongsTo(SequelizeProduct, {
  foreignKey: 'prd_uuid_supply',
  targetKey: 'prd_uuid',
  as: 'supplyProduct'
});

if (process.env.NODE_ENV !== "production") {
  SequelizeProductBom.sync();
}
