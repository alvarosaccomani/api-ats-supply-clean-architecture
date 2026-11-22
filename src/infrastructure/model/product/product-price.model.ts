import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../db/sequelize';
import { ProductPriceEntity } from "../../../domain/product/product-price.entity";
import { SequelizeProduct } from './product.model';
import { SequelizePriceTier } from '../price-tier/price-tier.model';

export class SequelizeProductPrice extends Model<ProductPriceEntity, Partial<ProductPriceEntity>> implements ProductPriceEntity {
  declare cmp_uuid: string;
  declare prd_uuid: string;
  declare prct_uuid: string;
  declare prdprc_price: number;
  declare prdprc_createdat: Date;
  declare prdprc_updatedat: Date;
}

SequelizeProductPrice.init({
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
  prct_uuid: {
    type: DataTypes.STRING(40),
    primaryKey: true,
    allowNull: false
  },
  prdprc_price: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0.00
  },
  prdprc_createdat: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  },
  prdprc_updatedat: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  }
}, {
  sequelize,
  timestamps: true,
  createdAt: 'prdprc_createdat',
  updatedAt: 'prdprc_updatedat',
  tableName: 'prdprc_productprices'
});

SequelizeProductPrice.belongsTo(SequelizeProduct, {
  foreignKey: 'prd_uuid',
  targetKey: 'prd_uuid',
  as: 'product'
});

SequelizeProductPrice.belongsTo(SequelizePriceTier, {
  foreignKey: 'prct_uuid',
  targetKey: 'prct_uuid',
  as: 'priceTier'
});

SequelizeProduct.hasMany(SequelizeProductPrice, {
  foreignKey: 'prd_uuid',
  sourceKey: 'prd_uuid',
  as: 'prices'
});

if (process.env.NODE_ENV !== "production") {
  SequelizeProductPrice.sync();
}
